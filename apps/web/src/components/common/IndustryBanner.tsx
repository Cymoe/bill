import React, { useState, useEffect, useContext } from 'react';
import { X, Settings, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { OrganizationContext } from '../layouts/DashboardLayout';

interface Industry {
  id: string;
  name: string;
  slug: string;
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
  const [isCompact, setIsCompact] = useState(() => {
    // Remember compact state in localStorage
    return localStorage.getItem('industryBannerCompact') === 'true';
  });
  const [showManagementDrawer, setShowManagementDrawer] = useState(false);

  // Emit drawer state change events so DashboardLayout can adjust
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('industryDrawerStateChange', {
      detail: { isOpen: showManagementDrawer }
    }));
  }, [showManagementDrawer]);

  // Listen for drawer close events to reset our state
  useEffect(() => {
    const handleDrawerClosed = () => {
      setShowManagementDrawer(false);
    };

    window.addEventListener('industryDrawerClosed', handleDrawerClosed);
    return () => {
      window.removeEventListener('industryDrawerClosed', handleDrawerClosed);
    };
  }, []);

  useEffect(() => {
    if (user && selectedOrg) {
      fetchActiveIndustries();
    }
  }, [user, selectedOrg]);

  // Listen for industry updates via custom event
  useEffect(() => {
    const handleIndustryUpdate = (event: CustomEvent) => {
      if (event.detail.organizationId === selectedOrg?.id) {
        // Update industries optimistically and immediately
        if (event.detail.action === 'add') {
          setActiveIndustries(prev => {
            // Check if already exists to avoid duplicates
            if (prev.find(ind => ind.id === event.detail.industry.id)) {
              return prev;
            }
            // Ensure the industry has a slug property
            const industryWithSlug = {
              ...event.detail.industry,
              slug: event.detail.industry.slug || event.detail.industry.name.toLowerCase().replace(/\s+/g, '-')
            };
            return [...prev, industryWithSlug];
          });
        } else if (event.detail.action === 'remove') {
          setActiveIndustries(prev => prev.filter(ind => ind.id !== event.detail.industryId));
        }
      }
    };

    window.addEventListener('industryUpdate', handleIndustryUpdate as EventListener);
    return () => {
      window.removeEventListener('industryUpdate', handleIndustryUpdate as EventListener);
    };
  }, [selectedOrg?.id]);

  const fetchActiveIndustries = async () => {
    try {
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
            slug,
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
            slug,
            icon,
            color
          )
        `)
        .eq('organization_id', selectedOrg.id);

      if (error) throw error;

      // Process and deduplicate industries
      const industriesMap = new Map<string, Industry>();
      
      // Add primary industry first
      if (org?.industry) {
        const industry = org.industry as any;
        industriesMap.set(industry.id, {
          id: industry.id,
          name: industry.name,
          slug: industry.slug,
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
              slug: industry.slug,
              icon: industry.icon,
              color: industry.color,
              organizationId: selectedOrg.id,
              organizationName: selectedOrg.name || org?.name || ''
            });
          }
        }
      });

      const uniqueIndustries = Array.from(industriesMap.values());
      setActiveIndustries(uniqueIndustries);
    } catch (error) {
      console.error('Error fetching active industries:', error);
    } finally {
      setLoading(false);
    }
  };


  if (loading || activeIndustries.length === 0) {
    return null;
  }

  const toggleCompact = () => {
    const newCompact = !isCompact;
    setIsCompact(newCompact);
    localStorage.setItem('industryBannerCompact', newCompact.toString());
  };

  // Compact view - single line with abbreviated names
  if (isCompact) {
    return (
      <div className="bg-[#1A1A1A] border-b border-[#333333] relative z-40 sticky top-0">
        <div className="px-6 py-1 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleCompact}
              className="text-gray-500 hover:text-gray-300 transition-colors p-1"
              title="Expand to full view"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            
            <div className="flex items-center gap-2 text-xs">
              {activeIndustries.map((industry, index) => (
                <React.Fragment key={industry.id}>
                  {index > 0 && <span className="text-gray-600">•</span>}
                  <div className="flex items-center gap-1 text-gray-400 hover:text-gray-300 transition-colors cursor-default" title={industry.name}>
                    <span>{industry.name.length > 10 ? industry.name.substring(0, 10) + '...' : industry.name}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <button
            onClick={() => setShowManagementDrawer(true)}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1"
            title="Manage Industries"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Full view - expanded design with all features
  return (
    <div className="bg-[#1A1A1A] border-b border-[#333333] relative z-40 sticky top-0">
      <div className="px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button
              onClick={toggleCompact}
              className="text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
              title="Switch to compact view"
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Industries</span>
              <span className="text-gray-600">•</span>
            </div>
            
            <div className={`flex items-center gap-2 ${isExpanded ? 'flex-nowrap overflow-x-auto scrollbar-hide' : 'flex-wrap'}`}>
              {activeIndustries.slice(0, isExpanded ? undefined : 3).map((industry) => (
                <div
                  key={industry.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1E1E1E] border border-[#333333] rounded text-xs hover:border-[#444444] transition-colors whitespace-nowrap flex-shrink-0"
                >
                  <span className="text-gray-300">{industry.name}</span>
                </div>
              ))}
              
              {activeIndustries.length > 3 && !isExpanded && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0"
                >
                  +{activeIndustries.length - 3} more
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {activeIndustries.length > 3 && isExpanded && (
              <button
                onClick={() => setIsExpanded(false)}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors ml-4"
              >
                Show Less
              </button>
            )}
            
            <button
              onClick={() => setShowManagementDrawer(true)}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Manage</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 