# Database Usage Documentation

This document outlines the database tables and how they are used by the backend.

## `research_topics`

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

## `subtopics`

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

## `keyword_research_data`

*   **Purpose:** Stores keyword data from various sources, including DataForSEO and user uploads.
*   **Backend Interaction:** The `dataforseo_repository` in `backend/src/dataforseo/database.py` and the `keyword_service` in `backend/src/services/keyword_service.py` are responsible for interactions with this table.

| Column | Description | Backend Usage |
| :--- | :--- | :--- |
| `id` | Unique identifier for the keyword data. | Primary key. |
| `keyword` | The keyword itself. | The main identifier for the keyword. |
| `search_volume` | The monthly search volume for the keyword. | A key metric for determining the popularity of a keyword. |
| `keyword_difficulty` | A score from 0-100 indicating the SEO difficulty of the keyword. | Helps the user to decide which keywords to focus on. |
| `cpc` | The cost-per-click for the keyword. | An indicator of the commercial intent of the keyword. |
| `competition_value` | A score from 0-100 indicating the level of competition for the keyword. | Helps the user to gauge the difficulty of ranking for the keyword. |
| `trend_percentage` | The percentage change in the trend for the keyword. | Indicates whether the keyword is trending up or down. |
| `intent_type` | The search intent of the keyword (e.g., `INFORMATIONAL`, `COMMERCIAL`, `TRANSACTIONAL`). | Helps the user to understand the user's goal when searching for the keyword. |
| `priority_score` | A calculated score from 0-100 indicating the overall priority of the keyword. | A quick indicator of the importance of the keyword. |
| `related_keywords` | A JSONB array of keywords related to this keyword. | Used to expand the keyword research. |
| `search_volume_trend` | A JSONB array of data points showing the search volume trend. | Used to display a graph of the search volume trend. |
| `created_at` | Timestamp of when the keyword data was created. | Used for sorting and auditing. |
| `updated_at` | Timestamp of when the keyword data was last updated. | Used for sorting and auditing. |
| `difficulty` | Keyword difficulty as decimal (0.0-100.0). | A more precise measure of keyword difficulty. |
| `competition_level` | Competition level category (low, medium, high). | A categorical representation of the competition level. |
| `low_top_of_page_bid` | Low top of page bid in USD. | An indicator of the cost of advertising for the keyword. |
| `high_top_of_page_bid` | High top of page bid in USD. | An indicator of the cost of advertising for the keyword. |
| `main_intent` | Main search intent category. | A more detailed categorization of the search intent. |
| `monthly_trend` | Monthly trend data as JSON. | Used to display a graph of the monthly trend. |
| `quarterly_trend` | Quarterly trend data as JSON. | Used to display a graph of the quarterly trend. |
| `yearly_trend` | Yearly trend data as JSON. | Used to display a graph of the yearly trend. |
| `avg_backlinks` | Average number of backlinks. | An indicator of the SEO effort required to rank for the keyword. |
| `avg_referring_domains` | Average number of referring domains. | An indicator of the SEO effort required to rank for the keyword. |
| `last_updated_time` | Last time the data was updated. | Used for auditing. |
| `related_keyword` | Related keyword that generated this keyword. | Used for tracking the origin of the keyword. |
| `seed_keyword` | Seed keyword that generated this keyword. | Used for tracking the origin of the keyword. |
| `source` | The source of the keyword data (e.g., `dataforseo`, `upload`). | Used to distinguish between different sources of data. |
| `user_id` | Foreign key to the `users` table. | Used to enforce row-level security and to filter keywords by user. |
| `topic_id` | Foreign key to the `research_topics` table. | Links the keyword to a research topic. |

## `trend_analysis_data`

*   **Purpose:** Stores trend analysis data from the DataForSEO Trends API.
*   **Backend Interaction:** The `dataforseo_repository` in `backend/src/dataforseo/database.py` is responsible for interactions with this table.

