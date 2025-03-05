import { uniqueId } from "tldraw";

export const isDev = process.env.NODE_ENV === "development";
export const isBrowser = typeof window != "undefined";

export const localSourceId = uniqueId();

export const colorNames = [
  "magenta",
  "red",
  "green",
  "blue",
  "yellow",
  "purple",
];
