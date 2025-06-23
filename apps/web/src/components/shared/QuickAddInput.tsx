import React, { useState, useRef } from 'react';
import { Zap, Clipboard, X, Check, AlertCircle } from 'lucide-react';
import { UniversalImportService, PersonType } from '../../services/UniversalImportService';
import { Client } from '../../services/ClientService';
import { VendorFormData } from '../../services/vendorService';
import { SubcontractorFormData } from '../../services/subcontractorService';
import { TeamMemberFormData } from '../../services/TeamMemberService';

interface QuickAddInputProps {
  personType: PersonType;
  onDataExtracted: (data: Partial<Client | VendorFormData | SubcontractorFormData | TeamMemberFormData>) => void;
  className?: string;
}

export const QuickAddInput: React.FC<QuickAddInputProps> = ({
  personType,
  onDataExtracted,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<Client | VendorFormData | SubcontractorFormData | TeamMemberFormData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleParse = async () => {
    if (!inputValue.trim()) {
      setError('Please enter some text to parse');
      return;
    }

    setIsParsing(true);
    setError(null);

    try {
      const result = UniversalImportService.parseSmartInput(inputValue, personType);
      
      if (result.data.length === 0) {
        setError('Could not extract any contact information');
        return;
      }

      setParseResult(result.data[0]);
      
      // Auto-apply after a short delay to show the result
      setTimeout(() => {
        onDataExtracted(result.data[0]);
        setIsExpanded(false);
        setInputValue('');
        setParseResult(null);
      }, 1500);
    } catch (err) {
      setError('Failed to parse input');
    } finally {
      setIsParsing(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputValue(text);
      
      // Auto-parse on paste
      if (text.trim()) {
        setTimeout(handleParse, 100);
      }
    } catch (err) {
      setError('Failed to read clipboard');
    }
  };

  const getPlaceholder = () => {
    switch (personType) {
      case 'vendor':
        return 'Paste vendor info, business card, or email signature...';
      case 'subcontractor':
        return 'Paste contractor details, license info, or contact...';
      case 'team':
        return 'Paste team member email, bio, or contact info...';
      default:
        return 'Paste contact info, email signature, or business card text...';
    }
  };

  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={() => {
          setIsExpanded(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className={`flex items-center gap-2 px-4 py-2 bg-transparent border border-[#333333] text-gray-400 hover:text-white hover:border-[#336699] transition-all duration-200 ${className}`}
      >
        <Zap className="w-4 h-4" />
        <span className="text-sm">Quick Add</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <div className="bg-[#0f0f0f] border border-[#336699] rounded-lg p-4 space-y-3 animate-in slide-in-from-top-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Quick Add - Smart Paste
          </h4>
          <button
            type="button"
            onClick={() => {
              setIsExpanded(false);
              setInputValue('');
              setParseResult(null);
              setError(null);
            }}
            className="w-6 h-6 rounded-md hover:bg-[#1a1a1a] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPaste={(e) => {
            // Auto-parse on paste
            setTimeout(() => {
              if (e.target.value.trim()) {
                handleParse();
              }
            }, 100);
          }}
          placeholder={getPlaceholder()}
          className="w-full h-24 px-3 py-2 bg-black border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:border-[#336699] focus:outline-none focus:ring-1 focus:ring-[#336699]/20 transition-all duration-200 resize-none text-sm"
        />

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="w-3 h-3" />
            {error}
          </div>
        )}

        {parseResult && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-green-400 mb-2">
              <Check className="w-3 h-3" />
              Found contact information!
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              {parseResult.name && <div>Name: {parseResult.name}</div>}
              {parseResult.contact_name && <div>Contact: {parseResult.contact_name}</div>}
              {parseResult.company_name && <div>Company: {parseResult.company_name}</div>}
              {parseResult.email && <div>Email: {parseResult.email}</div>}
              {parseResult.phone && <div>Phone: {parseResult.phone}</div>}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePaste}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400 hover:text-white hover:border-[#3a3a3a] rounded-lg text-sm transition-all duration-200"
          >
            <Clipboard className="w-3.5 h-3.5" />
            Paste from Clipboard
          </button>
          <button
            type="button"
            onClick={handleParse}
            disabled={!inputValue.trim() || isParsing}
            className="flex-1 px-3 py-2 bg-[#336699] text-white hover:bg-[#336699]/80 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm font-medium transition-all duration-200"
          >
            {isParsing ? 'Parsing...' : 'Extract Info'}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          AI will automatically extract names, emails, phones, and other details
        </p>
      </div>
    </div>
  );
};