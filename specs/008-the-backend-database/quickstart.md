# Quickstart: Backend Database Supabase Integration

## Overview
This quickstart guide demonstrates how to integrate Supabase SDK into the trend analysis platform backend, replacing direct PostgreSQL connections with managed Supabase database operations.

## Prerequisites
- Python 3.11+
- Supabase project with database tables
- Environment variables configured
- Existing trend analysis platform backend

## Setup

### 1. Install Dependencies
```bash
pip install supabase python-dotenv structlog
```

### 2. Environment Configuration
Create `.env` file with Supabase credentials:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

### 3. Initialize Supabase Client
```python
# backend/src/core/supabase_client.py
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

def get_supabase_client() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if not url or not key:
        raise ValueError("Missing Supabase environment variables")
    
    return create_client(url, key)
```

## Basic Usage

### 1. Database Health Check
```python
# Test Supabase connection
from backend.src.core.supabase_client import get_supabase_client

def test_connection():
    try:
        client = get_supabase_client()
        result = client.table("users").select("id").limit(1).execute()
        print("✅ Supabase connection successful")
        return True
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False
```

### 2. CRUD Operations
```python
# Create operation
def create_user(user_data):
    client = get_supabase_client()
    result = client.table("users").insert(user_data).execute()
    return result.data[0] if result.data else None

# Read operation
def get_user(user_id):
    client = get_supabase_client()
    result = client.table("users").select("*").eq("id", user_id).execute()
    return result.data[0] if result.data else None

# Update operation
def update_user(user_id, update_data):
    client = get_supabase_client()
    result = client.table("users").update(update_data).eq("id", user_id).execute()
    return result.data[0] if result.data else None

# Delete operation
def delete_user(user_id):
    client = get_supabase_client()
    result = client.table("users").delete().eq("id", user_id).execute()
    return True
```

### 3. Error Handling
```python
import structlog
from supabase.exceptions import APIError

logger = structlog.get_logger()

def safe_database_operation(operation_func, *args, **kwargs):
    try:
        return operation_func(*args, **kwargs)
    except APIError as e:
        logger.error("Supabase API error", error=str(e), status_code=e.status_code)
        if e.status_code == 401:
            raise ValueError("Authentication failed - redirect to login")
        elif e.status_code == 408:
            raise ValueError("Request timeout after 60 seconds")
        else:
            raise ValueError(f"Database operation failed: {e.message}")
    except Exception as e:
        logger.error("Unexpected error", error=str(e))
        raise ValueError("Database service unavailable - fail fast with clear error")
```

## Advanced Features

### 1. Real-time Subscriptions
```python
def subscribe_to_trends():
    client = get_supabase_client()
    
    def handle_change(payload):
        print(f"Real-time update: {payload}")
    
    subscription = client.table("trend_analysis").on("INSERT", handle_change).subscribe()
    return subscription
```

### 2. Batch Operations
```python
def batch_create_affiliate_programs(programs_data):
    client = get_supabase_client()
    
    # Insert multiple records at once
    result = client.table("affiliate_programs").insert(programs_data).execute()
    return result.data
```

### 3. Complex Queries
```python
def get_trend_analysis_with_filters(filters):
    client = get_supabase_client()
    
    query = client.table("trend_analysis").select("*")
    
    if filters.get("user_id"):
        query = query.eq("user_id", filters["user_id"])
    
    if filters.get("date_from"):
        query = query.gte("created_at", filters["date_from"])
    
    if filters.get("limit"):
        query = query.limit(filters["limit"])
    
    result = query.execute()
    return result.data
```

## Testing

### 1. Unit Tests
```python
# tests/unit/test_supabase_client.py
import pytest
from unittest.mock import Mock, patch
from backend.src.core.supabase_client import get_supabase_client

@patch('backend.src.core.supabase_client.create_client')
def test_supabase_client_initialization(mock_create_client):
    mock_client = Mock()
    mock_create_client.return_value = mock_client
    
    client = get_supabase_client()
    
    assert client == mock_client
    mock_create_client.assert_called_once()
```

