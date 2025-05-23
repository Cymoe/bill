import { useState, useEffect } from 'react';
import { 
  TrendingUp,
  Target,
  Clock,
  ArrowUp,
  Zap,
  Star,
  AlertTriangle,
  Timer,
  Calculator,
  BarChart3
} from "lucide-react";

const Dashboard = () => {
  const [todayEarnings, setTodayEarnings] = useState(3247);
  const [todayHours] = useState(7.3);
  const [liveProfit, setLiveProfit] = useState(1012);

  // Real-time money counter
  useEffect(() => {
    const interval = setInterval(() => {
      setTodayEarnings(prev => prev + (Math.random() * 25));
      setLiveProfit(prev => prev + (Math.random() * 8));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const hourlyRate = todayEarnings / todayHours;
  const profitMargin = (liveProfit / todayEarnings) * 100;

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Header */}
      <div className="border-b border-[#333333] bg-[#121212] backdrop-blur sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white uppercase tracking-wide">
                PROFIT MACHINE
              </h1>
              <p className="text-gray-400 text-sm uppercase tracking-wide">Business performance dashboard</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">HOURLY RATE</div>
                <div className="text-2xl font-mono font-bold text-white">${hourlyRate.toFixed(0)}</div>
                <div className="text-xs text-[#F9D71C] uppercase tracking-wide">+$12 THIS HOUR</div>
              </div>
              <div className="text-center">
                <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">PROFIT MARGIN</div>
                <div className="text-2xl font-mono font-bold text-white">{profitMargin.toFixed(1)}%</div>
                <div className="text-xs text-[#F9D71C] uppercase tracking-wide">ABOVE TARGET</div>
              </div>
              <div className="w-12 h-12 bg-[#336699]/20 rounded-[4px] flex items-center justify-center border border-[#336699]/50">
                <div className="w-3 h-3 bg-[#336699] rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Live Money Flow */}
        <div className="bg-[#1E1E1E] rounded-[4px] p-6 border border-[#333333] shadow-lg">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white uppercase tracking-wide mb-2 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-[#F9D71C]" />
              LIVE MONEY FLOW
            </h2>
            <p className="text-gray-400 text-sm">Real-time financial performance tracking</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="bg-[#121212] rounded-[4px] p-4 border border-[#333333]">
              <div className="text-3xl font-mono font-bold text-white mb-2">
                ${todayEarnings.toFixed(0)}
              </div>
              <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">REVENUE TODAY</div>
              <div className="text-xs text-[#F9D71C]">+$23 LAST 15 MIN</div>
              <div className="w-full bg-[#333333] rounded-full h-2 mt-3">
                <div className="bg-[#336699] h-2 rounded-full" style={{width: '67%'}}></div>
              </div>
              <div className="text-xs text-gray-400 mt-1">67% OF DAILY GOAL</div>
            </div>
            
            <div className="bg-[#121212] rounded-[4px] p-4 border border-[#333333]">
              <div className="text-3xl font-mono font-bold text-white mb-2">
                ${liveProfit.toFixed(0)}
              </div>
              <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">PROFIT TODAY</div>
              <div className="text-xs text-[#388E3C]">{profitMargin.toFixed(1)}% MARGIN</div>
              <div className="flex items-center mt-3">
                <ArrowUp className="h-4 w-4 text-[#388E3C] mr-1" />
                <span className="text-[#388E3C] text-xs">+2.3% VS YESTERDAY</span>
              </div>
            </div>
            
            <div className="bg-[#121212] rounded-[4px] p-4 border border-[#333333]">
              <div className="text-3xl font-mono font-bold text-white mb-2">
                {todayHours.toFixed(1)}
              </div>
              <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">HOURS WORKED</div>
              <div className="text-xs text-[#F9D71C]">${hourlyRate.toFixed(0)}/HOUR RATE</div>
              <div className="text-xs text-[#388E3C] mt-1">BEST RATE THIS MONTH</div>
            </div>
            
            <div className="bg-[#121212] rounded-[4px] p-4 border border-[#333333]">
              <div className="text-3xl font-mono font-bold text-white mb-2">
                $47K
              </div>
              <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">THIS WEEK</div>
              <div className="text-xs text-[#F9D71C]">$9,400/DAY AVERAGE</div>
              <div className="text-xs text-[#388E3C] mt-1">+23% VS LAST WEEK</div>
            </div>
          </div>
        </div>

        {/* Profit Boosters */}
        <div className="bg-[#1E1E1E] rounded-[4px] p-6 border border-[#333333]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white uppercase tracking-wide flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-[#336699]" />
              PROFIT BOOSTERS
            </h2>
            <div className="bg-[#336699]/20 px-3 py-1 rounded-[4px] border border-[#336699]/30">
              <span className="text-[#336699] text-sm font-bold">+$89K/YEAR POTENTIAL</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-[#121212] p-5 rounded-[4px] border border-[#333333]">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Calculator className="h-5 w-5 text-[#336699] mr-2" />
                    <h3 className="font-bold text-white uppercase tracking-wide">MATERIAL MARKUP GOLDMINE</h3>
                  </div>
                  <p className="text-gray-300 mb-2 text-sm">Your current markup: <span className="text-[#D32F2F] font-bold">18%</span> • Industry standard: <span className="text-[#388E3C] font-bold">28%</span></p>
                  <p className="text-xs text-gray-400">Last 5 projects: Johnson Kitchen ($8,400 materials), Chen Deck ($3,200 materials)</p>
                </div>
                <div className="text-right ml-6">
                  <div className="text-2xl font-mono font-bold text-white mb-1">+$1,840</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-3">PER PROJECT</div>
                  <button className="bg-[#336699] hover:bg-[#0D47A1] text-white px-4 py-2 rounded-[4px] font-medium transition-colors uppercase text-sm tracking-wide">
                    Update Pricing
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-[#121212] p-5 rounded-[4px] border border-[#333333]">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-[#336699] mr-2" />
                    <h3 className="font-bold text-white uppercase tracking-wide">INVOICE SPEED = CASH SPEED</h3>
                  </div>
                  <p className="text-gray-300 mb-2 text-sm">You send invoices <span className="text-[#D32F2F] font-bold">6.3 days</span> after completion • Best practice: <span className="text-[#388E3C] font-bold">Same day</span></p>
                  <p className="text-xs text-gray-400">Getting paid faster = better cash flow = less stress</p>
                </div>
                <div className="text-right ml-6">
                  <div className="text-2xl font-mono font-bold text-white mb-1">12 days</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-3">FASTER PAYMENT</div>
                  <button className="bg-[#336699] hover:bg-[#0D47A1] text-white px-4 py-2 rounded-[4px] font-medium transition-colors uppercase text-sm tracking-wide">
                    Set Auto-Send
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#121212] p-5 rounded-[4px] border border-[#333333]">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Target className="h-5 w-5 text-[#336699] mr-2" />
                    <h3 className="font-bold text-white uppercase tracking-wide">HIGH-VALUE CLIENT MAGNET</h3>
                  </div>
                  <p className="text-gray-300 mb-2 text-sm">Your $25K+ clients live within <span className="text-[#388E3C] font-bold">3 miles downtown</span></p>
                  <p className="text-xs text-gray-400">Target zip codes: 78701, 78703, 78704 • Higher budgets, faster decisions</p>
                </div>
                <div className="text-right ml-6">
                  <div className="text-2xl font-mono font-bold text-white mb-1">+47%</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-3">PROFIT MARGINS</div>
                  <button className="bg-[#336699] hover:bg-[#0D47A1] text-white px-4 py-2 rounded-[4px] font-medium transition-colors uppercase text-sm tracking-wide">
                    Target Area
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Performance & Efficiency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#1E1E1E] rounded-[4px] p-6 border border-[#333333]">
            <h3 className="text-lg font-bold text-white uppercase tracking-wide mb-6 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-[#F9D71C]" />
              MONEY PER HOUR BY PROJECT
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-[#121212] rounded-[4px] border border-[#333333]">
                <div>
                  <span className="font-bold text-white uppercase tracking-wide">BATHROOM RENOVATIONS</span>
                  <p className="text-xs text-gray-400 mt-1">Avg project: $18K • Avg time: 91 hours</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-white">$198</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">/HOUR</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-[#121212] rounded-[4px] border border-[#333333]">
                <div>
                  <span className="font-bold text-white uppercase tracking-wide">KITCHEN REMODELS</span>
                  <p className="text-xs text-gray-400 mt-1">Avg project: $28K • Avg time: 179 hours</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-white">$156</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">/HOUR</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-[#121212] rounded-[4px] border border-[#333333]">
                <div>
                  <span className="font-bold text-white uppercase tracking-wide">DECK INSTALLATIONS</span>
                  <p className="text-xs text-gray-400 mt-1">Avg project: $12K • Avg time: 89 hours</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-white">$135</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide">/HOUR</div>
                </div>
              </div>
            </div>
            
            <div className="bg-[#121212] p-4 rounded-[4px] mt-4 border border-[#F9D71C]/30">
              <p className="text-[#F9D71C] font-bold text-xs uppercase tracking-wide">💡 INSIGHT: Focus on bathroom work for 47% higher hourly profit</p>
            </div>
          </div>

          <div className="bg-[#1E1E1E] rounded-[4px] p-6 border border-[#333333]">
            <h3 className="text-lg font-bold text-white uppercase tracking-wide mb-6 flex items-center">
              <Timer className="h-5 w-5 mr-2 text-[#336699]" />
              EFFICIENCY TRACKER
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm uppercase tracking-wide">AVERAGE PROJECT COMPLETION</span>
                <span className="text-white font-mono font-bold">14.2 DAYS</span>
              </div>
              <div className="w-full bg-[#333333] rounded-full h-3">
                <div className="bg-[#336699] h-3 rounded-full" style={{width: '82%'}}></div>
              </div>
              <div className="text-xs text-[#388E3C] uppercase tracking-wide">18% FASTER THAN LAST QUARTER</div>
              
              <div className="pt-4 border-t border-[#333333]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-sm uppercase tracking-wide">MATERIAL WASTE RATE</span>
                  <span className="text-white font-mono font-bold">8.3%</span>
                </div>
                <div className="w-full bg-[#333333] rounded-full h-3">
                  <div className="bg-[#336699] h-3 rounded-full" style={{width: '15%'}}></div>
                </div>
                <div className="text-xs text-[#388E3C] uppercase tracking-wide">BETTER THAN 15% INDUSTRY AVERAGE</div>
              </div>
              
              <div className="pt-4 border-t border-[#333333]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-sm uppercase tracking-wide">CLIENT SATISFACTION</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-white font-mono font-bold">4.8</span>
                    <Star className="h-4 w-4 text-[#F9D71C] fill-current" />
                  </div>
                </div>
                <div className="text-xs text-[#F9D71C] uppercase tracking-wide">BASED ON 23 RECENT REVIEWS</div>
              </div>
            </div>
          </div>
        </div>

        {/* Money Leaks */}
        <div className="bg-[#1E1E1E] rounded-[4px] p-6 border border-[#D32F2F]/30">
          <h2 className="text-lg font-bold text-white uppercase tracking-wide mb-6 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-[#D32F2F]" />
            MONEY LEAKS TO PLUG
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-[#121212] p-4 rounded-[4px] border border-[#D32F2F]/30">
              <h3 className="font-bold text-white uppercase tracking-wide mb-2">SLOW INVOICING</h3>
              <p className="text-sm text-gray-300 mb-2">Average 6.3 days to send invoices after job completion</p>
              <p className="text-[#D32F2F] font-bold text-sm">COSTING YOU: $8,400/YEAR IN DELAYED CASH FLOW</p>
              <button className="mt-3 bg-[#D32F2F] hover:bg-[#B71C1C] text-white px-3 py-1 rounded-[4px] text-xs uppercase tracking-wide font-medium transition-colors">
                Fix Process
              </button>
            </div>
            
            <div className="bg-[#121212] p-4 rounded-[4px] border border-[#D32F2F]/30">
              <h3 className="font-bold text-white uppercase tracking-wide mb-2">UNDERPRICED MATERIALS</h3>
              <p className="text-sm text-gray-300 mb-2">18% markup vs 28% industry standard</p>
              <p className="text-[#D32F2F] font-bold text-sm">COSTING YOU: $23K/YEAR IN PROFIT</p>
              <button className="mt-3 bg-[#D32F2F] hover:bg-[#B71C1C] text-white px-3 py-1 rounded-[4px] text-xs uppercase tracking-wide font-medium transition-colors">
                Update Rates
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
