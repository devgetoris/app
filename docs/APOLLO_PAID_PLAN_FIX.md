# Apollo Paid Plan Fix

## Problem

User has a paid Apollo plan but was still getting "email_not_unlocked" for all contacts. The issue
was that we were using the wrong API endpoints and missing the `reveal_personal_emails` parameter.

## Root Cause Analysis

1. **Wrong Enrichment Endpoint**: We were using `/people/{id}` instead of `/people/match`
2. **Missing Email Reveal Parameter**: The `reveal_personal_emails: true` parameter wasn't being
   passed to search endpoints
3. **Incorrect API Usage**: The `/people/{id}` endpoint is for getting contact details, not for
   enrichment

## Solutions Implemented

### 1. Fixed Enrichment Endpoint

**File**: `src/lib/apollo.ts` - `getContactById` method

**Before**:

```typescript
// Wrong endpoint - this is for getting contact details, not enrichment
const response = await this.client.post(`/people/${id}`, requestBody);
```

**After**:

```typescript
// Correct endpoint - People Enrichment endpoint
const response = await this.client.get("/people/match", {
  params: {
    id: id,
    reveal_personal_emails: true,
  },
});
```

### 2. Added Email Reveal Parameter to Search Endpoints

**File**: `src/lib/apollo.ts` - `searchContacts` and `searchOrganizations` methods

**Added**:

```typescript
// Add email reveal parameter for paid plans
searchPayload.reveal_personal_emails = true;
```

### 3. Updated API Documentation Reference

According to Apollo's API documentation:

- **People Enrichment Endpoint**: `/people/match` (not `/people/{id}`)
- **Required Parameter**: `reveal_personal_emails: true` for paid plans
- **Search Endpoints**: Also need `reveal_personal_emails: true` parameter

## Technical Details

### People Enrichment Endpoint

- **Endpoint**: `GET /people/match`
- **Parameters**:
  - `id`: Apollo ID of the person
  - `reveal_personal_emails`: `true` (required for paid plans)
- **Purpose**: Enrich contact data with personal emails and phone numbers

### Search Endpoints

- **People Search**: `POST /mixed_people/search`
- **Organization Search**: `POST /organizations/search`
- **Required Parameter**: `reveal_personal_emails: true`

## Expected Results

### Before Fix

- All contacts showing "email_not_unlocked@domain.com"
- 404 errors when trying to enrich contacts
- No real email addresses returned

### After Fix

- Real email addresses for contacts with unlocked emails
- Proper enrichment using the correct API endpoint
- Better success rate for contact enrichment

## API Usage Examples

### Enrichment Request

```typescript
// Correct way to enrich a contact
const response = await apolloClient.get("/people/match", {
  params: {
    id: "contact_id_here",
    reveal_personal_emails: true,
  },
});
```

### Search Request

```typescript
// Search with email reveal parameter
const searchPayload = {
  q_keywords: "engineers in SF",
  reveal_personal_emails: true, // This was missing!
  // ... other parameters
};
```

## Benefits

### 1. Proper Email Unlocking

- Paid plan users get real email addresses
- No more "email_not_unlocked" for accessible contacts
- Better data quality for lead generation

### 2. Correct API Usage

- Using the right endpoints for the right purposes
- Following Apollo's API documentation
- Proper parameter usage

### 3. Better User Experience

- Users see actual email addresses in search results
- Clear distinction between locked and unlocked emails
- More valuable lead data

## Testing

### What to Test

1. **Search Results**: Should show real emails for contacts with unlocked emails
2. **Enrichment**: Should successfully enrich contacts using the correct endpoint
3. **Email Status**: Should properly distinguish between locked and unlocked emails

### Expected Logs

```
✅ Apollo Enrich by ID - Full Response: {
  name: "John Doe",
  email: "john.doe@company.com",  // Real email, not "email_not_unlocked"
  has_email: true,
  response_status: 200
}
```

## Future Considerations

### Potential Improvements

1. **Error Handling**: Better handling of rate limits and API errors
2. **Caching**: Cache enrichment results to avoid repeated API calls
3. **Batch Processing**: Use bulk enrichment for multiple contacts
4. **Credit Management**: Track and display remaining Apollo credits

### Monitoring

1. **Success Rate**: Monitor enrichment success rates
2. **API Usage**: Track API calls and credit consumption
3. **Error Rates**: Monitor 404 and other API errors

This fix ensures that users with paid Apollo plans get the full benefit of their subscription by
properly unlocking personal emails and using the correct API endpoints.
