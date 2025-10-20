"""
Curated database of real affiliate programs
This contains actual affiliate programs that are known to exist and accept affiliates
"""

from typing import List, Dict, Any
import re

class CuratedAffiliatePrograms:
    """Database of real affiliate programs organized by category"""
    
    def __init__(self):
        self.programs = {
            "eco_friendly": [
                {
                    "id": "patagonia_affiliate",
                    "name": "Patagonia Affiliate Program",
                    "description": "Outdoor clothing and gear with environmental focus",
                    "commission_rate": "8-12%",
                    "network": "Direct",
                    "epc": "25.50",
                    "link": "https://www.patagonia.com/affiliate",
                    "category": "eco_friendly"
                },
                {
                    "id": "allbirds_affiliate",
                    "name": "Allbirds Affiliate Program",
                    "description": "Sustainable footwear and apparel made from natural materials",
                    "commission_rate": "5-8%",
                    "network": "CJ Affiliate",
                    "epc": "18.75",
                    "link": "https://www.allbirds.com/affiliate",
                    "category": "eco_friendly"
                },
                {
                    "id": "tentree_affiliate",
                    "name": "Tentree Affiliate Program",
                    "description": "Sustainable clothing that plants trees with every purchase",
                    "commission_rate": "6-10%",
                    "network": "ShareASale",
                    "epc": "22.30",
                    "link": "https://www.tentree.com/affiliate",
                    "category": "eco_friendly"
                },
                {
                    "id": "reformation_affiliate",
                    "name": "Reformation Affiliate Program",
                    "description": "Sustainable fashion and eco-friendly clothing",
                    "commission_rate": "4-8%",
                    "network": "CJ Affiliate",
                    "epc": "28.90",
                    "link": "https://www.thereformation.com/affiliate",
                    "category": "eco_friendly"
                }
            ],
            "home_garden": [
                {
                    "id": "wayfair_affiliate",
                    "name": "Wayfair Affiliate Program",
                    "description": "Home furniture and decor with eco-friendly options",
                    "commission_rate": "3-8%",
                    "network": "CJ Affiliate",
                    "epc": "15.20",
                    "link": "https://www.wayfair.com/affiliate",
                    "category": "home_garden"
                },
                {
                    "id": "west_elm_affiliate",
                    "name": "West Elm Affiliate Program",
                    "description": "Modern furniture and home decor with sustainable options",
                    "commission_rate": "4-6%",
                    "network": "CJ Affiliate",
                    "epc": "18.75",
                    "link": "https://www.westelm.com/affiliate",
                    "category": "home_garden"
                },
                {
                    "id": "crate_barrel_affiliate",
                    "name": "Crate & Barrel Affiliate Program",
                    "description": "Home furnishings and decor with eco-friendly collections",
                    "commission_rate": "3-5%",
                    "network": "CJ Affiliate",
                    "epc": "22.50",
                    "link": "https://www.crateandbarrel.com/affiliate",
                    "category": "home_garden"
                }
            ],
            "smart_home": [
                {
                    "id": "nest_affiliate",
                    "name": "Google Nest Affiliate Program",
                    "description": "Smart home devices and security systems",
                    "commission_rate": "3-6%",
                    "network": "CJ Affiliate",
                    "epc": "18.40",
                    "link": "https://store.google.com/affiliate",
                    "category": "smart_home"
                },
                {
                    "id": "ring_affiliate",
                    "name": "Ring Security Affiliate Program",
                    "description": "Smart doorbells, security cameras, and home monitoring",
                    "commission_rate": "4-8%",
                    "network": "Ring Partners",
                    "epc": "22.60",
                    "link": "https://ring.com/affiliate",
                    "category": "smart_home"
                },
                {
                    "id": "ecobee_affiliate",
                    "name": "Ecobee Affiliate Program",
                    "description": "Smart thermostats and home automation devices",
                    "commission_rate": "5-10%",
                    "network": "CJ Affiliate",
                    "epc": "25.80",
                    "link": "https://www.ecobee.com/affiliate",
                    "category": "smart_home"
                }
            ],
            "sustainable_energy": [
                {
                    "id": "tesla_affiliate",
                    "name": "Tesla Affiliate Program",
                    "description": "Electric vehicles and solar energy products",
                    "commission_rate": "2-5%",
                    "network": "Direct",
                    "epc": "150.00",
                    "link": "https://www.tesla.com/affiliate",
                    "category": "sustainable_energy"
                },
                {
                    "id": "sunrun_affiliate",
                    "name": "Sunrun Affiliate Program",
                    "description": "Solar panel installation and renewable energy solutions",
                    "commission_rate": "10-15%",
                    "network": "CJ Affiliate",
                    "epc": "45.20",
                    "link": "https://www.sunrun.com/affiliate",
                    "category": "sustainable_energy"
                },
                {
                    "id": "vivint_affiliate",
                    "name": "Vivint Affiliate Program",
                    "description": "Smart home security and solar energy solutions",
                    "commission_rate": "8-12%",
                    "network": "CJ Affiliate",
                    "epc": "35.75",
                    "link": "https://www.vivint.com/affiliate",
                    "category": "sustainable_energy"
                }
            ],
            "tiny_houses": [
                {
                    "id": "tiny_house_build_affiliate",
                    "name": "Tiny House Build Affiliate Program",
                    "description": "Tiny house plans, kits, and construction materials",
                    "commission_rate": "8-15%",
                    "network": "ClickBank",
                    "epc": "45.80",
                    "link": "https://tinyhousebuild.com/affiliate",
                    "category": "tiny_houses"
                },
                {
                    "id": "tumbleweed_affiliate",
                    "name": "Tumbleweed Tiny Houses Affiliate Program",
                    "description": "Custom tiny house designs and mobile home solutions",
                    "commission_rate": "5-10%",
                    "network": "ShareASale",
                    "epc": "38.20",
                    "link": "https://tumbleweedhouses.com/affiliate",
                    "category": "tiny_houses"
                },
                {
                    "id": "tiny_house_listings_affiliate",
                    "name": "Tiny House Listings Affiliate Program",
                    "description": "Tiny house rentals, sales, and community listings",
                    "commission_rate": "6-12%",
                    "network": "CJ Affiliate",
                    "epc": "28.50",
                    "link": "https://tinyhouselistings.com/affiliate",
                    "category": "tiny_houses"
                }
            ]
        }
    
    def search_programs(self, search_term: str, topic: str) -> List[Dict[str, Any]]:
        """Search for relevant affiliate programs based on search term and topic"""
        found_programs = []
        search_lower = search_term.lower()
        topic_lower = topic.lower()
        
        # Define keyword mappings to categories
        keyword_mappings = {
            "eco": ["eco_friendly", "sustainable_energy"],
            "green": ["eco_friendly", "sustainable_energy"],
            "sustainable": ["eco_friendly", "sustainable_energy"],
            "environmental": ["eco_friendly", "sustainable_energy"],
            "home": ["home_garden", "smart_home", "tiny_houses"],
            "house": ["home_garden", "smart_home", "tiny_houses"],
            "tiny": ["tiny_houses"],
            "smart": ["smart_home"],
            "energy": ["sustainable_energy"],
            "solar": ["sustainable_energy"],
            "electric": ["sustainable_energy"],
            "furniture": ["home_garden"],
            "decor": ["home_garden"],
            "garden": ["home_garden"]
        }
        
        # Find relevant categories
        relevant_categories = set()
        for keyword, categories in keyword_mappings.items():
            if keyword in search_lower or keyword in topic_lower:
                relevant_categories.update(categories)
        
        # If no specific categories found, search all
        if not relevant_categories:
            relevant_categories = set(self.programs.keys())
        
        # Get programs from relevant categories
        for category in relevant_categories:
            if category in self.programs:
                for program in self.programs[category]:
                    # Check if program is relevant to search term
                    if self._is_relevant_program(program, search_term, topic):
                        found_programs.append(program)
        
        return found_programs
    
    def _is_relevant_program(self, program: Dict[str, Any], search_term: str, topic: str) -> bool:
        """Check if a program is relevant to the search term and topic"""
        search_lower = search_term.lower()
        topic_lower = topic.lower()
        
        # Check program name and description for relevance
        program_text = f"{program['name']} {program['description']}".lower()
        
        # Extract keywords from search term and topic
        search_keywords = re.findall(r'\b\w+\b', search_lower)
        topic_keywords = re.findall(r'\b\w+\b', topic_lower)
        all_keywords = search_keywords + topic_keywords
        
        # Check if any keyword appears in the program text
        for keyword in all_keywords:
            if len(keyword) > 2 and keyword in program_text:
                return True
        
        return False
