# Apollo Email Fix Documentation

## Overview

This document explains the fix applied to retrieve personal emails from the Apollo API for leads.

## Problem

Leads were being imported without email addresses, showing `email_not_unlocked` instead of actual email values.

## Root Cause

The Apollo API requires the `reveal_personal_emails=true` parameter to return personal email addresses. This parameter was not being included in the API requests.

## Solution

### Changes Made

#### 1. **Updated `/src/lib/apollo.ts`**
   - Added `reveal_personal_emails: true` parameter to `searchContacts()` method
   - Added `reveal_personal_emails: true` parameter to `enrichContact()` method  
   - Added `reveal_personal_emails: true` parameter to `getContactById()` method
   - Added comprehensive console logging with emoji indicators for easier debugging

#### 2. **Updated `/src/app/api/apollo/search/route.ts`**
   - Added detailed per-contact logging to track email retrieval
   - Added skip logic for contacts without emails
   - Enhanced error messages with context
   - Logs show: Processing status → Enrichment → Email status → Save confirmation

#### 3. **Updated `/src/app/api/apollo/enrich/route.ts`**
   - Added request logging to show what parameters are being used
   - Added detailed response logging for email retrieval
   - Added context to error messages
   - Shows final email value before returning response

## Console Logging Output

When performing a lead search, you'll now see logs like:

```
🔍 Apollo Search - Input params: { ... }
📤 Apollo Search - Full request payload: { ..., reveal_personal_emails: true }
✅ Apollo Search - Response received: {
  total_entries: 25,
  returned_count: 25,
  has_emails: true
}
  Contact 1: John Smith - Email: john@company.com
  Contact 2: Jane Doe - Email: jane@company.com
  ...

📌 Processing contact: John Smith (ID: apollo_123)
   Initial email from search: john@company.com
   🔍 Enriching contact apollo_123...
   ✅ Enrichment successful. Email: john@company.com
   💾 Saving new lead with email: john@company.com

✨ Search complete. Saved 25 leads.
```

### Debug Legend

| Symbol | Meaning |
|--------|---------|
| 🔍 | Searching or retrieving data |
| 📤 | Sending data to API |
| ✅ | Success |
| ❌ | Failure/Skip |
| ⚠️ | Warning |
| 📌 | Processing stage |
| 💾 | Saving to database |
| 🔧 | Configuration/Setup |
| ℹ️ | Information |
| ✨ | Complete/Final |

## How to Verify the Fix

1. **Check Console Output**
   - Open your browser's developer console (F12)
   - Or check server logs if running in Node.js
   - Look for the logging output described above

2. **Check Database**
   - Query the `leads` table to verify emails are populated
   - Leads should have non-empty `email` fields
   - Should NOT contain `"email_not_unlocked"`

3. **Test Lead Search**
   - Go to Dashboard > Search Leads
   - Enter search criteria
   - Click "Search"
   - Verify results have email addresses

## Troubleshooting

### Issue: Still seeing `email_not_unlocked`

**Causes:**
- Apollo API key doesn't have permission to reveal emails
- User's account on Apollo is on the free tier (which doesn't reveal emails)
- Contact is in a GDPR-compliant region

**Solution:**
1. Verify your Apollo plan supports email revelation
2. Check API key permissions in Apollo dashboard
3. Review GDPR restrictions for specific contacts

### Issue: No emails returned at all

**Possible Causes:**
- API key invalid or expired
- Rate limits exceeded
- Apollo API downtime

**Debug Steps:**
1. Check console logs for error messages (marked with ❌)
2. Verify `APOLLO_API_KEY` environment variable is set
3. Test Apollo API directly with curl using the documented examples
4. Check Apollo status page

### Issue: Only some contacts have emails

**Possible Causes:**
- Those contacts genuinely don't have emails in Apollo's database
- Those contacts are in GDPR regions
- Enrichment failed for those specific records

**What to Check:**
1. Review the per-contact logs for ⚠️ warnings
2. Check if enrichment failed for specific contacts
3. Verify GDPR country restrictions

## API Parameters Explained

### `reveal_personal_emails: true`

According to Apollo API documentation:

> Set to true if you want to enrich all matched people with personal emails. This potentially consumes credits as part of your Apollo pricing plan. The default value is false.
> 
> If a person resides in a GDPR-compliant region, Apollo will not reveal their personal email.

**Credit Consumption:**
- Revealing emails consumes additional credits per the Apollo pricing plan
- Monitor your Apollo dashboard for credit usage
- Each person enriched with email revelation counts against your quota

## Monitoring

### Daily Checks
- Monitor Apollo API usage in Apollo dashboard
- Check for any API errors in server logs
- Verify successful email enrichment rate

### Weekly Reviews
- Review credit consumption trends
- Check if GDPR blocks are increasing
- Adjust search criteria if needed

## API Rate Limits

Apollo API has the following rate limits:

- **Per-minute rate limit**: 100 requests/minute (standard)
- **Bulk People Enrichment**: 50% of per-minute rate (50 requests/minute)
- **Hourly limit**: 1000 requests/hour
- **Daily limit**: 10,000 requests/day

**Impact on Implementation:**
- Search endpoint respects these limits
- Enrich endpoint respects these limits
- If limit is exceeded, Apollo returns a 429 error (logged as ❌)

## Future Improvements

Potential enhancements to consider:

1. **Batch Email Enrichment**: Use Apollo's bulk enrichment endpoint for better performance
2. **Cache Email Data**: Store enriched emails to reduce API calls
3. **Retry Logic**: Automatically retry failed enrichments after a delay
4. **Credit Monitoring**: Alert when Apollo credits are running low
5. **GDPR Compliance**: Better handling of GDPR-restricted contacts
6. **Email Validation**: Validate enriched emails before storing

## Reference Links

- [Apollo API Documentation](https://apolloio.mintlify.app/)
- [Apollo People Enrichment](https://apolloio.mintlify.app/reference/bulk-people-enrichment)
- [Apollo Pricing](https://www.apollo.io/pricing)
- [GDPR Compliance](https://www.apollo.io/help-center/articles/343-GDPR-restrictions-on-contact-data)