### 2. Integration Tests
```python
# tests/integration/test_database_operations.py
import pytest
from backend.src.services.supabase_service import SupabaseService

@pytest.mark.integration
def test_database_operations():
    service = SupabaseService()
    
    # Test create
    user_data = {"name": "Test User", "email": "test@example.com"}
    created_user = service.create_user(user_data)
    assert created_user["name"] == "Test User"
    
    # Test read
    retrieved_user = service.get_user(created_user["id"])
    assert retrieved_user["email"] == "test@example.com"
    
    # Test update
    updated_user = service.update_user(created_user["id"], {"name": "Updated User"})
    assert updated_user["name"] == "Updated User"
    
    # Test delete
    service.delete_user(created_user["id"])
    deleted_user = service.get_user(created_user["id"])
    assert deleted_user is None
```

### 3. Contract Tests
```python
# tests/contract/test_api_contracts.py
import pytest
import requests

def test_health_endpoint():
    response = requests.get("http://localhost:8000/api/v1/health/database")
    assert response.status_code == 200
    
    data = response.json()
    assert "status" in data
    assert "database" in data
    assert data["database"] == "supabase"

def test_database_operation_endpoint():
    headers = {"Authorization": "Bearer test-token"}
    payload = {
        "operation_type": "read",
        "table_name": "users",
        "limit": 10
    }
    
    response = requests.post(
        "http://localhost:8000/api/v1/database/operations",
        json=payload,
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "success" in data
    assert "data" in data
```

## Migration Strategy

### 1. Gradual Migration
```python
# Phase 1: Add Supabase alongside existing PostgreSQL
class DatabaseService:
    def __init__(self):
        self.postgres_client = get_postgres_client()  # Existing
        self.supabase_client = get_supabase_client()  # New
        self.use_supabase = os.getenv("USE_SUPABASE", "false").lower() == "true"
    
    def get_user(self, user_id):
        if self.use_supabase:
            return self._get_user_supabase(user_id)
        else:
            return self._get_user_postgres(user_id)
```

### 2. Data Validation
```python
def validate_migration():
    """Compare data between PostgreSQL and Supabase"""
    postgres_data = get_all_users_postgres()
    supabase_data = get_all_users_supabase()
    
    assert len(postgres_data) == len(supabase_data)
    
    for pg_user, sb_user in zip(postgres_data, supabase_data):
        assert pg_user["id"] == sb_user["id"]
        assert pg_user["email"] == sb_user["email"]
    
    print("✅ Migration validation successful")
```

## Monitoring and Observability

### 1. Health Monitoring
```python
def monitor_database_health():
    client = get_supabase_client()
    
    try:
        start_time = time.time()
        result = client.table("users").select("id").limit(1).execute()
        execution_time = (time.time() - start_time) * 1000
        
        if execution_time > 200:  # 200ms threshold
            logger.warning("Slow query detected", execution_time=execution_time)
        
        return {
            "status": "healthy",
            "execution_time_ms": execution_time,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error("Health check failed", error=str(e))
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
```

### 2. Performance Metrics
```python
def track_operation_metrics(operation_type, execution_time, success):
    metrics = {
        "operation_type": operation_type,
        "execution_time_ms": execution_time,
        "success": success,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Send to monitoring system
    logger.info("Database operation metrics", **metrics)
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   ```python
   # Check environment variables
   print(f"SUPABASE_URL: {os.getenv('SUPABASE_URL')}")
   print(f"SUPABASE_KEY: {os.getenv('SUPABASE_SERVICE_ROLE_KEY')[:10]}...")
   ```

2. **Connection Timeouts**
   ```python
   # Implement retry logic
   import time
   from functools import wraps
   
   def retry_on_timeout(max_retries=3):
       def decorator(func):
           @wraps(func)
           def wrapper(*args, **kwargs):
               for attempt in range(max_retries):
                   try:
                       return func(*args, **kwargs)
                   except Exception as e:
                       if attempt == max_retries - 1:
                           raise
                       time.sleep(2 ** attempt)  # Exponential backoff
               return wrapper
           return decorator
   ```

3. **Data Consistency**
   ```python
   # Verify data integrity
   def verify_data_consistency():
       postgres_count = count_users_postgres()
       supabase_count = count_users_supabase()
       
       if postgres_count != supabase_count:
           logger.error("Data inconsistency detected", 
                       postgres=postgres_count, 
                       supabase=supabase_count)
           return False
       
       return True
   ```

## Next Steps

1. **Complete Migration**: Remove all direct PostgreSQL connections
2. **Optimize Performance**: Implement caching and query optimization
3. **Add Real-time Features**: Leverage Supabase real-time capabilities
4. **Monitor Production**: Set up comprehensive monitoring and alerting

## Support

For issues or questions:
- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the [API Contracts](./contracts/supabase-api.yaml)
- Contact the development team