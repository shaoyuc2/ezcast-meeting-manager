<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# EZCast Meeting Manager

A meeting reservation dashboard for trade shows (CES, Computex, etc.). Automatically syncs bookings from Cal.com and manages team assignments with Firebase Firestore real-time persistence — useful for on-site teams who need to divide incoming meetings among members during an event.

## Features

- 🗓️ **Cal.com sync** — Pulls bookings via Cal.com v1 API, filtered by event year
- 👥 **Team assignment** — Assign each meeting (per guest) to a responsible team member
- ⚡ **Real-time multi-device sync** — Members and assignments sync instantly across devices via Firestore `onSnapshot`
- 🕐 **Configurable timezone & locale** — Display event times in the event's local timezone
- 🎨 **Grouped by date, color-coded by time slot** — Easy to scan on-site

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite 6
- **Realtime backend:** Firebase Firestore
- **External API:** Cal.com v1 (`/bookings`)
- **UI:** Tailwind (CDN) + `lucide-react`

## Getting Started

### Prerequisites

- Node.js 18+
- A Cal.com account with API access
- Your own Firebase project (free tier is enough)

### 1. Set up Firebase (one-time)

This project needs **your own** Firebase project — it ships with no backend of its own.

1. Go to [Firebase Console](https://console.firebase.google.com) → **Add project**
2. Enable **Firestore Database** (Build → Firestore Database → Create database)
3. (Recommended) Enable **Authentication** → Email/Password or Google, so the rules below work
4. Project Settings → General → Your apps → **Web app** → copy the config values
5. Apply the security rules: copy `firestore.rules` from this repo into **Firestore → Rules** tab and publish

### 2. Get Cal.com API key

[Create an API key](https://app.cal.com/settings/developer/api-keys) in your Cal.com account.

### 3. Clone & configure

```bash
git clone https://github.com/shaoyuc2/ezcast-meeting-manager.git
cd ezcast-meeting-manager
npm install
cp .env.example .env.local
```

Edit `.env.local` and fill in all values:

```
VITE_CAL_API_KEY=...
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
# ...etc

VITE_APP_EVENT_NAME=CES           # or Computex, IFA, MWC, ...
VITE_APP_YEAR=2026
VITE_TIMEZONE=America/Los_Angeles # event timezone
VITE_LOCALE=en-US                 # or zh-TW
```

### 4. Run

```bash
npm run dev       # http://localhost:3000
npm run build     # production build to dist/
npm run preview   # preview production build
```

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
├── constants.ts               # Reads all config from env vars
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

The assignment doc ID combines booking ID and guest email so that a single meeting with multiple guests can be split across different team members.

## Security Notes

- **Firebase Web config is public-safe** — the API key in your bundle is not a secret. Access control is enforced by **Firestore Security Rules**. Do not skip step 1.5 above.
- **Cal.com API key is a secret.** The current implementation passes it via query string (Cal.com v1 pattern). Do not deploy the built app publicly without a backend proxy, or it will leak in browser network logs.
- If you fork this for your own event, always create your own Firebase project and Cal.com key. Do not reuse someone else's.

## License

MIT — see [LICENSE](./LICENSE).
