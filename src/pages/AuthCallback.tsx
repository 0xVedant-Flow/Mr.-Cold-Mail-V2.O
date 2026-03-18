import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FullPageLoading } from '../components/LoadingSpinner';

export const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      const errorDescription = url.searchParams.get('error_description');

      console.log('Auth callback started. URL:', window.location.href);
      console.log('Code present:', !!code);
      
      if (error) {
        console.error('Auth error from URL:', error, errorDescription);
        navigate('/login?error=' + encodeURIComponent(errorDescription || error));
        return;
      }
      
      try {
        // Manually handle the code exchange if present in the URL
        if (code) {
          console.log('AuthCallback: Found code in URL, exchanging for session...');
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error('AuthCallback: Code exchange error:', exchangeError);
            navigate('/login?error=' + encodeURIComponent(exchangeError.message));
            return;
          }
        }

        // Supabase should handle the code exchange automatically if it's in the URL
        // but we can explicitly call getSession to trigger it.
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error during auth callback session retrieval:', sessionError.message);
          navigate('/login?error=' + encodeURIComponent(sessionError.message));
          return;
        }

        if (data.session) {
          console.log('Session found in callback, redirecting to dashboard');
          navigate('/dashboard');
        } else {
          console.warn('No session found in callback after getSession()');
          
          // Fallback: check if we have a user
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            console.log('User found via getUser() in callback, redirecting');
            navigate('/dashboard');
          } else {
            console.error('No user or session found in callback');
            // If we have a code but no session, maybe it's still processing
            if (code) {
              console.log('Code present but no session, waiting a bit...');
              await new Promise(resolve => setTimeout(resolve, 2000));
              const { data: retryData } = await supabase.auth.getSession();
              if (retryData.session) {
                console.log('Session found after retry');
                navigate('/dashboard');
                return;
              }
            }
            navigate('/login?error=Authentication failed. Please try again.');
          }
        }
      } catch (err: any) {
        console.error('Unexpected error in auth callback:', err);
        navigate('/login?error=' + encodeURIComponent(err.message || 'An unexpected error occurred.'));
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return <FullPageLoading message="Verifying your account..." />;
};
