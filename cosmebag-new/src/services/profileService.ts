import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database.types';

export const profileService = {
  async getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as Profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },

  async updateProfile(profileData: Partial<Profile>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  async uploadAvatar(file: File) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Convert image to base64 for simple storage in profile
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64Data = await base64Promise;

      // Update profile with base64 avatar
      const { data, error } = await supabase
        .from('profiles')
        .update({
          avatar_url: base64Data,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  },

  async getFollowers(bagId: string) {
    try {
      const { data, error } = await supabase
        .from('bag_subscriptions')
        .select(`
          follower_id,
          created_at,
          follower:profiles!bag_subscriptions_follower_id_fkey (
            id,
            full_name,
            avatar_url,
            username
          )
        `)
        .eq('following_bag_id', bagId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching followers:', error);
        return [];
      }

      // Получаем косметички подписчиков
      const followersWithBags = await Promise.all(
        (data || []).map(async (item: any) => {
          const { data: userBag } = await supabase
            .from('cosmetic_bags')
            .select('*')
            .eq('user_id', item.follower_id)
            .single();

          return {
            ...item,
            follower_bag: userBag
          };
        })
      );

      return followersWithBags;
    } catch (error) {
      console.error('Error fetching followers:', error);
      return [];
    }
  },

  async getFollowing(userId: string) {
    try {
      const { data, error } = await supabase
        .from('bag_subscriptions')
        .select(`
          following_bag_id,
          created_at
        `)
        .eq('follower_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching following:', error);
        return [];
      }

      // Получаем данные косметичек, на которые подписан пользователь
      const followingWithBags = await Promise.all(
        (data || []).map(async (item: any) => {
          const { data: bagData } = await supabase
            .from('cosmetic_bags')
            .select(`
              *,
              user:profiles!cosmetic_bags_user_id_fkey (
                id,
                full_name,
                avatar_url,
                username
              )
            `)
            .eq('id', item.following_bag_id)
            .single();

          return {
            ...item,
            following_bag: bagData
          };
        })
      );

      return followingWithBags;
    } catch (error) {
      console.error('Error fetching following:', error);
      return [];
    }
  },

  async followBag(followerUserId: string, followingBagId: string) {
    try {
      const { data, error } = await supabase
        .from('bag_subscriptions')
        .insert({
          follower_id: followerUserId,  // Это ID пользователя, а не косметички
          following_bag_id: followingBagId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error following bag:', error);
      throw error;
    }
  },

  async unfollowBag(followerUserId: string, followingBagId: string) {
    try {
      const { error } = await supabase
        .from('bag_subscriptions')
        .delete()
        .eq('follower_id', followerUserId)
        .eq('following_bag_id', followingBagId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error unfollowing bag:', error);
      throw error;
    }
  }
};