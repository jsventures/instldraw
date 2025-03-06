import { i } from "@instantdb/react";
import { TLInstancePresence } from "tldraw";

const schema = i.schema({
  entities: {
    $users: i.entity({
      email: i.string().unique().indexed(),
    }),
    drawings: i.entity({
      name: i.string(),
      state: i.json(),
    }),
    invites: i.entity({
      email: i.string().indexed(),
    }),
    teams: i.entity({
      name: i.string(),
    }),
  },
  links: {
    drawingsTeams: {
      forward: {
        on: "drawings",
        has: "one",
        label: "team",
      },
      reverse: {
        on: "teams",
        has: "many",
        label: "drawings",
      },
    },
    teamInvites: {
      reverse: {
        on: "teams",
        has: "many",
        label: "invites",
      },
      forward: {
        on: "invites",
        has: "one",
        label: "team",
      },
    },
    teamMembers: {
      forward: {
        on: "teams",
        has: "many",
        label: "members",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "joinedTeams",
      },
    },
    teamCreators: {
      forward: {
        on: "teams",
        has: "one",
        label: "creator",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "createdTeams",
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
