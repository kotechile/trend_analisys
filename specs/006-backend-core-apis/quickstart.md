# Quickstart Guide: TrendTap

**Date**: 2025-10-02  
**Feature**: 006-backend-core-apis

## 5-Step Workflow (<15 min)

### Step 0: Seed
- Enter broad niche (e.g., "home coffee roasting")
- OR let AI scan existing blog for gaps

### Step 1: Monetisation First
- System queries 14 affiliate networks
- Returns top 10 programmes by EPC, reversal rate, cookie length
- User selects programmes to promote

### Step 2: Trend Validation
- Google Trends API + LLM extrapolation + social signals
- Outputs opportunity scores (0-100)
- User picks opportunities > 70

### Step 3: Idea Burst
- Generates 5 article angles + 3-5 software solutions
- CoSchedule-scored headlines with EEAT hooks
- Development complexity scores for software

### Step 4: Keyword Armoury
- Upload CSV from Ahrefs/SEMrush/Moz
- OR use DataForSEO crawling ($0.0008/line)
- Priority scoring and SERP analysis

### Step 5: Export
- One-click export to Google Docs/Notion/WordPress
- Software templates and development guides
- Content calendar scheduling

## Key APIs

- **Affiliate Research**: `/api/affiliate/*`
- **Trend Analysis**: `/api/trends/*`
- **Keyword Management**: `/api/keywords/*`
- **Content Generation**: `/api/content/*`
- **Export Integration**: `/api/export/*`
- **Calendar**: `/api/calendar/*`

## Performance
- API Response: <200ms
- Page Load: <2s
- Concurrent Users: 100+
- File Upload: <2s for 1MB

**Ready to start?** Begin with Step 0!