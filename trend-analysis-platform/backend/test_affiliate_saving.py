#!/usr/bin/env python3
"""
Test script to verify affiliate data saving to Titles table
This will test the full flow step by step
"""

import os
import sys
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get Supabase credentials
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

if not supabase_url or not supabase_key:
    print("❌ Missing Supabase credentials")
    sys.exit(1)

# Initialize Supabase client
supabase = create_client(supabase_url, supabase_key)

def test_step_1_check_affiliate_programs():
    """Step 1: Check if affiliate_programs table has data"""
    print("\n" + "="*60)
    print("STEP 1: Check if affiliate_programs table has data")
    print("="*60)
    
    try:
        result = supabase.table("affiliate_programs").select("*").limit(10).execute()
        
        if not result.data or len(result.data) == 0:
            print("❌ No affiliate programs found in database")
            return False, []
        
        print(f"✅ Found {len(result.data)} affiliate programs")
        print("\nSample programs:")
        for program in result.data[:3]:
            print(f"  - {program.get('program_name', 'N/A')} ({program.get('company_name', 'N/A')})")
        
        return True, result.data
    except Exception as e:
        print(f"❌ Error checking affiliate_programs: {e}")
        return False, []

def test_step_2_extract_keywords():
    """Step 2: Simulate keyword extraction from a content idea"""
    print("\n" + "="*60)
    print("STEP 2: Extract keywords from content idea")
    print("="*60)
    
    # Sample content idea
    test_idea = {
        "id": "test-idea-123",
        "title": "Best eco-friendly running shoes for marathon training",
        "description": "A comprehensive guide to sustainable running footwear",
        "primary_keywords": ["eco-friendly running shoes", "sustainable footwear", "marathon training"],
        "secondary_keywords": ["running gear", "environmental sports equipment"],
        "keywords": ["running shoes", "eco-friendly", "marathon", "sustainable", "athletic footwear"]
    }
    
    # Extract keywords like the frontend does
    primary_keywords = test_idea.get('primary_keywords', [])
    secondary_keywords = test_idea.get('secondary_keywords', [])
    allKeywords = test_idea.get('keywords', [])
    
    # Combine all keywords
    keywordSet = set(primary_keywords + secondary_keywords + allKeywords)
    keywords = ', '.join(keywordSet)
    
    print(f"✅ Keywords extracted: {keywords}")
    print(f"   Total keywords: {len(keywordSet)}")
    
    return keywords, keywordSet

def test_step_3_match_affiliate_programs(keywords, programs):
    """Step 3: Match keywords to affiliate programs"""
    print("\n" + "="*60)
    print("STEP 3: Match keywords to affiliate programs")
    print("="*60)
    
    keyword_terms = [k.strip() for k in keywords.lower().split(',') if k.strip()]
    matching_programs = []
    
    for program in programs:
        program_name = (program.get('program_name') or '').lower()
        company_name = (program.get('company_name') or '').lower()
        description = (program.get('description') or '').lower()
        
        # Check if any keyword term matches
        for term in keyword_terms:
            term_lower = term.lower()
            if (term_lower in program_name or 
                term_lower in company_name or 
                term_lower in description):
                matching_programs.append(program)
                break
    
    print(f"✅ Found {len(matching_programs)} matching programs")
    if matching_programs:
        print("\nMatching programs:")
        for program in matching_programs:
            print(f"  - {program.get('program_name')} (ID: {program.get('id')})")
    
    return matching_programs

