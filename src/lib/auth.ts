import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export const auth = {
  signIn: async (email: string, password: string): Promise<User> => {
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Login failed');

    // Fetch profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) throw profileError;

    return {
      id: data.user.id,
      email: data.user.email!,
      firstName: profile.first_name || '',
      lastName: profile.last_name || '',
      createdAt: data.user.created_at,
    };
  },

  signUp: async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    organizationId?: string
  ): Promise<User> => {
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    if (!email.includes('@')) {
      throw new Error('Please enter a valid email');
    }

    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error('Signup failed');

    // If organization ID is provided, assign user to organization
    // Note: This would typically be done via an edge function or trigger
    // For now, we'll rely on manual assignment or admin actions

    return {
      id: data.user.id,
      email: data.user.email!,
      firstName,
      lastName,
      createdAt: data.user.created_at,
    };
  },

  signOut: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getCurrentUser: async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) return null;

    return {
      id: user.id,
      email: user.email!,
      firstName: profile.first_name || '',
      lastName: profile.last_name || '',
      createdAt: user.created_at,
    };
  },

  isAuthenticated: async (): Promise<boolean> => {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },

  getUserOrganizations: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_organizations')
      .select(`
        role,
        organization_id,
        organizations (
          id,
          name,
          slug,
          domain,
          logo_url,
          primary_color,
          icon,
          tagline
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },
};
