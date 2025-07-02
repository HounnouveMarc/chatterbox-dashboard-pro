import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'Koudous311,?', // À remplacer par votre mot de passe
    database: 'whatsapp_bot', // À remplacer par le nom de votre base de données
  },
} satisfies Config; 