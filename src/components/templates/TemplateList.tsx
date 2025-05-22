import React, { useState } from 'react';
import { PageHeader } from '../common/PageHeader';
import { DashboardLayout } from '../layouts/DashboardLayout';

export const TemplateList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <DashboardLayout>
      <PageHeader
        title="Templates"
        hideTitle={true}
      />
      {/* ...rest of the page... */}
    </DashboardLayout>
  );
}; 