import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ExternalLink, Clock, User } from "lucide-react";

const Conversations = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      setError("Utilisateur non connecté");
      setLoading(false);
      return;
    }
    const user = JSON.parse(userData);
    const companyId = user.company_id;
    if (!companyId) {
      setError("Aucun companyId trouvé");
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`https://chatterbox-dashboard-pro.onrender.com/api/performance?companyId=${companyId}`)
      .then(res => res.json())
      .then(data => {
        setConversations(data.conversations || []);
        setLoading(false);
      })
      .catch(err => {
        setError("Erreur lors du chargement des conversations");
        setLoading(false);
      });
  }, []);

  const getStatusColor = (status) => {
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

  const getStatusText = (status) => {
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

  const openWhatsApp = (phone) => {
    const whatsappUrl = `https://wa.me/${phone.replace(/\s+/g, '').replace('+', '')}`;
    window.open(whatsappUrl, '_blank');
    console.log("Redirection vers WhatsApp:", whatsappUrl);
  };

  if (loading) {
    return <div className="text-center py-10 text-blue-600 font-bold">Chargement des conversations...</div>;
  }
  if (error) {
    return <div className="text-center py-10 text-red-600 font-bold">{error}</div>;
  }

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
                      {conversation.userName ? conversation.userName.split(' ').map(n => n[0]).join('') : '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{conversation.userName || conversation.user_whatsapp_id}</h3>
                      <Badge className={getStatusColor(conversation.status)}>
                        {getStatusText(conversation.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{conversation.phone || conversation.user_whatsapp_id}</p>
                    <p className="text-sm text-gray-500 truncate max-w-md">
                      {conversation.lastMessage || (conversation.messages && conversation.messages.length > 0 ? conversation.messages[conversation.messages.length-1].text : '')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {conversation.messageCount || (conversation.messages ? conversation.messages.length : 0)} messages
                    </p>
                    <p className="text-sm text-gray-500">{conversation.lastActivity || (conversation.updated_at ? new Date(conversation.updated_at).toLocaleString() : '')}</p>
                  </div>
                  <Button
                    onClick={() => openWhatsApp(conversation.phone || conversation.user_whatsapp_id)}
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
