# AI-Powered Lead Search Feature

## Overview

The LeadFlow application now includes an intelligent AI-powered search feature that allows users to
search for leads using natural language instead of complicated drag-and-drop filters.

## How It Works

### User Experience Flow

1. **User Input**: User types a simple natural language query (e.g., "VP in SF")
2. **AI Parsing**: The query is sent to OpenAI which intelligently parses it
3. **Parameter Extraction**: AI identifies job titles, locations, industries, company sizes, and
   keywords
4. **Normalization**: The extracted parameters are normalized to match Apollo API options
5. **User Review**: User sees the parsed parameters in a readable format
6. **Confirmation**: User clicks "Search Leads" to proceed with the search
7. **Results**: Leads matching the criteria are fetched and displayed

### Architecture

#### New Endpoint: `/api/apollo/parse-query`

**Purpose**: Parse natural language queries into structured search parameters

**Request**:

```json
{
  "query": "VP in SF"
}
```

**Response**:

```json
{
  "success": true,
  "parsed": {
    "keywords": null,
    "jobTitles": ["VP of Engineering"],
    "industries": [],
    "companySizes": [],
    "locations": ["San Francisco"]
  },
  "originalQuery": "VP in SF"
}
```

**Technology Stack**:

- Uses OpenAI's Claude 3.5 Sonnet model
- Sends a system prompt with examples and expected output format
- Parses the JSON response
- Applies normalization rules to match Apollo API options

## Examples

### Example 1: Simple Location Search

**Input**: "VP in SF" **Parsed Output**:

- Job Titles: VP of Engineering
- Locations: San Francisco

### Example 2: Industry Focus

**Input**: "CTOs in AI startups" **Parsed Output**:

- Keywords: AI
- Job Titles: CTO
- Industries: Computer Software
- Company Sizes: 1-10, 11-50

### Example 3: Complex Query

**Input**: "Product managers in NY tech companies with 100+ employees" **Parsed Output**:

- Job Titles: Product Manager
- Industries: Technology
- Company Sizes: 501-1000, 1001-5000, 5001-10000, 10001+
- Locations: New York

### Example 4: Multi-location Query

**Input**: "Engineering directors in SF or NYC" **Parsed Output**:

- Job Titles: Director of Engineering
- Locations: San Francisco, New York

## Normalization Rules

### Job Title Normalizations

The AI parser automatically normalizes job title abbreviations and variations:

| Input     | Normalized               |
| --------- | ------------------------ |
| VP        | VP of Engineering        |
| CTO       | CTO                      |
| CEO       | CEO                      |
| Director  | Director of Engineering  |
| Manager   | Engineering Manager      |
| Architect | Senior Software Engineer |
| Principal | Senior Software Engineer |
| Developer | Lead Developer           |
| PM        | Product Manager          |

### Industry Normalizations

| Input      | Normalized         |
| ---------- | ------------------ |
| Tech       | Computer Software  |
| Technology | Computer Software  |
| AI         | Computer Software  |
| Startup    | Internet           |
| Finance    | Financial Services |
| Healthcare | Healthcare         |
| Education  | Education          |
| Retail     | Retail             |

### Location Abbreviations

| Input | Expanded       |
| ----- | -------------- |
| SF    | San Francisco  |
| LA    | Los Angeles    |
| NY    | New York       |
| NYC   | New York       |
| UK    | United Kingdom |
| HK    | Hong Kong      |
| US    | United States  |

## UI Components

### AI Search Tab

- Clean, intuitive single text input
- Clear instructions with examples
- Real-time parsing feedback
- Parsed parameters preview with color-coded success state

### Advanced Tab

- Traditional multi-select interface
- Preserved for users who prefer explicit filtering
- All original functionality maintained

## Error Handling

### Common Issues

#### Issue 1: OpenAI API Key Missing

**Error**: "OPENAI_API_KEY environment variable is not set" **Solution**: Add `OPENAI_API_KEY` to
your `.env.local` file

#### Issue 2: Invalid Query Format

**Error**: "Query is required" **Solution**: Enter a non-empty query

#### Issue 3: AI Parsing Fails

**Error**: "Failed to parse query with AI" **Possible Causes**:

