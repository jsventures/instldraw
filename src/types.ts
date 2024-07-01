import { TLRecord } from "tldraw";

type InstantTLRecord = TLRecord & { meta: { source: string; version: string } };

export type DrawingState = Record<string, InstantTLRecord | null>;
