import React, { useState, useEffect, useRef } from 'react';
import { authService } from './services/authService';
import { bagService } from './services/bagService';
import { aestheticPassportService, type AestheticPassport, type CosmetologistVisit } from './services/aestheticPassportService';
import { profileService } from './services/profileService';
import { beautyApiService, type BeautyProduct } from './services/beautyApi';
import { supabase } from './lib/supabase';
import { BarcodeScanner } from './components/BarcodeScanner';
import { Toast, useToast } from './components/Toast';
import type { Profile, CosmeticBag, BagItem } from './types/database.types';
import {
  Camera, ShoppingBag, Heart, Sparkles, Package, Plus, TrendingUp,
  Search, Users, ArrowRight, ArrowLeft, Bell, Star, X, Edit2, Check, Share2,
  LogOut, User, Home, Settings, MapPin, Grid3x3, List, Trash2, Loader2, Info
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

// Loading Components
function LoadingSpinner({ size = 24, color = '#667eea' }: { size?: number, color?: string }) {
  return (
    <Loader2
      size={size}
      color={color}
      style={{
        animation: 'spin 1s linear infinite'
      }}
    />
  );
}

function ProductCardSkeleton() {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
    }}>
      <div style={{
        width: '100%',
        height: '160px',
        background: 'linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite'
      }} />
      <div style={{ padding: '12px' }}>
        <div style={{
          height: '16px',
          background: 'linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s ease-in-out infinite',
          borderRadius: '4px',
          marginBottom: '8px'
        }} />
        <div style={{
          height: '12px',
          width: '60%',
          background: 'linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s ease-in-out infinite',
          borderRadius: '4px',
          marginBottom: '12px'
        }} />
        <div style={{
          height: '32px',
          background: 'linear-gradient(90deg, #f0f0f0 0%, #e0e0e0 50%, #f0f0f0 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s ease-in-out infinite',
          borderRadius: '8px'
        }} />
      </div>
    </div>
  );
}

function LoadingScreen({ message = 'Загрузка...' }: { message?: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '200px',
      gap: '16px'
    }}>
      <LoadingSpinner size={32} />
      <p style={{
        color: '#64748b',
        fontSize: '14px'
      }}>
        {message}
      </p>
    </div>
  );
}

