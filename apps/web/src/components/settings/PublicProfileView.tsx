import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Building2, MapPin, Calendar, Award, TrendingUp, 
  CheckCircle, Star, Users, Briefcase, Clock,
  DollarSign, Target, Shield, ExternalLink, Share2,
  Download, Copy, Mail, Linkedin, Globe, QrCode,
  Phone, MessageSquare, ChevronRight, Hammer,
  HardHat, Ruler, Zap, Home, Building, TreePine,
  BadgeCheck, Quote, ArrowUpRight, BarChart3,
  PieChart, Activity, FileText, Camera, Play,
  ArrowRight, Minus, GraduationCap
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/format';

interface ProfileData {
  id: string;
  full_name: string;
  company: string;
  title: string;
  tagline: string;
  bio: string;
  avatar_url: string;
  address: string;
  experience_years: number;
  skills: string[];
  certifications: string[];
  achievements: any[];
  social_links: {
    linkedin: string;
    website: string;
    portfolio: string;
  };
  // Real-time business stats
  stats: {
    projects_completed: number;
    total_revenue: number;
    avg_project_value: number;
    on_time_rate: number;
    client_satisfaction: number;
    team_size: number;
    years_in_business: number;
    repeat_client_rate: number;
  };
  privacy_settings: {
    show_revenue: boolean;
    show_exact_numbers: boolean;
    show_client_list: boolean;
  };
}

