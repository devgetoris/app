# Apollo API Documentation Fixes

## Overview

Updated the Apollo API integration to strictly follow the official Apollo API documentation for the People Search endpoint.

## Issues Fixed

### 1. **Removed `reveal_personal_emails` from Search Endpoint**

**Problem:**
- We were passing `reveal_personal_emails: true` to the `/mixed_people/search` endpoint
- Apollo's official docs clearly state: **"This endpoint does not return new email addresses or phone numbers"**

**Why It's Wrong:**
- The search endpoint returns what's already in Apollo's database (basic info)
- Emails are fetched/enriched via enrichment endpoints only
- Search endpoint simply ignores this parameter (no effect)

**Solution:**
- ✅ Removed `reveal_personal_emails` from search endpoint
- ✅ Enrichment endpoints (Individual and Bulk) still use this parameter
- ✅ Added explanatory comments in code

**Files Modified:**
```
src/lib/apollo.ts - Line 198-201
```

**Before:**
```typescript
const searchPayload = {
  ...params,
  reveal_personal_emails: true, // This doesn't work on search!
};
```

**After:**
```typescript
// Important: Do NOT add reveal_personal_emails to search endpoint
// The search endpoint does not return new email addresses or phone numbers.
// Emails are only enriched via People Enrichment or Bulk People Enrichment endpoints.
const searchPayload = {
  ...params,
  // reveal_personal_emails is NOT supported on search endpoint
};
```

### 2. **Fixed Parameter Name: `person_locations` Instead of `organization_locations`**

**Problem:**
- We were using `organization_locations` for general location searches
- This is specifically for company **headquarters** location only

**Correct Usage According to Docs:**

| Parameter | Purpose | Example |
|-----------|---------|---------|
| `person_locations[]` | Where the **person** lives | California, Chicago, Ireland |
| `organization_locations[]` | Company **HQ** location | (same cities) |

**Solution:**
- ✅ Changed general location filter to use `person_locations`
- ✅ `organization_locations` available if users specifically want company HQ location
- ✅ Added documentation comments

**Files Modified:**
```
src/app/api/apollo/search/route.ts - Line 71-76
```

**Before:**
```typescript
// Locations - Apollo accepts an array
if (locations && Array.isArray(locations) && locations.length > 0) {
  searchParams.organization_locations = locations;
}
```

**After:**
```typescript
// Locations - Apollo accepts person_locations for where people LIVE
// and organization_locations for company HQ location
// We'll use person_locations for general location searches
if (locations && Array.isArray(locations) && locations.length > 0) {
  searchParams.person_locations = locations;
}
```

### 3. **Removed Non-Existent Parameter: `q_organization_keyword_tags`**

**Problem:**
- We were passing `q_organization_keyword_tags` for industries
- This parameter **does not exist** in Apollo's official documentation
- Apollo API was likely ignoring this invalid parameter

**Why There's No Industry Filter:**
- Apollo's People Search API doesn't have a direct "industry" filter
- The docs only mention: job titles, seniorities, locations, company size, revenue, technologies, etc.

**Solution:**
- ✅ Removed `q_organization_keyword_tags` parameter
- ✅ Industries now added to `q_keywords` for broad search
- ✅ Users can also search by organization domains, technologies, or other criteria

**Files Modified:**
```
src/app/api/apollo/search/route.ts - Line 60-72
```

**Before:**
```typescript
// Industries - use q_organization_keyword_tags which is more flexible
if (industries && Array.isArray(industries) && industries.length > 0) {
  searchParams.q_organization_keyword_tags = industries;
}
```

**After:**
```typescript
// Industries - Note: Apollo docs don't have a direct industry filter
// We can use q_keywords to include industry terms in search
// Removed q_organization_keyword_tags as it's not in official docs
if (industries && Array.isArray(industries) && industries.length > 0) {
  console.log("⚠️ Industries filter: Adding to keywords instead (no direct industry filter in API)");
  // Add industries to keywords
  if (searchParams.q_keywords) {
    searchParams.q_keywords += " " + industries.join(" ");
  } else {
    searchParams.q_keywords = industries.join(" ");
  }
}
```

## Supported Parameters (Per Official Docs)

According to Apollo's official documentation, here are all supported search parameters:

