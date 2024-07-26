import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as schema from "./schema";

export let db: ReturnType<typeof drizzle<typeof schema>>;

export const initDB = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  await client.connect();
  db = drizzle(client, { schema: schema });
};
