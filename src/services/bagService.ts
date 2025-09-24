import { supabase } from '../lib/supabase';
import type { Profile, CosmeticBag, BagItem, AestheticPassport, CosmetologistVisit, ProductData } from '../types/database.types';

export const bagService = {
  // Профиль пользователя
  async fetchProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  },

  // Косметичка пользователя
  async fetchBag(userId: string): Promise<CosmeticBag | null> {
    const { data, error } = await supabase
      .from('cosmetic_bags')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching bag:', error);
      return null;
    }
    return data;
  },

  // Продукты в косметичке
  async fetchBagItems(bagId: string): Promise<BagItem[]> {
    const { data, error } = await supabase
      .from('bag_items')
      .select('*')
      .eq('bag_id', bagId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bag items:', error);
      return [];
    }
    return data || [];
  },

  // Эстетический паспорт
  async fetchPassport(userId: string): Promise<AestheticPassport | null> {
    const { data, error } = await supabase
      .from('aesthetic_passports')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching passport:', error);
      return null;
    }
    return data;
  },

  // Визиты к косметологу
  async fetchVisits(userId: string): Promise<CosmetologistVisit[]> {
    const { data, error } = await supabase
      .from('cosmetologist_visits')
      .select('*')
      .eq('user_id', userId)
      .order('visit_date', { ascending: false });

    if (error) {
      console.error('Error fetching visits:', error);
      return [];
    }
    return data || [];
  },

  // RPC функции
  async addProductToBag(productId: string, productData: ProductData, notes?: string) {
    const { data, error } = await supabase.rpc('add_product_to_bag', {
      p_product_id: productId,
      p_product_data: productData,
      p_notes: notes || null
    });

    if (error) {
      console.error('Error adding product to bag:', error);
      throw error;
    }
    return data;
  },

  async addToWishlist(productId: string, productData: ProductData, notes?: string, priority: number = 1) {
    const { data, error } = await supabase.rpc('add_to_wishlist', {
      p_product_id: productId,
      p_product_data: productData,
      p_notes: notes || null,
      p_priority: priority
    });

    if (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
    return data;
  },

  async moveToOwned(productId: string, purchaseDate?: string) {
    const { data, error } = await supabase.rpc('move_to_owned', {
      p_product_id: productId,
      p_purchase_date: purchaseDate || new Date().toISOString().split('T')[0]
    });

    if (error) {
      console.error('Error moving to owned:', error);
      throw error;
    }
    return data;
  },

  async getUserBag() {
    const { data, error } = await supabase.rpc('get_user_bag');

    if (error) {
      console.error('Error getting user bag:', error);
      throw error;
    }
    return data;
  },

  async getUserStats() {
    const { data, error } = await supabase.rpc('get_user_stats');

    if (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
    return data;
  },

  async getPublicBags(limit: number = 20, offset: number = 0) {
    const { data, error } = await supabase.rpc('get_public_bags', {
      p_limit: limit,
      p_offset: offset
    });

    if (error) {
      console.error('Error getting public bags:', error);
      throw error;
    }
    return data;
  },

  async searchBags(query: string, limit: number = 10) {
    const { data, error } = await supabase.rpc('search_bags', {
      p_query: query,
      p_limit: limit
    });

    if (error) {
      console.error('Error searching bags:', error);
      throw error;
    }
    return data;
  },

  // Удаление продукта
  async removeProduct(itemId: string) {
    const { error } = await supabase
      .from('bag_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error removing product:', error);
      throw error;
    }
  },

  // Обновление продукта
  async updateProduct(itemId: string, updates: Partial<BagItem>) {
    const { data, error } = await supabase
      .from('bag_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }
    return data;
  }
};