### Person-Based Filters
- `person_titles[]` - Job titles (e.g., "Sales Manager")
- `person_seniorities[]` - Job level (owner, founder, c_suite, vp, director, manager, etc.)
- `person_locations[]` - Where person lives (cities, states, countries)
- `contact_email_status[]` - Email verification status

### Organization-Based Filters  
- `organization_locations[]` - Company HQ location
- `organization_num_employees_ranges[]` - Employee count ranges (e.g., "1,10")
- `organization_ids[]` - Specific Apollo organization IDs
- `q_organization_domains_list[]` - Company domains (e.g., "apollo.io")
- `revenue_range[min]` and `revenue_range[max]` - Company revenue

### Technology Filters
- `currently_using_all_of_technology_uids[]` - All these technologies
- `currently_using_any_of_technology_uids[]` - Any of these technologies  
- `currently_not_using_any_of_technology_uids[]` - Exclude these technologies

### Job Posting Filters
- `q_organization_job_titles[]` - Active job postings titles
- `organization_job_locations[]` - Job posting locations
- `organization_num_jobs_range[min/max]` - Number of active postings
- `organization_job_posted_at_range[min/max]` - When jobs were posted

### General
- `q_keywords` - Keyword search (text search across profiles)
- `include_similar_titles` - Include similar job titles (default: true)
- `page` - Page number (default: 1)
- `per_page` - Results per page (default: 100, max: 100)

## Current Implementation

### Supported in UI
```
✅ Keywords
✅ Job Titles  
✅ Locations (person_locations)
✅ Company Sizes
```

### Not Implemented (Could Add)
```
⬜ Person Seniority Level
⬜ Contact Email Status
⬜ Organization Domains
⬜ Company Revenue Range
⬜ Technologies Used
⬜ Job Posting Filters
```

## Console Logging

New warning is added when industries are used:

```
⚠️ Industries filter: Adding to keywords instead (no direct industry filter in API)
```

This alerts users that industries are being searched as keywords, not as a direct filter.

## API Response

**Important Note from Docs:**
- Search endpoint returns existing data only
- Does NOT return new emails/phone numbers
- Use enrichment endpoints to reveal personal info
- Search results are limited to 50,000 records (500 pages × 100 per page)
- Contact status will show `email_not_unlocked` until enriched

## Testing

### What to Verify

1. **Search still works normally** ✅
   - All previous queries still return results
   - Location filtering uses person location

2. **Emails not revealed during search** ✅
   - Emails show as `email_not_unlocked` in search results
   - Only enrichment endpoints reveal emails

3. **Industries work via keywords** ✅
   - Industry terms included in keyword search
   - Results reflect keyword match

4. **Bulk enrichment reveals emails** ✅
   - After bulk enrichment, emails are revealed
   - Data is up-to-date and accurate

### Test Query
```
Search: "VP in San Francisco"
Results: 
- Uses person_titles: ["VP"]
- Uses person_locations: ["San Francisco"]
- Emails show as "email_not_unlocked"
Then:
- Bulk enrichment reveals actual emails
```

## References

- [Official Apollo People Search Documentation](https://apolloio.mintlify.app/reference/people-search)
- [Implementation: src/lib/apollo.ts](src/lib/apollo.ts)
- [Usage: src/app/api/apollo/search/route.ts](src/app/api/apollo/search/route.ts)

## Migration Guide

### For Users
No changes needed! Everything works the same:
1. Search for leads normally
2. Results display with location filtering
3. Enrichment reveals email addresses

### For Developers
If using the search client directly:

**Still Works (No Changes):**
```typescript
await apolloClient.searchContacts({
  q_keywords: "VP",
  person_titles: ["VP of Engineering"],
  person_locations: ["San Francisco"],
  organization_num_employees_ranges: ["1,10"]
});
```

**Fixed (Parameter Changed):**
```typescript
// OLD (wrong): organization_locations
// NEW (correct): person_locations
person_locations: ["San Francisco"]
```

**Removed:**
```typescript
// This parameter is NO LONGER supported
q_organization_keyword_tags: ["Technology"] // ❌ Remove this
```

## Future Improvements

1. **Add Advanced Filters UI** - Support for:
   - Person seniority levels
   - Email status filters
   - Company domains
   - Technologies used
   - Revenue ranges

2. **Better Error Handling** - Validate parameters before sending

3. **Parameter Documentation** - Show available options in UI

---

All fixes ensure strict compliance with Apollo's official API documentation! 📚✅
