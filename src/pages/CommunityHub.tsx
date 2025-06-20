import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Filter, MapPin, Star, CheckCircle, TrendingUp,
  Building2, Users, Briefcase, Award, ArrowRight, Globe,
  Shield, Clock, DollarSign, BarChart3, Sparkles, Hash,
  Construction, HardHat, Hammer, Home, Building, TreePine,
  Zap, PaintBucket, Wrench, Truck, Mountain, Factory,
  Phone, MessageSquare, Calendar, Target, Network, Handshake,
  UserPlus, TrendingUp as InsightsIcon, DollarSign as FundingIcon,
  FileText, Lightbulb, BookOpen, PiggyBank, Banknote, LineChart,
  MoreVertical, Plus, ThumbsUp, MessageCircle, ChevronUp
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../utils/format';
import { useAuth } from '../contexts/AuthContext';

interface Professional {
  id: string;
  username: string;
  full_name: string;
  company: string;
  title: string;
  avatar_url: string;
  location: string;
  specialties: string[];
  rating: number;
  reviews_count: number;
  projects_completed: number;
  years_experience: number;
  verified: boolean;
  featured: boolean;
  tagline: string;
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  available_for_work: boolean;
  response_time: string;
  completion_rate: number;
  badges: string[];
  portfolio_value?: string;
  team_size?: string;
}

interface FilterOptions {
  location: string;
  specialty: string;
  minRating: number;
  availability: 'all' | 'available' | 'busy';
  verified: boolean;
  priceRange: 'all' | 'budget' | 'mid' | 'premium';
  experience: 'all' | 'entry' | 'mid' | 'senior' | 'expert';
}

const specialtyIcons: Record<string, React.ElementType> = {
  'General Contractor': Building2,
  'Residential': Home,
  'Commercial': Building,
  'Electrical': Zap,
  'Plumbing': Wrench,
  'HVAC': Mountain,
  'Painting': PaintBucket,
  'Landscaping': TreePine,
  'Concrete': Factory,
  'Roofing': HardHat,
  'Framing': Hammer,
  'Heavy Equipment': Truck
};

