# Database Usage Documentation

This document outlines the database tables and how they are used by the backend.

## Tables Used by the Frontend

This section describes the tables that are directly or indirectly used by the frontend application.

### `research_topics`

*   **Purpose:** Stores the main research topics that users create.
*   **Backend Interaction:** The `research_topic_service` in `backend/src/services/research_topic_service.py` is responsible for all interactions with this table.

| Column | Description | Backend Usage |
| :--- | :--- | :--- |
| `id` | Unique identifier for the research topic. | Primary key. |
| `user_id` | Foreign key to the `users` table, indicating who owns the topic. | Used to enforce row-level security and to filter topics by user. |
| `title` | The title of the research topic. | The main identifier for the topic, displayed to the user. |
| `description` | A detailed description of the research topic. | Provides more context about the topic. |
| `status` | The status of the research topic (e.g., `active`, `completed`, `archived`). | Used to filter topics by their status. |
| `created_at` | Timestamp of when the topic was created. | Used for sorting and auditing. |
| `updated_at` | Timestamp of when the topic was last updated. | Used for sorting and auditing. |
| `version` | Version number for optimistic concurrency control. | Not currently used by the backend. |

### `subtopics`

*   **Purpose:** Stores the subtopics that are generated for a research topic.
*   **Backend Interaction:** The `subtopics_service` in `backend/src/services/subtopics_service.py` is responsible for all interactions with this table.

| Column | Description | Backend Usage |
| :--- | :--- | :--- |
| `id` | Unique identifier for the subtopic. | Primary key. |
| `research_topic_id` | Foreign key to the `research_topics` table. | Links the subtopic to its parent research topic. |
| `user_id` | Foreign key to the `users` table. | Used to enforce row-level security and to filter subtopics by user. |
| `name` | The name of the subtopic. | The main identifier for the subtopic, displayed to the user. |
| `trend_direction` | The direction of the trend for the subtopic (e.g., `up`, `down`, `stable`). | Indicates whether the subtopic is trending up or down. |
| `trend_score` | A score from 0-100 indicating the strength of the trend. | A numerical representation of the trend strength. |
| `interest_over_time` | A JSONB array of data points showing interest over time. | Used to display a graph of interest over time. |
| `seo_difficulty` | A score from 0-100 indicating the SEO difficulty of the subtopic. | Helps the user to decide which subtopics to focus on. |
| `search_volume` | The monthly search volume for the subtopic. | A key metric for determining the popularity of a subtopic. |
| `cpc` | The cost-per-click for the subtopic. | An indicator of the commercial intent of the subtopic. |
| `affiliate_offer_count` | The number of affiliate offers available for the subtopic. | Helps the user to gauge the monetization potential of the subtopic. |
| `keywords` | A JSONB array of keywords related to the subtopic. | Used to generate content ideas. |
| `viability_score` | A calculated score from 0-100 indicating the overall viability of the subtopic. | A quick indicator of the potential of the subtopic. |
| `created_at` | Timestamp of when the subtopic was created. | Used for sorting and auditing. |
| `updated_at` | Timestamp of when the subtopic was last updated. | Used for sorting and auditing. |
| `rationale` | The rationale behind the generation of the subtopic. | Not currently used by the backend. |
| `target_audience` | The target audience for the subtopic. | Not currently used by the backend. |

### `content_ideas`

*   **Purpose:** Stores content ideas for a specific topic.
*   **Backend Interaction:** The `content_idea_service` in `backend/src/services/content_idea_service.py` is responsible for interactions with this table.

