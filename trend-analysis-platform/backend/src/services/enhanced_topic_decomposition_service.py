"""
Enhanced topic decomposition service
Combines Google Autocomplete with LLM processing for optimal topic research
"""

import asyncio
import time
import logging
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
from uuid import uuid4

from ..models.enhanced_subtopic import EnhancedSubtopic, SubtopicSource
from ..models.autocomplete_result import AutocompleteResult
from ..models.method_comparison import MethodComparison, MethodResult
from ..models.comparison_metrics import ComparisonMetrics
from ..models.search_volume_indicator import SearchVolumeIndicator, IndicatorType
from ..integrations.google_autocomplete import GoogleAutocompleteService
from ..integrations.llm_providers import llm_providers_manager, generate_content


logger = logging.getLogger(__name__)


class EnhancedTopicDecompositionService:
    """
    Service for enhanced topic decomposition using Google Autocomplete + LLM
    
    Features:
    - Hybrid approach combining autocomplete and LLM
    - Method comparison and analysis
    - Relevance scoring and ranking
    - Fallback mechanisms
    - Performance optimization
    """
    
    def __init__(self, 
                 google_autocomplete_service: Optional[GoogleAutocompleteService] = None,
                 llm_provider: str = "openai"):
        """
        Initialize enhanced topic decomposition service
        
        Args:
            google_autocomplete_service: Google Autocomplete service instance
            llm_provider: LLM provider to use (openai, anthropic, google_ai)
        """
        self.google_autocomplete_service = google_autocomplete_service or GoogleAutocompleteService()
        self.llm_provider = llm_provider
        self.llm_service = llm_providers_manager.providers.get(llm_provider)
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.cache_ttl = 3600  # 1 hour in seconds
    
    async def decompose_topic_enhanced(self, 
                                     query: str,
                                     user_id: str,
                                     max_subtopics: int = 6,
                                     use_autocomplete: bool = True,
                                     use_llm: bool = True) -> Dict[str, Any]:
        """
        Decompose topic using enhanced approach (autocomplete + LLM)
        
        Args:
            query: Topic to decompose
            user_id: User identifier
            max_subtopics: Maximum number of subtopics to return
            use_autocomplete: Whether to use Google Autocomplete
            use_llm: Whether to use LLM processing
            
        Returns:
            Dictionary with decomposition results
        """
        start_time = time.time()
        
        try:
            # Validate inputs
            if not query or not query.strip():
                raise ValueError("Query cannot be empty")
            
            query = query.strip()
            
            # Check cache
            cache_key = f"{user_id}:{query}:{max_subtopics}"
            cached_result = self._get_cached_result(cache_key)
            if cached_result:
                logger.info(f"Returning cached result for query: {query}")
                return cached_result
            
            # Get autocomplete data if enabled
            autocomplete_data = None
            if use_autocomplete:
                autocomplete_result = await self.google_autocomplete_service.get_suggestions(query)
                if autocomplete_result.success:
                    autocomplete_data = autocomplete_result
                else:
                    logger.warning(f"Autocomplete failed for query '{query}': {autocomplete_result.error_message}")
            else:
                autocomplete_data = None
            
            # Get LLM subtopics if enabled
            llm_subtopics = []
            llm_error = None
            if use_llm:
                llm_subtopics = await self._get_llm_subtopics(query, autocomplete_data)
                if not llm_subtopics and self.llm_service:
                    llm_error = "LLM service returned no subtopics"
                elif not llm_subtopics and not self.llm_service:
                    llm_error = "LLM service not available"
            
            # Create enhanced subtopics
            enhanced_subtopics = await self._create_enhanced_subtopics(
                query, llm_subtopics, autocomplete_data, max_subtopics
            )
            
            # Prepare response
            processing_time = time.time() - start_time
            enhancement_methods = []
            warnings = []
            
            if use_autocomplete and autocomplete_data:
                enhancement_methods.append("autocomplete")
            elif use_autocomplete:
                warnings.append("Autocomplete service not available")
            
            if use_llm and llm_subtopics:
                enhancement_methods.append("llm")
            elif use_llm and llm_error:
                warnings.append(f"LLM service issue: {llm_error}")
            
            # Create response message
            if len(enhanced_subtopics) == 0:
                message = "No subtopics could be generated. Please check if autocomplete and LLM services are working."
            else:
                message = f"Topic decomposed into {len(enhanced_subtopics)} enhanced subtopics"
                if warnings:
                    message += f" (Warnings: {', '.join(warnings)})"
            
            result = {
                "success": len(enhanced_subtopics) > 0,
                "message": message,
                "original_query": query,
                "subtopics": [subtopic.to_dict() for subtopic in enhanced_subtopics],
                "autocomplete_data": autocomplete_data.to_dict() if autocomplete_data else None,
                "processing_time": processing_time,
                "enhancement_methods": enhancement_methods,
                "warnings": warnings
            }
            
            # Cache result
            self._cache_result(cache_key, result)
            
            return result
            
        except Exception as e:
            logger.error(f"Error in enhanced topic decomposition: {str(e)}")
            return {
                "success": False,
                "message": f"Error decomposing topic: {str(e)}",
                "original_query": query,
                "subtopics": [],
                "autocomplete_data": None,
                "processing_time": time.time() - start_time,
                "enhancement_methods": []
            }
    
    async def compare_methods(self, 
                            query: str,
                            user_id: str,
                            max_subtopics: int = 6) -> Dict[str, Any]:
        """
        Compare different decomposition methods side-by-side
        
        Args:
            query: Topic to analyze
            user_id: User identifier
            max_subtopics: Maximum number of subtopics per method
            
        Returns:
            Dictionary with method comparison results
        """
        start_time = time.time()
        
        try:
            # Run all methods in parallel
            llm_task = self._run_llm_only_method(query, max_subtopics)
            autocomplete_task = self._run_autocomplete_only_method(query, max_subtopics)
            hybrid_task = self._run_hybrid_method(query, max_subtopics)
            
            # Wait for all methods to complete
            llm_result, autocomplete_result, hybrid_result = await asyncio.gather(
                llm_task, autocomplete_task, hybrid_task, return_exceptions=True
            )
            
            # Handle exceptions
            if isinstance(llm_result, Exception):
                logger.error(f"LLM method failed: {str(llm_result)}")
                llm_result = MethodResult(subtopics=[], processing_time=0.0, method="LLM Only")
            
            if isinstance(autocomplete_result, Exception):
                logger.error(f"Autocomplete method failed: {str(autocomplete_result)}")
                autocomplete_result = MethodResult(subtopics=[], processing_time=0.0, method="Autocomplete Only")
            
            if isinstance(hybrid_result, Exception):
                logger.error(f"Hybrid method failed: {str(hybrid_result)}")
                hybrid_result = MethodResult(subtopics=[], processing_time=0.0, method="Hybrid (LLM + Autocomplete)")
            
            # Create method comparison
            comparison = MethodComparison(
                id=str(uuid4()),
                original_query=query,
                llm_only_results=llm_result,
                autocomplete_only_results=autocomplete_result,
                hybrid_results=hybrid_result
            )
            
            # Update metrics
            comparison.update_metrics()
            
            # Get recommendation
            recommendation = comparison.get_recommendation()
            
            processing_time = time.time() - start_time
            
            return {
                "success": True,
                "original_query": query,
                "comparison": {
                    "llm_only": comparison.llm_only_results.to_dict(),
                    "autocomplete_only": comparison.autocomplete_only_results.to_dict(),
                    "hybrid": comparison.hybrid_results.to_dict()
                },
                "recommendation": recommendation,
                "processing_time": processing_time
            }
            
        except Exception as e:
            logger.error(f"Error in method comparison: {str(e)}")
            return {
                "success": False,
                "original_query": query,
                "comparison": None,
                "recommendation": f"Error comparing methods: {str(e)}",
                "processing_time": time.time() - start_time
            }
    
    async def _run_llm_only_method(self, query: str, max_subtopics: int) -> MethodResult:
        """Run LLM-only decomposition method"""
        start_time = time.time()
        
        try:
            if self.llm_service:
                subtopics = await self._get_llm_subtopics(query, None)
            else:
                subtopics = self._get_fallback_subtopics(query)
            
            processing_time = time.time() - start_time
            
            return MethodResult(
                subtopics=subtopics[:max_subtopics],
                processing_time=processing_time,
                method="LLM Only"
            )
            
        except Exception as e:
            logger.error(f"LLM-only method failed: {str(e)}")
            return MethodResult(
                subtopics=[],
                processing_time=time.time() - start_time,
                method="LLM Only"
            )
    
    async def _run_autocomplete_only_method(self, query: str, max_subtopics: int) -> MethodResult:
        """Run autocomplete-only decomposition method"""
        start_time = time.time()
        
        try:
            autocomplete_result = await self.google_autocomplete_service.get_suggestions(query)
            
            if autocomplete_result.success:
                subtopics = autocomplete_result.suggestions[:max_subtopics]
            else:
                subtopics = []
            
            processing_time = time.time() - start_time
            
            return MethodResult(
                subtopics=subtopics,
                processing_time=processing_time,
                method="Autocomplete Only"
            )
            
        except Exception as e:
            logger.error(f"Autocomplete-only method failed: {str(e)}")
            return MethodResult(
                subtopics=[],
                processing_time=time.time() - start_time,
                method="Autocomplete Only"
            )
    
    async def _run_hybrid_method(self, query: str, max_subtopics: int) -> MethodResult:
        """Run hybrid decomposition method"""
        start_time = time.time()
        
        try:
            # Get autocomplete data
            autocomplete_result = await self.google_autocomplete_service.get_suggestions(query)
            
            # Get LLM subtopics with autocomplete context
            if self.llm_service:
                llm_subtopics = await self._get_llm_subtopics(query, autocomplete_result)
            else:
                llm_subtopics = self._get_fallback_subtopics(query)
            
            # Combine and enhance subtopics
            enhanced_subtopics = await self._create_enhanced_subtopics(
                query, llm_subtopics, autocomplete_result, max_subtopics
            )
            
            # Extract subtopic titles
            subtopics = [subtopic.title for subtopic in enhanced_subtopics]
            
            processing_time = time.time() - start_time
            
            return MethodResult(
                subtopics=subtopics,
                processing_time=processing_time,
                method="Hybrid (LLM + Autocomplete)"
            )
            
        except Exception as e:
            logger.error(f"Hybrid method failed: {str(e)}")
            return MethodResult(
                subtopics=[],
                processing_time=time.time() - start_time,
                method="Hybrid (LLM + Autocomplete)"
            )
    
    async def _get_llm_subtopics(self, query: str, autocomplete_data: Optional[AutocompleteResult]) -> List[str]:
        """Get subtopics from LLM service"""
        try:
            if not self.llm_service:
                logger.warning(f"LLM service not available for provider: {self.llm_provider}")
                return []
            
            # Create enhanced prompt with autocomplete context
            prompt = self._create_enhanced_prompt(query, autocomplete_data)
            
            # Call LLM service
            result = await self.llm_service.generate_content(
                prompt=prompt,
                max_tokens=1000,
                temperature=0.7
            )
            
            if "error" in result:
                logger.error(f"LLM service error: {result['error']}")
                return []
            
            # Parse subtopics from LLM response
            subtopics = self._parse_llm_subtopics(result["content"])
            
            if not subtopics:
                logger.warning("No subtopics parsed from LLM response")
                return []
            
            return subtopics
            
        except Exception as e:
            logger.error(f"Error getting LLM subtopics: {str(e)}")
            return []
    
    
    def _create_enhanced_prompt(self, query: str, autocomplete_data: Optional[AutocompleteResult]) -> str:
        """Create enhanced prompt with autocomplete context"""
        base_prompt = f"""
        For the topic "{query}", generate 4-6 specific subtopics for affiliate marketing research.
        
        REQUIRED: Include different TYPES/CATEGORIES of "{query}" as subtopics.
        
        Examples for "boat":
        - Pontoon boats
        - Bow riders  
        - Personal Watercraft
        - Fishing boats
        - Sailboats
        - Yachts
        - Speedboats
        - Houseboats
        
        Also include commercial angles like:
        - {query} maintenance
        - {query} insurance
        - {query} accessories
        
        Return ONLY the subtopic names, one per line, no explanations.
        """
        
        if autocomplete_data and autocomplete_data.success:
            autocomplete_context = f"""
            
            Based on real-time search data, here are related search suggestions:
            {', '.join(autocomplete_data.suggestions[:5])}
            
            Use this search data to inform your subtopic suggestions and ensure they align with what people are actually searching for.
            """
            base_prompt += autocomplete_context
        
        return base_prompt
    
    def _parse_llm_subtopics(self, content: str) -> List[str]:
        """Parse subtopics from LLM response content"""
        try:
            subtopics = []
            lines = content.split('\n')
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # Remove numbering and bullet points
                if line[0].isdigit() or line.startswith('-') or line.startswith('*'):
                    # Extract text after numbering
                    subtopic = line.split('.', 1)[-1].strip()
                    if subtopic:
                        subtopics.append(subtopic)
                elif line.startswith('•'):
                    # Extract text after bullet point
                    subtopic = line[1:].strip()
                    if subtopic:
                        subtopics.append(subtopic)
                elif len(line) > 10:  # Assume it's a subtopic if it's long enough
                    subtopics.append(line)
            
            # Filter and clean subtopics
            cleaned_subtopics = []
            for subtopic in subtopics:
                if len(subtopic) >= 5 and len(subtopic) <= 100:  # Reasonable length
                    cleaned_subtopics.append(subtopic.strip())
            
            return cleaned_subtopics[:6]  # Limit to 6 subtopics
            
        except Exception as e:
            logger.error(f"Error parsing LLM subtopics: {str(e)}")
            return []
    
    
    async def _create_enhanced_subtopics(self, 
                                       query: str,
                                       llm_subtopics: List[str],
                                       autocomplete_data: Optional[AutocompleteResult],
                                       max_subtopics: int) -> List[EnhancedSubtopic]:
        """Create enhanced subtopics with relevance scoring"""
        enhanced_subtopics = []
        
        # Combine both autocomplete and LLM suggestions for hybrid approach
        all_suggestions = set()
        
        # Add autocomplete suggestions (high priority - what people actually search for)
        if autocomplete_data and autocomplete_data.success and autocomplete_data.suggestions:
            all_suggestions.update(autocomplete_data.suggestions)
            logger.info(f"Added {len(autocomplete_data.suggestions)} autocomplete suggestions")
        
        # Add LLM suggestions (strategic/creative angles)
        if llm_subtopics:
            all_suggestions.update(llm_subtopics)
            logger.info(f"Added {len(llm_subtopics)} LLM suggestions")
        
        # Convert to list and log combined results
        all_suggestions = list(all_suggestions)
        logger.info(f"Combined suggestions ({len(all_suggestions)} total): {all_suggestions[:5]}...")
        
        # Create enhanced subtopics
        for i, subtopic_title in enumerate(list(all_suggestions)[:max_subtopics]):
            # Calculate relevance score
            relevance_score = self._calculate_relevance_score(
                subtopic_title, query, autocomplete_data
            )
            
            # Determine source
            source = self._determine_source(subtopic_title, llm_subtopics, autocomplete_data)
            
            # Create search volume indicators
            search_volume_indicators = self._create_search_volume_indicators(
                subtopic_title, autocomplete_data
            )
            
            # Get autocomplete suggestions for this subtopic
            autocomplete_suggestions = self._get_autocomplete_suggestions_for_subtopic(
                subtopic_title, autocomplete_data
            )
            
            # Create enhanced subtopic
            enhanced_subtopic = EnhancedSubtopic(
                id=str(uuid4()),
                title=subtopic_title,
                search_volume_indicators=search_volume_indicators,
                autocomplete_suggestions=autocomplete_suggestions,
                relevance_score=relevance_score,
                source=source
            )
            
            enhanced_subtopics.append(enhanced_subtopic)
        
        # Sort by relevance score
        enhanced_subtopics.sort(key=lambda x: x.relevance_score, reverse=True)
        
        return enhanced_subtopics[:max_subtopics]
    
    def _calculate_relevance_score(self, 
                                 subtopic: str, 
                                 query: str, 
                                 autocomplete_data: Optional[AutocompleteResult]) -> float:
        """Calculate relevance score for a subtopic"""
        base_score = 0.5
        
        # Boost score if subtopic contains query terms
        query_terms = query.lower().split()
        subtopic_lower = subtopic.lower()
        
        for term in query_terms:
            if term in subtopic_lower:
                base_score += 0.1
        
        # Boost score if subtopic appears in autocomplete suggestions
        if autocomplete_data and autocomplete_data.success:
            if subtopic in autocomplete_data.suggestions:
                base_score += 0.3
        
        # Boost score for commercial keywords
        commercial_keywords = ['best', 'review', 'buy', 'price', 'compare', 'top', 'guide']
        for keyword in commercial_keywords:
            if keyword in subtopic_lower:
                base_score += 0.05
        
        # Boost score for trending indicators
        trending_indicators = ['2024', 'new', 'latest', 'trending', 'popular']
        for indicator in trending_indicators:
            if indicator in subtopic_lower:
                base_score += 0.05
        
        return min(1.0, max(0.0, base_score))
    
    def _determine_source(self, 
                         subtopic: str, 
                         llm_subtopics: List[str], 
                         autocomplete_data: Optional[AutocompleteResult]) -> SubtopicSource:
        """Determine the source of a subtopic"""
        in_llm = subtopic in llm_subtopics
        in_autocomplete = (autocomplete_data and 
                          autocomplete_data.success and 
                          subtopic in autocomplete_data.suggestions)
        
        if in_llm and in_autocomplete:
            return SubtopicSource.HYBRID
        elif in_llm:
            return SubtopicSource.LLM
        elif in_autocomplete:
            return SubtopicSource.AUTOCOMPLETE
        else:
            return SubtopicSource.LLM  # Default to LLM
    
    def _create_search_volume_indicators(self, 
                                       subtopic: str, 
                                       autocomplete_data: Optional[AutocompleteResult]) -> List[str]:
        """Create search volume indicators for a subtopic"""
        indicators = []
        
        if autocomplete_data and autocomplete_data.success:
            if subtopic in autocomplete_data.suggestions:
                indicators.append("Found in autocomplete suggestions")
            
            if len(autocomplete_data.suggestions) > 5:
                indicators.append("High search volume from autocomplete")
        
        # Add generic indicators based on subtopic content
        if 'best' in subtopic.lower():
            indicators.append("High commercial intent")
        
        if '2024' in subtopic.lower():
            indicators.append("Trending topic")
        
        if 'review' in subtopic.lower():
            indicators.append("Review-focused search")
        
        return indicators if indicators else ["Standard search volume"]
    
    def _get_autocomplete_suggestions_for_subtopic(self, 
                                                 subtopic: str, 
                                                 autocomplete_data: Optional[AutocompleteResult]) -> List[str]:
        """Get autocomplete suggestions related to a subtopic"""
        if not autocomplete_data or not autocomplete_data.success:
            return []
        
        # Filter suggestions that are related to the subtopic
        related_suggestions = []
        subtopic_terms = subtopic.lower().split()
        
        for suggestion in autocomplete_data.suggestions:
            suggestion_lower = suggestion.lower()
            if any(term in suggestion_lower for term in subtopic_terms):
                related_suggestions.append(suggestion)
        
        return related_suggestions[:3]  # Limit to 3 related suggestions
    
    def _get_cached_result(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Get cached result if available and not expired"""
        if cache_key in self.cache:
            cached_data = self.cache[cache_key]
            if time.time() - cached_data['timestamp'] < self.cache_ttl:
                return cached_data['result']
            else:
                del self.cache[cache_key]
        
        return None
    
    def _cache_result(self, cache_key: str, result: Dict[str, Any]) -> None:
        """Cache result with timestamp"""
        self.cache[cache_key] = {
            'result': result,
            'timestamp': time.time()
        }
    
    def clear_cache(self) -> None:
        """Clear all cached results"""
        self.cache.clear()
        logger.info("Cleared enhanced topic decomposition cache")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        return {
            'cache_size': len(self.cache),
            'cache_ttl_seconds': self.cache_ttl,
            'cached_queries': list(self.cache.keys())
        }