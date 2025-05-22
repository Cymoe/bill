import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Dashboard } from './components/Dashboard';
import { TestAuth } from './components/auth/TestAuth';
import { ClientList } from './components/clients/ClientList';
import { PriceBook } from './components/price-book/PriceBook';
import { ProductsPage, Product } from './components/products/ProductsPage';
// ProductBuilderPage removed - using ProductAssemblyForm drawer instead
import { InvoiceList } from './components/invoices/InvoiceList';
import { InvoiceDetail } from './components/invoices/InvoiceDetail';
// Packages page removed as part of simplification
import { LandingPage } from './components/LandingPage';
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

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-steel-blue"></div>
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
  const [editingProduct, setEditingProduct] = useState<Product | 'new' | null>(null);
  const [lineItems, setLineItems] = useState<any[]>([]);

  // Fetch line items for the product drawer
  useEffect(() => {
    const fetchLineItems = async () => {
      try {
        const { data, error } = await supabase
          .from('line_items')
          .select('*');
        if (error) throw error;
        setLineItems(data || []);
      } catch (error) {
        console.error('Error fetching line items:', error);
      }
    };

    fetchLineItems();
  }, []);

  // If we have a user and session, redirect to dashboard from root
  const renderLanding = () => {
    if (user && session && !isLoading) {
      return <Navigate to="/dashboard" replace />;
    }
    return <LandingPage />;
  };

  return (
    <ProductDrawerContext.Provider value={{ openProductDrawer: () => setEditingProduct('new') }}>
      <Routes>
      {/* Public routes */}
      <Route path="/" element={renderLanding()} />
      <Route path="/auth/callback" element={<Callback />} />
      <Route path="/auth/test" element={<TestAuth />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <ClientList />
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
        path="/products/demo"
        element={
          <ProtectedRoute>
            <ProductCardViewDemo />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/variants"
        element={
          <ProtectedRoute>
            <ProductVariantsDemo />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/new"
        element={
          <ProtectedRoute>
            <Navigate to="/products" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/edit/:id"
        element={
          <ProtectedRoute>
            <Navigate to="/products" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/variant/new"
        element={
          <ProtectedRoute>
            <Navigate to="/products" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <InvoiceList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices/:id"
        element={
          <ProtectedRoute>
            <InvoiceDetail />
          </ProtectedRoute>
        }
      />
      {/* Packages route removed as part of simplification */}
      <Route
        path="/bills"
        element={
          <ProtectedRoute>
            <BillsList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <UserProfile />
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
            <ProjectList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/new"
        element={
          <ProtectedRoute>
            <ProjectForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <ProjectDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id/edit"
        element={
          <ProtectedRoute>
            <ProjectForm />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route
        path="/price-book"
        element={
          <ProtectedRoute>
            <PriceBook />
          </ProtectedRoute>
        }
      />
      <Route
        path="/line-item-test"
        element={
          <ProtectedRoute>
            <LineItemTestPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
      {/* Global Product Drawer - available on all pages */}
      <GlobalProductDrawer 
        editingProduct={editingProduct} 
        setEditingProduct={setEditingProduct} 
        lineItems={lineItems}
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