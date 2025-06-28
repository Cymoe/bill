import React from 'react';
import { createPortal } from 'react-dom';
import { X, Crown, Check, Zap, Building, Users, BarChart } from 'lucide-react';

interface UpgradePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string;
  currentLimit?: number;
  onUpgrade?: () => void;
}

export const UpgradePromptModal: React.FC<UpgradePromptModalProps> = ({
  isOpen,
  onClose,
  currentPlan = 'Free',
  currentLimit = 5,
  onUpgrade
}) => {
  if (!isOpen) return null;

  const modalContent = (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] transition-all duration-200 opacity-100"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-[#1F2937] rounded-lg shadow-[0_25px_50px_-12px_rgb(0_0_0_/_0.5)] max-w-2xl w-full border border-[#374151] transition-all duration-200 pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#374151]">
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-[#F59E0B]" />
              <h2 className="text-lg font-semibold text-white">Unlock Unlimited Industries</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#374151] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Current Status */}
            <div className="bg-[#111827] rounded-lg p-4 mb-6 border border-[#374151]">
              <p className="text-sm text-gray-400 mb-1">Current Plan</p>
              <p className="text-lg font-semibold text-white">{currentPlan}</p>
              <p className="text-sm text-gray-400 mt-2">
                You've reached your limit of {currentLimit} industries
              </p>
            </div>

            {/* Upgrade Benefits */}
            <div className="mb-6">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#F59E0B]" />
                Unlimited Plan Benefits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium">Unlimited Industries</p>
                    <p className="text-gray-400 text-xs">Add as many industries as your business needs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium">Advanced Service Packages</p>
                    <p className="text-gray-400 text-xs">Access to premium service templates</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium">Priority Support</p>
                    <p className="text-gray-400 text-xs">Get help when you need it most</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium">Team Collaboration</p>
                    <p className="text-gray-400 text-xs">Work seamlessly with your crew</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gradient-to-r from-[#F59E0B]/10 to-[#D97706]/10 rounded-lg p-6 border border-[#F59E0B]/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-white">$29.99<span className="text-sm font-normal text-gray-400">/month</span></p>
                  <p className="text-sm text-gray-400">Billed monthly, cancel anytime</p>
                </div>
                <Crown className="w-12 h-12 text-[#F59E0B]/20" />
              </div>
              
              {/* Use Cases */}
              <div className="space-y-2">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Perfect for:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#252525] rounded text-xs text-gray-300">
                    <Building className="w-3 h-3" />
                    Multi-trade contractors
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#252525] rounded text-xs text-gray-300">
                    <Users className="w-3 h-3" />
                    Growing businesses
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#252525] rounded text-xs text-gray-300">
                    <BarChart className="w-3 h-3" />
                    Enterprise operations
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[#374151] p-4 bg-[#1F2937] flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Maybe later
            </button>
            <button
              onClick={() => {
                onUpgrade?.();
                onClose();
              }}
              className="px-6 py-2.5 bg-[#F59E0B] text-black text-sm font-medium rounded-lg hover:bg-[#D97706] transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#F59E0B] focus:ring-offset-2 focus:ring-offset-[#1F2937]"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};