import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Send, Download, Share2, Trash2,
  CheckCircle, XCircle, FileText, User,
  Phone, Mail, MapPin, Copy, Eye, Calendar
} from 'lucide-react';
import { EstimateService, Estimate } from '../../services/EstimateService';
import { formatCurrency } from '../../utils/format';
import { ProjectSelectionModal } from './ProjectSelectionModal';
import { ProjectCreationModal } from '../ProjectCreationModal';
import { CreateEstimateDrawer } from './CreateEstimateDrawer';
import { MapModal } from '../common/MapModal';

export const EstimateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showInvoiceDropdown, setShowInvoiceDropdown] = useState(false);
  const [depositPercentage, setDepositPercentage] = useState(25);
  const [showProjectSelectionModal, setShowProjectSelectionModal] = useState(false);
  const [pendingInvoiceType, setPendingInvoiceType] = useState<'full' | 'deposit' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    if (!id) return;
    
    const fetchEstimate = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await EstimateService.getById(id);
        setEstimate(result);
      } catch (err) {
        console.error('Error fetching estimate:', err);
        setError('Failed to load estimate');
      } finally {
        setLoading(false);
      }
    };

    fetchEstimate();
  }, [id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showInvoiceDropdown) {
        const target = event.target as Element;
        if (!target.closest('.relative')) {
          setShowInvoiceDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showInvoiceDropdown]);

  const handleStatusUpdate = async (status: Estimate['status']) => {
    if (!estimate?.id) return;

    try {
      // If changing to 'sent', actually send the email
      if (status === 'sent' && estimate.client?.email) {
        const confirmed = confirm(`Send this estimate to ${estimate.client.email}?`);
        if (!confirmed) return;

        const result = await EstimateService.sendEstimate(estimate.id, estimate.client.email);
        
        if (!result.success) {
          alert(`Failed to send estimate: ${result.error}`);
          return;
        }
        
        alert('Estimate sent successfully!');
      } else {
        // Just update status without sending email
        await EstimateService.updateStatus(estimate.id, status);
      }
      
      // Reload estimate data
      const result = await EstimateService.getById(estimate.id);
      setEstimate(result);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update estimate status');
    }
  };

  const handleConvertToInvoice = async (useDeposit: boolean = false) => {
    if (!estimate?.id) return;
    
    // Check if estimate already has a project
    if (!estimate.project_id) {
      // Store the pending action and show project selection modal
      setPendingInvoiceType(useDeposit ? 'deposit' : 'full');
      setShowProjectSelectionModal(true);
    } else {
      // Estimate already has a project, proceed with conversion
      proceedWithInvoiceCreation(useDeposit);
    }
  };

  const proceedWithInvoiceCreation = async (useDeposit: boolean = false) => {
    if (!estimate?.id) return;

    if (useDeposit) {
      setShowDepositModal(true);
    } else {
      if (!confirm('Convert this estimate to a full invoice? This action cannot be undone.')) return;

      try {
        const invoiceId = await EstimateService.convertToInvoice(estimate.id);
        navigate(`/invoices/${invoiceId}`);
      } catch (error: any) {
        console.error('Error converting to invoice:', error);
        console.error('Error details:', error.message, error.details);
        alert('Failed to convert estimate to invoice: ' + (error.message || 'Unknown error'));
      }
    }
  };

  const handleProjectSelection = async (projectId: string | null) => {
    setShowProjectSelectionModal(false);
    
    if (projectId === 'CREATE_NEW') {
      // Show create project modal
      setShowProjectSelectionModal(true);
      return;
    }

    // Update estimate with selected project (if any)
    if (projectId && estimate?.id) {
      try {
        await EstimateService.update(estimate.id, { project_id: projectId });
        // Reload estimate to get updated data
        const result = await EstimateService.getById(estimate.id);
        setEstimate(result);
      } catch (error) {
        console.error('Error updating estimate with project:', error);
      }
    }

    // Continue with the pending invoice action
    if (pendingInvoiceType) {
      proceedWithInvoiceCreation(pendingInvoiceType === 'deposit');
      setPendingInvoiceType(null);
    }
  };

  const handleCreateDepositInvoice = async () => {
    if (!estimate?.id) return;

    try {
      const invoiceId = await EstimateService.convertToInvoice(estimate.id, depositPercentage);
      setShowDepositModal(false);
      navigate(`/invoices/${invoiceId}`);
    } catch (error: any) {
      console.error('Error creating deposit invoice:', error);
      console.error('Error details:', error.message, error.details);
      alert('Failed to create deposit invoice: ' + (error.message || 'Unknown error'));
    }
  };

  const handleProjectCreated = async (projectId: string) => {
    setShowProjectSelectionModal(false);
    
    // Update estimate with new project
    if (estimate?.id) {
      try {
        await EstimateService.update(estimate.id, { project_id: projectId });
        const result = await EstimateService.getById(estimate.id);
        setEstimate(result);
      } catch (error) {
        console.error('Error updating estimate with project:', error);
      }
    }

    // Continue with pending invoice action
    if (pendingInvoiceType) {
      proceedWithInvoiceCreation(pendingInvoiceType === 'deposit');
      setPendingInvoiceType(null);
    }
  };

  const handleDelete = async () => {
    if (!estimate?.id) return;
    
    if (!confirm('Are you sure you want to delete this estimate?')) return;

    try {
      await EstimateService.delete(estimate.id);
      navigate('/estimates');
    } catch (error) {
      console.error('Error deleting estimate:', error);
    }
  };

  const handleCopyShareLink = async () => {
    if (!estimate?.id) return;
    
    const shareUrl = `${window.location.origin}/share/estimate/${estimate.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      // You could add a toast notification here
      alert('Share link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Share link copied to clipboard!');
    }
  };

  const handleEditSave = async (data: any) => {
    if (!estimate?.id) return;
    
    try {
      await EstimateService.update(estimate.id, data);
      // Reload estimate data
      const result = await EstimateService.getById(estimate.id);
      setEstimate(result);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating estimate:', error);
      alert('Failed to update estimate');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] text-white">
        {/* Header Skeleton */}
        <div className="border-b border-[#333333] px-6 py-4">
          {/* Row 1: Navigation + Document Info */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-[#333333] rounded animate-pulse"></div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-6 bg-[#333333] rounded animate-pulse"></div>
                <div className="w-20 h-5 bg-[#333333] rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-28 h-9 bg-[#333333] rounded-lg animate-pulse"></div>
              <div className="w-20 h-9 bg-[#333333] rounded-lg animate-pulse"></div>
              <div className="w-16 h-9 bg-[#333333] rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Row 2: Client Information */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="w-48 h-5 bg-[#333333] rounded animate-pulse"></div>
              <div className="w-32 h-4 bg-[#333333] rounded animate-pulse"></div>
            </div>
            <div className="w-24 h-5 bg-[#333333] rounded animate-pulse"></div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Mobile: Total amount card skeleton */}
          <div className="md:hidden bg-[#1a1a1a] rounded-lg border border-[#333] p-4 mb-6">
            <div className="flex justify-between items-center">
              <div className="w-24 h-4 bg-[#333333] rounded animate-pulse"></div>
              <div className="w-32 h-6 bg-[#333333] rounded animate-pulse"></div>
            </div>
          </div>

          {/* Client & Project Info Section - 2 Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Client Information Card */}
            <div className="bg-[#1a1a1a] rounded-lg border border-[#333] p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-[#333333] rounded animate-pulse"></div>
                <div className="w-32 h-5 bg-[#333333] rounded animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="w-40 h-4 bg-[#333333] rounded animate-pulse"></div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#333333] rounded animate-pulse"></div>
                  <div className="w-36 h-4 bg-[#333333] rounded animate-pulse"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#333333] rounded animate-pulse"></div>
                  <div className="w-32 h-4 bg-[#333333] rounded animate-pulse"></div>
                </div>
                <div className="flex items-start gap-2 p-2 rounded-lg">
                  <div className="w-4 h-4 bg-[#333333] rounded animate-pulse mt-0.5"></div>
                  <div className="flex-1">
                    <div className="w-48 h-4 bg-[#333333] rounded animate-pulse mb-1"></div>
                    <div className="w-28 h-3 bg-[#333333] rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estimate Details Card */}
            <div className="bg-[#1a1a1a] rounded-lg border border-[#333] p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-[#333333] rounded animate-pulse"></div>
                <div className="w-28 h-5 bg-[#333333] rounded animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <div className="w-20 h-4 bg-[#333333] rounded animate-pulse"></div>
                  <div className="w-24 h-4 bg-[#333333] rounded animate-pulse"></div>
                </div>
                <div className="flex justify-between">
                  <div className="w-16 h-4 bg-[#333333] rounded animate-pulse"></div>
                  <div className="w-24 h-4 bg-[#333333] rounded animate-pulse"></div>
                </div>
                <div className="flex justify-between">
                  <div className="w-18 h-4 bg-[#333333] rounded animate-pulse"></div>
                  <div className="w-20 h-4 bg-[#333333] rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area - Single Column */}
          <div className="space-y-6">
            {/* Cost Breakdown Card */}
            <div className="bg-[#1a1a1a] rounded-lg border border-[#333] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#333]">
                <div className="w-48 h-5 bg-[#333333] rounded animate-pulse"></div>
              </div>
              <div className="p-6 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center py-1.5">
                    <div className="w-24 h-4 bg-[#333333] rounded animate-pulse"></div>
                    <div className="w-20 h-4 bg-[#333333] rounded animate-pulse"></div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-[#555]">
                  <div className="w-16 h-4 bg-[#333333] rounded animate-pulse"></div>
                  <div className="w-24 h-4 bg-[#333333] rounded animate-pulse"></div>
                </div>
                <div className="flex justify-between items-center py-1">
                  <div className="w-20 h-4 bg-[#333333] rounded animate-pulse"></div>
                  <div className="w-20 h-4 bg-[#333333] rounded animate-pulse"></div>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-[#555]">
                  <div className="w-12 h-4 bg-[#333333] rounded animate-pulse"></div>
                  <div className="w-24 h-4 bg-[#333333] rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Line Items Card */}
            <div className="bg-[#1a1a1a] rounded-lg border border-[#333] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#333]">
                <div className="w-20 h-5 bg-[#333333] rounded animate-pulse"></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0a0a0a]">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <div className="w-20 h-3 bg-[#333333] rounded animate-pulse"></div>
                      </th>
                      <th className="px-3 py-3 text-center">
                        <div className="w-8 h-3 bg-[#333333] rounded animate-pulse mx-auto"></div>
                      </th>
                      <th className="px-3 py-3 text-right">
                        <div className="w-16 h-3 bg-[#333333] rounded animate-pulse ml-auto"></div>
                      </th>
                      <th className="px-4 py-3 text-right">
                        <div className="w-12 h-3 bg-[#333333] rounded animate-pulse ml-auto"></div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#333]">
                    {[1, 2, 3, 4].map((i) => (
                      <tr key={i}>
                        <td className="px-4 py-4">
                          <div className="w-48 h-4 bg-[#333333] rounded animate-pulse mb-1"></div>
                          <div className="w-24 h-3 bg-[#333333] rounded animate-pulse"></div>
                        </td>
                        <td className="px-3 py-4 text-center">
                          <div className="w-8 h-4 bg-[#333333] rounded animate-pulse mx-auto"></div>
                        </td>
                        <td className="px-3 py-4 text-right">
                          <div className="w-16 h-4 bg-[#333333] rounded animate-pulse ml-auto"></div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="w-20 h-4 bg-[#333333] rounded animate-pulse ml-auto"></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Estimate not found</h3>
        <button
          onClick={() => navigate('/estimates')}
          className="text-[#F9D71C] hover:text-white transition-colors"
        >
          Back to Estimates
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header - Cleaner, Less Cramped Layout */}
      <div className="border-b border-[#333333] px-6 py-4">
        {/* Row 1: Navigation + Document Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/estimates')}
              className="p-2 hover:bg-[#333333] rounded-[4px] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-white">{estimate.estimate_number}</h1>
              <span className={`text-xs px-3 py-1 rounded-[4px] font-medium uppercase ${
                estimate.status === 'accepted' ? 'bg-green-500/20 text-green-300' :
                estimate.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                estimate.status === 'sent' ? 'bg-blue-500/20 text-blue-300' :
                'bg-gray-500/20 text-gray-300'
              }`}>
                {estimate.status}
              </span>
              {estimate.last_sent_at && (
                <span className="text-xs text-gray-500">
                  Sent {new Date(estimate.last_sent_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Cleaner Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Invoice Creation - Consolidated */}
            {estimate.status === 'accepted' && !estimate.converted_to_invoice_id && (
              <div className="relative">
                <button
                  onClick={() => setShowInvoiceDropdown(!showInvoiceDropdown)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#336699] text-white rounded-lg hover:bg-[#2A5580] transition-colors text-sm font-medium"
                >
                  Create Invoice
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showInvoiceDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-[#1E1E1E] border border-[#333333] rounded-lg shadow-lg z-50 py-2">
                    <button
                      onClick={() => {
                        handleConvertToInvoice(false);
                        setShowInvoiceDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                    >
                      Full Invoice
                    </button>
                    <button
                      onClick={() => {
                        handleConvertToInvoice(true);
                        setShowInvoiceDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#333333] transition-colors"
                    >
                      Deposit Invoice
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* View Invoice - if already converted */}
            {estimate.converted_to_invoice_id && (
              <button
                onClick={() => navigate(`/invoices/${estimate.converted_to_invoice_id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-[#336699] text-white rounded-lg hover:bg-[#2A5580] transition-colors text-sm font-medium"
              >
                View Invoice
              </button>
            )}
            
            {/* Send - for draft status */}
            {estimate.status === 'draft' && (
              <button 
                onClick={() => handleStatusUpdate('sent')}
                className="flex items-center gap-2 px-4 py-2 bg-[#336699] text-white rounded-lg hover:bg-[#2A5580] transition-colors text-sm font-medium"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            )}
            
            {/* Resend - for already sent estimates */}
            {estimate.status === 'sent' && estimate.client?.email && (
              <button 
                onClick={() => handleStatusUpdate('sent')}
                className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] border border-[#404040] text-white rounded-lg hover:bg-[#333333] transition-colors text-sm"
              >
                <Send className="w-4 h-4" />
                Resend
              </button>
            )}
            
            {/* Secondary Actions */}
            <button 
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] border border-[#404040] text-white rounded-lg hover:bg-[#333333] transition-colors text-sm"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            
            <button 
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#F9D71C] text-black rounded-lg hover:bg-[#F9D71C]/90 transition-colors text-sm font-medium"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>

        {/* Row 2: Client Information */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="text-white font-medium truncate">{estimate.client?.name || 'No client assigned'}</div>
            <div className="text-gray-500 text-sm whitespace-nowrap">
              Created {new Date(estimate.issue_date).toLocaleDateString()}
            </div>
          </div>
          
          <div className="text-right text-sm text-gray-400 whitespace-nowrap ml-4">
            Total: <span className="text-[#F9D71C] font-semibold text-base">{formatCurrency(estimate.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Mobile: Show total amount card */}
        <div className="md:hidden bg-[#1a1a1a] rounded-lg border border-[#333] p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total Amount</span>
            <span className="text-2xl font-bold text-[#F9D71C]">{formatCurrency(estimate.total_amount)}</span>
          </div>
        </div>

        {/* Client & Project Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#1a1a1a] rounded-lg border border-[#333] p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              Client Information
            </h3>
            {estimate.client ? (
              <div className="space-y-2 text-sm">
                <div className="text-white">{estimate.client.name}</div>
                {estimate.client.email && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span>{estimate.client.email}</span>
                  </div>
                )}
                {estimate.client.phone && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span>{estimate.client.phone}</span>
                  </div>
                )}
                {estimate.client.address && (
                  <button
                    onClick={() => setShowMapModal(true)}
                    className="flex items-start gap-2 text-gray-400 hover:text-white transition-all duration-200 group cursor-pointer w-full text-left p-2 -m-2 rounded-lg hover:bg-[#2a2a2a] border border-transparent hover:border-[#336699]/30"
                    title="Click to view on map"
                  >
                    <div className="relative">
                      <svg 
                        className="w-4 h-4 mt-0.5 transition-transform group-hover:scale-110" 
                        viewBox="0 0 24 24" 
                        fill="none"
                      >
                        <path 
                          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" 
                          fill="#DC2626" 
                          stroke="#B91C1C" 
                          strokeWidth="1"
                        />
                        <circle 
                          cx="12" 
                          cy="9" 
                          r="2.5" 
                          fill="white"
                        />
                      </svg>
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                    </div>
                    <div className="flex-1">
                      <span className="hover:underline group-hover:text-[#336699] transition-colors">{estimate.client.address}</span>
                      <div className="text-xs text-gray-500 group-hover:text-gray-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        📍 Click to view on map
                      </div>
                    </div>
                  </button>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No client assigned</p>
            )}
          </div>

          <div className="bg-[#1a1a1a] rounded-lg border border-[#333] p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              Estimate Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Issue Date</span>
                <span className="text-white">{new Date(estimate.issue_date).toLocaleDateString()}</span>
              </div>
              {estimate.expiry_date && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Expires</span>
                  <span className="text-white">{new Date(estimate.expiry_date).toLocaleDateString()}</span>
                </div>
              )}
              {estimate.project_id && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Project</span>
                  <span className="text-white">Assigned</span>
                </div>
              )}
              {estimate.converted_to_invoice_id && (
                <div className="flex justify-between pt-2 border-t border-[#333]">
                  <span className="text-gray-400">Invoice Status</span>
                  <span className="text-green-400">Created</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="space-y-6">
          {/* Category Summary */}
          {estimate.items && estimate.items.length > 0 && (
            <div className="bg-[#1a1a1a] rounded-lg border border-[#333] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#333]">
                <h2 className="text-base font-semibold text-white">Cost Breakdown by Category</h2>
              </div>
              
              <div className="p-6">
                {(() => {
                  // Group items by cost code
                  const categoryTotals = estimate.items.reduce((acc, item) => {
                    const category = item.cost_code_name || 'Uncategorized';
                    if (!acc[category]) {
                      acc[category] = 0;
                    }
                    acc[category] += item.total_price;
                    return acc;
                  }, {} as Record<string, number>);

                  // Sort categories by total amount (highest first)
                  const sortedCategories = Object.entries(categoryTotals)
                    .sort(([, a], [, b]) => b - a);

                  return (
                    <div className="space-y-2">
                      {sortedCategories.map(([category, total], index) => (
                        <div key={category} className={`flex justify-between items-center py-1.5 ${
                          index < sortedCategories.length - 1 ? 'border-b border-[#444]' : ''
                        }`}>
                          <span className="text-xs font-medium text-gray-300">{category}</span>
                          <span className="text-xs font-semibold text-white">{formatCurrency(total)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2 mt-2 border-t border-[#555]">
                        <span className="text-sm font-bold text-white">Subtotal</span>
                        <span className="text-sm font-bold text-white">{formatCurrency(estimate.subtotal)}</span>
                      </div>
                      {estimate.tax_amount && estimate.tax_amount > 0 && (
                        <>
                          <div className="flex justify-between items-center py-1">
                            <span className="text-xs text-gray-400">Tax ({estimate.tax_rate}%)</span>
                            <span className="text-xs text-gray-400">{formatCurrency(estimate.tax_amount)}</span>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-[#555]">
                            <span className="text-sm font-bold text-white">Total</span>
                            <span className="text-sm font-bold text-[#F9D71C]">{formatCurrency(estimate.total_amount)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Estimate Items */}
          <div className="bg-[#1a1a1a] rounded-lg border border-[#333] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#333]">
              <h2 className="text-base font-semibold text-white">Line Items</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0a0a0a]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Qty
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333]">
                  {estimate.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-[#2a2a2a] transition-colors">
                      <td className="px-4 py-4">
                        <div className="text-sm text-white leading-relaxed">{item.description}</div>
                        {item.cost_code_name && (
                          <div className="text-xs text-gray-500 mt-1">{item.cost_code_name}</div>
                        )}
                      </td>
                      <td className="px-3 py-4 text-center text-sm text-white whitespace-nowrap">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-4 text-right text-sm text-white whitespace-nowrap">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-medium text-white whitespace-nowrap">
                        {formatCurrency(item.total_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#0a0a0a]">
                  <tr>
                    <td colSpan={3} className="pl-6 pr-4 py-2 text-right text-xs font-medium text-gray-400">
                      Subtotal:
                    </td>
                    <td className="pl-4 pr-6 py-2 text-right text-xs font-medium text-white">
                      {formatCurrency(estimate.subtotal)}
                    </td>
                  </tr>
                  {estimate.tax_rate && estimate.tax_rate > 0 && (
                    <tr>
                      <td colSpan={3} className="pl-6 pr-4 py-2 text-right text-xs font-medium text-gray-400">
                        Tax ({estimate.tax_rate}%):
                      </td>
                      <td className="pl-4 pr-6 py-2 text-right text-xs font-medium text-white">
                        {formatCurrency(estimate.tax_amount || 0)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={3} className="pl-6 pr-4 py-3 text-right text-sm font-bold text-white">
                      Total:
                    </td>
                    <td className="pl-4 pr-6 py-3 text-right text-sm font-bold text-[#F9D71C]">
                      {formatCurrency(estimate.total_amount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes and Terms */}
          {(estimate.notes || estimate.terms) && (
            <div className="bg-[#1a1a1a] rounded-lg border border-[#333] p-6">
              {estimate.notes && (
                <div className="mb-4">
                  <h3 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Notes</h3>
                  <p className="text-xs text-white whitespace-pre-wrap leading-relaxed">{estimate.notes}</p>
                </div>
              )}
              
              {estimate.terms && (
                <div>
                  <h3 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Terms & Conditions</h3>
                  <p className="text-xs text-white whitespace-pre-wrap leading-relaxed">{estimate.terms}</p>
                </div>
              )}
            </div>
          )}

          {/* Signature Section */}
          {estimate.status === 'accepted' && estimate.client_signature && (
            <div className="bg-[#1a1a1a] rounded-lg border border-[#333] p-6">
              <h3 className="text-base font-semibold text-white mb-4">Client Signature</h3>
              <div className="border border-[#333] rounded-lg p-4 bg-white">
                <img 
                  src={estimate.client_signature} 
                  alt="Client Signature" 
                  className="max-h-32 mx-auto"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Signed on {new Date(estimate.signed_at!).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowShareModal(false)} />
          <div className="relative bg-[#1E1E1E] rounded-lg border border-[#333333] p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4">Share Estimate</h3>
            <p className="text-gray-400 mb-4">
              Generate a shareable link for this estimate. Clients can view and accept/reject the estimate without needing to log in.
            </p>
            
            <div className="bg-[#121212] border border-[#333333] rounded-lg p-3 mb-4">
              <div className="text-xs text-gray-400 mb-1">Shareable Link</div>
              <div className="text-sm text-white break-all">
                {`${window.location.origin}/share/estimate/${estimate.id}`}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleCopyShareLink();
                  setShowShareModal(false);
                }}
                className="px-4 py-2 bg-[#336699] hover:bg-[#2A5580] text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </button>
              <button
                onClick={() => {
                  window.open(`/share/estimate/${estimate.id}`, '_blank');
                  setShowShareModal(false);
                }}
                className="px-4 py-2 bg-[#F9D71C] hover:bg-[#F9D71C]/90 text-black rounded-lg transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Invoice Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowDepositModal(false)} />
          <div className="relative bg-[#1E1E1E] rounded-lg border border-[#333333] p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4">Create Deposit Invoice</h3>
            <p className="text-gray-400 mb-6">
              Create a partial invoice for a deposit payment. The remaining balance can be invoiced later.
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Deposit Percentage
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="5"
                  value={depositPercentage}
                  onChange={(e) => setDepositPercentage(Number(e.target.value))}
                  className="flex-1"
                />
                <div className="w-20 text-center">
                  <input
                    type="number"
                    min="10"
                    max="90"
                    value={depositPercentage}
                    onChange={(e) => setDepositPercentage(Number(e.target.value))}
                    className="w-full bg-[#333] border border-[#555] rounded px-2 py-1 text-white text-center"
                  />
                  <span className="text-sm text-gray-400">%</span>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-[#2a2a2a] rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Estimate Total:</span>
                  <span className="text-white">{formatCurrency(estimate.total_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Deposit Amount:</span>
                  <span className="text-[#F9D71C] font-semibold">
                    {formatCurrency(estimate.total_amount * (depositPercentage / 100))}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDepositModal(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDepositInvoice}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Create Deposit Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Selection Modal */}
      <ProjectSelectionModal
        isOpen={showProjectSelectionModal}
        onClose={() => {
          setShowProjectSelectionModal(false);
          setPendingInvoiceType(null);
        }}
        onSelect={handleProjectSelection}
        clientId={estimate?.client_id}
        estimateTitle={estimate?.title || estimate?.estimate_number}
      />

      {/* Project Creation Modal */}
      {showProjectSelectionModal && estimate && (
        <ProjectCreationModal
          isOpen={showProjectSelectionModal}
          onClose={() => {
            setShowProjectSelectionModal(false);
            setPendingInvoiceType(null);
          }}
          onSuccess={handleProjectCreated}
          workPack={{
            id: estimate.id || '',
            name: estimate.title || estimate.estimate_number || 'Project',
            description: estimate.description || '',
            base_price: estimate.total_amount,
            items: estimate.items || []
          }}
        />
      )}

      {/* Mobile Sticky Action Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#333] p-4 z-40">
        <div className="flex items-center justify-around gap-2">
          {estimate.status === 'draft' && (
            <button 
              onClick={() => handleStatusUpdate('sent')}
              className="flex-1 bg-[#336699] text-white px-3 py-3 rounded-lg text-sm font-medium"
            >
              Send
            </button>
          )}
          
          {estimate.status === 'accepted' && !estimate.converted_to_invoice_id && (
            <button
              onClick={() => handleConvertToInvoice(false)}
              className="flex-1 bg-green-600 text-white px-3 py-3 rounded-lg text-sm font-medium"
            >
              Invoice
            </button>
          )}
          
          <button 
            onClick={() => setShowEditModal(true)}
            className="flex-1 bg-[#F9D71C] text-black px-3 py-3 rounded-lg text-sm font-medium"
          >
            Edit
          </button>
          
          <button 
            onClick={() => setShowShareModal(true)}
            className="flex-1 bg-[#2a2a2a] text-white px-3 py-3 rounded-lg text-sm font-medium"
          >
            Share
          </button>
        </div>
      </div>

      {/* Edit Estimate Modal */}
      <CreateEstimateDrawer
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleEditSave}
        editingEstimate={estimate}
      />

      {/* Map Modal */}
      {showMapModal && estimate?.client?.address && (
        <MapModal
          isOpen={showMapModal}
          onClose={() => setShowMapModal(false)}
          address={estimate.client.address}
          clientName={estimate.client.name}
        />
      )}
    </div>
  );
};