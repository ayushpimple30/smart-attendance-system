import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Students table - stores registered student information
 */
export const students = mysqlTable("students", {
  id: int("id").autoincrement().primaryKey(),
  studentId: varchar("studentId", { length: 64 }).notNull().unique(), // Unique student identifier
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  embeddings: text("embeddings").notNull(), // JSON array of face embeddings
  imageCount: int("imageCount").default(0).notNull(), // Number of registered face images
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;

/**
 * Sessions table - stores attendance session information
 */
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  sessionName: varchar("sessionName", { length: 255 }).notNull(),
  startTime: timestamp("startTime").defaultNow().notNull(),
  endTime: timestamp("endTime"),
  status: mysqlEnum("status", ["active", "completed", "paused"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * Attendance table - stores individual attendance records
 */
export const attendance = mysqlTable("attendance", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().references(() => sessions.id),
  studentId: int("studentId").notNull().references(() => students.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  confidenceScore: varchar("confidenceScore", { length: 10 }).notNull(), // Stored as string for precision
  livenessScore: varchar("livenessScore", { length: 10 }), // Blink/motion detection score
  faceBoundingBox: text("faceBoundingBox"), // JSON: {x, y, width, height}
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = typeof attendance.$inferInsert;