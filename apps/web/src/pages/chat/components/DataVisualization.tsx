import React from 'react';

interface DataVisualizationProps {
  data: any;
}

const DataVisualization: React.FC<DataVisualizationProps> = ({ data }) => {
  switch (data?.type) {
    case 'overdue_invoices':
      return (
        <div className="bg-[#1E1E1E] border border-red-600/30 rounded-[4px] p-4 mt-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-red-400 uppercase text-xs tracking-wide">💸 OVERDUE INVOICES</h4>
            <span className="text-red-400 font-bold font-mono">{data.total}</span>
          </div>
          <div className="space-y-2">
            {data.items.map((item: any, index: number) => (
              <div key={index} className={`flex justify-between items-center p-2 rounded-[4px] ${
                item.urgency === 'high' ? 'bg-red-800/30' : 
                item.urgency === 'medium' ? 'bg-orange-800/30' : 'bg-[#121212]'
              }`}>
                <div>
                  <span className="font-medium text-white">{item.client}</span>
                  <p className="text-xs text-gray-400">{item.days} days overdue</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-red-400 font-mono">{item.amount}</span>
                  <button className="block bg-[#F9D71C] text-[#121212] px-2 py-1 rounded-[4px] text-xs mt-1 font-bold uppercase">Call</button>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-[#121212] p-2 rounded-[4px] mt-3">
            <p className="text-red-400 text-xs">{data.insight}</p>
          </div>
        </div>
      );

    case 'profit_analysis':
      return (
        <div className="bg-[#1E1E1E] border border-green-600/30 rounded-[4px] p-4 mt-3">
          <h4 className="font-bold text-green-400 mb-3 uppercase text-xs tracking-wide">📊 PROFIT BY PROJECT TYPE</h4>
          <div className="space-y-3">
            {data.items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 bg-[#121212] rounded-[4px]">
                <div>
                  <span className="font-medium text-white">{item.type}</span>
                  <p className="text-xs text-gray-400">{item.projects} projects completed</p>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold font-mono">{item.profit}</div>
                  <div className="text-xs text-gray-400">{item.margin} margin</div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-[#121212] p-2 rounded-[4px] mt-3">
            <p className="text-green-400 text-xs">{data.insight}</p>
          </div>
        </div>
      );

    case 'cold_leads':
      return (
        <div className="bg-[#1E1E1E] border border-[#F9D71C]/30 rounded-[4px] p-4 mt-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-[#F9D71C] uppercase text-xs tracking-wide">🔥 LEADS GOING COLD</h4>
            <span className="text-[#F9D71C] font-bold font-mono">{data.total} at risk</span>
          </div>
          <div className="space-y-2">
            {data.items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-2 bg-[#121212] rounded-[4px]">
                <div>
                  <span className="font-medium text-white">{item.project}</span>
                  <p className="text-xs text-gray-400">{item.contact} • {item.days} days silent</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#F9D71C] font-mono">{item.value}</span>
                  <button className="block bg-[#F9D71C] text-[#121212] px-2 py-1 rounded-[4px] text-xs mt-1 font-bold uppercase">Call</button>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-[#121212] p-2 rounded-[4px] mt-3">
            <p className="text-[#F9D71C] text-xs">{data.insight}</p>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default DataVisualization;
