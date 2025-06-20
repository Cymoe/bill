import { useState, useEffect, useContext } from 'react';
import { Shield, ChevronDown, X, Plus, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { OrganizationContext } from '../layouts/DashboardLayout';

interface Industry {
  id: string;
  name: string;
  icon: string;
  color: string;
  organizationId: string;
  organizationName: string;
}

export const IndustryBanner = () => {
  const { user } = useAuth();
  const { selectedOrg } = useContext(OrganizationContext);
  const navigate = useNavigate();
  const [activeIndustries, setActiveIndustries] = useState<Industry[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('IndustryBanner: Component mounted, user:', user, 'selectedOrg:', selectedOrg);
    if (user && selectedOrg) {
      fetchActiveIndustries();
    }
  }, [user, selectedOrg]);

  const fetchActiveIndustries = async () => {
    try {
      console.log('IndustryBanner: Fetching active industries for selected organization:', selectedOrg?.id);
      
      if (!selectedOrg?.id) {
        setActiveIndustries([]);
        setLoading(false);
        return;
      }

      // First get primary industry from organizations table
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select(`
          id,
          name,
          industry_id,
          industry:industries!organizations_industry_id_fkey (
            id,
            name,
            icon,
            color
          )
        `)
        .eq('id', selectedOrg.id)
        .single();

      if (orgError) throw orgError;

      // Then get additional industries from organization_industries
      const { data, error } = await supabase
        .from('organization_industries')
        .select(`
          organization_id,
          industry:industries (
            id,
            name,
            icon,
            color
          )
        `)
        .eq('organization_id', selectedOrg.id);

      console.log('IndustryBanner: Primary industry:', org);
      console.log('IndustryBanner: Additional industries:', { data, error });

      if (error) throw error;

      // Process and deduplicate industries
      const industriesMap = new Map<string, Industry>();
      
      // Add primary industry first
      if (org?.industry) {
        const industry = org.industry as any;
        industriesMap.set(industry.id, {
          id: industry.id,
          name: industry.name,
          icon: industry.icon,
          color: industry.color,
          organizationId: org.id,
          organizationName: org.name
        });
      }

      // Add additional industries
      data?.forEach(item => {
        if (item.industry) {
          const industry = item.industry as any;
          
          // If industry already exists, skip it (avoid duplicates)
          if (!industriesMap.has(industry.id)) {
            industriesMap.set(industry.id, {
              id: industry.id,
              name: industry.name,
              icon: industry.icon,
              color: industry.color,
              organizationId: selectedOrg.id,
              organizationName: selectedOrg.name || org?.name || ''
            });
          }
        }
      });

      const uniqueIndustries = Array.from(industriesMap.values());
      console.log('IndustryBanner: Industries for selected org:', uniqueIndustries);
      setActiveIndustries(uniqueIndustries);
    } catch (error) {
      console.error('Error fetching active industries:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeIndustry = async (industryId: string, organizationId: string) => {
    try {
      // Check if this is the primary industry
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('industry_id')
        .eq('id', organizationId)
        .single();

      if (orgError) throw orgError;

      // Don't allow removing the primary industry
      if (org?.industry_id === industryId) {
        alert("Cannot remove the organization's primary industry. Please change the primary industry in settings first.");
        return;
      }

      const { error } = await supabase
        .from('organization_industries')
        .delete()
        .eq('organization_id', organizationId)
        .eq('industry_id', industryId);

      if (error) throw error;

      // Refresh the list
      fetchActiveIndustries();
    } catch (error) {
      console.error('Error removing industry:', error);
    }
  };

  console.log('IndustryBanner: Render check - loading:', loading, 'industries:', activeIndustries.length);
  
  if (loading || activeIndustries.length === 0) {
    console.log('IndustryBanner: Not rendering - loading:', loading, 'no industries:', activeIndustries.length === 0);
    return null;
  }

  return (
    <div className="bg-slate-800 border-b border-slate-700 relative z-40">
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-300">ACTIVE INDUSTRIES:</span>
            
            <div className="flex items-center space-x-2">
              {activeIndustries.slice(0, isExpanded ? undefined : 3).map((industry) => (
                <div
                  key={industry.id}
                  className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: `${industry.color}20`,
                    color: industry.color,
                    border: `1px solid ${industry.color}40`
                  }}
                >
                  <span className="text-sm">{industry.icon}</span>
                  <span>{industry.name}</span>
                  {isExpanded && (
                    <button
                      onClick={() => removeIndustry(industry.id, industry.organizationId)}
                      className="ml-1 hover:opacity-70 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
              
              {activeIndustries.length > 3 && !isExpanded && (
                <span className="text-xs text-gray-400">
                  +{activeIndustries.length - 3} more
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {activeIndustries.length > 3 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-gray-400 hover:text-gray-300 flex items-center space-x-1"
              >
                <span>{isExpanded ? 'Show Less' : 'Show All'}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            )}
            
            <button
              onClick={() => navigate('/settings/industries')}
              className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-medium text-gray-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded transition-colors"
            >
              <Settings className="h-3 w-3" />
              <span>Manage Industries</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 