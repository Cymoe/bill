import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingCart,
  List,
  Plus,
  Search,
  Layers,
  Wrench,
  Gift
} from 'lucide-react';
import { PriceBook as ItemsPage } from '../components/price-book/PriceBook';
import CostCodesPage from './CostCodesPage';
import { WorkPacksPage } from '../components/work-packs/WorkPacksPage';
import { ServiceCatalog } from '../components/services/ServiceCatalog';
import { ServicePackages } from '../components/services/ServicePackages';
import { LineItemService } from '../services/LineItemService';
import { CostCodeService } from '../services/CostCodeService';
import { WorkPackService } from '../services/WorkPackService';
import { ServiceCatalogService } from '../services/ServiceCatalogService';
import { useAuth } from '../contexts/AuthContext';
import { OrganizationContext } from '../components/layouts/DashboardLayout';
import { supabase } from '../lib/supabase';

type TabType = 'items' | 'cost-codes' | 'work-packs' | 'services' | 'packages';

interface PriceBookStats {
  itemsCount: number;
  costCodesCount: number;
  workPacksCount: number;
  servicesCount: number;
  packagesCount: number;
}

export const PriceBook: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { selectedOrg } = useContext(OrganizationContext);
  const itemsPageRef = useRef<any>(null);
  const costCodesPageRef = useRef<any>(null);
  const getTabFromPath = (path: string): TabType => {
    if (path.includes('/price-book/items')) {
      return 'items';
    } else if (path.includes('/price-book/work-packs')) {
      return 'work-packs';
    } else if (path.includes('/price-book/services')) {
      return 'services';
    } else if (path.includes('/price-book/packages')) {
      return 'packages';
    } else if (path.includes('/price-book/cost-codes')) {
      return 'cost-codes';
    } else {
      return 'cost-codes';
    }
  };

  const [activeTab, setActiveTab] = useState<TabType>(() => getTabFromPath(location.pathname));
  const [stats, setStats] = useState<PriceBookStats>({
    itemsCount: 0,
    costCodesCount: 0,
    workPacksCount: 0,
    servicesCount: 0,
    packagesCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingWorkPack, setEditingWorkPack] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [triggerAddItem, setTriggerAddItem] = useState(0);
  const [triggerAddCostCode, setTriggerAddCostCode] = useState(0);
  const [triggerAddService, setTriggerAddService] = useState(0);
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Set active tab based on URL path
  useEffect(() => {
    const newTab = getTabFromPath(location.pathname);
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  }, [location.pathname, activeTab]);

  // Update URL when tab changes
  const handleTabChange = (tab: TabType) => {
    if (tab === activeTab) return; // Don't navigate if already on this tab
    
    // Reset all trigger states when changing tabs
    setTriggerAddItem(0);
    setTriggerAddCostCode(0);
    setTriggerAddService(0);
    setEditingWorkPack(null);
    
    setActiveTab(tab);
    const basePath = '/price-book';
    switch (tab) {
      case 'items':
        navigate(`${basePath}/items`);
        break;
      case 'work-packs':
        navigate(`${basePath}/work-packs`);
        break;
      case 'services':
        navigate(`${basePath}/services`);
        break;
      case 'packages':
        navigate(`${basePath}/packages`);
        break;
      case 'cost-codes':
        navigate(`${basePath}/cost-codes`);
        break;
      default:
        navigate(basePath);
        break;
    }
  };

  // Load stats
  const loadStats = async () => {
    if (!selectedOrg?.id) {
      setLoading(false);
      return;
    }
    
    try {
      const [lineItemsData, costCodesData, workPacksData, servicesData, packagesData] = await Promise.all([
        LineItemService.list(selectedOrg.id),
        CostCodeService.list(selectedOrg.id),
        WorkPackService.list(selectedOrg.id),
        ServiceCatalogService.listServices(selectedOrg.id),
        ServiceCatalogService.listPackages(selectedOrg.id)
      ]);

      setStats({
        itemsCount: lineItemsData?.length || 0,
        costCodesCount: costCodesData?.length || 0,
        workPacksCount: workPacksData?.length || 0,
        servicesCount: servicesData?.length || 0,
        packagesCount: packagesData?.length || 0
      });
    } catch (error) {
      console.error('Error loading price book stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [selectedOrg?.id, refreshTrigger]);

  const getAddButtonText = () => {
    switch (activeTab) {
      case 'cost-codes': return 'Add Code';
      case 'work-packs': return 'Add Work Pack';
      case 'services': return 'Add Service';
      case 'packages': return 'Add Package';
      default: return 'Add Item';
    }
  };

  const handleAddClick = () => {
    setIsAddingItem(true);
    
    // Small delay to show loading state
    setTimeout(() => {
      switch (activeTab) {
        case 'cost-codes':
          // Trigger the add cost code modal in CostCodesPage
          setTriggerAddCostCode(prev => prev + 1);
          break;
        case 'work-packs':
          setEditingWorkPack('new');
          break;
        case 'items':
          // Trigger the add item modal in ItemsPage
          setTriggerAddItem(prev => prev + 1);
          break;
        case 'services':
          // Trigger the add service drawer in ServiceCatalog
          setTriggerAddService(prev => prev + 1);
          break;
        case 'packages':
          // Packages tab handles its own state
          break;
        default:
          break;
      }
      setIsAddingItem(false);
    }, 100);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-8">
      {/* Single Unified Card */}
      <div className="bg-transparent border border-[#333333]">
        {/* Header Section */}
        <div className="px-6 py-5 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">Price Book</h1>
          
          <div className="flex items-center gap-5">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="bg-[#1E1E1E] border border-[#333333] pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#336699] w-[300px]"
              />
            </div>
            
            <button
              onClick={handleAddClick}
              disabled={isAddingItem}
              className="bg-white hover:bg-gray-100 text-black px-5 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 w-[150px] justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingItem ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{getAddButtonText()}</span>
                </>
              )}
            </button>
          </div>
        </div>


        {/* Tabs Navigation */}
        <div className="border-t border-[#333333]">
          <div className="flex">
            <button
              onClick={() => handleTabChange('cost-codes')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative flex items-center justify-center gap-2 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:transition-colors ${
                activeTab === 'cost-codes'
                  ? 'text-white after:bg-[#336699] bg-[#1A1A1A]'
                  : 'text-gray-500 hover:text-gray-400 after:bg-transparent hover:after:bg-[#336699] hover:bg-[#1A1A1A]/50'
              }`}
            >
              <List className="w-4 h-4" />
              Cost Codes
              <span className="text-xs text-gray-500 ml-1">
                {loading ? (
                  <span className="inline-block w-4 h-4 border border-gray-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  `(${stats.costCodesCount})`
                )}
              </span>
            </button>
            <button
              onClick={() => handleTabChange('items')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative flex items-center justify-center gap-2 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:transition-colors ${
                activeTab === 'items'
                  ? 'text-white after:bg-[#336699] bg-[#1A1A1A]'
                  : 'text-gray-500 hover:text-gray-400 after:bg-transparent hover:after:bg-[#336699] hover:bg-[#1A1A1A]/50'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Items
              <span className="text-xs text-gray-500 ml-1">
                {loading ? (
                  <span className="inline-block w-4 h-4 border border-gray-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  `(${stats.itemsCount})`
                )}
              </span>
            </button>
            <button
              onClick={() => handleTabChange('work-packs')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative flex items-center justify-center gap-2 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:transition-colors ${
                activeTab === 'work-packs'
                  ? 'text-white after:bg-[#336699] bg-[#1A1A1A]'
                  : 'text-gray-500 hover:text-gray-400 after:bg-transparent hover:after:bg-[#336699] hover:bg-[#1A1A1A]/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              Work Packs
              <span className="text-xs text-gray-500 ml-1">
                {loading ? (
                  <span className="inline-block w-4 h-4 border border-gray-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  `(${stats.workPacksCount})`
                )}
              </span>
            </button>
            <button
              onClick={() => handleTabChange('services')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative flex items-center justify-center gap-2 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:transition-colors ${
                activeTab === 'services'
                  ? 'text-white after:bg-[#336699] bg-[#1A1A1A]'
                  : 'text-gray-500 hover:text-gray-400 after:bg-transparent hover:after:bg-[#336699] hover:bg-[#1A1A1A]/50'
              }`}
            >
              <Wrench className="w-4 h-4" />
              Services
              <span className="text-xs text-gray-500 ml-1">
                {loading ? (
                  <span className="inline-block w-4 h-4 border border-gray-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  `(${stats.servicesCount})`
                )}
              </span>
            </button>
            <button
              onClick={() => handleTabChange('packages')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative flex items-center justify-center gap-2 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:transition-colors ${
                activeTab === 'packages'
                  ? 'text-white after:bg-[#336699] bg-[#1A1A1A]'
                  : 'text-gray-500 hover:text-gray-400 after:bg-transparent hover:after:bg-[#336699] hover:bg-[#1A1A1A]/50'
              }`}
            >
              <Gift className="w-4 h-4" />
              Packages
              <span className="text-xs text-gray-500 ml-1">
                {loading ? (
                  <span className="inline-block w-4 h-4 border border-gray-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  `(${stats.packagesCount})`
                )}
              </span>
            </button>
          </div>
        </div>

      </div>

      {/* Content Area - Visually connected but separate to avoid nested cards */}
      <div className="-mt-[1px]">
        {activeTab === 'items' && (
          <div className="[&>div]:border-t-0 [&>div]:pt-0 [&>div>div]:border-t-0">
            <ItemsPage 
              key="items-tab" 
              triggerAddItem={triggerAddItem}
              onAddItemComplete={() => {}}
            />
          </div>
        )}
        {activeTab === 'cost-codes' && (
          <div className="[&>div]:border-t-0 [&>div]:pt-0 [&>div>div]:border-t-0">
            <CostCodesPage 
              key="cost-codes-tab" 
              triggerAddCostCode={triggerAddCostCode}
            />
          </div>
        )}
        {activeTab === 'work-packs' && (
          <div className="[&>div]:border-t-0 [&>div]:pt-0 [&>div>div]:border-t-0">
            <WorkPacksPage 
              key="work-packs-tab"
              editingWorkPack={editingWorkPack} 
              setEditingWorkPack={setEditingWorkPack}
            />
          </div>
        )}
        {activeTab === 'services' && (
          <div className="[&>div]:border-t-0 [&>div]:pt-0 [&>div>div]:border-t-0">
            <ServiceCatalog 
              key="services-tab" 
              triggerAddService={triggerAddService}
            />
          </div>
        )}
        {activeTab === 'packages' && (
          <div className="[&>div]:border-t-0 [&>div]:pt-0 [&>div>div]:border-t-0">
            <ServicePackages key="packages-tab" />
          </div>
        )}
      </div>
    </div>
  );
};