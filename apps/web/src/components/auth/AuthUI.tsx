import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../lib/supabase';

export const AuthUI = () => {
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <Auth
        supabaseClient={supabase}
        appearance={{ 
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#FF3B30',
                brandAccent: '#ff6b64',
              },
            },
          },
        }}
        providers={['google']}
        redirectTo={window.location.origin + '/auth/callback'}
        onlyThirdPartyProviders
      />
    </div>
  );
};
