import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Edit, Send, Download, Share2, Trash2,
  CheckCircle, XCircle, Clock, FileText, User,
  Phone, Mail, MapPin, Calendar, DollarSign
} from 'lucide-react';
import { EstimateService, Estimate } from '../../services/EstimateService';
import { formatCurrency } from '../../utils/format';

export const EstimateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadEstimate();
    }
  }, [id]);

  const loadEstimate = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await EstimateService.getById(id);
      setEstimate(data);
    } catch (error) {
      console.error('Error loading estimate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: Estimate['status']) => {
    if (!estimate?.id) return;

    try {
      await EstimateService.updateStatus(estimate.id, status);
      await loadEstimate();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleConvertToInvoice = async () => {
    if (!estimate?.id) return;
    
    if (!confirm('Convert this estimate to an invoice? This action cannot be undone.')) return;

    try {
      const invoiceId = await EstimateService.convertToInvoice(estimate.id);
      navigate(`/invoices/${invoiceId}`);
    } catch (error) {
      console.error('Error converting to invoice:', error);
      alert('Failed to convert estimate to invoice');
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

  const getStatusColor = (status: Estimate['status']) => {
    switch (status) {
      case 'draft': return 'text-gray-400 bg-gray-400/10';
      case 'sent': return 'text-blue-400 bg-blue-400/10';
      case 'accepted': return 'text-green-400 bg-green-400/10';
      case 'rejected': return 'text-red-400 bg-red-400/10';
      case 'expired': return 'text-orange-400 bg-orange-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F9D71C]"></div>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/estimates')}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {estimate.title || estimate.estimate_number}
            </h1>
            <div className="flex items-center gap-4 mt-1">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(estimate.status)}`}>
                {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
              </span>
              <span className="text-sm text-gray-400">
                {estimate.estimate_number}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {estimate.status === 'accepted' && (
            <button
              onClick={handleConvertToInvoice}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Convert to Invoice
            </button>
          )}
          
          {estimate.status === 'draft' && (
            <button
              onClick={() => handleStatusUpdate('sent')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4" />
              Send to Client
            </button>
          )}

          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#333] text-white rounded-lg hover:bg-[#444] transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>

          <button
            onClick={() => navigate(`/estimates/${estimate.id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-[#F9D71C] text-black rounded-lg hover:bg-[#F9D71C]/90 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Estimate Items */}
          <div className="bg-[#1a1a1a] rounded-lg border border-[#333] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#333]">
              <h2 className="text-lg font-semibold text-white">Line Items</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0a0a0a]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333]">
                  {estimate.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white">{item.description}</div>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-white">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-white">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-white">
                        {formatCurrency(item.total_price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#0a0a0a]">
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-400">
                      Subtotal:
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-medium text-white">
                      {formatCurrency(estimate.subtotal)}
                    </td>
                  </tr>
                  {estimate.tax_rate && estimate.tax_rate > 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-400">
                        Tax ({estimate.tax_rate}%):
                      </td>
                      <td className="px-6 py-3 text-right text-sm font-medium text-white">
                        {formatCurrency(estimate.tax_amount || 0)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-right text-lg font-bold text-white">
                      Total:
                    </td>
                    <td className="px-6 py-4 text-right text-lg font-bold text-[#F9D71C]">
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
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Notes</h3>
                  <p className="text-sm text-white whitespace-pre-wrap">{estimate.notes}</p>
                </div>
              )}
              
              {estimate.terms && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Terms & Conditions</h3>
                  <p className="text-sm text-white whitespace-pre-wrap">{estimate.terms}</p>
                </div>
              )}
            </div>
          )}

          {/* Signature Section */}
          {estimate.status === 'accepted' && estimate.client_signature && (
            <div className="bg-[#1a1a1a] rounded-lg border border-[#333] p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Client Signature</h3>
              <div className="border border-[#333] rounded-lg p-4 bg-white">
                <img 
                  src={estimate.client_signature} 
                  alt="Client Signature" 
                  className="max-h-32 mx-auto"
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Signed on {new Date(estimate.signed_at!).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Information */}
          <div className="bg-[#1a1a1a] rounded-lg border border-[#333] p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Client Information</h3>
            
            {estimate.client ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-white">{estimate.client.name}</span>
                </div>
                
                {estimate.client.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-white">{estimate.client.email}</span>
                  </div>
                )}
                
                {estimate.client.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-white">{estimate.client.phone}</span>
                  </div>
                )}
                
                {estimate.client.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="text-sm text-white">{estimate.client.address}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No client assigned</p>
            )}
          </div>

          {/* Estimate Details */}
          <div className="bg-[#1a1a1a] rounded-lg border border-[#333] p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Estimate Details</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Issue Date</span>
                <span className="text-sm text-white">
                  {new Date(estimate.issue_date).toLocaleDateString()}
                </span>
              </div>
              
              {estimate.expiry_date && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Expires</span>
                  <span className="text-sm text-white">
                    {new Date(estimate.expiry_date).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Total Amount</span>
                <span className="text-lg font-bold text-[#F9D71C]">
                  {formatCurrency(estimate.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-[#1a1a1a] rounded-lg border border-[#333] p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
            
            <div className="space-y-2">
              {estimate.status === 'sent' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate('accepted')}
                    className="w-full flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Accepted
                  </button>
                  
                  <button
                    onClick={() => handleStatusUpdate('rejected')}
                    className="w-full flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Mark as Rejected
                  </button>
                </>
              )}
              
              <button className="w-full flex items-center gap-2 px-4 py-2 bg-[#333] text-white rounded-lg hover:bg-[#444] transition-colors">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              
              <button
                onClick={handleDelete}
                className="w-full flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Estimate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};