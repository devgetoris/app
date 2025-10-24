# Hybrid Search: Organization + People Search

## Overview

Implemented a hybrid search strategy that combines Apollo's Organization Search and People Search
endpoints for more accurate and refined lead discovery.

## What is Hybrid Search?

Instead of searching across all people in Apollo's database:

- **Traditional Search**: Search people → find matches → often noisy results
- **Hybrid Search**: Search organizations → get matches → then find people within those
  organizations → more targeted results

### Why Hybrid is Better

```
Traditional Search (Broad):
  Search "VP in Tech"
  → Returns VPs from ALL companies
  → May include small companies not in your target

Hybrid Search (Targeted):
  Search organizations "Tech companies with 100-500 employees"
  → Find 500 matching organizations
  → Find VPs specifically within those 500 companies
  → Much more targeted results
```

## How It Works

### Flow Diagram

```
Step 1: Organization Search
┌─────────────────────────────────┐
│ Search Organizations            │
│ - Industry: Technology          │
│ - Location: San Francisco       │
│ - Size: 50-500 employees        │
└────────────┬────────────────────┘
             ↓
        Found 150 Orgs
             ↓
Step 2: Extract Org IDs
┌─────────────────────────────────┐
│ Get 150 Organization IDs        │
└────────────┬────────────────────┘
             ↓
Step 3: People Search with Org Filter
┌─────────────────────────────────┐
│ Search People                   │
│ - Job Title: VP                 │
│ - Organization IDs: [150 orgs]  │
│ - Location: San Francisco       │
└────────────┬────────────────────┘
             ↓
       Found 250 VPs
    (Only from matched orgs)
```

## Implementation

### New Interfaces

```typescript
export interface ApolloOrganization {
  id: string;
  name: string;
  primary_domain: string;
  industry: string;
  estimated_num_employees: number;
  city?: string;
  state?: string;
  country?: string;
  annual_revenue?: number;
  technology_names?: string[];
}

export interface OrganizationSearchParams {
  q_keywords?: string;
  organization_locations?: string[];
  organization_num_employees_ranges?: string[];
  industry_tag_ids?: string[];
  page?: number;
  per_page?: number;
}

export interface OrganizationSearchResponse {
  organizations: ApolloOrganization[];
  pagination: { page; per_page; total_entries; total_pages };
}
```

### New Methods in ApolloClient

#### 1. Organization Search

```typescript
async searchOrganizations(
  params: OrganizationSearchParams
): Promise<OrganizationSearchResponse>
```

**Purpose**: Find organizations matching criteria

**Example**:

```typescript
const orgs = await apolloClient.searchOrganizations({
  q_keywords: "technology artificial intelligence",
  organization_locations: ["San Francisco"],
  organization_num_employees_ranges: ["100,500"],
});
```

**Response**:

```typescript
{
  organizations: [
    {
      id: "org_123",
      name: "Tech Corp",
      industry: "Software",
      estimated_num_employees: 250,
      primary_domain: "techcorp.com"
    },
    // ... more orgs
  ],
  pagination: { page: 1, per_page: 100, total_entries: 150, total_pages: 2 }
}
```

#### 2. Hybrid Search

```typescript
async hybridSearch(params: {
  q_keywords?: string;
  person_titles?: string[];
  organization_locations?: string[];
  organization_num_employees_ranges?: string[];
  industry_keywords?: string[];
  page?: number;
  per_page?: number;
}): Promise<ApolloSearchResponse>
```

**Purpose**: Two-step search combining organizations then people

**Example**:

```typescript
const people = await apolloClient.hybridSearch({
  q_keywords: "VP",
  person_titles: ["VP of Engineering"],
  industry_keywords: ["AI", "Machine Learning"],
  organization_num_employees_ranges: ["100,500"],
  organization_locations: ["San Francisco", "New York"],
  per_page: 25,
});
```

**Process**:

1. Searches for organizations with `industry_keywords`, `organization_locations`, and
   `organization_num_employees_ranges`
2. Extracts organization IDs from results
3. Searches for people with `person_titles` and `q_keywords` WITHIN those organizations
4. Returns people results filtered by organization match

## Console Logging

Hybrid search shows detailed logging of both stages:

```
🔗 Apollo Hybrid Search - Starting organization search first...
🏢 Apollo Organization Search - Input params: {...}
📤 Apollo Organization Search - Full request payload: {...}
✅ Apollo Organization Search - Response received: {
  total_entries: 150,
  returned_count: 100
}
  Organization 1: Tech Corp - Industry: Software - Employees: 250
  Organization 2: StartupXYZ - Industry: Technology - Employees: 75
  ...

✅ Found 150 organizations, now searching for people within them...
📥 Searching for people within 150 organizations...
🔍 Apollo Search - Input params: {...organization_ids: [150 ids]...}
✅ Apollo Search - Response received: {
  total_entries: 250,
  returned_count: 25
}
  Contact 1: John Smith - Email: email_not_unlocked
  Contact 2: Jane Doe - Email: email_not_unlocked
  ...

✅ Hybrid search complete
```

