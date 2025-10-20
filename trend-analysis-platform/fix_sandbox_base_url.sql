-- Fix the sandbox base URL to include /v3/ path
-- This is needed for DataForSEO sandbox endpoints to work correctly

UPDATE api_keys 
SET base_url = 'https://sandbox.dataforseo.com/v3'
WHERE provider = 'dataforseo' AND is_active = true;

-- Verify the update
SELECT key_name, provider, base_url, is_active 
FROM api_keys 
WHERE provider = 'dataforseo' AND is_active = true;
