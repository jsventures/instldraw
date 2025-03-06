import { InstantRules } from "@instantdb/react";

const rules = {
  // This is a production app -- by default we restrict everything
  $default: {
    allow: {
      $default: "false",
    },
  },

  teams: {
    bind: [
      "isCreator",
      "auth.id == data.ref('creator.id')",
      "isMember",
      "auth.id in data.ref('members.id')",
      "isPartOfTeam",
      "isCreator || isMember",
    ],
    allow: {
      // If you're part of the team, you can view the team
      view: "isPartOfTeam",
      // Only the creator can change the team
      $default: "isCreator",
    },
  },

  invites: {
    bind: [
      "isMember",
      "auth.id in data.ref('teams.memberships.userId')",
      "isInvitee",
      "auth.email == data.userEmail",
    ],
    allow: {
      view: "isInvitee",
      create: "isMember",
      delete: "isMember",
      update: "false",
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
      "isInviteeOrCreator",
      "size(data.ref('teams.invites.id')) == 0 ? auth.id in data.ref('teams.creatorId') : auth.email in data.ref('teams.invites.userEmail')",
      "isUser",
      "auth.id == data.userId",
    ],
    allow: {
      view: "isMember",
      create: "isInviteeOrCreator",
      delete: "isUser",
      update: "false",
    },
  },
} satisfies InstantRules;

export default rules;
