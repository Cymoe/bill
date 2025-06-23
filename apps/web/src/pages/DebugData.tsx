import React, { useEffect, useState, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { OrganizationContext } from '../components/layouts/DashboardLayout';

export const DebugData = () => {
  const { user } = useAuth();
  const { selectedOrg } = useContext(OrganizationContext);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDebugInfo = async () => {
      if (!user || !selectedOrg?.id) {
        setDebugInfo({ error: 'No user or org selected' });
        setLoading(false);
        return;
      }

      try {
        // Test various queries
        const [
          projectsWithOrg,
          projectsWithUser,
          invoicesWithOrg,
          invoicesWithUser,
          productsWithOrg,
          productsWithUser,
          clientsWithOrg,
          clientsWithUser
        ] = await Promise.all([
          supabase.from('projects').select('*').eq('organization_id', selectedOrg.id).limit(5),
          supabase.from('projects').select('*').eq('user_id', user.id).limit(5),
          supabase.from('invoices').select('*').eq('organization_id', selectedOrg.id).limit(5),
          supabase.from('invoices').select('*').eq('user_id', user.id).limit(5),
          supabase.from('products').select('*').eq('organization_id', selectedOrg.id).limit(5),
          supabase.from('products').select('*').eq('user_id', user.id).limit(5),
          supabase.from('clients').select('*').eq('organization_id', selectedOrg.id).limit(5),
          supabase.from('clients').select('*').eq('user_id', user.id).limit(5),
        ]);

        setDebugInfo({
          user: { id: user.id, email: user.email },
          selectedOrg,
          queries: {
            projectsWithOrg: { count: projectsWithOrg.data?.length || 0, error: projectsWithOrg.error },
            projectsWithUser: { count: projectsWithUser.data?.length || 0, error: projectsWithUser.error },
            invoicesWithOrg: { count: invoicesWithOrg.data?.length || 0, error: invoicesWithOrg.error },
            invoicesWithUser: { count: invoicesWithUser.data?.length || 0, error: invoicesWithUser.error },
            productsWithOrg: { count: productsWithOrg.data?.length || 0, error: productsWithOrg.error },
            productsWithUser: { count: productsWithUser.data?.length || 0, error: productsWithUser.error },
            clientsWithOrg: { count: clientsWithOrg.data?.length || 0, error: clientsWithOrg.error },
            clientsWithUser: { count: clientsWithUser.data?.length || 0, error: clientsWithUser.error },
          }
        });
      } catch (error) {
        setDebugInfo({ error: error });
      } finally {
        setLoading(false);
      }
    };

    fetchDebugInfo();
  }, [user, selectedOrg]);

  if (loading) return <div>Loading debug info...</div>;

  return (
    <div className="p-6 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">Debug Data Access</h1>
      <pre className="bg-gray-800 p-4 rounded overflow-auto">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
};