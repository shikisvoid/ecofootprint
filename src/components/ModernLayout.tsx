import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Calculator, BarChart3, FileText, Lightbulb, Trophy, User, LogOut,
  Menu, X, Sun, Moon, Monitor, ChevronLeft, ChevronRight, Leaf, Zap, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ModernLayoutProps {
  children: React.ReactNode;
  user?: any;
  onLogout?: () => void;
}

const ModernLayout = ({ children, user, onLogout }: ModernLayoutProps) => {
  const location = useLocation();
  const { theme, setTheme, isDark } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home, color: 'text-blue-500' },
    { path: '/calculator', label: 'Calculator', icon: Calculator, color: 'text-green-500' },
    { path: '/reports', label: 'Reports', icon: FileText, color: 'text-purple-500' },
    { path: '/suggestions', label: 'Suggestions', icon: Lightbulb, color: 'text-yellow-500' },
    { path: '/gamification', label: 'Rewards', icon: Trophy, color: 'text-orange-500' },
    { path: '/profile', label: 'Profile', icon: User, color: 'text-pink-500' },
  ];

  const themeIcons = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  };

  const ThemeIcon = themeIcons[theme];

  const cycleTheme = () => {
    const themes: Array<typeof theme> = ['light', 'dark'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 z-50 transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "w-16" : "w-64",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <Link to="/dashboard" className={cn(
              "flex items-center space-x-3 transition-all duration-300",
              sidebarCollapsed && "justify-center"
            )}>
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Leaf className="text-white" size={20} />
              </div>
              {!sidebarCollapsed && (
                <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Ecofootprint
                </span>
              )}
            </Link>
            
            {/* Collapse Button - Desktop */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </Button>

            {/* Close Button - Mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-2"
            >
              <X size={16} />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item, index) => (
              <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                <div
                  className={cn(
                    "flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                    "hover:scale-105 hover:shadow-lg transform",
                    isActive(item.path)
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25 scale-105"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
                    sidebarCollapsed && "justify-center px-2"
                  )}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'slideInLeft 0.5s ease-out forwards'
                  }}
                >
                  <item.icon
                    size={20}
                    className={cn(
                      "transition-all duration-200",
                      isActive(item.path) ? "text-white" : item.color,
                      "group-hover:scale-110"
                    )}
                  />
                  {!sidebarCollapsed && (
                    <span className="font-medium transition-all duration-200 group-hover:translate-x-1">
                      {item.label}
                    </span>
                  )}

                  {/* Active indicator with pulse animation */}
                  {isActive(item.path) && (
                    <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </div>
              </Link>
            ))}
          </nav>

          {/* Animated Sidebar Footer */}
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
            {!sidebarCollapsed && (
              <div className="space-y-3">
                {/* Animated eco tip */}
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl p-3 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 animate-pulse" />
                  <div className="relative">
                    <div className="flex items-center space-x-2 mb-2">
                      <Leaf className="text-green-600 dark:text-green-400" size={16} />
                      <span className="text-green-700 dark:text-green-300 font-semibold text-xs">
                        Eco Tip
                      </span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 animate-fade-in">
                      Every small action counts! 🌱
                    </p>
                  </div>
                </div>

                {/* Floating particles animation */}
                <div className="relative h-16 overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                  <div className="absolute inset-0 opacity-30">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-green-400 rounded-full animate-float"
                        style={{
                          left: `${Math.random() * 100}%`,
                          animationDelay: `${i * 0.5}s`,
                          animationDuration: `${3 + Math.random() * 2}s`
                        }}
                      />
                    ))}
                  </div>
                  <div className="relative p-3 text-center">
                    <Zap className="mx-auto text-purple-600 dark:text-purple-400 animate-pulse" size={20} />
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                      Keep tracking!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
      )}>
        {/* Top Bar - Mobile */}
        <header className="lg:hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2"
            >
              <Menu size={20} />
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Leaf className="text-white" size={16} />
              </div>
              <span className="font-bold text-lg">Ecofootprint</span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-lg">
                <span className="text-green-700 dark:text-green-300 font-medium text-xs">
                  {user?.greenPoints || 0}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Top-right User Controls - Compact */}
        <div className="fixed top-2 right-2 z-40 flex items-center space-x-2">
          {/* Compact Profile & Points */}
          <div className="flex items-center space-x-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-full px-3 py-1.5 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
            <Avatar className="w-6 h-6 ring-1 ring-green-500/50">
              <AvatarImage src={user?.photoURL} />
              <AvatarFallback className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs">
                {user?.displayName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center space-x-1">
              <Zap size={12} className="text-green-500" />
              <span className="font-bold text-xs text-gray-900 dark:text-white">{user?.greenPoints || 0}</span>
            </div>
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            onClick={cycleTheme}
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-full w-8 h-8 p-0 shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:scale-110 transition-all duration-200"
          >
            <ThemeIcon size={14} />
          </Button>

          {/* Logout */}
          <Button
            variant="ghost"
            onClick={onLogout}
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-full w-8 h-8 p-0 shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-110 transition-all duration-200"
          >
            <LogOut size={14} />
          </Button>
        </div>

        {/* Page Content */}
        <main className="p-6 lg:p-8 min-h-screen pt-12">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ModernLayout;
