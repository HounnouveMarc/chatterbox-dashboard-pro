import { db } from './index';
import { companies, login } from './schema';
import bcrypt from 'bcryptjs';

export async function createUserAndCompany(userData: {
  phone: string;
  password: string;
  companyName: string;
  metaId: string;
  whatsappToken: string;
}) {
  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  // Insérer d'abord la company
  const [newCompany] = await db.insert(companies)
    .values({
      name: userData.companyName,
      numberId: userData.metaId,
      token: userData.whatsappToken,
      prompt: `Tu es assistant personnel de ${userData.companyName}`,
      // sales_data_url sera mis à jour plus tard
    })
    .returning({ id: companies.id });

  // Ensuite insérer les informations de login
  await db.insert(login)
    .values({
      phone: userData.phone,
      password: hashedPassword,
      companyId: newCompany.id,
    });

  return newCompany.id;
} 