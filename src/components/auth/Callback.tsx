import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase will handle the code exchange automatically
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      } else {
        // Optionally handle error or show a message
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
      <div className="flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-2 border-steel-blue animate-pulse mx-auto mb-4 relative">
          <div className="absolute inset-1 bg-steel-blue opacity-30 animate-pulse" style={{ animationDelay: '0.75s' }}></div>
        </div>
        <p className="text-lg text-white mb-2">Completing sign-in...</p>
        <p className="text-sm text-gray-400">Please wait while we verify your account</p>
      </div>
    </div>
  );
};
