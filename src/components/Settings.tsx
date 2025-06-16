
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [prompt, setPrompt] = useState("Vous êtes un assistant virtuel professionnel et serviable. Votre rôle est d'aider les utilisateurs avec leurs questions et demandes de manière courtoise et efficace.");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/pdf',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Format non supporté",
        description: "Seuls les fichiers Word, Excel, PDF et TXT sont acceptés.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    // Simulation d'upload vers S3
    setTimeout(() => {
      setUploadedFile(file);
      setIsUploading(false);
      console.log("Fichier uploadé vers S3:", file.name);
      toast({
        title: "Fichier uploadé",
        description: `${file.name} a été envoyé avec succès.`,
      });
    }, 2000);
  };

  const handleDeleteFile = () => {
    setUploadedFile(null);
    console.log("Fichier supprimé du bucket S3");
    toast({
      title: "Fichier supprimé",
      description: "Le fichier a été supprimé avec succès.",
    });
  };

  const handleSavePrompt = () => {
    setIsSaving(true);
    // Simulation de sauvegarde en base PostgreSQL
    setTimeout(() => {
      setIsSaving(false);
      console.log("Prompt sauvegardé en base PostgreSQL:", prompt);
      toast({
        title: "Prompt sauvegardé",
        description: "Le prompt du bot a été mis à jour avec succès.",
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-1">Configurez votre bot et gérez vos fichiers</p>
      </div>

      {/* Upload de fichiers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Gestion des Fichiers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="file-upload">Uploader un fichier</Label>
            <p className="text-sm text-gray-600 mb-3">Formats acceptés : Word, Excel, PDF, TXT</p>
            <input
              id="file-upload"
              type="file"
              accept=".doc,.docx,.xls,.xlsx,.pdf,.txt"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              disabled={isUploading}
            />
          </div>

          {isUploading && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Upload en cours vers S3...</span>
            </div>
          )}

          {uploadedFile && (
            <Card className="border-green-200 bg-green-50">
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
          <Button 
            onClick={handleSavePrompt}
            disabled={isSaving}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
