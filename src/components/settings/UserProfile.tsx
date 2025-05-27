import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { Search, Plus, Settings } from "lucide-react";

export function UserProfile() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    title: "",
    phone: "",
    address: "",
    bio: "",
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          company: data.company || "",
          title: data.title || "",
          phone: data.phone || "",
          address: data.address || "",
          bio: data.bio || "",
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load profile data');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('users')
        .update(formData)
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

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Compact Header - Price Book Style */}
      <div className="px-6 py-4 border-b border-[#333333] bg-[#121212]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-[#1E1E1E] rounded-[4px] transition-colors">
              <Settings className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-8 text-sm">
          <div>
            <span className="text-gray-400">Account: </span>
            <span className="text-white font-medium">{user?.email}</span>
          </div>
          <div>
            <span className="text-gray-400">Company: </span>
            <span className="text-[#336699] font-medium">{formData.company || 'Not set'}</span>
          </div>
          <div>
            <span className="text-gray-400">Title: </span>
            <span className="text-white font-medium">{formData.title || 'Not set'}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-[#333333] rounded-[4px] shadow p-6">
        <div className="flex items-center mb-6">
          {user?.user_metadata?.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
              alt="Profile"
              className="w-16 h-16 rounded-full mr-4"
            />
          )}
          <div>
            <h2 className="text-xl font-semibold text-white">{user?.user_metadata?.full_name || user?.email}</h2>
            <p className="text-gray-400">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">
                Company
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="mt-1 block w-full bg-[#1E1E1E] border border-[#555555] rounded-[4px] px-3 py-2 text-white focus:border-[#336699] focus:ring-1 focus:ring-[#336699] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">
                Job Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full bg-[#1E1E1E] border border-[#555555] rounded-[4px] px-3 py-2 text-white focus:border-[#336699] focus:ring-1 focus:ring-[#336699] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1 block w-full bg-[#1E1E1E] border border-[#555555] rounded-[4px] px-3 py-2 text-white focus:border-[#336699] focus:ring-1 focus:ring-[#336699] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="mt-1 block w-full bg-[#1E1E1E] border border-[#555555] rounded-[4px] px-3 py-2 text-white focus:border-[#336699] focus:ring-1 focus:ring-[#336699] focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleInputChange}
                className="mt-1 block w-full bg-[#1E1E1E] border border-[#555555] rounded-[4px] px-3 py-2 text-white focus:border-[#336699] focus:ring-1 focus:ring-[#336699] focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center py-3 px-6 rounded-[4px] text-sm font-medium uppercase tracking-wider text-white bg-[#336699] hover:bg-[#2A5580] focus:outline-none focus:ring-2 focus:ring-[#336699] focus:ring-opacity-50 transition-colors ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "SAVING..." : "SAVE CHANGES"}
            </button>
          </div>
        </form>
        </div>
      </div>
    </>
  );
}
