
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import MobileNavigation from "@/components/MobileNavigation";
import Performance from "@/components/Performance";
import Settings from "@/components/Settings";
import Conversations from "@/components/Conversations";

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("performance");

  const renderContent = () => {
    switch (activeTab) {
      case "performance":
        return <Performance />;
      case "settings":
        return <Settings />;
      case "conversations":
        return <Conversations />;
      default:
        return <Performance />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation mobile en haut */}
      <MobileNavigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout} 
      />

      {/* Layout desktop avec sidebar */}
      <div className="hidden md:block">
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-gray-50">
            <AppSidebar 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              onLogout={onLogout} 
            />
            <main className="flex-1 p-6 overflow-auto">
              {renderContent()}
            </main>
          </div>
        </SidebarProvider>
      </div>

      {/* Contenu principal mobile */}
      <main className="md:hidden p-4">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
