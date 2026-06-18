import { pgTable, serial, text, timestamp, varchar, index, uniqueIndex, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const users = pgTable(
  "users",
  {
    id: serial().primaryKey(),
    username: varchar("username", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }),
    password: varchar("password", { length: 255 }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("users_username_idx").on(table.username),
  ]
);

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: serial().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    summary: text("summary").notNull(),
    content: text("content").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("blog_posts_created_at_idx").on(table.created_at),
  ]
);

export const generatedImages = pgTable(
  "generated_images",
  {
    id: serial().primaryKey(),
    userId: integer("user_id"),
    imageUrl: text("image_url").notNull(),
    prompt: text("prompt").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("generated_images_user_id_idx").on(table.userId),
    index("generated_images_created_at_idx").on(table.createdAt),
  ]
);