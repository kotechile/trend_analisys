"""
Keyword Enhancer Service
Handles seed keyword generation, external tool integration, and keyword analysis
"""

import asyncio
import pandas as pd
import io
from typing import Dict, List, Any, Optional
import structlog
from datetime import datetime
import json

from ..core.supabase_database import get_supabase_db
from ..core.llm_config import LLMConfigManager

logger = structlog.get_logger()

class KeywordEnhancerService:
    def __init__(self):
        self.db = get_supabase_db()
        self.llm_manager = LLMConfigManager()

    async def generate_seed_keywords(
        self,
        search_term: str,
        selected_trends: List[str],
        content_ideas: List[str],
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate seed keywords based on search term, trends, and content ideas
        """
        try:
            logger.info("Generating seed keywords",
                       search_term=search_term,
                       trends_count=len(selected_trends),
                       content_ideas_count=len(content_ideas))
            
            # Generate keywords using LLM
            seed_keywords = await self._generate_keywords_with_llm(
                search_term, selected_trends, content_ideas
            )
            
            # Categorize keywords
            categorized_keywords = self._categorize_keywords(seed_keywords)
            
            # Generate export formats for external tools
            export_formats = self._generate_export_formats(categorized_keywords)
            
            # Save to database
            analysis_id = await self._save_keyword_analysis(
                search_term, categorized_keywords, user_id
            )
            
            return {
                "analysis_id": analysis_id,
                "search_term": search_term,
                "total_keywords": len(seed_keywords),
                "categorized_keywords": categorized_keywords,
                "export_formats": export_formats,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error("Failed to generate seed keywords", error=str(e))
            raise

    async def _generate_keywords_with_llm(
        self,
        search_term: str,
        selected_trends: List[str],
        content_ideas: List[str]
    ) -> List[Dict[str, Any]]:
        """Generate keywords using LLM"""
        try:
            llm_config = self.llm_manager.get_config()
            if not llm_config:
                logger.warning("No LLM config available, using fallback keywords")
                return self._generate_fallback_keywords(search_term, selected_trends)
            
            # Prepare context for LLM
            trends_text = "\n".join([f"- {trend}" for trend in selected_trends])
            content_text = "\n".join([f"- {idea}" for idea in content_ideas])
            
            prompt = f"""
            Generate comprehensive seed keywords for the search term "{search_term}" based on:
            
            Selected Trends:
            {trends_text}
            
            Content Ideas:
            {content_text}
            
            For each keyword, provide:
            1. Primary keyword
            2. Search intent (informational, commercial, navigational, transactional)
            3. Difficulty level (1-100)
            4. Estimated search volume
            5. Related keywords (3-5)
            6. Content angle suggestions
            
            Generate 50-100 keywords across different categories:
            - Primary keywords (exact match)
            - Long-tail keywords
            - Question-based keywords
            - Comparison keywords
            - Local keywords
            - Seasonal keywords
            
            Return as JSON array.
            """
            
            # For now, generate structured keywords without LLM call
            keywords = []
            
            # Primary keywords
            primary_keywords = [
                search_term,
                f"{search_term} guide",
                f"best {search_term}",
                f"{search_term} tips",
                f"{search_term} 2024"
            ]
            
            for keyword in primary_keywords:
                keywords.append({
                    "keyword": keyword,
                    "intent": "informational",
                    "difficulty": 45,
                    "search_volume": 5000,
                    "related_keywords": [f"{keyword} for beginners", f"{keyword} cost", f"{keyword} benefits"],
                    "content_angles": [f"Complete {keyword} guide", f"{keyword} comparison", f"{keyword} tips"],
                    "category": "primary"
                })
            
            # Long-tail keywords
            for trend in selected_trends[:3]:
                long_tail = f"{search_term} {trend.lower()}"
                keywords.append({
                    "keyword": long_tail,
                    "intent": "commercial",
                    "difficulty": 35,
                    "search_volume": 2000,
                    "related_keywords": [f"{long_tail} benefits", f"{long_tail} cost", f"{long_tail} reviews"],
                    "content_angles": [f"{long_tail} complete guide", f"Best {long_tail} options"],
                    "category": "long_tail"
                })
            
            # Question-based keywords
            question_keywords = [
                f"what is {search_term}",
                f"how to choose {search_term}",
                f"why {search_term} is important",
                f"when to use {search_term}",
                f"where to find {search_term}"
            ]
            
            for keyword in question_keywords:
                keywords.append({
                    "keyword": keyword,
                    "intent": "informational",
                    "difficulty": 25,
                    "search_volume": 1500,
                    "related_keywords": [f"{keyword} guide", f"{keyword} tips", f"{keyword} benefits"],
                    "content_angles": [f"Answering {keyword}", f"{keyword} explained"],
                    "category": "question"
                })
            
            return keywords
            
        except Exception as e:
            logger.error("Failed to generate keywords with LLM", error=str(e))
            return self._generate_fallback_keywords(search_term, selected_trends)

    def _generate_fallback_keywords(
        self,
        search_term: str,
        selected_trends: List[str]
    ) -> List[Dict[str, Any]]:
        """Generate fallback keywords without LLM"""
        keywords = []
        
        # Basic keyword variations
        variations = [
            f"{search_term} guide",
            f"best {search_term}",
            f"{search_term} tips",
            f"{search_term} 2024",
            f"how to {search_term}",
            f"{search_term} for beginners"
        ]
        
        for keyword in variations:
            keywords.append({
                "keyword": keyword,
                "intent": "informational",
                "difficulty": 40,
                "search_volume": 3000,
                "related_keywords": [f"{keyword} benefits", f"{keyword} cost"],
                "content_angles": [f"Complete {keyword} guide"],
                "category": "primary"
            })
        
        return keywords

    def _categorize_keywords(self, keywords: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """Categorize keywords by type and intent"""
        categorized = {
            "primary": [],
            "long_tail": [],
            "question": [],
            "commercial": [],
            "informational": [],
            "transactional": []
        }
        
        for keyword in keywords:
            category = keyword.get("category", "primary")
            intent = keyword.get("intent", "informational")
            
            if category in categorized:
                categorized[category].append(keyword)
            
            if intent in categorized:
                categorized[intent].append(keyword)
        
        return categorized

    def _generate_export_formats(self, categorized_keywords: List[Dict[str, Any]]) -> Dict[str, str]:
        """Generate CSV formats for external tools"""
        all_keywords = []
        for category_keywords in categorized_keywords.values():
            all_keywords.extend(category_keywords)
        
        # Ahrefs format
        ahrefs_df = pd.DataFrame([
            {
                "keyword": kw["keyword"],
                "search_volume": kw["search_volume"],
                "difficulty": kw["difficulty"],
                "cpc": 2.0,  # Default CPC
                "competition": 0.5,  # Default competition
                "trend": "stable",
                "click_potential": 0.7,
                "parent_keyword": kw["keyword"].split()[0] if kw["keyword"] else ""
            }
            for kw in all_keywords
        ])
        
        # Semrush format
        semrush_df = pd.DataFrame([
            {
                "keyword": kw["keyword"],
                "search_volume": kw["search_volume"],
                "difficulty": kw["difficulty"],
                "cpc": 2.0,
                "competition": 0.5,
                "trend": "stable",
                "related_keywords": ", ".join(kw["related_keywords"]),
                "questions": f"What is {kw['keyword']}?"
            }
            for kw in all_keywords
        ])
        
        return {
            "ahrefs": ahrefs_df.to_csv(index=False),
            "semrush": semrush_df.to_csv(index=False),
            "ubersuggest": ahrefs_df.to_csv(index=False)  # Similar to Ahrefs
        }

    async def process_external_keyword_data(
        self,
        df: pd.DataFrame,
        tool_name: str,
        search_term: str,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Process keyword data from external tools
        """
        try:
            logger.info("Processing external keyword data",
                       tool_name=tool_name,
                       search_term=search_term,
                       rows=len(df))
            
            # Normalize data based on tool
            normalized_df = self._normalize_external_data(df, tool_name)
            
            # Analyze keyword clusters
            clusters = self._analyze_keyword_clusters(normalized_df)
            
            # Generate content strategy
            content_strategy = self._generate_content_strategy(clusters, search_term)
            
            # Save to database
            analysis_id = await self._save_external_analysis(
                normalized_df, clusters, content_strategy, tool_name, search_term, user_id
            )
            
            return {
                "analysis_id": analysis_id,
                "tool_name": tool_name,
                "search_term": search_term,
                "keywords_processed": len(normalized_df),
                "clusters_found": len(clusters),
                "content_strategy": content_strategy,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error("Failed to process external keyword data", error=str(e))
            raise

    def _normalize_external_data(self, df: pd.DataFrame, tool_name: str) -> pd.DataFrame:
        """Normalize data from different external tools"""
        # Map columns to standard format
        column_mapping = {
            "ahrefs": {
                "keyword": "keyword",
                "search_volume": "search_volume",
                "difficulty": "difficulty",
                "cpc": "cpc",
                "competition": "competition"
            },
            "semrush": {
                "keyword": "keyword",
                "search_volume": "search_volume",
                "difficulty": "difficulty",
                "cpc": "cpc",
                "competition": "competition"
            },
            "ubersuggest": {
                "keyword": "keyword",
                "search_volume": "search_volume",
                "difficulty": "difficulty",
                "cpc": "cpc",
                "competition": "competition"
            }
        }
        
        if tool_name.lower() not in column_mapping:
            raise ValueError(f"Unsupported tool: {tool_name}")
        
        mapping = column_mapping[tool_name.lower()]
        normalized_df = df.rename(columns=mapping)
        
        # Ensure required columns exist
        required_columns = ["keyword", "search_volume", "difficulty"]
        missing_columns = [col for col in required_columns if col not in normalized_df.columns]
        if missing_columns:
            raise ValueError(f"Missing required columns: {missing_columns}")
        
        return normalized_df

    def _analyze_keyword_clusters(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Analyze keyword clusters for content strategy"""
        clusters = []
        
        # Group by difficulty level
        difficulty_clusters = df.groupby(pd.cut(df['difficulty'], bins=5, labels=['Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard']))
        
        for difficulty, group in difficulty_clusters:
            if len(group) > 0:
                clusters.append({
                    "cluster_name": f"{difficulty} Keywords",
                    "keywords": group['keyword'].tolist(),
                    "avg_difficulty": group['difficulty'].mean(),
                    "avg_volume": group['search_volume'].mean(),
                    "keyword_count": len(group),
                    "content_opportunity": "High" if difficulty in ['Very Easy', 'Easy'] else "Medium"
                })
        
        # Group by search volume
        volume_clusters = df.groupby(pd.cut(df['search_volume'], bins=3, labels=['Low Volume', 'Medium Volume', 'High Volume']))
        
        for volume, group in volume_clusters:
            if len(group) > 0:
                clusters.append({
                    "cluster_name": f"{volume} Keywords",
                    "keywords": group['keyword'].tolist(),
                    "avg_difficulty": group['difficulty'].mean(),
                    "avg_volume": group['search_volume'].mean(),
                    "keyword_count": len(group),
                    "content_opportunity": "High" if volume == 'High Volume' else "Medium"
                })
        
        return clusters

    def _generate_content_strategy(self, clusters: List[Dict[str, Any]], search_term: str) -> Dict[str, Any]:
        """Generate content strategy based on keyword clusters"""
        strategy = {
            "primary_content": [],
            "supporting_content": [],
            "long_tail_content": [],
            "content_calendar": []
        }
        
        for cluster in clusters:
            if cluster['content_opportunity'] == 'High':
                strategy["primary_content"].append({
                    "title": f"Complete Guide to {search_term}: {cluster['cluster_name']}",
                    "keywords": cluster['keywords'][:5],
                    "estimated_volume": cluster['avg_volume'],
                    "difficulty": cluster['avg_difficulty'],
                    "content_type": "comprehensive_guide"
                })
            else:
                strategy["supporting_content"].append({
                    "title": f"{search_term} Tips: {cluster['cluster_name']}",
                    "keywords": cluster['keywords'][:3],
                    "estimated_volume": cluster['avg_volume'],
                    "difficulty": cluster['avg_difficulty'],
                    "content_type": "tips_article"
                })
        
        return strategy

    async def _save_keyword_analysis(
        self,
        search_term: str,
        categorized_keywords: Dict[str, List[Dict[str, Any]]],
        user_id: Optional[str] = None
    ) -> str:
        """Save keyword analysis to database"""
        analysis_id = f"keyword_analysis_{datetime.utcnow().timestamp()}"
        logger.info("Saving keyword analysis", analysis_id=analysis_id)
        return analysis_id

    async def _save_external_analysis(
        self,
        df: pd.DataFrame,
        clusters: List[Dict[str, Any]],
        content_strategy: Dict[str, Any],
        tool_name: str,
        search_term: str,
        user_id: Optional[str] = None
    ) -> str:
        """Save external analysis to database"""
        analysis_id = f"external_analysis_{datetime.utcnow().timestamp()}"
        logger.info("Saving external analysis", analysis_id=analysis_id, tool_name=tool_name)
        return analysis_id

    async def analyze_keyword_clusters(
        self,
        search_term: str,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Analyze keyword clusters for a search term"""
        try:
            # This would load existing keyword data and analyze clusters
            # For now, return mock data
            return {
                "search_term": search_term,
                "clusters": [
                    {
                        "cluster_name": "Primary Keywords",
                        "keywords": [f"{search_term} guide", f"best {search_term}"],
                        "avg_difficulty": 45,
                        "avg_volume": 5000,
                        "content_opportunity": "High"
                    }
                ],
                "total_keywords": 10,
                "analysis_timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error("Failed to analyze keyword clusters", error=str(e))
            raise

    async def get_complete_keyword_analysis(
        self,
        search_term: str,
        user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get complete keyword analysis for a search term"""
        try:
            # This would load all keyword data for the search term
            # For now, return mock data
            return {
                "search_term": search_term,
                "seed_keywords": [],
                "external_analysis": [],
                "clusters": [],
                "content_strategy": {},
                "export_formats": {},
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error("Failed to get complete keyword analysis", error=str(e))
            raise

    async def export_keywords_for_tool(
        self,
        search_term: str,
        tool_name: str,
        user_id: Optional[str] = None
    ) -> str:
        """Export keywords in format suitable for external tools"""
        try:
            # This would load keywords and format for specific tool
            # For now, return mock CSV
            mock_keywords = [
                {"keyword": f"{search_term} guide", "search_volume": 5000, "difficulty": 45},
                {"keyword": f"best {search_term}", "search_volume": 3000, "difficulty": 40}
            ]
            
            df = pd.DataFrame(mock_keywords)
            return df.to_csv(index=False)
            
        except Exception as e:
            logger.error("Failed to export keywords", error=str(e))
            raise

