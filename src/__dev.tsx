import { tx } from "@instantdb/react";
import { db, isBrowser, isDev } from "@/config";

// auth dev utils

async function getUser() {
  return (await db._core._reactor.getCurrentUser())?.user;
}

async function authn() {
  const email = prompt("Email 📧");
  if (!email) {
    alert("Please provide an email");
    return;
  }
  await db.auth.sendMagicCode({ email });
  const code = prompt("Check your email for the magic code 🪄");
  if (!code) {
    alert("Please try again and provide an code");
    return;
  }
  try {
    await db.auth.signInWithMagicCode({ email, code });
    alert("Signed in 👍");
  } catch (error) {
    alert("Failed to sign in ❌");
  }
}

// random stuff
// @ts-ignore
function quickTransact(op, ns, eid, v) {
  return db.transact([
    // @ts-ignore
    tx[ns][eid][op](v),
  ]);
}

function oneOffQuery(query: any) {
  return new Promise((resolve, reject) => {
    const unsub = db._core.subscribeQuery(query, (r) => {
      if (r.error) {
        reject(r.error);
      } else {
        resolve(r.data);
      }

      unsub();
    });
  });
}

// dev-only!
if (isBrowser && isDev) {
  const g = globalThis as any;

  g.$db = db;
  g.$auth = authn;
  g.$u = getUser;
  g.$q = oneOffQuery;
  g.$tx = quickTransact;
}
