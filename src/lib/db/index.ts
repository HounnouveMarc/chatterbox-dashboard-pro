import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// Configuration de la connexion PostgreSQL
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'Koudous311,?', // À remplacer par votre mot de passe
  database: 'whatsapp_bot', // À remplacer par le nom de votre base de données
});

// Création de l'instance drizzle
export const db = drizzle(pool);

// Export du pool pour pouvoir le fermer si nécessaire
export const pgPool = pool; 