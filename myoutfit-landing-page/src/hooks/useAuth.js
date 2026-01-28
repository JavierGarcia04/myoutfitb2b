import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Genera una API key única
function generateApiKey() {
  const prefix = 'mo_live_';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix + result;
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(null);

  useEffect(() => {
    // Check current session
    checkUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          await fetchStore(currentUser.id);
        } else {
          setStore(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ?? null);
      
      if (user) {
        await fetchStore(user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStore(userId) {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (data) {
        setStore(data);
        return;
      }
      
      // Si no hay tienda, intentar crearla
      if (!data && (!error || error.code === 'PGRST116')) {
        console.log('[useAuth] No store found, attempting to create one for user:', userId);
        
        // Obtener el usuario actual para el email y metadata
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const storeName = user.user_metadata?.store_name || 'Mi Tienda';
          const apiKey = generateApiKey();
          
          const { data: newStore, error: createError } = await supabase
            .from('stores')
            .insert([
              {
                user_id: userId,
                name: storeName,
                email: user.email,
                plan: 'starter',
                status: 'trial',
                subscription_status: 'trial',
                subscription_plan: 'starter',
                api_key: apiKey,
                max_products: 500,
                max_api_requests: 10000,
                api_requests_this_month: 0,
                trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              },
            ])
            .select()
            .single();
          
          if (createError) {
            console.error('[useAuth] Error creating store in fetchStore:', createError);
          } else {
            console.log('[useAuth] Store created in fetchStore with API key:', newStore.api_key);
            setStore(newStore);
          }
        }
      } else if (error) {
        console.error('[useAuth] Error fetching store:', error);
      }
    } catch (error) {
      console.error('[useAuth] Error in fetchStore:', error);
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Si el login fue exitoso, verificar si el usuario tiene una tienda
      if (data.user) {
        // Intentar obtener la tienda del usuario
        const { data: existingStore, error: storeError } = await supabase
          .from('stores')
          .select('*')
          .eq('user_id', data.user.id)
          .maybeSingle();
        
        console.log('[useAuth] Checking store:', { existingStore, storeError });
        
        // Si tiene tienda, usarla
        if (existingStore) {
          setStore(existingStore);
          return { data, error: null };
        }
        
        // Si no tiene tienda (o hubo error de "no encontrado"), crearla
        // El error PGRST116 significa "no rows returned" - es esperado si no hay tienda
        const shouldCreateStore = !existingStore && 
          (!storeError || storeError.code === 'PGRST116' || storeError.message?.includes('no rows'));
        
        if (shouldCreateStore) {
          console.log('[useAuth] Creating new store for user:', data.user.id);
          const storeName = data.user.user_metadata?.store_name || 'Mi Tienda';
          const apiKey = generateApiKey();
          
          const { data: newStore, error: createError } = await supabase
            .from('stores')
            .insert([
              {
                user_id: data.user.id,
                name: storeName,
                email: data.user.email,
                plan: 'starter',
                status: 'trial',
                subscription_status: 'trial',
                subscription_plan: 'starter',
                api_key: apiKey,
                max_products: 500,
                max_api_requests: 10000,
                api_requests_this_month: 0,
                trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
              },
            ])
            .select()
            .single();
          
          if (createError) {
            console.error('[useAuth] Error creating store:', createError);
          } else {
            console.log('[useAuth] Store created successfully with API key:', newStore.api_key);
            setStore(newStore);
          }
        }
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('[useAuth] SignIn error:', error);
      return { data: null, error };
    }
  };

  const signUp = async (email, password, storeName) => {
    try {
      // Create user with email confirmation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            store_name: storeName,
          }
        }
      });
      
      if (authError) {
        console.error('Auth error:', authError);
        throw authError;
      }
      
      // Note: No creamos la tienda aquí porque el usuario debe confirmar su email primero
      // La tienda se creará automáticamente en el primer login después de confirmar el email
      
      return { data: authData, error: null };
    } catch (error) {
      console.error('SignUp error:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setStore(null);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    user,
    store,
    loading,
    signIn,
    signUp,
    signOut,
  };
}

