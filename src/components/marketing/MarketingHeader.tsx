import { useNavigate, useLocation } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { AuthButtons } from '../auth/AuthButtons';

interface MarketingHeaderProps {
  showSignIn?: boolean;
  useAuthButtons?: boolean;
}

export const MarketingHeader = ({ showSignIn = true, useAuthButtons = false }: MarketingHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine which nav item is active
  const isActive = (path: string) => {
    if (path === '/marketing/projects' && location.pathname === '/marketing/projects') {
      return true;
    }
    if (path === '/docs/construction-saas-user-feedback' && location.pathname.includes('/docs') && location.pathname.includes('feedback')) {
      return true;
    }
    if (path === '/docs/product-roadmap' && location.pathname.includes('/docs') && location.pathname.includes('roadmap')) {
      return true;
    }
    return false;
  };

  return (
    <nav className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200">
      <div 
        className="flex items-center space-x-2 cursor-pointer" 
        onClick={() => navigate('/')}
      >
        <Building2 className="h-6 w-6 text-blue-600" style={{ color: '#336699' }} />
        <span className="text-xl font-bold text-gray-900">BillBreeze</span>
      </div>
      
      <div className="flex items-center space-x-6">
        <a 
          href="/marketing/projects" 
          className={`text-gray-700 font-medium transition-colors ${
            isActive('/marketing/projects') ? '' : 'hover:text-blue-600'
          }`}
          style={{ color: isActive('/marketing/projects') ? '#336699' : undefined }}
        >
          Projects
        </a>
        <a 
          href="/docs/construction-saas-user-feedback" 
          className={`text-gray-700 font-medium transition-colors ${
            isActive('/docs/construction-saas-user-feedback') ? '' : 'hover:text-blue-600'
          }`}
          style={{ color: isActive('/docs/construction-saas-user-feedback') ? '#336699' : undefined }}
        >
          Insights
        </a>
        <a 
          href="/docs/product-roadmap" 
          className={`text-gray-700 font-medium transition-colors ${
            isActive('/docs/product-roadmap') ? '' : 'hover:text-blue-600'
          }`}
          style={{ color: isActive('/docs/product-roadmap') ? '#336699' : undefined }}
        >
          Roadmap
        </a>
        
        {showSignIn && !useAuthButtons && (
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            style={{ backgroundColor: '#336699', borderRadius: '4px' }}
          >
            Sign In
          </button>
        )}
        
        {useAuthButtons && (
          <AuthButtons />
        )}
      </div>
    </nav>
  );
};

export default MarketingHeader;
