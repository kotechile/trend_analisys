#!/usr/bin/env python3
"""
Test httpx base_url behavior
"""

import asyncio
from httpx import AsyncClient

async def test_httpx_base_url():
    """Test httpx base_url behavior"""
    
    # Test with sandbox URL
    sandbox_url = "https://sandbox.dataforseo.com/v3"
    
    async with AsyncClient(base_url=sandbox_url) as client:
        # This should create a URL: https://sandbox.dataforseo.com/v3/dataforseo_labs/google/keyword_ideas/live
        endpoint = "/dataforseo_labs/google/keyword_ideas/live"
        full_url = client.build_request("POST", endpoint).url
        print(f"Full URL with base_url: {full_url}")
        
    # Test without base_url
    async with AsyncClient() as client:
        endpoint = "https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_ideas/live"
        full_url = client.build_request("POST", endpoint).url
        print(f"Full URL without base_url: {full_url}")

if __name__ == "__main__":
    asyncio.run(test_httpx_base_url())
