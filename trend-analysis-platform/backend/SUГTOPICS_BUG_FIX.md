# Subtopics Bug Fix

## Issue
The Keyword Armoury page shows 9 subtopics visually, but when clicking "Generate Keywords with LLM", the API request is sent with an empty `subtopics: []` array.

## Root Cause
The `loadSubtopicsForTopic` function was overwriting the subtopics that came from navigation state. The function calls `setSubtopics([topic.title])` which replaces all subtopics with just the topic title.

## What I Fixed

### 1. Added Protection Against Overwriting
In `loadSubtopicsForTopic`, I added a check:
```typescript
// If we already have subtopics, don't overwrite them
if (subtopics.length > 0 && subtopics[0] !== topic.title) {
  console.log('Already have subtopics, keeping them:', subtopics);
  return;
}
```

### 2. Made setSubtopics Conditional
Now `setSubtopics` is only called if subtopics array is empty:
```typescript
if (subtopics.length === 0) {
  setSubtopics([topic.title]);
}
```

### 3. Added Debug Logging
Added console.log statements to track when subtopics are being set:
- When useEffect initializes from navigation state
- When loadSubtopicsForTopic is called
- Before sending the API request

## Expected Behavior Now

1. When navigation happens with selectedSubtopics, they get set via useEffect
2. The loadSubtopicsForTopic function checks if subtopics already exist
3. If subtopics exist and don't match the topic title, it keeps them
4. The API request should now send the correct subtopics array

## Testing

1. Navigate to Keyword Armoury with subtopics
2. Check browser console for debug logs
3. Click "Generate Keywords with LLM"
4. Check network tab for API request
5. Backend logs should show non-empty subtopics array

## Status
✅ Fixed - Subtopics should now be preserved and sent correctly to the backend

