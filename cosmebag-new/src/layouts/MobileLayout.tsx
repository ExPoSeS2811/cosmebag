import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Heart, User, Sparkles } from 'lucide-react';

export const MobileLayout: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>

      {/* Bottom navigation */}
      <nav className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <Link
            to="/"
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              isActive('/')
                ? 'text-purple-600'
                : 'text-gray-500 hover:text-purple-600'
            }`}
          >
            <Home size={24} />
            <span className="text-xs mt-1">Главная</span>
          </Link>

          <Link
            to="/bag"
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              isActive('/bag')
                ? 'text-purple-600'
                : 'text-gray-500 hover:text-purple-600'
            }`}
          >
            <ShoppingBag size={24} />
            <span className="text-xs mt-1">Косметичка</span>
          </Link>

          <Link
            to="/passport"
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              isActive('/passport')
                ? 'text-purple-600'
                : 'text-gray-500 hover:text-purple-600'
            }`}
          >
            <Sparkles size={24} />
            <span className="text-xs mt-1">Паспорт</span>
          </Link>

          <Link
            to="/wishlist"
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              isActive('/wishlist')
                ? 'text-purple-600'
                : 'text-gray-500 hover:text-purple-600'
            }`}
          >
            <Heart size={24} />
            <span className="text-xs mt-1">Желания</span>
          </Link>

          <Link
            to="/profile"
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              isActive('/profile')
                ? 'text-purple-600'
                : 'text-gray-500 hover:text-purple-600'
            }`}
          >
            <User size={24} />
            <span className="text-xs mt-1">Профиль</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};