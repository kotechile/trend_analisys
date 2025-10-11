#!/usr/bin/env python3
"""
Integration test script for research topics dataflow persistence
This script tests the complete integration of models, services, and API
"""

import asyncio
import os
import sys
from uuid import UUID
from datetime import datetime

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.services.supabase_service import get_supabase_service
from src.services.research_topic_service import ResearchTopicService
from src.services.topic_decomposition_service import TopicDecompositionService
from src.services.trend_analysis_service import TrendAnalysisService
from src.services.content_idea_service import ContentIdeaService
from src.models.research_topic import ResearchTopicCreate, ResearchTopicStatus
from src.models.topic_decomposition import TopicDecompositionCreate, SubtopicItem
from src.models.trend_analysis import TrendAnalysisCreate, TrendAnalysisStatus
from src.models.content_idea import ContentIdeaCreate, ContentType, IdeaType, ContentStatus


async def test_database_connection():
    """Test database connection"""
    print("🔌 Testing database connection...")
    
    try:
        supabase_service = get_supabase_service()
        client = supabase_service.get_client()
        
        # Test basic connection
        result = client.table("users").select("id").limit(1).execute()
        print("✅ Database connection successful")
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False


async def test_research_topic_operations():
    """Test research topic operations"""
    print("\n📚 Testing research topic operations...")
    
    try:
        service = ResearchTopicService()
        test_user_id = UUID("123e4567-e89b-12d3-a456-426614174000")
        
        # Create a test research topic
        topic_data = ResearchTopicCreate(
            title="Test Integration Topic",
            description="Testing the complete dataflow integration",
            status=ResearchTopicStatus.ACTIVE
        )
        
        print("  Creating research topic...")
        topic = await service.create(topic_data, test_user_id)
        
        if topic:
            print(f"  ✅ Created topic: {topic.title} (ID: {topic.id})")
            
            # Test getting the topic
            print("  Retrieving research topic...")
            retrieved_topic = await service.get_by_id(topic.id, test_user_id)
            
            if retrieved_topic:
                print(f"  ✅ Retrieved topic: {retrieved_topic.title}")
                return topic.id
            else:
                print("  ❌ Failed to retrieve topic")
                return None
        else:
            print("  ❌ Failed to create topic")
            return None
            
    except Exception as e:
        print(f"  ❌ Research topic operations failed: {e}")
        return None


async def test_topic_decomposition_operations(topic_id: UUID):
    """Test topic decomposition operations"""
    print("\n🔍 Testing topic decomposition operations...")
    
    try:
        service = TopicDecompositionService()
        test_user_id = UUID("123e4567-e89b-12d3-a456-426614174000")
        
        # Create subtopics
        decomposition_data = TopicDecompositionCreate(
            research_topic_id=topic_id,
            search_query="test integration topic",
            subtopics=[
                SubtopicItem(
                    name="test integration topic",
                    description="Main topic for testing"
                ),
                SubtopicItem(
                    name="database integration",
                    description="Testing database operations"
                ),
                SubtopicItem(
                    name="api integration",
                    description="Testing API endpoints"
                )
            ],
            original_topic_included=True
        )
        
        print("  Creating topic decomposition...")
        decomposition = await service.create_subtopics(topic_id, decomposition_data, test_user_id)
        
        if decomposition:
            print(f"  ✅ Created decomposition with {len(decomposition.subtopics)} subtopics")
            return decomposition.id
        else:
            print("  ❌ Failed to create decomposition")
            return None
            
    except Exception as e:
        print(f"  ❌ Topic decomposition operations failed: {e}")
        return None


async def test_trend_analysis_operations(decomposition_id: UUID):
    """Test trend analysis operations"""
    print("\n📊 Testing trend analysis operations...")
    
    try:
        service = TrendAnalysisService()
        test_user_id = UUID("123e4567-e89b-12d3-a456-426614174000")
        
        # Create trend analysis
        analysis_data = TrendAnalysisCreate(
            topic_decomposition_id=decomposition_id,
            subtopic_name="database integration",
            analysis_name="Database Integration Trend Analysis",
            description="Analysis of database integration trends",
            keywords=["database", "integration", "supabase"],
            timeframe="12m",
            geo="US",
            status=TrendAnalysisStatus.COMPLETED
        )
        
        print("  Creating trend analysis...")
        analysis = await service.create(analysis_data, test_user_id)
        
        if analysis:
            print(f"  ✅ Created analysis: {analysis.analysis_name} (ID: {analysis.id})")
            return analysis.id
        else:
            print("  ❌ Failed to create analysis")
            return None
            
    except Exception as e:
        print(f"  ❌ Trend analysis operations failed: {e}")
        return None


