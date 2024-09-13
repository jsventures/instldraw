export default {
  teams: {
    bind: [
      "isCreator",
      "auth.id == data.creatorId",
      "isMember",
      "auth.id in data.ref('memberships.userId')",
    ],
    allow: {
      view: "isMember",
      create: "isCreator",
      delete: "isCreator",
      update: "isCreator",
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
};
