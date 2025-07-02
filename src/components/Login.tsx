import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Phone, Lock, Building2, Key, Link as LinkIcon, AlertCircle, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { api } from "@/lib/api";
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface LoginProps {
  onLogin: () => void;
}

const signupSchema = z.object({
  companyName: z.string().min(2, "Le nom de l'entreprise est requis"),
  metaId: z.string().min(1, "L'ID Meta est requis"),
  whatsappToken: z.string().min(1, "Le token WhatsApp est requis"),
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, "Format de téléphone invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string(),
  email: z.string().email("Format d'email invalide")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

const Login = ({ onLogin }: LoginProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Login state
  const [loginData, setLoginData] = useState({
    phone: "",
    password: "",
    email: ""
  });

  // Signup state
  const [signupData, setSignupData] = useState({
    companyName: "",
    metaId: "",
    whatsappToken: "",
    phone: "",
    password: "",
    confirmPassword: "",
    email: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      // D'abord, essayez de se connecter à l'API
      const userInfo = await api.login({
        phone: loginData.phone,
        password: loginData.password
      });

      // Ensuite, vérifiez l'authentification Firebase
      const { user } = await signInWithEmailAndPassword(
        auth,
        loginData.email,
        loginData.password
      );

      // Vérifiez si l'email est vérifié
      if (!user.emailVerified) {
        // Renvoyer l'email de vérification
        await sendEmailVerification(user);
        setError("Veuillez vérifier votre email avant de vous connecter. Un nouvel email de vérification a été envoyé.");
        setIsLoading(false);
        return;
      }

      // Stocker l'utilisateur dans le localStorage pour le reste de l'app
      localStorage.setItem('user', JSON.stringify(userInfo));

      // Si tout est bon, procédez à la connexion
      onLogin();
    } catch (err: any) {
      setError("Identifiants invalides");
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      // Validate form data
      const validatedData = signupSchema.parse(signupData);
      
      // Create user with Firebase first
      const { user } = await createUserWithEmailAndPassword(
        auth,
        validatedData.email,
        validatedData.password
      );

      // Send verification email
      await sendEmailVerification(user);

      // Then create user in PostgreSQL
      try {
        await api.signup({
          phone: validatedData.phone,
          password: validatedData.password,
          companyName: validatedData.companyName,
          metaId: validatedData.metaId,
          whatsappToken: validatedData.whatsappToken,
        });

        setSuccessMessage(
          "Inscription réussie ! Veuillez vérifier votre email pour activer votre compte."
        );
        
        setIsLoading(false);
      } catch (dbError) {
        console.error("Erreur lors de l'enregistrement dans la base de données:", dbError);
        setError("Erreur lors de l'enregistrement des informations");
        setIsLoading(false);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        if (err.message.includes("email-already-in-use")) {
          setError("Cette adresse email est déjà utilisée");
        } else {
          setError("Erreur lors de l'inscription");
        }
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-blue-600 p-3 rounded-full w-16 h-16 flex items-center justify-center">
            <LinkIcon className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            ChatBot Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="exemple@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-phone">Numéro de téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-phone"
                      type="tel"
                      placeholder="+33612345678"
                      value={loginData.phone}
                      onChange={(e) => setLoginData({...loginData, phone: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 transition-colors" 
                  disabled={isLoading}
                >
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Button>
              </form>
            </TabsContent>

            {/* Signup Form */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Nom de l'entreprise</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="company"
                      type="text"
                      placeholder="Votre entreprise"
                      value={signupData.companyName}
                      onChange={(e) => setSignupData({...signupData, companyName: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaId">ID Meta</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="metaId"
                      type="text"
                      placeholder="Votre ID Meta"
                      value={signupData.metaId}
                      onChange={(e) => setSignupData({...signupData, metaId: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsappToken">Token WhatsApp Business</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="whatsappToken"
                      type="text"
                      placeholder="Votre token WhatsApp"
                      value={signupData.whatsappToken}
                      onChange={(e) => setSignupData({...signupData, whatsappToken: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Numéro de téléphone WhatsApp Business</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="+33612345678"
                      value={signupData.phone}
                      onChange={(e) => setSignupData({...signupData, phone: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupData.password}
                      onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Votre email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Besoin d'aide pour trouver vos informations Meta ? 
                    <a 
                      href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 ml-1"
                    >
                      Consultez la documentation Meta
                    </a>
                  </AlertDescription>
                </Alert>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 transition-colors" 
                  disabled={isLoading}
                >
                  {isLoading ? "Inscription..." : "S'inscrire"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">{successMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
