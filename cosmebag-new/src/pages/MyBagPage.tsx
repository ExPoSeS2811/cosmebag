import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { bagService } from '../services/bagService';
import type { CosmeticBag, BagItem } from '../types/database.types';
import { ShoppingBag, Star, Heart, Calendar, Trash2 } from 'lucide-react';

export const MyBagPage: React.FC = () => {
  const { user } = useAuth();
  const [bag, setBag] = useState<CosmeticBag | null>(null);
  const [bagItems, setBagItems] = useState<BagItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBagData();
    }
  }, [user]);

  const loadBagData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const bagData = await bagService.fetchBag(user.id);

      if (bagData) {
        setBag(bagData);
        const items = await bagService.fetchBagItems(bagData.id);
        setBagItems(items.filter(item => item.status === 'owned'));
      }
    } catch (error) {
      console.error('Error loading bag data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (item: BagItem) => {
    try {
      await bagService.updateProduct(item.id, {
        is_favorite: !item.is_favorite
      });
      loadBagData();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const removeProduct = async (itemId: string) => {
    if (window.confirm('Удалить продукт из косметички?')) {
      try {
        await bagService.removeProduct(itemId);
        loadBagData();
      } catch (error) {
        console.error('Error removing product:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
        <div className="flex items-center">
          <ShoppingBag className="w-8 h-8 mr-3" />
          <div>
            <h1 className="text-2xl font-bold">
              {bag?.emoji} {bag?.display_name || 'Моя косметичка'}
            </h1>
            <p className="text-white/80 text-sm mt-1">
              {bagItems.length} {bagItems.length === 1 ? 'продукт' : 'продуктов'}
            </p>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="p-4">
        {bagItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Ваша косметичка пуста</p>
            <p className="text-gray-400 text-sm mt-1">Добавьте первый продукт!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bagItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {item.product_data?.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.product_data?.brand}
                    </p>
                    {item.product_data?.category && (
                      <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        {item.product_data.category}
                      </span>
                    )}
                    {item.notes && (
                      <p className="text-sm text-gray-500 mt-2">{item.notes}</p>
                    )}

                    <div className="flex items-center gap-4 mt-3">
                      {item.rating && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm ml-1">{item.rating}</span>
                        </div>
                      )}
                      {item.purchase_date && (
                        <div className="flex items-center text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span className="text-xs">
                            {new Date(item.purchase_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFavorite(item)}
                      className={`p-2 rounded-lg transition-colors ${
                        item.is_favorite
                          ? 'text-red-500 bg-red-50'
                          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${item.is_favorite ? 'fill-current' : ''}`}
                      />
                    </button>
                    <button
                      onClick={() => removeProduct(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {item.product_data?.price && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-lg font-bold text-purple-600">
                      ${item.product_data.price}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};