#!/usr/bin/env python3
"""
Check what endpoints are registered in the dataforseo router
"""

import sys
import os

# Add the backend src to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'trend-analysis-platform', 'backend', 'src'))

from routers.dataforseo_router import router

print("DataForSEO Router endpoints:")
for route in router.routes:
    print(f"  {route.methods} {route.path}")

print(f"\nTotal routes: {len(router.routes)}")
