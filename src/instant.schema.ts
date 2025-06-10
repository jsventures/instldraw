import { i } from "@instantdb/react";
import { TLInstancePresence } from "tldraw";

const schema = i.schema({
  entities: {
    drawings: i.entity({
      name: i.string(),
      state: i.json().optional(),
    }),
    invites: i.entity({
      teamId: i.string(),
      teamName: i.string(),
      userEmail: i.string(),
      status: i.string().optional(),
      membershipId: i.string(),
    }),
    memberships: i.entity({
      teamId: i.string(),
      userEmail: i.string(),
      userId: i.string().optional(),
    }),
    teams: i.entity({
      creatorId: i.string(),
      name: i.string(),
    }),
  },
  links: {
    drawingsTeams: {
      forward: {
        on: "drawings",
        has: "one",
        label: "teams",
      },
      reverse: {
        on: "teams",
        has: "many",
        label: "drawings",
      },
    },
    invitesTeams: {
      forward: {
        on: "invites",
        has: "one",
        label: "teams",
      },
      reverse: {
        on: "teams",
        has: "many",
        label: "invites",
      },
    },
    invitesMemberships: {
      forward: {
        on: "invites",
        has: "one",
        label: "memberships",
      },
      reverse: {
        on: "memberships",
        has: "many",
        label: "invites",
      },
    },
    membershipsTeams: {
      forward: {
        on: "memberships",
        has: "one",
        label: "teams",
      },
      reverse: {
        on: "teams",
        has: "many",
        label: "memberships",
      },
    },
  },
  rooms: {
    drawings: {
      presence: i.entity({
        tldraw: i.json<TLInstancePresence>(),
      }),
    },
  },
});

export default schema;
