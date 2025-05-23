import { useNavigate } from "react-router-dom";
import { MarketingHeader } from "./marketing/MarketingHeader";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CreditCard,
  FileText,
  LineChart,
  Settings,
  Users,
  Heart
} from "lucide-react";
// AuthButtons now imported directly in MarketingHeader

export const LandingPage = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const portfolioContainerRef = useRef<HTMLDivElement>(null);
  // State for tracking the active slide (used by the auto-scroll functionality)
  const [, setActiveSlide] = useState(0);
  const [isPaused] = useState(false); // Used in the hero section auto-scroll
  const [isPortfolioPaused, setIsPortfolioPaused] = useState(false);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Add CSS to hide scrollbar for WebKit browsers
  useEffect(() => {
    // Create style element
    const style = document.createElement('style');
    // Add CSS rule to hide scrollbar in WebKit browsers
    style.textContent = `
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
    `;
    // Append style to head
    document.head.appendChild(style);
    
    // Clean up
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Apply marketing-page class to body for light theme
  useEffect(() => {
    // Add marketing-page class to body
    document.body.classList.add('marketing-page');
    
    // Clean up function to remove class when component unmounts
    return () => {
      document.body.classList.remove('marketing-page');
    };
  }, []);
  
  // Image styling is now applied directly in the JSX

  // Auto-scroll functionality for hero section
  useEffect(() => {
    const startAutoScroll = () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
      
      autoScrollIntervalRef.current = setInterval(() => {
        if (scrollContainerRef.current && !isPaused) {
          const container = scrollContainerRef.current;
          const maxScroll = container.scrollWidth - container.clientWidth;
          
          // If we're at the end, go back to the beginning
          if (container.scrollLeft >= maxScroll - 20) {
            container.scrollTo({ left: 0, behavior: 'smooth' });
            setActiveSlide(0);
          } else {
            // Otherwise, move to the next slide
            const slideWidth = container.clientWidth;
            const currentSlide = Math.round(container.scrollLeft / slideWidth);
            const nextSlide = currentSlide + 1;
            
            container.scrollTo({ 
              left: nextSlide * slideWidth, 
              behavior: 'smooth' 
            });
            
            setActiveSlide(nextSlide);
          }
        }
      }, 5000); // Change slide every 5 seconds
    };
    
    startAutoScroll();
    
    // Clean up interval on component unmount
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
    };
  }, [isPaused]);
  
  // Smooth auto-scroll functionality for portfolio section using requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp = 0;
    const scrollSpeed = 0.3; // pixels per millisecond - lower for smoother scrolling
    
    const smoothScroll = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      
      if (portfolioContainerRef.current && !isPortfolioPaused) {
        const container = portfolioContainerRef.current;
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        // If we're at the end, go back to the beginning without animation
        if (container.scrollLeft >= maxScroll - 20) {
          container.scrollLeft = 0;
        } else {
          // Calculate smooth scroll amount based on time elapsed
          const scrollAmount = scrollSpeed * deltaTime;
          container.scrollLeft += scrollAmount;
        }
      }
      
      // Continue the animation loop
      animationFrameId = requestAnimationFrame(smoothScroll);
    };
    
    // Start the animation
    animationFrameId = requestAnimationFrame(smoothScroll);
    
    // Clean up animation frame on component unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPortfolioPaused]);
  
  // Add scroll event listener to update active slide indicator
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const scrollPosition = scrollContainerRef.current.scrollLeft;
        const slideWidth = scrollContainerRef.current.clientWidth;
        const newActiveSlide = Math.round(scrollPosition / slideWidth);
        setActiveSlide(newActiveSlide);
      }
    };
    
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Portfolio showcase data
  const portfolioItems = [
    {
      id: 1,
      contractor: "Elite Construction Co.",
      projectType: "Kitchen Remodel",
      image: "/images/kitchen.png",
      likes: "2,845",
      description: "Complete kitchen transformation with custom cabinetry and quartz countertops",
      timeAgo: "6 hours ago",
      tags: ["#KitchenRemodel", "#CustomCabinets"]
    },
    {
      id: 2,
      contractor: "Modern Builders LLC",
      projectType: "Luxury Home",
      image: "/images/jungle-apartments.png", 
      likes: "4,231",
      description: "Luxury modern home with infinity pool and panoramic ocean views",
      timeAgo: "8 hours ago",
      tags: ["#LuxuryHome", "#ModernArchitecture"]
    },
    {
      id: 3,
      contractor: "Renovation Experts",
      projectType: "Bathroom Remodel",
      image: "/images/condo.png",
      likes: "3,927",
      description: "Master bathroom renovation with walk-in shower and dual vanities",
      timeAgo: "12 hours ago",
      tags: ["#BathroomRemodel", "#MasterBath"]
    },
    {
      id: 4,
      contractor: "Property Flip Pros",
      projectType: "New Construction",
      image: "/images/mutli.png",
      likes: "5,164",
      description: "Complete property development with modern family homes",
      timeAgo: "1 day ago",
      tags: ["#NewConstruction", "#Development"]
    },
    {
      id: 5,
      contractor: "Precision Homes",
      projectType: "New Home",
      image: "/images/new.png",
      likes: "6,732",
      description: "New construction with perfect landscaping and modern design",
      timeAgo: "2 days ago",
      tags: ["#NewHome", "#Landscaping"]
    },
    {
      id: 6,
      contractor: "Urban Renovators",
      projectType: "Loft Conversion",
      image: "/images/loft.png",
      likes: "3,451",
      description: "Industrial warehouse converted to modern loft apartments",
      timeAgo: "3 days ago",
      tags: ["#LoftConversion", "#Industrial"]
    },
    {
      id: 7,
      contractor: "Outdoor Living Experts",
      projectType: "Deck & Patio",
      image: "/images/deck.png",
      likes: "4,127",
      description: "Multi-level composite deck with built-in fire pit and outdoor kitchen",
      timeAgo: "4 days ago",
      tags: ["#OutdoorLiving", "#DeckDesign"]
    },
    {
      id: 8,
      contractor: "Heritage Restoration",
      projectType: "Historic Renovation",
      image: "/images/historical.png",
      likes: "5,893",
      description: "Careful restoration of 1890s Victorian with modern conveniences",
      timeAgo: "5 days ago",
      tags: ["#HistoricRenovation", "#Victorian"]
    },
    {
      id: 9,
      contractor: "Urban Development Group",
      projectType: "Luxury Condominium",
      image: "/images/bath.png",
      likes: "7,214",
      description: "Modern luxury condominium with premium finishes and city views",
      timeAgo: "1 week ago",
      tags: ["#LuxuryLiving", "#UrbanDevelopment"]
    }
  ];

  useEffect(() => {
    if (user && !isLoading) {
      console.log('User already authenticated, redirecting to dashboard');
      navigate("/dashboard", { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Marketing Header */}
      <MarketingHeader useAuthButtons={true} showSignIn={false} />

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 md:py-24">
        <div className="text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 max-w-4xl mx-auto">
            Streamline Your Business & Showcase Your Work
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            BillBreeze helps contractors, builders, and service providers manage their business 
            with professional invoicing while showcasing their best projects to potential clients.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                const authButtons = document.querySelector('[data-testid="google-signin"]') as HTMLButtonElement;
                if (authButtons) {
                  authButtons.click();
                }
              }}
              className="flex items-center px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              style={{ backgroundColor: '#336699' }}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/projects')}
              className="flex items-center px-6 py-3 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              style={{ borderColor: '#336699', color: '#336699' }}
            >
              See More Projects
            </button>
          </div>
        </div>

        {/* Portfolio Showcase Section - Full Width */}
        <div className="mt-16" style={{ position: 'relative', width: '100vw', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw', overflow: 'hidden' }}>

          {/* Portfolio Horizontal Scroll */}
          <div className="w-full relative">
            {/* Left fade/blur effect - light theme gradient */}
            <div className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none" 
              style={{ 
                background: 'linear-gradient(to right, rgba(249, 250, 251, 0.95), rgba(249, 250, 251, 0.8) 30%, rgba(249, 250, 251, 0.6) 60%, rgba(249, 250, 251, 0))',
                backdropFilter: 'blur(2px)',
                WebkitBackdropFilter: 'blur(2px)'
              }}>
            </div>
            
            {/* Right fade/blur effect - light theme gradient */}
            <div className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none" 
              style={{ 
                background: 'linear-gradient(to left, rgba(249, 250, 251, 0.95), rgba(249, 250, 251, 0.8) 30%, rgba(249, 250, 251, 0.6) 60%, rgba(249, 250, 251, 0))',
                backdropFilter: 'blur(2px)',
                WebkitBackdropFilter: 'blur(2px)'
              }}>
            </div>
            
            {/* Portfolio section - auto-scrolling carousel */}
            <div 
              ref={portfolioContainerRef}
              className="flex overflow-x-auto pb-6 no-scrollbar" 
              style={{ 
                scrollBehavior: 'smooth',
                scrollSnapType: 'x mandatory',
                paddingLeft: '0.5rem',
                paddingRight: '4rem', /* Add extra padding on the right to ensure content extends off screen */
                msOverflowStyle: 'none', /* IE and Edge */
                scrollbarWidth: 'none', /* Firefox */
                WebkitOverflowScrolling: 'touch',
                gap: '1.5rem'
              }}
              onMouseEnter={() => setIsPortfolioPaused(true)}
              onMouseLeave={() => setIsPortfolioPaused(false)}
              onTouchStart={() => setIsPortfolioPaused(true)}
              onTouchEnd={() => setIsPortfolioPaused(false)}>
            {portfolioItems.map((item) => (
              <div 
                key={item.id} 
                className="flex-shrink-0 w-80 md:w-96 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200"
                style={{ scrollSnapAlign: 'start' }}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center" style={{ backgroundColor: '#336699' }}>
                      <Building2 className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{item.contractor}</h3>
                      <p className="text-xs text-gray-500">{item.projectType}</p>
                    </div>
                  </div>
                  {/* Card header - no menu button */}
                </div>

                {/* Image */}
                <div className="aspect-square bg-gray-200 relative overflow-hidden">
                  {item.image && item.image.includes('.png') ? (
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${item.image}')` }}>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs" style={{ borderRadius: '4px' }}>
                        {item.projectType}
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #5588bb, #336699)' }}>
                      <Building2 className="h-16 w-16 text-white opacity-50" />
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs" style={{ borderRadius: '4px' }}>
                        {item.projectType}
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{item.contractor}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{item.contractor}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500">{item.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
            
            {/* Auto-scrolling carousel with no navigation arrows */}
            
            {/* No pagination indicators - clean auto-scrolling carousel */}
          </div>

          {/* Portfolio section ends here */}
        </div>

        {/* Industry Insights Section */}
        <div className="container mx-auto px-4">
          <div className="mt-24 bg-white p-8 rounded-lg border border-gray-300 shadow-md">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Industry Insights</h2>
              <p className="text-gray-800 mb-4 font-medium">
                Discover what construction professionals are really asking for in their software solutions. 
                Our research reveals the key pain points and feature requests that major SaaS companies are missing.
              </p>
              <a 
                href="/docs/construction-saas-user-feedback" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Read the Research
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </div>
            <div className="bg-white p-5 rounded-lg border border-gray-300 shadow-sm max-w-md">
              <h3 className="font-bold text-gray-900 mb-3 text-lg">Top User Requests:</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-800 font-medium">Seamless field-to-office communication</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-800 font-medium">Simplified user experience for smaller contractors</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-800 font-medium">Better integration between operational systems</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        </div>
        
        {/* Features Grid */}
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mt-24">
            <FeatureCard
              icon={<FileText className="h-8 w-8 text-blue-600" />}
              title="Invoice Generation"
              description="Create and customize professional invoices in seconds"
            />
            <FeatureCard
              icon={<Users className="h-8 w-8 text-blue-600" />}
              title="Client Management"
              description="Organize and manage your client information efficiently"
            />
            <FeatureCard
              icon={<CreditCard className="h-8 w-8 text-blue-600" />}
              title="Payment Tracking"
              description="Track payments and manage your cash flow effectively"
            />
            <FeatureCard
              icon={<Building2 className="h-8 w-8 text-blue-600" />}
              title="Business Analytics"
              description="Gain insights into your business performance"
            />
            <FeatureCard
              icon={<Settings className="h-8 w-8 text-blue-600" />}
              title="Customization"
              description="Tailor the system to match your business needs"
            />
            <FeatureCard
              icon={<LineChart className="h-8 w-8 text-blue-600" />}
              title="Financial Reports"
              description="Generate detailed reports for better decision making"
            />
          </div>

          {/* Benefits Section */}
          <div className="mt-24 bg-white p-8 rounded-lg border border-gray-300 shadow-md">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose BillBreeze?</h2>
            <div className="space-y-6">
              <BenefitRow
                icon={<CheckCircle2 className="h-6 w-6 text-green-500" />}
                title="Save Time"
                description="Automate your billing process and focus on growing your business"
              />
              <BenefitRow
                icon={<CheckCircle2 className="h-6 w-6 text-green-500" />}
                title="Professional Image"
                description="Create polished, branded invoices that impress your clients"
              />
              <BenefitRow
                icon={<CheckCircle2 className="h-6 w-6 text-green-500" />}
                title="Stay Organized"
                description="Keep all your billing and client information in one place"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 mt-24 py-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} BillBreeze. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-300 hover:shadow-md transition-shadow">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-800">{description}</p>
  </div>
);

const BenefitRow = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0">{icon}</div>
    <div>
      <h3 className="font-bold text-gray-900 text-lg mb-1">{title}</h3>
      <p className="text-gray-800">{description}</p>
    </div>
  </div>
); 