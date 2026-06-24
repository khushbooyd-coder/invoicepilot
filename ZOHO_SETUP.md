# Connecting Zoho Books — do this when Tapan shares credentials

## What you need from Tapan
- Client ID
- Client Secret  
- Organization ID
(All from https://api-console.zoho.in)

---

## Step 1 — Add credentials to .env

```
ZOHO_CLIENT_ID=paste_here
ZOHO_CLIENT_SECRET=paste_here
ZOHO_ORG_ID=paste_here
ZOHO_REDIRECT_URI=http://localhost:5000/api/zoho/callback
```

Leave ZOHO_REFRESH_TOKEN blank for now.

---

## Step 2 — Start the backend

```bash
cd backend
npm install
node server.js
```

---

## Step 3 — Get the refresh token (one time only)

Open this in your browser:
```
http://localhost:5000/api/zoho/connect
```

- Zoho will ask you to log in and approve access
- After approval it redirects back and shows you a `refresh_token`
- Copy that token

---

## Step 4 — Add refresh token to .env

```
ZOHO_REFRESH_TOKEN=paste_the_token_you_just_copied
```

Restart the backend:
```bash
node server.js
```

---

## Step 5 — Test it

Open:
```
http://localhost:5000/api/zoho/test
```

You should see:
```json
{ "message": "✅ Zoho Books connected and working!", "stats": { ... } }
```

---

## Step 6 — Switch frontend to live data

In `frontend/.env.local`, change:
```
NEXT_PUBLIC_USE_MOCK=false
```

Restart frontend:
```bash
cd frontend
npm run dev
```

Dashboard now shows real invoices, real customers, real renewals. Done.