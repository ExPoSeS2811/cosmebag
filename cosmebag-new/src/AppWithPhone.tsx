import React, { useState, useEffect } from 'react';
import { authService } from './services/authService';
import { bagService } from './services/bagService';
import { aestheticPassportService, type AestheticPassport, type CosmetologistVisit } from './services/aestheticPassportService';
import { beautyApiService, type BeautyProduct } from './services/beautyApi';
import { BarcodeScanner } from './components/BarcodeScanner';
import type { Profile, CosmeticBag, BagItem } from './types/database.types';
import {
  Camera, ShoppingBag, Heart, Sparkles, Package, Plus, TrendingUp,
  Search, Users, ArrowRight, ArrowLeft, Bell, Star, X, Edit2, Check, Share2,
  LogOut, User, Home, Settings, MapPin, Grid3x3, List
} from 'lucide-react';

// iPhone Frame Component
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{
        width: '500px',
        maxWidth: '100%',
        height: '100vh',
        maxHeight: '900px',
        backgroundColor: '#ffffff',
        borderRadius: '32px',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 50px 100px -20px rgba(50, 50, 93, 0.25), 0 30px 60px -30px rgba(0, 0, 0, 0.3)'
      }}>
        {children}
      </div>
    </div>
  );
}

function AppWithPhone() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bag, setBag] = useState<CosmeticBag | null>(null);
  const [bagItems, setBagItems] = useState<BagItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('test@mail.com');
  const [password, setPassword] = useState('test@mail.com');
  const [activeView, setActiveView] = useState<'home' | 'bag' | 'scan' | 'products' | 'passport' | 'product'>('home');
  const [activeTab, setActiveTab] = useState<'bag' | 'wishlist'>('bag');
  const [greeting, setGreeting] = useState('Привет');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [bagEmoji, setBagEmoji] = useState('👜');
  const [isSelectingEmoji, setIsSelectingEmoji] = useState(false);
  const [passport, setPassport] = useState<AestheticPassport | null>(null);
  const [visits, setVisits] = useState<CosmetologistVisit[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<BeautyProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showScanner, setShowScanner] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<BeautyProduct | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<BeautyProduct | null>(null);
  const [productTab, setProductTab] = useState<'details' | 'ingredients' | 'reviews'>('details');

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
      fetchPassportData();
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

  const fetchPassportData = async () => {
    try {
      const passportData = await aestheticPassportService.getPassport();
      if (passportData) {
        setPassport(passportData);
      }
      const visitsData = await aestheticPassportService.getVisits();
      setVisits(visitsData);
    } catch (error) {
      console.error('Error fetching passport data:', error);
    }
  };

  const loadCatalogProducts = async (page: number = 1, append: boolean = false) => {
    try {
      setProductsLoading(true);
      let products: BeautyProduct[] = [];

      if (productSearchTerm) {
        products = await beautyApiService.searchProducts(productSearchTerm, page);
      } else if (selectedCategory === 'all') {
        products = await beautyApiService.getAllBeautyProducts(page);
      } else {
        products = await beautyApiService.getProductsByCategory(selectedCategory, page);
      }

      setHasMore(products.length === 100);

      if (append) {
        setCatalogProducts(prev => [...prev, ...products]);
      } else {
        setCatalogProducts(products);
      }

      if (!append && products.length === 0) {
        setCatalogProducts(beautyApiService.getSampleProducts());
      }
    } catch (error) {
      console.error('Error loading catalog products:', error);
      if (!append) {
        setCatalogProducts(beautyApiService.getSampleProducts());
      }
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === 'products') {
      setCurrentPage(1);
      loadCatalogProducts(1, false);
    }
  }, [activeView, selectedCategory]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (activeView === 'products' && productSearchTerm.length > 2) {
        setCurrentPage(1);
        loadCatalogProducts(1, false);
      } else if (activeView === 'products' && productSearchTerm === '') {
        setCurrentPage(1);
        loadCatalogProducts(1, false);
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [productSearchTerm]);

  const openProductDetail = (product: BeautyProduct) => {
    setSelectedProduct(product);
    setActiveView('product');
  };

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

  const navItems = [
    { id: 'home', icon: Home, label: 'Главная' },
    { id: 'bag', icon: ShoppingBag, label: 'Косметичка' },
    { id: 'scan', icon: Camera, label: 'Скан', isSpecial: true },
    { id: 'products', icon: Search, label: 'Обзор' },
    { id: 'passport', icon: Sparkles, label: 'Паспорт' },
  ];

  // Login Screen
  if (!user) {
    return (
      <PhoneFrame>
        <div style={{
          height: '100%',
          background: 'linear-gradient(to bottom, #f8f9ff 0%, #ffffff 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px 30px'
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

          <form onSubmit={handleSignIn} style={{ width: '100%' }}>
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
      </PhoneFrame>
    );
  }

  // Main App with Phone Frame
  return (
    <PhoneFrame>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'linear-gradient(to bottom, #f8f9ff 0%, #ffffff 100%)',
        position: 'relative'
      }}>
        {/* Main content */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: '80px'
        }}>
          {/* Content */}
          <div style={{ padding: '24px', paddingTop: '44px' }}>
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
                        В косметичку
                      </h3>
                    </div>
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
                        В вишлист
                      </h3>
                    </div>
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
                                cursor: 'pointer'
                              }}
                            >
                              <Check size={18} color="white" />
                            </button>
                          </>
                        ) : (
                          <>
                            <h1 style={{
                              fontSize: '22px',
                              fontWeight: 'bold',
                              margin: 0
                            }}>
                              {bag?.display_name || 'Моя косметичка'}
                            </h1>
                            <button
                              onClick={startEditingName}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px'
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
                        cursor: 'pointer'
                      }}
                    >
                      🔄
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
                    Косметичка
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
                    Вишлист
                  </button>
                </div>

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
                        onClick={() => {
                          // Создаем BeautyProduct из BagItem для совместимости
                          const product: BeautyProduct = {
                            id: item.product_id,
                            barcode: item.product_id,
                            name: item.product_data?.name || 'Unknown Product',
                            brand: item.product_data?.brand || 'Unknown Brand',
                            image_url: item.product_data?.image_url || '',
                            categories: item.product_data?.category || '',
                            ingredients: '',
                            quantity: '',
                            packaging: '',
                            countries: '',
                            stores: '',
                            rating: 4.5,
                            reviews: 120
                          };
                          openProductDetail(product);
                        }}
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
                          height: '120px',
                          backgroundColor: '#f8f9fa',
                          overflow: 'hidden',
                          position: 'relative'
                        }}>
                          {item.product_data?.image_url ? (
                            <img
                              src={item.product_data.image_url}
                              alt={item.product_data.name}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  parent.style.background = 'linear-gradient(135deg, #fce7f3 0%, #ddd6fe 100%)';
                                  parent.style.display = 'flex';
                                  parent.style.alignItems = 'center';
                                  parent.style.justifyContent = 'center';
                                  parent.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>';
                                }
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(135deg, #fce7f3 0%, #ddd6fe 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Package size={28} color="#a78bfa" />
                            </div>
                          )}
                        </div>
                        <div style={{ padding: '12px' }}>
                          <h3 style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#1e293b',
                            marginBottom: '4px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {item.product_data?.name}
                          </h3>
                          <p style={{
                            fontSize: '11px',
                            color: '#94a3b8',
                            marginBottom: '6px'
                          }}>
                            {item.product_data?.brand}
                          </p>
                          {item.product_data?.price && (
                            <p style={{
                              fontSize: '13px',
                              color: '#667eea',
                              fontWeight: 'bold'
                            }}>
                              ${item.product_data.price}
                            </p>
                          )}
                          {item.is_favorite && (
                            <span style={{ position: 'absolute', top: '8px', right: '8px' }}>❤️</span>
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
                  </div>
                )}
              </>
            )}

            {activeView === 'scan' && (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px'
              }}>
                <Camera size={64} color="#667eea" style={{ marginBottom: '16px' }} />
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: '24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Сканер штрих-кода
                </h2>
                <p style={{ color: '#64748b', marginBottom: '32px' }}>
                  Сканируйте штрих-код товара, чтобы добавить его в косметичку
                </p>
                <button
                  onClick={() => setShowScanner(true)}
                  style={{
                    padding: '14px 32px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                    marginBottom: '20px'
                  }}
                >
                  📷 Открыть камеру
                </button>

                {scannedProduct && (
                  <div style={{
                    marginTop: '32px',
                    padding: '20px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    textAlign: 'left'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      marginBottom: '12px',
                      color: '#1e293b'
                    }}>
                      Найденный продукт:
                    </h3>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      {scannedProduct.image_url && (
                        <img
                          src={scannedProduct.image_url}
                          alt={scannedProduct.name}
                          style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '12px'
                          }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#1e293b',
                          marginBottom: '4px'
                        }}>
                          {scannedProduct.name}
                        </h4>
                        <p style={{
                          fontSize: '14px',
                          color: '#64748b',
                          marginBottom: '4px'
                        }}>
                          {scannedProduct.brand}
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color: '#94a3b8'
                        }}>
                          Штрих-код: {scannedProduct.barcode}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        await bagService.addProductToBag(
                          scannedProduct.barcode,
                          {
                            name: scannedProduct.name,
                            brand: scannedProduct.brand,
                            category: scannedProduct.categories,
                            price: 0,
                            image_url: scannedProduct.image_url
                          },
                          'Добавлено через сканер'
                        );
                        alert('✅ Продукт добавлен в косметичку!');
                        setScannedProduct(null);
                        fetchUserData();
                      }}
                      style={{
                        marginTop: '16px',
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Добавить в косметичку
                    </button>
                  </div>
                )}
              </div>
            )}

            {showScanner && (
              <BarcodeScanner
                onScan={async (barcode) => {
                  console.log('Scanned:', barcode);
                  setShowScanner(false);
                  const product = await beautyApiService.getProductByBarcode(barcode);
                  if (product) {
                    setScannedProduct(product);
                  } else {
                    alert('Продукт не найден. Попробуйте другой штрих-код.');
                  }
                }}
                onClose={() => setShowScanner(false)}
              />
            )}

            {activeView === 'products' && (
              <div>
                {/* Header */}
                <div style={{ marginBottom: '24px' }}>
                  <h1 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    marginBottom: '16px',
                    color: '#1e293b'
                  }}>
                    Обзор продуктов
                  </h1>

                  {/* Search Bar */}
                  <div style={{
                    position: 'relative',
                    marginBottom: '20px'
                  }}>
                    <Search size={18} color="#94a3b8" style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }} />
                    <input
                      type="text"
                      placeholder="Поиск продуктов или брендов..."
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 40px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: 'white'
                      }}
                    />
                  </div>

                  {/* Category Filter */}
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    overflowX: 'auto',
                    paddingBottom: '8px',
                    marginBottom: '20px'
                  }}>
                    {[
                      { value: 'all', label: 'Все' },
                      { value: 'face-creams', label: 'Кремы для лица' },
                      { value: 'shampoos', label: 'Шампуни' },
                      { value: 'shower-gels', label: 'Гели для душа' },
                      { value: 'body-milks', label: 'Молочко для тела' },
                      { value: 'suncare', label: 'Солнцезащита' },
                      { value: 'perfumes', label: 'Парфюмерия' },
                      { value: 'makeup', label: 'Макияж' },
                      { value: 'skincare', label: 'Уход' }
                    ].map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => setSelectedCategory(cat.value)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          border: selectedCategory === cat.value ? 'none' : '1px solid #e2e8f0',
                          background: selectedCategory === cat.value
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            : 'white',
                          color: selectedCategory === cat.value ? 'white' : '#64748b',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Results Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px'
                  }}>
                    <p style={{
                      fontSize: '14px',
                      color: '#64748b'
                    }}>
                      Показано {catalogProducts.length} товаров
                      {productSearchTerm && ` по запросу "${productSearchTerm}"`}
                    </p>
                    <div style={{
                      display: 'flex',
                      gap: '8px'
                    }}>
                      <button
                        onClick={() => setViewMode('grid')}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: viewMode === 'grid' ? '#667eea' : '#f1f5f9',
                          color: viewMode === 'grid' ? 'white' : '#64748b',
                          cursor: 'pointer'
                        }}
                      >
                        <Grid3x3 size={18} />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: viewMode === 'list' ? '#667eea' : '#f1f5f9',
                          color: viewMode === 'list' ? 'white' : '#64748b',
                          cursor: 'pointer'
                        }}
                      >
                        <List size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Loading State */}
                {productsLoading ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '48px',
                    color: '#94a3b8'
                  }}>
                    Загрузка продуктов...
                  </div>
                ) : (
                  <>
                    {/* Products Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: viewMode === 'grid' ? 'repeat(2, 1fr)' : '1fr',
                      gap: '16px'
                    }}>
                      {catalogProducts.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => openProductDetail(item)}
                          style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            cursor: 'pointer',
                            display: viewMode === 'list' ? 'flex' : 'block'
                          }}
                        >
                          <div style={{
                            width: viewMode === 'list' ? '100px' : '100%',
                            height: viewMode === 'list' ? '100px' : '180px',
                            backgroundColor: '#f8f9fa',
                            overflow: 'hidden',
                            flexShrink: 0,
                            position: 'relative'
                          }}>
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0
                                }}
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/300x300/f8f9fa/cbd5e1?text=No+Image'
                                }}
                              />
                            ) : (
                              <div style={{
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(135deg, #fce7f3 0%, #ddd6fe 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <Package size={40} color="#a78bfa" />
                              </div>
                            )}
                          </div>
                          <div style={{ padding: viewMode === 'list' ? '12px 16px' : '12px', flex: 1 }}>
                            <h3 style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: '#1e293b',
                              marginBottom: '4px',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {item.name}
                            </h3>
                            <p style={{
                              fontSize: '12px',
                              color: '#94a3b8',
                              marginBottom: '8px',
                              textTransform: 'capitalize'
                            }}>
                              {item.brand}
                            </p>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '8px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    size={12}
                                    fill={i < Math.floor(item.rating || 0) ? '#fbbf24' : 'none'}
                                    color={i < Math.floor(item.rating || 0) ? '#fbbf24' : '#e2e8f0'}
                                  />
                                ))}
                                <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '4px' }}>
                                  {item.rating?.toFixed(1)} ({item.reviews})
                                </span>
                              </div>
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}>
                              <span style={{
                                fontSize: '12px',
                                color: '#64748b'
                              }}>
                                {item.quantity || 'Size N/A'}
                              </span>
                              <button
                                onClick={async () => {
                                  await bagService.addProductToBag(
                                    item.barcode || item.id,
                                    {
                                      name: item.name,
                                      brand: item.brand,
                                      category: item.categories,
                                      price: 0,
                                      image_url: item.image_url
                                    },
                                    'Added from catalog'
                                  );
                                  alert('✅ Добавлено в косметичку!');
                                  fetchUserData();
                                }}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '8px',
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  color: 'white',
                                  border: 'none',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  cursor: 'pointer'
                                }}
                              >
                                В косметичку
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Load More Button */}
                    {hasMore && !productsLoading && catalogProducts.length > 0 && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginTop: '32px',
                        marginBottom: '24px'
                      }}>
                        <button
                          onClick={async () => {
                            const nextPage = currentPage + 1;
                            setCurrentPage(nextPage);
                            await loadCatalogProducts(nextPage, true);
                          }}
                          style={{
                            padding: '12px 32px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                          }}
                        >
                          Загрузить еще
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeView === 'product' && selectedProduct && (
              <div>
                {/* Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <button
                    onClick={() => setActiveView('home')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px',
                      marginRight: '12px'
                    }}
                  >
                    <ArrowLeft size={24} color="#1e293b" />
                  </button>
                  <h1 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    flex: 1,
                    color: '#1e293b'
                  }}>
                    Детали продукта
                  </h1>
                  <button
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px'
                    }}
                  >
                    <Share2 size={20} color="#667eea" />
                  </button>
                </div>

                {/* Product Image */}
                <div style={{
                  width: '100%',
                  height: '300px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  marginBottom: '20px',
                  position: 'relative'
                }}>
                  {selectedProduct.image_url ? (
                    <img
                      src={selectedProduct.image_url}
                      alt={selectedProduct.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(135deg, #fce7f3 0%, #ddd6fe 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Package size={80} color="#a78bfa" />
                    </div>
                  )}
                  <button
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Heart size={20} color="#f43f5e" />
                  </button>
                </div>

                {/* Product Info */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  padding: '20px',
                  marginBottom: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  <h2 style={{
                    fontSize: '22px',
                    fontWeight: 'bold',
                    color: '#1e293b',
                    marginBottom: '8px'
                  }}>
                    {selectedProduct.name}
                  </h2>
                  <p style={{
                    fontSize: '16px',
                    color: '#667eea',
                    fontWeight: '600',
                    marginBottom: '12px'
                  }}>
                    {selectedProduct.brand}
                  </p>

                  {/* Rating */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          fill={i < Math.floor(selectedProduct.rating || 0) ? '#fbbf24' : 'none'}
                          color={i < Math.floor(selectedProduct.rating || 0) ? '#fbbf24' : '#e2e8f0'}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: '14px', color: '#64748b' }}>
                      {selectedProduct.rating?.toFixed(1)} ({selectedProduct.reviews} отзывов)
                    </span>
                  </div>

                  {/* Product Details */}
                  {selectedProduct.quantity && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{ color: '#64748b', fontSize: '14px' }}>Объем:</span>
                      <span style={{ color: '#1e293b', fontSize: '14px', fontWeight: '500' }}>
                        {selectedProduct.quantity}
                      </span>
                    </div>
                  )}

                  {selectedProduct.categories && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '16px'
                    }}>
                      <span style={{ color: '#64748b', fontSize: '14px' }}>Категория:</span>
                      <span style={{ color: '#1e293b', fontSize: '14px', fontWeight: '500' }}>
                        {selectedProduct.categories}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tabs */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  padding: '20px',
                  marginBottom: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  <div style={{
                    display: 'flex',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '12px',
                    padding: '4px',
                    marginBottom: '20px'
                  }}>
                    {['details', 'ingredients', 'reviews'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setProductTab(tab as any)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: productTab === tab ? 'white' : 'transparent',
                          color: productTab === tab ? '#667eea' : '#64748b',
                          fontWeight: '600',
                          fontSize: '14px',
                          cursor: 'pointer',
                          boxShadow: productTab === tab ? '0 2px 4px rgba(0,0,0,0.08)' : 'none'
                        }}
                      >
                        {tab === 'details' ? 'Детали' : tab === 'ingredients' ? 'Состав' : 'Отзывы'}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  {productTab === 'details' && (
                    <div>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1e293b',
                        marginBottom: '12px'
                      }}>
                        О продукте
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#64748b',
                        lineHeight: '1.5',
                        marginBottom: '16px'
                      }}>
                        Этот продукт от {selectedProduct.brand} разработан для обеспечения качественного ухода.
                        Подходит для регулярного использования.
                      </p>

                      {selectedProduct.stores && (
                        <div>
                          <h4 style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#1e293b',
                            marginBottom: '8px'
                          }}>
                            Где купить
                          </h4>
                          <p style={{
                            fontSize: '14px',
                            color: '#64748b'
                          }}>
                            {selectedProduct.stores}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {productTab === 'ingredients' && (
                    <div>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1e293b',
                        marginBottom: '12px'
                      }}>
                        Состав
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#64748b',
                        lineHeight: '1.5'
                      }}>
                        {selectedProduct.ingredients || 'Информация о составе недоступна'}
                      </p>
                    </div>
                  )}

                  {productTab === 'reviews' && (
                    <div>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1e293b',
                        marginBottom: '12px'
                      }}>
                        Отзывы ({selectedProduct.reviews})
                      </h3>
                      <div style={{
                        textAlign: 'center',
                        padding: '20px',
                        color: '#94a3b8'
                      }}>
                        <p>Отзывы пока не загружены</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  <button
                    onClick={async () => {
                      await bagService.addToWishlist(
                        selectedProduct.barcode || selectedProduct.id,
                        {
                          name: selectedProduct.name,
                          brand: selectedProduct.brand,
                          category: selectedProduct.categories,
                          price: 0,
                          image_url: selectedProduct.image_url
                        },
                        'Added from product detail',
                        5
                      );
                      alert('✅ Добавлено в вишлист!');
                      fetchUserData();
                    }}
                    style={{
                      flex: 1,
                      padding: '14px',
                      borderRadius: '12px',
                      border: '2px solid #667eea',
                      backgroundColor: 'transparent',
                      color: '#667eea',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Heart size={18} />
                    В вишлист
                  </button>
                  <button
                    onClick={async () => {
                      await bagService.addProductToBag(
                        selectedProduct.barcode || selectedProduct.id,
                        {
                          name: selectedProduct.name,
                          brand: selectedProduct.brand,
                          category: selectedProduct.categories,
                          price: 0,
                          image_url: selectedProduct.image_url
                        },
                        'Added from product detail'
                      );
                      alert('✅ Добавлено в косметичку!');
                      fetchUserData();
                    }}
                    style={{
                      flex: 1,
                      padding: '14px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <ShoppingBag size={18} />
                    В косметичку
                  </button>
                </div>
              </div>
            )}

            {activeView === 'passport' && (
              <div>
                {/* Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '24px'
                }}>
                  <button
                    onClick={() => setActiveView('home')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px',
                      marginRight: '8px'
                    }}
                  >
                    <ArrowLeft size={24} color="#1e293b" />
                  </button>
                  <h1 style={{
                    fontSize: '22px',
                    fontWeight: 'bold',
                    flex: 1,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Digital Aesthetic Passport
                  </h1>
                </div>

                {/* Passport Card */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  padding: '20px',
                  marginBottom: '20px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}>
                  {/* Profile Section */}
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <User size={40} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        color: '#667eea',
                        fontSize: '14px',
                        marginBottom: '4px'
                      }}>
                        @{profile?.username || 'beautylover'}
                      </div>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#1e293b',
                        marginBottom: '4px'
                      }}>
                        {passport?.full_name || profile?.full_name || 'Beauty Enthusiast'}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#64748b'
                      }}>
                        {passport?.birth_date ? `Birth: ${new Date(passport.birth_date).toLocaleDateString('ru-RU')} • Gender: Female` : 'Birth: Not specified • Gender: Female'}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '8px'
                    }}>
                      <button style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px'
                      }}>
                        <Edit2 size={18} color="#667eea" />
                      </button>
                      <button style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px'
                      }}>
                        <Sparkles size={18} color="#667eea" />
                      </button>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '12px',
                        color: '#94a3b8',
                        marginBottom: '4px'
                      }}>
                        City:
                      </div>
                      <div style={{
                        fontSize: '15px',
                        color: '#1e293b',
                        fontWeight: '500'
                      }}>
                        {passport?.city || 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '12px',
                        color: '#94a3b8',
                        marginBottom: '4px'
                      }}>
                        Number:
                      </div>
                      <div style={{
                        fontSize: '15px',
                        color: '#1e293b',
                        fontWeight: '500'
                      }}>
                        {passport?.phone || 'Not specified'}
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '12px',
                        color: '#94a3b8',
                        marginBottom: '4px'
                      }}>
                        Date of issue:
                      </div>
                      <div style={{
                        fontSize: '15px',
                        color: '#1e293b',
                        fontWeight: '500'
                      }}>
                        12.01.2023
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '12px',
                        color: '#94a3b8',
                        marginBottom: '4px'
                      }}>
                        Skin Type:
                      </div>
                      <div style={{
                        fontSize: '15px',
                        color: '#1e293b',
                        fontWeight: '500'
                      }}>
                        {passport?.skin_type || 'Not specified'}
                      </div>
                    </div>
                  </div>

                  {/* Allergies Section */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#94a3b8',
                      marginBottom: '8px'
                    }}>
                      Allergies & Sensitivities:
                    </div>
                    <div style={{
                      padding: '12px',
                      backgroundColor: '#f8f9ff',
                      borderRadius: '10px',
                      fontSize: '14px',
                      color: '#1e293b'
                    }}>
                      {passport?.allergies?.length ? passport.allergies.join(', ') : 'No known allergies'}
                    </div>
                  </div>

                  {/* Personal Notes */}
                  <div>
                    <div style={{
                      fontSize: '12px',
                      color: '#94a3b8',
                      marginBottom: '8px'
                    }}>
                      Personal Notes:
                    </div>
                    <div style={{
                      padding: '12px',
                      backgroundColor: '#f8f9ff',
                      borderRadius: '10px',
                      fontSize: '14px',
                      color: '#94a3b8',
                      fontStyle: 'italic'
                    }}>
                      No notes added yet
                    </div>
                  </div>
                </div>

                {/* Cosmetologist Visits Section */}
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  padding: '20px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '20px'
                  }}>
                    <h2 style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#1e293b'
                    }}>
                      Cosmetologist Visits
                    </h2>
                    <button
                      onClick={async () => {
                        const newVisit = await aestheticPassportService.addVisit({
                          visit_date: new Date().toISOString(),
                          procedures: ['New procedure'],
                          doctor_name: 'Doctor Name',
                          clinic_name: 'Clinic Name',
                          notes: 'Visit notes',
                          created_at: new Date().toISOString()
                        });
                        if (newVisit) {
                          setVisits([newVisit, ...visits]);
                        }
                      }}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Plus size={18} />
                      Add Visit
                    </button>
                  </div>

                  {/* Visits List */}
                  {visits.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: '#94a3b8'
                    }}>
                      <p style={{ fontSize: '14px', marginBottom: '8px' }}>
                        No visits yet
                      </p>
                      <p style={{ fontSize: '12px', color: '#cbd5e1' }}>
                        Add your first cosmetologist visit
                      </p>
                    </div>
                  ) : (
                    visits.map((visit) => (
                    <div
                      key={visit.id}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        padding: '16px',
                        borderRadius: '12px',
                        backgroundColor: '#f8f9ff',
                        marginBottom: '12px',
                        cursor: 'pointer'
                      }}
                      onClick={() => alert(`Visit details: ${visit.procedures?.join(', ')}`)}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #e0e7ff 0%, #fce7f3 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        💉
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '4px'
                        }}>
                          <div style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#1e293b'
                          }}>
                            {new Date(visit.visit_date).toLocaleDateString('ru-RU')}
                          </div>
                          <span style={{
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#667eea',
                            backgroundColor: '#e0e7ff'
                          }}>
                            Clinic
                          </span>
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: '#1e293b',
                          marginBottom: '6px'
                        }}>
                          {visit.procedures?.join(', ') || 'Procedure'}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#64748b',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <MapPin size={12} />
                          {visit.doctor_name} • {visit.clinic_name}
                        </div>
                      </div>
                    </div>
                  ))
                  )}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Bottom navigation */}
        <nav style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderTop: '1px solid #f0f0f0',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            height: '70px',
            padding: '0 10px'
          }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              if (item.isSpecial) {
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id as any)}
                    style={{
                      position: 'relative',
                      marginTop: '-20px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      padding: '14px',
                      borderRadius: '20px',
                      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={24} color="white" />
                    </div>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as any)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Icon
                    size={22}
                    color={isActive ? '#667eea' : '#94a3b8'}
                    style={{
                      filter: isActive ? 'drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3))' : 'none'
                    }}
                  />
                  <span style={{
                    fontSize: '11px',
                    marginTop: '4px',
                    fontWeight: isActive ? '600' : '500',
                    color: isActive ? '#667eea' : '#94a3b8'
                  }}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Emoji Selector Modal */}
        {isSelectingEmoji && (
          <div style={{
            position: 'absolute',
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
              maxWidth: '90%',
              width: '100%'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '16px'
              }}>
                Выберите иконку
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
    </PhoneFrame>
  );
}

export default AppWithPhone;