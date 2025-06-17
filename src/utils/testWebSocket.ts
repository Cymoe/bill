export async function testWebSocket() {
  console.log('=== WEBSOCKET CONNECTION TEST ===');
  
  // Test 1: Native WebSocket
  console.log('\n1. Testing native WebSocket...');
  try {
    const ws = new WebSocket('wss://echo.websocket.org/');
    
    ws.onopen = () => {
      console.log('✅ Native WebSocket works (echo.websocket.org)');
      ws.close();
    };
    
    ws.onerror = (error) => {
      console.error('❌ Native WebSocket failed:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket closed');
    };
  } catch (e) {
    console.error('❌ Cannot create WebSocket:', e);
  }
  
  // Test 2: Check if we're behind a proxy or firewall
  console.log('\n2. Checking network environment...');
  
  // Check if we're on localhost
  console.log('Current location:', window.location.origin);
  console.log('Protocol:', window.location.protocol);
  
  // Test 3: Try Supabase WebSocket with different parameters
  console.log('\n3. Testing Supabase WebSocket variations...');
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseKey) {
    // Extract project ref from URL
    const projectRef = supabaseUrl.split('.')[0].replace('https://', '');
    console.log('Project ref:', projectRef);
    
    // Try basic WebSocket URL
    const wsUrl = `wss://${projectRef}.supabase.co/realtime/v1/websocket?apikey=${supabaseKey}&vsn=1.0.0`;
    
    try {
      const ws = new WebSocket(wsUrl);
      
      let connected = false;
      const timeout = setTimeout(() => {
        if (!connected) {
          console.error('❌ Supabase WebSocket connection timed out');
          ws.close();
        }
      }, 5000);
      
      ws.onopen = () => {
        connected = true;
        clearTimeout(timeout);
        console.log('✅ Direct Supabase WebSocket connection established!');
        ws.close();
      };
      
      ws.onerror = (error) => {
        clearTimeout(timeout);
        console.error('❌ Supabase WebSocket error:', error);
      };
      
      ws.onclose = (event) => {
        console.log('Supabase WebSocket closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
      };
    } catch (e) {
      console.error('❌ Cannot create Supabase WebSocket:', e);
    }
  }
  
  // Test 4: Check browser extensions
  console.log('\n4. Checking for potential blockers...');
  console.log('User Agent:', navigator.userAgent);
  
  // Check for common ad blockers or privacy extensions
  const potentialBlockers = [
    'Ad blockers',
    'Privacy Badger',
    'uBlock Origin',
    'Ghostery',
    'DuckDuckGo Privacy Essentials',
    'VPN extensions',
    'Corporate firewall/proxy'
  ];
  
  console.log('Common causes of WebSocket blocking:');
  potentialBlockers.forEach(blocker => {
    console.log(`  - ${blocker}`);
  });
  
  // Test 5: Network information
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    console.log('\n5. Network information:');
    console.log('  - Effective Type:', connection?.effectiveType);
    console.log('  - Downlink:', connection?.downlink);
    console.log('  - RTT:', connection?.rtt);
  }
}

if (typeof window !== 'undefined') {
  (window as any).testWebSocket = testWebSocket;
}