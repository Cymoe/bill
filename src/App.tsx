import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Dashboard } from './components/Dashboard';
import { TestAuth } from './components/auth/TestAuth';
import { ClientList } from './components/clients/ClientList';
import { PriceBook } from './components/price-book/PriceBook';
import { ProductsPage } from './components/products/ProductsPage';
import { InvoiceList } from './components/invoices/InvoiceList';
import { InvoiceDetail } from './components/invoices/InvoiceDetail';
import { PackagesPage } from './components/packages/PackagesPage';
import { LandingPage } from './components/LandingPage';
import { BillsList } from './components/bills/BillsList';
import { Callback } from './components/auth/Callback';
import { UserProfile } from './components/settings/UserProfile';
import { Toaster } from 'react-hot-toast';
import { ProjectList, ProjectForm, ProjectDetails } from './components/projects';

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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

  // If we have a user and session, redirect to dashboard from root
  const renderLanding = () => {
    if (user && session && !isLoading) {
      return <Navigate to="/dashboard" replace />;
    }
    return <LandingPage />;
  };

  return (
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
            <ProductsPage />
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
      <Route
        path="/packages"
        element={
          <ProtectedRoute>
            <PackagesPage />
          </ProtectedRoute>
        }
      />
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
      
      {/* Catch all */}
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
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
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