import React, { useState, useEffect } from 'react';
import { authService } from './services/authService';
import { bagService } from './services/bagService';
import { testConnection } from './lib/supabase';
import type { Profile, CosmeticBag, BagItem, AestheticPassport, CosmetologistVisit } from './types/database.types';

function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bag, setBag] = useState<CosmeticBag | null>(null);
  const [bagItems, setBagItems] = useState<BagItem[]>([]);
  const [passport, setPassport] = useState<AestheticPassport | null>(null);
  const [visits, setVisits] = useState<CosmetologistVisit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('connection');
  const [email, setEmail] = useState('test@mail.com');
  const [password, setPassword] = useState('test@mail.com');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    checkConnection();
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    const isConnected = await testConnection();
    setConnectionStatus(isConnected ? 'connected' : 'error');
  };

  const checkUser = async () => {
    const { data } = await authService.getSession();
    if (data?.session) {
      setUser(data.session.user);
      setIsLoggedIn(true);
    }
  };

  const signIn = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await authService.signIn(email, password);

      if (error) throw error;

      setUser(data.user);
      setIsLoggedIn(true);
      alert('✅ Успешный вход!');
    } catch (err: any) {
      setError(err.message);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setIsLoggedIn(false);
    setProfile(null);
    setBag(null);
    setBagItems([]);
    setPassport(null);
    setVisits([]);
  };

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch profile
      const profileData = await bagService.fetchProfile(user.id);
      if (profileData) {
        setProfile(profileData);
      }

      // Fetch passport
      const passportData = await bagService.fetchPassport(user.id);
      if (passportData) {
        setPassport(passportData);
      }

      // Fetch bag
      const bagData = await bagService.fetchBag(user.id);
      if (bagData) {
        setBag(bagData);

        // Fetch bag items
        const items = await bagService.fetchBagItems(bagData.id);
        setBagItems(items);
      }

      // Fetch visits
      const visitsData = await bagService.fetchVisits(user.id);
      setVisits(visitsData);

    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const testAddToWishlist = async () => {
    try {
      await bagService.addToWishlist(
        `test-${Date.now()}`,
        {
          name: 'La Mer Увлажняющий крем',
          brand: 'La Mer',
          category: 'Skincare',
          price: 325.00,
          description: 'Роскошный увлажняющий крем'
        },
        'Хочу попробовать!',
        5
      );

      alert('✅ Продукт добавлен в wishlist!');
      fetchUserData();
    } catch (err: any) {
      alert(`❌ Ошибка: ${err.message}`);
    }
  };

  const testAddToBag = async () => {
    try {
      await bagService.addProductToBag(
        `test-${Date.now()}`,
        {
          name: 'Charlotte Tilbury Pillow Talk Помада',
          brand: 'Charlotte Tilbury',
          category: 'Makeup',
          price: 34.00,
          description: 'Нюдово-розовая помада'
        },
        'Моя любимая помада'
      );

      alert('✅ Продукт добавлен в косметичку!');
      fetchUserData();
    } catch (err: any) {
      alert(`❌ Ошибка: ${err.message}`);
    }
  };

  const testMoveToOwned = async (productId: string) => {
    try {
      await bagService.moveToOwned(productId);
      alert('✅ Продукт перемещен в косметичку!');
      fetchUserData();
    } catch (err: any) {
      alert(`❌ Ошибка: ${err.message}`);
    }
  };

  const testGetUserBag = async () => {
    try {
      const data = await bagService.getUserBag();
      console.log('User Bag Data:', data);
      alert('✅ Данные получены! Проверьте консоль');
    } catch (err: any) {
      alert(`❌ Ошибка: ${err.message}`);
    }
  };

  const testGetUserStats = async () => {
    try {
      const data = await bagService.getUserStats();
      console.log('User Stats:', data);
      alert(`✅ Статистика:\n- Продуктов: ${data.total_products}\n- В wishlist: ${data.wishlist_items}\n- Избранных: ${data.favorite_products}`);
    } catch (err: any) {
      alert(`❌ Ошибка: ${err.message}`);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">
            CosmeBag
          </h1>
          <p className="text-center text-gray-600 mb-6">Тестовая страница Supabase</p>

          <div className="mb-4">
            <div className="flex items-center justify-center mb-4">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
              }`}></div>
              <span className="text-sm text-gray-600">
                {connectionStatus === 'connected' ? 'Подключено к Supabase' :
                 connectionStatus === 'error' ? 'Ошибка подключения' : 'Проверка подключения...'}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={signIn}
              disabled={loading || connectionStatus !== 'connected'}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <p className="text-xs text-center text-gray-500">
              По умолчанию: test@mail.com / test@mail.com
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">
              CosmeBag Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">👤 {user?.email}</span>
              <button
                onClick={signOut}
                className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-white p-1 rounded-lg shadow-sm">
          {['connection', 'passport', 'bag', 'wishlist', 'visits', 'profile', 'tests'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab === 'connection' && '🔌 Подключение'}
              {tab === 'passport' && '✨ Паспорт'}
              {tab === 'bag' && `👜 Косметичка (${bagItems.filter(i => i.status === 'owned').length})`}
              {tab === 'wishlist' && `💝 Wishlist (${bagItems.filter(i => i.status === 'wishlist').length})`}
              {tab === 'visits' && `👩‍⚕️ Визиты (${visits.length})`}
              {tab === 'profile' && '👤 Профиль'}
              {tab === 'tests' && '🧪 Тесты'}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={fetchUserData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            🔄 Обновить данные
          </button>
          <button
            onClick={testAddToWishlist}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            ➕ Добавить в Wishlist
          </button>
          <button
            onClick={testAddToBag}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            👜 Добавить в косметичку
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Connection Tab */}
            {activeTab === 'connection' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Статус подключения</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-3 ${
                      connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span>Supabase: {connectionStatus === 'connected' ? 'Подключено' : 'Ошибка'}</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-3 ${user ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>Аутентификация: {user ? 'Авторизован' : 'Не авторизован'}</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-3 ${profile ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span>Профиль: {profile ? 'Загружен' : 'Не найден'}</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-3 ${bag ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span>Косметичка: {bag ? 'Загружена' : 'Не найдена'}</span>
                  </div>
                  <button
                    onClick={checkConnection}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    Проверить подключение
                  </button>
                </div>
              </div>
            )}

            {/* Passport Tab */}
            {activeTab === 'passport' && (
              <div>
                <h2 className="text-xl font-bold mb-4">✨ Эстетический паспорт</h2>
                {passport ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-500">Тип кожи:</label>
                        <p className="font-medium">{passport.skin_type}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Создан:</label>
                        <p className="font-medium">{new Date(passport.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Проблемы кожи:</label>
                      <p className="font-medium">
                        {passport.skin_concerns?.length > 0
                          ? passport.skin_concerns.join(', ')
                          : 'Не указаны'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Аллергии:</label>
                      <p className="font-medium">
                        {passport.allergies?.length > 0
                          ? passport.allergies.join(', ')
                          : 'Не указаны'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Заметки:</label>
                      <p className="font-medium">{passport.notes || 'Нет заметок'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Паспорт не найден</p>
                )}
              </div>
            )}

            {/* Bag Tab */}
            {activeTab === 'bag' && (
              <div>
                <h2 className="text-xl font-bold mb-4">
                  {bag?.emoji} {bag?.display_name || 'Моя косметичка'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bagItems.filter(i => i.status === 'owned').map(item => (
                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-medium">{item.product_data?.name}</h3>
                      <p className="text-sm text-gray-600">{item.product_data?.brand}</p>
                      <p className="text-lg font-bold text-purple-600">${item.product_data?.price}</p>
                      {item.rating && <p className="text-sm">{'⭐'.repeat(item.rating)}</p>}
                      {item.is_favorite && <span className="text-red-500">❤️ Любимое</span>}
                      {item.notes && <p className="text-sm text-gray-500 mt-2">{item.notes}</p>}
                    </div>
                  ))}
                  {bagItems.filter(i => i.status === 'owned').length === 0 && (
                    <p className="text-gray-500 col-span-3">В косметичке пока ничего нет</p>
                  )}
                </div>
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-xl font-bold mb-4">💝 Список желаний</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bagItems.filter(i => i.status === 'wishlist').map(item => (
                    <div key={item.id} className="border border-pink-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-pink-50">
                      <h3 className="font-medium">{item.product_data?.name}</h3>
                      <p className="text-sm text-gray-600">{item.product_data?.brand}</p>
                      <p className="text-lg font-bold text-pink-600">${item.product_data?.price}</p>
                      {item.priority && <p className="text-sm">Приоритет: {'⭐'.repeat(item.priority)}</p>}
                      {item.notes && <p className="text-sm text-gray-500 mt-2">{item.notes}</p>}
                      <button
                        onClick={() => testMoveToOwned(item.product_id)}
                        className="mt-2 bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Купить
                      </button>
                    </div>
                  ))}
                  {bagItems.filter(i => i.status === 'wishlist').length === 0 && (
                    <p className="text-gray-500 col-span-3">Список желаний пуст</p>
                  )}
                </div>
              </div>
            )}

            {/* Visits Tab */}
            {activeTab === 'visits' && (
              <div>
                <h2 className="text-xl font-bold mb-4">👩‍⚕️ Визиты к косметологу</h2>
                {visits.length > 0 ? (
                  <div className="space-y-4">
                    {visits.map(visit => (
                      <div key={visit.id} className="border rounded-lg p-4">
                        <h3 className="font-medium">
                          {new Date(visit.visit_date).toLocaleDateString()}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Врач: {visit.doctor_name || 'Не указан'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Клиника: {visit.clinic_name || 'Не указана'}
                        </p>
                        {visit.procedures?.length > 0 && (
                          <p className="text-sm mt-2">
                            Процедуры: {visit.procedures.join(', ')}
                          </p>
                        )}
                        {visit.recommendations && (
                          <p className="text-sm mt-2">
                            Рекомендации: {visit.recommendations}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Визитов не найдено</p>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-bold mb-4">👤 Профиль</h2>
                {profile ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-500">Username:</label>
                        <p className="font-medium">{profile.username || 'Не указан'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Полное имя:</label>
                        <p className="font-medium">{profile.full_name || 'Не указано'}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Email:</label>
                      <p className="font-medium">{profile.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Био:</label>
                      <p className="font-medium">{profile.bio || 'Не указано'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Публичный профиль:</label>
                      <p className="font-medium">{profile.is_public ? 'Да' : 'Нет'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Зарегистрирован:</label>
                      <p className="font-medium">{new Date(profile.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Профиль не найден</p>
                )}
              </div>
            )}

            {/* Tests Tab */}
            {activeTab === 'tests' && (
              <div>
                <h2 className="text-xl font-bold mb-4">🧪 Тестирование функций</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={testGetUserBag}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Получить данные косметички (RPC)
                  </button>
                  <button
                    onClick={testGetUserStats}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Получить статистику (RPC)
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const bags = await bagService.getPublicBags(5);
                        console.log('Public bags:', bags);
                        alert(`✅ Найдено публичных косметичек: ${bags?.length || 0}`);
                      } catch (err: any) {
                        alert(`❌ Ошибка: ${err.message}`);
                      }
                    }}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Получить публичные косметички
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const results = await bagService.searchBags('test');
                        console.log('Search results:', results);
                        alert(`✅ Найдено косметичек: ${results?.length || 0}`);
                      } catch (err: any) {
                        alert(`❌ Ошибка: ${err.message}`);
                      }
                    }}
                    className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Поиск косметичек
                  </button>
                </div>
                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Откройте консоль браузера (F12) для просмотра детальных результатов тестов
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;