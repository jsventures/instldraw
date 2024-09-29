import { TLRecord } from "tldraw";

type InstantTLRecord = TLRecord & {
  meta: { source: string; version: string; deleted?: boolean };
};

export type DrawingState = Record<string, InstantTLRecord | null>;
