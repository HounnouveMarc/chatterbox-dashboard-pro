import { S3Client, PutObjectCommand, DeleteObjectCommand, CreateBucketCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';

dotenv.config();

// Configuration du client S3
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

// Fonction pour créer un bucket pour une nouvelle entreprise
export const createCompanyBucket = async (companyName: string): Promise<string> => {
  const bucketName = `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
  
  try {
    await s3Client.send(new CreateBucketCommand({
      Bucket: bucketName
    }));
    
    return bucketName;
  } catch (error) {
    console.error('Erreur lors de la création du bucket:', error);
    throw new Error('Erreur lors de la création du bucket S3');
  }
};

// Fonction pour uploader un fichier dans le bucket d'une entreprise
export const uploadFileToS3 = async (
  file: Express.Multer.File,
  bucketName: string,
  oldFileKey?: string
): Promise<string> => {
  try {
    // Si un ancien fichier existe, le supprimer
    if (oldFileKey) {
      try {
        await s3Client.send(new DeleteObjectCommand({
          Bucket: bucketName,
          Key: oldFileKey
        }));
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'ancien fichier:', error);
      }
    }

    // Générer un nom de fichier unique
    const fileKey = `sales/${Date.now()}_${file.originalname}`;

    // Upload du nouveau fichier
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype
    }));

    // Retourner l'URL S3
    return `s3://${bucketName}/${fileKey}`;
  } catch (error) {
    console.error('Erreur lors de l\'upload du fichier:', error);
    throw new Error('Erreur lors de l\'upload du fichier vers S3');
  }
}; 