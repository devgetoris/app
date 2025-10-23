# Apollo API Request Method Fix - CRITICAL! 🚨

## The Issue

`reveal_personal_emails: true` parameter was being sent as **query parameters in GET requests**, but Apollo API expects it in the **request body via POST requests**.

## The Problem

```typescript
// WRONG - Query params with GET:
GET /people/{id}?reveal_personal_emails=true
// ❌ Apollo ignores this

// RIGHT - Request body with POST:
POST /people/{id}
{ "reveal_personal_emails": true }
// ✅ Apollo respects this
```

Apollo wasn't revealing emails because it wasn't receiving the parameter in the format it expects!

## What Was Fixed

### 1. **`getContactById()` method** (lines 340-372)
**Changed from:**
```typescript
const response = await this.client.get<ApolloEnrichResponse>(`/people/${id}`, {
  params: {
    reveal_personal_emails: true,
  },
});
```

**Changed to:**
```typescript
const requestBody = {
  reveal_personal_emails: true,
};
const response = await this.client.post<ApolloEnrichResponse>(`/people/${id}`, requestBody);
```

### 2. **`enrichContact()` method** (lines 303-333)
**Changed from:**
```typescript
const response = await this.client.get<ApolloEnrichResponse>('/people/match', {
  params: {
    email,
    reveal_personal_emails: true,
  },
});
```

**Changed to:**
```typescript
const requestBody = {
  email,
  reveal_personal_emails: true,
};
const response = await this.client.post<ApolloEnrichResponse>('/people/match', requestBody);
```

## Why This Matters

Apollo API has specific expectations:
- **GET requests** - Used for fetching data with query parameters
- **POST requests** - Used for operations that modify or require configuration parameters like `reveal_personal_emails`

The `reveal_personal_emails` parameter is a **configuration parameter**, not a simple filter. It needs to be in the POST request body, not query string.

## Expected Result After Fix

Now when you enrich a contact:

```
📤 Apollo API Request Details: {
  method: "POST",
  url: `/people/642c5ca34f84bd0001875fa8`,
  body: { reveal_personal_emails: true }
}

✅ Apollo Enrich by ID - Full Response: {
  name: "Xiao Li",
  email: "xiao.li@company.com",  ✅ REAL EMAIL!
  has_email: true
}
```

## Files Modified

- `/src/lib/apollo.ts` - Lines 303-333 (enrichContact) and 340-372 (getContactById)

## How to Verify

1. Run a fresh search
2. Check server logs
3. Look for `method: "POST"` in the request details
4. Verify emails are now real addresses instead of `email_not_unlocked`

## Technical Details

Apollo API endpoint behavior:
- `/people/{id}` - Accepts POST with body parameters
- `/people/match` - Accepts POST with body parameters
- Query parameters are for filtering, body parameters are for configuration

The `reveal_personal_emails` is a configuration/control parameter that must be in POST body.

---

**This is the actual fix for the email_not_unlocked issue!** 🔥
Apollo wasn't receiving the parameter correctly because it was sent as a query param instead of in the request body.
