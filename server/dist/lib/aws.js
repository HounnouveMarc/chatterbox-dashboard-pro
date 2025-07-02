"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileToS3 = exports.createCompanyBucket = exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Configuration du client S3
exports.s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
});
// Fonction pour créer un bucket pour une nouvelle entreprise
const createCompanyBucket = async (companyName) => {
    const bucketName = `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
    try {
        await exports.s3Client.send(new client_s3_1.CreateBucketCommand({
            Bucket: bucketName
        }));
        return bucketName;
    }
    catch (error) {
        console.error('Erreur lors de la création du bucket:', error);
        throw new Error('Erreur lors de la création du bucket S3');
    }
};
exports.createCompanyBucket = createCompanyBucket;
// Fonction pour uploader un fichier dans le bucket d'une entreprise
const uploadFileToS3 = async (file, bucketName, oldFileKey) => {
    try {
        // Si un ancien fichier existe, le supprimer
        if (oldFileKey) {
            try {
                await exports.s3Client.send(new client_s3_1.DeleteObjectCommand({
                    Bucket: bucketName,
                    Key: oldFileKey
                }));
            }
            catch (error) {
                console.error('Erreur lors de la suppression de l\'ancien fichier:', error);
            }
        }
        // Générer un nom de fichier unique
        const fileKey = `sales/${Date.now()}_${file.originalname}`;
        // Upload du nouveau fichier
        await exports.s3Client.send(new client_s3_1.PutObjectCommand({
            Bucket: bucketName,
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype
        }));
        // Retourner l'URL S3
        return `s3://${bucketName}/${fileKey}`;
    }
    catch (error) {
        console.error('Erreur lors de l\'upload du fichier:', error);
        throw new Error('Erreur lors de l\'upload du fichier vers S3');
    }
};
exports.uploadFileToS3 = uploadFileToS3;
