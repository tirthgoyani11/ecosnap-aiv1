import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { full_name?: string; username?: string; avatar_url?: string }) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    
    console.log('AuthContext: Initializing authentication...');

    // Get initial session
    const getSession = async () => {
      try {
        console.log('AuthContext: Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('AuthContext: Error getting session:', error);
        } else if (isMounted) {
          console.log('AuthContext: Initial session retrieved:', session ? 'Present' : 'None');
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('AuthContext: Error in getSession:', error);
      } finally {
        if (isMounted) {
          console.log('AuthContext: Setting loading to false after initial session check');
          setLoading(false);
        }
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!isMounted) return;
        
        console.log('AuthContext: Auth state changed:', event, session ? 'Session present' : 'No session');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('AuthContext: Creating/updating profile for signed in user');
          // Create or update profile when user signs in
          await createOrUpdateProfile(session.user);
        }
        
        console.log('AuthContext: Setting loading to false after auth state change');
        setLoading(false);
      }
    );

    return () => {
      console.log('AuthContext: Cleanup - unmounting');
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Separate timeout effect to handle stuck loading states
  useEffect(() => {
    if (!loading) return;
    
    console.log('AuthContext: Starting 5-second timeout for loading state');
    const timeoutId = setTimeout(() => {
      console.warn('AuthContext: Loading timeout reached - forcing loading to false');
      setLoading(false);
    }, 5000); // 5 second timeout

    return () => {
      console.log('AuthContext: Clearing loading timeout');
      clearTimeout(timeoutId);
    };
  }, [loading]);

  const createOrUpdateProfile = async (user: User) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error creating/updating profile:', error);
      }
    } catch (error) {
      console.error('Error in createOrUpdateProfile:', error);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      toast({
        title: "Welcome back!",
        description: "You've been successfully signed in.",
      });

      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signUp = async (email: string, password: string, fullName: string): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        return { error: error.message };
      }

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });

      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signInWithGoogle = async (): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        toast({
          title: "Error",
          description: "There was an error signing out.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed out",
          description: "You've been successfully signed out.",
        });
      }
    } catch (error) {
      console.error('Error in signOut:', error);
    }
  };

  const updateProfile = async (updates: { full_name?: string; username?: string; avatar_url?: string }): Promise<{ error?: string }> => {
    if (!user) {
      return { error: 'No user logged in' };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) {
        return { error: error.message };
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });

      return {};
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
