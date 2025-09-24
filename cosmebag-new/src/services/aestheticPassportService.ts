import { supabase } from '../lib/supabase';

export interface AestheticPassport {
  id: string;
  user_id: string;
  full_name: string;
  birth_date: string;
  city: string;
  phone: string;
  skin_type?: string;
  skin_concerns?: string[];
  allergies?: string[];
  created_at: string;
  updated_at: string;
}

export interface CosmetologistVisit {
  id: string;
  user_id: string;
  visit_date: string;
  procedures: string[];
  doctor_name: string;
  clinic_name: string;
  notes?: string;
  recommendations?: string;
  next_visit_date?: string;
  created_at: string;
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
  }
};