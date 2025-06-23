import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export function useRealtimeStatus(channel?: RealtimeChannel | null) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    if (!channel) {
      setStatus('disconnected');
      return;
    }

    // Monitor the channel status
    const checkStatus = () => {
      const state = channel.state;
      
      switch (state) {
        case 'subscribed':
          setStatus('connected');
          setLastError(null);
          break;
        case 'subscribing':
          setStatus('connecting');
          break;
        case 'closed':
        case 'errored':
          setStatus('error');
          setLastError('Connection failed');
          break;
        default:
          setStatus('disconnected');
      }
    };

    // Initial check
    checkStatus();

    // Set up an interval to check connection status
    const interval = setInterval(checkStatus, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [channel]);

  // Check WebSocket connection
  useEffect(() => {
    const checkWebSocket = async () => {
      try {
        // Try to get the realtime socket
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setStatus('disconnected');
          setLastError('Not authenticated');
          return;
        }

        // If we have a session but no active channels, we're disconnected
        if (status === 'disconnected' && !lastError) {
          setLastError('No active real-time connection');
        }
      } catch (error) {
        console.error('Error checking WebSocket:', error);
        setStatus('error');
        setLastError('Failed to check connection');
      }
    };

    checkWebSocket();
    const interval = setInterval(checkWebSocket, 10000);

    return () => clearInterval(interval);
  }, [status, lastError]);

  return { status, lastError };
}