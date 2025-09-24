import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, LogOut, Shield, Globe, ChevronRight } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 text-white">
        <div className="flex items-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-white" />
            )}
          </div>
          <div className="ml-4">
            <h1 className="text-2xl font-bold">
              {profile?.full_name || profile?.username || 'Пользователь'}
            </h1>
            <p className="text-white/80 text-sm mt-1">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Информация профиля</h2>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-center">
              <User className="w-5 h-5 text-gray-400 mr-3" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Имя пользователя</p>
                <p className="text-sm font-medium">{profile?.username || 'Не указано'}</p>
              </div>
            </div>

            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-400 mr-3" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium">{profile?.email || user?.email}</p>
              </div>
            </div>

            <div className="flex items-center">
              <Globe className="w-5 h-5 text-gray-400 mr-3" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Публичный профиль</p>
                <p className="text-sm font-medium">
                  {profile?.is_public ? 'Открыт' : 'Закрыт'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile?.bio && (
          <div className="bg-white rounded-xl shadow-sm mt-4 p-4">
            <h3 className="font-semibold text-gray-900 mb-2">О себе</h3>
            <p className="text-sm text-gray-600">{profile.bio}</p>
          </div>
        )}

        {/* Settings */}
        <div className="bg-white rounded-xl shadow-sm mt-4">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Настройки</h2>
          </div>

          <div className="divide-y divide-gray-100">
            <button
              onClick={() => navigate('/passport')}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-purple-500 mr-3" />
                <span className="text-sm font-medium">Эстетический паспорт</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={handleSignOut}
              className="w-full p-4 flex items-center hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-5 h-5 text-red-500 mr-3" />
              <span className="text-sm font-medium text-red-500">Выйти</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl shadow-sm mt-4 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Активность</h3>
          <p className="text-xs text-gray-500 mb-1">Дата регистрации</p>
          <p className="text-sm font-medium">
            {profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString()
              : 'Неизвестно'}
          </p>
        </div>
      </div>
    </div>
  );
};