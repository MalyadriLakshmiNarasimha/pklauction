import React, { createContext, useContext, useEffect, useState } from 'react';
import { appParams } from '@/lib/app-params';
import { supabase, hasSupabaseConfig } from '@/lib/supabaseClient';

const AuthContext = createContext(/** @type {any} */ (null));

const deriveNameFromEmail = (email) => {
  const localPart = (email || '').split('@')[0] || '';
  const withoutNumbers = localPart.replace(/[0-9]/g, '');
  const cleaned = withoutNumbers.replace(/[._-]+/g, ' ').trim();
  if (cleaned) {
    return cleaned;
  }

  const fallback = localPart.replace(/[._-]+/g, ' ').trim();
  return fallback || 'Guest';
};

const getDisplayName = (authUser) => {
  const metadataName = (authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || '').trim();
  if (metadataName) {
    return metadataName;
  }

  return deriveNameFromEmail(authUser?.email || '');
};

const mapAuthUser = (authUser) => {
  if (!authUser) {
    return null;
  }

  const displayName = getDisplayName(authUser);

  return {
    id: authUser.id,
    full_name: displayName,
    name: displayName,
    username: deriveNameFromEmail(authUser.email || ''),
    email: authUser.email || '',
    avatar: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || '',
  };
};

const fetchPublicSettings = async () => {
  if (!appParams?.appId) {
    console.error('appId is missing. Skipping API call.');
    const error = new Error('appId is missing. Skipping API call.');
    error.status = 400;
    throw error;
  }

  const headers = {
    'X-App-Id': appParams.appId,
  };

  if (appParams.token) {
    headers.Authorization = `Bearer ${appParams.token}`;
  }

  try {
    const response = await fetch(`/api/apps/public/prod/public-settings/by-id/${appParams.appId}`, {
      method: 'GET',
      headers,
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(body?.message || 'Failed to load app');
      error.status = response.status;
      error.data = body;
      throw error;
    }

    console.log('App data loaded:', body);
    return body;
  } catch (error) {
    console.error('App state check failed:', error);
    throw error;
  }
};

/**
 * @param {{ children: React.ReactNode }} props
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(/** @type {any | null} */ (null));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(/** @type {{ type: string, message: string } | null} */ (null));
  const [loginError, setLoginError] = useState(/** @type {{ type: string, message: string } | null} */ (null));
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(/** @type {any | null} */ (null)); // Contains only { id, public_settings }

  const syncSupabaseSession = async () => {
    if (!supabase) {
      setAuthError({
        type: 'missing_supabase_config',
        message: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      });
      setIsLoadingAuth(false);
      setAuthChecked(true);
      return null;
    }

    const { data, error } = await supabase.auth.getUser();

    if (error) {
      throw error;
    }

    const mappedUser = mapAuthUser(data.user);
    setUser(mappedUser);
    setIsAuthenticated(Boolean(mappedUser));
    setLoginError(null);
    setIsLoadingAuth(false);
    setAuthChecked(true);
    return mappedUser;
  };

  useEffect(() => {
    checkAppState();

    if (!supabase) {
      return undefined;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const mappedUser = mapAuthUser(session?.user || null);
      setUser(mappedUser);
      setIsAuthenticated(Boolean(mappedUser));
      setIsLoadingAuth(false);
      setAuthChecked(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);
      
      // First, check app public settings (with token if available)
      // This will tell us if auth is required, user not registered, etc.
      try {
        const publicSettings = await fetchPublicSettings();
        setAppPublicSettings(publicSettings);

        await syncSupabaseSession();
        setIsLoadingPublicSettings(false);
      } catch (appError) {
        const err = /** @type {any} */ (appError);
        console.error('App state check failed:', appError);
        
        // Handle app-level errors
        if (err.status === 403 && err.data?.extra_data?.reason) {
          const reason = err.data.extra_data.reason;
          if (reason === 'auth_required') {
            setAuthError({
              type: 'auth_required',
              message: 'Authentication required'
            });
          } else if (reason === 'user_not_registered') {
            setAuthError({
              type: 'user_not_registered',
              message: 'User not registered for this app'
            });
          } else {
            setAuthError({
              type: reason,
              message: err.message
            });
          }
        } else {
          setAuthError({
            type: 'unknown',
            message: err.message || 'Failed to load app'
          });
        }
        setIsLoadingPublicSettings(false);
        setIsLoadingAuth(false);
        setAuthChecked(true);
      }
    } catch (error) {
      const err = /** @type {any} */ (error);
      console.error('Unexpected error:', error);
      setAuthError({
        type: 'unknown',
        message: err.message || 'An unexpected error occurred'
      });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const checkUserAuth = async () => {
    setIsLoadingAuth(true);
    return syncSupabaseSession();
  };

  const login = async () => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    }

    setLoginError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/lobby`,
      },
    });

    if (error) {
      setLoginError({
        type: 'failed_login',
        message: error.message || 'Google sign-in failed. Please try again.',
      });
      throw error;
    }

    return null;
  };

  const logout = async (shouldRedirect = true) => {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setUser(null);
    setIsAuthenticated(false);
    setAuthChecked(true);
    
    if (shouldRedirect) {
      window.location.assign('/');
    }
  };

  const navigateToLogin = () => {
    window.location.assign('/login');
  };

  const clearLoginError = () => {
    setLoginError(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      loginError,
      appPublicSettings,
      authChecked,
      logout,
      navigateToLogin,
      login,
      clearLoginError,
      checkUserAuth,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