- OpenAI API is down
- Rate limit exceeded
- Invalid API key
- Malformed query

**Solution**:

1. Check OpenAI status page
2. Verify API key in environment variables
3. Try a simpler query
4. Wait a few seconds and retry

#### Issue 4: No Leads Found

**Message**: "No leads found. Try refining your search query." **Possible Causes**:

- Criteria too specific
- Apollo API credits exhausted
- GDPR restrictions
- Email not revealed

**Solution**:

1. Try a broader query (e.g., "VP" instead of "VP in SF with AI experience")
2. Check Apollo dashboard for credit balance
3. Use Advanced search tab for more control

## Console Logging

The AI search feature includes detailed console logging for debugging:

```
🤖 AI Query Parser - Input query: VP in SF
🔄 AI Query Parser - Sending to OpenAI...
✅ AI Query Parser - OpenAI response: {"keywords": null, "jobTitles": ["VP of Engineering"], ...}
🎯 AI Query Parser - Final parsed result: {...normalized result...}
```

## Performance Considerations

### Latency

- Initial query parsing: ~1-2 seconds (OpenAI API call)
- Lead search after parsing: ~3-5 seconds (Apollo API call)
- Total flow: ~5-7 seconds

### Cost

- Each AI parse uses OpenAI API credits
- Cost: ~0.001-0.002 USD per query (very cheap)
- Lead search uses Apollo credits (separate billing)

### Rate Limiting

- OpenAI: 3 requests/minute on free tier
- Apollo: 100 requests/minute (standard)
- Recommended: Use Advanced search for batch operations

## Advanced Usage

### Combining with Advanced Search

Users can:

1. Use AI search to get quick results
2. Switch to Advanced tab to fine-tune filters
3. Get the best of both worlds

### Natural Language Tips

**Better Queries** (more specific AI parsing):

- "VP of Sales in California"
- "ML engineers in tech startups with <50 employees"
- "Product managers in e-commerce companies"

**Worse Queries** (ambiguous):

- "people"
- "executives"
- "anyone in tech"

## Future Enhancements

Potential improvements:

1. **Query History**: Save common searches for quick re-use
2. **Suggested Refinements**: AI suggests broader/narrower searches
3. **Bulk Queries**: Parse multiple lines of queries at once
4. **Saved Filters**: Save AI-parsed queries as reusable templates
5. **Explainability**: Show "why" certain results matched
6. **Multi-language Support**: Accept queries in different languages
7. **Advanced Operators**: Support quotes, AND/OR, exclusions (e.g., '"VP Engineering" NOT startup')

## API Reference

### POST `/api/apollo/parse-query`

Parse a natural language query into structured Apollo search parameters.

**Authentication**: Required (Clerk auth)

**Request Body**:

```typescript
{
  query: string; // Natural language search query, min 1 char
}
```

**Success Response** (200):

```typescript
{
  success: true;
  parsed: {
    keywords?: string;
    jobTitles: string[];
    industries: string[];
    companySizes: string[];
    locations: string[];
  };
  originalQuery: string;
}
```

**Error Response** (400/500):

```typescript
{
  error: string; // Error message
}
```

## Troubleshooting Checklist

- [ ] `OPENAI_API_KEY` is set in `.env.local`
- [ ] OpenAI account has available credits
- [ ] Query is in English
- [ ] Query is not empty
- [ ] Network connection is stable
- [ ] Apollo API key is valid (separate check)
- [ ] Apollo account has available credits

## Code Files

### New Files

- `/src/app/api/apollo/parse-query/route.ts` - AI query parser endpoint

### Modified Files

- `/src/app/dashboard/page.tsx` - Added AI search tab and handlers

## Testing

### Manual Testing Steps

1. Navigate to Dashboard
2. Click on "🤖 AI Search" tab
3. Enter: "VP in SF"
4. Click "Parse Query"
5. Verify parsed parameters show correctly
6. Click "Search Leads"
7. Verify leads are returned or appropriate message shown

### Edge Cases

- Empty query → Error message
- Very long query → Handled gracefully
- Special characters → Preserved and normalized
- Multiple locations → All extracted
- Typos → AI attempts to correct
- Numbers (e.g., "100+") → Correctly parsed as company size
