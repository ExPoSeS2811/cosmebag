import React, { useState, useEffect } from 'react';
import { authService } from './services/authService';
import { bagService } from './services/bagService';
import type { Profile, CosmeticBag, BagItem } from './types/database.types';

function AppWithStyles() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bag, setBag] = useState<CosmeticBag | null>(null);
  const [bagItems, setBagItems] = useState<BagItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('test@mail.com');
  const [password, setPassword] = useState('test@mail.com');
  const [activeTab, setActiveTab] = useState('bag');

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const checkUser = async () => {
    const { data } = await authService.getSession();
    if (data?.session) {
      setUser(data.session.user);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await authService.signIn(email, password);
      if (error) throw error;

      setUser(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await authService.signOut();
    setUser(null);
    setProfile(null);
    setBag(null);
    setBagItems([]);
  };

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const profileData = await bagService.fetchProfile(user.id);
      if (profileData) {
        setProfile(profileData);
      }

      const bagData = await bagService.fetchBag(user.id);
      if (bagData) {
        setBag(bagData);
        const items = await bagService.fetchBagItems(bagData.id);
        setBagItems(items);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async () => {
    try {
      await bagService.addToWishlist(
        `test-${Date.now()}`,
        {
          name: 'Тестовый продукт',
          brand: 'Test Brand',
          category: 'Skincare',
          price: 100
        },
        'Тестовая заметка',
        3
      );
      alert('✅ Добавлено в wishlist!');
      fetchUserData();
    } catch (err: any) {
      alert(`Ошибка: ${err.message}`);
    }
  };

  const addToBag = async () => {
    try {
      await bagService.addProductToBag(
        `test-${Date.now()}`,
        {
          name: 'Новый продукт',
          brand: 'New Brand',
          category: 'Makeup',
          price: 50
        },
        'Мой любимый продукт'
      );
      alert('✅ Добавлено в косметичку!');
      fetchUserData();
    } catch (err: any) {
      alert(`Ошибка: ${err.message}`);
    }
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #9333ea, #ec4899)',
    padding: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  };

  const cardStyle: React.CSSProperties = {
    background: 'white',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    marginBottom: '12px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px'
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    background: '#9333ea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '12px',
    background: active ? '#9333ea' : '#e5e7eb',
    color: active ? 'white' : '#6b7280',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: active ? 'bold' : 'normal'
  });

  const productCardStyle: React.CSSProperties = {
    background: '#f9fafb',
    padding: '16px',
    marginBottom: '12px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb'
  };

  if (!user) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', textAlign: 'center', marginBottom: '32px' }}>
            ✨ CosmeBag
          </h1>

          <form onSubmit={handleSignIn}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              style={inputStyle}
              required
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              style={inputStyle}
              required
            />

            {error && (
              <div style={{ color: '#ef4444', marginBottom: '12px', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <button type="submit" style={buttonStyle} disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px', marginTop: '16px' }}>
            test@mail.com / test@mail.com
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ ...cardStyle, maxWidth: '800px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>
            👋 Привет, {profile?.full_name || profile?.username || 'Пользователь'}!
          </h1>
          <button
            onClick={handleSignOut}
            style={{ ...buttonStyle, width: 'auto', padding: '8px 16px', background: '#ef4444' }}
          >
            Выйти
          </button>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            {user?.email}
          </p>
        </div>

        <div style={{ display: 'flex', marginBottom: '24px' }}>
          <button style={tabStyle(activeTab === 'bag')} onClick={() => setActiveTab('bag')}>
            👜 Косметичка ({bagItems.filter(i => i.status === 'owned').length})
          </button>
          <button style={tabStyle(activeTab === 'wishlist')} onClick={() => setActiveTab('wishlist')}>
            💝 Wishlist ({bagItems.filter(i => i.status === 'wishlist').length})
          </button>
          <button style={tabStyle(activeTab === 'profile')} onClick={() => setActiveTab('profile')}>
            👤 Профиль
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button onClick={addToBag} style={{ ...buttonStyle, background: '#10b981' }}>
            ➕ Добавить в косметичку
          </button>
          <button onClick={addToWishlist} style={{ ...buttonStyle, background: '#ec4899' }}>
            💝 Добавить в wishlist
          </button>
          <button onClick={fetchUserData} style={{ ...buttonStyle, background: '#3b82f6' }}>
            🔄 Обновить
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Загрузка...
          </div>
        )}

        {activeTab === 'bag' && !loading && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
              {bag?.emoji} {bag?.display_name || 'Моя косметичка'}
            </h2>
            {bagItems.filter(i => i.status === 'owned').length === 0 ? (
              <p style={{ color: '#6b7280' }}>Косметичка пуста</p>
            ) : (
              bagItems.filter(i => i.status === 'owned').map(item => (
                <div key={item.id} style={productCardStyle}>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {item.product_data?.name}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>
                    {item.product_data?.brand}
                  </p>
                  {item.product_data?.price && (
                    <p style={{ color: '#9333ea', fontWeight: 'bold', marginTop: '8px' }}>
                      ${item.product_data.price}
                    </p>
                  )}
                  {item.notes && (
                    <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '8px' }}>
                      {item.notes}
                    </p>
                  )}
                  {item.is_favorite && <span>❤️ Любимое</span>}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'wishlist' && !loading && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
              💝 Список желаний
            </h2>
            {bagItems.filter(i => i.status === 'wishlist').length === 0 ? (
              <p style={{ color: '#6b7280' }}>Список желаний пуст</p>
            ) : (
              bagItems.filter(i => i.status === 'wishlist').map(item => (
                <div key={item.id} style={{ ...productCardStyle, borderLeft: '4px solid #ec4899' }}>
                  <h3 style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {item.product_data?.name}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>
                    {item.product_data?.brand}
                  </p>
                  {item.product_data?.price && (
                    <p style={{ color: '#ec4899', fontWeight: 'bold', marginTop: '8px' }}>
                      ${item.product_data.price}
                    </p>
                  )}
                  {item.priority && (
                    <p style={{ fontSize: '12px', marginTop: '8px' }}>
                      Приоритет: {'⭐'.repeat(item.priority)}
                    </p>
                  )}
                  {item.notes && (
                    <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '8px' }}>
                      {item.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'profile' && !loading && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
              👤 Профиль
            </h2>
            {profile ? (
              <div style={productCardStyle}>
                <p style={{ marginBottom: '8px' }}>
                  <strong>Username:</strong> {profile.username || 'Не указан'}
                </p>
                <p style={{ marginBottom: '8px' }}>
                  <strong>Полное имя:</strong> {profile.full_name || 'Не указано'}
                </p>
                <p style={{ marginBottom: '8px' }}>
                  <strong>Email:</strong> {profile.email || user?.email}
                </p>
                <p style={{ marginBottom: '8px' }}>
                  <strong>Публичный профиль:</strong> {profile.is_public ? 'Да' : 'Нет'}
                </p>
                <p>
                  <strong>Зарегистрирован:</strong> {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p style={{ color: '#6b7280' }}>Профиль не найден</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AppWithStyles;