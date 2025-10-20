"""
KeywordService for CSV processing + DataForSEO
"""

import asyncio
import aiohttp
import csv
import io
import json
from typing import List, Dict, Any, Optional, BinaryIO
from datetime import datetime
import structlog
from fastapi import HTTPException
from ..core.database import get_db
from ..core.redis import cache
from ..core.config import get_settings
from ..models.keyword_data import KeywordData, KeywordStatus, KeywordSource

logger = structlog.get_logger()
settings = get_settings()

class KeywordService:
    """Service for keyword data management and processing"""
    
    def __init__(self, db_session=None):
        self.db_session = db_session
        # Remove problematic settings access - these will be handled by the DataForSEO service
        self.max_file_size = getattr(settings, 'max_file_size', 10 * 1024 * 1024)  # 10MB default
        self.allowed_file_types = getattr(settings, 'allowed_file_types', ['.csv', '.txt'])
        
        # DataForSEO API configuration
        # DataForSEO base URL will be read from database
        self.dataforseo_base_url = None
        self.dataforseo_cost_per_keyword = 0.0008  # $0.0008 per keyword
    
    async def upload_csv(self, user_id: int, file: BinaryIO, filename: str, 
                        trend_analysis_id: Optional[int] = None) -> Dict[str, Any]:
        """Upload and process CSV file with keywords"""
        try:
            # Validate file
            self._validate_file(file, filename)
            
            # Create keyword data record
            db = next(get_db())
            keyword_data = KeywordData(
                user_id=user_id,
                trend_analysis_id=trend_analysis_id,
                status=KeywordStatus.PROCESSING,
                source=KeywordSource.CSV_UPLOAD,
                original_filename=filename,
                file_size=len(file.read())
            )
            file.seek(0)  # Reset file pointer
            db.add(keyword_data)
            db.commit()
            db.refresh(keyword_data)
            
            # Start background processing
            asyncio.create_task(self._process_csv_file(keyword_data.id, file))
            
            logger.info("CSV upload initiated", keyword_data_id=keyword_data.id, filename=filename)
            return keyword_data.to_dict()
            
        except Exception as e:
            logger.error("Failed to upload CSV", error=str(e))
            raise
    
    async def crawl_keywords(self, user_id: int, keywords: List[str], 
                           trend_analysis_id: Optional[int] = None) -> Dict[str, Any]:
        """Crawl keywords using DataForSEO"""
        try:
            # Validate keywords
            if not keywords or len(keywords) > 1000:
                raise ValueError("Keywords list must contain 1-1000 keywords")
            
            # Calculate estimated cost
            estimated_cost = len(keywords) * self.dataforseo_cost_per_keyword
            
            # Create keyword data record
            db = next(get_db())
            keyword_data = KeywordData(
                user_id=user_id,
                trend_analysis_id=trend_analysis_id,
                status=KeywordStatus.PROCESSING,
                source=KeywordSource.DATAFORSEO,
                estimated_cost=estimated_cost
            )
            db.add(keyword_data)
            db.commit()
            db.refresh(keyword_data)
            
            # Start background crawling
            asyncio.create_task(self._crawl_keywords_data(keyword_data.id, keywords))
            
            logger.info("Keyword crawl initiated", keyword_data_id=keyword_data.id, keyword_count=len(keywords))
            return keyword_data.to_dict()
            
        except Exception as e:
            logger.error("Failed to initiate keyword crawl", error=str(e))
            raise
    
    async def get_keyword_data(self, keyword_data_id: int) -> Dict[str, Any]:
        """Get keyword data by ID"""
        try:
            db = next(get_db())
            keyword_data = db.get_KeywordData_by_id(KeywordData.id == keyword_data_id)
            
            if not keyword_data:
                raise ValueError("Keyword data not found")
            
            return keyword_data.to_dict()
            
        except Exception as e:
            logger.error("Failed to get keyword data", keyword_data_id=keyword_data_id, error=str(e))
            raise
    
    async def _process_csv_file(self, keyword_data_id: int, file: BinaryIO):
        """Process CSV file in background"""
        try:
            db = next(get_db())
            keyword_data = db.get_KeywordData_by_id(KeywordData.id == keyword_data_id)
            
            if not keyword_data:
                return
            
            # Parse CSV file
            file_content = file.read().decode('utf-8')
            csv_reader = csv.DictReader(io.StringIO(file_content))
            
            keywords = []
            for row in csv_reader:
                keyword = self._parse_csv_row(row)
                if keyword:
                    keywords.append(keyword)
            
            # Process keywords with additional data
            processed_keywords = await self._enrich_keywords(keywords)
            
            # Calculate priority scores
            for keyword in processed_keywords:
                keyword["priority_score"] = self._calculate_priority_score(keyword)
            
            # Update keyword data
            keyword_data.mark_completed(processed_keywords)
            keyword_data.actual_cost = 0  # CSV upload is free
            db.commit()
            
            logger.info("CSV processing completed", keyword_data_id=keyword_data_id, keyword_count=len(processed_keywords))
            
        except Exception as e:
            logger.error("CSV processing failed", keyword_data_id=keyword_data_id, error=str(e))
            
            # Mark as failed
            try:
                db = next(get_db())
                keyword_data = db.get_KeywordData_by_id(KeywordData.id == keyword_data_id)
                if keyword_data:
                    keyword_data.mark_failed(str(e))
                    db.commit()
            except:
                pass
    
    async def _crawl_keywords_data(self, keyword_data_id: int, keywords: List[str]):
        """Crawl keywords using DataForSEO in background"""
        try:
            db = next(get_db())
            keyword_data = db.get_KeywordData_by_id(KeywordData.id == keyword_data_id)
            
            if not keyword_data:
                return
            
            # Check if DataForSEO is available
            if not self.dataforseo_username or not self.dataforseo_password:
                # Use mock data if DataForSEO not available
                processed_keywords = await self._get_mock_keyword_data(keywords)
            else:
                # Call DataForSEO API
                processed_keywords = await self._call_dataforseo_api(keywords)
            
            # Calculate priority scores
            for keyword in processed_keywords:
                keyword["priority_score"] = self._calculate_priority_score(keyword)
            
            # Update keyword data
            keyword_data.mark_completed(processed_keywords)
            keyword_data.actual_cost = len(keywords) * self.dataforseo_cost_per_keyword
            db.commit()
            
            logger.info("Keyword crawling completed", keyword_data_id=keyword_data_id, keyword_count=len(processed_keywords))
            
        except Exception as e:
            logger.error("Keyword crawling failed", keyword_data_id=keyword_data_id, error=str(e))
            
            # Mark as failed
            try:
                db = next(get_db())
                keyword_data = db.get_KeywordData_by_id(KeywordData.id == keyword_data_id)
                if keyword_data:
                    keyword_data.mark_failed(str(e))
                    db.commit()
            except:
                pass
    
    def _validate_file(self, file: BinaryIO, filename: str):
        """Validate uploaded file"""
        # Check file size
        file.seek(0, 2)  # Seek to end
        file_size = file.tell()
        file.seek(0)  # Reset to beginning
        
        if file_size > self.max_file_size:
            raise ValueError(f"File too large. Maximum size: {self.max_file_size} bytes")
        
        if file_size == 0:
            raise ValueError("File is empty")
        
        # Check file type
        if not filename.lower().endswith('.csv'):
            raise ValueError("Only CSV files are allowed")
        
        # Check content type
        file_content = file.read(1024).decode('utf-8', errors='ignore')
        file.seek(0)  # Reset to beginning
        
        if 'keyword' not in file_content.lower():
            raise ValueError("CSV file must contain 'keyword' column")
    
    def _parse_csv_row(self, row: Dict[str, str]) -> Optional[Dict[str, Any]]:
        """Parse CSV row into keyword object"""
        try:
            keyword = row.get('keyword', '').strip()
            if not keyword:
                return None
            
            # Parse numeric fields
            search_volume = int(row.get('search_volume', 0)) if row.get('search_volume') else 0
            difficulty = int(row.get('difficulty', 50)) if row.get('difficulty') else 50
            cpc = float(row.get('cpc', 0)) if row.get('cpc') else 0
            
            # Parse string fields
            competition = row.get('competition', 'medium').lower()
            intent = row.get('intent', 'informational').lower()
            
            # Validate competition
            if competition not in ['low', 'medium', 'high']:
                competition = 'medium'
            
            # Validate intent
            if intent not in ['informational', 'commercial', 'navigational', 'transactional']:
                intent = 'informational'
            
            return {
                "keyword": keyword,
                "search_volume": search_volume,
                "difficulty": difficulty,
                "cpc": cpc,
                "competition": competition,
                "intent": intent,
                "priority_score": 0.0  # Will be calculated later
            }
            
        except Exception as e:
            logger.warning("Failed to parse CSV row", row=row, error=str(e))
            return None
    
    async def _enrich_keywords(self, keywords: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Enrich keywords with additional data"""
        enriched_keywords = []
        
        for keyword in keywords:
            # Add SERP analysis
            keyword["serp_analysis"] = self._generate_serp_analysis(keyword)
            
            # Add NLP terms
            keyword["nlp_terms"] = self._extract_nlp_terms(keyword["keyword"])
            
            # Add People Also Ask
            keyword["people_also_ask"] = self._generate_people_also_ask(keyword["keyword"])
            
            # Add internal link suggestions
            keyword["internal_link_suggestions"] = self._generate_internal_links(keyword["keyword"])
            
            enriched_keywords.append(keyword)
        
        return enriched_keywords
    
    def _generate_serp_analysis(self, keyword: Dict[str, Any]) -> Dict[str, Any]:
        """Generate mock SERP analysis"""
        # Mock implementation - replace with actual SERP analysis
        return {
            "top_10_avg_domain_authority": 45.0 + (hash(keyword["keyword"]) % 30),
            "top_10_avg_page_authority": 40.0 + (hash(keyword["keyword"]) % 25),
            "top_10_avg_content_length": 2000 + (hash(keyword["keyword"]) % 1000),
            "top_10_avg_backlinks": 500 + (hash(keyword["keyword"]) % 500),
            "serp_weakness_score": 0.3 + (hash(keyword["keyword"]) % 50) / 100
        }
    
    def _extract_nlp_terms(self, keyword: str) -> List[str]:
        """Extract NLP terms from keyword"""
        # Simple keyword splitting - replace with actual NLP processing
        terms = keyword.lower().split()
        return [term for term in terms if len(term) > 2]
    
    def _generate_people_also_ask(self, keyword: str) -> List[str]:
        """Generate People Also Ask questions"""
        # Mock implementation - replace with actual PAA extraction
        return [
            f"What is {keyword}?",
            f"How to use {keyword}?",
            f"Best {keyword} guide",
            f"{keyword} vs alternatives"
        ]
    
    def _generate_internal_links(self, keyword: str) -> List[str]:
        """Generate internal link suggestions"""
        # Mock implementation - replace with actual internal linking analysis
        return [
            f"{keyword} guide",
            f"{keyword} tips",
            f"{keyword} examples",
            f"related to {keyword}"
        ]
    
    async def _call_dataforseo_api(self, keywords: List[str]) -> List[Dict[str, Any]]:
        """Call DataForSEO API"""
        try:
            # Mock implementation - replace with actual API calls
            return await self._get_mock_keyword_data(keywords)
            
        except Exception as e:
            logger.error("DataForSEO API call failed", error=str(e))
            return await self._get_mock_keyword_data(keywords)
    
    async def _get_mock_keyword_data(self, keywords: List[str]) -> List[Dict[str, Any]]:
        """Get mock keyword data"""
        mock_keywords = []
        
        for keyword in keywords:
            # Generate mock data based on keyword
            hash_val = hash(keyword)
            
            mock_keyword = {
                "keyword": keyword,
                "search_volume": 100 + (hash_val % 2000),
                "difficulty": 20 + (hash_val % 60),
                "cpc": 0.5 + (hash_val % 5),
                "competition": ["low", "medium", "high"][hash_val % 3],
                "intent": ["informational", "commercial", "navigational", "transactional"][hash_val % 4],
                "priority_score": 0.0,  # Will be calculated
                "serp_analysis": {
                    "top_10_avg_domain_authority": 30 + (hash_val % 40),
                    "top_10_avg_page_authority": 25 + (hash_val % 35),
                    "top_10_avg_content_length": 1500 + (hash_val % 1500),
                    "top_10_avg_backlinks": 200 + (hash_val % 800),
                    "serp_weakness_score": 0.2 + (hash_val % 60) / 100
                },
                "nlp_terms": keyword.lower().split(),
                "people_also_ask": [
                    f"What is {keyword}?",
                    f"How to {keyword}?",
                    f"Best {keyword} guide"
                ],
                "internal_link_suggestions": [
                    f"{keyword} guide",
                    f"{keyword} tips",
                    f"related to {keyword}"
                ]
            }
            
            mock_keywords.append(mock_keyword)
        
        return mock_keywords
    
    def _calculate_priority_score(self, keyword: Dict[str, Any]) -> float:
        """Calculate priority score for keyword"""
        search_volume = keyword.get("search_volume", 0)
        difficulty = keyword.get("difficulty", 50)
        cpc = keyword.get("cpc", 0)
        serp_weakness = keyword.get("serp_analysis", {}).get("serp_weakness_score", 0.5)
        
        # Normalize search volume (0-1 scale)
        volume_score = min(search_volume / 10000, 1.0)
        
        # Normalize difficulty (invert so lower difficulty = higher score)
        difficulty_score = 1.0 - (difficulty / 100)
        
        # Normalize CPC (0-1 scale)
        cpc_score = min(cpc / 10, 1.0)
        
        # SERP weakness (higher weakness = higher opportunity)
        serp_score = serp_weakness
        
        # Weighted average
        priority_score = (
            volume_score * 0.3 +
            difficulty_score * 0.3 +
            cpc_score * 0.2 +
            serp_score * 0.2
        )
        
        return min(max(priority_score, 0), 1)
    
    async def get_user_keyword_data(self, user_id: int, limit: int = 20, offset: int = 0) -> List[Dict[str, Any]]:
        """Get user's keyword data"""
        try:
            db = next(get_db())
            keyword_data = db.query(KeywordData).filter(
                KeywordData.user_id == user_id
            ).order_by(KeywordData.created_at.desc()).offset(offset).limit(limit).all()
            
            return [kd.to_dict() for kd in keyword_data]
            
        except Exception as e:
            logger.error("Failed to get user keyword data", user_id=user_id, error=str(e))
            raise
    
    async def delete_keyword_data(self, keyword_data_id: int, user_id: int) -> bool:
        """Delete keyword data"""
        try:
            db = next(get_db())
            keyword_data = db.get_KeywordData_by_id(
                KeywordData.id == keyword_data_id,
                KeywordData.user_id == user_id
            )
            
            if not keyword_data:
                raise ValueError("Keyword data not found")
            
            db.delete(keyword_data)
            db.commit()
            
            logger.info("Keyword data deleted", keyword_data_id=keyword_data_id, user_id=user_id)
            return True
            
        except Exception as e:
            logger.error("Failed to delete keyword data", keyword_data_id=keyword_data_id, error=str(e))
            raise
    
    async def get_keyword_analytics(self, keyword_data_id: int) -> Dict[str, Any]:
        """Get keyword analytics and insights"""
        try:
            db = next(get_db())
            keyword_data = db.get_KeywordData_by_id(KeywordData.id == keyword_data_id)
            
            if not keyword_data or not keyword_data.keywords:
                raise ValueError("Keyword data not found or empty")
            
            # Calculate analytics
            analytics = {
                "total_keywords": len(keyword_data.keywords),
                "serp_analysis_summary": keyword_data.get_serp_analysis_summary(),
                "intent_distribution": keyword_data.get_intent_distribution(),
                "difficulty_distribution": keyword_data.get_difficulty_distribution(),
                "top_keywords": keyword_data.get_top_keywords(10),
                "high_priority_keywords": keyword_data.get_high_priority_keywords(0.7),
                "average_priority_score": sum(k.get("priority_score", 0) for k in keyword_data.keywords) / len(keyword_data.keywords)
            }
            
            return analytics
            
        except Exception as e:
            logger.error("Failed to get keyword analytics", keyword_data_id=keyword_data_id, error=str(e))
            raise

    async def generate_keywords_with_llm(self, subtopics: List[str], topic_title: str, user_id: int) -> List[str]:
        """Generate keywords using LLM based on subtopics"""
        try:
            logger.info("Generating keywords with LLM", 
                       user_id=user_id, 
                       topic_title=topic_title,
                       subtopics_count=len(subtopics))
            
            # Use OpenAI API to generate keywords
            import openai
            import os
            
            # Get OpenAI API key from environment
            openai_api_key = os.getenv('OPENAI_API_KEY')
            if not openai_api_key:
                raise ValueError("OPENAI_API_KEY environment variable not set")
            
            # Initialize OpenAI client
            client = openai.OpenAI(api_key=openai_api_key)
            
            # Create prompt for keyword generation
            subtopics_text = "\n".join([f"- {subtopic}" for subtopic in subtopics])
            
            prompt = f"""
            Generate high-quality seed keywords for the following subtopics related to "{topic_title}".
            
            Requirements:
            - Maximum 3 words per keyword
            - Focus on search intent and commercial value
            - Include both short-tail and long-tail keywords
            - Avoid generic or overly broad terms
            - Prioritize keywords that would be useful for content creation
            
            Subtopics:
            {subtopics_text}
            
            Generate 10-15 keywords for each subtopic. Return ONLY a simple list of keywords, one per line, without any explanations, formatting, or subtopic headers.
            
            Example format:
            solar panels
            renewable energy
            clean energy
            solar installation
            """
            
            # Call OpenAI API
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a professional SEO keyword researcher. Generate high-quality, targeted keywords for content marketing."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2000,
                temperature=0.7
            )
            
            # Parse response
            keywords_text = response.choices[0].message.content.strip()
            
            # Split by lines and clean up
            keywords = []
            for line in keywords_text.split('\n'):
                line = line.strip()
                # Skip empty lines and lines that look like headers (contain colons)
                if line and ':' not in line and not line.startswith('-') and not line.startswith('*'):
                    # Remove any numbering or bullet points
                    clean_line = line.lstrip('0123456789.-* ').strip()
                    if clean_line:
                        keywords.append(clean_line)
            
            # Filter to ensure max 3 words and remove duplicates
            filtered_keywords = []
            seen = set()
            for keyword in keywords:
                if len(keyword.split()) <= 3 and keyword.lower() not in seen:
                    filtered_keywords.append(keyword)
                    seen.add(keyword.lower())
            
            logger.info("Keywords generated successfully with LLM", 
                       user_id=user_id, 
                       keywords_count=len(filtered_keywords),
                       subtopics_processed=len(subtopics))
            
            return filtered_keywords
            
        except Exception as e:
            logger.error("Failed to generate keywords with LLM", 
                        user_id=user_id, 
                        error=str(e))
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate keywords: {str(e)}"
            )

    async def check_user_limits(self, user_id: int, limit_type: str) -> bool:
        """Check if user has reached their limits for a specific resource type"""
        # For now, always return True to allow unlimited usage
        # In a real implementation, this would check user subscription limits
        return True

    async def get_keyword_data(self, keyword_data_id: str) -> Optional[Dict[str, Any]]:
        """Get keyword data by ID"""
        # Mock implementation - return None for now
        return None

    async def list_user_keyword_data(self, user_id: int, skip: int = 0, limit: int = 20, source: Optional[str] = None) -> List[Dict[str, Any]]:
        """List user's keyword data"""
        # Mock implementation - return empty list for now
        return []

    async def delete_keyword_data(self, keyword_data_id: str) -> bool:
        """Delete keyword data"""
        # Mock implementation - return True for now
        return True

    async def get_keyword_analysis(self, keyword_data_id: str) -> Dict[str, Any]:
        """Get keyword analysis"""
        # Mock implementation
        return {
            "total_keywords": 0,
            "high_priority_keywords": [],
            "medium_priority_keywords": [],
            "low_priority_keywords": [],
            "clusters": [],
            "gap_analysis": {},
            "competition_analysis": {},
            "search_volume_analysis": {}
        }

    async def get_keyword_clusters(self, keyword_data_id: str) -> List[Dict[str, Any]]:
        """Get keyword clusters"""
        # Mock implementation - return empty list
        return []

    async def enrich_keywords(self, keyword_data_id: str) -> bool:
        """Enrich keywords with additional data"""
        # Mock implementation - return True
        return True

    async def cluster_keywords(self, keyword_data_id: str) -> bool:
        """Cluster keywords"""
        # Mock implementation - return True
        return True

    async def export_keywords(self, keyword_data_id: str, format: str) -> Dict[str, Any]:
        """Export keywords to file"""
        # Mock implementation
        return {
            "download_url": f"/api/keywords/export/{keyword_data_id}.{format}",
            "expires_at": "2024-12-31T23:59:59Z"
        }

    async def get_keyword_suggestions(self, query: str, geo: str = "US", language: str = "en", limit: int = 10) -> List[str]:
        """Get keyword suggestions"""
        # Mock implementation - return suggestions based on query
        suggestions = [
            f"{query} guide",
            f"{query} tips",
            f"best {query}",
            f"{query} tutorial",
            f"how to {query}"
        ]
        return suggestions[:limit]

    async def get_keyword_analytics(self, keyword_data_id: str) -> Dict[str, Any]:
        """Get keyword analytics"""
        # Mock implementation
        return {
            "total_keywords": 0,
            "average_search_volume": 0,
            "average_difficulty": 0,
            "top_keywords": [],
            "trends": []
        }
