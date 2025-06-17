import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ActivityLogService } from '@/services/ActivityLogService';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, CheckCircle, XCircle, RefreshCw, Wrench } from 'lucide-react';
import { fixRealtimeIssue } from '@/utils/fixRealtimeIssue';

export const ActivityDiagnostic: React.FC = () => {
  const { user } = useAuth();
  const [diagnosticResults, setDiagnosticResults] = useState<any>({});
  const [isRunning, setIsRunning] = useState(false);
  const [organizationId, setOrganizationId] = useState<string>('');

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: any = {
      userAuth: false,
      organizationFound: false,
      canQueryActivities: false,
      canCreateActivity: false,
      realtimeEnabled: false,
      realtimeWorking: false,
      organizationId: null,
      recentActivities: 0,
      errors: []
    };

    try {
      // 1. Check authentication
      if (user) {
        results.userAuth = true;
        console.log('✅ User authenticated:', user.id);
      } else {
        results.errors.push('No user authenticated');
      }

      // 2. Get organization
      const { data: orgs, error: orgError } = await supabase
        .from('organizations')
        .select('id, name')
        .limit(1)
        .single();

      if (orgError) {
        results.errors.push(`Organization error: ${orgError.message}`);
      } else if (orgs) {
        results.organizationFound = true;
        results.organizationId = orgs.id;
        setOrganizationId(orgs.id);
        console.log('✅ Organization found:', orgs.id, orgs.name);
      }

      // 3. Check if we can query activities
      const { data: activities, error: queryError } = await supabase
        .from('activity_logs')
        .select('id')
        .limit(5);

      if (!queryError) {
        results.canQueryActivities = true;
        results.recentActivities = activities?.length || 0;
        console.log('✅ Can query activities:', activities?.length);
      } else {
        results.errors.push(`Query error: ${queryError.message}`);
      }

      // 4. Test creating an activity
      if (results.organizationId) {
        const testId = await ActivityLogService.logActivity(
          'created',
          'test',
          `diagnostic-${Date.now()}`,
          'Diagnostic Test Activity',
          { diagnostic: true, timestamp: new Date().toISOString() },
          results.organizationId
        );

        if (testId) {
          results.canCreateActivity = true;
          console.log('✅ Can create activities:', testId);
        } else {
          results.errors.push('Failed to create test activity');
        }
      }

      // 5. Check if realtime is enabled
      const { data: pubTables } = await supabase
        .rpc('get_publication_tables', { publication_name: 'supabase_realtime' })
        .eq('tablename', 'activity_logs');

      if (pubTables && pubTables.length > 0) {
        results.realtimeEnabled = true;
        console.log('✅ Real-time enabled for activity_logs');
      }

      // 6. Test real-time subscription
      if (results.organizationId) {
        let received = false;
        const channel = supabase
          .channel('diagnostic-test-' + Date.now())
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'activity_logs',
            filter: `organization_id=eq.${results.organizationId}`
          }, () => {
            received = true;
          })
          .subscribe();

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Create another test activity
        await supabase.from('activity_logs').insert({
          action: 'created',
          entity_type: 'test',
          entity_id: 'realtime-test-' + Date.now(),
          entity_name: 'Real-time Test',
          organization_id: results.organizationId,
          user_id: user?.id,
          metadata: { realtime_test: true }
        });

        await new Promise(resolve => setTimeout(resolve, 3000));
        
        results.realtimeWorking = received;
        supabase.removeChannel(channel);
        
        if (received) {
          console.log('✅ Real-time is working!');
        } else {
          console.log('❌ Real-time not receiving events');
        }
      }

    } catch (error: any) {
      results.errors.push(`Unexpected error: ${error.message}`);
    }

    setDiagnosticResults(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, [user]);

  const getStatusIcon = (status: boolean) => {
    return status ? 
      <CheckCircle className="w-5 h-5 text-green-500" /> : 
      <XCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="p-6 bg-gray-900 rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Activity System Diagnostic</h3>
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          Run Diagnostics
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-gray-800">
          <span className="text-gray-300">User Authentication</span>
          {getStatusIcon(diagnosticResults.userAuth)}
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-800">
          <span className="text-gray-300">Organization Found</span>
          <div className="flex items-center gap-2">
            {diagnosticResults.organizationId && (
              <span className="text-xs text-gray-500 font-mono">
                {diagnosticResults.organizationId}
              </span>
            )}
            {getStatusIcon(diagnosticResults.organizationFound)}
          </div>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-800">
          <span className="text-gray-300">Can Query Activities</span>
          <div className="flex items-center gap-2">
            {diagnosticResults.recentActivities > 0 && (
              <span className="text-xs text-gray-500">
                {diagnosticResults.recentActivities} found
              </span>
            )}
            {getStatusIcon(diagnosticResults.canQueryActivities)}
          </div>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-800">
          <span className="text-gray-300">Can Create Activities</span>
          {getStatusIcon(diagnosticResults.canCreateActivity)}
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-800">
          <span className="text-gray-300">Real-time Enabled</span>
          {getStatusIcon(diagnosticResults.realtimeEnabled)}
        </div>

        <div className="flex items-center justify-between py-2 border-b border-gray-800">
          <span className="text-gray-300">Real-time Working</span>
          {getStatusIcon(diagnosticResults.realtimeWorking)}
        </div>
      </div>

      {diagnosticResults.errors?.length > 0 && (
        <div className="mt-4 p-4 bg-red-900/20 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-red-400 font-medium mb-2">Errors Found:</h4>
              <ul className="space-y-1">
                {diagnosticResults.errors.map((error: string, index: number) => (
                  <li key={index} className="text-sm text-red-300">• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {!diagnosticResults.realtimeWorking && diagnosticResults.organizationFound && (
        <div className="mt-4 p-4 bg-yellow-900/20 rounded-lg">
          <h4 className="text-yellow-400 font-medium mb-2">Fix Real-time Issues:</h4>
          <p className="text-sm text-yellow-300 mb-3">
            Real-time is not working. This is likely because the activity_logs table is not properly configured.
          </p>
          <p className="text-sm text-gray-400 mb-3">
            Organization ID for debugging: <code className="bg-gray-800 px-2 py-1 rounded">{organizationId}</code>
          </p>
          <button
            onClick={async () => {
              console.log('Running real-time fix...');
              await fixRealtimeIssue(organizationId);
            }}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white flex items-center gap-2"
          >
            <Wrench className="w-4 h-4" />
            Debug Real-time Issue
          </button>
        </div>
      )}
    </div>
  );
};