"use client";
// See https://nextjs.org/docs/pages/building-your-application/upgrading/app-router-migration
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { User } from "@instantdb/react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/config";
import { InstantAuth } from "@/components/InstantAuth";
import { useDialog, PromptDialog } from "@/components/UI";

import {
	createTeamWithMember,
	acceptInvite,
	declineInvite,
	inviteMemberToTeam,
	createDrawingForTeam,
	deleteDrawing,
} from "@/lib/mutators";

import "@/lib/__dev";

export const drawingsPerPage = 5;

export default function Page() {
	const auth = db.useAuth();

	return (
		<div className="mx-auto max-w-md flex flex-col py-4 px-2 gap-3">
			<a className="font-mono font-bold" href="/">
				{`<instldraw />`}
			</a>
			{auth.isLoading ? (
				<em>Loading...</em>
			) : auth.error ? (
				<strong>Oops, an error occurred!</strong>
			) : !auth.user ? (
				<InstantAuth />
			) : (
				<Index user={auth.user} />
			)}
		</div>
	);
}

function Index({ user }: { user: User; }) {
	const teamDialog = useDialog();
	const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
	const result = db.useQuery({
		teams: {
			$: {
				where: {
					"memberships.userId": user.id,
				},
			},
		},
		invites: {
			$: {
				where: {
					userEmail: user.email,
				},
			}
		},
	});

	const { invites, teams } = result.data ?? {};

	const team = useMemo(() => {
		return selectedTeamId
			? teams?.find((t) => t.id === selectedTeamId)
			: undefined;
	}, [selectedTeamId, teams]);

	const pendingInvites = useMemo(() => {
		const teamIds = new Set(teams?.map((t) => t.id) ?? []);
		return invites?.filter((invite) => !teamIds.has(invite.teamId)) ?? [];
	}, [invites, teams]);

	useEffect(() => {
		if (team && teams?.find((t) => t.id === team.id)) return;

		const firstTeam = teams?.at(0);
		if (!firstTeam) return;

		setSelectedTeamId(firstTeam.id);
	}, [teams]);

	return (
		<div>
			{teamDialog.isOpen ? (
				<PromptDialog
					title="Team name"
					onClose={teamDialog.close}
					onSubmit={async (teamName) => {
						const response = await createTeamWithMember({
							teamName,
							userEmail: user.email,
							userId: user.id,
						});

						setSelectedTeamId(response.vars.teamId);
					}}
				/>
			) : null}
			{result.isLoading ? (
				<em>Loading...</em>
			) : result.error ? (
				<strong>Oops, an error occurred!</strong>
			) : result.data.teams.length === 0 && result.data.invites.length === 0 ? (
				<div className="flex flex-col gap-2">
					<h2 className="font-bold text-xl">Welcome!</h2>
					<p>Create your first team to get started.</p>
					<button
						className="bg-black text-white py-0.5 px-3 rounded text-sm"
						onClick={teamDialog.open}
					>
						Let's go!
					</button>
				</div>
			) : (
				<div className="flex flex-col gap-4">
					{pendingInvites.length ? (
						<div className="flex flex-col gap-1 text-gray-600 bg-gray-50 rounded border py-2 px-3">
							<h2 className="font-bold">Team invites</h2>
							{pendingInvites.map((invite) => {
								return (
									<div key={invite.id} className="flex gap-2">
										{invite.teamName}
										<button
											className="bg-black text-white py-0.5 px-3 rounded text-sm"
											onClick={async () => {
												acceptInvite({
													teamId: invite.teamId,
													userEmail: user.email,
													userId: user.id,
												});
											}}
										>
											Accept
										</button>
										<button
											className="bg-black text-white py-0.5 px-3 rounded text-sm"
											onClick={async () => {
												declineInvite({ inviteId: invite.id });
											}}
										>
											Decline
										</button>
									</div>
								);
							})}
						</div>
					) : null}
					<div className="flex flex-col gap-4">
						<div className="flex items-center gap-2">
							<label>Teams</label>
							<select
								className="flex-1 border py-0"
								value={selectedTeamId ?? undefined}
								onChange={(e) => setSelectedTeamId(e.target.value ?? null)}
							>
								{result.data?.teams.map((team) => (
									<option key={team.id} value={team.id}>
										{team.name}
									</option>
								))}
							</select>
							<button
								className="bg-black text-white py-0.5 px-3 rounded text-sm"
								onClick={teamDialog.open}
							>
								New team
							</button>
						</div>
						{team ? <Team team={team} /> : null}
					</div>
				</div>
			)}
		</div>
	);
}

