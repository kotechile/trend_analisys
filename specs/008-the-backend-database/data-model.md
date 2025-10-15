# Data Model: Backend Database Supabase Integration

## 1. Entity: SupabaseClient
Represents the centralized database connection and operation handler.

### Fields
- **client_id** (String, Primary Key): Unique identifier for the client instance
- **supabase_url** (String, Not Null): Supabase project URL
- **supabase_key** (String, Not Null): Service role or anon key for authentication
- **client_type** (Enum: "service_role", "anon", Not Null): Type of client (service role for backend, anon for frontend)
- **is_active** (Boolean, Default: true): Whether the client is currently active
- **created_at** (Timestamp, Not Null): Client creation timestamp
- **last_used** (Timestamp, Nullable): Last successful operation timestamp
- **connection_status** (Enum: "connected", "disconnected", "error", Not Null): Current connection status
- **error_count** (Integer, Default: 0): Number of consecutive errors
- **retry_count** (Integer, Default: 0): Number of retry attempts

### Validation Rules
- Supabase URL must be valid HTTPS URL
- Supabase key must be non-empty and valid format
- Client type must be either "service_role" or "anon"
- Error count must be 0-10
- Retry count must be 0-5

### State Transitions
- **Initialization**: connection_status="connected", is_active=true
- **Connection Error**: connection_status="error", error_count++
- **Retry**: retry_count++, connection_status="connected" if successful
- **Max Retries**: connection_status="disconnected", is_active=false

## 2. Entity: DatabaseOperation
Represents all data persistence and retrieval activities routed through Supabase SDK.

### Fields
- **operation_id** (UUID, Primary Key): Unique identifier for the operation
- **client_id** (String, Foreign Key): Reference to SupabaseClient
- **operation_type** (Enum: "create", "read", "update", "delete", "real_time", Not Null): Type of database operation
- **table_name** (String, Not Null): Target database table
- **query_data** (JSON, Nullable): Query parameters and data
- **response_data** (JSON, Nullable): Operation response data
- **status** (Enum: "pending", "success", "error", "timeout", Not Null): Operation status
- **error_message** (String, Nullable): Error details if operation failed
- **execution_time_ms** (Integer, Nullable): Operation execution time in milliseconds
- **created_at** (Timestamp, Not Null): Operation start timestamp
- **completed_at** (Timestamp, Nullable): Operation completion timestamp
- **user_id** (String, Nullable): User who initiated the operation
- **request_id** (String, Nullable): Request identifier for tracing

### Validation Rules
- Operation type must be one of the defined enum values
- Table name must be non-empty and valid identifier
- Execution time must be positive if provided
- Completed timestamp must be after created timestamp if both provided

### State Transitions
- **Initiated**: status="pending", created_at set
- **Success**: status="success", completed_at set, response_data populated
- **Error**: status="error", error_message populated, completed_at set
- **Timeout**: status="timeout", completed_at set after 60 seconds

## 3. Entity: AuthenticationContext
Represents Supabase session and user authentication state.

### Fields
- **session_id** (UUID, Primary Key): Unique session identifier
- **user_id** (String, Not Null): Supabase user ID
- **access_token** (String, Not Null): JWT access token
- **refresh_token** (String, Not Null): JWT refresh token
- **token_type** (String, Default: "Bearer"): Token type
- **expires_at** (Timestamp, Not Null): Token expiration timestamp
- **is_active** (Boolean, Default: true): Whether session is active
- **created_at** (Timestamp, Not Null): Session creation timestamp
- **last_activity** (Timestamp, Not Null): Last activity timestamp
- **ip_address** (String, Nullable): Client IP address
- **user_agent** (String, Nullable): Client user agent
- **permissions** (JSON, Nullable): User permissions and roles

### Validation Rules
- Access token must be valid JWT format
- Refresh token must be non-empty
- Expires at must be in the future
- Last activity must be after created at
- Permissions must be valid JSON if provided

### State Transitions
- **Login**: is_active=true, tokens set, expires_at calculated
- **Activity**: last_activity updated
- **Token Refresh**: access_token updated, expires_at recalculated
- **Logout**: is_active=false
- **Expiration**: is_active=false when expires_at reached

## 4. Entity: DataModel
Represents business entities stored and retrieved through Supabase database tables.

### Fields
- **model_id** (UUID, Primary Key): Unique identifier for the data model
- **model_name** (String, Not Null): Name of the business entity
- **table_name** (String, Not Null): Corresponding Supabase table name
- **schema_version** (String, Not Null): Schema version identifier
- **fields** (JSON, Not Null): Model field definitions
- **relationships** (JSON, Nullable): Model relationships
- **validation_rules** (JSON, Nullable): Field validation rules
- **indexes** (JSON, Nullable): Database indexes
- **rls_policies** (JSON, Nullable): Row Level Security policies
- **is_active** (Boolean, Default: true): Whether model is active
- **created_at** (Timestamp, Not Null): Model creation timestamp
- **updated_at** (Timestamp, Not Null): Last update timestamp
- **created_by** (String, Not Null): User who created the model

### Validation Rules
- Model name must be unique and valid identifier
- Table name must be valid database identifier
- Schema version must follow semantic versioning
- Fields must be valid JSON schema
- Relationships must be valid if provided

### State Transitions
- **Creation**: is_active=true, created_at set
- **Update**: updated_at set, fields/relationships updated
- **Deprecation**: is_active=false
- **Reactivation**: is_active=true

## Relationships

### SupabaseClient → DatabaseOperation (1:N)
- One client can have many operations
- Operations are tied to specific client instances
- Cascade delete when client is removed

### AuthenticationContext → DatabaseOperation (1:N)
- One session can have many operations
- Operations are associated with user sessions
- Operations are cleaned up when session expires

### DataModel → DatabaseOperation (1:N)
- One model can have many operations
- Operations are performed on specific models
- Model changes affect related operations

## Indexes and Performance

### Primary Indexes
- SupabaseClient: client_id (primary), client_type, is_active
- DatabaseOperation: operation_id (primary), client_id, status, created_at
- AuthenticationContext: session_id (primary), user_id, is_active, expires_at
- DataModel: model_id (primary), model_name, is_active

### Composite Indexes
- DatabaseOperation: (client_id, status, created_at) for query performance
- AuthenticationContext: (user_id, is_active, expires_at) for session management
- DataModel: (model_name, is_active) for model lookup

### Query Optimization
- Use Supabase query builder for complex queries
- Implement proper indexing strategies
- Leverage Supabase caching features
- Monitor query performance and optimize bottlenecks

## Data Integrity

### Constraints
- Foreign key constraints between entities
- Unique constraints on critical fields
- Check constraints for enum values
- Not null constraints on required fields

### Validation
- Field-level validation using Pydantic models
- Business rule validation in service layer
- Database constraint validation
- Real-time validation feedback

### Backup and Recovery
- Regular automated backups
- Point-in-time recovery capabilities
- Data migration rollback procedures
- Disaster recovery planning