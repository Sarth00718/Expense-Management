import React from 'react';
import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../common/NotificationBell';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-accent-secondary/20 text-accent-secondary border-accent-secondary';
      case 'manager':
        return 'bg-accent/20 text-accent border-accent';
      case 'employee':
        return 'bg-success/20 text-success border-success';
      default:
        return 'bg-text-secondary/20 text-text-secondary border-text-secondary';
    }
  };

  return (
    <header className="bg-gradient-to-r from-primary to-secondary border-b border-accent/20 sticky top-0 z-20">
      <div className="flex items-center justify-between px-3 py-3 sm:px-4 sm:py-4 h-[64px] sm:h-auto">
        {/* Left side - Menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden text-text-secondary hover:text-accent transition-colors p-1"
        >
          <Menu size={24} />
        </button>

        {/* Center - Page title (can be dynamic) */}
        <div className="flex-1 lg:ml-0 ml-2 sm:ml-4">
          <h2 className="text-lg sm:text-xl font-semibold text-text-primary truncate">
            Welcome back, {user?.firstName}!
          </h2>
        </div>

        {/* Right side - Notifications and user profile */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Notification Bell */}
          <NotificationBell />

          {/* User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3 px-2 sm:px-4 py-2 rounded-lg bg-secondary/50 border border-accent/20">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-primary" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-text-primary truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className={`text-xs px-2 py-0.5 rounded-full border inline-block ${getRoleBadgeColor(user?.role)}`}>
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </p>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="text-text-secondary hover:text-error transition-colors p-1"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
