import type { DrawingState } from "@/types";
import { id } from "@instantdb/react";
import clientDB from "@/lib/clientDB";

export async function createDrawingForTeam({ teamId, drawingName }: { teamId: string; drawingName: string }) {
  const drawingId = id();

  const result = await clientDB.transact([
    clientDB.tx.drawings[drawingId].merge({ name: drawingName ?? "Untitled" }),
    clientDB.tx.drawings[drawingId].link({ teams: teamId }),
    clientDB.tx.teams[teamId].link({ drawings: drawingId }),
  ]);

  return { result, vars: { drawingId } };
}

export async function createTeamWithMember({
  teamName,
  userEmail,
  userId,
}: {
  teamName: string;
  userEmail: string;
  userId: string;
}) {
  const teamId = id();
  const membershipId = id();

  const result = await clientDB.transact([
    clientDB.tx.teams[teamId].update({ name: teamName, creatorId: userId }),
    clientDB.tx.memberships[membershipId].update({ teamId, userId, userEmail }),
    clientDB.tx.memberships[membershipId].link({ teams: teamId }),
  ]);

  return {
    result,
    vars: {
      teamId,
      membershipId,
    },
  };
}

export async function inviteMemberToTeam({
  teamId,
  userEmail,
  teamName,
}: {
  teamId: string;
  userEmail: string;
  teamName: string;
}) {
  const inviteId = id();
  const membershipId = id();

  const result = await clientDB.transact([
    clientDB.tx.memberships[membershipId].update({
      teamId,
      userEmail,
    }),
    clientDB.tx.memberships[membershipId].link({ teams: teamId }),
    clientDB.tx.invites[inviteId].update({ userEmail, teamId, teamName, membershipId }),
    clientDB.tx.invites[inviteId].link({ teams: teamId, memberships: membershipId }),
  ]);

  return {
    result,
    vars: { inviteId, membershipId },
  };
}

export async function acceptInvite({
  inviteId,
  membershipId,
  userId,
}: {
  inviteId: string;
  membershipId: string;
  userId: string;
}) {
  const result = await clientDB.transact([
    clientDB.tx.memberships[membershipId].update({ userId }),
    clientDB.tx.invites[inviteId].update({ status: "accepted" }),
  ]);

  return {
    result,
  };
}
export async function declineInvite({ inviteId }: { inviteId: string }) {
  const result = await clientDB.transact([clientDB.tx.invites[inviteId].merge({ status: "declined" })]);

  return {
    result,
  };
}

export function updateDrawingState({ drawingId, state }: { drawingId: string; state: DrawingState }) {
  return clientDB.transact(clientDB.tx.drawings[drawingId].merge({ state }));
}

export function updateDrawingName({ drawingId, name }: { drawingId: string; name: string }) {
  return clientDB.transact(clientDB.tx.drawings[drawingId].merge({ name }));
}

export function deleteDrawing({ drawingId }: { drawingId: string }) {
  return clientDB.transact(clientDB.tx.drawings[drawingId].delete());
}
