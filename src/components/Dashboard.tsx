
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
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
  );
};

export default Dashboard;
