import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { ClientList } from './components/clients/ClientList';
import { ProductList } from './components/products/ProductList';
import { InvoiceList } from './components/invoices/InvoiceList';
import { InvoiceDetail } from './components/invoices/InvoiceDetail';
import { InvoiceTemplateList } from './components/templates/InvoiceTemplateList';
import { LandingPage } from './components/Landingpage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/clients" element={<ClientList />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/invoices" element={<InvoiceList />} />
      <Route path="/invoices/:id" element={<InvoiceDetail />} />
      <Route path="/templates" element={<InvoiceTemplateList />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}