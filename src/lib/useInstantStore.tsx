import { useEffect, useState } from "react";
import { omitBy, throttle } from "lodash";
import {
  createTLSchema,
  loadSnapshot,
  HistoryEntry,
  TLRecord,
  TLStoreWithStatus,
  createTLStore,
  defaultShapeUtils,
  uniqueId,
  TLShapeId,
  TLStore,
} from "tldraw";

import type { DrawingState } from "@/types";
import { db } from "@/config";
import { updateDrawingState } from "@/mutators";

export function useInstantStore({
  drawingId,
  localSourceId,
}: {
  drawingId: string | null;
  localSourceId: string;
}) {
  const [storeWithStatus, setStoreWithStatus] = useState<TLStoreWithStatus>({
    status: "loading",
  });

  useEffect(() => {
    if (!drawingId) return;
    const _drawingId = drawingId;

    // --- begin: throttling
    // We can set a throttle wait time by adding `?x_throttle=100` to the URL
    // We default to 200ms
    // Setting `x_throttle=0` will bypass throttling
    let pendingState: DrawingState = {};
    const sp = new URL(location.href).searchParams;
    const throttleWaitMs = sp.has("x_throttle")
      ? parseInt(String(sp.get("x_throttle"))) || 0
      : 200;
    const enqueueSync = throttleWaitMs
      ? throttle(runSync, throttleWaitMs, {
          leading: true,
          trailing: true,
        })
      : runSync;

    function sync(state: DrawingState) {
      pendingState = { ...pendingState, ...state };
      enqueueSync();
    }

    function runSync() {
      updateDrawingState({ drawingId: _drawingId, state: pendingState });
      pendingState = {};
    }

    // --- end: throttling
    let lifecycleState: "pending" | "ready" | "closed" = "pending";
    const unsubs: (() => void)[] = [];
    const tlStore = createTLStore({
      shapeUtils: [...defaultShapeUtils],
    });

    db._core.subscribeQuery(
      {
        drawings: {
          $: {
            where: {
              id: drawingId,
            },
          },
        },
      },
      (res) => {
        const state =
          res.data?.drawings?.find((c) => c.id === drawingId)?.state ?? {};

        if (lifecycleState === "pending") {
          initDrawing(state);
        } else if (lifecycleState === "ready") {
          syncInstantStateToTldrawStore(tlStore, state, localSourceId);
        }
      }
    );

    return teardown;

    function handleLocalChange(event: HistoryEntry<TLRecord>) {
      if (event.source !== "user") return;
      sync(tldrawEventToStateSlice(event, localSourceId));
    }

    function initDrawing(state: DrawingState) {
      unsubs.push(
        tlStore.listen(handleLocalChange, {
          source: "user",
          scope: "document",
        })
      );

      tlStore.mergeRemoteChanges(() => {
        loadSnapshot(tlStore, {
          document: {
            store: omitBy(state, (v) => v === null || v.meta.deleted) as Record<
              string,
              TLRecord
            >,
            schema: createTLSchema().serialize(),
          },
        });
      });

      setStoreWithStatus({
        status: "synced-remote",
        connectionStatus: "online",
        store: tlStore,
      });

      lifecycleState = "ready";
    }

    function teardown() {
      setStoreWithStatus({
        status: "not-synced",
        store: tlStore,
      });

      unsubs.forEach((u) => u());

      lifecycleState = "closed";
    }
  }, [drawingId]);

  return storeWithStatus;
}

function tldrawEventToStateSlice(
  event: HistoryEntry<TLRecord>,
  localSourceId: string
) {
  const state: DrawingState = {};

  const items = [
    ...Object.values(event.changes.added),
    ...Object.values(event.changes.updated).map(([_, next]) => next),
  ];

  for (const item of items) {
    state[item.id] = {
      ...item,
      meta: {
        source: localSourceId,
        version: uniqueId(),
      },
    };
  }

  for (const item of Object.values(event.changes.removed)) {
    state[item.id] = {
      ...item,
      meta: {
        source: localSourceId,
        version: uniqueId(),
        deleted: true,
      },
    };
  }

  return state;
}

function syncInstantStateToTldrawStore(
  store: TLStore,
  state: DrawingState,
  localSourceId: string
) {
  // Calling `put` or `remove` on the store would trigger our `handleLocalChange` listener.
  // TLDraw offers a handy `mergeRemoteChanges` method to apply changes without triggering listeners,
  // allowing us to avoid an infinite loop of syncing changes back and forth. :)
  store.mergeRemoteChanges(() => {
    const removeIds = Object.values(state)
      .filter((e) => e?.meta.deleted && store.has(e.id))
      .map((e) => e!.id);

    const updates = Object.values(state).filter((item) => {
      if (!item) return false;
      if (item.meta.deleted) return false;

      const tlItem = store.get(item?.id as TLShapeId);
      // We add a unique id to each version of an item to avoid updating it with the same data
      const diffVersion = tlItem?.meta.version !== item?.meta.version;
      // If the item was not created by the local user, update it
      const diffSource = item?.meta.source !== localSourceId;

      return diffSource && diffVersion;
    });

    if (updates.length) {
      store.put(updates as TLRecord[]);
    }

    if (removeIds.length) {
      store.remove(removeIds as TLShapeId[]);
    }
  });
}
