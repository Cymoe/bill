import { useState, useEffect, useMemo, useRef } from 'react';
import { formatCurrency } from '../../utils/format';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Modal } from '../common/Modal';
import { SlideOutDrawer } from '../common/SlideOutDrawer';
import { LineItemForm } from './LineItemForm';
import { LineItemService } from '../../services/LineItemService';
import { CostCodeService } from '../../services/CostCodeService';
import { LineItem } from '../../types';
import { MoreVertical, Filter, Plus, Copy, Star, Trash2, Edit3, Upload, FileText, LayoutGrid, FileSpreadsheet, DollarSign } from 'lucide-react';
import './price-book.css';
import { useNavigate } from 'react-router-dom';
import { LayoutContext, OrganizationContext } from '../layouts/DashboardLayout';
import React from 'react';
import { CostCodeExportService } from '../../services/CostCodeExportService';
import { PricingModeSelector } from './PricingModeSelector';
import { PricingModePreviewModal } from './PricingModePreviewModal';
import { PricingModesService, PricingMode } from '../../services/PricingModesService';

// Using LineItem interface from types instead of local Product interface



// Add TypeScript declaration for the window object
declare global {
  interface Window {
    openLineItemModal?: () => void;
  }
}

interface PriceBookProps {
  triggerAddItem?: number;
}

