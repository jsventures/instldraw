import schema from "@/instant.schema";
import { init } from "@instantdb/react";

const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID!;

const clientDB = init({
  appId,
  schema,
});

export default clientDB;
