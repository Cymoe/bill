import React, { useState } from 'react';

// Example data
const industries = [
  { id: 'remodel', name: 'Remodelers' },
  { id: 'newcon', name: 'New Construction' },
  { id: 'service', name: 'Service' },
  { id: 'luxury', name: 'Luxury Villas' },
];

const subcategoriesByIndustry: { [key: string]: string[] } = {
  'Remodelers': ['All Subcategories', 'Painters', 'Carpenters', 'Plumbers', 'HVAC'],
  'New Construction': ['All Subcategories', 'Framing', 'Roofing', 'Concrete'],
  'Service': ['All Subcategories', 'Cleaning', 'Repairs', 'Pooper Scooper'],
  'Luxury Villas': ['All Subcategories', 'Design', 'Landscaping', 'Pools'],
  'All Industries': ['All Subcategories'],
};

const trades = [
  { id: 'paint', name: 'Painters', industryId: 'remodel' },
  { id: 'plumb', name: 'Plumbers', industryId: 'remodel' },
  { id: 'hvac', name: 'HVAC', industryId: 'remodel' },
  // ...more
];

const lineItems = [
  { id: 1, name: 'Paint (gallon)', type: 'material', tradeId: 'paint' },
  { id: 2, name: 'Paint interior walls', type: 'labor', tradeId: 'paint' },
  { id: 3, name: 'Install copper pipe', type: 'labor', tradeId: 'plumb' },
  // ...more
];

const types = ['material', 'labor', 'service', 'subcontractor', 'equipment'];

export const LineItemBrowser = () => {
  const [selectedIndustry, setSelectedIndustry] = useState('All Industries');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All Subcategories');
  const subcategories = subcategoriesByIndustry[selectedIndustry] || ['All Subcategories'];
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null);

  const filteredTrades = trades.filter(t => t.industryId === selectedIndustry);
  const filteredLineItems = (tradeId: string) =>
    lineItems.filter(li => li.tradeId === tradeId);

  return (
    <div className="p-8">
      {/* Subcategory Dropdown Row */}
      <div className="flex items-center mb-6">
        <label className="text-lg text-white mr-4" htmlFor="subcategory-select">Category:</label>
        <select
          id="subcategory-select"
          className="bg-[#181818] text-white px-4 py-2 rounded min-w-[220px] border border-[#232323] focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedSubcategory}
          onChange={e => setSelectedSubcategory(e.target.value)}
        >
          {subcategories.map((sub: string) => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>
        <div className="flex-1" />
        <button className="text-blue-500 hover:underline text-base font-medium flex items-center">
          <span className="mr-1">+</span> Add New Item
        </button>
      </div>
      <div style={{ display: 'flex', height: '100%' }}>
        {/* Sidebar: Industries */}
        <div style={{ width: 200, borderRight: '1px solid #222', padding: 16 }}>
          {industries.map(ind => (
            <div
              key={ind.id}
              style={{
                padding: 8,
                cursor: 'pointer',
                fontWeight: ind.id === selectedIndustry ? 'bold' : 'normal',
              }}
              onClick={() => {
                setSelectedIndustry(ind.id);
                setSelectedTrade(null);
              }}
            >
              {ind.name}
            </div>
          ))}
        </div>

        {/* Main: Trades and Line Items */}
        <div style={{ flex: 1, padding: 24 }}>
          {/* Trades */}
          <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
            {filteredTrades.map(trade => (
              <button
                key={trade.id}
                style={{
                  padding: 8,
                  background: trade.id === selectedTrade ? '#333' : '#222',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedTrade(trade.id)}
              >
                {trade.name}
              </button>
            ))}
          </div>

          {/* Line Items */}
          {selectedTrade && (
            <div>
              {types.map(type => {
                const items = filteredLineItems(selectedTrade).filter(li => li.type === type);
                if (!items.length) return null;
                return (
                  <div key={type} style={{ marginBottom: 24 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: 8 }}>{type.toUpperCase()}</div>
                    <ul>
                      {items.map(li => (
                        <li key={li.id}>{li.name}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 