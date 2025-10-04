import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  CheckSquare, 
  Users, 
  BarChart3, 
  X 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const getNavigationItems = () => {
    const baseItems = [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['employee', 'manager', 'admin'] },
      { path: '/expenses', label: 'Expenses', icon: Receipt, roles: ['employee', 'manager', 'admin'] },
    ];

    const managerItems = [
      { path: '/approvals', label: 'Approvals', icon: CheckSquare, roles: ['manager', 'admin'] },
    ];

    const adminItems = [
      { path: '/users', label: 'Users', icon: Users, roles: ['admin'] },
      { path: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['manager', 'admin'] },
    ];

    return [...baseItems, ...managerItems, ...adminItems].filter(item => 
      item.roles.includes(user?.role)
    );
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-primary to-secondary
          border-r border-accent/20 z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static
        `}
      >
        {/* Logo and close button */}
        <div className="flex items-center justify-between p-6 border-b border-accent/20">
          <h1 className="text-2xl font-bold text-accent">
            Exe<span className="text-accent-secondary">$</span>Man
          </h1>
          <button
            onClick={onClose}
            className="lg:hidden text-text-secondary hover:text-accent transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300
                  ${isActive 
                    ? 'bg-accent/20 text-accent shadow-glow' 
                    : 'text-text-secondary hover:bg-accent/10 hover:text-accent'
                  }`
                }
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
