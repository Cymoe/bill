import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { 
  User, Building2, MapPin, Globe, Camera, Share2, Trophy, Shield, Zap,
  Linkedin, Phone, Mail, Calendar, Award, Target, Code, Briefcase,
  MessageSquare, Eye, X 
} from "lucide-react";

interface Skill {
  id: string;
  name: string;
  level: string;
  category: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
}

interface PrivacySettings {
  profileVisibility: string;
  showContact: boolean;
  showExperience: boolean;
  allowMessages: boolean;
  showOnlinePresence: boolean;
}

interface ProfileData {
  name: string;
  tagline: string;
  company: string;
  title: string;
  yearsExperience: string;
  phone: string;
  address: string;
  bio: string;
  linkedinUrl: string;
  websiteUrl: string;
  portfolioUrl: string;
  skills: Skill[];
  achievements: Achievement[];
  privacy: PrivacySettings;
  avatarUrl: string;
}

export function UserProfile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.user_metadata?.full_name || user?.email || "",
    tagline: "",
    company: "",
    title: "",
    yearsExperience: "",
    phone: "",
    address: "",
    bio: "",
    linkedinUrl: "",
    websiteUrl: "",
    portfolioUrl: "",
    skills: [],
    achievements: [],
    privacy: {
      profileVisibility: "public",
      showContact: true,
      showExperience: true,
      allowMessages: true,
      showOnlinePresence: true,
    },
    avatarUrl: user?.user_metadata?.avatar_url || "",
  });

  const [newSkill, setNewSkill] = useState({ name: "", level: "beginner", category: "technical" });
  const [newAchievement, setNewAchievement] = useState({ title: "", description: "", date: "", type: "award" });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  useEffect(() => {
    calculateCompletion();
  }, [profileData]);

  const calculateCompletion = () => {
    const fields = [
      profileData.name,
      profileData.tagline,
      profileData.company,
      profileData.title,
      profileData.yearsExperience,
      profileData.phone,
      profileData.address,
      profileData.bio,
      profileData.avatarUrl
    ];
    
    const filledFields = fields.filter(field => field && field.trim() !== "").length;
    const totalFields = fields.length;
    
    // Add points for skills and achievements
    const skillPoints = profileData.skills.length > 0 ? 10 : 0;
    const achievementPoints = profileData.achievements.length > 0 ? 10 : 0;
    const linkPoints = (profileData.linkedinUrl || profileData.websiteUrl || profileData.portfolioUrl) ? 5 : 0;
    
    const basePercentage = (filledFields / totalFields) * 75;
    const totalPercentage = Math.min(100, Math.round(basePercentage + skillPoints + achievementPoints + linkPoints));
    
    setCompletionPercentage(totalPercentage);
  };

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfileData({
          name: data.name || user?.user_metadata?.full_name || user?.email || "",
          tagline: data.tagline || "",
          company: data.company || "",
          title: data.title || "",
          yearsExperience: data.years_experience || "",
          phone: data.phone || "",
          address: data.address || "",
          bio: data.bio || "",
          linkedinUrl: data.linkedin_url || "",
          websiteUrl: data.website_url || "",
          portfolioUrl: data.portfolio_url || "",
          skills: data.skills || [],
          achievements: data.achievements || [],
          privacy: data.privacy_settings || {
            profileVisibility: "public",
            showContact: true,
            showExperience: true,
            allowMessages: true,
            showOnlinePresence: true,
          },
          avatarUrl: data.avatar_url || user?.user_metadata?.avatar_url || "",
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load profile data');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const updateData = {
        name: profileData.name,
        tagline: profileData.tagline,
        company: profileData.company,
        title: profileData.title,
        years_experience: profileData.yearsExperience,
        phone: profileData.phone,
        address: profileData.address,
        bio: profileData.bio,
        linkedin_url: profileData.linkedinUrl,
        website_url: profileData.websiteUrl,
        portfolio_url: profileData.portfolioUrl,
        skills: profileData.skills,
        achievements: profileData.achievements,
        privacy_settings: profileData.privacy,
        profile_completion: completionPercentage,
        avatar_url: profileData.avatarUrl,
      };

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user?.id);

      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update failed:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSkill = () => {
    if (newSkill.name.trim()) {
      const skill: Skill = {
        id: Date.now().toString(),
        name: newSkill.name,
        level: newSkill.level,
        category: newSkill.category,
      };
      setProfileData((prev: ProfileData) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
      setNewSkill({ name: "", level: "beginner", category: "technical" });
    }
  };

  const removeSkill = (skillId: string) => {
    setProfileData((prev: ProfileData) => ({
      ...prev,
      skills: prev.skills.filter((s: Skill) => s.id !== skillId),
    }));
  };

  const addAchievement = () => {
    if (newAchievement.title.trim() && newAchievement.description.trim()) {
      const achievement: Achievement = {
        id: Date.now().toString(),
        title: newAchievement.title,
        description: newAchievement.description,
        date: newAchievement.date,
        type: newAchievement.type,
      };
      setProfileData((prev: ProfileData) => ({
        ...prev,
        achievements: [...prev.achievements, achievement],
      }));
      setNewAchievement({ title: "", description: "", date: "", type: "award" });
    }
  };

  const removeAchievement = (achievementId: string) => {
    setProfileData((prev: ProfileData) => ({
      ...prev,
      achievements: prev.achievements.filter((a: Achievement) => a.id !== achievementId),
    }));
  };

  const togglePrivacySetting = (setting: keyof PrivacySettings) => {
    setProfileData((prev: ProfileData) => ({
      ...prev,
      privacy: { ...prev.privacy, [setting]: !prev.privacy[setting] },
    }));
  };

  if (!user) {
    return null;
  }

  const initials = profileData.name
    ? profileData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'UN';

  return (
    <div className="min-h-screen bg-[#111827]">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-[#1F2937] border border-[#374151] rounded-[8px] shadow-lg p-8">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              {/* Profile Picture & Basic Info */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full border-4 border-[#374151] shadow-xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center text-white text-2xl font-bold">
                    {profileData.avatarUrl ? (
                      <img 
                        src={profileData.avatarUrl} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <button className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0 shadow-lg bg-[#3B82F6] hover:bg-[#2563EB] flex items-center justify-center transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-[#374151] rounded-[8px] bg-transparent hover:bg-[#374151] transition-colors text-white">
                  <Share2 className="w-4 h-4" />
                  Share Profile
                </button>
              </div>

              {/* Profile Details */}
              <div className="flex-1 space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">{profileData.name}</h1>
                    <span className="px-3 py-1 rounded-[8px] bg-gradient-to-r from-[#EAB308] to-[#DC2626] text-black text-sm font-medium">
                      Pro Member
                    </span>
                  </div>
                  <p className="text-[#9CA3AF] text-lg">{profileData.tagline || "Add a professional tagline..."}</p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <button className="h-auto p-4 flex flex-col items-center gap-2 border border-[#374151] rounded-[8px] bg-[#1F2937] hover:bg-[#374151] transition-colors">
                    <Building2 className="w-5 h-5 text-[#3B82F6]" />
                    <div className="text-center">
                      <div className="font-medium text-sm text-white">
                        {profileData.company || "Add Company"}
                      </div>
                    </div>
                  </button>
                  <button className="h-auto p-4 flex flex-col items-center gap-2 border border-[#374151] rounded-[8px] bg-[#1F2937] hover:bg-[#374151] transition-colors">
                    <User className="w-5 h-5 text-[#10B981]" />
                    <div className="text-center">
                      <div className="font-medium text-sm text-white">
                        {profileData.title || "Add Title"}
                      </div>
                    </div>
                  </button>
                  <button className="h-auto p-4 flex flex-col items-center gap-2 border border-[#374151] rounded-[8px] bg-[#1F2937] hover:bg-[#374151] transition-colors">
                    <MapPin className="w-5 h-5 text-[#EF4444]" />
                    <div className="text-center">
                      <div className="font-medium text-sm text-white">
                        {profileData.address ? "Location Set" : "Add Location"}
                      </div>
                    </div>
                  </button>
                  <button className="h-auto p-4 flex flex-col items-center gap-2 border border-[#374151] rounded-[8px] bg-[#1F2937] hover:bg-[#374151] transition-colors">
                    <Zap className="w-5 h-5 text-[#8B5CF6]" />
                    <div className="text-center">
                      <div className="font-medium text-sm text-white">
                        {profileData.yearsExperience || "Add Experience"}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Progress Circle */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#374151"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#3B82F6"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionPercentage / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{completionPercentage}%</span>
                  </div>
                </div>
                <p className="text-sm text-[#9CA3AF] text-center">Profile Complete</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-[#374151] bg-[#1F2937] rounded-t-[8px]">
            {[
              { value: "profile", label: "Profile Info", icon: User },
              { value: "skills", label: "Skills & Expertise", icon: Zap },
              { value: "achievements", label: "Achievements", icon: Trophy },
              { value: "privacy", label: "Privacy & Sharing", icon: Shield },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.value
                    ? "text-white border-b-2 border-[#3B82F6]"
                    : "text-[#9CA3AF] hover:text-white"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Professional Information */}
                <div className="bg-[#1F2937] border border-[#374151] rounded-[8px] shadow-lg">
                  <div className="p-6 border-b border-[#374151]">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                      <Building2 className="w-5 h-5 text-[#3B82F6]" />
                      Professional Information
                    </h3>
                    <p className="text-sm text-[#9CA3AF] mt-1">Tell us about your professional background</p>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="tagline" className="text-sm font-medium text-white">
                        Professional Tagline
                      </label>
                      <input
                        id="tagline"
                        type="text"
                        placeholder="e.g., Expert Builder | 20+ Years | Luxury Homes"
                        value={profileData.tagline}
                        onChange={(e) => handleInputChange("tagline", e.target.value)}
                        className="w-full px-3 py-2 bg-[#374151] border border-[#4B5563] rounded-[8px] text-white placeholder-[#9CA3AF] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6] focus:ring-opacity-20 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="company" className="text-sm font-medium text-white">
                        Company Name
                      </label>
                      <input
                        id="company"
                        type="text"
                        placeholder="Your Company Name"
                        value={profileData.company}
                        onChange={(e) => handleInputChange("company", e.target.value)}
                        className="w-full px-3 py-2 bg-[#374151] border border-[#4B5563] rounded-[8px] text-white placeholder-[#9CA3AF] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6] focus:ring-opacity-20 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="title" className="text-sm font-medium text-white">
                        Job Title
                      </label>
                      <input
                        id="title"
                        type="text"
                        placeholder="e.g., CEO, Project Manager, Lead Contractor"
                        value={profileData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        className="w-full px-3 py-2 bg-[#374151] border border-[#4B5563] rounded-[8px] text-white placeholder-[#9CA3AF] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6] focus:ring-opacity-20 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="experience" className="text-sm font-medium text-white">
                        Years of Experience
                      </label>
                      <select
                        id="experience"
                        value={profileData.yearsExperience}
                        onChange={(e) => handleInputChange("yearsExperience", e.target.value)}
                        className="w-full px-3 py-2 bg-[#374151] border border-[#4B5563] rounded-[8px] text-white focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6] focus:ring-opacity-20 transition-colors"
                      >
                        <option value="">Select experience level</option>
                        <option value="0-1">0-1 years</option>
                        <option value="2-5">2-5 years</option>
                        <option value="6-10">6-10 years</option>
                        <option value="11-15">11-15 years</option>
                        <option value="16-20">16-20 years</option>
                        <option value="20+">20+ years</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact & Location */}
                <div className="bg-[#1F2937] border border-[#374151] rounded-[8px] shadow-lg">
                  <div className="p-6 border-b border-[#374151]">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                      <MapPin className="w-5 h-5 text-[#10B981]" />
                      Contact & Location
                    </h3>
                    <p className="text-sm text-[#9CA3AF] mt-1">How can clients reach you?</p>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-white">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="w-full px-3 py-2 bg-[#374151] border border-[#4B5563] rounded-[8px] text-white placeholder-[#9CA3AF] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6] focus:ring-opacity-20 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="address" className="text-sm font-medium text-white">
                        Business Address
                      </label>
                      <input
                        id="address"
                        type="text"
                        placeholder="123 Main St, City, State 12345"
                        value={profileData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        className="w-full px-3 py-2 bg-[#374151] border border-[#4B5563] rounded-[8px] text-white placeholder-[#9CA3AF] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6] focus:ring-opacity-20 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="bio" className="text-sm font-medium text-white">
                        Professional Bio
                      </label>
                      <textarea
                        id="bio"
                        placeholder="Tell us about your experience, specialties, and what makes you unique..."
                        value={profileData.bio}
                        onChange={(e) => handleInputChange("bio", e.target.value)}
                        className="w-full px-3 py-2 bg-[#374151] border border-[#4B5563] rounded-[8px] text-white placeholder-[#9CA3AF] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6] focus:ring-opacity-20 transition-colors min-h-[120px] resize-y"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Online Presence */}
              <div className="bg-[#1F2937] border border-[#374151] rounded-[8px] shadow-lg">
                <div className="p-6 border-b border-[#374151]">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                    <Globe className="w-5 h-5 text-[#8B5CF6]" />
                    Online Presence
                  </h3>
                  <p className="text-sm text-[#9CA3AF] mt-1">Connect your professional profiles and showcase your work</p>
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="linkedin" className="text-sm font-medium text-white flex items-center gap-2">
                        <Linkedin className="w-4 h-4 text-[#3B82F6]" />
                        LinkedIn Profile URL
                      </label>
                      <input
                        id="linkedin"
                        type="url"
                        placeholder="https://linkedin.com/in/yourprofile"
                        value={profileData.linkedinUrl}
                        onChange={(e) => handleInputChange("linkedinUrl", e.target.value)}
                        className="w-full px-3 py-2 bg-[#374151] border border-[#4B5563] rounded-[8px] text-white placeholder-[#9CA3AF] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6] focus:ring-opacity-20 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="website" className="text-sm font-medium text-white flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#10B981]" />
                        Company Website
                      </label>
                      <input
                        id="website"
                        type="url"
                        placeholder="https://yourcompany.com"
                        value={profileData.websiteUrl}
                        onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                        className="w-full px-3 py-2 bg-[#374151] border border-[#4B5563] rounded-[8px] text-white placeholder-[#9CA3AF] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6] focus:ring-opacity-20 transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="portfolio" className="text-sm font-medium text-white flex items-center gap-2">
                        <Camera className="w-4 h-4 text-[#8B5CF6]" />
                        Portfolio URL
                      </label>
                      <input
                        id="portfolio"
                        type="url"
                        placeholder="https://yourportfolio.com"
                        value={profileData.portfolioUrl}
                        onChange={(e) => handleInputChange("portfolioUrl", e.target.value)}
                        className="w-full px-3 py-2 bg-[#374151] border border-[#4B5563] rounded-[8px] text-white placeholder-[#9CA3AF] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6] focus:ring-opacity-20 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-[#EAB308] hover:bg-[#CA8A04] text-black font-medium rounded-[8px] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "skills" && (
            <div className="space-y-6">
              <div className="bg-[#1F2937] border border-[#374151] rounded-[8px] shadow-lg">
                <div className="p-6 border-b border-[#374151]">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                    <Zap className="w-5 h-5 text-[#EAB308]" />
                    Skills & Expertise
                  </h3>
                  <p className="text-sm text-[#9CA3AF] mt-1">Showcase your professional skills and areas of expertise</p>
                </div>
                <div className="p-6 space-y-6">
                  {/* Add New Skill */}
                  <div className="bg-[#374151] border-2 border-dashed border-[#6B7280] rounded-[8px] p-4">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="skillName" className="text-sm font-medium text-white">
                          Skill Name
                        </label>
                        <input
                          id="skillName"
                          type="text"
                          placeholder="e.g., Project Management"
                          value={newSkill.name}
                          onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                          className="w-full px-3 py-2 bg-[#1F2937] border border-[#4B5563] rounded-[8px] text-white placeholder-[#9CA3AF] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6] focus:ring-opacity-20 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="skillLevel" className="text-sm font-medium text-white">
                          Proficiency Level
                        </label>
                        <select
                          id="skillLevel"
                          value={newSkill.level}
                          onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                          className="w-full px-3 py-2 bg-[#1F2937] border border-[#4B5563] rounded-[8px] text-white focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6] focus:ring-opacity-20 transition-colors"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="expert">Expert</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="skillCategory" className="text-sm font-medium text-white">
                          Category
                        </label>
                        <select
                          id="skillCategory"
                          value={newSkill.category}
                          onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                          className="w-full px-3 py-2 bg-[#1F2937] border border-[#4B5563] rounded-[8px] text-white focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6] focus:ring-opacity-20 transition-colors"
                        >
                          <option value="technical">Technical</option>
                          <option value="management">Management</option>
                          <option value="communication">Communication</option>
                          <option value="creative">Creative</option>
                          <option value="analytical">Analytical</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={addSkill}
                          className="w-full h-[40px] bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium rounded-[8px] transition-colors"
                        >
                          Add Skill
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Skills Display */}
                  {profileData.skills.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Your Skills</h3>
                      <div className="grid gap-4">
                        {["technical", "management", "communication", "creative", "analytical"].map((category) => {
                          const categorySkills = profileData.skills.filter((skill) => skill.category === category);
                          if (categorySkills.length === 0) return null;

                          return (
                            <div key={category} className="bg-[#374151] rounded-[8px] p-4">
                              <h4 className="font-medium text-white mb-3 capitalize">{category} Skills</h4>
                              <div className="flex flex-wrap gap-2">
                                {categorySkills.map((skill) => (
                                  <div key={skill.id} className="group relative">
                                    <span
                                      className={`inline-flex items-center px-3 py-1 rounded-[8px] text-sm font-medium ${
                                        skill.level === "expert"
                                          ? "bg-[#10B981] bg-opacity-20 text-[#10B981]"
                                          : skill.level === "advanced"
                                            ? "bg-[#3B82F6] bg-opacity-20 text-[#3B82F6]"
                                            : skill.level === "intermediate"
                                              ? "bg-[#EAB308] bg-opacity-20 text-[#EAB308]"
                                              : "bg-[#6B7280] bg-opacity-20 text-[#9CA3AF]"
                                      }`}
                                    >
                                      {skill.name} • {skill.level}
                                      <button
                                        onClick={() => removeSkill(skill.id)}
                                        className="ml-2 text-[#EF4444] hover:text-[#DC2626] opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        ×
                                      </button>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "achievements" && (
            <div className="space-y-6">
              <div className="bg-[#1F2937] border border-[#374151] rounded-[8px] shadow-lg">
                <div className="p-6 border-b border-[#374151]">
                  <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                    <Trophy className="w-5 h-5 text-[#EAB308]" />
                    Achievements
                  </h3>
                  <p className="text-sm text-[#9CA3AF] mt-1">Highlight your professional accomplishments and awards</p>
                </div>
                <div className="p-6 space-y-6">
                  {/* Add New Achievement */}
                  <div className="bg-[#374151] border-2 border-dashed border-[#6B7280] rounded-[8px] p-4">
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <label htmlFor="achievementTitle" className="text-sm font-medium text-white">
                          Achievement Title
                        </label>
                        <input
                          id="achievementTitle"
                          type="text"
                          placeholder="e.g., Best Contractor of the Year"
                          value={newAchievement.title}
                          onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                          className="w-full px-3 py-2 bg-[#1F2937] border border-[#4B5563] rounded-[8px] text-white placeholder-[#9CA3AF] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6] focus:ring-opacity-20 transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="achievementDate" className="text-sm font-medium text-white">
                          Date
                        </label>
                        <input
                          id="achievementDate"
                          type="date"
                          value={newAchievement.date}
                          onChange={(e) => setNewAchievement({ ...newAchievement, date: e.target.value })}
                          className="w-full px-3 py-2 bg-[#1F2937] border border-[#4B5563] rounded-[8px] text-white focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6] focus:ring-opacity-20 transition-colors"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="achievementType" className="text-sm font-medium text-white">
                          Type
                        </label>
                        <select
                          id="achievementType"
                          value={newAchievement.type}
                          onChange={(e) => setNewAchievement({ ...newAchievement, type: e.target.value })}
                          className="w-full px-3 py-2 bg-[#1F2937] border border-[#4B5563] rounded-[8px] text-white focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6] focus:ring-opacity-20 transition-colors"
                        >
                          <option value="award">Award</option>
                          <option value="certification">Certification</option>
                          <option value="project">Major Project</option>
                          <option value="recognition">Recognition</option>
                          <option value="milestone">Milestone</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label htmlFor="achievementDescription" className="text-sm font-medium text-white">
                          Description
                        </label>
                        <input
                          id="achievementDescription"
                          type="text"
                          placeholder="Brief description of the achievement"
                          value={newAchievement.description}
                          onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                          className="w-full px-3 py-2 bg-[#1F2937] border border-[#4B5563] rounded-[8px] text-white placeholder-[#9CA3AF] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6] focus:ring-opacity-20 transition-colors"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={addAchievement}
                          className="w-full h-[40px] bg-[#EAB308] hover:bg-[#CA8A04] text-black font-medium rounded-[8px] transition-colors"
                        >
                          Add Achievement
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Achievements Display */}
                  {profileData.achievements.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white">Your Achievements</h3>
                      <div className="grid gap-4">
                        {profileData.achievements.map((achievement) => (
                          <div key={achievement.id} className="bg-[#374151] rounded-[8px] p-4 hover:bg-[#4B5563] transition-colors group">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div
                                    className={`p-2 rounded-full ${
                                      achievement.type === "award"
                                        ? "bg-[#EAB308] bg-opacity-20 text-[#EAB308]"
                                        : achievement.type === "certification"
                                          ? "bg-[#3B82F6] bg-opacity-20 text-[#3B82F6]"
                                          : achievement.type === "project"
                                            ? "bg-[#10B981] bg-opacity-20 text-[#10B981]"
                                            : achievement.type === "recognition"
                                              ? "bg-[#8B5CF6] bg-opacity-20 text-[#8B5CF6]"
                                              : "bg-[#6B7280] bg-opacity-20 text-[#9CA3AF]"
                                    }`}
                                  >
                                    <Trophy className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-white">{achievement.title}</h4>
                                    <p className="text-sm text-[#9CA3AF] capitalize">{achievement.type}</p>
                                  </div>
                                </div>
                                <p className="text-white mb-2">{achievement.description}</p>
                                {achievement.date && (
                                  <p className="text-sm text-[#9CA3AF]">
                                    {new Date(achievement.date).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => removeAchievement(achievement.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-[#EF4444] hover:text-[#DC2626] p-2"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Profile Visibility */}
                <div className="bg-[#1F2937] border border-[#374151] rounded-[8px] shadow-lg">
                  <div className="p-6 border-b border-[#374151]">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                      <Shield className="w-5 h-5 text-[#10B981]" />
                      Profile Visibility
                    </h3>
                    <p className="text-sm text-[#9CA3AF] mt-1">Control who can see your profile information</p>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white">Profile Visibility</label>
                        <select
                          value={profileData.privacy.profileVisibility}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              privacy: { ...prev.privacy, profileVisibility: e.target.value },
                            }))
                          }
                          className="w-full px-3 py-2 bg-[#374151] border border-[#4B5563] rounded-[8px] text-white focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6] focus:ring-opacity-20 transition-colors"
                        >
                          <option value="public">Public - Anyone can view</option>
                          <option value="members">Members Only - Registered users only</option>
                          <option value="private">Private - Only you can view</option>
                        </select>
                      </div>

                      <div className="space-y-4">
                        <label className="text-sm font-medium text-white">Information Visibility</label>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-[#374151] rounded-[8px]">
                            <div>
                              <p className="font-medium text-sm text-white">Contact Information</p>
                              <p className="text-xs text-[#9CA3AF]">Phone number and business address</p>
                            </div>
                            <button
                              onClick={() => togglePrivacySetting("showContact")}
                              className={`px-4 py-2 text-sm font-medium rounded-[8px] transition-colors ${
                                profileData.privacy.showContact
                                  ? "bg-[#10B981] hover:bg-[#059669] text-white"
                                  : "bg-[#4B5563] hover:bg-[#6B7280] text-white"
                              }`}
                            >
                              {profileData.privacy.showContact ? "Visible" : "Hidden"}
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-[#374151] rounded-[8px]">
                            <div>
                              <p className="font-medium text-sm text-white">Experience Details</p>
                              <p className="text-xs text-[#9CA3AF]">Years of experience and job history</p>
                            </div>
                            <button
                              onClick={() => togglePrivacySetting("showExperience")}
                              className={`px-4 py-2 text-sm font-medium rounded-[8px] transition-colors ${
                                profileData.privacy.showExperience
                                  ? "bg-[#10B981] hover:bg-[#059669] text-white"
                                  : "bg-[#4B5563] hover:bg-[#6B7280] text-white"
                              }`}
                            >
                              {profileData.privacy.showExperience ? "Visible" : "Hidden"}
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-[#374151] rounded-[8px]">
                            <div>
                              <p className="font-medium text-sm text-white">Online Presence</p>
                              <p className="text-xs text-[#9CA3AF]">Social media and website links</p>
                            </div>
                            <button
                              onClick={() => togglePrivacySetting("showOnlinePresence")}
                              className={`px-4 py-2 text-sm font-medium rounded-[8px] transition-colors ${
                                profileData.privacy.showOnlinePresence
                                  ? "bg-[#10B981] hover:bg-[#059669] text-white"
                                  : "bg-[#4B5563] hover:bg-[#6B7280] text-white"
                              }`}
                            >
                              {profileData.privacy.showOnlinePresence ? "Visible" : "Hidden"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Communication Preferences */}
                <div className="bg-[#1F2937] border border-[#374151] rounded-[8px] shadow-lg">
                  <div className="p-6 border-b border-[#374151]">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                      <Globe className="w-5 h-5 text-[#3B82F6]" />
                      Communication & Sharing
                    </h3>
                    <p className="text-sm text-[#9CA3AF] mt-1">Manage how others can contact and share your profile</p>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-[#374151] rounded-[8px]">
                        <div>
                          <p className="font-medium text-sm text-white">Allow Direct Messages</p>
                          <p className="text-xs text-[#9CA3AF]">Let other users send you messages</p>
                        </div>
                        <button
                          onClick={() => togglePrivacySetting("allowMessages")}
                          className={`px-4 py-2 text-sm font-medium rounded-[8px] transition-colors ${
                            profileData.privacy.allowMessages
                              ? "bg-[#3B82F6] hover:bg-[#2563EB] text-white"
                              : "bg-[#4B5563] hover:bg-[#6B7280] text-white"
                          }`}
                        >
                          {profileData.privacy.allowMessages ? "Enabled" : "Disabled"}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-medium text-white">Profile Sharing</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-[#374151] rounded-[8px] bg-transparent hover:bg-[#374151] transition-colors text-white">
                          <Share2 className="w-4 h-4" />
                          Copy Link
                        </button>
                        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-[#374151] rounded-[8px] bg-transparent hover:bg-[#374151] transition-colors text-white">
                          <Globe className="w-4 h-4" />
                          Share Profile
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-medium text-white">Data Management</label>
                      <div className="space-y-2">
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-[#374151] rounded-[8px] bg-transparent hover:bg-[#374151] transition-colors text-white">
                          Download Profile Data
                        </button>
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-[#EF4444] rounded-[8px] bg-transparent hover:bg-[#EF4444] hover:bg-opacity-10 transition-colors text-[#EF4444]">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
