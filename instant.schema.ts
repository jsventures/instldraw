import "dotenv/config";

import { i } from "@instantdb/react";

const graph = i.graph(
  process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
  {
    drawings: i.entity({
      name: i.any(),
      state: i.any(),
    }),
    invites: i.entity({
      teamId: i.any(),
      teamName: i.any(),
      userEmail: i.any(),
    }),
    memberships: i.entity({
      teamId: i.any(),
      userEmail: i.any(),
      userId: i.any(),
    }),
    teams: i.entity({
      creatorId: i.any(),
      name: i.any(),
    }),
  },
  {
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
  }
);

export default graph;
