import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateProjectWizard } from '../components/projects/CreateProjectWizard';

export const ProjectNewPage: React.FC = () => {
  const navigate = useNavigate();
  const [showWizard, setShowWizard] = useState(true);

  const handleClose = () => {
    setShowWizard(false);
    // Navigate back to projects list
    navigate('/work/projects');
  };

  const handleSuccess = () => {
    // Navigate to projects list after successful creation
    navigate('/work/projects');
  };

  return (
    <CreateProjectWizard 
      isOpen={showWizard} 
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  );
};