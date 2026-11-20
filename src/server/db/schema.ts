// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import { index, sqliteTableCreator } from "drizzle-orm/sqlite-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `mini-rx_${name}`);

export const prescriptionRequests = createTable(
  "prescriptionRequest",
  (col) => ({
    id: col.integer({ mode: "number"}).primaryKey({ autoIncrement: true }),
    patientName: col.text({ length: 150 }).notNull(),
    medication: col.text({ length: 256 }).notNull(),
    symptoms: col.text({ length: 256 }).notNull(),
    status: col.text({ enum: ["pending", "approved", "denied", "shipped"] }).notNull().default("pending"),
    createdAt: col
      .integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
  }),
  (t) => [index("request_status_idx").on(t.status)],
);