export const PublicProfileView: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (username) {
      fetchPublicProfile();
    }
  }, [username]);

  const fetchPublicProfile = async () => {
    try {
      // Fetch user profile data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('profile_public', true)
        .single();

      if (userError || !userData) {
        // Show demo data if profile not found in database
        if (username === 'myles-kameron') {
          setProfile({
            id: '1',
            full_name: 'Myles Kameron',
            company: 'Kameron Construction Group',
            title: 'CEO & Master Builder',
            tagline: 'Building Dreams, One Project at a Time',
            bio: 'With over 15 years of experience in commercial and residential construction, I specialize in transforming visions into reality. My team and I are committed to delivering exceptional quality, on time and within budget.',
            avatar_url: '',
            address: 'Austin, TX',
            experience_years: 15,
            skills: ['Project Management', 'Commercial Construction', 'Residential Remodeling', 'Green Building', 'Budget Management', 'Team Leadership'],
            certifications: ['Licensed General Contractor', 'LEED AP', 'OSHA 30-Hour', 'PMP Certified'],
            achievements: [
              { icon: '🏆', title: 'Builder of the Year 2023', description: 'Recognized by Austin Construction Association' },
              { icon: '⭐', title: '100+ 5-Star Reviews', description: 'Maintaining excellence across all projects' },
              { icon: '🏗️', title: '$50M+ in Projects', description: 'Successfully delivered over career' },
              { icon: '🌱', title: 'Green Builder Certified', description: 'Committed to sustainable construction' }
            ],
            social_links: {
              linkedin: 'https://linkedin.com/in/myleskameron',
              website: 'https://kameronconstructiongroup.com',
              portfolio: ''
            },
            stats: {
              projects_completed: 127,
              total_revenue: 52000000,
              avg_project_value: 410000,
              on_time_rate: 94,
              client_satisfaction: 4.9,
              team_size: 24,
              years_in_business: 15,
              repeat_client_rate: 78
            },
            privacy_settings: {
              show_revenue: true,
              show_exact_numbers: true,
              show_client_list: false
            }
          });
          setLoading(false);
          return;
        }
        setLoading(false);
        return;
      }

      // Fetch real-time business statistics
      const { data: stats } = await supabase
        .rpc('get_user_public_stats', { user_id: userData.id });

      setProfile({
        ...userData,
        stats: stats || {
          projects_completed: 0,
          total_revenue: 0,
          avg_project_value: 0,
          on_time_rate: 0,
          client_satisfaction: 0,
          team_size: 0,
          years_in_business: 0,
          repeat_client_rate: 0
        }
      });
    } catch (error) {
      console.error('Error fetching public profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProfileUrl = () => {
    return `${window.location.origin}/pro/${username}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getProfileUrl());
    // Show toast notification
  };

  const handleDownloadPDF = () => {
    // Implement PDF generation
    window.print();
  };

  const generateQRCode = () => {
    // Return QR code URL from service
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getProfileUrl())}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#EAB308]"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Profile Not Found</h1>
          <p className="text-gray-400">This profile is either private or doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Professional Header */}
      <div className="border-b border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-start justify-between">
            {/* Left: Professional Identity */}
            <div className="flex items-start gap-8">
              <div className="relative">
                <div className="w-24 h-24 rounded overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a]">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#EAB308] to-[#F59E0B]">
                      <Building2 className="w-10 h-10 text-black" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#10B981] rounded-full flex items-center justify-center border-2 border-[#0a0a0a]">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl font-medium text-white mb-2">{profile.full_name}</h1>
                <p className="text-lg text-[#EAB308] font-medium mb-1">{profile.title}</p>
                <p className="text-gray-400 mb-4">{profile.company}</p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {profile.address}
                  </span>
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {profile.experience_years} years experience
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Contact Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowShareModal(true)}
                className="p-3 text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded transition-all"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button className="px-6 py-3 bg-[#1a1a1a] text-white font-medium rounded hover:bg-[#2a2a2a] transition-all border border-[#2a2a2a]">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Contact
              </button>
              <button className="px-6 py-3 bg-[#EAB308] text-black font-semibold rounded hover:bg-[#F59E0B] transition-all">
                <Phone className="w-4 h-4 inline mr-2" />
                Consult
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-12 gap-8">
          
          {/* Primary Content */}
          <div className="col-span-8">
            
            {/* Professional Summary */}
            <div className="mb-12">
              <h2 className="text-xl font-medium text-white mb-6">Professional Overview</h2>
              <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded p-8">
                <p className="text-gray-300 leading-relaxed text-lg">{profile.bio}</p>
              </div>
            </div>

            {/* Expertise Areas */}
            <div className="mb-12">
              <h2 className="text-xl font-medium text-white mb-6">Areas of Expertise</h2>
              <div className="grid grid-cols-2 gap-4">
                {profile.skills.map((skill, index) => (
                  <div key={index} className="bg-[#0f0f0f] border border-[#1a1a1a] rounded p-4 flex items-center justify-between group hover:border-[#2a2a2a] transition-all">
                    <span className="text-white">{skill}</span>
                    <div className="w-2 h-2 bg-[#EAB308] rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Professional Credentials */}
            <div>
              <h2 className="text-xl font-medium text-white mb-6">Professional Credentials</h2>
              <div className="space-y-4">
                {profile.certifications.map((cert, index) => (
                  <div key={index} className="bg-[#0f0f0f] border border-[#1a1a1a] rounded p-6 flex items-center gap-6">
                    <div className="w-10 h-10 bg-[#10B981]/20 rounded flex items-center justify-center">
                      <BadgeCheck className="w-5 h-5 text-[#10B981]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium text-lg">{cert}</h3>
                      <p className="text-gray-500 text-sm mt-1">Active Certification</p>
                    </div>
                    <div className="text-xs text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full font-medium">
                      VERIFIED
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-span-4">
            
            {/* Professional Details */}
            <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded p-6 mb-8">
              <h3 className="text-white font-medium mb-6">Professional Details</h3>
              
              <div className="space-y-6">
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wide block mb-2">Industry Experience</span>
                  <span className="text-white font-medium">{profile.experience_years} Years</span>
                </div>
                
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wide block mb-2">Team Size</span>
                  <span className="text-white font-medium">{profile.stats.team_size} Professionals</span>
                </div>
                
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wide block mb-2">Location</span>
                  <span className="text-white font-medium">{profile.address}</span>
                </div>
                
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wide block mb-2">Specialization</span>
                  <span className="text-white font-medium">Commercial & Residential</span>
                </div>
              </div>
            </div>

            {/* Recognition */}
            <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded p-6 mb-8">
              <h3 className="text-white font-medium mb-6">Recognition</h3>
              
              <div className="space-y-6">
                {profile.achievements.slice(0, 3).map((achievement, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <h4 className="text-white font-medium">{achievement.title}</h4>
                      <p className="text-gray-500 text-sm mt-1">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-[#0f0f0f] border border-[#1a1a1a] rounded p-6">
              <h3 className="text-white font-medium mb-6">Get In Touch</h3>
              
              <div className="space-y-4">
                <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#EAB308] text-black font-semibold rounded hover:bg-[#F59E0B] transition-all">
                  <Phone className="w-4 h-4" />
                  Schedule Consultation
                </button>
                
                <button className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#1a1a1a] text-white rounded hover:bg-[#2a2a2a] transition-all border border-[#2a2a2a]">
                  <Mail className="w-4 h-4" />
                  Send Message
                </button>
                
                {profile.social_links.website && (
                  <button className="w-full flex items-center justify-center gap-3 px-6 py-3 text-gray-400 rounded hover:text-white hover:bg-[#1a1a1a] transition-all">
                    <Globe className="w-4 h-4" />
                    Visit Website
                  </button>
                )}
              </div>
              
              <div className="mt-6 pt-6 border-t border-[#1a1a1a] text-center">
                <p className="text-xs text-gray-500">
                  Typically responds within <span className="text-white font-medium">24 hours</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f0f] rounded p-6 max-w-md w-full border border-[#2a2a2a]">
            <h3 className="text-lg font-semibold text-white mb-4">Share Profile</h3>
            
            <div className="flex justify-center mb-4 p-4 bg-white rounded">
              <img src={generateQRCode()} alt="QR Code" className="rounded" />
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#2a2a2a] text-white text-sm rounded hover:bg-[#3a3a3a] transition-all"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </button>
              
              <button
                onClick={handleDownloadPDF}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#2a2a2a] text-white text-sm rounded hover:bg-[#3a3a3a] transition-all"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-4 px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 