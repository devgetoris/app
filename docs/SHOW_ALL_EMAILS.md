# Show All Emails - Feature Update

## Change Summary

Updated the lead search and enrichment endpoints to display **all leads regardless of email
status**, including those with `email_not_unlocked` values.

## What Changed

### Before

- Leads with `email_not_unlocked` were filtered out (skipped)
- Only leads with valid, revealed emails were displayed
- Some potential leads were completely hidden from users

### After

- **All leads are displayed** regardless of email status
- Emails show as `email_not_unlocked` when Apollo hasn't revealed them
- Users can see all available leads and their information
- Full transparency on which emails are locked vs. revealed

## Files Modified

### 1. `/src/app/api/apollo/search/route.ts`

**Removed:**

```typescript
// Skip leads with unrevealed emails
if (enrichedContact.email?.includes("email_not_unlocked")) {
  console.log(`❌ Skipping: Email not unlocked for this contact`);
  continue;
}

if (!enrichedContact.email) {
  console.log(`❌ Skipping: No email available for this contact`);
  continue;
}
```

**Added:**

```typescript
// Show all leads regardless of email status (even if email_not_unlocked)
console.log(`ℹ️ Email status: ${enrichedContact.email || "NO EMAIL"}`);

// ... saves ALL leads to database ...

// Add existing leads regardless of email status
savedLeads.push(existingLead);
```

### 2. `/src/app/api/apollo/enrich/route.ts`

**Removed:**

```typescript
// Skip leads with unrevealed emails
if (contact.email?.includes("email_not_unlocked")) {
  console.log(`❌ Email locked for contact. Email value: ${contact.email}`);
  return NextResponse.json({ error: "Email not revealed for this contact" }, { status: 400 });
}
```

**Added:**

```typescript
// Show all leads regardless of email status (even if email_not_unlocked)
console.log(`ℹ️ Email status: ${contact.email || "NO EMAIL"}`);
```

## User Experience Impact

### Dashboard / Leads Page

- ✅ All leads now appear in the list
- ✅ Users can see leads even if emails aren't revealed
- ✅ `email_not_unlocked` appears in the email field for locked emails
- ✅ Users know all available contacts (even those needing email unlock)

### Workflow

1. Search for leads (AI or Advanced mode)
2. **All matching leads appear** - no hidden results
3. Some emails show `email_not_unlocked` (need to reveal on Apollo)
4. Users can still see company, location, title, and other data
5. Users can request email revelation if needed

## Console Logging

Now shows clearer email status for all leads:

```
📌 Processing contact: John Smith (ID: apollo_123)
   Initial email from search: email_not_unlocked
   🔍 Enriching contact apollo_123...
   ✅ Enrichment successful. Email: email_not_unlocked
   ℹ️ Email status: email_not_unlocked
   💾 Saving new lead with email: email_not_unlocked
```

## Benefits

✅ **Transparency** - Users see all available leads  
✅ **Better Decision Making** - Know what leads exist, even if emails need unlocking  
✅ **No Hidden Data** - Nothing is secretly filtered out  
✅ **Complete Lead List** - Get all results, not a subset  
✅ **Context** - See company, title, location for all leads

## Next Steps (If Needed)

If you want to hide contacts with locked emails again in the future, the filters are documented here
for easy re-implementation.

To only show unlocked emails again:

1. Add back the `email_not_unlocked` check in both routes
2. Skip leads where `contact.email?.includes("email_not_unlocked")`
3. Add `continue;` to skip to next contact

## API Behavior

### Search Endpoint (`POST /api/apollo/search`)

- **Returns:** All matched leads regardless of email status
- **Email field:** Contains either actual email or `email_not_unlocked`
- **No filtering:** All contacts from Apollo API included

### Enrich Endpoint (`POST /api/apollo/enrich`)

- **Returns:** Contact data for specified Apollo ID or email
- **Email field:** Shows whatever Apollo returns (locked or unlocked)
- **No errors:** Doesn't reject leads with locked emails

## Example Output

```json
{
  "success": true,
  "leads": [
    {
      "id": "lead_1",
      "firstName": "John",
      "lastName": "Smith",
      "email": "email_not_unlocked",  // Locked, needs reveal
      "title": "VP of Engineering",
      "companyName": "TechCorp",
      "companyCity": "San Francisco",
      "status": "new"
    },
    {
      "id": "lead_2",
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "jane.doe@company.com",  // Unlocked
      "title": "CTO",
      "companyName": "StartupXYZ",
      "companyCity": "New York",
      "status": "new"
    }
  ],
  "pagination": { ... }
}
```

## Troubleshooting

**Q: Why are some emails showing `email_not_unlocked`?** A: Apollo hasn't revealed their personal
emails yet. You may need to upgrade your Apollo plan or request email revelation.

**Q: Can I still filter these out in my UI?** A: Yes! On the frontend, you can add client-side
filtering if you only want to show leads with actual emails.

**Q: How do I unlock emails?** A: Through the Apollo dashboard > Settings > Email Reveal options

---

All emails are now visible to users, providing complete transparency and better lead insights.
