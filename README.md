# 🎨 [instldraw](https://draw.instantdb.com/): Team-oriented tldraw built w/ InstantDB

Welcome! We took [tldraw](https://tldraw.dev/)'s infinite canvas and added real-time team collaboration powered by Instant's [graph database](https://www.instantdb.com/docs/instaml) and [presence](https://www.instantdb.com/docs/presence-and-topics).

https://github.com/jsventures/instldraw/assets/1624703/bde87c77-10b5-4267-9c82-20ac6755fabc

### 🎁 Features

- Auth via ["magic code" login](https://www.instantdb.com/docs/auth#magic-codes).
- A full-fledged teams/memberships/invites [data model](https://www.instantdb.com/docs/modeling-data) and secured by [permissions](https://www.instantdb.com/docs/permissions).
- Multiplayer cursors via [presence](https://www.instantdb.com/docs/presence-and-topics).

## 🛣️ Getting Started

### ⚡ 1. Create a free account on [Instant](https://www.instantdb.com/)

Head on over to the [Instant dashboard](https://www.instantdb.com/dash), grab your app's ID, and plop it into a `.env.development.local` file:

```bash
NEXT_PUBLIC_INSTANT_APP_ID=__YOUR_APP_ID__
```

### 🔥 2. Install and Run

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

Install dependencies with your package manager of choice, then start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

That's it! 🎉 Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. Next.js will live-update the page as you edit the app's code.

Finally, to add a layer of security to your app, copy `resources/instant-perms.json` into the [Instant Permissions editor](https://www.instantdb.com/dash?s=main&t=perms).

## 📚 Reference

### 📂 Structure

The app is broken up into two pages:

- An index page `/`, which serves as a dashboard and directory of teams and drawings.
- A drawing page `/drawings/:id` where we render the [tldraw](https://tldraw.dev/) canvas.

Both pages load data from Instant with `db.useQuery` and write data using functions from `src/mutators.ts`.

### 📄 Notable Files

- `src/pages/index.tsx`: The main dashboard: list and manage teams, teammates, and drawings.
- `src/pages/drawings/[id].tsx`: The canvas! Uses `useInstantStore` and `useInstantPresence` to add multiplayer.
- `src/lib/useInstantStore.tsx`: A collaborative backend for tldraw built on top of Instant's real-time database. Uses InstaML's [merge()](https://www.instantdb.com/docs/instaml#merge) for fine-grained updates to the drawing state.
- `src/lib/useInstantPresence.tsx`: A React hook responsible for keeping tldraw's editor state in sync with [Instant's real-time presence API](https://www.instantdb.com/docs/presence-and-topics).
- `src/mutators.ts`: All functions that update Instant's database live here. You can inspect and edit your database using the [Instant Explorer](https://www.instantdb.com/dash?s=main&t=explorer).

### 🧩 Data Model

```graphql
drawings {
  team: @has_one(teams)
  state: DrawingState{} # see src/types.ts
  name: string
}

teams {
  drawings: @has_many(drawings)
  invites: @has_many(invites)
  memberships: @has_many(memberships)
  name: string
  creatorId: string
}

invites {
  team: @has_one(teams)
  teamId: string
  teamName: string
  userEmail: string
}

memberships {
  team: @has_one(teams)
  teamId: string
  userId: string
  userEmail: string
}
```

### 🛡️ Permissions

Instant provides a [permissions layer](https://www.instantdb.com/docs/permissions) to define access control for all entities in your database using [CEL](https://github.com/google/cel-spec/blob/master/doc/langdef.md). Copy the contents of [`resources/instant-perms.json`](https://github.com/jsventures/instldraw/blob/main/resources/instant-perms.json) below into your app's [permissions editor](https://www.instantdb.com/dash?s=main&t=perms).

```json
{
  "teams": {
    "bind": [
      "isCreator",
      "auth.id == data.creatorId",
      "isMember",
      "auth.id in data.ref('memberships.userId')"
    ],
    "allow": {
      "view": "isMember",
      "create": "isCreator",
      "delete": "isCreator",
      "update": "isCreator"
    }
  },
  "invites": {
    "bind": [
      "isMember",
      "auth.id in data.ref('team.memberships.userId')",
      "isInvitee",
      "auth.email == data.userEmail"
    ],
    "allow": {
      "view": "isInvitee",
      "create": "isMember",
      "delete": "isMember",
      "update": "false"
    }
  },
  "drawings": {
    "bind": ["isMember", "auth.id in data.ref('team.memberships.userId')"],
    "allow": {
      "view": "isMember",
      "create": "isMember",
      "delete": "isMember",
      "update": "isMember"
    }
  },
  "memberships": {
    "bind": [
      "isMember",
      "auth.id in data.ref('team.memberships.userId')",
      "isInviteeOrCreator",
      "size(data.ref('team.invites.id')) == 0 ? auth.id in data.ref('team.creatorId') : auth.email in data.ref('team.invites.userEmail')",
      "isUser",
      "auth.id == data.userId"
    ],
    "allow": {
      "view": "isMember",
      "create": "isInviteeOrCreator",
      "delete": "isUser",
      "update": "false"
    }
  }
}
```

- `data` is a variable provided by Instant that references the object being operated upon.
- `auth` is a variable provided by Instant that you can use to access the current user's ID and email.
- You can leverage Instant's graph database in your rule definitions using `data.ref(<key_path>)`.
  - `ref` will traverse an entity's links and collect the values of your specified property path.
  - For example, `isMember` under `bind` for `teams` uses `data.ref('memberships.userId')` to 1) collect all linked memberships for a given team and then 2) select the `userId` property for each membership.
- You can use the `bind` param to define abstractions (`isMember`, `isInvitee`) that can be re-used across rules for that namespace.

## Why Instant?
Instant is a sync engine inspired by Firebase with support for relational data. To learn more, check out [this essay](https://www.instantdb.com/essays/next_firebase).