function Team({
	team,
}: {
	team: {
		id: string;
		name: string;
	};
}) {
	const router = useRouter();
	const [pageNumber, setPageNumber] = useState(1);
	const inviteMemberDialog = useDialog();
	const newDrawingDialog = useDialog();

	const { isLoading, error, data } = db.useQuery({
		drawings: {
			$: {
				where: {
					"teams.id": team.id,
				},
				limit: drawingsPerPage,
				offset: drawingsPerPage * (pageNumber - 1),
			},
		},
		memberships: {
			$: {
				where: {
					"teams.id": team.id,
				},
			},
		},
	});

	const drawings = data?.drawings ?? [];
	const memberships = data?.memberships ?? [];

	// begin: pagination
	// hack to check if there is a next page
	// by fetching one more item than the page size
	// if there is a next page, we will enable a "next" button
	// in the future, useQuery should give us a way to check if there is a next page
	const _pageLookaheadQuery = db.useQuery({
		drawings: {
			$: {
				where: {
					"teams.id": team.id,
				},
				limit: drawingsPerPage + 1,
				offset: drawingsPerPage * (pageNumber - 1),
			},
		},
	});

	const hasNextPage =
		data &&
		_pageLookaheadQuery.data &&
		_pageLookaheadQuery.data?.drawings.length > drawings.length;

	const loadNextPage = () => {
		if (!hasNextPage) return;
		setPageNumber(pageNumber + 1);
	};

	const loadPreviousPage = () => {
		if (pageNumber <= 1) return;
		setPageNumber(pageNumber - 1);
	};
	// end: pagination

	return (
		<div>
			{inviteMemberDialog.isOpen ? (
				<PromptDialog
					title="User's email address"
					onClose={inviteMemberDialog.close}
					onSubmit={(userEmail) => {
						inviteMemberToTeam({
							teamId: team.id,
							userEmail,
							teamName: team.name,
						});
					}}
				/>
			) : null}
			{newDrawingDialog.isOpen ? (
				<PromptDialog
					title="Drawing name"
					onClose={newDrawingDialog.close}
					onSubmit={async (drawingName) => {
						const response = await createDrawingForTeam({
							teamId: team.id,
							drawingName,
						});

						await router.push(`/drawings/${response.vars.drawingId}`);
					}}
				/>
			) : null}
			<div className="flex flex-col gap-2">
				<div className="flex gap-2">
					<button
						className="bg-black text-white py-0.5 px-3 rounded text-sm"
						onClick={newDrawingDialog.open}
					>
						New drawing
					</button>
					<button
						className="bg-black text-white py-0.5 px-3 rounded text-sm"
						onClick={inviteMemberDialog.open}
					>
						Invite team member
					</button>
				</div>
				<h3 className="font-bold">Drawings</h3>
				<div>
					{isLoading ? (
						<em>Loading...</em>
					) : error ? (
						<em>Failed to load drawings</em>
					) : drawings.length ? (
						<div>
							{drawings.map((drawing) => (
								<div
									key={drawing.id}
									className="flex gap-0.5 justify-between hover:bg-gray-100 py-1"
								>
									<Link
										key={drawing.id}
										href={`/drawings/${drawing.id}`}
										className="cursor-pointer flex-1"
									>
										{drawing.name}
									</Link>
									<button
										onClick={(e) => {
											e.stopPropagation();
											deleteDrawing({ drawingId: drawing.id });
										}}
									>
										×
									</button>
								</div>
							))}
						</div>
					) : (
						<em className="text-sm">No drawings</em>
					)}
				</div>
				<div className="items-end flex gap-2 text-lg">
					<button
						className="disabled:text-gray-300"
						disabled={pageNumber === 1}
						onClick={loadPreviousPage}
					>
						←
					</button>
					<button
						className="disabled:text-gray-300"
						disabled={!hasNextPage}
						onClick={loadNextPage}
					>
						→
					</button>
				</div>
				<div className="flex flex-col text-sm text-gray-600 bg-gray-50 rounded border py-2 px-3">
					<div className="font-bold">Members</div>
					{memberships.map((m) => (
						<div className="" key={m.id}>
							{m.userEmail}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
