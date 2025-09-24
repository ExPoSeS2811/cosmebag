import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { bagService } from '../services/bagService';
import { Camera, ShoppingBag, Heart, Sparkles, Package, Plus, Users, ArrowRight } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [greeting, setGreeting] = useState('Привет');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Доброе утро');
    else if (hour < 18) setGreeting('Добрый день');
    else setGreeting('Добрый вечер');
  }, []);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const data = await bagService.getUserStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
        <h1 className="text-2xl font-bold">
          {greeting}, {profile?.full_name || profile?.username || 'Красотка'}! ✨
        </h1>
        <p className="text-white/80 mt-1">Что будем делать сегодня?</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="p-4 grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-purple-600">{stats.total_products || 0}</p>
            <p className="text-xs text-gray-600">Продуктов</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-pink-600">{stats.wishlist_items || 0}</p>
            <p className="text-xs text-gray-600">В желаниях</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-indigo-600">{stats.favorite_products || 0}</p>
            <p className="text-xs text-gray-600">Любимых</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-3">Быстрые действия</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/scan"
            className="bg-white rounded-xl p-4 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <Camera className="w-8 h-8 text-purple-500 mb-2" />
            <span className="text-sm font-medium">Сканировать</span>
          </Link>

          <Link
            to="/bag"
            className="bg-white rounded-xl p-4 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <ShoppingBag className="w-8 h-8 text-pink-500 mb-2" />
            <span className="text-sm font-medium">Косметичка</span>
          </Link>

          <Link
            to="/wishlist"
            className="bg-white rounded-xl p-4 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <Heart className="w-8 h-8 text-red-500 mb-2" />
            <span className="text-sm font-medium">Желания</span>
          </Link>

          <Link
            to="/passport"
            className="bg-white rounded-xl p-4 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <Sparkles className="w-8 h-8 text-indigo-500 mb-2" />
            <span className="text-sm font-medium">Паспорт</span>
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-3">Возможности</h2>
        <div className="space-y-3">
          <Link
            to="/products"
            className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <Package className="w-6 h-6 text-purple-500 mr-3" />
              <div>
                <p className="font-medium">Каталог продуктов</p>
                <p className="text-xs text-gray-500">Найди свой идеальный продукт</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </Link>

          <Link
            to="/feed"
            className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <Users className="w-6 h-6 text-pink-500 mr-3" />
              <div>
                <p className="font-medium">Сообщество</p>
                <p className="text-xs text-gray-500">Смотри косметички других</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </Link>

          <button
            onClick={() => alert('Скоро будет доступно!')}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-4 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <Plus className="w-5 h-5 mr-2" />
            <span className="font-medium">Добавить продукт</span>
          </button>
        </div>
      </div>
    </div>
  );
};