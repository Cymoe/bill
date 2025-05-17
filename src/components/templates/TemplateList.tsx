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
        subtitle="Manage all your templates in one place"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onFilter={() => setShowFilter(true)}
        onMenu={() => setShowMenu(true)}
      />
      {/* ...rest of the page... */}
    </DashboardLayout>
  );
}; 