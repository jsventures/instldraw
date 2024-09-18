import { db } from "@/lib/config";
import { useEffect, useRef } from "react";
import {
  atom,
  createPresenceStateDerivation,
  react,
  TLInstancePresence,
  TLInstancePresenceID,
  Editor,
} from "tldraw";

export function useInstantPresence({
  editor,
  drawingId,
  user,
}: {
  editor: Editor;
  drawingId: string;
  user: { id: string; color: string; name: string };
}) {
  const room = db.room("drawings", drawingId);
  const presence = room.usePresence();
  const prevPeersRef = useRef<Record<string, { tldraw: TLInstancePresence }>>(
    {}
  );

  useEffect(() => {
    if (presence.isLoading) return;
    const prevPeers = prevPeersRef.current;

    const peers = Object.entries(presence.peers).filter(([k, p]) => p.tldraw);

    const updates = peers.map(([k, p]) => p.tldraw);
    const removals = Object.entries(prevPeers)
      .filter(([k, v]) => !presence.peers[k] && v.tldraw)
      .map(([k, v]) => v.tldraw.id) as TLInstancePresenceID[];

    if (updates) editor.store.put(updates);
    if (removals) editor.store.remove(removals);

    prevPeersRef.current = presence.peers;
  }, [presence.peers]);

  useEffect(() => {
    const userAtom = atom<{ id: string; color: string; name: string }>("user", {
      ...user,
    });

    const tldrawPresenceSignal = createPresenceStateDerivation(userAtom)(
      editor.store
    );

    const stop = react("publish presence", () => {
      const userPresence = tldrawPresenceSignal.get();
      if (!userPresence) return;

      presence.publishPresence({ tldraw: userPresence });
    });

    return stop;
  }, [user.id, user.color, user.name]);
}
