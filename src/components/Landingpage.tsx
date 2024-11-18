import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Zap, 
  Clock, 
  PieChart, 
  Shield, 
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <header className="relative overflow-hidden pt-16 md:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Professional Invoicing,
              <span className="text-indigo-600 dark:text-indigo-400"> Simplified</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Create, manage, and track invoices effortlessly. Get paid faster with our powerful invoicing platform designed for modern businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  const demoSection = document.getElementById('features');
                  demoSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 rounded-lg border-2 border-indigo-600 dark:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
              >
                See How It Works
              </button>
            </div>
            
            {/* Social Proof */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500 dark:text-gray-400 mb-16">
              <p className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                Trusted by 10,000+ businesses
              </p>
              <p className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                4.9/5 average rating
              </p>
              <p className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                99.9% uptime
              </p>
            </div>

            {/* Hero Image */}
            <div className="relative mx-auto max-w-5xl">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
                  alt="InvoiceHub Dashboard"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Manage Invoices
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Streamline your billing process with powerful features designed to save you time and get you paid faster.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Quick Invoice Creation",
                description: "Create professional invoices in seconds with our intuitive templates and customization options."
              },
              {
                icon: Clock,
                title: "Automated Reminders",
                description: "Set up automatic payment reminders to reduce late payments and improve cash flow."
              },
              {
                icon: PieChart,
                title: "Real-time Analytics",
                description: "Track payments, monitor outstanding invoices, and gain insights into your business performance."
              },
              {
                icon: Shield,
                title: "Secure Payments",
                description: "Industry-leading security ensures your financial data stays protected."
              },
              {
                icon: FileText,
                title: "Custom Templates",
                description: "Create and save custom invoice templates for different clients or services."
              },
              {
                icon: Clock,
                title: "Time-Saving Tools",
                description: "Automate recurring invoices and streamline your billing workflow."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-indigo-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Loved by Businesses Worldwide
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              See what our customers have to say about InvoiceHub
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "InvoiceHub has transformed how we handle our invoicing. It's incredibly easy to use and has cut our billing time in half.",
                author: "Sarah Johnson",
                role: "CEO, TechStart Inc",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80"
              },
              {
                quote: "The automated reminders have helped us reduce late payments by 75%. Our cash flow has never been better.",
                author: "Michael Chen",
                role: "Founder, Design Co",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80"
              },
              {
                quote: "Best invoicing software we've used. The analytics help us make better business decisions every day.",
                author: "Emily Brown",
                role: "CFO, Growth Labs",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-lg">
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.author}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600 dark:bg-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Streamline Your Invoicing?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Join thousands of businesses that trust InvoiceHub for their invoicing needs. Get started free today!
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-indigo-600 bg-white rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Start Free Trial
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
          <p className="text-indigo-100 mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mr-2" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                InvoiceHub
              </span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                Terms of Service
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} InvoiceHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};