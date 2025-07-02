import { pgTable, text, timestamp, varchar, serial, integer, jsonb, unique, foreignKey } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Utilise l'ID Firebase
  email: varchar('email', { length: 255 }).notNull().unique(),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  metaId: varchar('meta_id', { length: 255 }).notNull(),
  whatsappToken: varchar('whatsapp_token', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Table companies
export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  numberId: varchar('number_id', { length: 50 }).notNull().unique(),
  token: text('token').notNull(),
  prompt: text('prompt'),
  salesDataUrl: text('sales_data_url'),
});

// Table conversations
export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id),
  userWhatsappId: varchar('user_whatsapp_id', { length: 50 }).notNull(),
  messages: jsonb('messages').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
  responseCount: integer('response_count').default(0),
}, (table) => ({
  companyUserUnique: unique().on(table.companyId, table.userWhatsappId),
}));

// Table processed_messages
export const processedMessages = pgTable('processed_messages', {
  id: serial('id').primaryKey(),
  messageId: varchar('message_id', { length: 100 }).notNull().unique(),
  companyId: integer('company_id').references(() => companies.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Nouvelle table login
export const login = pgTable('login', {
  id: serial('id').primaryKey(),
  phone: varchar('phone', { length: 50 }).notNull().unique(),
  password: text('password').notNull(), // On stockera un hash du mot de passe, pas le mot de passe en clair
  companyId: integer('company_id').references(() => companies.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}); 