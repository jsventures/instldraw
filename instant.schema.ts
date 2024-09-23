import "dotenv/config";

import { i } from "@instantdb/react";

const graph = i.graph(
  {
    drawings: i.entity({
      name: i.string(),
      state: i.json(),
    }),
    invites: i.entity({
      teamId: i.string(),
      teamName: i.string(),
      userEmail: i.string(),
    }),
    memberships: i.entity({
      teamId: i.string(),
      userEmail: i.string(),
      userId: i.string(),
    }),
    teams: i.entity({
      creatorId: i.string(),
      name: i.string(),
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