function AppWithPhone() {
  const { toasts, showToast, removeToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bag, setBag] = useState<CosmeticBag | null>(null);
  const [bagItems, setBagItems] = useState<BagItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [activeView, setActiveView] = useState<'home' | 'bag' | 'scan' | 'products' | 'passport' | 'product' | 'visit' | 'followers' | 'following'>('home');
  const [previousView, setPreviousView] = useState<'home' | 'bag' | 'scan' | 'products' | 'passport' | 'product' | 'visit' | 'followers' | 'following'>('home');
  const bagImageRef = useRef<HTMLInputElement>(null);
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
  const [similarProducts, setSimilarProducts] = useState<BeautyProduct[]>([]);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isInBag, setIsInBag] = useState(false);
  const [isEditingPassport, setIsEditingPassport] = useState(false);
  const [editedPassport, setEditedPassport] = useState<{
    skin_type?: 'normal' | 'dry' | 'oily' | 'combination' | 'sensitive';
    skin_concerns: string[];
    allergies: string[];
    notes: string;
  }>({
    skin_type: undefined,
    skin_concerns: [],
    allergies: [],
    notes: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    full_name: '',
    username: '',
    bio: ''
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<CosmetologistVisit | null>(null);
  const [visitForm, setVisitForm] = useState({
    visit_date: new Date().toISOString().split('T')[0],
    procedures: '',
    doctor_name: '',
    clinic_name: '',
    recommendations: '',
    notes: ''
  });
  const [beforePhoto, setBeforePhoto] = useState<File | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<File | null>(null);
  const [bagImage, setBagImage] = useState<string | null>(null);
  const [viewingOthersBag, setViewingOthersBag] = useState<boolean>(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [sharedBagId, setSharedBagId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false
  });
  const [recentScans, setRecentScans] = useState<BeautyProduct[]>([]);
  const [sharedBag, setSharedBag] = useState<CosmeticBag | null>(null);
  const [sharedBagOwner, setSharedBagOwner] = useState<Profile | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [sharedBagItems, setSharedBagItems] = useState<BagItem[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingSharedBag, setIsLoadingSharedBag] = useState(false);

  useEffect(() => {
    checkUser();
    loadRecentScans();
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Доброе утро');
    else if (hour < 18) setGreeting('Добрый день');
    else setGreeting('Добрый вечер');

    // Проверяем URL на наличие bagId для шаринга
    const urlParams = new URLSearchParams(window.location.search);
    const bagIdFromUrl = urlParams.get('bag');
    if (bagIdFromUrl) {
      setSharedBagId(bagIdFromUrl);
      loadSharedBag(bagIdFromUrl);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchPassportData();
    }
  }, [user]);

  // Отдельный useEffect для проверки подписки при изменении sharedBag
  useEffect(() => {
    if (user && sharedBag && viewingOthersBag) {
      checkIfFollowing(sharedBag.id);
    }
  }, [user, sharedBag, viewingOthersBag]);

  const checkIfFollowing = async (bagId: string) => {
    if (!user) return;

    try {
      console.log('Checking if following:', { userId: user.id, bagId });

      const { data: subscription, error } = await supabase
        .from('bag_subscriptions')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_bag_id', bagId)
        .single();

      console.log('Subscription check result:', { subscription, error });

      if (subscription) {
        setIsFollowing(true);
      } else {
        setIsFollowing(false);
      }
    } catch (error) {
      console.log('Error checking subscription:', error);
      // Нет подписки или ошибка
      setIsFollowing(false);
    }
  };

  const checkUser = async () => {
    try {
      const { data } = await authService.getSession();
      if (data?.session) {
        setUser(data.session.user);
      }
    } finally {
      setInitializing(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        // Регистрация
        if (password !== confirmPassword) {
          setError('Пароли не совпадают');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('Пароль должен быть не менее 6 символов');
          setLoading(false);
          return;
        }

        if (!username || username.length < 3) {
          setError('Username должен быть не менее 3 символов');
          setLoading(false);
          return;
        }

        const { data, error } = await authService.signUp(email, password, fullName);
        if (error) throw error;

        // После регистрации создаем профиль пользователя
        if (data.user) {
          // Создаем профиль с username
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              username: username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
              full_name: fullName || null
            });

          if (profileError && profileError.code !== '23505') {
            console.error('Error creating profile:', profileError);
          }

          // Проверяем, требуется ли подтверждение email
          if (data.user.email_confirmed_at) {
            // Email уже подтвержден (например, если отключено подтверждение)
            setUser(data.user);
            showToast('Регистрация успешна!', 'success');
          } else {
            // Требуется подтверждение email
            setError('Регистрация успешна! Проверьте вашу почту для подтверждения аккаунта.');
            setIsRegistering(false);
          }
        }
      } else {
        // Вход
        const { data, error } = await authService.signIn(email, password);
        if (error) {
          if (error.message === 'Email not confirmed') {
            setError('Email не подтвержден. Проверьте вашу почту для активации аккаунта.');
          } else if (error.message === 'Invalid login credentials') {
            setError('Неверный email или пароль');
          } else {
            setError(error.message);
          }
          throw error;
        }
        setUser(data.user);
      }
    } catch (err: any) {
      // Ошибка уже установлена выше
      if (!error) {
        setError('Произошла ошибка при входе');
      }
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
    showToast('Вы вышли из аккаунта', 'info');
  };

  // Using showToast from useToast hook

  const loadRecentScans = () => {
    const saved = localStorage.getItem('recentScans');
    if (saved) {
      setRecentScans(JSON.parse(saved));
    }
  };

  const addToRecentScans = (product: BeautyProduct) => {
    const updated = [product, ...recentScans.filter(p => p.barcode !== product.barcode)].slice(0, 5);
    setRecentScans(updated);
    localStorage.setItem('recentScans', JSON.stringify(updated));
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
        // Устанавливаем название, эмодзи и изображение из базы данных
        if (bagData.display_name) {
          setEditedName(bagData.display_name);
        }
        if (bagData.emoji) {
          setBagEmoji(bagData.emoji);
        }

        // Загружаем изображение из localStorage
        const bagImagesKey = 'cosmebag_images';
        const storedImages = JSON.parse(localStorage.getItem(bagImagesKey) || '{}');
        if (storedImages[bagData.id]) {
          setBagImage(storedImages[bagData.id]);
        } else if (bagData.image_url) {
          setBagImage(bagData.image_url);
        }

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
      showToast('Добавлено в вишлист!', 'success');
      fetchUserData();
    } catch (err: any) {
      showToast(`Ошибка: ${err.message}`);
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
      showToast('Добавлено в косметичку!', 'success');
      fetchUserData();
    } catch (err: any) {
      showToast(`Ошибка: ${err.message}`);
    }
  };

  const saveBagName = async () => {
    if (editedName.trim() && bag) {
      try {
        const updatedBag = await bagService.updateBag(bag.id, {
          display_name: editedName.trim()
        });
        if (updatedBag) {
          setBag(updatedBag);
          setIsEditingName(false);
        }
      } catch (error) {
        console.error('Error saving bag name:', error);
        showToast('Ошибка при сохранении названия');
      }
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
  }, [selectedCategory]);

  // Only load products when first entering products view (not when returning from product detail)
  useEffect(() => {
    if (activeView === 'products' && previousView !== 'product') {
      setCurrentPage(1);
      loadCatalogProducts(1, false);
    }
  }, [activeView]);

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
    // Only update previousView if we're not already on the product page
    if (activeView !== 'product') {
      setPreviousView(activeView);
      // Reset tab to details only when coming from a different view
      setProductTab('details');
    }
    setSelectedProduct(product);
    setActiveView('product');
    loadSimilarProducts(product);

    // Scroll to top when opening product details
    setTimeout(() => {
      const mainElement = document.querySelector('main[style*="flex: 1"]');
      if (mainElement) {
        mainElement.scrollTop = 0;
      }
    }, 50);
  };

  // Custom setActiveView that preserves catalog state
  const navigateToView = (newView: typeof activeView) => {
    // Don't reload products if returning to the same catalog state
    if (newView === 'products' && previousView === 'products') {
      setActiveView(newView);
      return;
    }
    setActiveView(newView);
  };

  // Check if product is already in bag or wishlist
  const isProductInBag = (productId: string) => {
    return bagItems.some(item =>
      item.product_id === productId && item.status === 'owned'
    );
  };

  const isProductInWishlist = (productId: string) => {
    return bagItems.some(item =>
      item.product_id === productId && item.status === 'wishlist'
    );
  };

  const loadSimilarProducts = async (currentProduct: BeautyProduct) => {
    try {
      // Try to get products from the same brand first
      if (currentProduct.brand && currentProduct.brand !== 'Unknown') {
        const brandProducts = await beautyApiService.searchProducts(currentProduct.brand);
        // Filter out the current product and take up to 4 products
        const filtered = brandProducts
          .filter(p => p.barcode !== currentProduct.barcode)
          .slice(0, 4);
        if (filtered.length > 0) {
          setSimilarProducts(filtered);
          return;
        }
      }

      // If no brand products, try by category
      if (currentProduct.categories) {
        // Extract first category word
        const categoryWord = currentProduct.categories.split(',')[0].split(' ')[0];
        const categoryProducts = await beautyApiService.searchProducts(categoryWord);
        const filtered = categoryProducts
          .filter(p => p.barcode !== currentProduct.barcode)
          .slice(0, 4);
        setSimilarProducts(filtered);
      }
    } catch (error) {
      console.error('Error loading similar products:', error);
    }
  };

  const startEditingPassport = () => {
    setEditedPassport({
      skin_type: passport?.skin_type || undefined,
      skin_concerns: passport?.skin_concerns || [],
      allergies: passport?.allergies || [],
      notes: passport?.notes || ''
    });
    setIsEditingPassport(true);
  };

  const savePassport = async () => {
    try {
      const result = await aestheticPassportService.savePassport(editedPassport);
      if (result) {
        setPassport(result);
        setIsEditingPassport(false);
        showToast('Эстетический паспорт сохранен!', 'success');
      } else {
        showToast(' Ошибка при сохранении паспорта');
      }
    } catch (error) {
      console.error('Error saving passport:', error);
      showToast(' Ошибка при сохранении паспорта');
    }
  };

  const cancelEditingPassport = () => {
    setIsEditingPassport(false);
    setEditedPassport({
      skin_type: undefined,
      skin_concerns: [],
      allergies: [],
      notes: ''
    });
  };

  const startEditingProfile = () => {
    setEditedProfile({
      full_name: profile?.full_name || '',
      username: profile?.username || '',
      bio: profile?.bio || ''
    });
    setIsEditingProfile(true);
  };

  const saveProfile = async () => {
    try {
      let updatedProfile = profile;

      // Upload avatar if file is selected
      if (avatarFile) {
        updatedProfile = await profileService.uploadAvatar(avatarFile);
        setAvatarFile(null);
      }

      // Update profile data
      const result = await profileService.updateProfile(editedProfile);
      if (result) {
        setProfile(result);
        setIsEditingProfile(false);
        showToast(' Профиль обновлен!', 'success');
      } else {
        showToast(' Ошибка при обновлении профиля');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast(' Ошибка при обновлении профиля');
    }
  };

  const cancelEditingProfile = () => {
    setIsEditingProfile(false);
    setEditedProfile({
      full_name: '',
      username: '',
      bio: ''
    });
    setAvatarFile(null);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
    }
  };

  const generateRecommendations = () => {
    if (!passport) return [];

    const recommendations = [];
    const skinType = passport.skin_type;
    const concerns = passport.skin_concerns || [];

    // Рекомендации по типу кожи
    if (skinType === 'dry') {
      recommendations.push("🧴 Используйте увлажняющий крем утром и вечером");
      recommendations.push("💧 Избегайте средств со спиртом и сильными кислотами");
      recommendations.push("🌙 На ночь применяйте питательные масла или сыворотки");
    } else if (skinType === 'oily') {
      recommendations.push("🧽 Очищение дважды в день мягким гелем");
      recommendations.push("✨ Используйте матирующие средства и тоники");
      recommendations.push("🍃 BHA кислоты помогут контролировать выработку кожного сала");
    } else if (skinType === 'combination') {
      recommendations.push("🎭 Разные средства для T-зоны и щек");
      recommendations.push("🧴 Легкий увлажняющий крем для всего лица");
      recommendations.push("🌟 Точечное применение матирующих средств");
    } else if (skinType === 'sensitive') {
      recommendations.push("🌸 Гипоаллергенные средства без отдушек");
      recommendations.push("☀️ Обязательная защита от солнца SPF 30+");
      recommendations.push("🧪 Тестируйте новые средства на небольшом участке кожи");
    } else if (skinType === 'normal') {
      recommendations.push("✅ Поддерживающий уход: очищение, увлажнение, защита");
      recommendations.push("🔄 Можете экспериментировать с активными ингредиентами");
      recommendations.push("☀️ Не забывайте про SPF защиту каждый день");
    }

    // Рекомендации по проблемам кожи
    if (concerns.includes('акне') || concerns.includes('acne')) {
      recommendations.push("🎯 Салициловая кислота (BHA) для очищения пор");
      recommendations.push("🚫 Избегайте переочищения - не более 2х раз в день");
    }
    if (concerns.includes('пигментация') || concerns.includes('pigmentation')) {
      recommendations.push("🍋 Витамин C утром для осветления пятен");
      recommendations.push("🌙 Ретинол вечером для обновления кожи");
      recommendations.push("☀️ SPF 50+ обязательно каждый день");
    }
    if (concerns.includes('морщины') || concerns.includes('wrinkles')) {
      recommendations.push("🔬 Ретинол или ретиноиды вечером");
      recommendations.push("💧 Гиалуроновая кислота для увлажнения");
      recommendations.push("💆‍♀️ Массаж лица и гимнастика");
    }

    return recommendations.slice(0, 6); // Максимум 6 рекомендаций
  };

  const toggleRecommendations = () => {
    setShowRecommendations(!showRecommendations);
  };

  const openVisitForm = () => {
    setShowVisitForm(true);
  };

  const closeVisitForm = () => {
    setShowVisitForm(false);
    setVisitForm({
      visit_date: new Date().toISOString().split('T')[0],
      procedures: '',
      doctor_name: '',
      clinic_name: '',
      recommendations: '',
      notes: ''
    });
    setBeforePhoto(null);
    setAfterPhoto(null);
  };

  const saveVisit = async () => {
    try {
      // Convert photos to base64 if uploaded
      let beforePhotoBase64 = '';
      let afterPhotoBase64 = '';

      if (beforePhoto) {
        const reader = new FileReader();
        beforePhotoBase64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(beforePhoto);
        });
      }

      if (afterPhoto) {
        const reader = new FileReader();
        afterPhotoBase64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(afterPhoto);
        });
      }

      const attachments = [];
      if (beforePhotoBase64) attachments.push(`before:${beforePhotoBase64}`);
      if (afterPhotoBase64) attachments.push(`after:${afterPhotoBase64}`);

      const newVisit = await aestheticPassportService.addVisit({
        visit_date: visitForm.visit_date,
        doctor_name: visitForm.doctor_name || null,
        clinic_name: visitForm.clinic_name || null,
        procedures: visitForm.procedures.split(',').map(p => p.trim()).filter(p => p),
        recommendations: visitForm.recommendations || null,
        prescribed_products: [], // Can be extended later
        next_visit_date: null,
        attachments: attachments,
        updated_at: new Date().toISOString()
      });

      if (newVisit) {
        setVisits([newVisit, ...visits]);
        closeVisitForm();
        showToast(' Визит добавлен!', 'success');
      } else {
        showToast(' Ошибка при добавлении визита');
      }
    } catch (error) {
      console.error('Error saving visit:', error);
      showToast(' Ошибка при добавлении визита');
    }
  };

  const openVisitDetail = (visit: CosmetologistVisit) => {
    setSelectedVisit(visit);
    setPreviousView(activeView);
    setActiveView('visit');
  };

  const closeVisitDetail = () => {
    setSelectedVisit(null);
    setActiveView(previousView);
  };

  const deleteVisit = async (visitId: string) => {
    // Direct deletion without confirmation

    try {
      const success = await aestheticPassportService.deleteVisit(visitId);
      if (success) {
        setVisits(visits.filter(v => v.id !== visitId));
        setActiveView(previousView);
        setSelectedVisit(null);
        showToast(' Визит удален!', 'success');
      } else {
        showToast(' Ошибка при удалении визита');
      }
    } catch (error) {
      console.error('Error deleting visit:', error);
      showToast(' Ошибка при удалении визита');
    }
  };

  const uploadBagImage = async (file: File) => {
    if (!bag) return;

    try {
      setIsUploadingImage(true);

      // Convert image to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64Data = await base64Promise;

      // Сохраняем изображение в localStorage
      const bagImagesKey = 'cosmebag_images';
      const storedImages = JSON.parse(localStorage.getItem(bagImagesKey) || '{}');
      storedImages[bag.id] = base64Data;
      localStorage.setItem(bagImagesKey, JSON.stringify(storedImages));

      setBagImage(base64Data);
      showToast(' Изображение косметички обновлено!', 'success');
    } catch (error) {
      console.error('Error processing bag image:', error);
      showToast(' Ошибка при обработке изображения');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      uploadBagImage(file);
    } else {
      showToast('Пожалуйста, выберите изображение');
    }
  };

  const loadSharedBag = async (bagId: string) => {
    setIsLoadingSharedBag(true);
    try {
      // Загружаем данные косметички
      const bagData = await bagService.fetchBagById(bagId);
      if (bagData) {
        setSharedBag(bagData);

        // Загружаем данные владельца
        const ownerData = await bagService.fetchBagOwnerProfile(bagData.user_id);
        if (ownerData) {
          setSharedBagOwner(ownerData);
        }

        // Загружаем продукты
        const items = await bagService.fetchBagItems(bagId);
        setSharedBagItems(items);

        // Проверяем подписку сразу после загрузки
        if (user) {
          await checkIfFollowing(bagId);
        }

        // Переходим к просмотру косметички
        setViewingOthersBag(true);
        setActiveView('bag');
      }
    } catch (error) {
      console.error('Error loading shared bag:', error);
      showToast('Ошибка при загрузке косметички. Попробуйте позже.');
    } finally {
      setIsLoadingSharedBag(false);
    }
  };

  const shareBag = async () => {
    const currentBag = viewingOthersBag ? sharedBag : bag;
    if (!currentBag) return;

    // Создаем уникальную ссылку с ID косметички
    const shareUrl = `${window.location.origin}${window.location.pathname}?bag=${currentBag.id}`;

    // Всегда копируем в буфер обмена
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        showToast(' Ссылка скопирована в буфер обмена!', 'success');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        // Fallback - показываем ссылку для ручного копирования
        prompt('Скопируйте ссылку:', shareUrl);
      }
    } else {
      // Fallback для старых браузеров
      prompt('Скопируйте ссылку:', shareUrl);
    }
  };

  const fetchFollowers = async (bagId?: string) => {
    // Используем переданный bagId или ID текущей косметички
    const targetBagId = bagId || (viewingOthersBag && sharedBag ? sharedBag.id : bag?.id);
    if (!targetBagId) return;

    setLoadingFollowers(true);
    try {
      const data = await profileService.getFollowers(targetBagId);
      // Фильтруем, чтобы не показывать себя в списке подписчиков
      const filteredData = data.filter((follower: any) => {
        // Если у подписчика есть информация о косметичке
        if (follower.follower_bag) {
          return follower.follower_bag.user_id !== (viewingOthersBag && sharedBag ? sharedBag.user_id : bag?.user_id);
        }
        // Или проверяем по follower_id
        return follower.follower_id !== (viewingOthersBag && sharedBag ? sharedBag.user_id : bag?.user_id);
      });
      setFollowers(filteredData);
    } catch (error) {
      console.error('Error fetching followers:', error);
    } finally {
      setLoadingFollowers(false);
    }
  };

  const fetchFollowing = async (userId?: string) => {
    // Для подписок используем userId владельца косметички
    const targetUserId = userId || (viewingOthersBag && sharedBag ? sharedBag.user_id : user?.id);
    if (!targetUserId) return;

    setLoadingFollowing(true);
    try {
      const data = await profileService.getFollowing(targetUserId);
      // Фильтруем, чтобы не показывать свою косметичку в списке подписок
      const filteredData = data.filter((follow: any) => {
        // Если есть информация о косметичке, на которую подписан
        if (follow.following_bag) {
          return follow.following_bag.user_id !== targetUserId;
        }
        return true;
      });
      setFollowing(filteredData);
    } catch (error) {
      console.error('Error fetching following:', error);
    } finally {
      setLoadingFollowing(false);
    }
  };

  const handleFollowBag = async () => {
    if (!user || !sharedBag) return;

    // Проверяем, не пытается ли пользователь подписаться на себя
    if (sharedBag.user_id === user.id) {
      showToast('Вы не можете подписаться на свою косметичку!', 'success');
      return;
    }

    try {
      if (isFollowing) {
        // Отписываемся
        await profileService.unfollowBag(user.id, sharedBag.id);
        setIsFollowing(false);
        showToast('Вы отписались от этой косметички');

        // Обновляем счетчики
        if (bag) {
          setBag({
            ...bag,
            following_count: Math.max((bag.following_count || 0) - 1, 0)
          });
        }
        if (sharedBag) {
          setSharedBag({
            ...sharedBag,
            followers_count: Math.max((sharedBag.followers_count || 0) - 1, 0)
          });
        }
      } else {
        // Подписываемся
        await profileService.followBag(user.id, sharedBag.id);
        setIsFollowing(true);
        showToast(' Вы успешно подписались на эту косметичку!', 'success');

        // Обновляем счетчики
        if (bag) {
          setBag({
            ...bag,
            following_count: (bag.following_count || 0) + 1
          });
        }
        if (sharedBag) {
          setSharedBag({
            ...sharedBag,
            followers_count: (sharedBag.followers_count || 0) + 1
          });
        }
      }
    } catch (error: any) {
      console.error('Error following/unfollowing bag:', error);
      if (error.code === '23505' || error.message?.includes('duplicate')) {
        // Уже подписаны - обновляем состояние без сообщения
        setIsFollowing(true);
        // Обновляем счетчики в любом случае
        if (bag) {
          setBag({
            ...bag,
            following_count: (bag.following_count || 0) + 1
          });
        }
        if (sharedBag) {
          setSharedBag({
            ...sharedBag,
            followers_count: (sharedBag.followers_count || 0) + 1
          });
        }
      } else {
        showToast('Ошибка при выполнении операции. Попробуйте позже.');
      }
    }
  };

  const stats = [
    { label: 'В косметичке', value: String(bagItems.filter(i => i.status === 'owned').length), icon: Package, trend: '+3', color: '#667eea' },
    { label: 'В вишлисте', value: String(bagItems.filter(i => i.status === 'wishlist').length), icon: Heart, trend: '+2', color: '#f43f5e' },
    { label: 'Подписки', value: String(following.length), icon: Users, trend: '+12', color: '#ec4899' },
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

  // Initialization Screen
  if (initializing) {
    return (
      <PhoneFrame>
        <div style={{
          height: '100%',
          background: 'linear-gradient(to bottom, #f8f9ff 0%, #ffffff 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px'
        }}>
          {/* Logo with animation */}
          <div style={{
            width: '100px',
            height: '100px',
            margin: '0 auto 32px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            boxShadow: '0 15px 40px rgba(102, 126, 234, 0.3)',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}>
            💄
          </div>

          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '16px'
          }}>
            CosmeBag
          </h1>

          <LoadingSpinner size={32} />

          <p style={{
            marginTop: '16px',
            color: '#94a3b8',
            fontSize: '14px'
          }}>
            Загружаем вашу косметичку...
          </p>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: .8;
              transform: scale(0.95);
            }
          }
        `}</style>
      </PhoneFrame>
    );
  }

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

          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            {isRegistering ? 'Регистрация' : 'Вход'}
          </h2>

          <form onSubmit={handleSignIn} style={{ width: '100%' }}>
            {isRegistering && (
              <>
                <div style={{ position: 'relative', marginBottom: '20px' }}>
                  <div style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '20px'
                  }}>
                    👤
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ваше имя"
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

                <div style={{ position: 'relative', marginBottom: '20px' }}>
                  <div style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '20px'
                  }}>
                    @
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="Username (минимум 3 символа)"
                    required
                    pattern="[a-z0-9_]{3,}"
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
              </>
            )}

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
                placeholder="Email"
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

            {isRegistering && (
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Подтвердите пароль"
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
              {loading ? 'Загрузка...' : (isRegistering ? 'Зарегистрироваться' : 'Войти')}
            </button>
          </form>

          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
              setEmail('');
              setPassword('');
              setConfirmPassword('');
              setUsername('');
              setFullName('');
            }}
            style={{
              marginTop: '20px',
              background: 'none',
              border: 'none',
              color: '#667eea',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            {isRegistering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
          </button>
        </div>
      </PhoneFrame>
    );
  }

  // Показываем лоадер при загрузке косметички по ссылке
  if (isLoadingSharedBag) {
    return (
      <PhoneFrame>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          background: 'linear-gradient(to bottom, #f8f9ff 0%, #ffffff 100%)'
        }}>
          <LoadingSpinner size={48} />
          <p style={{
            marginTop: '24px',
            fontSize: '18px',
            color: '#667eea',
            fontWeight: '600'
          }}>
            Загружаем косметичку...
          </p>
          <p style={{
            marginTop: '8px',
            fontSize: '14px',
            color: '#94a3b8'
          }}>
            Подождите немного
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
          paddingBottom: '80px',
          minHeight: 0
        }}>
          {/* Content */}
          <div style={{ padding: '20px', paddingTop: '0px' }}>
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
                        onClick={() => {
                          if (stat.label === 'Подписки') {
                            setPreviousView(activeView);
                            setActiveView('following');
                          } else {
                            setViewingOthersBag(false);
                            setActiveView('bag');
                          }
                        }}
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
              <div style={{ paddingTop: '20px' }}>
                {/* Back button when viewing other's bag */}
                {viewingOthersBag && (
                  <button
                    onClick={() => {
                      setViewingOthersBag(false);
                      setSharedBag(null);
                      setSharedBagOwner(null);
                      setSharedBagItems([]);
                      setIsFollowing(false); // Сбрасываем состояние подписки
                      // Удаляем bagId из URL
                      const url = new URL(window.location.href);
                      url.searchParams.delete('bag');
                      window.history.pushState({}, '', url.toString());
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 20px',
                      marginBottom: '16px',
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      border: '1px solid rgba(102, 126, 234, 0.2)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#667eea'
                    }}
                  >
                    <ArrowLeft size={18} />
                    Вернуться к моей косметичке
                  </button>
                )}
                {/* Profile Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '20px',
                  padding: '24px',
                  marginBottom: '24px',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}>

                  {/* Profile Info */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '24px'
                  }}>
                    <div style={{ position: 'relative' }}>
                      {!viewingOthersBag && (
                        <input
                          type="file"
                          ref={bagImageRef}
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: 'none' }}
                        />
                      )}
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '16px',
                        background: (viewingOthersBag && sharedBag) ?
                          (sharedBag.image_url ? `url(${sharedBag.image_url})` : 'linear-gradient(135deg, #fce7f3 0%, #ddd6fe 100%)') :
                          (bag?.image_url ? `url(${bag.image_url})` : 'linear-gradient(135deg, #fce7f3 0%, #ddd6fe 100%)'),
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: ((viewingOthersBag && sharedBag) ? sharedBag.image_url : bag?.image_url) ? '0px' : '36px',
                        flexShrink: 0,
                        border: '3px solid rgba(255,255,255,0.3)',
                        cursor: viewingOthersBag ? 'default' : 'pointer',
                        position: 'relative'
                      }}
                      onClick={() => !viewingOthersBag && bagImageRef.current?.click()}
                      >
                        {!((viewingOthersBag && sharedBag) ? sharedBag.image_url : bag?.image_url) && bagEmoji}
                        {isUploadingImage && (
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0,0,0,0.5)',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                          }}>
                            ⏳
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                      }}>
                        {isEditingName && !viewingOthersBag ? (
                          <>
                            <input
                              type="text"
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && saveBagName()}
                              style={{
                                fontSize: '20px',
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
                              <Check size={16} color="white" />
                            </button>
                          </>
                        ) : (
                          <>
                            <h2 style={{
                              fontSize: '20px',
                              fontWeight: 'bold',
                              margin: 0
                            }}>
                              {(viewingOthersBag && sharedBag) ? sharedBag.display_name : (bag?.display_name || 'Моя косметичка')}
                            </h2>
                            {!viewingOthersBag && (
                              <button
                              onClick={startEditingName}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px'
                              }}
                            >
                              <Edit2 size={14} color="white" opacity={0.8} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                      <p style={{
                        fontSize: '13px',
                        opacity: 0.9,
                        margin: 0
                      }}>
                        @{(viewingOthersBag && sharedBagOwner) ? (sharedBagOwner.username || 'user') : (profile?.username || 'user')}
                      </p>
                    </div>
                  </div>

                  {/* Statistics - moved up */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '20px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        marginBottom: '2px'
                      }}>
                        {(viewingOthersBag && sharedBagItems) ? sharedBagItems.filter(i => i.status === 'owned').length : bagItems.filter(i => i.status === 'owned').length}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        opacity: 0.8
                      }}>
                        товаров
                      </div>
                    </div>
                    <div
                      style={{ textAlign: 'center', cursor: 'pointer' }}
                      onClick={async () => {
                        setPreviousView(activeView);
                        await fetchFollowers();
                        setActiveView('followers');
                      }}
                    >
                      <div style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        marginBottom: '2px'
                      }}>
                        {(viewingOthersBag && sharedBag) ? (sharedBag.followers_count || 0) : (bag?.followers_count || 0)}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        opacity: 0.8
                      }}>
                        подписчиков
                      </div>
                    </div>
                    <div
                      style={{ textAlign: 'center', cursor: 'pointer' }}
                      onClick={async () => {
                        setPreviousView(activeView);
                        await fetchFollowing();
                        setActiveView('following');
                      }}
                    >
                      <div style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        marginBottom: '2px'
                      }}>
                        {(viewingOthersBag && sharedBag) ? (sharedBag.following_count || 0) : (bag?.following_count || 0)}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        opacity: 0.8
                      }}>
                        подписок
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '12px'
                    }}>
                      {!viewingOthersBag && (
                        <button
                          onClick={() => setActiveView('scan')}
                          style={{
                            flex: 1,
                            padding: '14px',
                            borderRadius: '12px',
                            backgroundColor: 'white',
                            color: '#667eea',
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
                          <Plus size={20} />
                          Добавить товар
                        </button>
                      )}
                      <button
                        onClick={shareBag}
                        style={{
                          flex: 1,
                          padding: '14px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          border: '1px solid rgba(255,255,255,0.3)',
                          fontSize: '16px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        <Share2 size={20} />
                        Поделиться
                      </button>
                    </div>
                    {viewingOthersBag && sharedBag && sharedBag.user_id !== user?.id && (
                      <button
                        onClick={handleFollowBag}
                        style={{
                          width: '100%',
                          padding: '14px',
                          borderRadius: '12px',
                          backgroundColor: isFollowing ? '#ef4444' : '#667eea',
                          color: 'white',
                          border: 'none',
                          fontWeight: '600',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        {isFollowing ? 'Отписаться' : 'Подписаться'}
                      </button>
                    )}
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
                  {((viewingOthersBag && sharedBagItems) ? sharedBagItems : bagItems)
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
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '12px',
                            color: '#666',
                            marginTop: '2px'
                          }}>
                            <Star size={12} style={{ marginRight: '4px', fill: '#FFD700', color: '#FFD700' }} />
                            <span>{(4.2 + Math.random() * 0.8).toFixed(1)} ({Math.floor(Math.random() * 200) + 50} отзывов)</span>
                          </div>
                          {item.is_favorite && (
                            <span style={{ position: 'absolute', top: '8px', right: '8px' }}>❤️</span>
                          )}

                          {/* Delete button - скрываем при просмотре чужой косметички */}
                          {!viewingOthersBag && (
                            <button
                              onClick={async (e) => {
                              e.stopPropagation();
                              // Direct deletion without confirmation
                              if (true) {
                                try {
                                  await bagService.removeProduct(item.id);
                                  showToast(' Товар удален!', 'success');
                                  fetchUserData();
                                } catch (error) {
                                  showToast(' Ошибка при удалении товара');
                                }
                              }
                            }}
                            style={{
                              position: 'absolute',
                              top: '8px',
                              left: '8px',
                              background: 'rgba(239, 68, 68, 0.9)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              opacity: 0.8,
                              transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = '1';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = '0.8';
                            }}
                          >
                            <Trash2 size={12} color="white" />
                          </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>

                {/* Empty state */}
                {((viewingOthersBag && sharedBagItems) ? sharedBagItems : bagItems).filter(item => activeTab === 'bag' ? item.status === 'owned' : item.status === 'wishlist').length === 0 && (
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
              </div>
            )}

            {activeView === 'scan' && (
              <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)'
              }}>
                {/* Header */}
                <div style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid rgba(226, 232, 240, 0.5)'
                }}>
                  <button
                    onClick={() => setActiveView('bag')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'none',
                      border: 'none',
                      padding: '0',
                      cursor: 'pointer',
                      color: '#667eea',
                      fontSize: '16px',
                      fontWeight: '500'
                    }}
                  >
                    <ArrowLeft size={20} />
                    Назад
                  </button>
                </div>

                {/* Main Content */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '40px 20px',
                  textAlign: 'center'
                }}>
                  {/* Scanner Icon */}
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '30px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '32px',
                    boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
                    position: 'relative'
                  }}>
                    <div style={{
                      width: '90px',
                      height: '90px',
                      border: '3px solid white',
                      borderRadius: '20px',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Camera size={40} color="white" />
                      {/* Corner decorations */}
                      <div style={{
                        position: 'absolute',
                        top: '-3px',
                        left: '-3px',
                        width: '20px',
                        height: '20px',
                        borderTop: '3px solid white',
                        borderLeft: '3px solid white',
                        borderRadius: '4px 0 0 0'
                      }} />
                      <div style={{
                        position: 'absolute',
                        top: '-3px',
                        right: '-3px',
                        width: '20px',
                        height: '20px',
                        borderTop: '3px solid white',
                        borderRight: '3px solid white',
                        borderRadius: '0 4px 0 0'
                      }} />
                      <div style={{
                        position: 'absolute',
                        bottom: '-3px',
                        left: '-3px',
                        width: '20px',
                        height: '20px',
                        borderBottom: '3px solid white',
                        borderLeft: '3px solid white',
                        borderRadius: '0 0 0 4px'
                      }} />
                      <div style={{
                        position: 'absolute',
                        bottom: '-3px',
                        right: '-3px',
                        width: '20px',
                        height: '20px',
                        borderBottom: '3px solid white',
                        borderRight: '3px solid white',
                        borderRadius: '0 0 4px 0'
                      }} />
                    </div>
                    {/* Pulse animation */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '30px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      opacity: 0.3,
                      animation: 'pulse 2s infinite'
                    }} />
                  </div>

                  <h2 style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    color: '#1e293b'
                  }}>
                    Сканирование товара
                  </h2>
                  <p style={{
                    color: '#64748b',
                    fontSize: '16px',
                    marginBottom: '40px',
                    maxWidth: '280px'
                  }}>
                    Наведите камеру на штрих-код чтобы добавить товар в косметичку
                  </p>

                  <button
                    onClick={() => setShowScanner(true)}
                    style={{
                      padding: '18px 48px',
                      borderRadius: '30px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = 'scale(0.95)';
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <Camera size={20} />
                    Открыть камеру
                  </button>

                  {/* Tips */}
                  <div style={{
                    marginTop: '60px',
                    padding: '20px',
                    background: 'rgba(102, 126, 234, 0.05)',
                    borderRadius: '16px',
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    maxWidth: '320px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      color: '#667eea',
                      fontWeight: '600',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Info size={16} />
                      Полезный совет
                    </div>
                    <p style={{
                      fontSize: '13px',
                      color: '#64748b',
                      lineHeight: '1.5',
                      margin: 0
                    }}>
                      Убедитесь, что штрих-код хорошо освещен и находится в фокусе камеры
                    </p>
                  </div>
                </div>

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
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      marginTop: '16px'
                    }}>
                      <button
                        onClick={() => {
                          setSelectedProduct(scannedProduct);
                          setScannedProduct(null);
                          setActiveView('product');
                        }}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: '8px',
                          backgroundColor: 'white',
                          color: '#667eea',
                          border: '2px solid #667eea',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <ArrowRight size={16} />
                        Подробнее
                      </button>
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
                          showToast(' Продукт добавлен в косметичку!', 'success');
                          setScannedProduct(null);
                          fetchUserData();
                        }}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          border: 'none',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Plus size={16} />
                        В косметичку
                      </button>
                    </div>
                    <button
                      onClick={() => setScannedProduct(null)}
                      style={{
                        marginTop: '8px',
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        backgroundColor: 'transparent',
                        color: '#94a3b8',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Скрыть
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
                    showToast('Продукт не найден. Попробуйте другой штрих-код.');
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
                        backgroundColor: 'white',
                        boxSizing: 'border-box'
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
                    display: 'grid',
                    gridTemplateColumns: viewMode === 'grid' ? 'repeat(2, 1fr)' : '1fr',
                    gap: '16px'
                  }}>
                    {[...Array(6)].map((_, index) => (
                      <ProductCardSkeleton key={index} />
                    ))}
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
                            width: viewMode === 'list' ? '120px' : '100%',
                            height: viewMode === 'list' ? '120px' : '180px',
                            backgroundColor: '#f8f9fa',
                            overflow: 'hidden',
                            flexShrink: 0,
                            position: 'relative',
                            borderRadius: viewMode === 'list' ? '12px' : '0',
                            margin: viewMode === 'list' ? '8px' : '0'
                          }}>
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: viewMode === 'list' ? 'contain' : 'cover',
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

                            {/* Wishlist heart indicator */}
                            {(() => {
                              const productId = item.barcode || item.id;
                              const inWishlist = isProductInWishlist(productId);
                              const inBag = isProductInBag(productId);

                              if (inWishlist) {
                                return (
                                  <div style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    background: 'rgba(236, 72, 153, 0.9)',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backdropFilter: 'blur(4px)'
                                  }}>
                                    <Heart size={12} color="white" fill="white" />
                                  </div>
                                );
                              }

                              if (inBag) {
                                return (
                                  <div style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    background: 'rgba(34, 197, 94, 0.9)',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backdropFilter: 'blur(4px)'
                                  }}>
                                    <Check size={12} color="white" />
                                  </div>
                                );
                              }

                              return null;
                            })()}
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
                              {(() => {
                                const productId = item.barcode || item.id;
                                const inBag = isProductInBag(productId);
                                const inWishlist = isProductInWishlist(productId);

                                if (inBag) {
                                  return (
                                    <button
                                      style={{
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        background: '#22c55e',
                                        color: 'white',
                                        border: 'none',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        cursor: 'default',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <Check size={12} />
                                      В косметичке
                                    </button>
                                  );
                                } else if (inWishlist) {
                                  return (
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        await bagService.addProductToBag(
                                          productId,
                                          {
                                            name: item.name,
                                            brand: item.brand,
                                            category: item.categories,
                                            price: 0,
                                            image_url: item.image_url
                                          },
                                          'Moved from wishlist'
                                        );
                                        showToast(' Перемещено в косметичку!', 'success');
                                        fetchUserData();
                                      }}
                                      style={{
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        background: '#ec4899',
                                        color: 'white',
                                        border: 'none',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <Heart size={12} />
                                      В вишлисте
                                    </button>
                                  );
                                } else {
                                  return (
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        await bagService.addProductToBag(
                                          productId,
                                          {
                                            name: item.name,
                                            brand: item.brand,
                                            category: item.categories,
                                            price: 0,
                                            image_url: item.image_url
                                          },
                                          'Added from catalog'
                                        );
                                        showToast('Добавлено в косметичку!', 'success');
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
                                  );
                                }
                              })()}
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
                    onClick={() => navigateToView(previousView)}
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
                    onClick={async (e) => {
                      e.stopPropagation();
                      const productId = selectedProduct.barcode || selectedProduct.id;
                      const inWishlist = isProductInWishlist(productId);

                      if (inWishlist) {
                        // Remove from wishlist directly
                        try {
                            const item = bagItems.find(item =>
                              item.product_id === productId && item.status === 'wishlist'
                            );
                            if (item) {
                              await bagService.removeProduct(item.id);
                              showToast(' Удалено из вишлиста!', 'success');
                              fetchUserData();
                            }
                        } catch (error) {
                          showToast('Ошибка при удалении', 'error');
                        }
                      } else {
                        // Add to wishlist
                        try {
                          await bagService.addToWishlist(
                            productId,
                            {
                              name: selectedProduct.name,
                              brand: selectedProduct.brand,
                              category: selectedProduct.categories,
                              price: 0,
                              image_url: selectedProduct.image_url
                            },
                            'Added from product image heart',
                            5
                          );
                          showToast(' Добавлено в вишлист!', 'success');
                          fetchUserData();
                        } catch (error) {
                          console.error('Error adding to wishlist:', error);
                          showToast(`❌ Ошибка при добавлении в вишлист: ${error.message || 'Unknown error'}`);
                        }
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: (() => {
                        const productId = selectedProduct.barcode || selectedProduct.id;
                        const inWishlist = isProductInWishlist(productId);
                        return inWishlist ? 'rgba(236, 72, 153, 0.9)' : 'rgba(255, 255, 255, 0.9)';
                      })(),
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
                    {(() => {
                      const productId = selectedProduct.barcode || selectedProduct.id;
                      const inWishlist = isProductInWishlist(productId);
                      return (
                        <Heart
                          size={20}
                          color={inWishlist ? "white" : "#f43f5e"}
                          fill={inWishlist ? "white" : "none"}
                        />
                      );
                    })()}
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
                  {(() => {
                    const productId = selectedProduct.barcode || selectedProduct.id;
                    const inBag = isProductInBag(productId);
                    const inWishlist = isProductInWishlist(productId);

                    return (
                      <>
                        <button
                          onClick={async () => {
                            if (inWishlist) {
                              // Remove from wishlist directly
                              try {
                                  const item = bagItems.find(item =>
                                    item.product_id === productId && item.status === 'wishlist'
                                  );
                                  if (item) {
                                    await bagService.removeProduct(item.id);
                                    showToast(' Удалено из вишлиста!', 'success');
                                    fetchUserData();
                                  }
                              } catch (error) {
                                showToast('Ошибка при удалении', 'error');
                              }
                            }
                            try {
                              console.log('Adding to wishlist:', productId, selectedProduct.name);
                              console.log('User session:', user);
                              await bagService.addToWishlist(
                                productId,
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
                              console.log('Successfully added to wishlist');
                              showToast(' Добавлено в вишлист!', 'success');
                              fetchUserData();
                            } catch (error) {
                              console.error('Error adding to wishlist:', error);
                              console.error('Error details:', JSON.stringify(error, null, 2));
                              showToast(`❌ Ошибка при добавлении в вишлист: ${error.message || 'Unknown error'}`);
                            }
                          }}
                          style={{
                            flex: 1,
                            padding: '14px',
                            borderRadius: '12px',
                            border: inWishlist ? '2px solid #22c55e' : '2px solid #667eea',
                            backgroundColor: inWishlist ? '#22c55e' : 'transparent',
                            color: inWishlist ? 'white' : '#667eea',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                        >
                          {inWishlist ? <Check size={18} /> : <Heart size={18} />}
                          {inWishlist ? 'В вишлисте' : 'В вишлист'}
                        </button>

                        <button
                          onClick={async () => {
                            if (inBag) {
                              // Remove from bag directly
                              try {
                                  const item = bagItems.find(item =>
                                    item.product_id === productId && item.status === 'owned'
                                  );
                                  if (item) {
                                    await bagService.removeProduct(item.id);
                                    showToast(' Удалено из косметички!', 'success');
                                    fetchUserData();
                                  }
                              } catch (error) {
                                showToast('Ошибка при удалении', 'error');
                              }
                            }
                            try {
                              console.log('Adding to bag:', productId, selectedProduct.name);
                              await bagService.addProductToBag(
                                productId,
                                {
                                  name: selectedProduct.name,
                                  brand: selectedProduct.brand,
                                  category: selectedProduct.categories,
                                  price: 0,
                                  image_url: selectedProduct.image_url
                                },
                                'Added from product detail'
                              );
                              console.log('Successfully added to bag');
                              showToast('Добавлено в косметичку!', 'success');
                              fetchUserData();
                            } catch (error) {
                              console.error('Error adding to bag:', error);
                              showToast(' Ошибка при добавлении в косметичку');
                            }
                          }}
                          style={{
                            flex: 1,
                            padding: '14px',
                            borderRadius: '12px',
                            background: inBag ? '#22c55e' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                          {inBag ? <Check size={18} /> : <ShoppingBag size={18} />}
                          {inBag ? 'В косметичке' : 'В косметичку'}
                        </button>
                      </>
                    );
                  })()}
                </div>

                {/* Similar Products */}
                {similarProducts.length > 0 && (
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    padding: '20px',
                    marginTop: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#1e293b',
                      marginBottom: '16px'
                    }}>
                      Похожие продукты
                    </h3>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '12px'
                    }}>
                      {similarProducts.map((item) => (
                        <div
                          key={item.id || item.barcode}
                          onClick={() => openProductDetail(item)}
                          style={{
                            backgroundColor: '#f8f9fa',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                          }}
                        >
                          <div style={{
                            width: '100%',
                            height: '100px',
                            backgroundColor: '#f8f9fa',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                          }}>
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/200x200/f8f9fa/cbd5e1?text=No+Image';
                                }}
                              />
                            ) : (
                              <Package size={32} color="#cbd5e1" />
                            )}
                          </div>
                          <div style={{ padding: '8px' }}>
                            <h4 style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#1e293b',
                              marginBottom: '2px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {item.name}
                            </h4>
                            <p style={{
                              fontSize: '10px',
                              color: '#64748b',
                              marginBottom: '4px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {item.brand}
                            </p>
                            {item.rating && (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px'
                              }}>
                                <Star size={10} fill="#fbbf24" color="#fbbf24" />
                                <span style={{
                                  fontSize: '9px',
                                  color: '#64748b'
                                }}>
                                  {item.rating.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeView === 'visit' && selectedVisit && (
              <div>
                {/* Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '20px 24px 12px',
                  borderBottom: '1px solid #f1f5f9'
                }}>
                  <button
                    onClick={closeVisitDetail}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'none',
                      border: 'none',
                      padding: '8px 16px 8px 8px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      color: '#667eea',
                      fontWeight: '500'
                    }}
                  >
                    <ArrowLeft size={20} />
                    Назад
                  </button>

                  <button
                    onClick={() => deleteVisit(selectedVisit.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'none',
                      border: 'none',
                      padding: '8px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      color: '#ef4444',
                      fontWeight: '500'
                    }}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                {/* Visit Details */}
                <div style={{ padding: '0 24px 100px' }}>
                  {/* Visit Info Card */}
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    padding: '20px',
                    marginBottom: '20px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #f1f5f9'
                  }}>
                    {/* Date Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '20px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          backgroundColor: '#667eea',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <span style={{ fontSize: '24px' }}>✨</span>
                        </div>
                        <div>
                          <h2 style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: '#1e293b',
                            marginBottom: '4px'
                          }}>
                            Посещение
                          </h2>
                          <p style={{
                            fontSize: '14px',
                            color: '#64748b',
                            margin: 0
                          }}>
                            {new Date(selectedVisit.visit_date).toLocaleDateString('ru-RU', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      <div style={{
                        backgroundColor: '#f0f9ff',
                        color: '#0369a1',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        Завершен
                      </div>
                    </div>

                    {/* Services Section */}
                    {selectedVisit.procedures && selectedVisit.procedures.length > 0 && (
                      <div style={{ marginBottom: '20px' }}>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#1e293b',
                          marginBottom: '12px'
                        }}>
                          Услуги
                        </h3>
                        <div style={{ marginBottom: '12px' }}>
                          {typeof selectedVisit.procedures === 'string' ? (
                            <div style={{
                              padding: '12px 16px',
                              backgroundColor: '#f8fafc',
                              borderRadius: '12px',
                              marginBottom: '8px'
                            }}>
                              <p style={{
                                fontSize: '14px',
                                color: '#475569',
                                margin: 0,
                                fontWeight: '500'
                              }}>
                                {selectedVisit.procedures}
                              </p>
                            </div>
                          ) : (
                            selectedVisit.procedures.map((procedure, index) => (
                              <div key={index} style={{
                                padding: '12px 16px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '12px',
                                marginBottom: '8px'
                              }}>
                                <p style={{
                                  fontSize: '14px',
                                  color: '#475569',
                                  margin: 0,
                                  fontWeight: '500'
                                }}>
                                  {procedure}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* Doctor & Clinic Info */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px',
                      marginBottom: '20px'
                    }}>
                      {selectedVisit.doctor_name && (
                        <div>
                          <h4 style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#1e293b',
                            marginBottom: '8px'
                          }}>
                            Врач
                          </h4>
                          <p style={{
                            fontSize: '14px',
                            color: '#475569',
                            margin: 0
                          }}>
                            {selectedVisit.doctor_name}
                          </p>
                        </div>
                      )}

                      {selectedVisit.clinic_name && (
                        <div>
                          <h4 style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#1e293b',
                            marginBottom: '8px'
                          }}>
                            Клиника
                          </h4>
                          <p style={{
                            fontSize: '14px',
                            color: '#475569',
                            margin: 0
                          }}>
                            {selectedVisit.clinic_name}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Recommendations */}
                    {selectedVisit.recommendations && (
                      <div style={{ marginBottom: '20px' }}>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#1e293b',
                          marginBottom: '12px'
                        }}>
                          Рекомендации
                        </h3>
                        <div style={{
                          padding: '16px',
                          backgroundColor: '#fefce8',
                          borderRadius: '12px',
                          border: '1px solid #fde047'
                        }}>
                          <p style={{
                            fontSize: '14px',
                            color: '#713f12',
                            margin: 0,
                            lineHeight: 1.5
                          }}>
                            {selectedVisit.recommendations}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Next Visit */}
                    {selectedVisit.next_visit_date && (
                      <div style={{
                        padding: '16px',
                        backgroundColor: '#f0f9ff',
                        borderRadius: '12px',
                        border: '1px solid #bae6fd'
                      }}>
                        <h4 style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#0c4a6e',
                          marginBottom: '4px'
                        }}>
                          Следующий визит
                        </h4>
                        <p style={{
                          fontSize: '14px',
                          color: '#0369a1',
                          margin: 0
                        }}>
                          {new Date(selectedVisit.next_visit_date).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Photos Section */}
                  {selectedVisit.attachments && selectedVisit.attachments.length > 0 && (
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '20px',
                      padding: '20px',
                      marginBottom: '20px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      border: '1px solid #f1f5f9'
                    }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#1e293b',
                        marginBottom: '16px'
                      }}>
                        Фото
                      </h3>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '16px'
                      }}>
                        <div>
                          <h4 style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#64748b',
                            marginBottom: '8px'
                          }}>
                            Фото ДО
                          </h4>
                          <div style={{
                            width: '100%',
                            height: '200px',
                            borderRadius: '12px',
                            backgroundColor: '#f8fafc',
                            backgroundImage: 'url("https://images.unsplash.com/photo-1612472777888-9fb8b033e4e7?w=400&h=400&fit=crop&crop=face")',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              position: 'absolute',
                              bottom: '8px',
                              right: '8px',
                              width: '32px',
                              height: '32px',
                              backgroundColor: 'rgba(255,255,255,0.9)',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backdropFilter: 'blur(4px)'
                            }}>
                              <div style={{
                                width: '4px',
                                height: '4px',
                                backgroundColor: '#10b981',
                                borderRadius: '50%',
                                animation: 'pulse 2s infinite'
                              }} />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#64748b',
                            marginBottom: '8px'
                          }}>
                            Фото ПОСЛЕ
                          </h4>
                          <div style={{
                            width: '100%',
                            height: '200px',
                            borderRadius: '12px',
                            backgroundColor: '#f8fafc',
                            backgroundImage: 'url("https://images.unsplash.com/photo-1594824658615-7bcd5f43bf65?w=400&h=400&fit=crop&crop=face")',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              position: 'absolute',
                              bottom: '8px',
                              right: '8px',
                              width: '32px',
                              height: '32px',
                              backgroundColor: 'rgba(255,255,255,0.9)',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backdropFilter: 'blur(4px)'
                            }}>
                              <div style={{
                                width: '4px',
                                height: '4px',
                                backgroundColor: '#10b981',
                                borderRadius: '50%',
                                animation: 'pulse 2s infinite'
                              }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                    Эстетический паспорт
                  </h1>
                  <button
                    onClick={handleSignOut}
                    style={{
                      background: '#fee2e2',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#dc2626',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    Выход
                  </button>
                </div>

                {/* Edit Passport Form */}
                {isEditingPassport ? (
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    padding: '20px',
                    marginBottom: '20px',
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
                        Редактирование паспорта
                      </h2>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={cancelEditingPassport}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            backgroundColor: 'white',
                            color: '#64748b',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          Отмена
                        </button>
                        <button
                          onClick={savePassport}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Сохранить
                        </button>
                      </div>
                    </div>

                    {/* Edit Form */}
                    <div style={{
                      display: 'grid',
                      gap: '16px'
                    }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          color: '#94a3b8',
                          marginBottom: '6px'
                        }}>
                          Тип кожи:
                        </label>
                        <select
                          value={editedPassport.skin_type}
                          onChange={(e) => setEditedPassport({...editedPassport, skin_type: e.target.value as any})}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box',
                            backgroundColor: 'white'
                          }}
                        >
                          <option value="">Выберите тип кожи</option>
                          <option value="normal">Нормальная</option>
                          <option value="dry">Сухая</option>
                          <option value="oily">Жирная</option>
                          <option value="combination">Комбинированная</option>
                          <option value="sensitive">Чувствительная</option>
                        </select>
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          color: '#94a3b8',
                          marginBottom: '6px'
                        }}>
                          Проблемы кожи:
                        </label>
                        <textarea
                          value={editedPassport.skin_concerns.join(', ')}
                          onChange={(e) => setEditedPassport({...editedPassport, skin_concerns: e.target.value.split(', ').filter(s => s.trim())})}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            fontSize: '14px',
                            outline: 'none',
                            resize: 'vertical',
                            minHeight: '80px',
                            boxSizing: 'border-box'
                          }}
                          placeholder="Например: акне, пигментация, морщины (через запятую)"
                        />
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          color: '#94a3b8',
                          marginBottom: '6px'
                        }}>
                          Аллергии:
                        </label>
                        <textarea
                          value={editedPassport.allergies.join(', ')}
                          onChange={(e) => setEditedPassport({...editedPassport, allergies: e.target.value.split(', ').filter(s => s.trim())})}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            fontSize: '14px',
                            outline: 'none',
                            resize: 'vertical',
                            minHeight: '80px',
                            boxSizing: 'border-box'
                          }}
                          placeholder="Укажите известные аллергии (через запятую)"
                        />
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          color: '#94a3b8',
                          marginBottom: '6px'
                        }}>
                          Заметки:
                        </label>
                        <textarea
                          value={editedPassport.notes}
                          onChange={(e) => setEditedPassport({...editedPassport, notes: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '10px',
                            border: '1px solid #e2e8f0',
                            fontSize: '14px',
                            outline: 'none',
                            resize: 'vertical',
                            minHeight: '100px',
                            boxSizing: 'border-box'
                          }}
                          placeholder="Дополнительные заметки о коже и уходе..."
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  padding: '20px',
                  marginBottom: '20px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}>
                  {/* Profile Section */}
                  {isEditingProfile ? (
                    <div style={{
                      marginBottom: '20px',
                      padding: '20px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '20px'
                      }}>
                        <h3 style={{
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: '#1e293b'
                        }}>
                          Редактирование профиля
                        </h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={cancelEditingProfile}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              backgroundColor: 'white',
                              color: '#64748b',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                          >
                            Отмена
                          </button>
                          <button
                            onClick={saveProfile}
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
                            Сохранить
                          </button>
                        </div>
                      </div>

                      {/* Avatar Upload */}
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          color: '#94a3b8',
                          marginBottom: '6px'
                        }}>
                          Аватар:
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '12px',
                            backgroundImage: avatarFile ? `url(${URL.createObjectURL(avatarFile)})` : (profile?.avatar_url ? `url(${profile.avatar_url})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'),
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {!avatarFile && !profile?.avatar_url && <User size={24} color="white" />}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            style={{
                              fontSize: '12px',
                              padding: '6px'
                            }}
                          />
                        </div>
                      </div>

                      {/* Profile Fields */}
                      <div style={{ display: 'grid', gap: '12px' }}>
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '12px',
                            color: '#94a3b8',
                            marginBottom: '6px'
                          }}>
                            Полное имя:
                          </label>
                          <input
                            type="text"
                            value={editedProfile.full_name}
                            onChange={(e) => setEditedProfile({...editedProfile, full_name: e.target.value})}
                            style={{
                              width: '100%',
                              padding: '10px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                            placeholder="Ваше полное имя"
                          />
                        </div>

                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '12px',
                            color: '#94a3b8',
                            marginBottom: '6px'
                          }}>
                            Имя пользователя:
                          </label>
                          <input
                            type="text"
                            value={editedProfile.username}
                            onChange={(e) => setEditedProfile({...editedProfile, username: e.target.value})}
                            style={{
                              width: '100%',
                              padding: '10px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                            placeholder="username"
                          />
                        </div>

                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '12px',
                            color: '#94a3b8',
                            marginBottom: '6px'
                          }}>
                            Био:
                          </label>
                          <textarea
                            value={editedProfile.bio}
                            onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
                            style={{
                              width: '100%',
                              padding: '10px',
                              borderRadius: '8px',
                              border: '1px solid #e2e8f0',
                              fontSize: '14px',
                              outline: 'none',
                              resize: 'vertical',
                              minHeight: '80px',
                              boxSizing: 'border-box'
                            }}
                            placeholder="Расскажите о себе..."
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      marginBottom: '20px'
                    }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '16px',
                        backgroundImage: profile?.avatar_url ? `url(${profile.avatar_url})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {!profile?.avatar_url && <User size={40} color="white" />}
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
                          {profile?.full_name || 'Beauty Enthusiast'}
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: '#64748b'
                        }}>
                          {profile?.bio || 'Эстетический паспорт • ' + (passport ? 'Активирован' : 'Не настроен')}
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: '8px'
                      }}>
                        <button
                          onClick={startEditingProfile}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px'
                          }}
                        >
                          <User size={18} color="#667eea" />
                        </button>
                        <button
                          onClick={startEditingPassport}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px'
                          }}
                        >
                          <Edit2 size={18} color="#667eea" />
                        </button>
                        <button
                          onClick={toggleRecommendations}
                          style={{
                            background: showRecommendations ? '#667eea15' : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '6px'
                          }}
                          title="Персональные рекомендации по уходу"
                        >
                          <Sparkles size={18} color={showRecommendations ? "#667eea" : "#667eea"} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '12px',
                        color: '#94a3b8',
                        marginBottom: '4px'
                      }}>
                        Тип кожи:
                      </div>
                      <div style={{
                        fontSize: '15px',
                        color: '#1e293b',
                        fontWeight: '500'
                      }}>
                        {passport?.skin_type ? {
                          'normal': 'Нормальная',
                          'dry': 'Сухая',
                          'oily': 'Жирная',
                          'combination': 'Комбинированная',
                          'sensitive': 'Чувствительная'
                        }[passport.skin_type] : 'Не указан'}
                      </div>
                    </div>
                  </div>

                  {/* Skin Concerns Section */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#94a3b8',
                      marginBottom: '8px'
                    }}>
                      Проблемы кожи:
                    </div>
                    <div style={{
                      padding: '12px',
                      backgroundColor: '#f8f9ff',
                      borderRadius: '10px',
                      fontSize: '14px',
                      color: '#1e293b'
                    }}>
                      {passport?.skin_concerns?.length ? passport.skin_concerns.join(', ') : 'Не указано'}
                    </div>
                  </div>

                  {/* Allergies Section */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#94a3b8',
                      marginBottom: '8px'
                    }}>
                      Аллергии:
                    </div>
                    <div style={{
                      padding: '12px',
                      backgroundColor: '#f8f9ff',
                      borderRadius: '10px',
                      fontSize: '14px',
                      color: '#1e293b'
                    }}>
                      {passport?.allergies?.length ? passport.allergies.join(', ') : 'Аллергий не указано'}
                    </div>
                  </div>

                  {/* Personal Notes */}
                  <div>
                    <div style={{
                      fontSize: '12px',
                      color: '#94a3b8',
                      marginBottom: '8px'
                    }}>
                      Заметки:
                    </div>
                    <div style={{
                      padding: '12px',
                      backgroundColor: '#f8f9ff',
                      borderRadius: '10px',
                      fontSize: '14px',
                      color: passport?.notes ? '#1e293b' : '#94a3b8',
                      fontStyle: passport?.notes ? 'normal' : 'italic'
                    }}>
                      {passport?.notes || 'Заметки не добавлены'}
                    </div>
                  </div>

                  {/* Recommendations Section */}
                  {showRecommendations && (
                    <div style={{
                      marginTop: '20px',
                      padding: '16px',
                      backgroundColor: '#fefce8',
                      borderRadius: '12px',
                      border: '1px solid #facc15'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px'
                      }}>
                        <Sparkles size={16} color="#ca8a04" />
                        <h4 style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#ca8a04',
                          margin: 0
                        }}>
                          Персональные рекомендации
                        </h4>
                      </div>
                      <div style={{
                        display: 'grid',
                        gap: '8px'
                      }}>
                        {generateRecommendations().length > 0 ? (
                          generateRecommendations().map((recommendation, index) => (
                            <div key={index} style={{
                              fontSize: '13px',
                              color: '#854d0e',
                              padding: '8px 12px',
                              backgroundColor: '#fef3c7',
                              borderRadius: '8px',
                              lineHeight: '1.4'
                            }}>
                              {recommendation}
                            </div>
                          ))
                        ) : (
                          <div style={{
                            fontSize: '13px',
                            color: '#ca8a04',
                            fontStyle: 'italic',
                            textAlign: 'center',
                            padding: '12px'
                          }}>
                            Заполните информацию о типе кожи и проблемах, чтобы получить персональные рекомендации
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                )}

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
                      Посещения косметолога
                    </h2>
                    <button
                      onClick={openVisitForm}
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
                      Добавить
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
                        Пока нет записей
                      </p>
                      <p style={{ fontSize: '12px', color: '#cbd5e1' }}>
                        Добавьте первую запись о посещении
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
                      onClick={() => openVisitDetail(visit)}
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
                    onClick={async () => {
                      setBagEmoji(emoji);
                      setIsSelectingEmoji(false);

                      if (bag) {
                        try {
                          const updatedBag = await bagService.updateBag(bag.id, {
                            emoji: emoji
                          });
                          if (updatedBag) {
                            setBag(updatedBag);
                          }
                        } catch (error) {
                          console.error('Error saving bag emoji:', error);
                        }
                      }
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

        {/* Visit Form Modal */}
        {showVisitForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}>
            <div style={{
              width: '90%',
              maxWidth: '480px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: 'white',
              borderRadius: '20px',
              position: 'relative'
            }}>
              {/* Header */}
              <div style={{
                padding: '20px 20px 10px 20px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#1e293b',
                  margin: 0
                }}>
                  Добавить посещение
                </h2>
                <button
                  onClick={closeVisitForm}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <X size={24} color="#64748b" />
                </button>
              </div>

              {/* Form Content */}
              <div style={{
                padding: '20px',
                display: 'grid',
                gap: '20px'
              }}>
                {/* Date */}
                <div>
                  <input
                    type="date"
                    value={visitForm.visit_date}
                    onChange={(e) => setVisitForm({...visitForm, visit_date: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Услуги */}
                <div>
                  <input
                    type="text"
                    value={visitForm.procedures}
                    onChange={(e) => setVisitForm({...visitForm, procedures: e.target.value})}
                    placeholder="Услуги"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Врач */}
                <div>
                  <input
                    type="text"
                    value={visitForm.doctor_name}
                    onChange={(e) => setVisitForm({...visitForm, doctor_name: e.target.value})}
                    placeholder="Врач"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Клиника */}
                <div>
                  <input
                    type="text"
                    value={visitForm.clinic_name}
                    onChange={(e) => setVisitForm({...visitForm, clinic_name: e.target.value})}
                    placeholder="Клиника"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '16px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Заметки */}
                <div>
                  <textarea
                    value={visitForm.notes}
                    onChange={(e) => setVisitForm({...visitForm, notes: e.target.value})}
                    placeholder="Заметки"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: '16px',
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: '80px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Photos Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Before Photo */}
                  <div>
                    <div style={{
                      fontSize: '14px',
                      color: '#374151',
                      marginBottom: '6px',
                      textAlign: 'center'
                    }}>
                      Фото ДО
                    </div>
                    <div style={{
                      width: '100%',
                      height: '120px',
                      border: '2px dashed #d1d5db',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      backgroundColor: beforePhoto ? '#f3f4f6' : '#fafafa',
                      backgroundImage: beforePhoto ? `url(${URL.createObjectURL(beforePhoto)})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative'
                    }}>
                      {!beforePhoto && (
                        <div style={{
                          fontSize: '24px'
                        }}>
                          📷
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setBeforePhoto(e.target.files?.[0] || null)}
                        style={{
                          position: 'absolute',
                          opacity: 0,
                          width: '100%',
                          height: '100%',
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                  </div>

                  {/* After Photo */}
                  <div>
                    <div style={{
                      fontSize: '14px',
                      color: '#374151',
                      marginBottom: '6px',
                      textAlign: 'center'
                    }}>
                      Фото ПОСЛЕ
                    </div>
                    <div style={{
                      width: '100%',
                      height: '120px',
                      border: '2px dashed #d1d5db',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      backgroundColor: afterPhoto ? '#f3f4f6' : '#fafafa',
                      backgroundImage: afterPhoto ? `url(${URL.createObjectURL(afterPhoto)})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative'
                    }}>
                      {!afterPhoto && (
                        <div style={{
                          fontSize: '24px'
                        }}>
                          📷
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setAfterPhoto(e.target.files?.[0] || null)}
                        style={{
                          position: 'absolute',
                          opacity: 0,
                          width: '100%',
                          height: '100%',
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={saveVisit}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginTop: '10px'
                  }}
                >
                  Добавить посещение
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Visit Detail Modal */}
        {false && selectedVisit && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}>
            <div style={{
              width: '90%',
              maxWidth: '480px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: 'white',
              borderRadius: '20px',
              position: 'relative'
            }}>
              {/* Header */}
              <div style={{
                padding: '20px 20px 15px 20px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '16px' }}>🩺</span>
                  </div>
                  <div>
                    <h2 style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#1e293b',
                      margin: 0
                    }}>
                      Посещение
                    </h2>
                    <div style={{
                      fontSize: '14px',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      📅 {new Date(selectedVisit.visit_date).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #0ea5e9',
                    fontSize: '12px',
                    color: '#0ea5e9',
                    fontWeight: '500'
                  }}>
                    Частный
                  </div>
                  <button
                    onClick={closeVisitDetail}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <X size={24} color="#64748b" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div style={{
                padding: '20px',
                display: 'grid',
                gap: '24px'
              }}>
                {/* Main Info Card */}
                <div style={{
                  padding: '20px',
                  backgroundColor: '#f8f9ff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0'
                }}>
                  {/* Services */}
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1e293b',
                      margin: '0 0 8px 0'
                    }}>
                      Услуги
                    </h3>
                    <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>
                      {selectedVisit.procedures && selectedVisit.procedures.length > 0 ? (
                        <div>
                          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                            {selectedVisit.procedures.join(', ')}:
                          </div>
                          <div style={{ marginBottom: '6px' }}>• Препарат: Hyalual (гиалуроновая кислота 1.8%)</div>
                          <div style={{ marginBottom: '6px' }}>• Объем: 2 мл</div>
                          <div style={{ marginBottom: '6px' }}>• Техника: папульная, 32G игла</div>
                          <div style={{ marginBottom: '6px' }}>• Зоны: лоб, периорбитальная область, щеки, подбородок</div>
                          <div style={{ marginBottom: '6px' }}>• Количество точек: ~50 инъекций</div>
                          <div>• Местная анестезия: крем Эмла 30 мин</div>
                        </div>
                      ) : (
                        'Процедуры не указаны'
                      )}
                    </div>
                  </div>

                  {/* Doctor */}
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1e293b',
                      margin: '0 0 4px 0'
                    }}>
                      Врач
                    </h3>
                    <div style={{ fontSize: '14px', color: '#374151' }}>
                      {selectedVisit.doctor_name || 'Не указан'}
                    </div>
                  </div>

                  {/* Clinic */}
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1e293b',
                      margin: '0 0 4px 0'
                    }}>
                      Клиника
                    </h3>
                    <div style={{
                      fontSize: '14px',
                      color: '#374151',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      📍 {selectedVisit.clinic_name || 'Не указана'}
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedVisit.recommendations && (
                    <div>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1e293b',
                        margin: '0 0 4px 0'
                      }}>
                        Заметки
                      </h3>
                      <div style={{ fontSize: '14px', color: '#374151' }}>
                        {selectedVisit.recommendations}
                      </div>
                    </div>
                  )}
                </div>

                {/* Photos Section */}
                {selectedVisit.attachments && selectedVisit.attachments.length > 0 && (
                  <div style={{
                    padding: '20px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1e293b',
                      margin: '0 0 16px 0'
                    }}>
                      Фото
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      {/* Before Photo */}
                      <div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: '8px'
                        }}>
                          Фото ДО
                        </div>
                        <div style={{
                          width: '100%',
                          height: '160px',
                          borderRadius: '12px',
                          backgroundColor: '#f3f4f6',
                          backgroundImage: selectedVisit.attachments?.find((a: string) => a.startsWith('before:'))
                            ? `url(${selectedVisit.attachments.find((a: string) => a.startsWith('before:'))?.replace('before:', '')})`
                            : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          position: 'relative',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {!selectedVisit.attachments?.find((a: string) => a.startsWith('before:')) && (
                            <div style={{
                              fontSize: '24px',
                              opacity: 0.3
                            }}>
                              📷
                            </div>
                          )}
                        </div>
                      </div>

                      {/* After Photo */}
                      <div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: '8px'
                        }}>
                          Фото ПОСЛЕ
                        </div>
                        <div style={{
                          width: '100%',
                          height: '160px',
                          borderRadius: '12px',
                          backgroundColor: '#f3f4f6',
                          backgroundImage: selectedVisit.attachments?.find((a: string) => a.startsWith('after:'))
                            ? `url(${selectedVisit.attachments.find((a: string) => a.startsWith('after:'))?.replace('after:', '')})`
                            : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          position: 'relative',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {!selectedVisit.attachments?.find((a: string) => a.startsWith('after:')) && (
                            <div style={{
                              fontSize: '24px',
                              opacity: 0.3
                            }}>
                              📷
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}


        {/* Followers List Screen - Full Screen */}
        {activeView === 'followers' && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'white',
            zIndex: 1000
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px 12px',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <button
                onClick={() => setActiveView(previousView)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  padding: '8px 16px 8px 8px',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={20} />
              </button>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Подписчики</h3>
              <div style={{ width: '36px' }}></div>
            </div>

            {/* Followers List */}
            <div style={{ padding: '20px', paddingTop: '24px' }}>
              {loadingFollowers ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <LoadingSpinner />
                </div>
              ) : followers.length > 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {followers.map((follower: any) => (
                    <div key={follower.follower_bag_id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px',
                      backgroundColor: 'rgba(102, 126, 234, 0.05)',
                      borderRadius: '16px',
                      border: '1px solid rgba(102, 126, 234, 0.1)'
                    }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '25px',
                        background: follower.follower_bag?.image_url
                          ? `url(${follower.follower_bag.image_url})`
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px',
                        color: 'white',
                        fontSize: '20px'
                      }}>
                        {!follower.follower_bag?.image_url && '💄'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          marginBottom: '4px'
                        }}>
                          {follower.follower_bag?.display_name || 'Косметичка'}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          opacity: 0.6,
                          marginBottom: '4px'
                        }}>
                          {follower.follower_bag?.user?.full_name || 'Пользователь'} • {follower.follower_bag?.products_count || 0} продуктов
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#667eea',
                          fontWeight: '500'
                        }}>
                          {follower.follower_bag?.followers_count || 0} подписчиков
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          if (follower.follower_bag) {
                            // Если это наша косметичка, просто возвращаемся
                            if (follower.follower_bag.user_id === user?.id) {
                              setViewingOthersBag(false);
                              setActiveView('bag');
                            } else {
                              setPreviousView('followers');
                              // Загружаем данные косметички подписчика
                              await loadSharedBag(follower.follower_bag.id);
                            }
                          }
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '20px',
                          border: '1px solid #667eea',
                          backgroundColor: 'white',
                          color: '#667eea',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        Посмотреть
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <Users size={48} color="#e2e8f0" style={{ marginBottom: '16px' }} />
                  <p>{viewingOthersBag ? 'У этой косметички пока нет подписчиков' : 'У вас пока нет подписчиков'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Following List Screen - Full Screen */}
        {activeView === 'following' && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'white',
            zIndex: 1000
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px 12px',
              borderBottom: '1px solid #f1f5f9'
            }}>
              <button
                onClick={() => setActiveView(previousView)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  padding: '8px 16px 8px 8px',
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={20} />
              </button>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Подписки</h3>
              <div style={{ width: '36px' }}></div>
            </div>

            {/* Following List */}
            <div style={{ padding: '20px', paddingTop: '24px' }}>
              {loadingFollowing ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <LoadingSpinner />
                </div>
              ) : following.length > 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {following.map((follow: any) => (
                    <div key={follow.following_bag_id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px',
                      backgroundColor: 'rgba(102, 126, 234, 0.05)',
                      borderRadius: '16px',
                      border: '1px solid rgba(102, 126, 234, 0.1)'
                    }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '25px',
                        background: follow.following_bag?.image_url
                          ? `url(${follow.following_bag.image_url})`
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '12px',
                        color: 'white',
                        fontSize: '20px'
                      }}>
                        {!follow.following_bag?.image_url && '💄'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          marginBottom: '4px'
                        }}>
                          {follow.following_bag?.display_name || 'Косметичка'}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          opacity: 0.6,
                          marginBottom: '4px'
                        }}>
                          {follow.following_bag?.user?.full_name || 'Пользователь'} • {follow.following_bag?.products_count || 0} продуктов
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#667eea',
                          fontWeight: '500'
                        }}>
                          {follow.following_bag?.followers_count || 0} подписчиков
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={async () => {
                            if (follow.following_bag) {
                              // Если это наша косметичка, просто возвращаемся
                              if (follow.following_bag.user_id === user?.id) {
                                setViewingOthersBag(false);
                                setActiveView('bag');
                              } else {
                                setPreviousView('following');
                                // Загружаем данные косметички, на которую подписаны
                                await loadSharedBag(follow.following_bag.id);
                              }
                            }
                          }}
                          style={{
                            padding: '8px 16px',
                          borderRadius: '20px',
                          border: '1px solid #667eea',
                          backgroundColor: 'white',
                          color: '#667eea',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        Посмотреть
                      </button>
                      {follow.following_bag?.user_id !== user?.id && (
                        <button
                          onClick={async () => {
                            try {
                              await profileService.unfollowBag(user?.id || '', follow.following_bag_id);
                              showToast('Вы отписались от косметички');
                              // await loadFollowing();
                            } catch (error) {
                              console.error('Error unfollowing:', error);
                              showToast('Ошибка при отписке');
                            }
                          }}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '20px',
                            border: 'none',
                            backgroundColor: '#667eea',
                            color: 'white',
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}>
                          Отписаться
                        </button>
                      )}
                    </div>
                  </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <Users size={48} color="#e2e8f0" style={{ marginBottom: '16px' }} />
                  <p>{viewingOthersBag ? 'Пользователь пока ни на кого не подписан' : 'Вы пока ни на кого не подписаны'}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toast notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </PhoneFrame>
  );
}

export default AppWithPhone;