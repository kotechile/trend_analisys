"""
Enhanced Affiliate Research Service
Provides intelligent, research-driven affiliate offer discovery and management
"""

import asyncio
import json
import hashlib
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import structlog
from ..core.supabase_database import get_supabase_db
from ..core.redis import cache
from ..core.llm_config import LLMConfigManager
from .web_search_service import WebSearchService
from ..integrations.linkup_api import linkup_api

logger = structlog.get_logger()

class EnhancedAffiliateResearchService:
    """Enhanced affiliate research service with intelligent discovery and learning capabilities"""
    
    def __init__(self):
        self.db = get_supabase_db()
        self.cache_ttl = 3600  # 1 hour cache TTL
        self.llm_manager = LLMConfigManager()
        self.web_search = WebSearchService()
    
    async def intelligent_offer_discovery(
        self,
        search_terms: List[str],
        user_id: str,
        research_scope: str = "comprehensive",
        max_offers: int = 20
    ) -> Dict[str, Any]:
        """
        Intelligently discover affiliate offers using multiple research methods
        """
        try:
            logger.info("Starting intelligent offer discovery", 
                       search_terms=search_terms, 
                       user_id=user_id,
                       research_scope=research_scope)
            
            # Create research session
            session_id = await self._create_research_session(
                user_id, search_terms, research_scope
            )
            
            # Get user preferences for personalized results
            user_preferences = await self._get_user_preferences(user_id)
            
            # Multi-source research
            research_results = await self._multi_source_research(
                search_terms, user_preferences, research_scope
            )
            
            # LLM-powered analysis and scoring
            analyzed_offers = await self._analyze_and_score_offers(
                research_results, search_terms, user_preferences
            )
            
            # Store discovered programs for future use
            stored_programs = await self._store_discovered_programs(
                analyzed_offers, user_id, session_id
            )
            
            # Generate personalized recommendations
            recommendations = await self._generate_personalized_recommendations(
                analyzed_offers, user_preferences, max_offers
            )
            
            # Update user preferences based on selections
            await self._update_user_preferences(user_id, recommendations)
            
            return {
                "session_id": session_id,
                "discovered_programs": len(stored_programs),
                "recommended_offers": recommendations,
                "research_quality_score": self._calculate_research_quality_score(analyzed_offers),
                "personalization_score": self._calculate_personalization_score(user_preferences, recommendations),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error("Intelligent offer discovery failed", error=str(e))
            raise
    
    async def _multi_source_research(
        self,
        search_terms: List[str],
        user_preferences: Dict[str, Any],
        research_scope: str
    ) -> List[Dict[str, Any]]:
        """Research offers from multiple sources"""
        all_offers = []
        
        # 1. Database search for existing programs
        db_offers = await self._search_existing_programs(search_terms)
        all_offers.extend(db_offers)
        
        # 2. LinkUp API search
        if research_scope in ["comprehensive", "deep"]:
            linkup_offers = await self._search_linkup_offers(search_terms)
            all_offers.extend(linkup_offers)
        
        # 3. LLM-powered company discovery
        llm_offers = await self._llm_discover_companies(search_terms, user_preferences)
        all_offers.extend(llm_offers)
        
        # 4. Web search for additional programs
        if research_scope == "deep":
            web_offers = await self._web_search_offers(search_terms)
            all_offers.extend(web_offers)
        
        # 5. Competitor analysis
        competitor_offers = await self._analyze_competitor_offers(search_terms)
        all_offers.extend(competitor_offers)
        
        return all_offers
    
    async def _search_existing_programs(self, search_terms: List[str]) -> List[Dict[str, Any]]:
        """Search existing programs in database"""
        try:
            # Search by keywords in program name, description, and target audience
            search_query = " OR ".join(search_terms)
            
            result = self.db.client.table("affiliate_programs").select("*").or_(
                f"program_name.ilike.%{search_query}%,"
                f"description.ilike.%{search_query}%,"
                f"target_audience.cs.{{{','.join(search_terms)}}}"
            ).eq("status", "active").limit(50).execute()
            
            return result.data or []
        except Exception as e:
            logger.warning("Database search failed", error=str(e))
            return []
    
    async def _search_linkup_offers(self, search_terms: List[str]) -> List[Dict[str, Any]]:
        """Search LinkUp API for offers"""
        try:
            all_offers = []
            for term in search_terms:
                offers = await linkup_api.search_offers(term, limit=10)
                all_offers.extend(offers)
            return all_offers
        except Exception as e:
            logger.warning("LinkUp search failed", error=str(e))
            return []
    
    async def _llm_discover_companies(
        self, 
        search_terms: List[str], 
        user_preferences: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Use LLM to discover companies with affiliate programs"""
        try:
            llm_config = self.llm_manager.get_config()
            if not llm_config:
                return []
            
            # Create comprehensive prompt for company discovery
            prompt = f"""
            Discover 15-20 real companies that offer affiliate programs related to: {', '.join(search_terms)}
            
            User preferences:
            - Preferred networks: {user_preferences.get('preferred_networks', [])}
            - Preferred categories: {user_preferences.get('preferred_categories', [])}
            - Commission range: {user_preferences.get('preferred_commission_ranges', [])}
            
            For each company, provide:
            1. Company name and website
            2. What they sell (specific products/services)
            3. Known affiliate network (if any)
            4. Estimated commission rate
            5. Target audience
            6. Content opportunities
            7. Difficulty level (Easy/Medium/Hard)
            
            Focus on:
            - Companies with verified affiliate programs
            - Mix of large and niche companies
            - Companies relevant to the search terms
            - Companies with good affiliate program reputations
            
            Return as JSON array with this structure:
            [
                {{
                    "company_name": "Company Name",
                    "website": "https://company.com",
                    "description": "What they sell",
                    "affiliate_network": "Network Name or Direct",
                    "commission_rate": "5-10%",
                    "target_audience": ["audience1", "audience2"],
                    "content_opportunities": ["opportunity1", "opportunity2"],
                    "difficulty": "Medium",
                    "program_url": "https://company.com/affiliate",
                    "contact_email": "affiliates@company.com"
                }}
            ]
            """
            
            # Call LLM
            from ..integrations.llm_providers import generate_content
            llm_result = await generate_content(
                prompt=prompt,
                provider=llm_config.get("provider", "openai"),
                max_tokens=2000,
                temperature=0.3
            )
            
            if "error" in llm_result:
                return []
            
            # Parse LLM response
            content = llm_result.get("content", "")
            try:
                json_start = content.find('[')
                json_end = content.rfind(']') + 1
                if json_start != -1 and json_end > json_start:
                    json_str = content[json_start:json_end]
                    companies = json.loads(json_str)
                    
                    # Convert to program format
                    programs = []
                    for company in companies:
                        if isinstance(company, dict) and 'company_name' in company:
                            programs.append({
                                "program_name": f"{company['company_name']} Affiliate Program",
                                "company_name": company['company_name'],
                                "description": company.get('description', ''),
                                "website_url": company.get('website', ''),
                                "network_name": company.get('affiliate_network', 'Direct'),
                                "commission_rate": self._parse_commission_rate(company.get('commission_rate', '5-10%')),
                                "target_audience": company.get('target_audience', []),
                                "content_opportunities": company.get('content_opportunities', []),
                                "program_url": company.get('program_url', company.get('website', '')),
                                "contact_email": company.get('contact_email', ''),
                                "source": "llm_discovered",
                                "data_quality_score": 0.8  # High quality from LLM
                            })
                    
                    return programs
            except json.JSONDecodeError:
                logger.warning("Failed to parse LLM company discovery response")
                return []
                
        except Exception as e:
            logger.warning("LLM company discovery failed", error=str(e))
            return []
    
    async def _web_search_offers(self, search_terms: List[str]) -> List[Dict[str, Any]]:
        """Search web for additional affiliate programs"""
        try:
            all_offers = []
            for term in search_terms:
                # Search for affiliate programs
                search_query = f"{term} affiliate program commission"
                offers = await self.web_search.search_affiliate_programs(search_query, max_results=5)
                all_offers.extend(offers)
            return all_offers
        except Exception as e:
            logger.warning("Web search failed", error=str(e))
            return []
    
    async def _analyze_competitor_offers(self, search_terms: List[str]) -> List[Dict[str, Any]]:
        """Analyze competitor affiliate programs"""
        try:
            # This would analyze what affiliate programs competitors are using
            # For now, return empty list as this requires more complex implementation
            return []
        except Exception as e:
            logger.warning("Competitor analysis failed", error=str(e))
            return []
    
    async def _analyze_and_score_offers(
        self,
        offers: List[Dict[str, Any]],
        search_terms: List[str],
        user_preferences: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Analyze and score offers using LLM and heuristics"""
        try:
            scored_offers = []
            
            for offer in offers:
                # Calculate research score
                research_score = await self._calculate_research_score(offer, search_terms, user_preferences)
                
                # Calculate quality score
                quality_score = self._calculate_quality_score(offer)
                
                # Calculate relevance score
                relevance_score = self._calculate_relevance_score(offer, search_terms)
                
                # Calculate personalization score
                personalization_score = self._calculate_personalization_score_for_offer(offer, user_preferences)
                
                # Overall score (weighted average)
                overall_score = (
                    research_score * 0.3 +
                    quality_score * 0.25 +
                    relevance_score * 0.25 +
                    personalization_score * 0.2
                )
                
                # Add scores to offer
                offer.update({
                    "research_score": round(research_score, 2),
                    "quality_score": round(quality_score, 2),
                    "relevance_score": round(relevance_score, 2),
                    "personalization_score": round(personalization_score, 2),
                    "overall_score": round(overall_score, 2),
                    "scored_at": datetime.utcnow().isoformat()
                })
                
                scored_offers.append(offer)
            
            # Sort by overall score
            scored_offers.sort(key=lambda x: x.get('overall_score', 0), reverse=True)
            
            return scored_offers
            
        except Exception as e:
            logger.error("Offer analysis and scoring failed", error=str(e))
            return offers  # Return unscored offers if analysis fails
    
    async def _calculate_research_score(
        self,
        offer: Dict[str, Any],
        search_terms: List[str],
        user_preferences: Dict[str, Any]
    ) -> float:
        """Calculate research quality score for an offer"""
        score = 0.0
        
        # Source quality
        source = offer.get('source', 'unknown')
        if source == 'llm_discovered':
            score += 0.4
        elif source == 'linkup':
            score += 0.3
        elif source == 'database':
            score += 0.2
        elif source == 'web_search':
            score += 0.1
        
        # Data completeness
        required_fields = ['program_name', 'description', 'commission_rate', 'website_url']
        completeness = sum(1 for field in required_fields if offer.get(field)) / len(required_fields)
        score += completeness * 0.3
        
        # Verification status
        verification_status = offer.get('verification_status', 'unverified')
        if verification_status == 'verified':
            score += 0.3
        elif verification_status == 'pending':
            score += 0.1
        
        return min(score, 1.0)
    
    def _calculate_quality_score(self, offer: Dict[str, Any]) -> float:
        """Calculate quality score for an offer"""
        score = 0.0
        
        # Commission rate quality
        commission_rate = offer.get('commission_rate', 0)
        if isinstance(commission_rate, (int, float)) and commission_rate > 0:
            if commission_rate >= 10:
                score += 0.3
            elif commission_rate >= 5:
                score += 0.2
            elif commission_rate >= 1:
                score += 0.1
        
        # Description quality
        description = offer.get('description', '')
        if len(description) > 100:
            score += 0.2
        elif len(description) > 50:
            score += 0.1
        
        # Network reputation
        network = offer.get('network_name', '').lower()
        reputable_networks = ['amazon', 'shareasale', 'impact', 'cj affiliate', 'awin', 'rakuten']
        if any(reputable in network for reputable in reputable_networks):
            score += 0.3
        
        # Website quality
        website = offer.get('website_url', '')
        if website and ('https://' in website or 'http://' in website):
            score += 0.2
        
        return min(score, 1.0)
    
    def _calculate_relevance_score(self, offer: Dict[str, Any], search_terms: List[str]) -> float:
        """Calculate relevance score for an offer"""
        score = 0.0
        
        # Check if search terms appear in offer details
        offer_text = f"{offer.get('program_name', '')} {offer.get('description', '')} {offer.get('company_name', '')}".lower()
        
        for term in search_terms:
            if term.lower() in offer_text:
                score += 0.3
        
        # Check target audience relevance
        target_audience = offer.get('target_audience', [])
        if target_audience:
            for term in search_terms:
                if any(term.lower() in audience.lower() for audience in target_audience):
                    score += 0.2
        
        return min(score, 1.0)
    
    def _calculate_personalization_score_for_offer(
        self,
        offer: Dict[str, Any],
        user_preferences: Dict[str, Any]
    ) -> float:
        """Calculate personalization score for an offer"""
        score = 0.0
        
        # Network preference match
        preferred_networks = user_preferences.get('preferred_networks', [])
        if preferred_networks:
            offer_network = offer.get('network_name', '').lower()
            if any(pref.lower() in offer_network for pref in preferred_networks):
                score += 0.4
        
        # Commission range preference
        preferred_ranges = user_preferences.get('preferred_commission_ranges', [])
        if preferred_ranges:
            commission_rate = offer.get('commission_rate', 0)
            if isinstance(commission_rate, (int, float)):
                for range_str in preferred_ranges:
                    if self._commission_in_range(commission_rate, range_str):
                        score += 0.3
                        break
        
        # Category preference
        preferred_categories = user_preferences.get('preferred_categories', [])
        if preferred_categories:
            # This would need category mapping logic
            score += 0.3
        
        return min(score, 1.0)
    
    def _commission_in_range(self, commission: float, range_str: str) -> bool:
        """Check if commission is in specified range"""
        try:
            if '-' in range_str:
                min_rate, max_rate = range_str.replace('%', '').split('-')
                return float(min_rate) <= commission <= float(max_rate)
            elif '>' in range_str:
                min_rate = float(range_str.replace('%', '').replace('>', ''))
                return commission > min_rate
            elif '<' in range_str:
                max_rate = float(range_str.replace('%', '').replace('<', ''))
                return commission < max_rate
        except:
            pass
        return False
    
    def _parse_commission_rate(self, rate_str: str) -> float:
        """Parse commission rate string to float"""
        try:
            # Handle ranges like "5-10%" by taking the average
            if '-' in rate_str:
                min_rate, max_rate = rate_str.replace('%', '').split('-')
                return (float(min_rate) + float(max_rate)) / 2
            else:
                return float(rate_str.replace('%', ''))
        except:
            return 5.0  # Default fallback
    
    async def _create_research_session(
        self,
        user_id: str,
        search_terms: List[str],
        research_scope: str
    ) -> str:
        """Create a research session"""
        try:
            session_data = {
                "user_id": user_id,
                "session_name": f"Research: {', '.join(search_terms[:3])}",
                "search_terms": search_terms,
                "research_scope": research_scope,
                "status": "active"
            }
            
            result = self.db.client.table("offer_research_sessions").insert(session_data).execute()
            return result.data[0]['id'] if result.data else str(uuid.uuid4())
        except Exception as e:
            logger.warning("Failed to create research session", error=str(e))
            return str(uuid.uuid4())
    
    async def _get_user_preferences(self, user_id: str) -> Dict[str, Any]:
        """Get user preferences for personalization"""
        try:
            result = self.db.client.table("user_offer_preferences").select("*").eq("user_id", user_id).execute()
            if result.data:
                return result.data[0]
            else:
                # Create default preferences
                return await self._create_default_preferences(user_id)
        except Exception as e:
            logger.warning("Failed to get user preferences", error=str(e))
            return {}
    
    async def _create_default_preferences(self, user_id: str) -> Dict[str, Any]:
        """Create default user preferences"""
        try:
            default_prefs = {
                "user_id": user_id,
                "preferred_networks": ["Amazon Associates", "ShareASale", "Impact"],
                "preferred_commission_ranges": ["5-10%", "10-20%"],
                "preferred_categories": [],
                "preferred_difficulty_levels": ["Easy", "Medium"],
                "learning_enabled": True
            }
            
            result = self.db.client.table("user_offer_preferences").insert(default_prefs).execute()
            return result.data[0] if result.data else default_prefs
        except Exception as e:
            logger.warning("Failed to create default preferences", error=str(e))
            return {}
    
    async def _store_discovered_programs(
        self,
        offers: List[Dict[str, Any]],
        user_id: str,
        session_id: str
    ) -> List[str]:
        """Store discovered programs in database"""
        stored_ids = []
        
        for offer in offers:
            try:
                # Check if program already exists
                existing = self.db.client.table("affiliate_programs").select("id").eq(
                    "program_name", offer.get('program_name', '')
                ).execute()
                
                if existing.data:
                    stored_ids.append(existing.data[0]['id'])
                    continue
                
                # Store new program
                program_data = {
                    "program_name": offer.get('program_name', ''),
                    "company_name": offer.get('company_name', ''),
                    "description": offer.get('description', ''),
                    "website_url": offer.get('website_url', ''),
                    "network_name": offer.get('network_name', ''),
                    "commission_rate": offer.get('commission_rate', 0),
                    "target_audience": offer.get('target_audience', []),
                    "content_opportunities": offer.get('content_opportunities', []),
                    "program_url": offer.get('program_url', ''),
                    "contact_email": offer.get('contact_email', ''),
                    "source": offer.get('source', 'unknown'),
                    "data_quality_score": offer.get('data_quality_score', 0.0),
                    "research_score": offer.get('research_score', 0.0),
                    "verification_status": "unverified"
                }
                
                result = self.db.client.table("affiliate_programs").insert(program_data).execute()
                if result.data:
                    stored_ids.append(result.data[0]['id'])
                    
            except Exception as e:
                logger.warning("Failed to store program", program_name=offer.get('program_name'), error=str(e))
        
        return stored_ids
    
    async def _generate_personalized_recommendations(
        self,
        offers: List[Dict[str, Any]],
        user_preferences: Dict[str, Any],
        max_offers: int
    ) -> List[Dict[str, Any]]:
        """Generate personalized recommendations"""
        # Sort by overall score and apply personalization
        recommendations = offers[:max_offers]
        
        # Add personalization insights
        for offer in recommendations:
            offer['personalization_reasons'] = self._get_personalization_reasons(offer, user_preferences)
        
        return recommendations
    
    def _get_personalization_reasons(
        self,
        offer: Dict[str, Any],
        user_preferences: Dict[str, Any]
    ) -> List[str]:
        """Get reasons why this offer was recommended"""
        reasons = []
        
        # Check network preference
        preferred_networks = user_preferences.get('preferred_networks', [])
        offer_network = offer.get('network_name', '')
        if any(pref.lower() in offer_network.lower() for pref in preferred_networks):
            reasons.append(f"Matches your preferred network: {offer_network}")
        
        # Check commission preference
        preferred_ranges = user_preferences.get('preferred_commission_ranges', [])
        commission_rate = offer.get('commission_rate', 0)
        if preferred_ranges and isinstance(commission_rate, (int, float)):
            for range_str in preferred_ranges:
                if self._commission_in_range(commission_rate, range_str):
                    reasons.append(f"Commission rate ({commission_rate}%) matches your preference ({range_str})")
                    break
        
        # Check difficulty preference
        preferred_difficulties = user_preferences.get('preferred_difficulty_levels', [])
        difficulty = offer.get('difficulty', 'Medium')
        if difficulty in preferred_difficulties:
            reasons.append(f"Difficulty level ({difficulty}) matches your preference")
        
        # High quality score
        quality_score = offer.get('quality_score', 0)
        if quality_score > 0.8:
            reasons.append("High quality program with good reputation")
        
        # High relevance score
        relevance_score = offer.get('relevance_score', 0)
        if relevance_score > 0.8:
            reasons.append("Highly relevant to your search terms")
        
        return reasons
    
    async def _update_user_preferences(
        self,
        user_id: str,
        recommendations: List[Dict[str, Any]]
    ) -> None:
        """Update user preferences based on recommendations"""
        try:
            # This would analyze user interactions and update preferences
            # For now, just log the update
            logger.info("User preferences updated", user_id=user_id, recommendations_count=len(recommendations))
        except Exception as e:
            logger.warning("Failed to update user preferences", error=str(e))
    
    def _calculate_research_quality_score(self, offers: List[Dict[str, Any]]) -> float:
        """Calculate overall research quality score"""
        if not offers:
            return 0.0
        
        avg_score = sum(offer.get('research_score', 0) for offer in offers) / len(offers)
        return round(avg_score, 2)
    
    def _calculate_personalization_score(
        self,
        user_preferences: Dict[str, Any],
        recommendations: List[Dict[str, Any]]
    ) -> float:
        """Calculate personalization score"""
        if not recommendations:
            return 0.0
        
        avg_score = sum(offer.get('personalization_score', 0) for offer in recommendations) / len(recommendations)
        return round(avg_score, 2)
    
    async def get_offer_analytics(self, user_id: str, days: int = 30) -> Dict[str, Any]:
        """Get offer analytics for a user"""
        try:
            start_date = datetime.utcnow() - timedelta(days=days)
            
            result = self.db.client.table("offer_analytics").select("*").eq(
                "user_id", user_id
            ).gte("created_at", start_date.isoformat()).execute()
            
            analytics = result.data or []
            
            return {
                "total_offers_viewed": len(analytics),
                "total_clicks": sum(a.get('click_count', 0) for a in analytics),
                "total_conversions": sum(a.get('conversion_count', 0) for a in analytics),
                "total_revenue": sum(a.get('revenue_generated', 0) for a in analytics),
                "total_commission": sum(a.get('commission_earned', 0) for a in analytics),
                "avg_time_spent": sum(a.get('time_spent_seconds', 0) for a in analytics) / len(analytics) if analytics else 0,
                "top_performing_offers": sorted(analytics, key=lambda x: x.get('revenue_generated', 0), reverse=True)[:5]
            }
        except Exception as e:
            logger.error("Failed to get offer analytics", error=str(e))
            return {}
    
    async def refresh_offer_data(self, offer_id: str) -> Dict[str, Any]:
        """Refresh offer data from external sources"""
        try:
            # Get offer details
            result = self.db.client.table("affiliate_programs").select("*").eq("id", offer_id).execute()
            if not result.data:
                return {"error": "Offer not found"}
            
            offer = result.data[0]
            
            # Refresh from LinkUp if available
            if offer.get('network_name', '').lower() in ['linkup', 'unknown']:
                refreshed_data = await self._refresh_from_linkup(offer)
                if refreshed_data:
                    # Update database
                    update_result = self.db.client.table("affiliate_programs").update({
                        **refreshed_data,
                        "last_verified": datetime.utcnow().isoformat(),
                        "verification_status": "verified"
                    }).eq("id", offer_id).execute()
                    
                    return {"success": True, "updated_data": refreshed_data}
            
            return {"success": True, "message": "No refresh needed"}
            
        except Exception as e:
            logger.error("Failed to refresh offer data", error=str(e))
            return {"error": str(e)}
    
    async def _refresh_from_linkup(self, offer: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Refresh offer data from LinkUp API"""
        try:
            # This would call LinkUp API to get updated data
            # For now, return None as this requires specific LinkUp API implementation
            return None
        except Exception as e:
            logger.warning("LinkUp refresh failed", error=str(e))
            return None
