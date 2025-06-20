
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calculator, BarChart3, FileText, Lightbulb, Trophy, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
  user?: any;
  onLogout?: () => void;
}

const Layout = ({ children, user, onLogout }: LayoutProps) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/calculator', label: 'Calculator', icon: Calculator },
    { path: '/reports', label: 'Reports', icon: FileText },
    { path: '/suggestions', label: 'Suggestions', icon: Lightbulb },
    { path: '/gamification', label: 'Rewards', icon: Trophy },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  if (!user) {
    return <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <nav className="bg-white shadow-lg border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Ecofootprint</span>
              </Link>
            </div>
            
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className={`flex items-center space-x-2 ${
                      isActive(item.path) 
                        ? 'bg-green-500 text-white hover:bg-green-600' 
                        : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                    }`}
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                <div className="bg-green-100 px-3 py-1 rounded-full">
                  <span className="text-green-700 font-medium text-sm">{user?.greenPoints || 0} Points</span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={onLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 hover:border-red-300"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
