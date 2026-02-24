import { useState, useEffect, useCallback } from 'react';
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

  const fetchStore = useCallback(async (userId) => {
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
            setStore(newStore);
          }
        }
      } else if (error) {
        console.error('[useAuth] Error fetching store:', error);
      }
    } catch (error) {
      console.error('[useAuth] Error in fetchStore:', error);
    }
  }, []);

  const checkUser = useCallback(async () => {
    try {
      // getSession es más rápido (lee de storage) que getUser (hace request al servidor)
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth timeout')), 2500)
      );
      const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await fetchStore(currentUser.id);
      }
    } catch (error) {
      if (error?.message !== 'Auth timeout') {
        console.error('Error checking user:', error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [fetchStore]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      await checkUser();
    };
    init();

    // Safeguard: si tras 3s sigue cargando, forzar fin
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        setLoading((prev) => (prev ? false : prev));
      }
    }, 3000);

    // Listen for auth changes (INITIAL_SESSION suele dispararse al iniciar)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (cancelled) return;
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
      cancelled = true;
      clearTimeout(timeoutId);
      authListener?.subscription?.unsubscribe();
    };
  }, [checkUser, fetchStore]);

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

  const refreshStore = async () => {
    if (user?.id) {
      await fetchStore(user.id);
    }
  };

  return {
    user,
    store,
    loading,
    signIn,
    signUp,
    signOut,
    refreshStore,
  };
}

