import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface OnboardingData {
  businessDescription: string;
  currentProjects: string;
  mainGoals: string;
  additionalInfo: string;
}

interface ChatOnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

const ChatOnboarding: React.FC<ChatOnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingData>({
    businessDescription: '',
    currentProjects: '',
    mainGoals: '',
    additionalInfo: ''
  });

  const steps = [
    {
      title: "Welcome to Your Business AI",
      content: (
        <div className="text-center space-y-8">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto flex items-center justify-center">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32 8L48 24L32 40L16 24L32 8Z" stroke="white" strokeWidth="2" fill="none"/>
                <path d="M32 16L40 24L32 32L24 24L32 16Z" fill="white" fillOpacity="0.1"/>
              </svg>
            </div>
          </div>
          
          <h1 className="text-4xl font-medium text-white">Welcome to Your Business AI</h1>
          
          <div className="space-y-4 text-left max-w-md mx-auto">
            <div className="flex items-start space-x-3">
              <span className="text-green-400 text-xl">•</span>
              <span className="text-gray-300">First, let's set up your personal AI assistant</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-400 text-xl">•</span>
              <span className="text-gray-300">The more context you provide, the better I can help</span>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-green-400 text-xl">•</span>
              <span className="text-gray-300">You can update these anytime</span>
            </div>
          </div>
        </div>
      ),
      field: null
    },
    {
      title: "Describe your business:",
      placeholder: "- I run a construction company\n- We specialize in home renovations\n- Been in business for 5 years",
      field: 'businessDescription' as keyof OnboardingData,
      minChars: 30
    },
    {
      title: "What are your current projects?",
      placeholder: "- Kitchen remodel on Oak Street\n- Bathroom renovation for the Johnsons\n- Deck installation starting next week",
      field: 'currentProjects' as keyof OnboardingData,
      minChars: 30
    },
    {
      title: "What are your main goals?",
      placeholder: "- Grow revenue to $1M this year\n- Hire 2 more skilled workers\n- Reduce time spent on paperwork",
      field: 'mainGoals' as keyof OnboardingData,
      minChars: 30
    },
    {
      title: "What else should I know?",
      placeholder: "- I prefer morning meetings\n- Cash flow is tight this month\n- Looking to expand into commercial work",
      field: 'additionalInfo' as keyof OnboardingData,
      minChars: 30
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onComplete(formData);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getCharCount = (field: keyof OnboardingData) => {
    return formData[field].length;
  };

  const getRemainingChars = (field: keyof OnboardingData, minChars: number) => {
    const current = getCharCount(field);
    return Math.max(0, minChars - current);
  };

  const canProceed = () => {
    if (currentStep === 0) return true; // Welcome screen
    const field = currentStepData.field;
    if (!field) return true;
    const minChars = currentStepData.minChars || 0;
    return getCharCount(field) >= minChars;
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-[#1E1E1E] rounded-lg p-8 shadow-2xl border border-[#333333]">
        {/* Progress Bar */}
        <div className="flex space-x-3 mb-12">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-colors ${
                index <= currentStep ? 'bg-green-500' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="mb-12">
          {currentStep === 0 ? (
            currentStepData.content
          ) : (
            <>
              <h1 className="text-3xl font-medium text-white mb-8">
                {currentStepData.title}
              </h1>
              
              {currentStepData.field && (
                <div className="relative">
                  <textarea
                    value={formData[currentStepData.field]}
                    onChange={(e) => handleInputChange(currentStepData.field!, e.target.value)}
                    placeholder={currentStepData.placeholder}
                    className="w-full h-48 bg-[#1E1E1E] border border-[#333333] rounded-lg p-6 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-[#336699] focus:ring-2 focus:ring-[#336699]/20"
                  />
                  
                  {currentStepData.minChars && getRemainingChars(currentStepData.field, currentStepData.minChars) > 0 && (
                    <div className="absolute bottom-4 right-4 text-gray-500 text-sm">
                      add {getRemainingChars(currentStepData.field, currentStepData.minChars)} more characters
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          {!isFirstStep && (
            <button
              onClick={handleBack}
              className="px-8 py-3 text-white hover:text-gray-300 transition-colors"
            >
              Back
            </button>
          )}
          
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`ml-auto px-8 py-3 rounded-full font-medium transition-colors ${
              canProceed()
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLastStep ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatOnboarding; 