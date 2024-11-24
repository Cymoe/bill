import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  CreditCard,
  DollarSign,
  FileText,
  LineChart,
  Settings,
  Users,
} from "lucide-react";
import { AuthButtons } from "./auth/AuthButtons";

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth0();

  useEffect(() => {
    // Only redirect if we're authenticated and not in a loading state
    if (isAuthenticated && !isLoading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

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
      {/* Navigation */}
      <nav className="flex justify-between items-center p-4 md:p-6">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold">BillBreeze</span>
        </div>
        <AuthButtons />
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 md:py-24">
        <div className="text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
            Streamline Your Billing Process
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create professional invoices, manage clients, and track payments with ease.
            Perfect for freelancers and small businesses.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Features Grid */}
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
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose BillBreeze?</h2>
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
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 mt-24 py-12">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2023 BillBreeze. All rights reserved.</p>
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
  <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
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
      <h3 className="font-semibold">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);