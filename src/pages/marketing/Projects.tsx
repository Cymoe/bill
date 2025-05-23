import { useState, useEffect } from 'react';
import PropertyTypeCard from '../../components/marketing/PropertyTypeCard';
import { MarketingHeader } from '../../components/marketing/MarketingHeader';
import { 
  Building2, 
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  Search,
  ArrowRight
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

// Project type definition
interface Project {
  id: number;
  contractor: string;
  projectType: string;
  image: string;
  likes: string;
  description: string;
  timeAgo: string;
  tags: string[];
  featured?: boolean;
}

// Main Projects component for the marketing page
export const Projects = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Apply marketing-page class to body for light theme
  useEffect(() => {
    // Add marketing-page class to body
    document.body.classList.add('marketing-page');
    
    // Clean up function to remove class when component unmounts
    return () => {
      document.body.classList.remove('marketing-page');
    };
  }, []);
  
  // Sample projects data - in a real app, this would come from an API or database
  const projects: Project[] = [
    {
      id: 1,
      contractor: "Elite Construction Co.",
      projectType: "Kitchen Remodel",
      image: "/images/kitchen.png",
      likes: "2,845",
      description: "Complete kitchen transformation with custom cabinetry and quartz countertops",
      timeAgo: "6 hours ago",
      tags: ["#KitchenRemodel", "#CustomCabinets"],
      featured: true
    },
    {
      id: 2,
      contractor: "Modern Builders LLC",
      projectType: "Luxury Home",
      image: "/images/jungle-apartments.png", 
      likes: "4,231",
      description: "Luxury modern home with infinity pool and panoramic ocean views",
      timeAgo: "8 hours ago",
      tags: ["#LuxuryHome", "#ModernArchitecture"],
      featured: true
    },
    {
      id: 3,
      contractor: "Renovation Experts",
      projectType: "Bathroom Remodel",
      image: "/images/condo.png",
      likes: "3,927",
      description: "Master bathroom renovation with walk-in shower and dual vanities",
      timeAgo: "12 hours ago",
      tags: ["#BathroomRemodel", "#MasterBath"],
      featured: true
    },
    {
      id: 4,
      contractor: "Property Flip Pros",
      projectType: "New Construction",
      image: "/images/mutli.png",
      likes: "5,164",
      description: "Complete property development with modern family homes",
      timeAgo: "1 day ago",
      tags: ["#NewConstruction", "#Development"],
      featured: true
    },
    {
      id: 5,
      contractor: "Precision Homes",
      projectType: "New Home",
      image: "/images/new.png",
      likes: "6,732",
      description: "New construction with perfect landscaping and modern design",
      timeAgo: "2 days ago",
      tags: ["#NewHome", "#Landscaping"],
      featured: true
    },
    {
      id: 6,
      contractor: "Urban Renovators",
      projectType: "Loft Conversion",
      image: "/images/loft.png",
      likes: "3,451",
      description: "Industrial warehouse converted to modern loft apartments",
      timeAgo: "3 days ago",
      tags: ["#LoftConversion", "#Industrial"],
      featured: true
    },
    {
      id: 7,
      contractor: "Outdoor Living Experts",
      projectType: "Deck & Patio",
      image: "/images/deck.png",
      likes: "4,127",
      description: "Multi-level composite deck with built-in fire pit and outdoor kitchen",
      timeAgo: "4 days ago",
      tags: ["#OutdoorLiving", "#DeckDesign"],
      featured: true
    },
    {
      id: 8,
      contractor: "Heritage Restoration",
      projectType: "Historic Renovation",
      image: "/images/historical.png",
      likes: "5,893",
      description: "Careful restoration of 1890s Victorian with modern conveniences",
      timeAgo: "5 days ago",
      tags: ["#HistoricRenovation", "#Victorian"],
      featured: true
    },
    {
      id: 9,
      contractor: "Urban Development Group",
      projectType: "Luxury Condominium",
      image: "/images/bath.png",
      likes: "7,214",
      description: "Modern luxury condominium with premium finishes and city views",
      timeAgo: "1 week ago",
      tags: ["#LuxuryLiving", "#UrbanDevelopment"],
      featured: true
    },
    {
      id: 10,
      contractor: "Green Building Solutions",
      projectType: "Eco-Friendly Home",
      image: "/images/new.png",
      likes: "6,892",
      description: "Net-zero energy home with solar panels and sustainable materials",
      timeAgo: "1 week ago",
      tags: ["#EcoFriendly", "#Sustainable"]
    },
    {
      id: 11,
      contractor: "Commercial Builders Inc.",
      projectType: "Office Renovation",
      image: "/images/new.png",
      likes: "3,892",
      description: "Modern office space renovation with open floor plan and collaborative areas",
      timeAgo: "1 week ago",
      tags: ["#Commercial", "#OfficeDesign"]
    },
    {
      id: 11,
      contractor: "Basement Specialists",
      projectType: "Basement Finishing",
      image: "/images/basement-finishing.jpg",
      likes: "2,756",
      description: "Unfinished basement transformed into entertainment space with wet bar",
      timeAgo: "2 weeks ago",
      tags: ["#BasementRemodel", "#Entertainment"]
    },
    {
      id: 12,
      contractor: "Roofing Excellence",
      projectType: "Roof Replacement",
      image: "/images/roof-replacement.jpg",
      likes: "1,983",
      description: "Complete roof replacement with architectural shingles and improved ventilation",
      timeAgo: "2 weeks ago",
      tags: ["#Roofing", "#Exterior"]
    }
  ];

  // Filter projects based on selected filter and search term
  const filteredProjects = projects.filter(project => {
    // Filter by category
    if (filter !== 'all' && filter !== 'featured') {
      if (!project.projectType.toLowerCase().includes(filter.toLowerCase())) {
        return false;
      }
    }
    
    // Filter featured projects
    if (filter === 'featured' && !project.featured) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        project.contractor.toLowerCase().includes(searchLower) ||
        project.projectType.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });

  // Add placeholder images for the projects that don't have real images
  projects.forEach(project => {
    if (project.image !== '/images/bali-villa.png' && project.image !== '/images/turf.png') {
      // Use a gradient background for projects without real images
      project.image = '';
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Marketing Header */}
      <MarketingHeader />

      {/* Header */}
      <header className="container mx-auto px-4 py-12">
        <div className="text-center space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
            Construction Project Showcase
          </h1>
          <p className="text-xl text-gray-600">
            Browse through our collection of exceptional construction projects created by BillBreeze users.
            From kitchen remodels to luxury homes, find inspiration for your next project.
          </p>
        </div>
      </header>

      {/* Property Type Cards */}
      <div className="container mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Property Type</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-12">
          {/* Property Type Cards */}
          {/* Calculate counts for each property type */}
          {(() => {
            const typeCounts = projects.reduce((acc, project) => {
              const type = project.projectType.toLowerCase();
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            
            // Define property types with their details
            const propertyTypes = [
              { id: 'all', title: 'All Projects', count: projects.length, image: '/images/bali-villa.png' },
              { id: 'luxury home', title: 'Luxury Homes', count: typeCounts['luxury home'] || 0, image: '/images/bali-villa.png' },
              { id: 'new home', title: 'New Homes', count: typeCounts['new home'] || 0, image: '/images/turf.png' },
              { id: 'kitchen remodel', title: 'Kitchen Remodels', count: typeCounts['kitchen remodel'] || 0 },
              { id: 'bathroom remodel', title: 'Bathroom Remodels', count: typeCounts['bathroom remodel'] || 0 },
              { id: 'new construction', title: 'New Construction', count: typeCounts['new construction'] || 0 },
              { id: 'loft conversion', title: 'Loft Conversions', count: typeCounts['loft conversion'] || 0 },
              { id: 'deck & patio', title: 'Decks & Patios', count: typeCounts['deck & patio'] || 0 },
              { id: 'historic renovation', title: 'Historic Renovations', count: typeCounts['historic renovation'] || 0 },
              { id: 'featured', title: 'Featured Projects', count: projects.filter(p => p.featured).length }
            ];
            
            // Return the mapped property type cards
            return propertyTypes.map(type => (
              <PropertyTypeCard
                key={type.id}
                title={type.title}
                count={type.count}
                image={type.image}
                isActive={filter === type.id}
                onClick={() => setFilter(type.id)}
              />
            ));
          })()}
        </div>
        
        {/* Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full md:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ borderColor: '#333333', backgroundColor: '#FFFFFF' }}
            />
          </div>
          
          {searchTerm && (
            <button
              className="px-3 py-1 text-sm rounded-lg text-gray-700 hover:bg-gray-200 flex items-center"
              onClick={() => setSearchTerm('')}
              style={{ borderRadius: '4px' }}
            >
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <div 
                key={project.id} 
                className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200"
                style={{ borderRadius: '4px' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#336699' }}
                    >
                      <Building2 className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{project.contractor}</h3>
                      <p className="text-xs text-gray-500">{project.projectType}</p>
                    </div>
                  </div>
                  {project.featured && (
                    <span 
                      className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800"
                      style={{ backgroundColor: '#F9D71C', color: '#121212' }}
                    >
                      Featured
                    </span>
                  )}
                </div>

                {/* Image */}
                <div className="aspect-square bg-gray-200 relative overflow-hidden">
                  {project.image === "/images/bali-villa.png" || project.image === "/images/turf.png" ? (
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ 
                        backgroundImage: `url('${project.image}')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                  ) : (
                    <div 
                      className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center"
                      style={{ background: 'linear-gradient(to bottom right, #5588bb, #336699)' }}
                    >
                      <Building2 className="h-16 w-16 text-white opacity-50" />
                    </div>
                  )}
                  <div 
                    className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs"
                    style={{ borderRadius: '4px' }}
                  >
                    {project.projectType}
                  </div>
                </div>

                {/* Engagement */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition-colors">
                        <Heart className="h-5 w-5" />
                      </button>
                      <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-500 transition-colors">
                        <MessageCircle className="h-5 w-5" />
                      </button>
                      <button className="flex items-center space-x-1 text-gray-600 hover:text-green-500 transition-colors">
                        <Share className="h-5 w-5" />
                      </button>
                    </div>
                    <button className="text-gray-600 hover:text-gray-800 transition-colors">
                      <Bookmark className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mb-2">
                    <p className="font-semibold text-gray-900 text-sm">{project.likes} likes</p>
                  </div>

                  <div className="text-sm text-gray-800 mb-2">
                    <span className="font-semibold">{project.contractor.split(' ')[0].toLowerCase()}</span>
                    <span className="ml-1">{project.description}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {project.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="text-xs text-blue-600 hover:underline cursor-pointer"
                        style={{ color: '#336699' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-gray-400 uppercase tracking-wide">{project.timeAgo}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-lg text-gray-600">No projects found matching your criteria.</p>
              <button 
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => {
                  setFilter('all');
                  setSearchTerm('');
                }}
                style={{ backgroundColor: '#336699', borderRadius: '4px' }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Ready to showcase your work?</h2>
            <p className="text-xl text-gray-600">
              Join thousands of contractors who use BillBreeze to manage their business and showcase their best projects.
            </p>
            <button 
              onClick={() => navigate('/')}
              className="inline-flex items-center px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              style={{ backgroundColor: '#336699', borderRadius: '4px' }}
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} BillBreeze. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Projects;
