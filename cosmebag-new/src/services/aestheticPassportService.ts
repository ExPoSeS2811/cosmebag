import { supabase } from '../lib/supabase';

export interface AestheticPassport {
  id: string;
  user_id: string;
  skin_type: 'normal' | 'dry' | 'oily' | 'combination' | 'sensitive';
  skin_concerns: string[];
  allergies: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CosmetologistVisit {
  id: string;
  user_id: string;
  visit_date: string;
  doctor_name: string | null;
  clinic_name: string | null;
  procedures: string[];
  recommendations: string | null;
  prescribed_products: string[];
  next_visit_date: string | null;
  attachments: string[];
  created_at: string;
  updated_at: string;
}

export const aestheticPassportService = {
  async getPassport() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('aesthetic_passports')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as AestheticPassport;
    } catch (error) {
      console.error('Error fetching aesthetic passport:', error);
      return null;
    }
  },

  async savePassport(passportData: Partial<AestheticPassport>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const existing = await this.getPassport();

      if (existing) {
        const { data, error } = await supabase
          .from('aesthetic_passports')
          .update({
            ...passportData,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return data as AestheticPassport;
      } else {
        const { data, error } = await supabase
          .from('aesthetic_passports')
          .insert({
            user_id: user.id,
            ...passportData
          })
          .select()
          .single();

        if (error) throw error;
        return data as AestheticPassport;
      }
    } catch (error) {
      console.error('Error saving aesthetic passport:', error);
      return null;
    }
  },

  async getVisits() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('cosmetologist_visits')
        .select('*')
        .eq('user_id', user.id)
        .order('visit_date', { ascending: false });

      if (error) throw error;

      return (data || []) as CosmetologistVisit[];
    } catch (error) {
      console.error('Error fetching visits:', error);
      return [];
    }
  },

  async addVisit(visitData: Omit<CosmetologistVisit, 'id' | 'user_id' | 'created_at'>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('cosmetologist_visits')
        .insert({
          user_id: user.id,
          ...visitData
        })
        .select()
        .single();

      if (error) throw error;

      return data as CosmetologistVisit;
    } catch (error) {
      console.error('Error adding visit:', error);
      return null;
    }
  },

  async deleteVisit(visitId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('cosmetologist_visits')
        .delete()
        .eq('id', visitId)
        .eq('user_id', user.id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting visit:', error);
      return false;
    }
  }
};