import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Auth0ConvexProvider } from './providers/auth0-provider';
import { useAuth0 } from '@auth0/auth0-react';
import { Dashboard } from './components/Dashboard';
import { ClientList } from './components/clients/ClientList';
import { ProductList } from './components/products/ProductList';
import { InvoiceList } from './components/invoices/InvoiceList';
import { InvoiceDetail } from './components/invoices/InvoiceDetail';
import { InvoiceTemplateList } from './components/templates/InvoiceTemplateList';
import { LandingPage } from './components/Landingpage';
import { BillsList } from './components/bills/BillsList';
import { TestAuth } from './components/auth/TestAuth';
import UserProfile from './components/settings/UserProfile';
import { Toaster } from 'react-hot-toast';
import { Callback } from './components/auth/Callback';

// Protected route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/callback" element={<Callback />} />
      <Route
        path="/test"
        element={
          <ProtectedRoute>
            <TestAuth />
          </ProtectedRoute>
        }
      />
      
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
            <ProductList />
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
        path="/templates"
        element={
          <ProtectedRoute>
            <InvoiceTemplateList />
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
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Auth0ConvexProvider>
          <AppRoutes />
          <Toaster position="top-right" />
        </Auth0ConvexProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;