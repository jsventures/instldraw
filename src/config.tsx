import schema from "../instant.schema"
import { init_experimental } from "@instantdb/react";
import { uniqueId } from "tldraw";

const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;

export const isDev = process.env.NODE_ENV === "development";
export const isBrowser = typeof window != "undefined";

export const localSourceId = uniqueId();

export const db = init_experimental({ appId, schema })

export const colorNames = [
  "magenta",
  "red",
  "green",
  "blue",
  "yellow",
  "purple",
];
