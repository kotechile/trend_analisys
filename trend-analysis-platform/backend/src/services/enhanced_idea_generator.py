"""
Enhanced idea generator with separate paths for blog and software ideas
"""

import logging
from typing import Dict, List, Any, Optional
from ..services.enhanced_database import enhanced_database_service
from ..config import settings

logger = logging.getLogger(__name__)

class EnhancedIdeaGenerator:
    """Enhanced idea generator with separate paths for blog and software ideas"""
    
    def __init__(self):
        self.llm_service = None  # Initialize with your existing LLM service
        self.google_autocomplete_service = None  # Initialize with your existing service
    
    async def generate_blog_ideas_from_keywords(
        self, 
        keywords_data: List[Dict[str, Any]], 
        user_id: str,
        analysis_id: str
    ) -> List[Dict[str, Any]]:
        """
        Generate blog ideas from Ahrefs keyword analysis
        
        Args:
            keywords_data: Processed Ahrefs keywords
            user_id: User ID
            analysis_id: Analysis ID
            
        Returns:
            List of blog ideas
        """
        try:
            # Get highest ranked keywords (bigger volume, easier to rank)
            top_keywords = self._get_top_keywords(keywords_data)
            
            # Generate blog ideas using LLM with enhanced keywords
            blog_ideas = await self._generate_blog_ideas_with_llm(
                top_keywords, 
                user_id, 
                analysis_id,
                enhanced_with_ahrefs=True
            )
            
            # Save to database
            await enhanced_database_service.save_enhanced_ideas({
                'user_id': user_id,
                'analysis_id': analysis_id,
                'blog_ideas': blog_ideas
            })
            
            logger.info(f"Generated {len(blog_ideas)} blog ideas from Ahrefs keywords")
            return blog_ideas
            
        except Exception as e:
            logger.error(f"Error generating blog ideas from keywords: {str(e)}")
            raise ValueError(f"Failed to generate blog ideas: {str(e)}")
    
    async def generate_software_ideas_separately(
        self, 
        user_id: str,
        seed_keywords: Optional[List[str]] = None,
        enhanced_with_ahrefs: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Generate software ideas separately (not keyword-related)
        
        Args:
            user_id: User ID
            seed_keywords: Optional seed keywords for context
            enhanced_with_ahrefs: Whether to use Ahrefs data for context
            
        Returns:
            List of software ideas
        """
        try:
            # Generate software ideas using LLM
            software_ideas = await self._generate_software_ideas_with_llm(
                user_id, 
                seed_keywords,
                enhanced_with_ahrefs
            )
            
            # Save to database
            await enhanced_database_service.save_enhanced_ideas({
                'user_id': user_id,
                'analysis_id': None,  # No analysis ID for separate generation
                'software_ideas': software_ideas
            })
            
            logger.info(f"Generated {len(software_ideas)} software ideas separately")
            return software_ideas
            
        except Exception as e:
            logger.error(f"Error generating software ideas: {str(e)}")
            raise ValueError(f"Failed to generate software ideas: {str(e)}")
    
    async def generate_blog_ideas_from_seed_keywords(
        self, 
        seed_keywords: List[str], 
        user_id: str
    ) -> List[Dict[str, Any]]:
        """
        Generate blog ideas from seed keywords (existing functionality)
        
        Args:
            seed_keywords: Seed keywords from user input
            user_id: User ID
            
        Returns:
            List of blog ideas
        """
        try:
            # Use existing LLM + Google Autocomplete functionality
            blog_ideas = await self._generate_blog_ideas_with_llm(
                seed_keywords, 
                user_id, 
                None,  # No analysis ID for seed keywords
                enhanced_with_ahrefs=False
            )
            
            logger.info(f"Generated {len(blog_ideas)} blog ideas from seed keywords")
            return blog_ideas
            
        except Exception as e:
            logger.error(f"Error generating blog ideas from seed keywords: {str(e)}")
            raise ValueError(f"Failed to generate blog ideas: {str(e)}")
    
    def _get_top_keywords(self, keywords_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Get top keywords based on volume and difficulty"""
        # Sort by opportunity score and volume
        sorted_keywords = sorted(
            keywords_data,
            key=lambda x: (x.get('opportunity_score', 0), x.get('search_volume', 0)),
            reverse=True
        )
        
        # Return top 20 keywords
        return sorted_keywords[:20]
    
    async def _generate_blog_ideas_with_llm(
        self, 
        keywords: List[str] | List[Dict[str, Any]], 
        user_id: str,
        analysis_id: Optional[str],
        enhanced_with_ahrefs: bool
    ) -> List[Dict[str, Any]]:
        """Generate blog ideas using LLM"""
        try:
            # Prepare keywords for LLM
            if isinstance(keywords[0], dict):
                # Ahrefs keywords with metrics
                keyword_texts = [k['keyword'] for k in keywords]
                keyword_metrics = {k['keyword']: k for k in keywords}
            else:
                # Seed keywords
                keyword_texts = keywords
                keyword_metrics = {}
            
            # Call your existing LLM service
            # This would integrate with your existing LLM functionality
            blog_ideas = await self._call_llm_for_blog_ideas(
                keyword_texts,
                keyword_metrics,
                enhanced_with_ahrefs
            )
            
            # Add metadata
            for idea in blog_ideas:
                idea['user_id'] = user_id
                idea['analysis_id'] = analysis_id
                idea['enhanced_with_ahrefs'] = enhanced_with_ahrefs
                idea['type'] = 'blog'
            
            return blog_ideas
            
        except Exception as e:
            logger.error(f"Error generating blog ideas with LLM: {str(e)}")
            raise ValueError(f"Failed to generate blog ideas with LLM: {str(e)}")
    
    async def _generate_software_ideas_with_llm(
        self, 
        user_id: str,
        seed_keywords: Optional[List[str]],
        enhanced_with_ahrefs: bool
    ) -> List[Dict[str, Any]]:
        """Generate software ideas using LLM"""
        try:
            # Call your existing LLM service for software ideas
            # This would integrate with your existing LLM functionality
            software_ideas = await self._call_llm_for_software_ideas(
                seed_keywords,
                enhanced_with_ahrefs
            )
            
            # Add metadata
            for idea in software_ideas:
                idea['user_id'] = user_id
                idea['analysis_id'] = None
                idea['enhanced_with_ahrefs'] = enhanced_with_ahrefs
                idea['type'] = 'software'
            
            return software_ideas
            
        except Exception as e:
            logger.error(f"Error generating software ideas with LLM: {str(e)}")
            raise ValueError(f"Failed to generate software ideas with LLM: {str(e)}")
    
    async def _call_llm_for_blog_ideas(
        self, 
        keywords: List[str], 
        keyword_metrics: Dict[str, Any],
        enhanced_with_ahrefs: bool
    ) -> List[Dict[str, Any]]:
        """Call LLM service for blog ideas"""
        # This would integrate with your existing LLM service
        # For now, return mock data
        return [
            {
                'id': f"blog_idea_{i}",
                'title': f"Blog Idea {i}",
                'content_type': 'list-article',
                'primary_keywords': keywords[:3],
                'secondary_keywords': keywords[3:6],
                'seo_optimization_score': 85,
                'traffic_potential_score': 78,
                'combined_score': 81.5,
                'total_search_volume': 5000,
                'average_difficulty': 45,
                'average_cpc': 2.50,
                'optimization_tips': [
                    f"Include '{keywords[0]}' in your title",
                    "Add internal links to related content"
                ],
                'content_outline': "Introduction → Main Content → Conclusion",
                'target_audience': "General audience",
                'content_length': "medium"
            }
            for i in range(10)
        ]
    
    async def _call_llm_for_software_ideas(
        self, 
        seed_keywords: Optional[List[str]],
        enhanced_with_ahrefs: bool
    ) -> List[Dict[str, Any]]:
        """Call LLM service for software ideas"""
        # This would integrate with your existing LLM service
        # For now, return mock data
        return [
            {
                'id': f"software_idea_{i}",
                'title': f"Software Idea {i}",
                'description': f"Description for software idea {i}",
                'features': [
                    "Feature 1",
                    "Feature 2",
                    "Feature 3"
                ],
                'target_market': "Small businesses",
                'monetization_strategy': "Subscription model",
                'technical_requirements': [
                    "Web development",
                    "Database design",
                    "API integration"
                ],
                'market_opportunity_score': 75,
                'development_difficulty': 60,
                'estimated_development_time': "6 months"
            }
            for i in range(5)
        ]
    
    async def get_combined_ideas(
        self, 
        user_id: str,
        analysis_id: Optional[str] = None
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Get combined blog and software ideas"""
        try:
            # Get blog ideas from analysis
            blog_ideas = []
            if analysis_id:
                analysis_data = await enhanced_database_service.get_enhanced_ideas(analysis_id, 'blog')
                blog_ideas = analysis_data.get('blog_ideas', [])
            
            # Get software ideas (separate generation)
            software_data = await enhanced_database_service.get_enhanced_ideas(None, 'software')
            software_ideas = software_data.get('software_ideas', [])
            
            return {
                'blog_ideas': blog_ideas,
                'software_ideas': software_ideas
            }
            
        except Exception as e:
            logger.error(f"Error getting combined ideas: {str(e)}")
            return {'blog_ideas': [], 'software_ideas': []}
    
    async def generate_ideas_for_idea_burst(
        self, 
        user_id: str,
        analysis_id: Optional[str] = None,
        include_software: bool = True
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Generate ideas for Idea Burst page"""
        try:
            result = {'blog_ideas': [], 'software_ideas': []}
            
            # Get blog ideas from analysis if available
            if analysis_id:
                analysis_data = await enhanced_database_service.get_enhanced_ideas(analysis_id, 'blog')
                result['blog_ideas'] = analysis_data.get('blog_ideas', [])
            
            # Generate software ideas separately if requested
            if include_software:
                software_ideas = await self.generate_software_ideas_separately(user_id)
                result['software_ideas'] = software_ideas
            
            return result
            
        except Exception as e:
            logger.error(f"Error generating ideas for Idea Burst: {str(e)}")
            return {'blog_ideas': [], 'software_ideas': []}

# Global instance
enhanced_idea_generator = EnhancedIdeaGenerator()