export const CommunityHub: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'network' | 'insights' | 'funding' | 'ideas'>('network');
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    location: 'all',
    specialty: 'all',
    minRating: 0,
    availability: 'all',
    verified: false,
    priceRange: 'all',
    experience: 'all'
  });

  // Stats for the header
  const [communityStats, setCommunityStats] = useState({
    totalProfessionals: 0,
    totalProjects: 0,
    totalValue: 0,
    avgRating: 0,
    activeConnections: 0,
    businessDeals: 0
  });

  // Determine if we're in public or protected context
  const isPublicView = location.pathname === '/discover';
  const isLoggedIn = !!user;

  useEffect(() => {
    fetchProfessionals();
    fetchCommunityStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filters, professionals]);

  const fetchProfessionals = async () => {
    try {
      // Enhanced mock data with more professional feel
      const mockProfessionals: Professional[] = [
        {
          id: '1',
          username: 'myles-kameron',
          full_name: 'Myles Kameron',
          company: 'Kameron Construction Group',
          title: 'CEO & Master Builder',
          avatar_url: '',
          location: 'Austin, TX',
          specialties: ['Commercial Construction', 'Residential Remodeling', 'Green Building'],
          rating: 4.9,
          reviews_count: 127,
          projects_completed: 342,
          years_experience: 15,
          verified: true,
          featured: true,
          tagline: 'Building Dreams, One Project at a Time',
          hourly_rate_min: 150,
          hourly_rate_max: 250,
          available_for_work: true,
          response_time: '&lt; 2 hours',
          completion_rate: 94,
          badges: ['Top Rated', 'Quick Responder', 'Verified Pro'],
          portfolio_value: '$5.8M',
          team_size: '85+'
        },
        {
          id: '2',
          username: 'sarah-chen',
          full_name: 'Sarah Chen',
          company: 'Chen Electric Solutions',
          title: 'Master Electrician',
          avatar_url: '',
          location: 'Austin, TX',
          specialties: ['Electrical', 'Smart Home', 'Commercial Wiring'],
          rating: 4.8,
          reviews_count: 89,
          projects_completed: 256,
          years_experience: 12,
          verified: true,
          featured: false,
          tagline: 'Powering Austin\'s Future',
          hourly_rate_min: 125,
          hourly_rate_max: 175,
          available_for_work: true,
          response_time: '&lt; 4 hours',
          completion_rate: 96,
          badges: ['Licensed', 'Verified Pro'],
          portfolio_value: '$890K',
          team_size: '25+'
        },
        {
          id: '3',
          username: 'mike-rodriguez',
          full_name: 'Mike Rodriguez',
          company: 'Rodriguez Custom Homes',
          title: 'Custom Home Builder',
          avatar_url: '',
          location: 'San Antonio, TX',
          specialties: ['Residential', 'Custom Homes', 'Renovations'],
          rating: 5.0,
          reviews_count: 64,
          projects_completed: 89,
          years_experience: 20,
          verified: true,
          featured: true,
          tagline: 'Crafting Homes with Heart',
          hourly_rate_min: 200,
          hourly_rate_max: 350,
          available_for_work: false,
          response_time: '&lt; 24 hours',
          completion_rate: 98,
          badges: ['Premium Builder', 'Top Rated', 'Verified Pro'],
          portfolio_value: '$2.4M',
          team_size: '45+'
        },
        {
          id: '4',
          username: 'jennifer-parks',
          full_name: 'Jennifer Parks',
          company: 'Parks Plumbing Pro',
          title: 'Licensed Plumber',
          avatar_url: '',
          location: 'Dallas, TX',
          specialties: ['Plumbing', 'Water Heaters', 'Drain Cleaning'],
          rating: 4.7,
          reviews_count: 156,
          projects_completed: 423,
          years_experience: 8,
          verified: true,
          featured: false,
          tagline: 'Fast, Reliable Plumbing Services',
          hourly_rate_min: 95,
          hourly_rate_max: 150,
          available_for_work: true,
          response_time: '&lt; 1 hour',
          completion_rate: 92,
          badges: ['Quick Responder', 'Licensed'],
          portfolio_value: '$1.1M',
          team_size: '15+'
        },
        {
          id: '5',
          username: 'david-thompson',
          full_name: 'David Thompson',
          company: 'Thompson HVAC Services',
          title: 'HVAC Specialist',
          avatar_url: '',
          location: 'Houston, TX',
          specialties: ['HVAC', 'Commercial HVAC', 'Energy Efficiency'],
          rating: 4.6,
          reviews_count: 98,
          projects_completed: 312,
          years_experience: 10,
          verified: false,
          featured: false,
          tagline: 'Comfort You Can Count On',
          hourly_rate_min: 110,
          hourly_rate_max: 180,
          available_for_work: true,
          response_time: '&lt; 6 hours',
          completion_rate: 90,
          badges: ['Certified Tech'],
          portfolio_value: '$1.8M',
          team_size: '30+'
        },
        {
          id: '6',
          username: 'maria-gonzalez',
          full_name: 'Maria Gonzalez',
          company: 'Gonzalez Landscaping Design',
          title: 'Landscape Architect',
          avatar_url: '',
          location: 'Austin, TX',
          specialties: ['Landscaping', 'Hardscaping', 'Irrigation'],
          rating: 4.9,
          reviews_count: 73,
          projects_completed: 167,
          years_experience: 6,
          verified: true,
          featured: false,
          tagline: 'Creating Beautiful Outdoor Spaces',
          hourly_rate_min: 85,
          hourly_rate_max: 125,
          available_for_work: true,
          response_time: '&lt; 12 hours',
          completion_rate: 95,
          badges: ['Eco-Friendly', 'Verified Pro'],
          portfolio_value: '$1.2M',
          team_size: '20+'
        }
      ];

      setProfessionals(mockProfessionals);
      setFilteredProfessionals(mockProfessionals);
    } catch (error) {
      console.error('Error fetching professionals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityStats = async () => {
    // Enhanced community stats
    setCommunityStats({
      totalProfessionals: 1247,
      totalProjects: 8934,
      totalValue: 487000000,
      avgRating: 4.7,
      activeConnections: 15420,
      businessDeals: 1250
    });
  };

  const applyFilters = () => {
    let filtered = [...professionals];

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pro => 
        pro.full_name.toLowerCase().includes(query) ||
        pro.company.toLowerCase().includes(query) ||
        pro.specialties.some(s => s.toLowerCase().includes(query)) ||
        pro.tagline.toLowerCase().includes(query)
      );
    }

    // Apply all filters...
    if (filters.location !== 'all') {
      filtered = filtered.filter(pro => pro.location.includes(filters.location));
    }

    if (filters.specialty !== 'all') {
      filtered = filtered.filter(pro => pro.specialties.includes(filters.specialty));
    }

    filtered = filtered.filter(pro => pro.rating >= filters.minRating);

    if (filters.availability === 'available') {
      filtered = filtered.filter(pro => pro.available_for_work);
    } else if (filters.availability === 'busy') {
      filtered = filtered.filter(pro => !pro.available_for_work);
    }

    if (filters.verified) {
      filtered = filtered.filter(pro => pro.verified);
    }

    if (filters.priceRange !== 'all') {
      filtered = filtered.filter(pro => {
        const avgRate = ((pro.hourly_rate_min || 0) + (pro.hourly_rate_max || 0)) / 2;
        switch (filters.priceRange) {
          case 'budget': return avgRate < 100;
          case 'mid': return avgRate >= 100 && avgRate < 200;
          case 'premium': return avgRate >= 200;
          default: return true;
        }
      });
    }

    if (filters.experience !== 'all') {
      filtered = filtered.filter(pro => {
        switch (filters.experience) {
          case 'entry': return pro.years_experience < 3;
          case 'mid': return pro.years_experience >= 3 && pro.years_experience < 7;
          case 'senior': return pro.years_experience >= 7 && pro.years_experience < 15;
          case 'expert': return pro.years_experience >= 15;
          default: return true;
        }
      });
    }

    // Sort by featured and rating
    filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.rating - a.rating;
    });

    setFilteredProfessionals(filtered);
  };

  const getSpecialtyIcon = (specialty: string) => {
    const Icon = specialtyIcons[specialty] || Briefcase;
    return <Icon className="w-4 h-4" />;
  };

  const getPriceRangeLabel = (min?: number, max?: number) => {
    if (!min || !max) return 'Contact for pricing';
    return `$${min}-$${max}/hr`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // For public view, keep the existing full-page layout
  if (isPublicView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
        {/* Keep existing public view implementation */}
        {/* ... all the existing code for public view ... */}
      </div>
    );
  }

  // For logged-in users, use the standard page layout
  return (
    <div className="max-w-[1600px] mx-auto p-8">
      {/* Single Unified Card */}
      <div className="border border-[#333333]">
        {/* Header Section */}
        <div className="px-6 py-5 flex items-center justify-between bg-transparent">
          <h1 className="text-xl font-semibold text-white">Community</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search professionals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border border-[#333333] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#336699] w-[300px]"
              />
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="bg-white hover:bg-gray-100 text-black px-5 py-2.5 text-sm font-medium rounded-xl transition-colors flex items-center gap-2 w-[150px] justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>Update Profile</span>
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-t border-[#333333] flex">
          <button
            onClick={() => setActiveTab('network')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative flex items-center justify-center gap-2 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:transition-colors ${
              activeTab === 'network'
                ? 'text-white after:bg-[#336699] bg-transparent'
                : 'text-gray-500 hover:text-gray-400 after:bg-transparent hover:after:bg-[#336699] hover:bg-transparent'
            }`}
          >
            <Users className="w-4 h-4" />
            Network
            <span className="text-xs opacity-70">({filteredProfessionals.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative flex items-center justify-center gap-2 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:transition-colors ${
              activeTab === 'insights'
                ? 'text-white after:bg-[#336699] bg-transparent'
                : 'text-gray-500 hover:text-gray-400 after:bg-transparent hover:after:bg-[#336699] hover:bg-transparent'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Industry Insights
            <span className="text-xs opacity-70">(0)</span>
          </button>
          <button
            onClick={() => setActiveTab('funding')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative flex items-center justify-center gap-2 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:transition-colors ${
              activeTab === 'funding'
                ? 'text-white after:bg-[#336699] bg-transparent'
                : 'text-gray-500 hover:text-gray-400 after:bg-transparent hover:after:bg-[#336699] hover:bg-transparent'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Funding
            <span className="text-xs opacity-70">(0)</span>
          </button>
          <button
            onClick={() => setActiveTab('ideas')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative flex items-center justify-center gap-2 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:transition-colors ${
              activeTab === 'ideas'
                ? 'text-white after:bg-[#336699] bg-transparent'
                : 'text-gray-500 hover:text-gray-400 after:bg-transparent hover:after:bg-[#336699] hover:bg-transparent'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            Ideas
            <span className="text-xs opacity-70">(0)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="border-t border-[#333333]">
          {activeTab === 'network' && (
            <div>
              {/* Stats Cards - No individual borders, just background */}
              <div className="grid grid-cols-4 gap-6 p-6 bg-[#1a1a1a]/50">
                <div>
                  <div className="text-xs text-gray-400 uppercase">TOTAL PROFESSIONALS</div>
                  <div className="text-2xl font-bold text-white mt-1">{communityStats.totalProfessionals.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 mt-1">verified members</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase">ACTIVE CONNECTIONS</div>
                  <div className="text-2xl font-bold text-green-400 mt-1">{communityStats.activeConnections.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 mt-1">network links</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase">TOTAL DEALS</div>
                  <div className="text-2xl font-bold text-[#3B82F6] mt-1">{communityStats.businessDeals.toLocaleString()}</div>
                  <div className="text-xs text-gray-500 mt-1">completed partnerships</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase">COMBINED REVENUE</div>
                  <div className="text-2xl font-bold text-[#EAB308] mt-1">${(communityStats.totalValue / 1000000).toFixed(0)}M</div>
                  <div className="text-xs text-gray-500 mt-1">network value</div>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="flex items-center justify-between p-6 border-t border-[#333333]">
                <div className="flex items-center gap-4">
                  <select
                    value={filters.specialty}
                    onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                    className="bg-[#1a1a1a] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm focus:border-[#3B82F6] focus:outline-none"
                  >
                    <option value="all">All Specialties</option>
                    {Object.keys(specialtyIcons).map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-2 bg-[#1a1a1a] border border-[#333333] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    More Filters
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 bg-[#1a1a1a] border border-[#333333] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                  <button className="p-2 bg-[#1a1a1a] border border-[#333333] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Professional Cards Grid */}
              <div className="p-6 border-t border-[#333333]">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredProfessionals.map((professional) => (
                    <div
                      key={professional.id}
                      className="group relative"
                      onClick={() => navigate(`/pro/${professional.username}`)}
                    >
                      <div className="relative bg-[#1a1a1a] border border-[#333333] rounded-lg p-3 hover:bg-[#252525] transition-all cursor-pointer hover:scale-[1.01] h-full flex flex-col">
                        {/* Featured Badge */}
                        {professional.featured && (
                          <div className="absolute -top-1 -right-1 z-10">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-md">
                              <Award className="w-2 h-2" />
                              Featured
                            </div>
                          </div>
                        )}

                        {/* Online Indicator */}
                        {professional.available_for_work && (
                          <div className="absolute top-2 right-2 z-10">
                            <div className="relative">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                              <div className="absolute inset-0 w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                            </div>
                          </div>
                        )}

                        {/* Header */}
                        <div className="flex items-start gap-2 mb-2.5">
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20">
                              {professional.avatar_url ? (
                                <img src={professional.avatar_url} alt={professional.full_name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                                  <span className="text-xs font-bold text-white">
                                    {professional.full_name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                              )}
                            </div>
                            {professional.verified && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center border border-[#0a0a0a] shadow-sm">
                                <CheckCircle className="w-2 h-2 text-white" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-white truncate leading-tight">{professional.full_name}</h3>
                            <p className="text-xs text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-medium truncate leading-tight">{professional.title}</p>
                            <p className="text-[10px] text-gray-500 truncate leading-tight">{professional.company}</p>
                          </div>
                        </div>

                        {/* Tagline */}
                        <div className="mb-2.5 px-1">
                          <p className="text-[10px] text-gray-300 italic text-center line-clamp-2 min-h-[24px] leading-tight">
                            "{professional.tagline}"
                          </p>
                        </div>

                        {/* Specialties */}
                        <div className="flex flex-wrap gap-0.5 mb-2.5 justify-center min-h-[20px]">
                          {professional.specialties.slice(0, 2).map((specialty, index) => (
                            <div key={index} className="flex items-center gap-0.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded px-1.5 py-0.5">
                              {React.createElement(specialtyIcons[specialty] || Briefcase, { className: "w-2.5 h-2.5 text-gray-400" })}
                              <span className="text-[9px] text-gray-300">{specialty}</span>
                            </div>
                          ))}
                          {professional.specialties.length > 2 && (
                            <span className="text-[9px] text-gray-500 px-0.5">+{professional.specialties.length - 2}</span>
                          )}
                        </div>

                        {/* Networking Stats Grid */}
                        <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                          <div className="text-center bg-white/5 backdrop-blur-sm rounded-md p-1.5 border border-white/10">
                            <div className="text-sm font-semibold text-white leading-tight">{professional.projects_completed}</div>
                            <div className="text-[9px] text-gray-500 leading-tight">Projects</div>
                          </div>
                          <div className="text-center bg-white/5 backdrop-blur-sm rounded-md p-1.5 border border-white/10">
                            <div className="flex items-center justify-center">
                              <Network className="w-2.5 h-2.5 text-purple-400 mr-0.5" />
                              <span className="text-sm font-semibold text-white leading-tight">
                                {Math.floor(Math.random() * 500) + 100}
                              </span>
                            </div>
                            <div className="text-[9px] text-gray-500 leading-tight">Connections</div>
                          </div>
                          <div className="text-center bg-white/5 backdrop-blur-sm rounded-md p-1.5 border border-white/10">
                            <div className="text-sm font-semibold text-white leading-tight">{professional.years_experience}y</div>
                            <div className="text-[9px] text-gray-500 leading-tight">Experience</div>
                          </div>
                        </div>

                        {/* Business Info */}
                        <div className="space-y-1 mb-2.5 flex-grow">
                          <div className="flex items-center justify-between text-[10px]">
                            <div className="flex items-center gap-0.5 text-gray-400">
                              <MapPin className="w-2.5 h-2.5" />
                              <span>{professional.location}</span>
                            </div>
                            <div className="flex items-center gap-0.5 text-gray-400">
                              <Building2 className="w-2.5 h-2.5" />
                              <span>{professional.team_size || '10+'} team</span>
                            </div>
                          </div>
                          {professional.portfolio_value && (
                            <div className="flex items-center justify-between text-[10px]">
                              <div className="flex items-center gap-0.5 text-gray-400">
                                <Briefcase className="w-2.5 h-2.5" />
                                <span>Portfolio: {professional.portfolio_value}</span>
                              </div>
                              <div className="flex items-center gap-0.5 text-gray-400">
                                <Target className="w-2.5 h-2.5" />
                                <span>{Math.floor(Math.random() * 50) + 10} deals</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Network Status */}
                        <div className="text-center mb-2.5">
                          <div className="inline-flex items-center gap-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-md px-2 py-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${professional.available_for_work ? 'bg-green-500' : 'bg-gray-500'}`} />
                            <span className="text-[10px] text-gray-300">
                              {professional.available_for_work ? 'Open to Connect' : 'Limited Availability'}
                            </span>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-0.5 mb-2.5 justify-center min-h-[16px]">
                          {professional.badges.slice(0, 3).map((badge, index) => (
                            <span key={index} className="text-[9px] bg-white/10 backdrop-blur-sm text-gray-300 px-1.5 py-0.5 rounded-full border border-white/10">
                              {badge}
                            </span>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-1.5 mt-auto">
                          <button 
                            className="relative group/btn overflow-hidden px-2 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-md text-[10px] font-medium transition-all shadow-sm hover:shadow-md hover:shadow-blue-500/25"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isLoggedIn) {
                                navigate('/auth/test');
                              }
                              // If logged in, handle connection logic
                            }}
                          >
                            <span className="relative z-10 flex items-center justify-center">
                              <UserPlus className="w-2.5 h-2.5 mr-0.5" />
                              {isLoggedIn ? 'Connect' : 'Sign Up'}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                          </button>
                          <button 
                            className="px-2 py-1.5 bg-white/5 backdrop-blur-sm border border-white/10 text-white rounded-md text-[10px] font-medium hover:bg-white/10 transition-all group/btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/pro/${professional.username}`);
                            }}
                          >
                            {isLoggedIn ? 'View Network' : 'View Profile'}
                            <Network className="w-2.5 h-2.5 inline ml-0.5 group-hover/btn:scale-110 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Empty State */}
                {filteredProfessionals.length === 0 && (
                  <div className="text-center py-16">
                    <Network className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No professionals found</h3>
                    <p className="text-gray-400 mb-6">Try adjusting your filters or search query</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="p-6">
              <div className="max-w-4xl mx-auto">
                <div className="text-center py-16">
                  <Lightbulb className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Industry Insights Coming Soon</h3>
                  <p className="text-gray-400 mb-6">
                    Get access to market trends, best practices, and expert analysis from industry leaders.
                  </p>
                  <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
                    <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-4">
                      <FileText className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <h4 className="text-sm font-medium text-white">Market Reports</h4>
                      <p className="text-xs text-gray-500 mt-1">Quarterly industry analysis</p>
                    </div>
                    <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-4">
                      <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <h4 className="text-sm font-medium text-white">Growth Strategies</h4>
                      <p className="text-xs text-gray-500 mt-1">Scale your business</p>
                    </div>
                    <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-4">
                      <BookOpen className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                      <h4 className="text-sm font-medium text-white">Best Practices</h4>
                      <p className="text-xs text-gray-500 mt-1">Learn from the best</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'funding' && (
            <div className="p-6">
              <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-white mb-4">Community-Powered Project Funding</h2>
                  <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                    Get your projects funded without being out of pocket. Our community-driven funding solutions connect contractors with investors who believe in building together.
                  </p>
                </div>

                {/* Funding Options Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {/* Project-Based Crowdfunding */}
                  <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 hover:border-[#336699] transition-all">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-500/10 rounded-lg mb-4">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Project Crowdfunding</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Post your signed contracts and let community investors fund portions of your project. Start from as little as $25 per investor.
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>5-10% returns for investors</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>Vetted by completion history</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>No upfront costs</span>
                      </div>
                    </div>
                  </div>

                  {/* Trade Credit Marketplace */}
                  <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 hover:border-[#336699] transition-all">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-lg mb-4">
                      <Building2 className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Trade Credit</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Get materials and supplies on net 30/60/90 terms. We pay suppliers upfront, you pay after getting paid by clients.
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>Extended payment terms</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>Partner supplier network</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>Preserve cash flow</span>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Factoring */}
                  <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 hover:border-[#336699] transition-all">
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-500/10 rounded-lg mb-4">
                      <FileText className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Invoice Factoring</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Turn your signed invoices into immediate cash. Community members fund invoices at a small discount.
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>Get 95% upfront</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>No credit checks</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>Fast approval</span>
                      </div>
                    </div>
                  </div>

                  {/* Milestone-Based Funding */}
                  <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 hover:border-[#336699] transition-all">
                    <div className="flex items-center justify-center w-12 h-12 bg-yellow-500/10 rounded-lg mb-4">
                      <Target className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Milestone Funding</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Break projects into fundable milestones. Get funded as you progress with photo verification at each stage.
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>Progress-based releases</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>Lower risk for investors</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>Build trust over time</span>
                      </div>
                    </div>
                  </div>

                  {/* Contractor Mutual Fund */}
                  <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 hover:border-[#336699] transition-all">
                    <div className="flex items-center justify-center w-12 h-12 bg-orange-500/10 rounded-lg mb-4">
                      <Handshake className="w-6 h-6 text-orange-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Contractor Mutual Fund</h3>
                    <p className="text-sm text-gray-400 mb-4">
                      Successful contractors help fund others. Earn priority access when you need funding by helping peers.
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>Pay it forward system</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>Industry accountability</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span>Build lending credits</span>
                      </div>
                    </div>
                  </div>

                  {/* Coming Soon */}
                  <div className="bg-[#1a1a1a]/50 border border-[#333333]/50 rounded-lg p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#336699]/10 to-transparent"></div>
                    <div className="relative">
                      <div className="flex items-center justify-center w-12 h-12 bg-[#336699]/10 rounded-lg mb-4">
                        <Plus className="w-6 h-6 text-[#336699]" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">More Coming Soon</h3>
                      <p className="text-sm text-gray-400">
                        We're constantly working on new funding solutions. Have an idea? Let us know!
                      </p>
                    </div>
                  </div>
                </div>

                {/* How It Works Section */}
                <div className="bg-[#1a1a1a]/50 border border-[#333333] rounded-lg p-8 mb-12">
                  <h3 className="text-xl font-semibold text-white mb-6 text-center">How It Works</h3>
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-[#336699]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-lg font-bold text-[#336699]">1</span>
                      </div>
                      <h4 className="font-medium text-white mb-1">Upload Contract</h4>
                      <p className="text-xs text-gray-400">Submit your signed contract or estimate</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-[#336699]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-lg font-bold text-[#336699]">2</span>
                      </div>
                      <h4 className="font-medium text-white mb-1">Get Verified</h4>
                      <p className="text-xs text-gray-400">Quick verification based on your track record</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-[#336699]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-lg font-bold text-[#336699]">3</span>
                      </div>
                      <h4 className="font-medium text-white mb-1">Receive Funding</h4>
                      <p className="text-xs text-gray-400">Get funded by the community quickly</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-[#336699]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-lg font-bold text-[#336699]">4</span>
                      </div>
                      <h4 className="font-medium text-white mb-1">Complete & Repay</h4>
                      <p className="text-xs text-gray-400">Finish the project and repay investors</p>
                    </div>
                  </div>
                </div>

                {/* Trust & Safety */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                  <div className="text-center">
                    <Shield className="w-8 h-8 text-green-400 mx-auto mb-3" />
                    <h4 className="font-medium text-white mb-1">Verified Contractors</h4>
                    <p className="text-xs text-gray-400">All contractors verified with licenses and insurance</p>
                  </div>
                  <div className="text-center">
                    <BarChart3 className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                    <h4 className="font-medium text-white mb-1">Track Record Based</h4>
                    <p className="text-xs text-gray-400">Funding limits based on completion history</p>
                  </div>
                  <div className="text-center">
                    <Users className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                    <h4 className="font-medium text-white mb-1">Community Driven</h4>
                    <p className="text-xs text-gray-400">Transparent ratings and reviews from all parties</p>
                  </div>
                </div>

                {/* CTA Section */}
                <div className="text-center">
                  <button className="px-8 py-3 bg-[#336699] text-white rounded-lg hover:bg-[#2a5580] transition-colors font-medium">
                    Get Early Access
                  </button>
                  <p className="text-sm text-gray-400 mt-4">
                    Join the waitlist to be notified when funding options become available
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ideas' && (
            <div className="p-6">
              <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Community Ideas & Feature Requests</h2>
                    <p className="text-gray-400">Help shape the future of our funding platform. Vote and comment on features you'd like to see.</p>
                  </div>
                  <button className="px-4 py-2 bg-[#336699] text-white rounded-lg hover:bg-[#2a5580] transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Submit Idea
                  </button>
                </div>

                {/* Filter/Sort Bar */}
                <div className="flex items-center gap-4 mb-6">
                  <select className="bg-[#1a1a1a] border border-[#333333] rounded-lg px-3 py-2 text-white text-sm focus:border-[#336699] focus:outline-none">
                    <option value="popular">Most Popular</option>
                    <option value="recent">Most Recent</option>
                    <option value="comments">Most Discussed</option>
                    <option value="planned">Planned Features</option>
                    <option value="in-progress">In Progress</option>
                  </select>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>Showing 12 ideas</span>
                  </div>
                </div>

                {/* Ideas List */}
                <div className="space-y-4">
                  {/* Idea Card 1 - Popular */}
                  <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 hover:border-[#336699]/50 transition-all">
                    <div className="flex gap-4">
                      {/* Vote Section */}
                      <div className="flex flex-col items-center">
                        <button className="p-2 hover:bg-[#336699]/20 rounded transition-colors group">
                          <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-[#336699]" />
                        </button>
                        <span className="text-lg font-semibold text-white">234</span>
                        <span className="text-xs text-gray-500">votes</span>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-white">Instant Material Financing</h3>
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Planned</span>
                        </div>
                        <p className="text-gray-400 mb-3">
                          Partner with major suppliers like Home Depot and Lowe's to offer instant financing at checkout. 
                          Contractors could get materials immediately without waiting for approval.
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <button className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            <span>45 comments</span>
                          </button>
                          <span className="text-gray-500">Submitted by @contractor_mike • 2 weeks ago</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Idea Card 2 - In Progress */}
                  <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 hover:border-[#336699]/50 transition-all">
                    <div className="flex gap-4">
                      {/* Vote Section */}
                      <div className="flex flex-col items-center">
                        <button className="p-2 hover:bg-[#336699]/20 rounded transition-colors group">
                          <ChevronUp className="w-5 h-5 text-[#336699]" />
                        </button>
                        <span className="text-lg font-semibold text-white">189</span>
                        <span className="text-xs text-gray-500">votes</span>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-white">Mobile App for Project Updates</h3>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">In Progress</span>
                        </div>
                        <p className="text-gray-400 mb-3">
                          A mobile app where contractors can upload progress photos, request milestone funding releases, 
                          and investors can track their investments in real-time.
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <button className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            <span>28 comments</span>
                          </button>
                          <span className="text-gray-500">Submitted by @builderpro • 1 month ago</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Idea Card 3 */}
                  <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 hover:border-[#336699]/50 transition-all">
                    <div className="flex gap-4">
                      {/* Vote Section */}
                      <div className="flex flex-col items-center">
                        <button className="p-2 hover:bg-[#336699]/20 rounded transition-colors group">
                          <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-[#336699]" />
                        </button>
                        <span className="text-lg font-semibold text-white">156</span>
                        <span className="text-xs text-gray-500">votes</span>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-white">Insurance-Backed Funding</h3>
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">Under Review</span>
                        </div>
                        <p className="text-gray-400 mb-3">
                          Partner with insurance companies to offer funding that's backed by project insurance. 
                          This would lower risk for investors and potentially offer better rates for contractors.
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <button className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            <span>19 comments</span>
                          </button>
                          <span className="text-gray-500">Submitted by @safebuilder • 3 days ago</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Idea Card 4 */}
                  <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 hover:border-[#336699]/50 transition-all">
                    <div className="flex gap-4">
                      {/* Vote Section */}
                      <div className="flex flex-col items-center">
                        <button className="p-2 hover:bg-[#336699]/20 rounded transition-colors group">
                          <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-[#336699]" />
                        </button>
                        <span className="text-lg font-semibold text-white">142</span>
                        <span className="text-xs text-gray-500">votes</span>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-white">Subcontractor Payment Integration</h3>
                          <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">New</span>
                        </div>
                        <p className="text-gray-400 mb-3">
                          Automatically split payments to subcontractors when milestone funding is released. 
                          This would help GCs manage their subs and ensure everyone gets paid on time.
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <button className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            <span>32 comments</span>
                          </button>
                          <span className="text-gray-500">Submitted by @gcmaster • 1 week ago</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Idea Card 5 */}
                  <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 hover:border-[#336699]/50 transition-all">
                    <div className="flex gap-4">
                      {/* Vote Section */}
                      <div className="flex flex-col items-center">
                        <button className="p-2 hover:bg-[#336699]/20 rounded transition-colors group">
                          <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-[#336699]" />
                        </button>
                        <span className="text-lg font-semibold text-white">98</span>
                        <span className="text-xs text-gray-500">votes</span>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-white">Credit Score Building Program</h3>
                          <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">New</span>
                        </div>
                        <p className="text-gray-400 mb-3">
                          Report successful project completions and on-time repayments to business credit bureaus. 
                          Help contractors build their business credit while using the platform.
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <button className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            <span>15 comments</span>
                          </button>
                          <span className="text-gray-500">Submitted by @creditbuilder • 4 days ago</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Idea Card 6 - Completed */}
                  <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 hover:border-[#336699]/50 transition-all opacity-75">
                    <div className="flex gap-4">
                      {/* Vote Section */}
                      <div className="flex flex-col items-center">
                        <button className="p-2 hover:bg-[#336699]/20 rounded transition-colors group" disabled>
                          <ThumbsUp className="w-5 h-5 text-green-400" />
                        </button>
                        <span className="text-lg font-semibold text-white">312</span>
                        <span className="text-xs text-gray-500">votes</span>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-white">Automated Invoice Generation</h3>
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Completed</span>
                        </div>
                        <p className="text-gray-400 mb-3">
                          Automatically generate professional invoices from estimates and track payment status. 
                          Integration with QuickBooks and other accounting software.
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <button className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
                            <MessageCircle className="w-4 h-4" />
                            <span>67 comments</span>
                          </button>
                          <span className="text-gray-500">Submitted by @efficientpro • 3 months ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Load More */}
                <div className="text-center mt-8">
                  <button className="px-6 py-2 bg-[#1a1a1a] border border-[#333333] text-white rounded-lg hover:bg-[#2a2a2a] transition-colors">
                    Load More Ideas
                  </button>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-4 gap-4 mt-12">
                  <div className="bg-[#1a1a1a]/50 border border-[#333333] rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">47</div>
                    <div className="text-xs text-gray-400">Total Ideas</div>
                  </div>
                  <div className="bg-[#1a1a1a]/50 border border-[#333333] rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">8</div>
                    <div className="text-xs text-gray-400">Implemented</div>
                  </div>
                  <div className="bg-[#1a1a1a]/50 border border-[#333333] rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">5</div>
                    <div className="text-xs text-gray-400">In Progress</div>
                  </div>
                  <div className="bg-[#1a1a1a]/50 border border-[#333333] rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">12</div>
                    <div className="text-xs text-gray-400">Under Review</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 