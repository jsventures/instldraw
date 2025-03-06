import { isBrowser, isDev } from "@/config";
import clientDB from "./lib/clientDB";

// auth dev utils

async function getUser() {
  return (await clientDB._core._reactor.getCurrentUser())?.user;
}

// dev-only!
if (isBrowser && isDev) {
  const g = globalThis as any;

  g.$db = clientDB;
  g.$u = getUser;
}
