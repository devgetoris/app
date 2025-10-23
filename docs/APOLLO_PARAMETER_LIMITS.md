# Apollo API Parameter Limits

## Overview

Apollo API has strict limits on array parameters and request payload sizes. When these limits are exceeded, Apollo returns a **422 Unprocessable Entity** error with "Value too long" message.

## The Problem

When searching with too many filters (e.g., 30 locations), Apollo rejects the request:

```
Error: Apollo API error: Value too long
Status: 422 Unprocessable Entity
```

This happens because Apollo limits:
- **Array parameter size**: ~5-10 items per array
- **Total query string length**: ~2048 characters
- **Individual parameter length**: Varies by parameter

## Solution Implemented

### 1. Parameter Validation & Limiting

The search route now validates and limits array parameters:

```typescript
// Locations - cap at 10 items
if (locations && Array.isArray(locations) && locations.length > 0) {
  const limitedLocations = locations.slice(0, 10);
  if (locations.length > 10) {
    console.log(
      `⚠️ Location limit: Apollo limits to 10 locations. Limiting from ${locations.length} to 10.`
    );
  }
  searchParams.person_locations = limitedLocations;
}
```

### 2. Better Error Messages

Enhanced error handling provides helpful guidance:

```typescript
if (error.response?.status === 422) {
  if (error.response?.data?.error?.includes("Value too long")) {
    throw new Error(
      `Apollo API error: ${errorMessage}. Tip: Try reducing the number 
       of filters (especially locations, job titles, etc.). Apollo limits 
       array parameters to 5-10 items.`
    );
  }
}
```

## Apollo Parameter Limits

| Parameter | Limit | Notes |
|-----------|-------|-------|
| `person_titles[]` | ~10 items | Job titles to search |
| `person_seniorities[]` | ~10 items | Job levels |
| `person_locations[]` | ~10 items | Where people live |
| `organization_locations[]` | ~10 items | Company HQ location |
| `organization_num_employees_ranges[]` | ~10 items | Company size ranges |
| `q_keywords` | ~2048 chars | Keyword text search |
| `organization_ids[]` | ~1000 items | Special - much higher |

## Current Implementation

### Maximum Selections in UI

The MultiSelect components have `maxCount` set appropriately:

```typescript
<MultiSelect
  maxCount={3}  // Only allow 3 selections at a time
  options={JOB_TITLES}
/>
```

But users can search multiple times with different filters!

### Automatic Limiting

The search route automatically limits arrays to safe values:

```typescript
// Locations: Limited to 10 max
const limitedLocations = locations.slice(0, 10);

// Industries: Merged into keywords (no direct filter)
searchParams.q_keywords += industries.join(" ");
```

## Recommended Limits for Users

### For Best Performance:
- **Locations**: 1-5 locations maximum
- **Job Titles**: 1-3 titles maximum  
- **Company Sizes**: 1-3 ranges maximum
- **Industries**: Use keywords instead (no direct filter)

### Why Limits Matter:
- ✅ Faster API response
- ✅ More accurate results (too many filters = no matches)
- ✅ Better rate limiting
- ✅ Fewer API errors

## Error Messages Users See

### Before (Confusing):
```
Error: Apollo API error: Value too long
```

### After (Helpful):
```
Error: Apollo API error: Value too long. 
Tip: Try reducing the number of filters (especially locations, 
job titles, etc.). Apollo limits array parameters to 5-10 items.
```

## What to Do If You Hit Limits

If you get a "Value too long" error:

1. **Reduce number of selections**
   - Select fewer locations
   - Select fewer job titles
   - Select fewer company sizes

2. **Use keywords instead of filters**
   - Instead of selecting 5 industries → search keyword "technology"
   - Use keywords for industry terms
   - Combine keywords with limited filters

3. **Split searches**
   - Search with first batch of criteria
   - Review results
   - Search again with different criteria
   - Compare results

## Code Examples

### ❌ Too Many Filters (Will Fail)
```typescript
search({
  locations: [
    "San Francisco", "New York", "Boston", "Seattle", 
    "Los Angeles", "Chicago", "Austin", "Denver",
    "Portland", "Miami", "Atlanta", "Dallas", ...
  ],
  jobTitles: [
    "VP", "Director", "Manager", "Engineer", "Designer", ...
  ]
})
```

### ✅ Good Search (Will Work)
```typescript
search({
  locations: ["San Francisco", "New York", "Boston"],  // 3 max
  jobTitles: ["VP of Engineering"],                    // 1 item
  keywords: "technology AI startup"                    // Multiple terms in one param
})
```

## Console Logging

When limits are applied, you'll see:

```
⚠️ Location limit: Apollo limits to 10 locations. 
   Limiting from 30 to 10.

Apollo Search Params: {
  "q_keywords": "...",
  "person_titles": [...],
  "person_locations": [
    "San Francisco",
    "New York",
    "Boston",
    ...
    // Only first 10 included
  ]
}
```

## Testing

### Test Case 1: Normal Search (Should Work)
```
Input: 3 locations, 2 job titles, keywords
Expected: Success, results returned
```

### Test Case 2: Too Many Locations (Should Limit)
```
Input: 30 locations, 1 job title
Expected: Logs warning, limits to 10, returns results
```

### Test Case 3: Many Filters Combined (May Hit Limit)
```
Input: 10 locations + 10 titles + 10 sizes
Expected: Error with helpful message, suggests reducing filters
```

## Future Improvements

1. **UI Warnings**: Show warning when users select too many items
2. **Smart Suggestions**: "Too many locations, consider using keywords instead"
3. **Auto-batch**: Automatically batch searches if needed
4. **Parameter Optimization**: Rewrite keywords to avoid multiple arrays

## References

- Apollo API Documentation: https://apolloio.mintlify.app/
- HTTP 422 Status: Unprocessable Entity
- Parameter validation in: `src/app/api/apollo/search/route.ts`
- Error handling in: `src/lib/apollo.ts`

---

**Key Takeaway**: Apollo API limits array parameters to ~5-10 items. When hit, reduce selections or use keywords instead! 📌