| Column | Description | Backend Usage |
| :--- | :--- | :--- |
| `id` | Unique identifier for the trend analysis data. | Primary key. |
| `subtopic` | The subtopic that was analyzed. | The main identifier for the trend analysis. |
| `location` | The location where the analysis was performed. | The geographical context of the analysis. |
| `time_range` | The time range of the analysis. | The temporal context of the analysis. |
| `average_interest` | The average interest over the time range. | A key metric for determining the popularity of the subtopic. |
| `peak_interest` | The peak interest over the time range. | An indicator of the maximum popularity of the subtopic. |
| `timeline_data` | A JSONB array of data points showing interest over time. | Used to display a graph of interest over time. |
| `related_queries` | A JSONB array of related queries. | Used to expand the research. |
| `demographic_data` | A JSONB object with demographic data. | Not currently used by the backend. |
| `created_at` | Timestamp of when the trend analysis data was created. | Used for sorting and auditing. |
| `updated_at` | Timestamp of when the trend analysis data was last updated. | Used for sorting and auditing. |

## `subtopic_suggestions`

*   **Purpose:** Stores trending subtopic suggestions and recommendations.
*   **Backend Interaction:** The `dataforseo_repository` in `backend/src/dataforseo/database.py` is responsible for interactions with this table.

| Column | Description | Backend Usage |
| :--- | :--- | :--- |
| `id` | Unique identifier for the subtopic suggestion. | Primary key. |
| `topic` | The topic for which the suggestion was generated. | The main identifier for the suggestion. |
| `trending_status` | The trending status of the suggestion (e.g., `TRENDING`, `STABLE`, `DECLINING`). | A quick indicator of the trend direction. |
| `growth_potential` | A score from 0-100 indicating the growth potential of the suggestion. | A numerical representation of the growth potential. |
| `search_volume` | The monthly search volume for the suggestion. | A key metric for determining the popularity of the suggestion. |
| `related_queries` | A JSONB array of related queries. | Used to expand the research. |
| `competition_level` | The competition level of the suggestion (e.g., `LOW`, `MEDIUM`, `HIGH`). | A categorical representation of the competition level. |
| `commercial_intent` | A score from 0-100 indicating the commercial intent of the suggestion. | A numerical representation of the commercial intent. |
| `created_at` | Timestamp of when the subtopic suggestion was created. | Used for sorting and auditing. |
| `updated_at` | Timestamp of when the subtopic suggestion was last updated. | Used for sorting and auditing. |

## `dataforseo_api_logs`

*   **Purpose:** Logs API requests and responses for monitoring and debugging.
*   **Backend Interaction:** The `DataForSEOAPIClient` in `backend/src/dataforseo/api_integration.py` is responsible for logging requests and responses to this table.

| Column | Description | Backend Usage |
| :--- | :--- | :--- |
| `id` | Unique identifier for the log entry. | Primary key. |
| `endpoint` | The API endpoint that was called. | The endpoint that was called. |
| `request_data` | The request data that was sent to the API. | The data that was sent to the API. |
| `response_data` | The response data that was received from the API. | The data that was received from the API. |
| `status_code` | The HTTP status code of the response. | The status code of the response. |
| `response_time_ms` | The response time in milliseconds. | The time it took to get a response from the API. |
| `error_message` | The error message if the request failed. | The error message if the request failed. |
| `created_at` | Timestamp of when the log entry was created. | Used for sorting and auditing. |

## `users`

*   **Purpose:** Stores user information. This table is not explicitly defined in the provided migrations, but it is referenced by other tables. It is likely a standard Supabase `auth.users` table.
*   **Backend Interaction:** The backend uses the `users` table for authentication and authorization. The `get_current_user` function in `backend/src/core/supabase_auth.py` is used to get the current user from the `auth.users` table.

| Column | Description | Backend Usage |
| :--- | :--- | :--- |
| `id` | Unique identifier for the user. | Primary key. Used as a foreign key in other tables. |

This documentation provides a comprehensive overview of the database tables and their usage by the backend.
