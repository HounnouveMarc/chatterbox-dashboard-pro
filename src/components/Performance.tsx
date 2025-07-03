import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, MessageCircle, Activity } from "lucide-react";

const ICONS = {
  MessageCircle,
  Users,
  Activity,
  TrendingUp,
};

const Performance = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [conversationTypes, setConversationTypes] = useState([]);

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
        setStats(data.stats || []);
        setWeeklyData(data.weeklyData || []);
        setMonthlyData(data.monthlyData || []);
        setConversationTypes(data.conversationTypes || []);
        setLoading(false);
      })
      .catch(err => {
        setError("Erreur lors du chargement des statistiques");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-blue-600 font-bold">Chargement des statistiques...</div>;
  }
  if (error) {
    return <div className="text-center py-10 text-red-600 font-bold">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Performance du Bot</h1>
        <p className="text-gray-600 mt-1">Analysez les performances de votre bot conversationnel</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats
          .filter(stat => stat.title === "Messages Aujourd'hui" || stat.title === 'Utilisateurs Actifs')
          .map((stat, index) => {
            const Icon = ICONS[stat.icon] || MessageCircle;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      <p className={`text-sm mt-1 ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>{stat.change} depuis hier</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
    </div>
  );
};

export default Performance;