| Column | Description | Backend Usage |
| :--- | :--- | :--- |
| `id` | Unique identifier for the content idea. | Primary key. |
| `title` | The title of the content idea. | The main identifier for the content idea, displayed to the user. |
| `description` | A detailed description of the content idea. | Provides more context about the content idea. |
| `content_type` | The type of content (e.g., `blog`, `software`). | Used to filter content ideas by their type. |
| `category` | The category of the content idea. | Used to categorize content ideas. |
| `subtopic` | The subtopic to which the content idea belongs. | Links the content idea to a subtopic. |
| `topic_id` | Foreign key to the `research_topics` table. | Links the content idea to a research topic. |
| `user_id` | Foreign key to the `users` table. | Used to enforce row-level security and to filter content ideas by user. |
| `keywords` | A JSONB array of keywords related to the content idea. | Used to generate the content. |
| `seo_score` | A score from 0-100 indicating the SEO score of the content idea. | A numerical representation of the SEO score. |
| `difficulty_level` | The difficulty level of the content idea (e.g., `easy`, `medium`, `hard`). | A categorical representation of the difficulty level. |
| `estimated_read_time` | The estimated read time of the content idea in minutes. | Provides an estimate of the length of the content. |
| `target_audience` | The target audience for the content idea. | Helps to tailor the content to the right audience. |
| `content_angle` | The angle of the content. | Provides a specific perspective for the content. |
| `monetization_potential` | The monetization potential of the content idea (e.g., `low`, `medium`, `high`). | A categorical representation of the monetization potential. |
| `technical_complexity` | The technical complexity of the content idea (e.g., `low`, `medium`, `high`). | A categorical representation of the technical complexity. |
| `development_effort` | The development effort required for the content idea (e.g., `low`, `medium`, `high`). | A categorical representation of the development effort. |
| `market_demand` | The market demand for the content idea (e.g., `low`, `medium`, `high`). | A categorical representation of the market demand. |
| `created_at` | Timestamp of when the content idea was created. | Used for sorting and auditing. |
| `updated_at` | Timestamp of when the content idea was last updated. | Used for sorting and auditing. |
| `status` | The status of the content idea (e.g., `draft`, `published`). | Used to filter content ideas by their status. |
| `published` | A boolean indicating whether the content idea has been published. | Used to filter content ideas by their publication status. |
| `published_at` | Timestamp of when the content idea was published. | Used for sorting and auditing. |
| `published_to_titles` | A boolean indicating whether the content idea has been published to the Titles table. | Used to track the content creation workflow. |
| `titles_record_id` | The ID of the record in the Titles table. | Used to link the content idea to the Titles table. |
| `priority` | The priority of the content idea (e.g., `low`, `medium`, `high`). | Used to prioritize content ideas. |
| `workflow_status` | The status of the content idea in the workflow. | Used to track the progress of the content idea. |
| `content_generated` | A boolean indicating whether the content has been generated for the content idea. | Used to track the content generation process. |
| `content_brief_generated` | A boolean indicating whether a content brief has been generated for the content idea. | Used to track the content brief generation process. |
| `overall_quality_score` | A score from 0-100 indicating the overall quality of the content idea. | A numerical representation of the overall quality. |
| `seo_optimization_score` | A score from 0-100 indicating the SEO optimization of the content idea. | A numerical representation of the SEO optimization. |
| `traffic_potential_score` | A score from 0-100 indicating the traffic potential of the content idea. | A numerical representation of the traffic potential. |
| `viral_potential_score` | A score from 0-100 indicating the viral potential of the content idea. | A numerical representation of the viral potential. |
| `competition_score` | A score from 0-100 indicating the competition level of the content idea. | A numerical representation of the competition level. |
| `content_outline` | A JSONB array representing the content outline. | Used to structure the content. |
| `key_points` | A JSONB array of key points. | Used to highlight the main takeaways of the content. |
| `primary_keywords` | A JSONB array of primary keywords. | Used for SEO purposes. |
| `secondary_keywords` | A JSONB array of secondary keywords. | Used for SEO purposes. |
| `enhanced_keywords` | A JSONB array of enhanced keywords. | Used for SEO purposes. |
| `keyword_research_data` | A JSONB object with keyword research data. | Provides more context about the keywords. |
| `keyword_research_enhanced` | A boolean indicating whether the keyword research has been enhanced. | Used to track the keyword research process. |
| `affiliate_opportunities` | A JSONB object with affiliate opportunities. | Provides information about monetization. |
| `monetization_score` | A score from 0-100 indicating the monetization score of the content idea. | A numerical representation of the monetization potential. |
| `estimated_annual_revenue` | The estimated annual revenue of the content idea. | A numerical representation of the estimated revenue. |
| `monetization_priority` | The monetization priority of the content idea (e.g., `low`, `medium`, `high`). | A categorical representation of the monetization priority. |
| `generation_method` | The method used to generate the content idea. | Used for auditing. |
| `generation_prompt` | The prompt used to generate the content idea. | Used for auditing. |
| `generation_parameters` | The parameters used to generate the content idea. | Used for auditing. |
| `enhancement_timestamp` | Timestamp of when the content idea was enhanced. | Used for auditing. |
| `estimated_word_count` | The estimated word count of the content. | Provides an estimate of the length of the content. |

### `affiliate_programs`

*   **Purpose:** Stores information about affiliate programs.
*   **Backend Interaction:** The `affiliate_research_service` in `backend/src/services/affiliate_research_service.py` is responsible for interactions with this table. The frontend does not interact with this table directly, but it is used by the `/api/affiliate-research/search` endpoint.

