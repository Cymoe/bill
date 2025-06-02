import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { OrganizationContext } from '../components/layouts/DashboardLayout';

interface Industry {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  display_order: number;
}

export default function IndustrySettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedOrg } = useContext(OrganizationContext);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedOrg?.id) {
      loadIndustries();
    }
  }, [user, selectedOrg]);

  const loadIndustries = async () => {
    if (!user || !selectedOrg?.id) return;

    try {
      // Load all industries
      const { data: allIndustries, error: industriesError } = await supabase
        .from('industries')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (industriesError) throw industriesError;
      setIndustries(allIndustries || []);

      // Load organization's selected industries
      const { data: orgIndustries, error: orgError } = await supabase
        .from('organization_industries')
        .select('industry_id')
        .eq('organization_id', selectedOrg.id);

      if (orgError) throw orgError;
      
      const selected = new Set(orgIndustries?.map(oi => oi.industry_id) || []);
      setSelectedIndustries(selected);
    } catch (error) {
      console.error('Error loading industries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleIndustry = (industryId: string) => {
    const newSelected = new Set(selectedIndustries);
    if (newSelected.has(industryId)) {
      newSelected.delete(industryId);
    } else {
      newSelected.add(industryId);
    }
    setSelectedIndustries(newSelected);
  };

  const saveChanges = async () => {
    if (!user || !selectedOrg?.id) return;

    setIsSaving(true);
    try {
      // Delete all existing organization industries
      const { error: deleteError } = await supabase
        .from('organization_industries')
        .delete()
        .eq('organization_id', selectedOrg.id);

      if (deleteError) throw deleteError;

      // Insert new selections
      if (selectedIndustries.size > 0) {
        const inserts = Array.from(selectedIndustries).map(industryId => ({
          organization_id: selectedOrg.id,
          industry_id: industryId
        }));

        const { error: insertError } = await supabase
          .from('organization_industries')
          .insert(inserts);

        if (insertError) throw insertError;
      }

      // Show success and navigate back
      navigate('/projects');
    } catch (error) {
      console.error('Error saving industries:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#fbbf24]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="bg-[#0a0a0a] border-b border-[#1a1a1a] sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-white">Industry Settings</h1>
                <p className="text-sm text-gray-500">Select industries for {selectedOrg?.name || 'organization'}</p>
              </div>
            </div>
            <button
              onClick={saveChanges}
              disabled={isSaving || selectedIndustries.size === 0}
              className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2
                ${selectedIndustries.size > 0
                  ? 'bg-[#fbbf24] text-black hover:bg-[#f59e0b]'
                  : 'bg-[#1a1a1a] text-gray-600 cursor-not-allowed'}`}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Choose Industries for {selectedOrg?.name}</h2>
          <p className="text-gray-400">
            Select all the industries this organization operates in. This will determine which project types 
            and work packs are available for {selectedOrg?.name}.
          </p>
        </div>

        {/* Industry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((industry) => {
            const isSelected = selectedIndustries.has(industry.id);
            
            return (
              <button
                key={industry.id}
                onClick={() => toggleIndustry(industry.id)}
                className={`relative flex flex-col items-start p-6 rounded-xl border-2 transition-all duration-200
                          ${isSelected 
                            ? 'bg-[#0f1729] border-[#fbbf24] ring-2 ring-[#fbbf24]/20'
                            : 'bg-[#111] border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#151515]'}`}
              >
                {/* Industry Icon */}
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 transition-all
                              ${isSelected
                                ? 'bg-opacity-20'
                                : 'bg-[#1a1a1a]'}`}
                     style={{ 
                       backgroundColor: isSelected ? `${industry.color}20` : undefined,
                       borderColor: isSelected ? industry.color : undefined,
                       borderWidth: isSelected ? '2px' : '0'
                     }}>
                  <span className="text-3xl">{industry.icon}</span>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-2">{industry.name}</h3>
                <p className="text-sm text-gray-400 mb-4">{industry.description}</p>

                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 bg-[#fbbf24] rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-black" />
                    </div>
                  </div>
                )}

                {/* Hover Effect */}
                <div className={`absolute inset-0 rounded-xl transition-opacity pointer-events-none
                              ${isSelected ? 'opacity-0' : 'opacity-0 hover:opacity-100'}`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent rounded-xl"></div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Helper Text */}
        <div className="mt-12 p-6 bg-[#111] border border-[#2a2a2a] rounded-lg">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <Sparkles className="w-6 h-6 text-[#fbbf24] mt-1" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Why Select Industries?</h3>
              <p className="text-gray-400 mb-3">
                Selecting industries for this organization helps customize the experience:
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-[#fbbf24] mt-1">•</span>
                  <span>Only see relevant project types when creating projects for this organization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#fbbf24] mt-1">•</span>
                  <span>Get industry-specific work packs and templates for this organization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#fbbf24] mt-1">•</span>
                  <span>Access tailored products and pricing for this organization's trades</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#fbbf24] mt-1">•</span>
                  <span>Keep each organization focused on its specific services</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 