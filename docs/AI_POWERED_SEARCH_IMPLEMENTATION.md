# AI-Powered Lead Search Implementation

## Overview
This implementation removes all hardcoded parameters and implements AI-powered lead search with separate routes for people and organization searches, supporting all Apollo API parameters dynamically.

## Key Features

### 1. AI Query Parser Enhancement
- **File**: `src/app/api/apollo/parse-query/route.ts`
- **Changes**:
  - Updated interface to support all Apollo API parameters
  - Enhanced system prompt to handle all parameter types
  - Removed hardcoded normalization logic
  - Added support for all Apollo API parameters including:
    - People search parameters (person_titles, person_seniorities, person_locations, etc.)
    - Organization search parameters (organization_locations, organization_num_employees_ranges, etc.)
    - Technology filters (currently_using_all_of_technology_uids, etc.)
    - Job posting filters (q_organization_job_titles, organization_job_locations, etc.)

### 2. Dedicated Search Routes
- **People Search**: `src/app/api/apollo/search-people/route.ts`
  - Handles all people-specific search parameters
  - Includes enrichment and lead saving functionality
  - Supports all Apollo API parameters dynamically

- **Organization Search**: `src/app/api/apollo/search-organizations/route.ts`
  - Handles organization-specific search parameters
  - Returns organization data in a structured format
  - Supports all Apollo API parameters dynamically

### 3. Apollo Client Enhancement
- **File**: `src/lib/apollo.ts`
- **Changes**:
  - Updated `ApolloSearchParams` interface to support all Apollo API parameters
  - Updated `OrganizationSearchParams` interface
  - Enhanced `searchContacts` method to handle all parameters dynamically
  - Enhanced `searchOrganizations` method to handle all parameters dynamically
  - Added proper parameter formatting for range parameters (revenue_range, organization_num_jobs_range, etc.)

### 4. Dashboard UI Updates
- **File**: `src/app/dashboard/page.tsx`
- **Changes**:
  - Added search type toggle (People vs Organizations)
  - Updated search logic to use appropriate endpoints
  - Dynamic UI text based on search type
  - Enhanced AI search descriptions for both search types

### 5. Switch Component
- **File**: `src/components/ui/switch.tsx`
- **New Component**: Created Radix UI-based switch component for the search type toggle

### 6. Legacy Search Route Update
- **File**: `src/app/api/apollo/search/route.ts`
- **Changes**:
  - Removed all hardcoded parameter mappings
  - Updated to support all Apollo API parameters dynamically
  - Maintained backward compatibility while supporting new parameters

## Supported Apollo API Parameters

### People Search Parameters
- `person_titles[]` - Job titles
- `person_seniorities[]` - Seniority levels (owner, founder, c_suite, partner, vp, head, director, manager, senior, entry, intern)
- `person_locations[]` - Where people live
- `include_similar_titles` - Include similar job titles
- `contact_email_status[]` - Email statuses (verified, unverified, likely to engage, unavailable)

### Organization Search Parameters
- `organization_locations[]` - Company headquarters locations
- `organization_num_employees_ranges[]` - Employee count ranges
- `organization_ids[]` - Specific Apollo organization IDs
- `q_organization_domains_list[]` - Company domains
- `revenue_range[min/max]` - Company revenue range

### Technology Filters
- `currently_using_all_of_technology_uids[]` - Technologies company must use ALL of
- `currently_using_any_of_technology_uids[]` - Technologies company uses ANY of
- `currently_not_using_any_of_technology_uids[]` - Technologies company does NOT use

### Job Posting Filters
- `q_organization_job_titles[]` - Job titles in active postings
- `organization_job_locations[]` - Locations of active job postings
- `organization_num_jobs_range[min/max]` - Number of active job postings
- `organization_job_posted_at_range[min/max]` - Date range for job postings

## Usage Examples

### AI Query Examples for People Search
- "VP in SF" → Extracts person_titles: ["VP"], person_locations: ["San Francisco"]
- "CTOs in AI startups" → Extracts person_titles: ["CTO"], keywords: "AI", organization_num_employees_ranges: ["1,10", "11,50"]
- "Directors at Salesforce" → Extracts person_titles: ["Director"], q_organization_domains_list: ["salesforce.com"]

### AI Query Examples for Organization Search
- "Tech companies in SF" → Extracts organization_locations: ["San Francisco"], keywords: "tech"
- "AI startups with 50+ employees" → Extracts keywords: "AI", organization_num_employees_ranges: ["51,500"]
- "Companies using React" → Extracts currently_using_any_of_technology_uids: ["react"]

## API Endpoints

### People Search
- **Endpoint**: `POST /api/apollo/search-people`
- **Purpose**: Search for people using all Apollo API parameters
- **Response**: Returns enriched lead data with email addresses

### Organization Search
- **Endpoint**: `POST /api/apollo/search-organizations`
- **Purpose**: Search for organizations using all Apollo API parameters
- **Response**: Returns organization data in structured format

### AI Query Parser
- **Endpoint**: `POST /api/apollo/parse-query`
- **Purpose**: Parse natural language queries into structured Apollo API parameters
- **Response**: Returns parsed parameters ready for search endpoints

## Benefits

1. **No Hardcoded Parameters**: All parameters are dynamically supported
2. **AI-Powered**: Natural language queries are intelligently parsed
3. **Comprehensive**: Supports all Apollo API parameters
4. **Flexible**: Separate routes for people and organization searches
5. **User-Friendly**: Toggle between search types with dynamic UI
6. **Extensible**: Easy to add new parameters as Apollo API evolves

## Technical Implementation

- **Type Safety**: Full TypeScript interfaces for all parameters
- **Error Handling**: Comprehensive error handling and validation
- **Logging**: Detailed logging for debugging and monitoring
- **Performance**: Efficient parameter processing and API calls
- **Compatibility**: Maintains backward compatibility with existing code

This implementation provides a robust, AI-powered lead search system that leverages the full power of the Apollo API while maintaining ease of use through natural language queries.
