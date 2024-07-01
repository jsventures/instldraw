import type { DrawingState } from "@/types";
import { init } from "@instantdb/react";
import { TLInstancePresence, uniqueId } from "tldraw";

const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;

export const isDev = process.env.NODE_ENV === "development";
export const isBrowser = typeof window != "undefined";

export const localSourceId = uniqueId();

export const db = init<
  {
    teams: {
      name: string;
    };
    memberships: {
      userEmail: string;
    };
    drawings: {
      name: string;
      state: DrawingState;
    };
  },
  {
    drawings: {
      presence: { tldraw: TLInstancePresence };
    };
  }
>({
  appId,
});

export const colorNames = [
  "magenta",
  "red",
  "green",
  "blue",
  "yellow",
  "purple",
];
