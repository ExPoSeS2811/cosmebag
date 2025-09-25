import { supabase } from '../lib/supabase';

export interface ActivityItem {
  id: string;
  user_id: string;
  bag_id: string;
  action_type: string;
  product_info: any;
  created_at: string;
  bag?: any;
  user?: any;
}

export const activityService = {
  async getActivityFeed(limit = 20) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Получаем активность из косметичек, на которые подписан пользователь
      const { data, error } = await supabase
        .from('activity_feed')
        .select(`
          *,
          bag:cosmetic_bags!activity_feed_bag_id_fkey (
            id,
            display_name,
            image_url,
            user_id,
            user:profiles!cosmetic_bags_user_id_fkey (
              id,
              full_name,
              avatar_url,
              username
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching activity feed:', error);
        return [];
      }

      return data as ActivityItem[];
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      return [];
    }
  },

  async logActivity(bagId: string, actionType: string, productInfo: any) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('activity_feed')
        .insert({
          user_id: user.id,
          bag_id: bagId,
          action_type: actionType,
          product_info: productInfo
        })
        .select()
        .single();

      if (error) {
        console.error('Error logging activity:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error logging activity:', error);
      return null;
    }
  },

  formatActivityMessage(activity: ActivityItem): string {
    const userName = activity.bag?.user?.full_name || 'Пользователь';
    const bagName = activity.bag?.display_name || 'косметичку';
    const productName = activity.product_info?.product_name || 'товар';
    const productBrand = activity.product_info?.product_brand || '';

    switch (activity.action_type) {
      case 'added_product':
        return `${userName} добавил(а) "${productName}" ${productBrand ? `от ${productBrand}` : ''} в ${bagName}`;
      case 'removed_product':
        return `${userName} удалил(а) "${productName}" из ${bagName}`;
      case 'wishlist_to_bag':
        return `${userName} переместил(а) "${productName}" из вишлиста в ${bagName}`;
      case 'bag_to_wishlist':
        return `${userName} переместил(а) "${productName}" в вишлист`;
      default:
        return `${userName} обновил(а) ${bagName}`;
    }
  },

  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'только что';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} мин. назад`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ч. назад`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)} дн. назад`;
    if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} мес. назад`;
    return `${Math.floor(seconds / 31536000)} г. назад`;
  }
};