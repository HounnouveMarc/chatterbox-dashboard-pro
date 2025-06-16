
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, MessageCircle, Activity } from "lucide-react";

const Performance = () => {
  // Données simulées pour les graphiques
  const weeklyData = [
    { day: "Lun", messages: 145, users: 32 },
    { day: "Mar", messages: 189, users: 41 },
    { day: "Mer", messages: 156, users: 38 },
    { day: "Jeu", messages: 203, users: 45 },
    { day: "Ven", messages: 178, users: 42 },
    { day: "Sam", messages: 134, users: 28 },
    { day: "Dim", messages: 98, users: 21 },
  ];

  const monthlyData = [
    { month: "Jan", messages: 4500, users: 890 },
    { month: "Fév", messages: 5200, users: 1050 },
    { month: "Mar", messages: 4800, users: 980 },
    { month: "Avr", messages: 5800, users: 1200 },
    { month: "Mai", messages: 6200, users: 1350 },
    { month: "Juin", messages: 5900, users: 1280 },
  ];

  const conversationTypes = [
    { name: "Support", value: 35, color: "#3b82f6" },
    { name: "Info Produit", value: 28, color: "#10b981" },
    { name: "Commandes", value: 22, color: "#f59e0b" },
    { name: "Autre", value: 15, color: "#ef4444" },
  ];

  const stats = [
    {
      title: "Messages Aujourd'hui",
      value: "1,234",
      icon: MessageCircle,
      change: "+12%",
      positive: true,
    },
    {
      title: "Utilisateurs Actifs",
      value: "856",
      icon: Users,
      change: "+8%",
      positive: true,
    },
    {
      title: "Temps de Réponse Moyen",
      value: "2.3s",
      icon: Activity,
      change: "-5%",
      positive: true,
    },
    {
      title: "Taux de Satisfaction",
      value: "94%",
      icon: TrendingUp,
      change: "+3%",
      positive: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Performance du Bot</h1>
        <p className="text-gray-600 mt-1">Analysez les performances de votre bot conversationnel</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className={`text-sm mt-1 ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} depuis hier
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activité hebdomadaire */}
        <Card>
          <CardHeader>
            <CardTitle>Activité Hebdomadaire</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="messages" fill="#3b82f6" name="Messages" />
                <Bar dataKey="users" fill="#10b981" name="Utilisateurs" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Évolution mensuelle */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution Mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="messages" stroke="#3b82f6" strokeWidth={3} name="Messages" />
                <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={3} name="Utilisateurs" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Types de conversations */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition des Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="w-full lg:w-1/2">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={conversationTypes}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {conversationTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full lg:w-1/2 space-y-4">
              {conversationTypes.map((type, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: type.color }}
                  ></div>
                  <span className="font-medium">{type.name}</span>
                  <span className="text-gray-600">{type.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Performance;
