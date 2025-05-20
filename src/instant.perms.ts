import { InstantRules } from "@instantdb/react";

const rules = {
  teams: {
    bind: ["isCreator", "auth.id == data.creatorId", "isMember", "auth.id in data.ref('memberships.userId')"],
    allow: {
      view: "isMember",
      create: "isCreator",
      delete: "isCreator",
      update: "isCreator",
    },
  },
  invites: {
    bind: ["isMember", "auth.id in data.ref('teams.memberships.userId')", "isInvitee", "auth.email == data.userEmail"],
    allow: {
      view: "isInvitee",
      create: "isMember",
      delete: "isMember",
      update: "isInvitee",
    },
  },
  drawings: {
    bind: ["isMember", "auth.id in data.ref('teams.memberships.userId')"],
    allow: {
      view: "isMember",
      create: "isMember",
      delete: "isMember",
      update: "isMember",
    },
  },
  memberships: {
    bind: [
      "isMember",
      "auth.id in data.ref('teams.memberships.userId')",
      "isCreator",
      "auth.id in data.ref('teams.creatorId')",
      "isUser",
      "auth.id == data.userId",
      "isInvitee",
      "auth.email in data.ref('teams.invites.userEmail')",
    ],
    allow: {
      view: "isMember",
      create: "isCreator",
      delete: "isUser",
      update: "isInvitee",
    },
  },
} satisfies InstantRules;

export default rules;
