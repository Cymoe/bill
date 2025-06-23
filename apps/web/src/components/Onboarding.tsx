import React from 'react';
import '../styles/onboarding.css';

interface OnboardingProps {
  onNext: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onNext }) => {
  return (
    <div className="onboarding-container">
      <div className="onboarding-modal">
        <h1 className="onboarding-title">Welcome to Your Business AI</h1>
        
        <div className="onboarding-list">
          <div className="onboarding-list-item">
            First, let's set up your personal AI assistant
          </div>
          <div className="onboarding-list-item">
            The more context you provide, the better I can help
          </div>
          <div className="onboarding-list-item">
            You can update these anytime
          </div>
        </div>

        <button 
          className="onboarding-next-button"
          onClick={onNext}
        >
          NEXT
        </button>
      </div>
    </div>
  );
}; 