| Column | Description | Backend Usage |
| :--- | :--- | :--- |
| `id` | Unique identifier for the affiliate program. | Primary key. |
| `program_name` | The name of the affiliate program. | The main identifier for the program. |
| `company_name` | The name of the company that runs the affiliate program. | Provides more context about the program. |
| `description` | A detailed description of the affiliate program. | Provides more context about the program. |
| `website_url` | The URL of the affiliate program's website. | The main URL for the program. |
| `network_name` | The name of the affiliate network. | The affiliate network to which the program belongs. |
| `commission_rate` | The commission rate of the affiliate program. | A key metric for determining the profitability of the program. |
| `commission_type` | The type of commission (e.g., `percentage`, `flat`). | The type of commission. |
| `cookie_duration` | The cookie duration of the affiliate program in days. | A key metric for determining the profitability of the program. |
| `payment_terms` | The payment terms of the affiliate program. | Provides information about when and how affiliates are paid. |
| `application_requirements` | The application requirements for the affiliate program. | Provides information about what is required to join the program. |
| `program_url` | The URL of the affiliate program. | The URL to join the program. |
| `contact_email` | The contact email for the affiliate program. | The email address to contact for support. |
| `status` | The status of the affiliate program (e.g., `active`, `inactive`). | Used to filter programs by their status. |
| `verification_status` | The verification status of the affiliate program (e.g., `verified`, `unverified`). | Used to filter programs by their verification status. |
| `last_verified` | Timestamp of when the affiliate program was last verified. | Used for auditing. |
| `created_at` | Timestamp of when the affiliate program was created. | Used for sorting and auditing. |
| `updated_at` | Timestamp of when the affiliate program was last updated. | Used for sorting and auditing. |
| `research_score` | A score from 0-100 indicating the research score of the affiliate program. | A numerical representation of the research score. |
| `popularity_score` | A score from 0-100 indicating the popularity of the affiliate program. | A numerical representation of the popularity. |
| `conversion_rate` | The conversion rate of the affiliate program. | A key metric for determining the profitability of the program. |
| `avg_order_value` | The average order value of the affiliate program. | A key metric for determining the profitability of the program. |
| `target_audience` | The target audience for the affiliate program. | Helps to tailor the marketing efforts to the right audience. |
| `content_opportunities` | A JSONB array of content opportunities related to the affiliate program. | Provides ideas for content creation. |
| `seasonal_trends` | A JSONB object with seasonal trends related to the affiliate program. | Provides information about when to promote the program. |
| `competitor_analysis` | A JSONB object with competitor analysis related to the affiliate program. | Provides information about the competition. |
| `source` | The source of the affiliate program data. | Used to distinguish between different sources of data. |
| `data_quality_score` | A score from 0-100 indicating the data quality of the affiliate program. | A numerical representation of the data quality. |
| `last_researched` | Timestamp of when the affiliate program was last researched. | Used for auditing. |
| `research_count` | The number of times the affiliate program has been researched. | A metric for determining the popularity of the program. |

## Tables Not Used by the Frontend

The following tables are not directly or indirectly used by the frontend application. They are used by the backend for various purposes, such as data processing, logging, and storing intermediate results.

*   `PlannedArticles`
*   `PostLinks`
*   `RSS`
*   `TableOfContents`
*   `Titles`
*   `Titles_citations`
*   `Tones`
*   `affiliate_offers`
*   `affiliate_research`
*   `api_keys`
*   `application_settings`
*   `blog_generation_results`
*   `blog_idea_keyword_assignments`
*   `blog_idea_performance`
*   `blog_idea_templates`
*   `blog_ideas`
*   `categoriesByPost`
*   `competitive_intelligence`
*   `content_calendar`
*   `content_opportunities`
*   `dataforseo_api_logs`
*   `embeddings`
*   `geographic_insights`
*   `imported_keywords`
*   `indexed_documents`
*   `infographic`
*   `infographicDetails`
*   `keyword_intelligence`
*   `keyword_opportunities_reports`
*   `keyword_research_data`
*   `keyword_research_sessions`
*   `keywords`
*   `lindex_collections`
*   `lindex_documents`
*   `lindex_embedding_chunk`
*   `lindex_sections`
*   `llm_configurations`
*   `llm_providers`
*   `manual_action_suggestions`
*   `mySources`
*   `offer_analytics`
*   `offer_research_sessions`
*   `postTypes`
*   `research_program_links`
*   `seasonal_calendar`
*   `sectionSpecificPrompts`
*   `subtopic_suggestions`
*   `summaries`
*   `topic_decompositions`
*   `trend_analyses`
*   `trend_analysis`
*   `trend_analysis_data`
*   `trend_predictions`
*   `trending_topics`
*   `user_offer_preferences`
*   `user_profile`
*   `users`
*   `wordPress_details`
*   `vecs.RAG_HOUSE_AND_REAL_ESTATE_128D_OPT`
*   `vecs.default`
*   `vecs.general_knowledge`
*   `vecs.house`
*   `vecs.house_and_real_estate`
*   `vecs.rag_house`
*   `vecs.rag_house_and_real_estate`
*   `vecs.rag_house_and_real_estate_128D`
*   `vecs.rag_house_and_real_estate_128D_OPT`
*   `vecs.rag_house_and_real_estate_128d_opt`
*   `vecs.real_estate`
*   `vecs.real_estate_128D_OPT`
*   `vecs.research_documents`
*   `vecs.test`
*   `vecs.test-collection`
*   `vecs.your_collection`

This documentation provides a comprehensive overview of the database tables and their usage by the backend.