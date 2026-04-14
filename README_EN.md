<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

**Language 語言**: [繁體中文](./README.md) | English

# EZCast Meeting Manager

A meeting reservation dashboard for on-site teams at trade shows (CES, Computex, etc.). Automatically syncs Cal.com bookings and lets the team assign meetings to individual members in real time via Firebase Firestore. Designed for situations where a large number of customer meetings need to be divided across AMs / BDs / engineers during an event.

## Features

- 🗓️ **Cal.com booking sync** — Pulls all bookings via Cal.com v1 API, filtered by event year
- 👥 **Team assignment** — Assign each meeting (per guest email) to a responsible team member
- ⚡ **Real-time multi-device sync** — Members and assignments sync instantly across devices via Firestore `onSnapshot`
- 🕐 **Configurable timezone & locale** — Adjust per event location (e.g., CES → LA, Computex → Taipei)
- 🎨 **Grouped by date, color-coded by time slot** — Easy to scan on-site

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite 6
- **Realtime backend:** Firebase Firestore
- **External API:** Cal.com v1 (`/bookings`)
- **UI:** Tailwind (CDN) + `lucide-react`

---

## 🧭 Roles & Responsibilities (Read Before Deploying)

This dashboard requires **cross-team collaboration** to deploy, because:

> **Cal.com API keys are account-scoped** — a key can only read bookings that belong to the account that generated it.
> So **whoever owns the customer-facing booking page must be the one who creates the Cal.com account and generates the API key**, then hands the key to IT for deployment.

| Role | Owns |
|------|------|
| **Marketing / Sales team** | Cal.com account, public booking URL (Event Type), availability slots, generating API key |
| **IT team** | Firebase project, environment variables, deployment, Firestore security rules |

**Important: IT should not create their own Cal.com key** — that key would only read IT's personal bookings, not the ones customers submit via the marketing team's booking URL.

---

## 📋 Deployment Guide

### Part 1: Marketing / Sales team (Cal.com side)

#### 1. Create a Cal.com account
Sign up at [https://cal.com](https://cal.com) (or use an existing company account). Use a shared company email — don't bind to an individual's personal email.

#### 2. Create the booking URL (Event Type)
After login → **Event Types** → **Create** → configure:
- Name (e.g., `CES 2026 Booth Meeting`, `Computex 2026 Demo`)
- Duration (15 / 30 / 60 min)
- Location (on-site booth, video link, etc.)
- After publishing you get a public URL, e.g. `cal.com/your-company/ces-2026`

#### 3. Set availability slots
**Availability** → configure which times during the event can be booked.
- Mind the timezone — usually set to the event location (CES: Pacific, Computex: Taipei)
- Block out lunch / team sync / anything you don't want clients to book

#### 4. Distribute the booking URL
Share via email, EDMs, business cards, LinkedIn, etc. Customers pick their own slots; Cal.com auto-sends confirmations and records the booking.

#### 5. Generate the API key, hand it to IT
Go to **Settings → Developer → API Keys**
👉 [https://app.cal.com/settings/developer/api-keys](https://app.cal.com/settings/developer/api-keys)

- Click **+ Add** to create a new key
- Name it (e.g., `EZCast Dashboard`), **no expiration** (or set it to a week after the event)
- Copy the generated key (format: `cal_live_xxxxx...`)
- **⚠️ The key is shown only once.** Share it with IT via a secure channel (1Password, Bitwarden, etc.). Not Slack DM in plain text.

---

### Part 2: IT team (deployment side)

#### Prerequisites
- Node.js 18+
- Firebase account (any Google account)
- Cal.com API key received from marketing

#### 1. Set up your own Firebase project (one-time)
This project needs **your own** Firebase backend — it must not share another org's.

1. Go to [Firebase Console](https://console.firebase.google.com) → **Add project**
2. Enable **Firestore Database** (Build → Firestore Database → Create database)
3. (Recommended) Enable **Authentication** — Email/Password or Google
4. Project Settings → General → Your apps → **Web app** → copy the Firebase SDK config values
5. Apply security rules: copy the contents of `firestore.rules` from this repo into **Firestore → Rules** and publish

#### 2. Clone & configure

```bash
git clone https://github.com/shaoyuc2/ezcast-meeting-manager.git
cd ezcast-meeting-manager
npm install
cp .env.example .env.local
```

Edit `.env.local` with all values:

```
# From marketing
VITE_CAL_API_KEY=cal_live_xxxxxxx...

# From Firebase Console
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# Event config
VITE_APP_EVENT_NAME=CES              # CES / Computex / IFA / MWC ...
VITE_APP_YEAR=2026
VITE_TIMEZONE=America/Los_Angeles    # event location
VITE_LOCALE=en-US                    # display locale
```

#### 3. Run

```bash
npm run dev       # http://localhost:3000
npm run build     # production build to dist/
npm run preview   # preview production build
```

#### 4. Deploy (pick what your team uses)
- **Firebase Hosting**: `firebase init hosting && firebase deploy`
- **Vercel / Netlify**: connect the GitHub repo, add the `.env.local` variables as platform env vars
- **Self-hosted**: drop `dist/` into nginx

---

## Project Structure

```
├── App.tsx                    # Main container
├── components/
│   ├── Sidebar.tsx            # Nav (Bookings / Members)
│   ├── BookingCard.tsx        # Meeting card + assignment dropdown
│   └── MemberManagement.tsx   # Add / remove members
├── services/
│   ├── calService.ts          # Cal.com API
│   ├── firebaseService.ts     # Firestore subscribe / mutate
│   └── syncService.ts
├── constants.ts               # All config via env vars
├── types.ts
├── firestore.rules            # Starter Firestore security rules
└── .env.example               # All required env vars
```

## Firestore Data Model

```
members/                         # collection
  └── {memberId}  { name: string }

assignments/                     # collection
  └── {bookingId}_{guestEmail}  { memberId: string }
```

Assignment doc ID combines booking ID and guest email so a single meeting with multiple guests can be split across members.

## Security Notes

- **Firebase Web config is public-safe** — the API key in the bundle isn't a secret. Access control is enforced by **Firestore Security Rules**. Don't skip Part 2 step 1.5.
- **Cal.com API key is a real secret.** The current implementation passes it via query string (Cal.com v1 pattern). Do not deploy a built version to a public CDN or open-source fork — it will leak in browser network logs. Use only for internal / private deployments.
- **Forks must use their own Firebase and Cal.com accounts.** Do not reuse the original author's resources.

## License

MIT — see [LICENSE](./LICENSE)
