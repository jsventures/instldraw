import type { DrawingState } from "@/lib/instant/types";
import { id, tx } from "@instantdb/react";
import { db } from "@/lib/config";

export async function createDrawingForTeam({
  teamId,
  drawingName,
}: {
  teamId: string;
  drawingName: string;
}) {
  const drawingId = id();

  const result = await db.transact([
    tx.drawings[drawingId].merge({ name: drawingName ?? "Untitled" }),
    tx.drawings[drawingId].link({ teams: teamId }),
    tx.teams[teamId].link({ drawings: drawingId }),
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

  const result = await db.transact([
    tx.teams[teamId].update({ name: teamName, creatorId: userId }),
    tx.memberships[membershipId].update({ teamId, userId, userEmail }),
    tx.memberships[membershipId].link({ teams: teamId }),
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

  const result = await db.transact([
    tx.invites[inviteId].update({ userEmail, teamId, teamName }),
    tx.invites[inviteId].link({ teams: teamId }),
  ]);

  return {
    result,
    vars: { inviteId },
  };
}

export async function acceptInvite({
  teamId,
  userEmail,
  userId,
}: {
  teamId: string;
  userEmail: string;
  userId: string;
}) {
  const membershipId = id();

  const result = await db.transact([
    tx.memberships[membershipId].update({ teamId, userId, userEmail }),
    tx.memberships[membershipId].link({ teams: teamId }),
  ]);

  return {
    result,
  };
}
export async function declineInvite({ inviteId }: { inviteId: string }) {
  const result = await db.transact([
    tx.invites[inviteId].merge({ status: "declined" }),
  ]);

  return {
    result,
  };
}

export function updateDrawingState({
  drawingId,
  state,
}: {
  drawingId: string;
  state: DrawingState;
}) {
  return db.transact(tx.drawings[drawingId].merge({ state }));
}

export function updateDrawingName({
  drawingId,
  name,
}: {
  drawingId: string;
  name: string;
}) {
  return db.transact(tx.drawings[drawingId].merge({ name }));
}

export function deleteDrawing({ drawingId }: { drawingId: string }) {
  return db.transact(tx.drawings[drawingId].delete());
}
