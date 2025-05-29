import React, { useState, useEffect } from 'react';
import { X, Clock, Mail, Plus, Trash2, Edit2, Calendar } from 'lucide-react';
import { 
  ScheduledReportConfig, 
  saveScheduledReport, 
  getScheduledReports, 
  deleteScheduledReport 
} from '../../utils/exportUtils';
import { useAuth } from '../../contexts/AuthContext';

interface ScheduledReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: { id: string; name: string }[];
}

export const ScheduledReportsModal: React.FC<ScheduledReportsModalProps> = ({
  isOpen,
  onClose,
  categories
}) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ScheduledReportConfig[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingReport, setEditingReport] = useState<ScheduledReportConfig | null>(null);
  const [formData, setFormData] = useState<Partial<ScheduledReportConfig>>({
    name: '',
    type: 'excel',
    frequency: 'weekly',
    dayOfWeek: 1, // Monday
    dayOfMonth: 1,
    time: '09:00',
    recipients: [''],
    includeCategories: [],
    dateRange: 'last30days',
    isActive: true
  });

  useEffect(() => {
    if (isOpen && user) {
      loadReports();
    }
  }, [isOpen, user]);

  const loadReports = () => {
    if (!user) return;
    const loadedReports = getScheduledReports(user.id);
    setReports(loadedReports);
  };

  const handleSave = async () => {
    if (!user || !formData.name || formData.recipients?.filter(r => r).length === 0) return;
    
    const config: ScheduledReportConfig = {
      ...(editingReport || {}),
      name: formData.name!,
      type: formData.type as 'excel' | 'pdf',
      frequency: formData.frequency as 'daily' | 'weekly' | 'monthly',
      dayOfWeek: formData.dayOfWeek,
      dayOfMonth: formData.dayOfMonth,
      time: formData.time!,
      recipients: formData.recipients!.filter(r => r),
      includeCategories: formData.includeCategories,
      dateRange: formData.dateRange as any,
      isActive: formData.isActive!
    };

    await saveScheduledReport(config, user.id);
    loadReports();
    resetForm();
  };

  const handleDelete = async (reportId: string) => {
    if (confirm('Are you sure you want to delete this scheduled report?')) {
      deleteScheduledReport(reportId);
      loadReports();
    }
  };

  const handleEdit = (report: ScheduledReportConfig) => {
    setEditingReport(report);
    setFormData(report);
    setIsCreating(true);
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingReport(null);
    setFormData({
      name: '',
      type: 'excel',
      frequency: 'weekly',
      dayOfWeek: 1,
      dayOfMonth: 1,
      time: '09:00',
      recipients: [''],
      includeCategories: [],
      dateRange: 'last30days',
      isActive: true
    });
  };

  const addRecipient = () => {
    setFormData(prev => ({
      ...prev,
      recipients: [...(prev.recipients || []), '']
    }));
  };

  const updateRecipient = (index: number, value: string) => {
    const newRecipients = [...(formData.recipients || [])];
    newRecipients[index] = value;
    setFormData(prev => ({ ...prev, recipients: newRecipients }));
  };

  const removeRecipient = (index: number) => {
    const newRecipients = (formData.recipients || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, recipients: newRecipients }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#333333] rounded-[4px] w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1E1E1E]">
          <h2 className="text-xl font-bold">SCHEDULED REPORTS</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#404040] rounded-[4px] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!isCreating ? (
            <>
              {/* Add New Button */}
              <button
                onClick={() => setIsCreating(true)}
                className="mb-6 flex items-center gap-2 px-4 py-2 bg-[#336699] text-white rounded-[4px] hover:bg-[#2A5580] transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">CREATE SCHEDULED REPORT</span>
              </button>

              {/* Reports List */}
              <div className="space-y-4">
                {reports.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No scheduled reports configured</p>
                  </div>
                ) : (
                  reports.map(report => (
                    <div key={report.id} className="bg-[#1E1E1E] rounded-[4px] p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-lg">{report.name}</h3>
                            <span className={`px-2 py-1 rounded-[2px] text-xs font-medium ${
                              report.isActive 
                                ? 'bg-[#388E3C]/20 text-[#388E3C]' 
                                : 'bg-[#D32F2F]/20 text-[#D32F2F]'
                            }`}>
                              {report.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
                            <div>
                              <span className="font-medium">Format:</span> {report.type.toUpperCase()}
                            </div>
                            <div>
                              <span className="font-medium">Frequency:</span> {report.frequency}
                            </div>
                            <div>
                              <span className="font-medium">Time:</span> {report.time}
                            </div>
                            <div>
                              <span className="font-medium">Recipients:</span> {report.recipients.length}
                            </div>
                          </div>

                          {report.recipients.length > 0 && (
                            <div className="mt-2 flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-300">{report.recipients.join(', ')}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(report)}
                            className="p-2 hover:bg-[#404040] rounded-[4px] transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(report.id!)}
                            className="p-2 hover:bg-[#404040] rounded-[4px] transition-colors text-[#D32F2F]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            /* Create/Edit Form */
            <div className="space-y-6">
              <h3 className="text-lg font-medium">
                {editingReport ? 'EDIT SCHEDULED REPORT' : 'CREATE SCHEDULED REPORT'}
              </h3>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">REPORT NAME</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-10 px-3 bg-[#1E1E1E] border border-[#555555] rounded-[4px] text-white focus:outline-none focus:border-[#336699]"
                  placeholder="Monthly Category Performance Report"
                />
              </div>

              {/* Format and Frequency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">FORMAT</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'excel' | 'pdf' }))}
                    className="w-full h-10 px-3 bg-[#1E1E1E] border border-[#555555] rounded-[4px] text-white focus:outline-none focus:border-[#336699]"
                  >
                    <option value="excel">Excel</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">FREQUENCY</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as any }))}
                    className="w-full h-10 px-3 bg-[#1E1E1E] border border-[#555555] rounded-[4px] text-white focus:outline-none focus:border-[#336699]"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              {/* Schedule Details */}
              <div className="grid grid-cols-2 gap-4">
                {formData.frequency === 'weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">DAY OF WEEK</label>
                    <select
                      value={formData.dayOfWeek}
                      onChange={(e) => setFormData(prev => ({ ...prev, dayOfWeek: parseInt(e.target.value) }))}
                      className="w-full h-10 px-3 bg-[#1E1E1E] border border-[#555555] rounded-[4px] text-white focus:outline-none focus:border-[#336699]"
                    >
                      <option value={0}>Sunday</option>
                      <option value={1}>Monday</option>
                      <option value={2}>Tuesday</option>
                      <option value={3}>Wednesday</option>
                      <option value={4}>Thursday</option>
                      <option value={5}>Friday</option>
                      <option value={6}>Saturday</option>
                    </select>
                  </div>
                )}

                {formData.frequency === 'monthly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">DAY OF MONTH</label>
                    <input
                      type="number"
                      value={formData.dayOfMonth}
                      onChange={(e) => setFormData(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value) }))}
                      min="1"
                      max="31"
                      className="w-full h-10 px-3 bg-[#1E1E1E] border border-[#555555] rounded-[4px] text-white focus:outline-none focus:border-[#336699]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">TIME</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full h-10 px-3 bg-[#1E1E1E] border border-[#555555] rounded-[4px] text-white focus:outline-none focus:border-[#336699]"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">DATA RANGE</label>
                <select
                  value={formData.dateRange}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateRange: e.target.value as any }))}
                  className="w-full h-10 px-3 bg-[#1E1E1E] border border-[#555555] rounded-[4px] text-white focus:outline-none focus:border-[#336699]"
                >
                  <option value="last7days">Last 7 Days</option>
                  <option value="last30days">Last 30 Days</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="lastQuarter">Last Quarter</option>
                  <option value="lastYear">Last Year</option>
                </select>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">INCLUDE CATEGORIES</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!formData.includeCategories || formData.includeCategories.length === 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({ ...prev, includeCategories: [] }));
                        }
                      }}
                      className="rounded border-gray-600"
                    />
                    <span className="text-sm">All Categories</span>
                  </label>
                  {categories.map(cat => (
                    <label key={cat.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.includeCategories?.includes(cat.id) || false}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              includeCategories: [...(prev.includeCategories || []), cat.id]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              includeCategories: (prev.includeCategories || []).filter(id => id !== cat.id)
                            }));
                          }
                        }}
                        className="rounded border-gray-600"
                      />
                      <span className="text-sm">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Recipients */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">EMAIL RECIPIENTS</label>
                <div className="space-y-2">
                  {formData.recipients?.map((recipient, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="email"
                        value={recipient}
                        onChange={(e) => updateRecipient(index, e.target.value)}
                        className="flex-1 h-10 px-3 bg-[#1E1E1E] border border-[#555555] rounded-[4px] text-white focus:outline-none focus:border-[#336699]"
                        placeholder="email@example.com"
                      />
                      {formData.recipients!.length > 1 && (
                        <button
                          onClick={() => removeRecipient(index)}
                          className="p-2 hover:bg-[#404040] rounded-[4px] transition-colors text-[#D32F2F]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addRecipient}
                    className="text-[#336699] text-sm font-medium hover:text-white transition-colors"
                  >
                    + Add Recipient
                  </button>
                </div>
              </div>

              {/* Active Status */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-600"
                />
                <span className="text-sm">Active (Report will be sent automatically)</span>
              </label>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1E1E1E]">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 border border-[#555555] text-white rounded-[4px] hover:bg-[#404040] transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-[#336699] text-white rounded-[4px] hover:bg-[#2A5580] transition-colors"
                >
                  {editingReport ? 'UPDATE REPORT' : 'CREATE REPORT'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 