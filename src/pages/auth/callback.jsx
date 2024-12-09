import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;

        if (user) {
          // Create content user record if it doesn't exist
          const { error: userError } = await supabase
            .from('content_users')
            .upsert([{
              id: user.id,
              name: user.user_metadata.full_name || user.email,
              email: user.email,
              access_level: 'Reader'
            }], {
              onConflict: 'id'
            });

          if (userError) throw userError;

          toast.success('Successfully signed in!');
        }

        // Redirect back to home page
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Error handling auth callback:', error);
        toast.error('Failed to complete authentication');
        navigate('/', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}