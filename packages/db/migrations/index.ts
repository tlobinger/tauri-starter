/**
 * Database Migrations
 *
 * This file exports all migrations as an array.
 * Migrations are applied in order at app startup.
 */

export const migrations = [
  {
    name: "0000_initial_schema.sql",
    sql: `-- Migration: 0000_initial_schema
-- Created by Drizzle Kit
-- This migration creates the initial todos table

CREATE TABLE \`todos\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`title\` text NOT NULL,
	\`completed\` integer DEFAULT 0 NOT NULL,
	\`created_at\` integer NOT NULL,
	\`updated_at\` integer NOT NULL
);`,
  },
] as const;
