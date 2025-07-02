import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const Settings = () => {
  const [prompt, setPrompt] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingFile, setIsSavingFile] = useState(false);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [fileSuccess, setFileSuccess] = useState(false);
  const [promptSuccess, setPromptSuccess] = useState(false);
  const { toast } = useToast();

  // Charger les données de l'entreprise au montage du composant
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCompanyId(user.company_id);
      setPrompt(user.prompt || "");
    }
  }, []);

  const handleDeleteFile = async () => {
    if (!companyId) return;

    try {
      // Mettre à null l'URL du fichier dans la base de données
      await api.updatePrompt({
        prompt,
        companyId,
        sales_data_url: null
      });
      
      setUploadedFile(null);
      toast({
        title: "Fichier supprimé",
        description: "Le fichier a été supprimé avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la suppression du fichier",
        variant: "destructive",
      });
    }
  };

  const handleSavePrompt = async () => {
    if (!companyId) {
      console.log('[DEBUG] Pas de companyId pour le prompt');
      return;
    }
    setIsSaving(true);
    setPromptSuccess(false);
    try {
      console.log('[DEBUG] Début updatePrompt', prompt, companyId);
      await api.updatePrompt({
        prompt,
        companyId
      });
      // Mettre à jour les données utilisateur dans le localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        localStorage.setItem('user', JSON.stringify({ ...user, prompt }));
      }
      console.log('[DEBUG] Prompt sauvegardé avec succès');
      toast({
        title: "Prompt sauvegardé",
        description: "Le prompt du bot a été mis à jour avec succès.",
      });
      setPromptSuccess(true);
      setTimeout(() => setPromptSuccess(false), 2000);
    } catch (error) {
      console.log('[DEBUG] Erreur lors de la sauvegarde du prompt', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la mise à jour du prompt",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitFile = async () => {
    if (!uploadedFile || !companyId) {
      console.log('[DEBUG] Pas de fichier ou pas de companyId');
      return;
    }
    console.log('[DEBUG] Clic sur Enregistrer le fichier', uploadedFile.name, companyId);
    setIsSavingFile(true);
    setFileSuccess(false);
    try {
      console.log('[DEBUG] Début upload via api.uploadFile');
      await api.uploadFile(uploadedFile, companyId);
      console.log('[DEBUG] Upload terminé avec succès');
      toast({
        title: "Fichier enregistré avec succès",
        description: `${uploadedFile.name} a été enregistré dans le cloud.`,
      });
      setUploadedFile(null);
      setFileSuccess(true);
      setTimeout(() => setFileSuccess(false), 2000);
    } catch (error) {
      console.log('[DEBUG] Erreur lors de l\'upload', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'enregistrement du fichier",
        variant: "destructive",
      });
    } finally {
      setIsSavingFile(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 p-2 sm:p-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">Configurez votre bot et gérez vos fichiers</p>
      </div>

      {/* Upload de fichiers */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Upload className="h-5 w-5" />
            Gestion des Fichiers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
          <div>
            <Label htmlFor="file-upload">Uploader un fichier</Label>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Formats acceptés : Word, Excel, PDF, TXT</p>
            <input
              id="file-upload"
              type="file"
              accept=".doc,.docx,.xls,.xlsx,.pdf,.txt"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setUploadedFile(file || null);
                if (file) {
                  console.log('[DEBUG] Fichier sélectionné', file.name, file.type, file.size);
                } else {
                  console.log('[DEBUG] Aucun fichier sélectionné');
                }
              }}
              className="block w-full text-xs sm:text-sm text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              disabled={isUploading || isSavingFile}
            />
          </div>

          {/* Affichage du nom du fichier sélectionné avant upload */}
          {uploadedFile && !isSavingFile && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 mt-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="text-blue-900 font-medium break-all">{uploadedFile.name}</span>
              <span className="text-xs text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          )}

          {isUploading && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-xs sm:text-sm">Upload en cours...</span>
            </div>
          )}

          {/* Bouton pour enregistrer le fichier uploadé */}
          {uploadedFile && (
            <div className="flex flex-col gap-2 mt-2 w-full">
              <Button
                onClick={handleSubmitFile}
                disabled={isSavingFile}
                variant="default"
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
              >
                {isSavingFile ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer le fichier
                  </>
                )}
              </Button>
              {fileSuccess && (
                <span className="text-green-600 text-xs sm:text-sm">Fichier enregistré avec succès !</span>
              )}
            </div>
          )}

          {/* Affichage du fichier uploadé après succès (optionnel) */}
          {fileSuccess && uploadedFile && (
            <Card className="border-green-200 bg-green-50 mt-2">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">{uploadedFile.name}</p>
                      <p className="text-sm text-green-700">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteFile}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Configuration du prompt */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Prompt du Bot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="prompt">Prompt par défaut</Label>
            <p className="text-sm text-gray-600 mb-3">
              Définissez le comportement et la personnalité de votre bot
            </p>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className="resize-none"
              placeholder="Entrez le prompt de votre bot..."
            />
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <Button 
              onClick={handleSavePrompt}
              disabled={isSaving}
              variant="default"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder le Prompt
                </>
              )}
            </Button>
            {promptSuccess && (
              <span className="text-green-600 text-sm">Prompt sauvegardé avec succès !</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
