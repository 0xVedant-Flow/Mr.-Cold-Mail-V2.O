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
  avatar_url?: string;
  credits?: {
    total_credits: number;
    used_credits: number;
  };
  subscription?: {
    plan: string;
    status: string;
    subscription_id?: string;
    current_period_end?: string;
  };
  gmailAccount?: {
    email: string;
    connected: boolean;
  };
  default_tone?: string;
  default_goal?: string;
  role?: 'user' | 'admin';
}

interface AppState {
  campaigns: Campaign[];
  activeCampaignId: string | null;
  user: UserProfile | null;
  loading: boolean;
  databaseError: string | null;
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
  databaseError: null,

  fetchUser: async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        set({ user: null, loading: false });
        return;
      }

      console.log('Fetching profile for user:', user.id);

      // Fetch consolidated profile from users table
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        if (profileError.message.includes("Could not find the table 'public.users'")) {
          set({ databaseError: 'The "public.users" table is missing from your Supabase database.' });
        } else {
          console.error('Error fetching profile:', profileError);
        }
      }

      // Fetch credits
      const { data: creditsData, error: creditsError } = await supabase
        .from('credits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (creditsError && creditsError.code !== 'PGRST116') {
        console.error('Error fetching credits:', creditsError);
      }

      // Fetch subscription
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subError && subError.code !== 'PGRST116') {
        console.error('Error fetching subscription:', subError);
      }

      // Fetch Gmail account
      const { data: gmailAccount, error: gmailError } = await supabase
        .from('gmail_accounts')
        .select('email')
        .eq('user_id', user.id)
        .single();

      if (gmailError && gmailError.code !== 'PGRST116') {
        console.error('Error fetching gmail account:', gmailError);
      }

      set({
        user: {
          id: user.id,
          email: user.email!,
          full_name: profile?.full_name || user.user_metadata?.full_name || '',
          avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || '',
          credits: {
            total_credits: creditsData?.total_credits || 10,
            used_credits: creditsData?.used_credits || 0,
          },
          subscription: {
            plan: subData?.plan || 'free',
            status: subData?.status || 'active',
            subscription_id: subData?.stripe_subscription_id,
          },
          gmailAccount: gmailAccount ? {
            email: gmailAccount.email,
            connected: true
          } : undefined,
          default_tone: profile?.default_tone || 'Professional',
          default_goal: profile?.default_goal || 'Book a Meeting',
          role: profile?.role || 'user',
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
