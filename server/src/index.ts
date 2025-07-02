import express, { Request, Response } from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import multer from 'multer';
import { createCompanyBucket, uploadFileToS3 } from './lib/aws';

dotenv.config();

// Configuration de multer pour stocker les fichiers en mémoire
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite à 5MB
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: any) => {
    const allowedTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/pdf',
      'text/plain'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non supporté'));
    }
  }
});

interface SignupBody {
  phone: string;
  password: string;
  companyName: string;
  metaId: string;
  whatsappToken: string;
}

interface LoginBody {
  phone: string;
  password: string;
}

const app = express();
app.use(cors());
app.use(express.json());

// Configuration de la connexion PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'whatsapp_bot',
});

// Tester la connexion à la base de données
pool.connect((err: any, client: any, done: any) => {
  if (err) {
    console.error('Erreur de connexion à PostgreSQL:', err);
  } else {
    console.log('Connexion à PostgreSQL réussie !');
    done();
  }
});

// Route d'inscription
const handleSignup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, password, companyName, metaId, whatsappToken } = req.body as SignupBody;
    console.log('🚀 Début de l\'inscription pour l\'entreprise:', companyName);
    console.log('🚀 Début de l\'inscription pour l\'entreprise:', companyName);

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✓ Mot de passe hashé avec succès');

    // Créer un bucket S3 pour l'entreprise
    console.log('📦 Création du bucket S3 pour l\'entreprise...');
    const bucketName = await createCompanyBucket(companyName);
    console.log('✓ Bucket S3 créé avec succès:', bucketName);

    // Commencer une transaction
    const client = await pool.connect();
    try {
      console.log('🔄 Début de la transaction PostgreSQL');
      await client.query('BEGIN');

      // Insérer d'abord la company avec le nom du bucket S3
      console.log('💾 Insertion des données de l\'entreprise...');
      const companyResult = await client.query(
        'INSERT INTO companies (name, number_id, token, prompt, sales_data_url) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [companyName, metaId, whatsappToken, `Tu es assistant personnel de ${companyName}`, `s3://${bucketName}`]
      );
      console.log('✓ Entreprise créée avec l\'ID:', companyResult.rows[0].id);

      const companyId = companyResult.rows[0].id;

      // Ensuite insérer les informations de login
      console.log('💾 Insertion des données de connexion...');
      await client.query(
        'INSERT INTO login (phone, password, company_id) VALUES ($1, $2, $3)',
        [phone, hashedPassword, companyId]
      );
      console.log('✓ Données de connexion enregistrées');

      await client.query('COMMIT');
      console.log('✓ Transaction terminée avec succès');
      res.status(201).json({ message: 'Inscription réussie' });
    } catch (error) {
      console.error('❌ Erreur pendant la transaction:', error);
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'inscription:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
};

