import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'pending' | 'generating' | 'ready';
  subject?: string;
  content?: string;
  website?: string;
}

export interface Campaign {
  id: string;
  name: string;
  leadsCount: number;
  status: 'completed' | 'generating' | 'draft';
  createdAt: string;
  leads: Lead[];
  tone?: string;
  goal?: string;
  offer?: string;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  credits?: {
    total_credits: number;
    used_credits: number;
  };
  subscription?: {
    plan: string;
    status: string;
    current_period_end?: string;
  };
}

interface AppState {
  campaigns: Campaign[];
  activeCampaignId: string | null;
  user: UserProfile | null;
  loading: boolean;
  fetchCampaigns: () => Promise<void>;
  fetchUser: () => Promise<void>;
  addCampaign: (campaign: Campaign) => void;
  deleteCampaign: (id: string) => void;
  setActiveCampaign: (id: string | null) => void;
  signOut: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  campaigns: [],
  activeCampaignId: null,
  user: null,
  loading: true,

  fetchUser: async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        set({ user: null, loading: false });
        return;
      }

      console.log('Fetching profile for user:', user.id);

      // Fetch profile, credits, and subscription in parallel
      const [profileRes, creditsRes, subRes] = await Promise.all([
        supabase.from('users').select('*').eq('id', user.id).single(),
        supabase.from('credits').select('*').eq('user_id', user.id).single(),
        supabase.from('subscriptions').select('*').eq('user_id', user.id).eq('status', 'active').maybeSingle(),
      ]);

      if (profileRes.error && profileRes.error.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileRes.error);
      }

      if (creditsRes.error && creditsRes.error.code !== 'PGRST116') {
        console.error('Error fetching credits:', creditsRes.error);
      }

      set({
        user: {
          id: user.id,
          email: user.email!,
          full_name: profileRes.data?.full_name || '',
          credits: creditsRes.data || { total_credits: 10, used_credits: 0 },
          subscription: subRes.data,
        },
        loading: false,
      });
    } catch (error) {
      console.error('fetchUser error:', error);
      set({ user: null, loading: false });
    }
  },

  fetchCampaigns: async () => {
    const { user } = get();
    if (!user) return;

    const { data, error } = await supabase
      .from('campaigns')
      .select('*, leads(*, emails(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return;

    const campaigns: Campaign[] = data.map((c: any) => ({
      id: c.id,
      name: c.name,
      leadsCount: c.leads.length,
      status: c.status,
      createdAt: c.created_at,
      leads: c.leads.map((l: any) => ({
        id: l.id,
        name: l.name,
        email: l.email,
        company: l.company,
        website: l.website,
        status: l.emails.length > 0 ? 'ready' : 'pending',
        subject: l.emails[0]?.subject,
        content: l.emails[0]?.body,
      })),
    }));

    set({ campaigns });
  },

  addCampaign: (campaign) => set((state) => ({ campaigns: [campaign, ...state.campaigns] })),
  deleteCampaign: (id) => set((state) => ({ campaigns: state.campaigns.filter((c) => c.id !== id) })),
  setActiveCampaign: (id) => set({ activeCampaignId: id }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, campaigns: [] });
  },
}));
