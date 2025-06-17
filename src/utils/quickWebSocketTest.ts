export function quickWebSocketTest() {
  console.log('=== QUICK WEBSOCKET TEST ===');
  
  // Test 1: Echo WebSocket
  console.log('\n1. Testing echo.websocket.org...');
  const ws1 = new WebSocket('wss://echo.websocket.org/');
  
  ws1.onopen = () => {
    console.log('✅ Echo WebSocket connected!');
    ws1.send('Hello');
  };
  
  ws1.onmessage = (event) => {
    console.log('✅ Echo received:', event.data);
    ws1.close();
  };
  
  ws1.onerror = (error) => {
    console.error('❌ Echo WebSocket error:', error);
  };
  
  ws1.onclose = () => {
    console.log('Echo WebSocket closed');
  };
  
  // Test 2: Check current Supabase configuration
  console.log('\n2. Supabase configuration:');
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('URL:', supabaseUrl);
  console.log('Key (first 20 chars):', anonKey?.substring(0, 20) + '...');
  
  // Test 3: Try polling-based approach instead
  console.log('\n3. Alternative: Polling approach');
  console.log('Since WebSockets are failing, you could:');
  console.log('- Use polling (refresh data every few seconds)');
  console.log('- Check if you\'re behind a corporate firewall');
  console.log('- Try from a different network');
  console.log('- Check browser extensions (ad blockers, VPNs)');
  
  return {
    supabaseUrl,
    projectRef: supabaseUrl?.split('.')[0]?.replace('https://', ''),
    wsUrl: `wss://${supabaseUrl?.split('.')[0]?.replace('https://', '')}.supabase.co/realtime/v1/websocket`
  };
}

// Add polling-based activity refresh as a workaround
export function startActivityPolling(callback: () => void, intervalMs: number = 5000) {
  console.log(`Starting activity polling every ${intervalMs}ms`);
  
  const intervalId = setInterval(() => {
    console.log('Polling for new activities...');
    callback();
  }, intervalMs);
  
  // Return cleanup function
  return () => {
    console.log('Stopping activity polling');
    clearInterval(intervalId);
  };
}

if (typeof window !== 'undefined') {
  (window as any).quickWebSocketTest = quickWebSocketTest;
  (window as any).startActivityPolling = startActivityPolling;
}