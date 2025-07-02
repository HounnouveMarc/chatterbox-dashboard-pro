export const logger = {
  signup: {
    start: (companyName: string) => console.log('🚀 Début de l\'inscription pour l\'entreprise:', companyName),
    passwordHashed: () => console.log('✓ Mot de passe hashé avec succès'),
    bucketCreationStart: () => console.log('📦 Création du bucket S3 pour l\'entreprise...'),
    bucketCreated: (bucketName: string) => console.log('✓ Bucket S3 créé avec succès:', bucketName),
    transactionStart: () => console.log('🔄 Début de la transaction PostgreSQL'),
    companyInsert: () => console.log('💾 Insertion des données de l\'entreprise...'),
    companyCreated: (id: number) => console.log('✓ Entreprise créée avec l\'ID:', id),
    loginInsert: () => console.log('💾 Insertion des données de connexion...'),
    loginCreated: () => console.log('✓ Données de connexion enregistrées'),
    transactionComplete: () => console.log('✓ Transaction terminée avec succès'),
    error: (error: any) => console.error('❌ Erreur lors de l\'inscription:', error)
  },

  fileUpload: {
    start: () => console.log('📤 Début de l\'upload de fichier'),
    noFile: () => console.error('❌ Aucun fichier reçu'),
    fileInfo: (name: string, size: number, type: string) => console.log('📋 Informations du fichier:', {
      nom: name,
      taille: `${(size / 1024 / 1024).toFixed(2)} MB`,
      type: type
    }),
    noCompanyId: () => console.error('❌ ID de l\'entreprise manquant'),
    searchingCompany: () => console.log('🔍 Recherche des informations de l\'entreprise...'),
    companyNotFound: () => console.error('❌ Entreprise non trouvée'),
    companyFound: (name: string) => console.log('✓ Entreprise trouvée:', name),
    bucketInfo: (name: string) => console.log('📦 Bucket S3:', name),
    oldFile: (key: string) => console.log('🗑️ Ancien fichier à supprimer:', key),
    uploadStart: () => console.log('📤 Upload du nouveau fichier vers S3...'),
    uploadComplete: (url: string) => console.log('✓ Fichier uploadé avec succès:', url),
    dbUpdateStart: () => console.log('💾 Mise à jour de l\'URL dans la base de données...'),
    dbUpdateComplete: () => console.log('✓ Base de données mise à jour'),
    error: (error: any) => console.error('❌ Erreur lors de l\'upload du fichier:', error)
  },

  prompt: {
    start: () => console.log('✏️ Début de la mise à jour du prompt'),
    missingData: (hasPrompt: boolean, hasCompanyId: boolean) => 
      console.error('❌ Données manquantes:', { prompt: hasPrompt, companyId: hasCompanyId }),
    updateStart: (companyId: number) => console.log('💾 Mise à jour du prompt pour l\'entreprise', companyId),
    companyNotFound: () => console.error('❌ Entreprise non trouvée'),
    updateComplete: (companyName: string) => console.log('✓ Prompt mis à jour pour l\'entreprise:', companyName),
    error: (error: any) => console.error('❌ Erreur lors de la mise à jour du prompt:', error)
  }
}; 