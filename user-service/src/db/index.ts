import { drizzle } from "drizzle-orm/node-postgres";
import { Client, Pool, PoolClient } from "pg";
import * as schema from "./schema";

export let db: ReturnType<typeof drizzle<typeof schema>>;
export let pooledClient: PoolClient;

export const initDB = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  await client.connect();
  db = drizzle(client, { schema: schema });

  // pooled client
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  // the pool will emit an error on behalf of any idle clients
  // it contains if a backend error or network partition happens
  pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
  });

  pooledClient = await pool.connect();
};
