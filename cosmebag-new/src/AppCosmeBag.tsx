import React, { useState, useEffect } from 'react';
import { authService } from './services/authService';
import { bagService } from './services/bagService';
import type { Profile, CosmeticBag, BagItem } from './types/database.types';
import {
  Camera, ShoppingBag, Heart, Sparkles, Package, Plus, TrendingUp,
  Search, Users, ArrowRight, Bell, Star, X, Edit2, Check, Share2,
  LogOut, User, Home, Settings
} from 'lucide-react';

function AppCosmeBag() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bag, setBag] = useState<CosmeticBag | null>(null);
  const [bagItems, setBagItems] = useState<BagItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('test@mail.com');
  const [password, setPassword] = useState('test@mail.com');
  const [activeView, setActiveView] = useState<'home' | 'bag' | 'profile'>('home');
  const [activeTab, setActiveTab] = useState<'bag' | 'wishlist'>('bag');
  const [greeting, setGreeting] = useState('Привет');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [bagEmoji, setBagEmoji] = useState('👜');
  const [isSelectingEmoji, setIsSelectingEmoji] = useState(false);

  useEffect(() => {
    checkUser();
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Доброе утро');
    else if (hour < 18) setGreeting('Добрый день');
    else setGreeting('Добрый вечер');
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
    setActiveView('home');
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
          name: `Тестовый продукт ${Date.now()}`,
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
          name: `Новый продукт ${Date.now()}`,
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

  const saveBagName = () => {
    if (editedName.trim() && bag) {
      setBag({ ...bag, display_name: editedName.trim() });
      setIsEditingName(false);
    }
  };

  const startEditingName = () => {
    setEditedName(bag?.display_name || 'Моя косметичка');
    setIsEditingName(true);
  };

  const emojiOptions = ['👜', '💄', '💼', '👝', '🎀', '🌸', '💕', '✨', '🌺', '🦋', '🌈', '💎'];

  const stats = [
    { label: 'В косметичке', value: String(bagItems.filter(i => i.status === 'owned').length), icon: Package, trend: '+3', color: '#667eea' },
    { label: 'В вишлисте', value: String(bagItems.filter(i => i.status === 'wishlist').length), icon: Heart, trend: '+2', color: '#f43f5e' },
    { label: 'Подписки', value: '0', icon: Users, trend: '+12', color: '#ec4899' },
  ];

  const subscriptionUpdates = [
    {
      id: 1,
      user: 'Мария К.',
      avatarUrl: 'https://i.pravatar.cc/150?img=1',
      action: 'добавила новый продукт',
      product: 'Dior Capture Totale',
      bag: 'Дневной уход',
      time: '10 мин назад'
    },
    {
      id: 2,
      user: 'Анна Б.',
      avatarUrl: 'https://i.pravatar.cc/150?img=5',
      action: 'создала косметичку',
      product: '',
      bag: 'Летние must-have',
      time: '1 час назад'
    }
  ];

  // Login Screen
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #f8f9ff 0%, #ffffff 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '30px',
          padding: '40px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(102, 126, 234, 0.15)'
        }}>
          {/* Logo */}
          <div style={{
            width: '90px',
            height: '90px',
            margin: '0 auto 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
          }}>
            💄
          </div>

          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            CosmeBag
          </h1>

          <p style={{
            color: '#64748b',
            fontSize: '16px',
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            Your Personal Beauty Companion
          </p>

          <form onSubmit={handleSignIn}>
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <div style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '20px'
              }}>
                📧
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 48px',
                  fontSize: '16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '16px',
                  outline: 'none',
                  backgroundColor: '#f8fafc',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.backgroundColor = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.backgroundColor = '#f8fafc';
                }}
              />
            </div>

            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <div style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '20px'
              }}>
                🔒
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 48px',
                  fontSize: '16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '16px',
                  outline: 'none',
                  backgroundColor: '#f8fafc',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.backgroundColor = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.backgroundColor = '#f8fafc';
                }}
              />
            </div>

            {error && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#fee2e2',
                border: '1px solid #fca5a5',
                borderRadius: '12px',
                color: '#dc2626',
                fontSize: '14px',
                marginBottom: '24px'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                background: loading ? '#cbd5e1' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                fontSize: '18px',
                fontWeight: '600',
                border: 'none',
                borderRadius: '16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 10px 30px rgba(102, 126, 234, 0.4)'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '12px',
            marginTop: '16px'
          }}>
            test@mail.com / test@mail.com
          </p>
        </div>
      </div>
    );
  }

  // Main App
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f9ff'
    }}>
      {/* Top Navigation */}
      <div style={{
        background: 'white',
        padding: '16px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            CosmeBag
          </h2>
          <button
            onClick={handleSignOut}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <LogOut size={20} color="#64748b" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px', paddingBottom: '100px' }}>
        {activeView === 'home' && (
          <>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <h1 style={{
                fontSize: '26px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '4px'
              }}>
                {greeting}, {profile?.full_name || profile?.username || 'Beautiful'}! ✨
              </h1>
              <p style={{ color: '#64748b', fontSize: '14px' }}>Управляй своей коллекцией красоты</p>
            </div>

            {/* Search Bar */}
            <div style={{
              position: 'relative',
              marginBottom: '24px'
            }}>
              <Search size={20} color="#94a3b8" style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
              <input
                type="text"
                placeholder="Поиск продуктов, косметичек..."
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 48px',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  fontSize: '15px',
                  outline: 'none',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              />
            </div>

            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginBottom: '24px'
            }}>
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      border: '1px solid #f0f0f0',
                      padding: '16px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      cursor: 'pointer'
                    }}
                    onClick={() => stat.label !== 'Подписки' && setActiveView('bag')}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '10px',
                        backgroundColor: stat.color + '15',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon size={18} color={stat.color} strokeWidth={2.5} />
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        color: '#10b981',
                        fontWeight: '600',
                        backgroundColor: '#d1fae5',
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}>
                        <TrendingUp size={10} />
                        <span>{stat.trend}</span>
                      </div>
                    </div>
                    <div style={{
                      fontSize: '28px',
                      fontWeight: 'bold',
                      color: '#1e293b',
                      marginBottom: '4px'
                    }}>
                      {stat.value}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#64748b',
                      fontWeight: '500'
                    }}>
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '32px'
            }}>
              <button
                onClick={addToBag}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Package size={20} color="white" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '2px'
                  }}>
                    Добавить в косметичку
                  </h3>
                </div>
                <ArrowRight size={16} color="#cbd5e1" style={{ marginLeft: 'auto' }} />
              </button>

              <button
                onClick={addToWishlist}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Heart size={20} color="white" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '2px'
                  }}>
                    Добавить в вишлист
                  </h3>
                </div>
                <ArrowRight size={16} color="#cbd5e1" style={{ marginLeft: 'auto' }} />
              </button>
            </div>

            {/* Subscription Updates */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Bell size={18} color="#667eea" />
                  Обновления подписок
                </h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {subscriptionUpdates.map((update) => (
                  <div key={update.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                  }}>
                    {update.avatarUrl ? (
                      <img
                        src={update.avatarUrl}
                        alt={update.user}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '12px',
                          objectFit: 'cover',
                          flexShrink: 0
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #fce7f3 0%, #ddd6fe 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        flexShrink: 0
                      }}>
                        👩
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontSize: '14px',
                        color: '#1e293b',
                        marginBottom: '2px'
                      }}>
                        <span style={{ fontWeight: '600' }}>{update.user}</span>
                        {' '}
                        <span style={{ color: '#64748b' }}>{update.action}</span>
                        {update.product && (
                          <span style={{ fontWeight: '500' }}> "{update.product}"</span>
                        )}
                      </p>
                      {update.bag && (
                        <p style={{
                          fontSize: '12px',
                          color: '#667eea',
                          fontWeight: '500'
                        }}>
                          💼 {update.bag}
                        </p>
                      )}
                      <p style={{
                        fontSize: '11px',
                        color: '#94a3b8',
                        marginTop: '2px'
                      }}>
                        {update.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeView === 'bag' && (
          <>
            {/* Profile Header */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '24px',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '150px',
                height: '150px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%'
              }} />

              <div style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #fce7f3 0%, #ddd6fe 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px',
                  flexShrink: 0,
                  border: '3px solid rgba(255,255,255,0.3)',
                  cursor: 'pointer'
                }}
                onClick={() => setIsSelectingEmoji(true)}
                >
                  {bagEmoji}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px'
                  }}>
                    {isEditingName ? (
                      <>
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && saveBagName()}
                          style={{
                            fontSize: '22px',
                            fontWeight: 'bold',
                            background: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '8px',
                            padding: '4px 8px',
                            outline: 'none',
                            color: 'white'
                          }}
                          autoFocus
                        />
                        <button
                          onClick={saveBagName}
                          style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Check size={18} color="white" />
                        </button>
                        <button
                          onClick={() => setIsEditingName(false)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <X size={18} color="white" />
                        </button>
                      </>
                    ) : (
                      <>
                        <h1 style={{
                          fontSize: '22px',
                          fontWeight: 'bold',
                          margin: 0
                        }}>
                          {bag?.display_name || profile?.full_name || 'Моя косметичка'}
                        </h1>
                        <button
                          onClick={startEditingName}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Edit2 size={16} color="white" opacity={0.8} />
                        </button>
                      </>
                    )}
                  </div>
                  <p style={{
                    fontSize: '14px',
                    opacity: 0.9
                  }}>
                    @{profile?.username || 'user'} • {bagItems.filter(i => i.status === 'owned').length} продуктов
                  </p>
                </div>

                <button style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0
                }}>
                  <Share2 size={20} color="white" />
                </button>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px'
              }}>
                <button
                  onClick={addToBag}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: 'white',
                    color: '#667eea',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Plus size={18} />
                  Добавить товар
                </button>
                <button
                  onClick={fetchUserData}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.3)',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  🔄 Обновить
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex',
              backgroundColor: '#f1f5f9',
              borderRadius: '12px',
              padding: '4px',
              marginBottom: '20px'
            }}>
              <button
                onClick={() => setActiveTab('bag')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeTab === 'bag' ? 'white' : 'transparent',
                  color: activeTab === 'bag' ? '#667eea' : '#64748b',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'bag' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <ShoppingBag size={16} />
                Моя косметичка
              </button>
              <button
                onClick={() => setActiveTab('wishlist')}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeTab === 'wishlist' ? 'white' : 'transparent',
                  color: activeTab === 'wishlist' ? '#667eea' : '#64748b',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'wishlist' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Heart size={16} />
                Мой вишлист
              </button>
            </div>

            {/* Info text */}
            <p style={{
              fontSize: '14px',
              color: '#64748b',
              marginBottom: '16px'
            }}>
              {activeTab === 'bag'
                ? 'Это товары, которые вы уже купили и можете оценить'
                : 'Товары, которые вы хотите приобрести'}
            </p>

            {/* Products Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px'
            }}>
              {bagItems
                .filter(item => activeTab === 'bag' ? item.status === 'owned' : item.status === 'wishlist')
                .map((item) => (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                  >
                    <div style={{
                      width: '100%',
                      height: '160px',
                      background: 'linear-gradient(135deg, #fce7f3 0%, #ddd6fe 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Package size={32} color="#a78bfa" />
                    </div>
                    <div style={{ padding: '12px' }}>
                      <h3 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1e293b',
                        marginBottom: '4px'
                      }}>
                        {item.product_data?.name}
                      </h3>
                      <p style={{
                        fontSize: '12px',
                        color: '#94a3b8',
                        marginBottom: '8px'
                      }}>
                        {item.product_data?.brand}
                      </p>
                      {item.product_data?.price && (
                        <p style={{
                          fontSize: '14px',
                          color: '#667eea',
                          fontWeight: 'bold'
                        }}>
                          ${item.product_data.price}
                        </p>
                      )}
                      {item.is_favorite && (
                        <span style={{ position: 'absolute', top: '12px', right: '12px' }}>❤️</span>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* Empty state */}
            {bagItems.filter(item => activeTab === 'bag' ? item.status === 'owned' : item.status === 'wishlist').length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#94a3b8'
              }}>
                <Package size={64} color="#e2e8f0" style={{ marginBottom: '16px' }} />
                <p style={{ fontSize: '16px', marginBottom: '8px' }}>
                  {activeTab === 'bag' ? 'Косметичка пока пуста' : 'Вишлист пока пуст'}
                </p>
                <p style={{ fontSize: '14px', marginBottom: '20px' }}>
                  {activeTab === 'bag'
                    ? 'Добавьте первый продукт в вашу косметичку'
                    : 'Добавляйте товары, которые хотите приобрести'}
                </p>
                <button
                  onClick={activeTab === 'bag' ? addToBag : addToWishlist}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={18} />
                  Добавить первый товар
                </button>
              </div>
            )}
          </>
        )}

        {activeView === 'profile' && (
          <div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              👤 Профиль
            </h2>
            {profile ? (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}>
                <p style={{ marginBottom: '12px' }}>
                  <strong>Username:</strong> {profile.username || 'Не указан'}
                </p>
                <p style={{ marginBottom: '12px' }}>
                  <strong>Полное имя:</strong> {profile.full_name || 'Не указано'}
                </p>
                <p style={{ marginBottom: '12px' }}>
                  <strong>Email:</strong> {profile.email || user?.email}
                </p>
                <p style={{ marginBottom: '12px' }}>
                  <strong>Публичный профиль:</strong> {profile.is_public ? 'Да' : 'Нет'}
                </p>
                <p>
                  <strong>Зарегистрирован:</strong> {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p style={{ color: '#64748b' }}>Профиль не найден</p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1px solid #e2e8f0',
        padding: '12px 0',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center'
      }}>
        <button
          onClick={() => setActiveView('home')}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Home size={24} color={activeView === 'home' ? '#667eea' : '#94a3b8'} />
          <span style={{
            fontSize: '11px',
            color: activeView === 'home' ? '#667eea' : '#94a3b8'
          }}>
            Главная
          </span>
        </button>

        <button
          onClick={() => setActiveView('bag')}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <ShoppingBag size={24} color={activeView === 'bag' ? '#667eea' : '#94a3b8'} />
          <span style={{
            fontSize: '11px',
            color: activeView === 'bag' ? '#667eea' : '#94a3b8'
          }}>
            Косметичка
          </span>
        </button>

        <button
          onClick={() => setActiveView('profile')}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <User size={24} color={activeView === 'profile' ? '#667eea' : '#94a3b8'} />
          <span style={{
            fontSize: '11px',
            color: activeView === 'profile' ? '#667eea' : '#94a3b8'
          }}>
            Профиль
          </span>
        </button>
      </div>

      {/* Emoji Selector Modal */}
      {isSelectingEmoji && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '20px',
            maxWidth: '400px',
            width: '100%'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '16px'
            }}>
              Выберите иконку косметички
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '8px',
              marginBottom: '20px'
            }}>
              {emojiOptions.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    setBagEmoji(emoji);
                    setIsSelectingEmoji(false);
                  }}
                  style={{
                    fontSize: '28px',
                    padding: '8px',
                    border: bagEmoji === emoji ? '2px solid #667eea' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                    backgroundColor: bagEmoji === emoji ? '#f0f4ff' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsSelectingEmoji(false)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: 'white',
                color: '#64748b',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppCosmeBag;