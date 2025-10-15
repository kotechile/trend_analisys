# Idea Burst Publish to Content Generation Guide

This guide explains how to use the new publish functionality in the Idea Burst tab to send selected ideas to the Content Generation "Titles" table.

## Overview

The Idea Burst tab now includes functionality to:
1. **Select specific ideas** using checkboxes
2. **Publish selected ideas** to the "Titles" table in Supabase
3. **View publish results** with success/error feedback

## How to Use

### 1. Generate Ideas
First, generate ideas using the existing Idea Burst functionality:
- Use seed keywords to generate ideas
- Upload AHREFS CSV file for enhanced ideas
- Apply filters to refine your results

### 2. Select Ideas for Publishing
- Each idea card now has a **checkbox** next to the title
- Check the boxes for ideas you want to publish to Content Generation
- Use **"Select All"** and **"Deselect All"** buttons for bulk selection
- The selection counter shows how many ideas are selected

### 3. Publish to Content Generation
- Click the **"Publish to Content Generation"** button
- A dialog will show the publishing progress
- Results will display success/error information
- Successfully published ideas will be cleared from selection

## Data Mapping

The service automatically maps Idea Burst data to the Titles table structure:

### Required Fields
- **Title**: From idea title
- **Keywords**: Combined primary and secondary keywords
- **userDescription**: From content outline descriptions

### Mapped Fields
- **content_format**: Mapped from content_type (article → how_to_guide, etc.)
- **difficulty_level**: Calculated from average_difficulty score
- **estimated_word_count**: Based on content type (articles: 2500 words, etc.)
- **estimated_reading_time**: Calculated from word count (200 words/minute)
- **Quality scores**: Mapped from SEO and traffic scores
- **Keyword data**: Preserved from original idea data

### Default Values
- **workflow_status**: "idea_selected"
- **status**: "NEW"
- **content_generated**: false
- **content_brief_generated**: false
- **Tone**: "professional"
- **postType**: "post"
- **published**: false

## Database Schema

The service writes to the "Titles" table with the following key fields:

```sql
-- Core fields
id, user_id, blog_idea_id, trend_analysis_id
Title, Keywords, userDescription

-- Content structure
content_format, difficulty_level, estimated_word_count
estimated_reading_time, target_audience

-- Quality scores
overall_quality_score, viral_potential_score, seo_optimization_score
audience_alignment_score, content_feasibility_score, business_impact_score

-- Keyword data
enhanced_primary_keywords, enhanced_secondary_keywords
keyword_research_data, keyword_research_enhanced
traffic_potential_score, competition_score

-- Workflow status
workflow_status, status, content_generated, content_brief_generated

-- Timestamps
dateCreatedOn, last_updated, updated_by

-- Metadata
generation_source, source_topic_id, source_opportunity_id
```

## Error Handling

The service includes comprehensive error handling:
- **Validation**: Checks for required user authentication
- **Selection validation**: Ensures at least one idea is selected
- **Database errors**: Captures and reports Supabase errors
- **Individual failures**: Continues processing even if some ideas fail
- **User feedback**: Shows detailed success/error messages

## Technical Details

### Service Architecture
- **titlesPublishService.ts**: Main service for publishing logic
- **IdeaBurstPage.tsx**: UI components and state management
- **Supabase integration**: Uses existing Supabase client

### State Management
- `selectedIdeasForPublish`: Set of selected idea IDs
- `isPublishing`: Loading state during publish operation
- `publishDialogOpen`: Controls publish result dialog
- `publishResult`: Stores publish operation results

### API Integration
- Uses Supabase client for database operations
- Implements proper error handling and retry logic
- Maintains data consistency with existing schema

## Troubleshooting

### Common Issues

1. **"You must be logged in to publish ideas"**
   - Ensure you're authenticated in the application
   - Check if user session is valid

2. **"Please select at least one idea to publish"**
   - Check the checkboxes next to ideas you want to publish
   - Use "Select All" if you want to publish all ideas

3. **Database errors**
   - Check Supabase connection
   - Verify "Titles" table exists with proper schema
   - Check user permissions for table access

4. **Partial publish failures**
   - Some ideas may fail while others succeed
   - Check the publish results dialog for specific error messages
   - Retry failed ideas individually

### Debug Information
- Check browser console for detailed error logs
- Publish results dialog shows specific error messages
- Snackbar notifications provide user feedback

## Future Enhancements

Potential improvements for the publish functionality:
- **Batch operations**: Publish multiple idea sets
- **Publish history**: Track previously published ideas
- **Draft mode**: Save selections without publishing
- **Custom mapping**: Allow users to customize field mappings
- **Export options**: Export published ideas to different formats
- **Integration**: Connect with other content generation tools

## Support

For issues or questions about the publish functionality:
1. Check this guide for common solutions
2. Review browser console for error details
3. Verify Supabase connection and permissions
4. Contact development team for technical support





