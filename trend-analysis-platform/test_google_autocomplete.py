#!/usr/bin/env python3
"""
Test script for Google Autocomplete integration
Demonstrates how the enhanced topic decomposition works
"""

import asyncio
import aiohttp
import json
import time
from typing import List, Dict, Any

class GoogleAutocompleteTester:
    """Test class for Google Autocomplete functionality"""
    
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.test_queries = [
            "fitness equipment",
            "digital marketing",
            "home improvement",
            "cooking tools",
            "pet care"
        ]
    
    async def test_autocomplete_endpoint(self, query: str) -> Dict[str, Any]:
        """Test the autocomplete endpoint directly"""
        try:
            async with aiohttp.ClientSession() as session:
                url = f"{self.base_url}/api/enhanced-topics/autocomplete/{query}"
                async with session.get(url) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        return {"error": f"HTTP {response.status}"}
        except Exception as e:
            return {"error": str(e)}
    
    async def test_enhanced_decomposition(self, query: str) -> Dict[str, Any]:
        """Test the enhanced topic decomposition"""
        try:
            async with aiohttp.ClientSession() as session:
                url = f"{self.base_url}/api/enhanced-topics/decompose"
                payload = {
                    "search_query": query,
                    "user_id": "test_user",
                    "max_subtopics": 6,
                    "use_autocomplete": True,
                    "use_llm": True
                }
                async with session.post(url, json=payload) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        return {"error": f"HTTP {response.status}"}
        except Exception as e:
            return {"error": str(e)}
    
    async def test_method_comparison(self, query: str) -> Dict[str, Any]:
        """Test the method comparison endpoint"""
        try:
            async with aiohttp.ClientSession() as session:
                url = f"{self.base_url}/api/enhanced-topics/compare-methods"
                payload = {
                    "search_query": query,
                    "user_id": "test_user",
                    "max_subtopics": 6
                }
                async with session.post(url, json=payload) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        return {"error": f"HTTP {response.status}"}
        except Exception as e:
            return {"error": str(e)}
    
    def print_results(self, title: str, results: Dict[str, Any]):
        """Print formatted results"""
        print(f"\n{'='*60}")
        print(f"📊 {title}")
        print(f"{'='*60}")
        
        if "error" in results:
            print(f"❌ Error: {results['error']}")
            return
        
        if "suggestions" in results:
            print(f"🔍 Query: {results.get('query', 'N/A')}")
            print(f"📈 Total suggestions: {results.get('total_suggestions', 0)}")
            print(f"⏱️  Processing time: {results.get('processing_time', 0):.2f}s")
            print(f"\n💡 Top suggestions:")
            for i, suggestion in enumerate(results.get('suggestions', [])[:10], 1):
                print(f"   {i:2d}. {suggestion}")
        
        elif "subtopics" in results:
            print(f"🎯 Original query: {results.get('original_query', 'N/A')}")
            print(f"📊 Subtopics found: {len(results.get('subtopics', []))}")
            print(f"⏱️  Processing time: {results.get('processing_time', 0):.2f}s")
            print(f"🔧 Methods used: {', '.join(results.get('enhancement_methods', []))}")
            print(f"\n📝 Enhanced subtopics:")
            for i, subtopic in enumerate(results.get('subtopics', []), 1):
                print(f"   {i:2d}. {subtopic.get('title', 'N/A')}")
                print(f"       Source: {subtopic.get('source', 'N/A')}")
                print(f"       Score: {subtopic.get('relevance_score', 0):.2f}")
                if subtopic.get('search_volume_indicators'):
                    print(f"       Indicators: {', '.join(subtopic['search_volume_indicators'])}")
                print()
        
        elif "comparison" in results:
            print(f"🔍 Query: {results.get('original_query', 'N/A')}")
            print(f"\n📊 Method Comparison:")
            for method, data in results.get('comparison', {}).items():
                print(f"\n   {data.get('method', method)}:")
                print(f"   ⏱️  Time: {data.get('processing_time', 0):.2f}s")
                print(f"   📝 Subtopics:")
                for i, subtopic in enumerate(data.get('subtopics', []), 1):
                    print(f"      {i:2d}. {subtopic}")
    
    async def run_comprehensive_test(self):
        """Run comprehensive tests on all endpoints"""
        print("🚀 Starting Google Autocomplete Integration Tests")
        print("="*60)
        
        for query in self.test_queries:
            print(f"\n🧪 Testing with query: '{query}'")
            
            # Test 1: Direct autocomplete
            print("\n1️⃣ Testing direct autocomplete...")
            autocomplete_results = await self.test_autocomplete_endpoint(query)
            self.print_results("Google Autocomplete Results", autocomplete_results)
            
            # Test 2: Enhanced decomposition
            print("\n2️⃣ Testing enhanced decomposition...")
            decomposition_results = await self.test_enhanced_decomposition(query)
            self.print_results("Enhanced Topic Decomposition", decomposition_results)
            
            # Test 3: Method comparison
            print("\n3️⃣ Testing method comparison...")
            comparison_results = await self.test_method_comparison(query)
            self.print_results("Method Comparison", comparison_results)
            
            print("\n" + "="*60)
            await asyncio.sleep(1)  # Rate limiting
    
    async def run_quick_test(self):
        """Run a quick test with a single query"""
        query = "fitness equipment"
        print(f"🧪 Quick test with query: '{query}'")
        
        # Test enhanced decomposition
        results = await self.test_enhanced_decomposition(query)
        self.print_results("Enhanced Topic Decomposition", results)

async def main():
    """Main test function"""
    tester = GoogleAutocompleteTester()
    
    print("Google Autocomplete Integration Test")
    print("="*50)
    print("Make sure your backend server is running on http://localhost:8000")
    print("="*50)
    
    try:
        # Run quick test first
        await tester.run_quick_test()
        
        # Ask if user wants full test
        print("\n" + "="*50)
        response = input("Run full comprehensive test? (y/n): ").lower().strip()
        if response == 'y':
            await tester.run_comprehensive_test()
        
        print("\n✅ Testing completed!")
        
    except KeyboardInterrupt:
        print("\n⏹️  Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")

if __name__ == "__main__":
    asyncio.run(main())