// Route de connexion
const handleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, password } = req.body as LoginBody;
    console.log('Tentative de connexion pour:', phone);

    // Récupérer l'utilisateur avec son numéro de téléphone
    const result = await pool.query(
      'SELECT l.*, c.* FROM login l JOIN companies c ON l.company_id = c.id WHERE l.phone = $1',
      [phone]
    );

    console.log('Résultat de la requête:', result.rows.length, 'utilisateur(s) trouvé(s)');

    const user = result.rows[0];
    if (!user) {
      console.log('Aucun utilisateur trouvé avec ce numéro');
      res.status(401).json({ error: 'Identifiants invalides' });
      return;
    }

    console.log('Utilisateur trouvé, vérification du mot de passe...');

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Résultat de la vérification du mot de passe:', validPassword);

    if (!validPassword) {
      console.log('Mot de passe invalide');
      res.status(401).json({ error: 'Identifiants invalides' });
      return;
    }

    // Retourner les informations de l'utilisateur
    const { password: _, ...userInfo } = user;
    res.json(userInfo);
  } catch (error) {
    console.error('Erreur détaillée lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
};

// Route pour uploader un fichier
const handleFileUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📤 Début de l\'upload de fichier');
    
    if (!req.file) {
      console.error('❌ Aucun fichier reçu');
      res.status(400).json({ error: 'Aucun fichier uploadé' });
      return;
    }

    console.log('📋 Informations du fichier:', {
      nom: req.file.originalname,
      taille: `${(req.file.size / 1024 / 1024).toFixed(2)} MB`,
      type: req.file.mimetype
    });

    const companyId = req.body.companyId;
    if (!companyId) {
      console.error('❌ ID de l\'entreprise manquant');
      res.status(400).json({ error: 'ID de l\'entreprise manquant' });
      return;
    }

    // Récupérer les informations de l'entreprise
    const client = await pool.connect();
    try {
      console.log('🔍 Recherche des informations de l\'entreprise...');
      // Récupérer le bucket S3 actuel de l'entreprise
      const companyResult = await client.query(
        'SELECT sales_data_url, name FROM companies WHERE id = $1',
        [companyId]
      );

      if (companyResult.rows.length === 0) {
        console.error('❌ Entreprise non trouvée');
        res.status(404).json({ error: 'Entreprise non trouvée' });
        return;
      }

      const currentUrl = companyResult.rows[0].sales_data_url;
      const companyName = companyResult.rows[0].name;
      console.log('✓ Entreprise trouvée:', companyName);
      
      const bucketName = currentUrl.split('://')[1].split('/')[0];
      console.log('📦 Bucket S3:', bucketName);
      
      // Si un fichier existe déjà, extraire sa clé
      let oldFileKey = null;
      if (currentUrl.split('/').length > 3) {
        oldFileKey = currentUrl.split('/').slice(3).join('/');
        console.log('🗑️ Ancien fichier à supprimer:', oldFileKey);
      }

      // Upload le nouveau fichier et supprimer l'ancien
      console.log('📤 Upload du nouveau fichier vers S3...');
      const newFileUrl = await uploadFileToS3(req.file, bucketName, oldFileKey);
      console.log('✓ Fichier uploadé avec succès:', newFileUrl);

      // Mettre à jour l'URL dans la base de données
      console.log('💾 Mise à jour de l\'URL dans la base de données...');
      await client.query(
        'UPDATE companies SET sales_data_url = $1 WHERE id = $2',
        [newFileUrl, companyId]
      );
      console.log('✓ Base de données mise à jour');

      res.json({ 
        message: 'Fichier uploadé avec succès',
        fileUrl: newFileUrl
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload du fichier:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload du fichier' });
  }
};

// Route pour mettre à jour le prompt
const handleUpdatePrompt = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('✏️ Début de la mise à jour du prompt');
    const { prompt, companyId } = req.body;

    if (!prompt || !companyId) {
      console.error('❌ Données manquantes:', { prompt: !!prompt, companyId: !!companyId });
      res.status(400).json({ error: 'Prompt ou ID de l\'entreprise manquant' });
      return;
    }

    const client = await pool.connect();
    try {
      console.log('💾 Mise à jour du prompt pour l\'entreprise', companyId);
      const result = await client.query(
        'UPDATE companies SET prompt = $1 WHERE id = $2 RETURNING name, prompt',
        [prompt, companyId]
      );

      if (result.rows.length === 0) {
        console.error('❌ Entreprise non trouvée');
        res.status(404).json({ error: 'Entreprise non trouvée' });
        return;
      }

      console.log('✓ Prompt mis à jour pour l\'entreprise:', result.rows[0].name);
      res.json({ 
        message: 'Prompt mis à jour avec succès',
        prompt: result.rows[0].prompt
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du prompt:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du prompt' });
  }
};

// Nouvelle route pour les stats de performance
app.get('/api/performance', async (req: Request, res: Response) => {
  const companyId = req.query.companyId;
  if (!companyId) {
    res.status(400).json({ error: 'companyId requis' });
    return;
  }
  const client = await pool.connect();
  try {
    // Nombre de messages aujourd'hui
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayISO = today.toISOString();
    const messagesTodayResult = await client.query(
      `SELECT COUNT(*) FROM conversations WHERE company_id = $1 AND updated_at >= $2`,
      [companyId, todayISO]
    );
    const messagesToday = parseInt(messagesTodayResult.rows[0].count, 10);

    // Utilisateurs actifs aujourd'hui
    const usersTodayResult = await client.query(
      `SELECT COUNT(DISTINCT user_whatsapp_id) FROM conversations WHERE company_id = $1 AND updated_at >= $2`,
      [companyId, todayISO]
    );
    const usersToday = parseInt(usersTodayResult.rows[0].count, 10);

    // Activité hebdomadaire (7 derniers jours)
    const weekDataResult = await client.query(
      `SELECT to_char(updated_at, 'Dy') as day, COUNT(*) as messages, COUNT(DISTINCT user_whatsapp_id) as users
       FROM conversations
       WHERE company_id = $1 AND updated_at >= NOW() - INTERVAL '7 days'
       GROUP BY day, to_char(updated_at, 'D')
       ORDER BY to_char(updated_at, 'D')::int` ,
      [companyId]
    );
    const weeklyData = weekDataResult.rows.map((row: any) => ({
      day: row.day,
      messages: parseInt(row.messages, 10),
      users: parseInt(row.users, 10)
    }));

    // Évolution mensuelle (6 derniers mois)
    const monthDataResult = await client.query(
      `SELECT to_char(updated_at, 'Mon') as month, COUNT(*) as messages, COUNT(DISTINCT user_whatsapp_id) as users
       FROM conversations
       WHERE company_id = $1 AND updated_at >= NOW() - INTERVAL '6 months'
       GROUP BY month, to_char(updated_at, 'MM')
       ORDER BY to_char(updated_at, 'MM')::int` ,
      [companyId]
    );
    const monthlyData = monthDataResult.rows.map((row: any) => ({
      month: row.month,
      messages: parseInt(row.messages, 10),
      users: parseInt(row.users, 10)
    }));

    res.json({
      stats: [
        {
          title: "Messages Aujourd'hui",
          value: messagesToday,
          icon: 'MessageCircle',
          change: '+0%',
          positive: true,
        },
        {
          title: 'Utilisateurs Actifs',
          value: usersToday,
          icon: 'Users',
          change: '+0%',
          positive: true,
        }
      ],
      weeklyData,
      monthlyData
    });
  } catch (err) {
    console.error('Erreur stats performance:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des stats' });
  } finally {
    client.release();
  }
});

app.get('/api/conversations', async (req: Request, res: Response) => {
  const companyId = req.query.companyId;
  if (!companyId) {
    res.status(400).json({ error: 'companyId requis' });
    return;
  }
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, user_whatsapp_id, messages, updated_at FROM conversations WHERE company_id = $1 ORDER BY updated_at DESC`,
      [companyId]
    );
    // On prépare les données pour le frontend
    const conversations = result.rows.map((row: any) => {
      let lastMessage = '';
      let messageCount = 0;
      try {
        const msgs = Array.isArray(row.messages) ? row.messages : JSON.parse(row.messages);
        messageCount = msgs.length;
        lastMessage = msgs.length > 0 ? msgs[msgs.length-1].text || '' : '';
      } catch {
        lastMessage = '';
        messageCount = 0;
      }
      return {
        id: row.id,
        user_whatsapp_id: row.user_whatsapp_id,
        messages: row.messages,
        updated_at: row.updated_at,
        lastMessage,
        messageCount,
        status: 'active', // à améliorer si tu veux une vraie gestion de statut
      };
    });
    res.json({ conversations });
  } catch (err) {
    console.error('Erreur lors de la récupération des conversations:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des conversations' });
  } finally {
    client.release();
  }
});

app.post('/api/signup', handleSignup);
app.post('/api/login', handleLogin);
app.post('/api/upload', upload.single('file'), handleFileUpload);
app.post('/api/prompt', handleUpdatePrompt);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
}); 