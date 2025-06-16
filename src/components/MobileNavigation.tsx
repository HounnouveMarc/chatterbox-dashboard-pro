
import { useState } from "react";
import { MessageCircle, BarChart3, Settings, MessageSquare, LogOut, Menu, X } from "lucide-react";

interface MobileNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

const MobileNavigation = ({ activeTab, setActiveTab, onLogout }: MobileNavigationProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    {
      title: "Performance",
      icon: BarChart3,
      key: "performance",
    },
    {
      title: "Paramètres",
      icon: Settings,
      key: "settings",
    },
    {
      title: "Conversations",
      icon: MessageSquare,
      key: "conversations",
    },
  ];

  const activeItem = menuItems.find(item => item.key === activeTab);

  return (
    <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo et titre */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-900">ChatBot</h2>
          </div>
        </div>

        {/* Menu hamburger */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Page actuelle */}
      {activeItem && (
        <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
          <activeItem.icon className="h-4 w-4" />
          <span>{activeItem.title}</span>
        </div>
      )}

      {/* Menu déroulant */}
      {isMenuOpen && (
        <div className="mt-4 pb-2 border-t border-gray-200">
          <div className="space-y-2 mt-4">
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  setActiveTab(item.key);
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                  activeTab === item.key
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.title}</span>
              </button>
            ))}
            
            <div className="pt-2 border-t border-gray-200 mt-4">
              <button
                onClick={() => {
                  onLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-left"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNavigation;
