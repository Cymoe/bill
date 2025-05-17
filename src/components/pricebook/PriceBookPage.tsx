import React, { useState } from 'react';
import PageHeader from '../common/PageHeader';
import { DashboardLayout } from '../layouts/DashboardLayout';

export const PriceBookPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <DashboardLayout>
      <PageHeader
        title="Price Book"
        subtitle="Manage all your pricing items in one place"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onFilter={() => setShowFilter(true)}
        onMenu={() => setShowMenu(true)}
      />
      {/* ...rest of the page... */}
    </DashboardLayout>
  );
}; 