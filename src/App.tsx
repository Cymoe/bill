import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './pages/dashboard/Dashboard';
import { TestAuth } from './components/auth/TestAuth';
import { People } from './pages/People';
import { PriceBook } from './components/price-book/PriceBook';
import { ProductsPage } from './components/products/ProductsPage';
import { ProductVariantComparisonPage } from './components/products/ProductVariantComparisonPage';
import ChatManagementSystem from './pages/chat/ChatManagementSystem';
// ProductBuilderPage removed - using ProductAssemblyForm drawer instead
import { InvoiceList } from './components/invoices/InvoiceList';
import { InvoiceDetail } from './components/invoices/InvoiceDetail';
import { ShareableInvoice } from './components/invoices/ShareableInvoice';
import { EstimatesPage } from './pages/EstimatesPage';
import { EstimateDetail } from './components/estimates/EstimateDetail';
import { EditEstimatePage } from './pages/EditEstimatePage';
import { ShareableEstimate } from './components/estimates/ShareableEstimate';
// Packages page removed as part of simplification
import { LandingPage } from './components/LandingPage';
import Projects from './pages/marketing/Projects';
import { BillsList } from './components/bills/BillsList';
import { Callback } from './components/auth/Callback';
import { UserProfile } from './components/settings/UserProfile';
import { Toaster } from 'react-hot-toast';
import { ProjectList, ProjectForm, ProjectDetails } from './components/projects';
import LineItemTestPage from './pages/LineItemTestPage';
import ProductCardViewDemo from './components/products/ProductCardViewDemo';
import ProductVariantsDemo from './pages/ProductVariantsDemo';
import { ProductDrawerContext } from './contexts/ProductDrawerContext';
import { GlobalProductDrawer } from './components/products/GlobalProductDrawer';
import { supabase } from './lib/supabase';
import { DashboardLayout } from './components/layouts/DashboardLayout';
import MarkdownViewer from './components/docs/MarkdownViewer';
import Templates from './pages/Templates';
import WorkPacksPage from './pages/WorkPacksPage';
import { WorkPackDetail } from './pages/WorkPackDetail';
import IndustrySettings from './pages/IndustrySettings';
import { Expenses } from './pages/Expenses';
import { InvoicesPage } from './pages/InvoicesPage';
import { VendorDetailPage } from './pages/VendorDetailPage';
import { ClientDetailPage } from './pages/ClientDetailPage';
import { SubcontractorDetailPage } from './pages/SubcontractorDetailPage';
import { TeamMemberDetailPage } from './pages/TeamMemberDetailPage';
import { DebugData } from './pages/DebugData';
import { Work } from './pages/Work';

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!session || !user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, session, isLoading } = useAuth();
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // If we have a user and session, redirect to dashboard from root
  const renderLanding = () => {
    if (user && session && !isLoading) {
      return <Navigate to="/profit-tracker" replace />;
    }
    return <LandingPage />;
  };

  return (
    <ProductDrawerContext.Provider value={{ 
      openProductDrawer: (product) => setEditingProduct(product || 'new') 
    }}>
      <Routes>
      {/* Public routes */}
      <Route path="/" element={renderLanding()} />
      <Route path="/auth/callback" element={<Callback />} />
      <Route path="/auth/test" element={<TestAuth />} />
      <Route path="/marketing/projects" element={<Projects />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Navigate to="/profit-tracker" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profit-tracker"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/people"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <People />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendors/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <VendorDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/subcontractors/:subcontractorId"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SubcontractorDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/team-members/:teamMemberId"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <TeamMemberDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProductsPage editingProduct={editingProduct} setEditingProduct={setEditingProduct} />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/:productId/compare"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProductVariantComparisonPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/demo"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProductCardViewDemo />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/variants"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProductVariantsDemo />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/new"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Navigate to="/products" replace />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/edit/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Navigate to="/products" replace />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/variant/new"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Navigate to="/products" replace />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/templates"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Templates />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/work-packs"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <WorkPacksPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/work-packs/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <WorkPackDetail />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Work Hub - combines Estimates, Projects, and Invoices */}
      <Route
        path="/work"
        element={
          <ProtectedRoute>
            <Navigate to="/work/estimates" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/work/estimates"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Work />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/work/projects"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Work />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/work/invoices"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Work />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <Navigate to="/work/invoices" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <InvoiceDetail />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      {/* Public shareable invoice route - no auth required */}
      <Route
        path="/share/invoice/:id"
        element={<ShareableInvoice />}
      />
      
      {/* Estimate routes */}
      <Route
        path="/estimates"
        element={
          <ProtectedRoute>
            <Navigate to="/work/estimates" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/estimates/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <EstimateDetail />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/estimates/:id/edit"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <EditEstimatePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      {/* Public shareable estimate route - no auth required */}
      <Route
        path="/share/estimate/:id"
        element={<ShareableEstimate />}
      />
      {/* Packages route removed as part of simplification */}
      <Route
        path="/bills"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <BillsList />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <UserProfile />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Chat Management System - redirect to profit-tracker since chat is in sidebar */}
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Navigate to="/profit-tracker" replace />
          </ProtectedRoute>
        }
      />
      
      {/* Documentation routes - publicly accessible */}
      <Route
        path="/docs/:filename"
        element={<MarkdownViewer />}
      />
      
      {/* Project routes */}
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <Navigate to="/work/projects" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/new"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProjectForm />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProjectDetails />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id/edit"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProjectForm />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Client routes */}
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <Navigate to="/people" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients/:clientId"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ClientDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route
        path="/price-book"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <PriceBook />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/line-item-test"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <LineItemTestPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/debug"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DebugData />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings/industries"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <IndustrySettings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Expenses />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
      {/* Global Product Drawer - available on all pages */}
      <GlobalProductDrawer 
        editingProduct={editingProduct} 
        setEditingProduct={setEditingProduct} 
        onProductSaved={() => {
          window.location.reload();
        }}
      />
    </ProductDrawerContext.Provider>
  );
}

function App() {
  return (
    <BrowserRouter future={{ 
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}>
      <AuthProvider>
        <ThemeProvider>
          <Toaster position="top-right" />
          <AppRoutes />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;