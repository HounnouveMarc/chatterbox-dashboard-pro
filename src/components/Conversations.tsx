
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ExternalLink, Clock, User } from "lucide-react";

const Conversations = () => {
  // Données simulées des conversations
  const conversations = [
    {
      id: 1,
      userName: "Marie Dupont",
      phone: "+33612345678",
      lastMessage: "Merci pour votre aide !",
      lastActivity: "Il y a 5 min",
      messageCount: 12,
      status: "active",
    },
    {
      id: 2,
      userName: "Jean Martin",
      phone: "+33687654321",
      lastMessage: "J'ai besoin d'informations sur vos produits",
      lastActivity: "Il y a 1h",
      messageCount: 8,
      status: "waiting",
    },
    {
      id: 3,
      userName: "Sophie Bernard",
      phone: "+33698765432",
      lastMessage: "Ma commande a-t-elle été expédiée ?",
      lastActivity: "Il y a 2h",
      messageCount: 5,
      status: "resolved",
    },
    {
      id: 4,
      userName: "Pierre Durand",
      phone: "+33623456789",
      lastMessage: "Bonjour, je cherche des informations",
      lastActivity: "Il y a 3h",
      messageCount: 3,
      status: "active",
    },
    {
      id: 5,
      userName: "Laura Moreau",
      phone: "+33634567890",
      lastMessage: "Parfait, merci beaucoup !",
      lastActivity: "Il y a 4h",
      messageCount: 15,
      status: "resolved",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "waiting":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Actif";
      case "waiting":
        return "En attente";
      case "resolved":
        return "Terminé";
      default:
        return "Inconnu";
    }
  };

  const openWhatsApp = (phone: string) => {
    const whatsappUrl = `https://wa.me/${phone.replace(/\s+/g, '').replace('+', '')}`;
    window.open(whatsappUrl, '_blank');
    console.log("Redirection vers WhatsApp:", whatsappUrl);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Conversations</h1>
        <p className="text-gray-600 mt-1">Gérez les conversations avec vos utilisateurs</p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {conversations.filter(c => c.status === 'active').length}
                </p>
                <p className="text-sm text-gray-600">Conversations actives</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {conversations.filter(c => c.status === 'waiting').length}
                </p>
                <p className="text-sm text-gray-600">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{conversations.length}</p>
                <p className="text-sm text-gray-600">Total utilisateurs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des conversations */}
      <Card>
        <CardHeader>
          <CardTitle>Toutes les Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {conversation.userName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{conversation.userName}</h3>
                      <Badge className={getStatusColor(conversation.status)}>
                        {getStatusText(conversation.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{conversation.phone}</p>
                    <p className="text-sm text-gray-500 truncate max-w-md">
                      {conversation.lastMessage}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {conversation.messageCount} messages
                    </p>
                    <p className="text-sm text-gray-500">{conversation.lastActivity}</p>
                  </div>
                  
                  <Button
                    onClick={() => openWhatsApp(conversation.phone)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Conversations;
