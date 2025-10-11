# 🎯 Active LLM Configuration Guide

## **Current Active LLM Status**
- **Default Provider**: GPT-5 Mini (OpenAI)
- **Active Providers**: All 4 providers are active
- **Priority Order**: GPT-5 Mini (100) → Gemini 2.5 Flash Lite (90) → Gemini 2.5 Flash (85) → Claude 3.5 Sonnet (80)

## **How to Change the Active LLM**

### **Method 1: Through the Settings Page (Recommended)**
1. Go to `http://localhost:3000`
2. Sign in with Google OAuth
3. Click the **Settings** tab
4. Go to **LLM Providers** tab
5. Click the **Edit** button next to any provider
6. Set `is_default: true` for your preferred provider
7. Set `is_default: false` for other providers

### **Method 2: Direct Database Update (Advanced)**
Run this SQL in your Supabase SQL Editor:

```sql
-- Set GPT-5 Mini as default (current)
UPDATE llm_providers 
SET is_default = true 
WHERE name = 'GPT-5 Mini';

-- Set all others as non-default
UPDATE llm_providers 
SET is_default = false 
WHERE name != 'GPT-5 Mini';

-- Or set Gemini 2.5 Flash as default
UPDATE llm_providers 
SET is_default = true 
WHERE name = 'Gemini 2.5 Flash';

UPDATE llm_providers 
SET is_default = false 
WHERE name != 'Gemini 2.5 Flash';
```

### **Method 3: Environment Variables (Fallback)**
Add to your `.env` file:

```bash
# Set default LLM provider
DEFAULT_LLM_PROVIDER=openai  # or google, anthropic, etc.

# Provider-specific settings
OPENAI_API_KEY=your_openai_key
GOOGLE_AI_API_KEY=your_google_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### **Method 4: API Endpoint (Programmatic)**
Use the admin API to update providers:

```bash
# Get current providers
curl "http://localhost:8000/api/admin/llm/providers"

# Update a provider (you'll need to implement this endpoint)
curl -X PUT "http://localhost:8000/api/admin/llm/providers/{provider_id}" \
  -H "Content-Type: application/json" \
  -d '{"is_default": true}'
```

## **How the System Chooses the Active LLM**

### **Priority Order:**
1. **Explicit Provider ID** (if specified in API call)
2. **Default Provider** (`is_default: true` in database)
3. **Environment Variable** (`DEFAULT_LLM_PROVIDER`)
4. **First Available Provider** (fallback)

### **Code Logic:**
```python
# From llm_service.py
if provider_id:
    provider = self.get_provider_by_id(provider_id)  # Explicit ID
else:
    provider = self.get_default_provider()  # Database default

# From llm_config.py
default_provider_name = os.getenv("DEFAULT_LLM_PROVIDER", "openai")
self.default_provider = LLMProvider(default_provider_name)
```

## **Current Provider Details**

| Provider | Type | Model | Default | Priority | Status |
|----------|------|-------|---------|----------|--------|
| GPT-5 Mini | OpenAI | gpt-5-mini | ✅ Yes | 100 | Active |
| Gemini 2.5 Flash Lite | Google | gemini-2.5-flash-lite | ❌ No | 90 | Active |
| Gemini 2.5 Flash | Google | gemini-2.5-flash | ❌ No | 85 | Active |
| Claude 3.5 Sonnet | Anthropic | claude-3-5-sonnet-20241022 | ❌ No | 80 | Active |

## **Testing the Active LLM**

### **1. Check Current Configuration:**
```bash
curl "http://localhost:8000/api/admin/llm/providers" | jq '.[] | select(.is_default == true)'
```

### **2. Test Topic Analysis:**
```bash
curl -X POST "http://localhost:8000/api/topic-analysis/analyze" \
  -H "Content-Type: application/json" \
  -d '{"topic": "eco friendly homes"}'
```

### **3. Check Logs:**
```bash
docker-compose -f docker-compose-local.yml logs backend | grep -i "llm\|provider"
```

## **Quick Commands**

### **Set GPT-5 Mini as Default:**
```sql
UPDATE llm_providers SET is_default = true WHERE name = 'GPT-5 Mini';
UPDATE llm_providers SET is_default = false WHERE name != 'GPT-5 Mini';
```

### **Set Gemini 2.5 Flash as Default:**
```sql
UPDATE llm_providers SET is_default = true WHERE name = 'Gemini 2.5 Flash';
UPDATE llm_providers SET is_default = false WHERE name != 'Gemini 2.5 Flash';
```

### **Set Claude 3.5 Sonnet as Default:**
```sql
UPDATE llm_providers SET is_default = true WHERE name = 'Claude 3.5 Sonnet';
UPDATE llm_providers SET is_default = false WHERE name != 'Claude 3.5 Sonnet';
```

## **Troubleshooting**

### **If No LLM is Working:**
1. Check API keys in environment variables
2. Verify provider is `is_active: true`
3. Check rate limits and cost limits
4. Review backend logs for errors

### **If Wrong LLM is Being Used:**
1. Verify `is_default: true` is set correctly
2. Check priority order
3. Clear any caches
4. Restart backend service

## **Next Steps**

1. **Choose your preferred LLM** from the 4 available providers
2. **Update the database** using Method 1 (Settings page) or Method 2 (SQL)
3. **Test the configuration** using the test commands above
4. **Monitor usage** through the Settings page statistics

The system is designed to be flexible - you can change the active LLM at any time without restarting the service!


