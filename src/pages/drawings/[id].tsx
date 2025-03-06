import "tldraw/tldraw.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Tldraw, useEditor } from "tldraw";

import { updateDrawingName } from "@/mutators";
import { useInstantStore } from "@/lib/useInstantStore";
import { useInstantPresence } from "@/lib/useInstantPresence";
import { colorNames, localSourceId } from "@/config";
import clientDB from "@/lib/clientDB";

export default function Page() {
  const auth = clientDB.useAuth();

  const router = useRouter();
  const drawingId = router.query.id as string;

  useEffect(() => {
    if (auth.isLoading) return;
    if (!auth.user) {
      router.push("/");
    }
  }, [auth.isLoading]);

  return (
    <div className="flex flex-col w-full h-full">
      {auth.isLoading ? (
        <em>Loading...</em>
      ) : auth.error ? (
        <strong>Oops, an error occurred!</strong>
      ) : auth.user ? (
        <InstantTldraw drawingId={drawingId} />
      ) : null}
    </div>
  );
}

function InstantTldraw({ drawingId }: { drawingId: string }) {
  const store = useInstantStore({ drawingId, localSourceId });
  const [displayName, setDisplayName] = useState<string>("");
  const [color, setColor] = useState<string>("blue");

  const { data, isLoading: isDrawingLoading } = clientDB.useQuery({
    drawings: {
      $: {
        where: {
          id: drawingId,
        },
      },
    },
  });

  const [drawingName, setDrawingName] = useState<string>("");

  useEffect(() => {
    if (isDrawingLoading) return;
    const drawing = data?.drawings.find((d) => d.id === drawingId);
    if (!drawing) return;

    setDrawingName(drawing.name);
  }, [isDrawingLoading]);

  return (
    <div className="fixed inset-0 overflow-hidden flex flex-col">
      <div className="flex flex-col md:flex-row text-sm justify-between">
        <div className="flex gap-2 border-b border md:border-none p-2">
          <a className="font-mono font-bold" href="/">
            {`<instldraw />`}
          </a>
          <form
            className="flex items-center gap-1"
            onSubmit={(e) => {
              e.preventDefault();
              updateDrawingName({ drawingId, name: drawingName });
            }}
          >
            <input
              type="text"
              disabled={isDrawingLoading}
              className="flex w-28 px-2 py-0 border text-sm"
              placeholder="Drawing name"
              value={drawingName ?? ""}
              onChange={(e) => setDrawingName(e.currentTarget.value)}
            />
            <button
              className="bg-black text-white px-2 rounded text-sm"
              type="submit"
            >
              Update
            </button>
          </form>
        </div>
        <div className="flex items-center gap-2 p-2 bg-gray-50 md:bg-transparent">
          <input
            type="text"
            className="flex w-28 px-2 py-0 border text-sm"
            placeholder="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.currentTarget.value)}
          />
          <label>Cursor color</label>
          <select
            className="flex py-0 border text-sm w-20"
            value={color}
            onChange={(e) => {
              const c = e.currentTarget.value;
              setColor(c);
            }}
          >
            {colorNames.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Tldraw
        autoFocus
        store={store}
        components={{ DebugMenu: null, DebugPanel: null }}
      >
        {drawingId ? (
          <InstantTldrawCursors
            drawingId={drawingId}
            user={{
              id: localSourceId,
              name: displayName,
              color,
            }}
          />
        ) : null}
      </Tldraw>
    </div>
  );
}

function InstantTldrawCursors({
  drawingId,
  user,
}: {
  drawingId: string;
  user: { id: string; color: string; name: string };
}) {
  const editor = useEditor();

  useInstantPresence({
    editor,
    drawingId,
    user,
  });

  return null;
}
