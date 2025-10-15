"""
Content Idea Generator Service
Generates SEO-optimized blog ideas and software ideas based on keywords and subtopics
"""
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import json
import random

from ..core.llm_provider_config import llm_provider_config
from ..core.supabase_database_service import supabase

logger = logging.getLogger(__name__)

class ContentIdeaGenerator:
    def __init__(self):
        self.supabase = supabase
        
    async def generate_content_ideas(
        self,
        topic_id: str,
        topic_title: str,
        subtopics: List[str],
        keywords: List[str],
        user_id: str,
        content_types: List[str] = None
    ) -> Dict[str, Any]:
        """
        Generate both blog and software ideas based on subtopics and keywords
        """
        if content_types is None:
            content_types = ['blog', 'software']

        try:
            logger.info(f"Generating content ideas for topic: {topic_title}")
            logger.info(f"Subtopics: {subtopics}")
            logger.info(f"Keywords: {keywords[:10]}...")  # Log first 10 keywords
            logger.info(f"Content types: {content_types}")
            
            all_ideas = []
            
            # Generate blog ideas
            if 'blog' in content_types:
                logger.info("Generating blog ideas...")
                blog_ideas = await self._generate_blog_ideas(
                    topic_title, subtopics, keywords, topic_id, user_id
                )
                all_ideas.extend(blog_ideas)
                logger.info(f"Generated {len(blog_ideas)} blog ideas")

            # Generate software ideas
            if 'software' in content_types:
                logger.info("Generating software ideas...")
                software_ideas = await self._generate_software_ideas(
                    topic_title, subtopics, keywords, topic_id, user_id
                )
                all_ideas.extend(software_ideas)
                logger.info(f"Generated {len(software_ideas)} software ideas")

            logger.info(f"Total ideas generated: {len(all_ideas)}")

            # Save ideas to database
            if all_ideas:
                await self._save_ideas_to_database(all_ideas)

            return {
                "success": True,
                "total_ideas": len(all_ideas),
                "blog_ideas": len([i for i in all_ideas if i['content_type'] == 'blog']),
                "software_ideas": len([i for i in all_ideas if i['content_type'] == 'software']),
                "ideas": all_ideas
            }
            
        except Exception as e:
            logger.error(f"Failed to generate content ideas: {str(e)}")
            raise
    
    async def _generate_blog_ideas(
        self,
        topic_title: str,
        subtopics: List[str],
        keywords: List[str],
        topic_id: str,
        user_id: str
    ) -> List[Dict[str, Any]]:
        """Generate SEO-optimized blog ideas"""
        try:
            # For now, always use fallback to test the functionality
            logger.info("Using fallback blog ideas for testing")
            return self._generate_fallback_blog_ideas(topic_title, subtopics, keywords, topic_id, user_id)
            
        except Exception as e:
            logger.error(f"Failed to generate blog ideas: {str(e)}")
            return self._generate_fallback_blog_ideas(topic_title, subtopics, keywords, topic_id, user_id)

    async def _generate_software_ideas(
        self,
        topic_title: str,
        subtopics: List[str],
        keywords: List[str],
        topic_id: str,
        user_id: str
    ) -> List[Dict[str, Any]]:
        """Generate software-related ideas"""
        try:
            # For now, always use fallback to test the functionality
            logger.info("Using fallback software ideas for testing")
            return self._generate_fallback_software_ideas(topic_title, subtopics, keywords, topic_id, user_id)
            
        except Exception as e:
            logger.error(f"Failed to generate software ideas: {str(e)}")
            return self._generate_fallback_software_ideas(topic_title, subtopics, keywords, topic_id, user_id)

    def _generate_fallback_blog_ideas(
        self, 
        topic_title: str,
        subtopics: List[str],
        keywords: List[str],
        topic_id: str,
        user_id: str
    ) -> List[Dict[str, Any]]:
        """Generate fallback blog ideas when LLM is not available"""
        logger.info(f"Generating fallback blog ideas for topic: {topic_title}")
        logger.info(f"Subtopics: {subtopics}")
        ideas = []
            
        # Generate 10+ ideas per subtopic
        for subtopic in subtopics:
            # Create diverse blog idea templates
            blog_templates = [
                {
                    "title": f"The Complete Guide to {subtopic}",
                    "description": f"Everything you need to know about {subtopic} in {topic_title}. This comprehensive guide covers the basics, advanced techniques, and practical tips.",
                    "content_angle": "Comprehensive guide approach",
                    "difficulty": "hard",
                    "audience": "intermediate"
                },
                {
                    "title": f"10 Essential {subtopic} Tips for Beginners",
                    "description": f"Master the fundamentals of {subtopic} with these proven tips and strategies. Perfect for newcomers to {topic_title}.",
                    "content_angle": "Beginner-friendly tips",
                    "difficulty": "easy",
                    "audience": "beginners"
                },
                {
                    "title": f"Advanced {subtopic} Strategies That Actually Work",
                    "description": f"Take your {subtopic} skills to the next level with these advanced techniques used by professionals in {topic_title}.",
                    "content_angle": "Advanced techniques",
                    "difficulty": "hard",
                    "audience": "advanced"
                },
                {
                    "title": f"Common {subtopic} Mistakes to Avoid",
                    "description": f"Learn from the most common {subtopic} mistakes and how to avoid them. Essential reading for anyone interested in {topic_title}.",
                    "content_angle": "Mistake prevention",
                    "difficulty": "medium",
                    "audience": "intermediate"
                },
                {
                    "title": f"The Ultimate {subtopic} Checklist",
                    "description": f"A step-by-step checklist for {subtopic} success. Use this as your go-to reference for {topic_title} projects.",
                    "content_angle": "Actionable checklist",
                    "difficulty": "easy",
                    "audience": "beginners"
                },
                {
                    "title": f"How to Choose the Right {subtopic} Tools",
                    "description": f"Navigate the overwhelming world of {subtopic} tools with this comprehensive comparison and selection guide for {topic_title}.",
                    "content_angle": "Tool selection guide",
                    "difficulty": "medium",
                    "audience": "intermediate"
                },
                {
                    "title": f"{subtopic} Trends to Watch in 2024",
                    "description": f"Stay ahead of the curve with the latest {subtopic} trends and innovations in {topic_title}. Future-proof your knowledge.",
                    "content_angle": "Trend analysis",
                    "difficulty": "medium",
                    "audience": "advanced"
                },
                {
                    "title": f"Case Study: Successful {subtopic} Implementation",
                    "description": f"Real-world case study showing how {subtopic} was successfully implemented in a {topic_title} project. Learn from actual results.",
                    "content_angle": "Case study analysis",
                    "difficulty": "hard",
                    "audience": "advanced"
                },
                {
                    "title": f"Budget-Friendly {subtopic} Solutions",
                    "description": f"Get started with {subtopic} without breaking the bank. Affordable options and free resources for {topic_title} enthusiasts.",
                    "content_angle": "Budget-conscious approach",
                    "difficulty": "easy",
                    "audience": "beginners"
                },
                {
                    "title": f"The Psychology of {subtopic} Success",
                    "description": f"Understand the mental aspects and mindset needed for {subtopic} success in {topic_title}. Beyond just technical skills.",
                    "content_angle": "Psychological approach",
                    "difficulty": "medium",
                    "audience": "intermediate"
                }
            ]
            
            # Generate ideas for this subtopic
            for template in blog_templates:
                # Select relevant keywords for this idea
                relevant_keywords = self._select_relevant_keywords(keywords, subtopic, template["title"])
                
                idea = {
                    "title": template["title"],
                    "description": template["description"],
                    "content_type": "blog",
                    "category": "seo_optimized",
                    "subtopic": subtopic,
                    "topic_id": topic_id,
                    "user_id": user_id,
                    "keywords": relevant_keywords,
                    "seo_score": random.randint(75, 95),
                    "difficulty_level": template["difficulty"],
                    "estimated_read_time": random.randint(5, 20),
                    "target_audience": template["audience"],
                    "content_angle": template["content_angle"],
                    "monetization_potential": random.choice(["low", "medium", "high"])
                }
                ideas.append(idea)
            
        return ideas
            
    def _select_relevant_keywords(self, keywords: List[str], subtopic: str, title: str) -> List[str]:
        """Select the most relevant keywords for a specific idea"""
        # Simple keyword selection based on relevance
        relevant_keywords = []
        
        # Always include the subtopic as a keyword
        if subtopic.lower() not in [k.lower() for k in relevant_keywords]:
            relevant_keywords.append(subtopic)
        
        # Add keywords that appear in the title
        title_words = title.lower().split()
        for keyword in keywords[:10]:  # Check first 10 keywords
            if any(word in keyword.lower() for word in title_words):
                relevant_keywords.append(keyword)
                if len(relevant_keywords) >= 5:  # Limit to 5 keywords
                    break
        
        # Fill remaining slots with random keywords
        while len(relevant_keywords) < 3 and len(relevant_keywords) < len(keywords):
            remaining_keywords = [k for k in keywords if k not in relevant_keywords]
            if remaining_keywords:
                relevant_keywords.append(random.choice(remaining_keywords))
        
        return relevant_keywords[:5]  # Return max 5 keywords

    def _generate_fallback_software_ideas(
        self, 
        topic_title: str,
        subtopics: List[str],
        keywords: List[str],
        topic_id: str,
        user_id: str
    ) -> List[Dict[str, Any]]:
        """Generate fallback software ideas when LLM is not available"""
        logger.info(f"Generating fallback software ideas for topic: {topic_title}")
        logger.info(f"Subtopics: {subtopics}")
        ideas = []
        
        # Generate 10+ ideas per subtopic
        for subtopic in subtopics:
            # Create diverse software idea templates
            software_templates = [
                {
                    "title": f"{subtopic.title()} Management Platform",
                    "description": f"A comprehensive platform for managing {subtopic} in {topic_title}. Features include automation, analytics, and user-friendly interface.",
                    "category": "web_app",
                    "complexity": "high",
                    "effort": "high",
                    "demand": "high",
                    "audience": "enterprise",
                    "angle": "Enterprise-grade management solution"
                },
                {
                    "title": f"Smart {subtopic.title()} Assistant",
                    "description": f"An AI-powered assistant that helps users with {subtopic} tasks in {topic_title}. Uses machine learning to provide personalized recommendations.",
                    "category": "mobile_app",
                    "complexity": "high",
                    "effort": "high",
                    "demand": "medium",
                    "audience": "professionals",
                    "angle": "AI-powered personalization"
                },
                {
                    "title": f"{subtopic.title()} Quick Tools",
                    "description": f"A collection of simple, focused tools for common {subtopic} tasks in {topic_title}. Perfect for beginners and quick projects.",
                    "category": "desktop_tool",
                    "complexity": "low",
                    "effort": "low",
                    "demand": "high",
                    "audience": "beginners",
                    "angle": "Simple and accessible"
                },
                {
                    "title": f"{subtopic.title()} Analytics Dashboard",
                    "description": f"Visualize and analyze {subtopic} data with this powerful dashboard. Track trends, performance, and insights in {topic_title}.",
                    "category": "web_app",
                    "complexity": "medium",
                    "effort": "medium",
                    "demand": "high",
                    "audience": "professionals",
                    "angle": "Data visualization and insights"
                },
                {
                    "title": f"{subtopic.title()} API Service",
                    "description": f"RESTful API service for {subtopic} functionality. Integrate {subtopic} capabilities into any {topic_title} application.",
                    "category": "api_service",
                    "complexity": "medium",
                    "effort": "medium",
                    "demand": "medium",
                    "audience": "developers",
                    "angle": "Developer-focused integration"
                },
                {
                    "title": f"{subtopic.title()} Mobile App",
                    "description": f"Native mobile app for {subtopic} on the go. Access {subtopic} features anywhere with this intuitive mobile interface.",
                    "category": "mobile_app",
                    "complexity": "medium",
                    "effort": "high",
                    "demand": "high",
                    "audience": "professionals",
                    "angle": "Mobile-first experience"
                },
                {
                    "title": f"{subtopic.title()} Automation Bot",
                    "description": f"Automate repetitive {subtopic} tasks with this intelligent bot. Save time and reduce errors in {topic_title} workflows.",
                    "category": "desktop_tool",
                    "complexity": "high",
                    "effort": "high",
                    "demand": "medium",
                    "audience": "enterprise",
                    "angle": "Workflow automation"
                },
                {
                    "title": f"{subtopic.title()} Learning Platform",
                    "description": f"Interactive learning platform for mastering {subtopic} in {topic_title}. Includes tutorials, exercises, and progress tracking.",
                    "category": "web_app",
                    "complexity": "medium",
                    "effort": "high",
                    "demand": "high",
                    "audience": "beginners",
                    "angle": "Educational focus"
                },
                {
                    "title": f"{subtopic.title()} Marketplace",
                    "description": f"Connect buyers and sellers in the {subtopic} space. A marketplace platform for {topic_title} professionals and enthusiasts.",
                    "category": "web_app",
                    "complexity": "high",
                    "effort": "high",
                    "demand": "medium",
                    "audience": "professionals",
                    "angle": "Community-driven marketplace"
                },
                {
                    "title": f"{subtopic.title()} Chrome Extension",
                    "description": f"Browser extension that enhances {subtopic} workflows. Add {subtopic} functionality to any website in {topic_title}.",
                    "category": "browser_extension",
                    "complexity": "low",
                    "effort": "low",
                    "demand": "medium",
                    "audience": "professionals",
                    "angle": "Browser integration"
                }
            ]
            
            # Generate ideas for this subtopic
            for template in software_templates:
                # Select relevant keywords for this idea
                relevant_keywords = self._select_relevant_keywords(keywords, subtopic, template["title"])
                
                idea = {
                    "title": template["title"],
                    "description": template["description"],
                    "content_type": "software",
                    "category": template["category"],
                    "subtopic": subtopic,
                    "topic_id": topic_id,
                    "user_id": user_id,
                    "keywords": relevant_keywords,
                    "seo_score": 0,  # Not applicable for software
                    "difficulty_level": template["complexity"],
                    "estimated_read_time": None,  # Not applicable for software
                    "target_audience": template["audience"],
                    "content_angle": template["angle"],
                    "monetization_potential": random.choice(["low", "medium", "high"]),
                    "technical_complexity": template["complexity"],
                    "development_effort": template["effort"],
                    "market_demand": template["demand"]
                }
                ideas.append(idea)

        return ideas

    async def _save_ideas_to_database(self, ideas: List[Dict[str, Any]]) -> None:
        """Save generated ideas to the database"""
        try:
            if not ideas:
                return

            # Insert ideas into database
            result = self.supabase.table('content_ideas').insert(ideas).execute()
            
            if result.data:
                logger.info(f"Successfully saved {len(result.data)} content ideas to database")
            else:
                logger.error(f"Failed to save content ideas: {result}")
            
        except Exception as e:
            logger.error(f"Failed to save ideas to database: {str(e)}")
    
    async def get_content_ideas(
        self, 
        topic_id: str,
        user_id: str,
        content_type: str = None
    ) -> List[Dict[str, Any]]:
        """Retrieve content ideas from database"""
        try:
            query = self.supabase.table('content_ideas').select('*').eq('topic_id', topic_id).eq('user_id', user_id)
            
            if content_type:
                query = query.eq('content_type', content_type)
            
            result = query.order('created_at', desc=True).execute()
            
            return result.data or []
            
        except Exception as e:
            logger.error(f"Failed to retrieve content ideas: {str(e)}")
            return []

    async def delete_all_content_ideas_for_topic(
        self,
        topic_id: str,
        user_id: str
    ) -> bool:
        """Delete all content ideas for a specific topic and user"""
        try:
            response = self.supabase.table("content_ideas").delete().eq("topic_id", topic_id).eq("user_id", user_id).execute()
            logger.info(f"Deleted content ideas for topic {topic_id} and user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete content ideas: {str(e)}")
            return False