## Advantages

✅ **More Targeted Results** - Only people from companies matching your criteria  
✅ **Better Filtering** - Organization-level filters (industry, size) applied first  
✅ **Reduced Noise** - Eliminates irrelevant companies before searching people  
✅ **Accurate Demographics** - Companies in your target market only  
✅ **Better Quality Leads** - Focused on relevant organizations

## Fallback Behavior

If hybrid search fails (organizations not found, API error):

1. Automatically falls back to standard people search
2. Uses available people-level criteria
3. No interruption to user experience
4. Logs warning message

```
⚠️ No organizations found, falling back to standard people search
```

## Performance Considerations

### API Calls

- Organization search: 1 call
- People search: 1 call
- **Total: 2 API calls** (vs. 1 for standard search)

### Time

- Organization search: ~1-2 seconds
- People search: ~1-2 seconds
- **Total: ~2-4 seconds** (slight overhead for better results)

### Rate Limits

- Both searches respect Apollo rate limits
- Combined credits usage is minimal
- Fallback if either search fails

## Use Cases

### Use Hybrid Search When:

✅ You have industry/size criteria (not just job titles)  
✅ You want highly targeted results  
✅ You're searching within specific company types  
✅ You want companies in specific locations

### Use Standard Search When:

⬜ Searching by just person attributes (titles, seniority)  
⬜ You don't care about company characteristics  
⬜ You want fastest possible results

## Future Enhancement: Search Route Integration

Currently hybrid search is available via:

```typescript
const apolloClient = getApolloClient();
const results = await apolloClient.hybridSearch({...});
```

Could be exposed via API route:

```
POST /api/apollo/search/hybrid
```

## Code Examples

### Example 1: Tech VPs in SF

```typescript
const results = await apolloClient.hybridSearch({
  industry_keywords: ["technology", "software"],
  person_titles: ["VP of Engineering"],
  organization_locations: ["San Francisco"],
  organization_num_employees_ranges: ["50,500"],
});
```

### Example 2: Sales Leaders in Enterprise

```typescript
const results = await apolloClient.hybridSearch({
  industry_keywords: ["enterprise", "SaaS"],
  person_titles: ["VP of Sales", "Head of Sales"],
  organization_num_employees_ranges: ["1000,10000"],
  q_keywords: "sales leadership",
});
```

### Example 3: Finance in NYC

```typescript
const results = await apolloClient.hybridSearch({
  industry_keywords: ["finance", "fintech"],
  organization_locations: ["New York", "New York City"],
  person_titles: ["Director of Finance"],
  organization_num_employees_ranges: ["100,1000"],
});
```

## Error Handling

### Organization Search Fails

```
🏢 Apollo Organization Search - Input params: {...}
❌ Apollo Organization Search - API Error: {
  status: 429,
  data: {error: "Rate limited"},
  message: "Too many requests"
}
⚠️ Falling back to standard people search
```

### People Search Fails (After Org Search Succeeds)

```
✅ Found 150 organizations...
❌ Apollo Search - API Error: {...}
⚠️ Falling back to standard people search
```

## Testing Checklist

- [ ] Organization search returns results
- [ ] Organization IDs extracted correctly
- [ ] People search with org IDs filters results
- [ ] Results are more targeted than standard search
- [ ] Fallback works when organizations not found
- [ ] Console logging shows both stages
- [ ] Pagination works correctly
- [ ] Bulk enrichment works on hybrid results
- [ ] No duplicate results across pages
- [ ] Response time is acceptable

## Architecture

```
ApolloClient
├── searchContacts() - People only
├── searchOrganizations() - Organizations only
├── hybridSearch() - Combined approach
│   ├── 1. searchOrganizations()
│   ├── 2. Extract org IDs
│   ├── 3. searchContacts() with org_ids
│   ├── 4. Fallback if needed
│   └── 5. Return people results
├── bulkEnrichContacts() - Enrich results
└── enrichContact() - Enrich single contact
```

## References

- [Apollo Organization Search API](https://apolloio.mintlify.app/reference/organization-search)
- [Apollo People Search API](https://apolloio.mintlify.app/reference/people-search)
- [Implementation: src/lib/apollo.ts](src/lib/apollo.ts)

---

Hybrid search provides a powerful two-step approach for finding the most relevant leads! 🎯🔗