def test_step_4_create_title_record(matching_programs):
    """Step 4: Create title record with affiliate data"""
    print("\n" + "="*60)
    print("STEP 4: Create title record structure")
    print("="*60)
    
    # Simulate the structure created by titlesPublishService
    affiliateProgramIds = [p.get('id') for p in matching_programs]
    
    affiliateOpportunities = {}
    if affiliateProgramIds:
        affiliateOpportunities = {
            "matching_programs": len(matching_programs),
            "program_ids": affiliateProgramIds,
            "keywords_matched": "eco-friendly running shoes, sustainable footwear, marathon training",
            "programs": [{
                "id": p.get('id'),
                "name": p.get('program_name'),
                "company": p.get('company_name'),
                "description": p.get('description'),
                "commission_rate": p.get('commission_rate'),
                "status": p.get('status')
            } for p in matching_programs]
        }
    
    # Simulate the old (broken) way
    old_affiliate_opportunities = str(affiliateOpportunities) if affiliateOpportunities else None
    
    # Simulate the new (fixed) way - object passed directly
    new_affiliate_opportunities = affiliateOpportunities if affiliateOpportunities else None
    
    print(f"✅ affiliate_program_ids: {affiliateProgramIds}")
    print(f"✅ Old way (stringified): {type(old_affiliate_opportunities).__name__} - Length: {len(str(old_affiliate_opportunities))} chars")
    print(f"✅ New way (object): {type(new_affiliate_opportunities).__name__}")
    
    if new_affiliate_opportunities:
        print(f"\nAffiliate opportunities structure:")
        print(f"  - matching_programs: {new_affiliate_opportunities.get('matching_programs')}")
        print(f"  - program_ids count: {len(new_affiliate_opportunities.get('program_ids', []))}")
        print(f"  - programs count: {len(new_affiliate_opportunities.get('programs', []))}")
    
    return new_affiliate_opportunities

def test_step_5_check_titles_table():
    """Step 5: Check existing Titles records"""
    print("\n" + "="*60)
    print("STEP 5: Check existing Titles records for affiliate data")
    print("="*60)
    
    try:
        result = supabase.table("Titles").select(
            "id, Title, affiliate_program_ids, affiliate_opportunities, monetization_score"
        ).order("dateCreatedOn", desc=True).limit(5).execute()
        
        if not result.data or len(result.data) == 0:
            print("❌ No Titles records found")
            return
        
        print(f"✅ Found {len(result.data)} recent Titles records")
        
        for title in result.data:
            print(f"\nTitle: {title.get('Title')}")
            print(f"  affiliate_program_ids: {title.get('affiliate_program_ids')}")
            print(f"  monetization_score: {title.get('monetization_score')}")
            
            opp = title.get('affiliate_opportunities')
            if opp:
                print(f"  affiliate_opportunities type: {type(opp).__name__}")
                if isinstance(opp, str):
                    print(f"  ⚠️  IS A STRING (BROKEN) - Length: {len(opp)} chars")
                    print(f"  First 200 chars: {opp[:200]}")
                else:
                    print(f"  ✅ IS AN OBJECT (FIXED)")
                    if isinstance(opp, dict):
                        print(f"  matching_programs: {opp.get('matching_programs', 'N/A')}")
            else:
                print(f"  affiliate_opportunities: null")
                
    except Exception as e:
        print(f"❌ Error checking Titles table: {e}")

def main():
    print("\n" + "🔍 " + "="*58)
    print("🔍 AFFILIATE SAVING TEST - Step by Step Verification")
    print("🔍 " + "="*58)
    
    # Step 1: Check affiliate programs
    has_programs, programs = test_step_1_check_affiliate_programs()
    if not has_programs:
        print("\n⚠️  Cannot proceed - no affiliate programs in database")
        print("   You need to populate the affiliate_programs table first")
        return
    
    # Step 2: Extract keywords
    keywords, keyword_set = test_step_2_extract_keywords()
    
    # Step 3: Match programs
    matching_programs = test_step_3_match_affiliate_programs(keywords, programs)
    
    # Step 4: Create title record
    affiliate_opportunities = test_step_4_create_title_record(matching_programs)
    
    # Step 5: Check existing Titles
    test_step_5_check_titles_table()
    
    print("\n" + "="*60)
    print("✅ TEST COMPLETE")
    print("="*60)
    print("\nNext steps:")
    print("1. If affiliate_programs table is empty, populate it with data")
    print("2. Test publishing an idea from the frontend")
    print("3. Check the Titles table to verify affiliate data was saved")
    print()

if __name__ == "__main__":
    main()

