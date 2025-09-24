import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bagService } from '../services/bagService';
import type { CosmeticBag, BagItem } from '../types/database.types';
import { Heart, ShoppingCart, Star, Trash2 } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { user } = useAuth();
  const [bag, setBag] = useState<CosmeticBag | null>(null);
  const [wishlistItems, setWishlistItems] = useState<BagItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWishlistData();
    }
  }, [user]);

  const loadWishlistData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const bagData = await bagService.fetchBag(user.id);

      if (bagData) {
        setBag(bagData);
        const items = await bagService.fetchBagItems(bagData.id);
        setWishlistItems(items.filter(item => item.status === 'wishlist'));
      }
    } catch (error) {
      console.error('Error loading wishlist data:', error);
    } finally {
      setLoading(false);
    }
  };

  const moveToOwned = async (productId: string) => {
    try {
      await bagService.moveToOwned(productId);
      alert('✅ Продукт перемещен в косметичку!');
      loadWishlistData();
    } catch (error) {
      console.error('Error moving to owned:', error);
      alert('Ошибка при перемещении продукта');
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    if (window.confirm('Удалить из списка желаний?')) {
      try {
        await bagService.removeProduct(itemId);
        loadWishlistData();
      } catch (error) {
        console.error('Error removing from wishlist:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-red-500 p-6 text-white">
        <div className="flex items-center">
          <Heart className="w-8 h-8 mr-3" />
          <div>
            <h1 className="text-2xl font-bold">Список желаний</h1>
            <p className="text-white/80 text-sm mt-1">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'продукт' : 'продуктов'}
            </p>
          </div>
        </div>
      </div>

      {/* Wishlist Items */}
      <div className="p-4">
        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Список желаний пуст</p>
            <p className="text-gray-400 text-sm mt-1">Добавьте продукты, которые хотите попробовать!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border-l-4 border-pink-400"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {item.product_data?.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.product_data?.brand}
                    </p>

                    {item.priority && (
                      <div className="flex items-center mt-2">
                        <span className="text-sm text-gray-500 mr-1">Приоритет:</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < item.priority
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {item.notes && (
                      <p className="text-sm text-gray-500 mt-2">{item.notes}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => moveToOwned(item.product_id)}
                      className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      title="Купить"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {item.product_data?.price && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-lg font-bold text-pink-600">
                      ${item.product_data.price}
                    </span>
                    {item.price_alert_threshold && (
                      <span className="text-xs text-gray-500">
                        Уведомить при ${item.price_alert_threshold}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Product Button */}
      <div className="fixed bottom-20 right-4">
        <button
          onClick={() => alert('Функция добавления продукта скоро будет доступна!')}
          className="bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow"
        >
          <Heart className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};