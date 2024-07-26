import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("temp_user", {
  id: serial("id").primaryKey(),
  fullname: text("full_name"),
  description: varchar("description", { length: 256 })
});

export type User = typeof users.$inferSelect; // return type when queried