export const PriceBook: React.FC<PriceBookProps> = ({ triggerAddItem }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { } = React.useContext(LayoutContext);
  const { selectedOrg } = React.useContext(OrganizationContext);
  const [showNewLineItemModal, setShowNewLineItemModal] = useState(false);
  const [showEditLineItemModal, setShowEditLineItemModal] = useState(false);
  const [editingLineItem, setEditingLineItem] = useState<LineItem | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('any');
  const [priceSort, setPriceSort] = useState<'asc' | 'desc'>('desc');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isClosingDropdown, setIsClosingDropdown] = useState(false);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [trades, setTrades] = useState<{ id: string; name: string; code: string; industry?: { id: string; name: string; icon?: string; color?: string } }[]>([]);
  const [selectedTradeId, setSelectedTradeId] = useState<string>('all');
  const [groupedTrades, setGroupedTrades] = useState<Map<string, typeof trades>>(new Map());
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState('all');
  const [condensed, setCondensed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pricebook-condensed') === 'true';
    }
    return false;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingCostCodes, setIsLoadingCostCodes] = useState(true);
  const [quickFilter, setQuickFilter] = useState<'all' | 'labor' | 'materials' | 'services' | 'installation'>('all');
  const [recentlyUpdatedId, setRecentlyUpdatedId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<PricingMode | null>(null);
  const [showModePreview, setShowModePreview] = useState(false);
  const [pendingModeId, setPendingModeId] = useState<string | null>(null);
  const [selectedLineItemIds, setSelectedLineItemIds] = useState<string[]>([]);
  const [lastPricingOperation, setLastPricingOperation] = useState<{
    modeId: string;
    modeName: string;
    lineItemIds: string[];
    previousPrices: Array<{ lineItemId: string; price: number }>;
    timestamp: number;
  } | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const [undoTimeLeft, setUndoTimeLeft] = useState(30);
  const [applyingProgress, setApplyingProgress] = useState<{
    current: number;
    total: number;
    action: 'applying' | 'undoing';
  } | null>(null);
  const [showSuccess, setShowSuccess] = useState<{
    message: string;
    itemCount: number;
  } | null>(null);
  
  // Calculate counts for each quick filter
  const quickFilterCounts = useMemo(() => {
    const counts = {
      all: lineItems.length,
      labor: 0,
      materials: 0,
      installation: 0,
      services: 0
    };
    
    lineItems.forEach(item => {
      const costCode = trades.find(t => t.id === item.cost_code_id);
      if (!costCode) return;
      
      const codeNumber = parseInt(costCode.code.replace(/[^0-9]/g, ''));
      if (isNaN(codeNumber)) return;
      
      if (codeNumber >= 100 && codeNumber <= 199) counts.labor++;
      if (codeNumber >= 500 && codeNumber <= 599) counts.materials++;
      if (codeNumber >= 200 && codeNumber <= 299) counts.installation++;
      if ((codeNumber >= 300 && codeNumber <= 399) || (codeNumber >= 600 && codeNumber <= 699)) counts.services++;
    });
    
    return counts;
  }, [lineItems, trades]);
  
  
  // Handle trigger from parent component
  useEffect(() => {
    if (triggerAddItem && triggerAddItem > 0) {
      setShowNewLineItemModal(true);
    }
  }, [triggerAddItem]);
  
  
  const handleEditLineItem = (lineItem: LineItem) => {
    setEditingLineItem(lineItem);
    setShowEditLineItemModal(true);
  };

  const handleSaveEdit = async (data: any) => {
    try {
      if (!editingLineItem?.id || !selectedOrg?.id) return;
      
      // Optimistically update the UI immediately
      setLineItems(prevItems => 
        prevItems.map(item => 
          item.id === editingLineItem.id 
            ? {
                ...item,
                price: data.price,
                name: data.name || item.name,
                description: data.description !== undefined ? data.description : item.description,
                unit: data.unit || item.unit,
                has_override: !editingLineItem.organization_id && data.price !== editingLineItem.base_price,
                markup_percentage: data.markup_percentage,
                base_price: item.base_price // Keep base_price for strategy calculation
              }
            : item
        )
      );
      
      // Trigger animation for the updated item
      setRecentlyUpdatedId(editingLineItem.id);
      setTimeout(() => setRecentlyUpdatedId(null), 1500); // Clear after animation
      
      // Close modal immediately for better UX
      setShowEditLineItemModal(false);
      setEditingLineItem(null);
      
      // Then update the backend
      try {
        // Check if this is a shared item (no organization_id)
        if (!editingLineItem.organization_id) {
          // For shared items, handle markup or custom price
          if (data.markup_percentage !== undefined) {
            // Set markup percentage
            await LineItemService.setMarkupPercentage(editingLineItem.id, selectedOrg.id, data.markup_percentage);
          } else if (data.price && data.price !== editingLineItem.base_price) {
            // Set custom price
            await LineItemService.setOverridePrice(editingLineItem.id, selectedOrg.id, data.price);
          } else if (data.price === editingLineItem.base_price) {
            // Reset to base price
            await LineItemService.removeOverridePrice(editingLineItem.id, selectedOrg.id);
          }
        } else {
          // For organization-owned items, update normally
          await LineItemService.update(editingLineItem.id, {
            name: data.name,
            description: data.description,
            price: data.price,
            unit: data.unit,
            cost_code_id: data.cost_code_id
          }, selectedOrg.id);
        }
      } catch (error) {
        // If backend update fails, revert the optimistic update
        console.error('Error updating line item:', error);
        alert(error instanceof Error ? error.message : 'Failed to update line item');
        await fetchLineItems(); // Reload to get correct state
      }
    } catch (error) {
      console.error('Error in handleSaveEdit:', error);
      alert('Failed to update line item');
    }
  };

  const handleToggleFavorite = async (lineItem: LineItem) => {
    try {
      // Only allow favoriting for organization-owned items or shared items
      await LineItemService.update(lineItem.id, {
        favorite: !lineItem.favorite
      }, selectedOrg?.id);
      await fetchLineItems();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // For shared items, we might need a different approach
      // For now, just log the error
    }
  };


  const handleDeleteLineItem = async (lineItem: LineItem) => {
    if (confirm('Are you sure you want to delete this line item?')) {
      try {
        await LineItemService.delete(lineItem.id, selectedOrg?.id);
        await fetchLineItems();
      } catch (error) {
        console.error('Error deleting line item:', error);
        alert(error instanceof Error ? error.message : 'Failed to delete line item');
      }
    }
  };

  const handleDuplicateLineItem = async (lineItem: LineItem) => {
    try {
      await LineItemService.create({
        name: `${lineItem.name} (Copy)`,
        description: lineItem.description,
        price: lineItem.price,
        unit: lineItem.unit,
        user_id: user?.id || '',
        organization_id: selectedOrg?.id || '',
        status: lineItem.status,
        favorite: false,
        vendor_id: lineItem.vendor_id,
        cost_code_id: lineItem.cost_code_id
      });

      await fetchLineItems();
      setActiveDropdown(null);
    } catch (error) {
      console.error('Error duplicating line item:', error);
    }
  };


  // Functions for the new menu options
  const handleImportItems = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !selectedOrg?.id || !user?.id) return;
      
      try {
        const result = await CostCodeExportService.importFromFile(file, selectedOrg.id, user.id);
        
        if (result.errors.length > 0) {
          console.error('Import errors:', result.errors);
          alert(`Import completed with errors:\n- ${result.success} items imported successfully\n- ${result.errors.length} errors\n\nCheck console for details.`);
        } else {
          alert(`Successfully imported ${result.success} items!`);
        }
        
        // Refresh the line items list
        await fetchLineItems();
      } catch (error) {
        console.error('Error importing file:', error);
        alert('Failed to import file. Please check the format and try again.');
      }
    };
    input.click();
  };

  const handleExportToCSV = async () => {
    try {
      await CostCodeExportService.exportToCSV(filteredLineItems, trades);
      console.log('CSV export completed');
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      alert('Failed to export to CSV');
    }
  };

  const handleExportToExcel = async () => {
    try {
      await CostCodeExportService.exportToExcel(filteredLineItems, trades);
      console.log('Excel export completed');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel');
    }
  };

  const handlePrintPriceBook = () => {
    // Create a print-friendly version
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cost Codes - ${new Date().toLocaleDateString()}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f2f2f2; font-weight: bold; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>Cost Codes</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <p>Total Items: ${filteredLineItems.length}</p>
        
        <table>
          <thead>
            <tr>
              <th>Cost Code</th>
              <th>Item Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            ${filteredLineItems.map(lineItem => {
              const trade = trades.find(t => t.id === lineItem.cost_code_id);
              const costCodeDisplay = trade ? `${trade.code} ${trade.name}` : (lineItem.cost_code ? `${lineItem.cost_code.code} ${lineItem.cost_code.name}` : '—');
              return `
                <tr>
                  <td>${costCodeDisplay}</td>
                  <td>${lineItem.name}</td>
                  <td>${lineItem.description || ''}</td>
                  <td>${formatCurrency(lineItem.price)}</td>
                  <td>${lineItem.unit}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <button class="no-print" onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #333; color: white; border: none; cursor: pointer;">
          Print
        </button>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(false);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
      
      // Handle dropdown outside clicks
      const target = event.target as HTMLElement;
      const isDropdownContent = dropdownRef.current && dropdownRef.current.contains(target);
      const isThreeDotsButton = target.closest('button')?.querySelector('.lucide-more-vertical');
      
      if (!isDropdownContent && !isThreeDotsButton && activeDropdown) {
        setIsClosingDropdown(true);
        setActiveDropdown(null);
        // Reset the flag after a short delay
        setTimeout(() => setIsClosingDropdown(false), 100);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  useEffect(() => {
    if (selectedOrg?.id) {
      fetchLineItems();
      fetchTrades();
    }
  }, [user?.id, selectedOrg?.id]);


  const fetchTrades = async () => {
    try {
      setIsLoadingCostCodes(true);
      console.log('Fetching cost codes for organization:', selectedOrg?.id);
      
      if (!selectedOrg?.id) {
        console.log('No organization selected, skipping cost codes fetch');
        setTrades([]);
        return;
      }

      // Use our industry-aware CostCodeService
      const data = await CostCodeService.list(selectedOrg.id);
      console.log('Industry-filtered cost codes fetched:', data?.length || 0);
      console.log('First few cost codes:', data?.slice(0, 3));
      setTrades(data || []);
      
      // Also get grouped version for dropdown
      const grouped = await CostCodeService.listGroupedByIndustry(selectedOrg.id);
      console.log('Grouped cost codes by industry:', Array.from(grouped.keys()));
      setGroupedTrades(grouped);
    } catch (err) {
      console.error('Error in fetchTrades:', err);
      console.error('Error details:', err);
      setTrades([]);
    } finally {
      setIsLoadingCostCodes(false);
    }
  };

  const fetchLineItems = async (smartMerge = false) => {
    try {
      if (!smartMerge) {
        setIsLoading(true);
      }
      setError(null);
      
      if (!selectedOrg?.id) {
        console.error('No organization selected');
        setError('No organization selected');
        setIsLoading(false);
        return;
      }
      
      console.log('Fetching line items for organization:', selectedOrg.id);
      
      // Fetch only line items for smart merge
      const lineItemsResult = await LineItemService.list(selectedOrg.id)
        .then(data => ({ status: 'fulfilled', value: data }))
        .catch(error => ({ status: 'rejected', reason: error }));
      
      // Handle line items result
      if (lineItemsResult.status === 'fulfilled') {
        const data = lineItemsResult.value;
        console.log('Line items fetched successfully:', data?.length || 0, 'items');
        
        if (smartMerge) {
          // Smart merge: only update items that have changed
          setLineItems(currentItems => {
            const updatedItems = currentItems.map(currentItem => {
              const serverItem = data?.find(item => item.id === currentItem.id);
              if (serverItem) {
                // Only update if there are actual differences (more thorough check)
                const hasChanges = 
                  Math.abs(serverItem.price - currentItem.price) > 0.001 || // Float comparison
                  serverItem.applied_mode_name !== currentItem.applied_mode_name ||
                  serverItem.applied_mode_id !== currentItem.applied_mode_id ||
                  serverItem.has_override !== currentItem.has_override ||
                  serverItem.base_price !== currentItem.base_price;
                
                return hasChanges ? serverItem : currentItem;
              }
              return currentItem;
            });
            
            // Add any new items from server that aren't in current state
            const currentIds = new Set(currentItems.map(item => item.id));
            const newItems = data?.filter(item => !currentIds.has(item.id)) || [];
            
            return [...updatedItems, ...newItems];
          });
        } else {
          // Full replace (original behavior)
          setLineItems(data || []);
        }
      } else if (lineItemsResult.status === 'rejected') {
        console.error('Failed to fetch line items:', lineItemsResult.reason);
        setError('Failed to load line items');
      }
    } catch (error) {
      console.error('Error fetching line items:', error);
      console.error('Error details:', error);
      setError(error instanceof Error ? error.message : 'Failed to load line items');
    } finally {
      if (!smartMerge) {
        setIsLoading(false);
      }
    }
  };


  

  // Fetch vendors
  useEffect(() => {
    const fetchVendors = async () => {
      const { data, error } = await supabase.from('vendors').select('*').order('name');
      if (!error && data) setVendors(data);
    };
    fetchVendors();
  }, []);


  const filteredLineItems = useMemo(() => {
    let filtered = [...lineItems];

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(lineItem => lineItem.status === selectedStatus);
    }
    // Favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(lineItem => lineItem.favorite);
    }
    // Date added/updated filter
    if (selectedDateRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      if (selectedDateRange === '7d') cutoff.setDate(now.getDate() - 7);
      if (selectedDateRange === '30d') cutoff.setDate(now.getDate() - 30);
      filtered = filtered.filter(lineItem =>
        new Date(lineItem.updated_at || lineItem.created_at || '') >= cutoff
      );
    }
    // Vendor filter
    if (selectedVendorId !== 'all') {
      filtered = filtered.filter(lineItem => lineItem.vendor_id === selectedVendorId);
    }

    // Filter by cost_code_id (if not 'all')
    if (selectedTradeId !== 'all') {
      filtered = filtered.filter(lineItem => lineItem.cost_code_id === selectedTradeId);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(lineItem => {
        return (
          lineItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (lineItem.description && lineItem.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
    }

    // Apply quick filter based on cost code ranges
    if (quickFilter !== 'all') {
      filtered = filtered.filter(lineItem => {
        const costCode = trades.find(t => t.id === lineItem.cost_code_id);
        if (!costCode) return false;
        
        // Extract the numeric part of the cost code
        const codeNumber = parseInt(costCode.code.replace(/[^0-9]/g, ''));
        if (isNaN(codeNumber)) return false;
        
        switch (quickFilter) {
          case 'labor':
            return codeNumber >= 100 && codeNumber <= 199;
          case 'materials':
            return codeNumber >= 500 && codeNumber <= 599;
          case 'installation':
            return codeNumber >= 200 && codeNumber <= 299;
          case 'services':
            return (codeNumber >= 300 && codeNumber <= 399) || 
                   (codeNumber >= 600 && codeNumber <= 699);
          default:
            return true;
        }
      });
    }


    // Apply price filter
    if (minPrice !== '') {
      filtered = filtered.filter(lineItem => lineItem.price >= parseFloat(minPrice));
    }

    if (maxPrice !== '') {
      filtered = filtered.filter(lineItem => lineItem.price <= parseFloat(maxPrice));
    }

    // Apply unit filter
    if (selectedUnit !== 'any') {
      filtered = filtered.filter(lineItem => lineItem.unit.toLowerCase() === selectedUnit.toLowerCase());
    }

    // Sort by price
    return filtered.sort((a, b) => {
      if (priceSort === 'asc') {
        return a.price - b.price;
      } else {
        return b.price - a.price;
      }
    });
  }, [lineItems, selectedStatus, showFavoritesOnly, selectedDateRange, selectedVendorId, selectedTradeId, searchTerm, minPrice, maxPrice, selectedUnit, priceSort, quickFilter, trades]);
  
  // Group filtered line items by industry and then by cost code
  const groupedLineItems = useMemo(() => {
    const grouped = new Map<string, Map<string, { costCode: typeof trades[0], items: typeof filteredLineItems }>>(); 
    
    filteredLineItems.forEach(item => {
      // Find the cost code for this item to get industry info
      const costCode = trades.find(t => t.id === item.cost_code_id);
      if (!costCode) return;
      
      const industryName = costCode.industry?.name || 'Unknown Industry';
      const costCodeKey = `${costCode.code}_${costCode.name}`;
      
      // Initialize industry map if doesn't exist
      if (!grouped.has(industryName)) {
        grouped.set(industryName, new Map());
      }
      
      const industryGroup = grouped.get(industryName)!;
      
      // Initialize cost code group if doesn't exist
      if (!industryGroup.has(costCodeKey)) {
        industryGroup.set(costCodeKey, {
          costCode: costCode,
          items: []
        });
      }
      
      industryGroup.get(costCodeKey)!.items.push(item);
    });
    
    // Sort industries alphabetically and cost codes by code number
    const sortedMap = new Map<string, Map<string, { costCode: typeof trades[0], items: typeof filteredLineItems }>>();
    const sortedIndustries = [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b));
    
    sortedIndustries.forEach(([industryName, costCodes]) => {
      const sortedCostCodes = new Map(
        [...costCodes.entries()].sort(([, a], [, b]) => 
          a.costCode.code.localeCompare(b.costCode.code)
        )
      );
      sortedMap.set(industryName, sortedCostCodes);
    });
    
    return sortedMap;
  }, [filteredLineItems, trades]);

  useEffect(() => {
    localStorage.setItem('pricebook-condensed', String(condensed));
  }, [condensed]);

  // Auto-hide undo button after 30 seconds with countdown
  useEffect(() => {
    if (showUndo) {
      setUndoTimeLeft(30);
      
      // Update countdown every second
      const countdownInterval = setInterval(() => {
        setUndoTimeLeft(prev => {
          if (prev <= 1) {
            setShowUndo(false);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(countdownInterval);
    }
  }, [showUndo]);

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  // Handle pricing mode application
  const handleApplyPricingMode = async (modeId: string) => {
    if (!selectedOrg?.id) return;
    
    // Show preview modal
    setPendingModeId(modeId);
    setShowModePreview(true);
  };
  
  // Handle undo last pricing change
  const handleUndoPricing = async () => {
    if (!lastPricingOperation || !selectedOrg?.id) return;
    
    setShowUndo(false);
    setApplyingProgress({ 
      current: 0, 
      total: lastPricingOperation.previousPrices.length,
      action: 'undoing'
    });
    
    try {
      let successCount = 0;
      let failedCount = 0;
      
      // First, we need to check which items had overrides before
      const lineItemIds = lastPricingOperation.previousPrices.map(p => p.lineItemId);
      const { data: originalItems } = await supabase
        .from('line_items')
        .select('id, price')
        .in('id', lineItemIds);
      
      const originalPriceMap = new Map(originalItems?.map(item => [item.id, item.price]) || []);
      
      // Separate items that need overrides vs those that need deletion
      const itemsToRestore: typeof lastPricingOperation.previousPrices = [];
      const itemsToDelete: string[] = [];
      
      lastPricingOperation.previousPrices.forEach(prev => {
        const basePrice = originalPriceMap.get(prev.lineItemId);
        // If previous price equals base price, delete the override
        if (basePrice && Math.abs(basePrice - prev.price) < 0.01) {
          itemsToDelete.push(prev.lineItemId);
        } else {
          itemsToRestore.push(prev);
        }
      });
      
      // Delete overrides for items that should use base price
      if (itemsToDelete.length > 0) {
        const { error } = await supabase
          .from('line_item_overrides')
          .delete()
          .eq('organization_id', selectedOrg.id)
          .in('line_item_id', itemsToDelete);
        
        if (!error) {
          successCount += itemsToDelete.length;
        } else {
          failedCount += itemsToDelete.length;
        }
      }
      
      // Restore previous prices for items that had overrides
      const batchSize = 50;
      for (let i = 0; i < itemsToRestore.length; i += batchSize) {
        const batch = itemsToRestore.slice(i, i + batchSize);
        
        const overrides = batch.map(item => ({
          organization_id: selectedOrg.id,
          line_item_id: item.lineItemId,
          custom_price: item.price,
          updated_at: new Date().toISOString()
        }));
        
        const { error } = await supabase
          .from('line_item_overrides')
          .upsert(overrides, {
            onConflict: 'organization_id,line_item_id'
          });
        
        if (error) {
          console.error('Error restoring prices:', error);
          failedCount += batch.length;
        } else {
          successCount += batch.length;
        }
        
        setApplyingProgress({ 
          current: itemsToDelete.length + i + batch.length, 
          total: lastPricingOperation.previousPrices.length,
          action: 'undoing'
        });
      }
      
      setApplyingProgress(null);
      
      if (successCount > 0) {
        console.log(`Successfully restored ${successCount} items to previous prices`);
        setLastPricingOperation(null);
        
        // Show success message
        if (failedCount > 0) {
          setShowSuccess({
            message: `Restored ${successCount} items. ${failedCount} items failed.`,
            itemCount: successCount
          });
        } else {
          setShowSuccess({
            message: 'Successfully undid pricing changes',
            itemCount: successCount
          });
        }
        
        // Refresh the list
        fetchLineItems(true);
      } else {
        alert('Failed to undo pricing changes. Please try again.');
      }
    } catch (error) {
      console.error('Error undoing pricing change:', error);
      alert('Failed to undo pricing change. Please try again.');
      setApplyingProgress(null);
    }
  };

  const handleConfirmPricingMode = async () => {
    if (!selectedOrg?.id || !pendingModeId || !selectedMode) return;
    
    // Close modal immediately for snappy feel
    setShowModePreview(false);
    
    // Optimistically update the UI
    const updatedItems = lineItems.map(item => {
      // Skip items that aren't selected (when specific items are selected)
      if (selectedLineItemIds.length > 0 && !selectedLineItemIds.includes(item.id)) {
        return item;
      }
      
      // For Reset to Baseline, only process items with overrides
      if (selectedMode.name === 'Reset to Baseline' && !item.has_override) {
        return item;
      }
      
      // Apply the mode's adjustments optimistically
      // Determine category from cost code number
      let category = 'all';
      if (item.cost_code?.code) {
        const codeNumber = parseInt(item.cost_code.code.replace(/[^0-9]/g, ''));
        if (!isNaN(codeNumber)) {
          if (codeNumber >= 100 && codeNumber <= 199) category = 'labor';
          else if (codeNumber >= 500 && codeNumber <= 599) category = 'materials';
          else if (codeNumber >= 200 && codeNumber <= 299) category = 'installation';
          else if ((codeNumber >= 300 && codeNumber <= 399) || (codeNumber >= 600 && codeNumber <= 699)) category = 'services';
          else if (codeNumber >= 400 && codeNumber <= 499) category = 'equipment';
          else if (codeNumber >= 700 && codeNumber <= 799) category = 'subcontractor';
        }
      }
      const multiplier = selectedMode.adjustments[category] || selectedMode.adjustments.all || 1;
      const newPrice = selectedMode.name === 'Reset to Baseline' 
        ? item.base_price || item.price 
        : (item.base_price || item.price) * multiplier;
      
      // For Reset to Baseline, remove override entirely
      if (selectedMode.name === 'Reset to Baseline') {
        return {
          ...item,
          price: item.base_price || item.price,
          applied_mode_name: undefined,
          applied_mode_id: undefined,
          has_override: false
        };
      }
      
      // For other modes, ensure we have base_price for ratio calculations
      // Don't set applied_mode_name - let the ratio-based rendering handle it
      return {
        ...item,
        price: newPrice,
        base_price: item.base_price || item.price, // Ensure base_price is set
        has_override: true
      };
    });
    
    // Update UI immediately
    setLineItems(updatedItems);
    setSelectedLineItemIds([]);
    
    try {
      const itemsToUpdate = selectedLineItemIds.length > 0 ? selectedLineItemIds : undefined;
      
      // Show progress for large operations
      let progressMessage = '';
      if (updatedItems.length > 100) {
        // TODO: Add progress toast notification here
      }
      
      const result = await PricingModesService.applyModeWithErrorHandling(
        selectedOrg.id,
        pendingModeId,
        itemsToUpdate,
        (current, total) => {
          // Update progress state
          setApplyingProgress({ current, total, action: 'applying' });
        }
      );
      
      // Clear progress
      setApplyingProgress(null);
      
      // Show success/error message
      if (result.failedCount > 0) {
        console.error(`Failed to update ${result.failedCount} items:`, result.failedItems);
        // Show error with partial success
        setShowSuccess({
          message: `Updated ${result.successCount} items. ${result.failedCount} items failed.`,
          itemCount: result.successCount
        });
      } else {
        console.log(`Successfully applied pricing mode to ${result.successCount} items`);
        
        // Show success confirmation
        setShowSuccess({
          message: `Successfully applied "${selectedMode.name}" pricing`,
          itemCount: result.successCount
        });
        
        // Track successful operation for undo
        if (result.successCount > 0 && selectedMode) {
          // Store previous prices for undo
          const previousPrices = lineItems
            .filter(item => 
              itemsToUpdate ? itemsToUpdate.includes(item.id) : true
            )
            .map(item => ({
              lineItemId: item.id,
              price: item.price
            }));
            
          setLastPricingOperation({
            modeId: pendingModeId,
            modeName: selectedMode.name,
            lineItemIds: itemsToUpdate || [],
            previousPrices,
            timestamp: Date.now()
          });
          setShowUndo(true);
        }
      }
      
      // Silently refresh in background with smart merge to avoid flicker
      fetchLineItems(true);
      
    } catch (error) {
      console.error('Error applying pricing mode:', error);
      // On error, revert to original state
      await fetchLineItems(false);
      alert('Failed to apply pricing mode. Please try again.');
    } finally {
      setPendingModeId(null);
    }
  };

  return (
    <div className="bg-transparent border border-[#333333] border-t-0 relative">
      {/* Progress Overlay */}
      {applyingProgress && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-[#1E1E1E] border border-[#333333] p-6 shadow-xl">
            <h3 className="text-white font-medium mb-4">
              {applyingProgress.action === 'undoing' ? 'Reverting Prices' : 'Applying Pricing Changes'}
            </h3>
            <div className="w-64 mb-2">
              <div className="bg-[#333333] rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-[#336699] h-full transition-all duration-300"
                  style={{ width: `${(applyingProgress.current / applyingProgress.total) * 100}%` }}
                />
              </div>
            </div>
            <p className="text-sm text-gray-400 text-center">
              {applyingProgress.action === 'undoing' 
                ? `Reverting ${applyingProgress.current} of ${applyingProgress.total} items` 
                : `Updating ${applyingProgress.current} of ${applyingProgress.total} items`}
            </p>
            {applyingProgress.total > 100 && (
              <p className="text-xs text-gray-500 text-center mt-2">
                Processing {applyingProgress.total} items - this may take a moment
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Success Confirmation */}
      {showSuccess && !applyingProgress && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-[#1E1E1E] border border-green-600 p-6 shadow-xl pointer-events-auto">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-white font-medium mb-2 text-center">{showSuccess.message}</h3>
            <p className="text-sm text-gray-400 text-center">{showSuccess.itemCount} items updated</p>
          </div>
        </div>
      )}




      {/* Pricing Mode Selector */}
      {selectedLineItemIds.length > 0 && (
        <div className="border-t border-[#333333] px-6 py-3 bg-[#1A1A1A]">
          <PricingModeSelector
            onModeChange={setSelectedMode}
            selectedLineItemCount={selectedLineItemIds.length}
            onApplyMode={handleApplyPricingMode}
          />
        </div>
      )}
      
      {/* Undo Button */}
      {showUndo && lastPricingOperation && selectedLineItemIds.length === 0 && (
        <div className="border-t border-[#333333] px-6 py-3 bg-[#1A1A1A] flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Applied "{lastPricingOperation.modeName}" to {lastPricingOperation.lineItemIds.length || 'all'} items
          </div>
          <div className="flex items-center gap-3">
            <div className={`text-sm font-medium ${undoTimeLeft <= 10 ? 'text-orange-400' : 'text-gray-400'}`}>
              {undoTimeLeft}s
            </div>
            <button
              onClick={handleUndoPricing}
              className={`px-4 py-2 text-white text-sm transition-all flex items-center gap-2 font-medium ${
                undoTimeLeft <= 10 
                  ? 'bg-orange-600 hover:bg-orange-700 border-orange-600 animate-pulse' 
                  : 'bg-[#336699] hover:bg-[#336699]/80 border-[#336699]'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Undo Changes
            </button>
          </div>
        </div>
      )}

      {/* Table Controls */}
      <div className="border-t border-[#333333] px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Filters */}
          <div className="flex items-center gap-3">
            <select
              className="bg-[#1E1E1E] border border-[#333333] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#336699]"
              value={selectedTradeId}
              onChange={(e) => setSelectedTradeId(e.target.value)}
            >
              <option value="all" className="bg-[#1E1E1E] text-white">All Cost Codes ({lineItems.length})</option>
              {Array.from(groupedTrades.entries()).map(([industryName, codes]) => (
                <optgroup 
                  key={industryName} 
                  label={`━━━  ${industryName.toUpperCase()}  ━━━`}
                  className="bg-[#1E1E1E] text-gray-400 font-bold"
                >
                  {codes.map(trade => (
                    <option 
                      key={trade.id} 
                      value={trade.id} 
                      className="bg-[#1E1E1E] text-white pl-4"
                    >
                      {trade.code} — {trade.name} ({lineItems.filter(item => item.cost_code_id === trade.id).length})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <div className="relative" ref={filterMenuRef}>
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="bg-[#1E1E1E] border border-[#333333] px-3 py-2 text-sm text-white hover:bg-[#333333] transition-colors flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                More Filters
              </button>

              {showFilterMenu && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-[#1E1E1E] border border-[#333333] shadow-lg z-[9999] p-3">
                  <div className="space-y-3">

                    {/* Status Filter */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                        Status
                      </label>
                      <select
                        className="w-full bg-[#333333] border border-[#555555] px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-[#336699]"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>

                    {/* Price Range Filter */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                        Price Range
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          className="w-full bg-[#333333] border border-[#555555] px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-[#336699]"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          className="w-full bg-[#333333] border border-[#555555] px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-[#336699]"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Vendor Filter */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                        Vendor
                      </label>
                      <select
                        className="w-full bg-[#333333] border border-[#555555] px-2.5 py-1.5 text-sm text-white focus:outline-none focus:border-[#336699]"
                        value={selectedVendorId}
                        onChange={(e) => setSelectedVendorId(e.target.value)}
                      >
                        <option value="all">All Vendors</option>
                        {vendors.map(vendor => (
                          <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Favorites Toggle */}
                    <div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={showFavoritesOnly}
                          onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                          className="form-checkbox h-4 w-4 text-[#336699] bg-[#333333] border-[#555555] focus:ring-[#336699]"
                        />
                        <span className="text-sm text-white">Show favorites only</span>
                      </label>
                    </div>

                    {/* Clear Filters */}
                    <div className="pt-2 border-t border-[#333333]">
                      <button
                        onClick={() => {
                          setSelectedStatus('all');
                          setSelectedTradeId('all');
                          setSelectedVendorId('all');
                          setMinPrice('');
                          setMaxPrice('');
                          setShowFavoritesOnly(false);
                          setSelectedDateRange('all');
                          setShowFilterMenu(false);
                        }}
                        className="w-full bg-[#333333] hover:bg-[#404040] text-white py-1.5 px-2.5 text-sm font-medium transition-colors"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side - View options */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCondensed(!condensed)}
              className="bg-[#1E1E1E] border border-[#333333] p-2 text-white hover:bg-[#333333] transition-colors"
              title="Toggle compact view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            
            <div className="relative" ref={optionsMenuRef}>
              <button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="bg-[#1E1E1E] border border-[#333333] p-2 text-white hover:bg-[#333333] transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {showOptionsMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#1E1E1E] border border-[#333333] shadow-lg z-[9999] py-2">
                  <button
                    onClick={handleImportItems}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#333333] flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Import Items
                  </button>
                  <div className="border-t border-[#333333] my-1" />
                  <button
                    onClick={handleExportToCSV}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#333333] flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Export to CSV
                  </button>
                  <button
                    onClick={handleExportToExcel}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#333333] flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Export to Excel
                  </button>
                  <div className="border-t border-[#333333] my-1" />
                  <button
                    onClick={handlePrintPriceBook}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#333333] flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Print Cost Codes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table Column Headers */}
      <div className="border-t border-[#333333] px-6 py-3 bg-[#1E1E1E]/50">
        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-400 uppercase tracking-wider items-center">
          <div className="col-span-1 flex items-center">
            <input
              type="checkbox"
              checked={selectedLineItemIds.length === filteredLineItems.length && filteredLineItems.length > 0}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedLineItemIds(filteredLineItems.map(item => item.id));
                } else {
                  setSelectedLineItemIds([]);
                }
              }}
              className="w-4 h-4 rounded bg-[#333333] border-[#555555] text-[#336699] focus:ring-[#336699] focus:ring-offset-0"
            />
          </div>
          <div className="col-span-6">
            <span>ITEM</span>
          </div>
          <div className="col-span-2 text-right">PRICE</div>
          <div className="col-span-2">STRATEGY</div>
          <div className="col-span-1 text-right"></div>
        </div>
      </div>
      
      {/* Table Content */}
      <div className="border-t border-[#333333]">
        {(isLoading || isLoadingCostCodes) ? (
          <div className="animate-pulse">
            {/* Industry Header Skeleton */}
            <div className="px-6 py-3 bg-[#1A1A1A] border-y border-[#333333]">
              <div className="h-4 bg-[#333333] rounded w-48 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#444444] to-transparent"></div>
              </div>
            </div>
            
            {/* Cost Code Header Skeleton */}
            <div className="px-6 py-2.5 bg-[#252525] border-y border-[#333333]/40">
              <div className="flex items-center gap-3">
                <div className="h-4 bg-[#336699]/30 rounded w-16 relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#336699]/50 to-transparent"></div>
                </div>
                <div className="h-4 bg-[#333333] rounded w-32 relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#444444] to-transparent"></div>
                </div>
                <div className="h-3 bg-[#333333] rounded w-20 relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#444444] to-transparent"></div>
                </div>
              </div>
            </div>
            
            {/* Line Items Skeleton */}
            <div className="border-l-2 border-[#336699]/20 ml-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="grid grid-cols-12 gap-4 px-6 py-3 items-center border-b border-[#333333]/20">
                  <div className="col-span-1">
                    <div className="w-4 h-4 bg-[#333333] rounded relative overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#444444] to-transparent"></div>
                    </div>
                  </div>
                  <div className="col-span-6">
                    <div className="h-4 bg-[#333333] rounded w-48 mb-1 relative overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#444444] to-transparent"></div>
                    </div>
                    <div className="h-3 bg-[#333333] rounded w-32 relative overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#444444] to-transparent"></div>
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <div className="h-5 bg-[#333333] rounded w-20 ml-auto relative overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#444444] to-transparent"></div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="h-6 bg-[#333333] rounded-full w-24 relative overflow-hidden">
                      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#444444] to-transparent"></div>
                    </div>
                  </div>
                  <div className="col-span-1"></div>
                </div>
              ))}
            </div>
            
            {/* Second Industry Skeleton */}
            <div className="mt-4">
              <div className="px-6 py-3 bg-[#1A1A1A] border-y border-[#333333]">
                <div className="h-4 bg-[#333333] rounded w-56 relative overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#444444] to-transparent"></div>
                </div>
              </div>
              
              <div className="px-6 py-2.5 bg-[#252525] border-y border-[#333333]/40">
                <div className="flex items-center gap-3">
                  <div className="h-4 bg-[#336699]/30 rounded w-16 relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#336699]/50 to-transparent"></div>
                  </div>
                  <div className="h-4 bg-[#333333] rounded w-40 relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#444444] to-transparent"></div>
                  </div>
                  <div className="h-3 bg-[#333333] rounded w-20 relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#444444] to-transparent"></div>
                  </div>
                </div>
              </div>
              
              <div className="border-l-2 border-[#336699]/20 ml-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 px-6 py-3 items-center border-b border-[#333333]/20">
                    <div className="col-span-1">
                      <div className="w-4 h-4 bg-[#333333] rounded relative overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#444444] to-transparent"></div>
                      </div>
                    </div>
                    <div className="col-span-6">
                      <div className="h-4 bg-[#333333] rounded w-56 mb-1 relative overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#444444] to-transparent"></div>
                      </div>
                      <div className="h-3 bg-[#333333] rounded w-24 relative overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#444444] to-transparent"></div>
                      </div>
                    </div>
                    <div className="col-span-2 text-right">
                      <div className="h-5 bg-[#333333] rounded w-24 ml-auto relative overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#444444] to-transparent"></div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="h-6 bg-[#333333] rounded-full w-28 relative overflow-hidden">
                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-[#444444] to-transparent"></div>
                      </div>
                    </div>
                    <div className="col-span-1"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <span className="text-red-400 text-2xl">⚠</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Error Loading Cost Codes</h3>
            <p className="text-gray-400 mb-6 max-w-md">{error}</p>
            <button
              onClick={() => fetchLineItems()}
              className="bg-white hover:bg-gray-100 text-black px-6 py-3 rounded-[8px] font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredLineItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-[#333333] rounded-full flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No cost code items yet</h3>
          <p className="text-gray-400 mb-6 max-w-md">
            Start building your cost codes by adding materials, labor, and services. This will help you create accurate estimates and invoices.
          </p>
          <button
            onClick={() => setShowNewLineItemModal(true)}
              className="bg-white hover:bg-gray-100 text-[#121212] px-6 py-3 rounded-[4px] font-medium transition-colors"
          >
            Add Your First Item
          </button>
        </div>
      ) : (
          <div>
          {Array.from(groupedLineItems.entries()).map(([industryName, costCodeGroups]) => {
            // Calculate total items for this industry
            const totalIndustryItems = Array.from(costCodeGroups.values())
              .reduce((sum, group) => sum + group.items.length, 0);
            
            return (
              <div key={industryName}>
                {/* Industry Header */}
                <div className="px-6 py-3 bg-[#1A1A1A] border-y border-[#333333] sticky top-0 z-10">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
                      ——— {industryName} ———
                    </h3>
                    <span className="text-xs text-gray-500">({totalIndustryItems} items)</span>
                  </div>
                </div>
                
                {/* Cost Code Groups */}
                {Array.from(costCodeGroups.entries()).map(([costCodeKey, { costCode, items }]) => (
                  <div key={costCodeKey}>
                    {/* Cost Code Sub-header */}
                    <div className="px-6 py-2.5 bg-[#252525] border-y border-[#333333]/40">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-medium text-[#336699]">{costCode.code}</span>
                          <span className="text-sm font-medium text-gray-200">{costCode.name}</span>
                          <span className="text-xs text-gray-500">({items.length} items)</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Line Items for this Cost Code */}
                    <div className="border-l-2 border-[#336699]/20 ml-6">
                    {items.map((lineItem, index) => (
            <div
              key={lineItem.id}
                className={`grid grid-cols-12 gap-4 px-6 ${condensed ? 'py-2' : 'py-3'} items-center hover:bg-[#1A1A1A] transition-colors group relative ${index < items.length - 1 ? 'border-b border-[#333333]/20' : ''}`}
              >
                {/* Checkbox Column */}
                <div className="col-span-1 flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedLineItemIds.includes(lineItem.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (e.target.checked) {
                        setSelectedLineItemIds([...selectedLineItemIds, lineItem.id]);
                      } else {
                        setSelectedLineItemIds(selectedLineItemIds.filter(id => id !== lineItem.id));
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded bg-[#333333] border-[#555555] text-[#336699] focus:ring-[#336699] focus:ring-offset-0"
                  />
                </div>
                
                {/* Item Column */}
                <div className="col-span-6">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className={`font-medium text-gray-100 truncate ${condensed ? 'text-sm' : ''}`}>{lineItem.name}</div>
                      </div>
                      {!condensed && lineItem.description && (
                        <div className="text-xs text-gray-400 truncate mt-0.5">{lineItem.description}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price Column */}
                <div className="col-span-2 text-right">
                  <div className="flex flex-col items-end">
                    <span className={`font-mono font-semibold ${condensed ? 'text-sm' : 'text-base'} text-gray-100 ${
                      recentlyUpdatedId === lineItem.id ? 'price-updated' : ''
                    }`}>
                      {formatCurrency(lineItem.price)}
                    </span>
                    {!condensed && (
                      <span className="text-xs text-gray-400 capitalize mt-0.5">{lineItem.unit}</span>
                    )}
                  </div>
                </div>

                {/* Strategy Column */}
                <div className="col-span-2">
                  {lineItem.has_override && (() => {
                    // If we're in preview mode and this item is selected, show the mode being previewed
                    if (showModePreview && selectedLineItemIds.includes(lineItem.id) && selectedMode) {
                      let bgColor = 'bg-blue-500/20';
                      let textColor = 'text-blue-400';
                      
                      switch (selectedMode.name) {
                        case 'Hail Mary':
                          bgColor = 'bg-red-500/20';
                          textColor = 'text-red-400';
                          break;
                        case 'Rush Job':
                          bgColor = 'bg-orange-500/20';
                          textColor = 'text-orange-400';
                          break;
                        case 'Premium Service':
                          bgColor = 'bg-purple-500/20';
                          textColor = 'text-purple-400';
                          break;
                        case 'Busy Season':
                          bgColor = 'bg-yellow-500/20';
                          textColor = 'text-yellow-400';
                          break;
                        case 'Market Rate':
                          bgColor = 'bg-gray-500/20';
                          textColor = 'text-gray-400';
                          break;
                        case 'Competitive':
                          bgColor = 'bg-blue-500/20';
                          textColor = 'text-blue-400';
                          break;
                        case 'Slow Season':
                          bgColor = 'bg-cyan-500/20';
                          textColor = 'text-cyan-400';
                          break;
                        case 'Need This Job':
                          bgColor = 'bg-green-500/20';
                          textColor = 'text-green-400';
                          break;
                      }
                      
                      return (
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${bgColor} ${textColor}`}>
                          {selectedMode.name}
                        </span>
                      );
                    }
                    
                    // If we have an applied mode name, use it directly
                    if (lineItem.applied_mode_name) {
                      let bgColor = 'bg-blue-500/20';
                      let textColor = 'text-blue-400';
                      
                      switch (lineItem.applied_mode_name) {
                        case 'Hail Mary':
                          bgColor = 'bg-red-500/20';
                          textColor = 'text-red-400';
                          break;
                        case 'Rush Job':
                          bgColor = 'bg-orange-500/20';
                          textColor = 'text-orange-400';
                          break;
                        case 'Premium Service':
                          bgColor = 'bg-purple-500/20';
                          textColor = 'text-purple-400';
                          break;
                        case 'Busy Season':
                          bgColor = 'bg-yellow-500/20';
                          textColor = 'text-yellow-400';
                          break;
                        case 'Market Rate':
                          bgColor = 'bg-gray-500/20';
                          textColor = 'text-gray-400';
                          break;
                        case 'Competitive':
                          bgColor = 'bg-blue-500/20';
                          textColor = 'text-blue-400';
                          break;
                        case 'Slow Season':
                          bgColor = 'bg-cyan-500/20';
                          textColor = 'text-cyan-400';
                          break;
                        case 'Need This Job':
                          bgColor = 'bg-green-500/20';
                          textColor = 'text-green-400';
                          break;
                      }
                      
                      return (
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${bgColor} ${textColor}`}>
                          {lineItem.applied_mode_name}
                        </span>
                      );
                    }
                    
                    // Fallback to ratio-based calculation for items without applied_mode_name
                    const basePrice = lineItem.base_price || 0;
                    const currentPrice = lineItem.price;
                    if (basePrice === 0) return null;
                    
                    const ratio = currentPrice / basePrice;
                    let label = 'custom';
                    let bgColor = 'bg-blue-500/20';
                    let textColor = 'text-blue-400';
                    
                    // Determine which pricing mode this falls into based on ratio
                    // Match our actual pricing modes
                    if (ratio >= 9.5) {
                      label = 'Hail Mary';
                      bgColor = 'bg-red-500/20';
                      textColor = 'text-red-400';
                    } else if (ratio >= 1.75) {
                      label = 'Rush Job';
                      bgColor = 'bg-orange-500/20';
                      textColor = 'text-orange-400';
                    } else if (ratio >= 1.45) {
                      label = 'Premium Service';
                      bgColor = 'bg-purple-500/20';
                      textColor = 'text-purple-400';
                    } else if (ratio >= 1.15) {
                      label = 'Busy Season';
                      bgColor = 'bg-yellow-500/20';
                      textColor = 'text-yellow-400';
                    } else if (ratio >= 0.97 && ratio <= 1.03) {
                      label = 'Market Rate';
                      bgColor = 'bg-gray-500/20';
                      textColor = 'text-gray-400';
                    } else if (ratio >= 0.93) {
                      label = 'Competitive';
                      bgColor = 'bg-blue-500/20';
                      textColor = 'text-blue-400';
                    } else if (ratio >= 0.87) {
                      label = 'Slow Season';
                      bgColor = 'bg-cyan-500/20';
                      textColor = 'text-cyan-400';
                    } else if (ratio >= 0.82) {
                      label = 'Need This Job';
                      bgColor = 'bg-green-500/20';
                      textColor = 'text-green-400';
                    } else {
                      label = `${Math.round((1 - ratio) * 100)}% off`;
                      bgColor = 'bg-red-500/20';
                      textColor = 'text-red-400';
                    }
                    
                    return (
                      <span className={`text-xs px-1.5 py-0.5 rounded whitespace-nowrap ${bgColor} ${textColor}`}>
                        {label}
                      </span>
                    );
                  })()}
                </div>

                {/* Actions Column */}
                <div className="col-span-1 text-right relative">
                  <button
                  onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    
                    if (activeDropdown === lineItem.id) {
                      setActiveDropdown(null);
                    } else {
                      setActiveDropdown(lineItem.id);
                    }
                  }}
                    className="opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-gray-600 rounded"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                {/* Dropdown Menu */}
                {activeDropdown === lineItem.id && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 top-8 w-52 bg-[#1E1E1E] border border-[#333333] shadow-lg z-50 py-1"
                  >
                  {/* Edit option - different text based on ownership */}
                  <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditLineItem(lineItem);
                        setActiveDropdown(null);
                      }}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-100 hover:bg-[#333333] transition-colors whitespace-nowrap"
                    >
                      <Edit3 className="w-4 h-4 mr-3 text-gray-400" />
                      {lineItem.organization_id ? 'Edit Item' : 'Edit Price'}
                  </button>
                  
                  {/* Reset Price - only for shared items with overrides */}
                  {!lineItem.organization_id && lineItem.has_override && (
                    <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (confirm('Reset to industry standard price?')) {
                            try {
                              await LineItemService.removeOverridePrice(lineItem.id, selectedOrg?.id || '');
                              await fetchLineItems();
                            } catch (error) {
                              console.error('Error resetting price:', error);
                            }
                          }
                          setActiveDropdown(null);
                        }}
                          className="w-full flex items-center px-3 py-2 text-sm text-gray-100 hover:bg-[#333333] transition-colors whitespace-nowrap"
                      >
                        <DollarSign className="w-4 h-4 mr-3 text-gray-400" />
                        Reset to Standard Price
                    </button>
                  )}
                    
                  <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateLineItem(lineItem);
                      }}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-100 hover:bg-[#333333] transition-colors whitespace-nowrap"
                  >
                      <Copy className="w-4 h-4 mr-3 text-gray-400" />
                      Duplicate
                  </button>
                    
                  {/* Options only for owned items */}
                  {lineItem.organization_id && (
                    <>
                      <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(lineItem);
                          }}
                            className="w-full flex items-center px-3 py-2 text-sm text-gray-100 hover:bg-[#333333] transition-colors whitespace-nowrap"
                      >
                          <Star className={`w-4 h-4 mr-3 ${lineItem.favorite ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
                          {lineItem.favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                      </button>
                      
                      <div className="border-t border-[#333333] my-1" />
                      
                      <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLineItem(lineItem);
                          }}
                          className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-[#333333] transition-colors"
                      >
                          <Trash2 className="w-4 h-4 mr-3 text-red-400" />
                          Delete
                      </button>
                    </>
                  )}
                </div>
                )}
              </div>
            </div>
          ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* Create Line Item Modal */}
      <Modal
        isOpen={showNewLineItemModal}
          onClose={() => setShowNewLineItemModal(false)}
        title="Add Line Item"
        size="md"
      >
        <LineItemForm
          onSubmit={async (data) => {
            await LineItemService.create({
              name: data.name,
              description: data.description,
              price: data.price,
              unit: data.unit,
              cost_code_id: data.cost_code_id || undefined,
              user_id: user?.id || '',
              organization_id: selectedOrg?.id || '',
              status: 'published',
              favorite: false
            });
            
            setShowNewLineItemModal(false);
            await fetchLineItems();
          }}
          onCancel={() => setShowNewLineItemModal(false)}
          submitLabel="Add Item"
        />
      </Modal>

      {/* Edit Line Item Drawer */}
      <SlideOutDrawer
        isOpen={showEditLineItemModal}
          onClose={() => {
            setShowEditLineItemModal(false);
            setEditingLineItem(null);
          }}
        title="Edit Line Item"
        width="md"
      >
        {editingLineItem && (
          <LineItemForm
            onSubmit={async (data) => {
              await handleSaveEdit({
                name: data.name,
                description: data.description,
                price: data.price,
                unit: data.unit,
                cost_code_id: data.cost_code_id || editingLineItem.cost_code_id
              });
            }}
            onCancel={() => {
              setShowEditLineItemModal(false);
              setEditingLineItem(null);
            }}
            initialData={editingLineItem}
            submitLabel="Save Changes"
          />
        )}
      </SlideOutDrawer>

      {/* Pricing Mode Preview Modal */}
      {pendingModeId && selectedMode && (
        <PricingModePreviewModal
          isOpen={showModePreview}
          onClose={() => {
            setShowModePreview(false);
            setPendingModeId(null);
          }}
          mode={selectedMode}
          organizationId={selectedOrg?.id || ''}
          lineItemIds={selectedLineItemIds.length > 0 ? selectedLineItemIds : undefined}
          onConfirm={handleConfirmPricingMode}
        />
      )}

      </div>
  );
};

export default PriceBook;