async def test_content_idea_operations(analysis_id: UUID, topic_id: UUID):
    """Test content idea operations"""
    print("\n💡 Testing content idea operations...")
    
    try:
        service = ContentIdeaService()
        test_user_id = UUID("123e4567-e89b-12d3-a456-426614174000")
        
        # Create content idea
        idea_data = ContentIdeaCreate(
            trend_analysis_id=analysis_id,
            research_topic_id=topic_id,
            title="Complete Guide to Database Integration",
            description="A comprehensive guide covering database integration best practices",
            content_type=ContentType.GUIDE,
            idea_type=IdeaType.EVERGREEN,
            primary_keyword="database integration",
            secondary_keywords=["supabase", "api integration"],
            target_audience="developers",
            key_points=[
                "Understanding database connections",
                "Implementing proper error handling",
                "Testing database operations"
            ],
            tags=["database", "integration", "tutorial"],
            estimated_read_time=15,
            difficulty_level="intermediate",
            status=ContentStatus.DRAFT
        )
        
        print("  Creating content idea...")
        idea = await service.create(idea_data, test_user_id)
        
        if idea:
            print(f"  ✅ Created content idea: {idea.title} (ID: {idea.id})")
            return idea.id
        else:
            print("  ❌ Failed to create content idea")
            return None
            
    except Exception as e:
        print(f"  ❌ Content idea operations failed: {e}")
        return None


async def test_complete_dataflow(topic_id: UUID):
    """Test complete dataflow retrieval"""
    print("\n🔄 Testing complete dataflow retrieval...")
    
    try:
        service = ResearchTopicService()
        test_user_id = UUID("123e4567-e89b-12d3-a456-426614174000")
        
        print("  Retrieving complete dataflow...")
        dataflow = await service.get_complete_dataflow(topic_id, test_user_id)
        
        if dataflow:
            print(f"  ✅ Retrieved complete dataflow:")
            print(f"    - Research Topic: {dataflow.title}")
            print(f"    - Subtopics: {len(dataflow.subtopics)}")
            print(f"    - Trend Analyses: {len(dataflow.trend_analyses)}")
            print(f"    - Content Ideas: {len(dataflow.content_ideas)}")
            return True
        else:
            print("  ❌ Failed to retrieve complete dataflow")
            return False
            
    except Exception as e:
        print(f"  ❌ Complete dataflow test failed: {e}")
        return False


async def cleanup_test_data(topic_id: UUID):
    """Clean up test data"""
    print("\n🧹 Cleaning up test data...")
    
    try:
        service = ResearchTopicService()
        test_user_id = UUID("123e4567-e89b-12d3-a456-426614174000")
        
        print("  Deleting test research topic...")
        success = await service.delete(topic_id, test_user_id)
        
        if success:
            print("  ✅ Test data cleaned up successfully")
        else:
            print("  ⚠️  Failed to clean up test data")
            
    except Exception as e:
        print(f"  ⚠️  Cleanup failed: {e}")


async def main():
    """Main test function"""
    print("🚀 Starting Research Topics Integration Test")
    print("=" * 50)
    
    # Test database connection
    if not await test_database_connection():
        print("\n❌ Integration test failed: Database connection failed")
        return
    
    # Test research topic operations
    topic_id = await test_research_topic_operations()
    if not topic_id:
        print("\n❌ Integration test failed: Research topic operations failed")
        return
    
    # Test topic decomposition operations
    decomposition_id = await test_topic_decomposition_operations(topic_id)
    if not decomposition_id:
        print("\n❌ Integration test failed: Topic decomposition operations failed")
        await cleanup_test_data(topic_id)
        return
    
    # Test trend analysis operations
    analysis_id = await test_trend_analysis_operations(decomposition_id)
    if not analysis_id:
        print("\n❌ Integration test failed: Trend analysis operations failed")
        await cleanup_test_data(topic_id)
        return
    
    # Test content idea operations
    idea_id = await test_content_idea_operations(analysis_id, topic_id)
    if not idea_id:
        print("\n❌ Integration test failed: Content idea operations failed")
        await cleanup_test_data(topic_id)
        return
    
    # Test complete dataflow
    if not await test_complete_dataflow(topic_id):
        print("\n❌ Integration test failed: Complete dataflow test failed")
        await cleanup_test_data(topic_id)
        return
    
    # Clean up test data
    await cleanup_test_data(topic_id)
    
    print("\n" + "=" * 50)
    print("✅ Integration test completed successfully!")
    print("All dataflow persistence features are working correctly.")


if __name__ == "__main__":
    asyncio.run(main())
