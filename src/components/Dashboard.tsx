import React, { useState } from 'react';
import { DollarSign, FileText, Users, Package, Target } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { formatCurrency } from '../utils/format';
import { useTheme } from '../contexts/ThemeContext';
import { RevenueProgress } from './dashboard/RevenueProgress';
import { MetricCard } from './dashboard/MetricCard';
import { RevenueChart } from './dashboard/RevenueChart';
import { YearlyTrendChart } from './dashboard/YearlyTrendChart';
import { Breadcrumbs } from './common/Breadcrumbs';
import { DashboardLayout } from './layouts/DashboardLayout';
import { CardSkeleton } from './skeletons/CardSkeleton';
import { ChartSkeleton } from './skeletons/ChartSkeleton';
import { SetRevenueGoalModal } from './dashboard/SetRevenueGoalModal';

type Invoice = Doc<"invoices">;
type Client = Doc<"clients">;
type Product = Doc<"products">;

interface DashboardMetrics {
  totalRevenue: number;
  outstandingAmount: number;
  totalInvoices: number;
  totalClients: number;
  totalProducts: number;
  monthlyRevenue: Array<{ month: string; amount: number }>;
  yearlyComparison: Array<{ year: string; amount: number }>;
}

export const Dashboard: React.FC = () => {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [revenueTarget, setRevenueTarget] = useState(100000);

  const invoices = useQuery(api.invoices.getInvoices);
  const clients = useQuery(api.clients.getClients);
  const products = useQuery(api.products.getProducts);

  const isLoading = !invoices || !clients || !products;

  const calculateMetrics = (): DashboardMetrics => {
    // Calculate total revenue from paid invoices only
    const totalRevenue = (invoices || [])
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum: number, invoice: Invoice) => sum + invoice.total_amount, 0);

    // Calculate outstanding amount from sent and overdue invoices
    const outstandingAmount = (invoices || [])
      .filter(invoice => invoice.status === 'sent' || invoice.status === 'overdue')
      .reduce((sum: number, invoice: Invoice) => sum + invoice.total_amount, 0);

    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(2024, i).toLocaleString('default', { month: 'short' });
      const amount = (invoices || [])
        .filter((invoice: Invoice) => 
          new Date(invoice.date).getMonth() === i && 
          invoice.status === 'paid'
        )
        .reduce((sum: number, invoice: Invoice) => sum + invoice.total_amount, 0);
      return { month, amount };
    });

    const yearlyComparison = [2023, 2024].map(year => ({
      year: year.toString(),
      amount: (invoices || [])
        .filter((invoice: Invoice) => 
          new Date(invoice.date).getFullYear() === year &&
          invoice.status === 'paid'
        )
        .reduce((sum: number, invoice: Invoice) => sum + invoice.total_amount, 0)
    }));

    return {
      totalRevenue,
      outstandingAmount,
      totalInvoices: (invoices || []).length,
      totalClients: (clients || []).length,
      totalProducts: (products || []).length,
      monthlyRevenue,
      yearlyComparison
    };
  };

  const metrics = calculateMetrics();

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="px-2 md:px-0">
          <Breadcrumbs items={[{ label: 'Dashboard' }]} />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 md:p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Progress</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Track your revenue goals</p>
            </div>
            <button
              onClick={() => setShowGoalModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg"
            >
              <Target className="w-4 h-4" />
              Set Goal
            </button>
          </div>

          {isLoading ? (
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ) : (
            <RevenueProgress 
              currentValue={metrics.totalRevenue} 
              outstandingAmount={metrics.outstandingAmount}
              targetValue={revenueTarget} 
            />
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {isLoading ? (
            <>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </>
          ) : (
            <>
              <MetricCard
                title="Total Revenue"
                value={formatCurrency(metrics.totalRevenue)}
                icon={DollarSign}
                trend={10}
              />
              <MetricCard
                title="Total Invoices"
                value={metrics.totalInvoices.toString()}
                icon={FileText}
                trend={5}
              />
              <MetricCard
                title="Total Clients"
                value={metrics.totalClients.toString()}
                icon={Users}
                trend={15}
              />
              <MetricCard
                title="Total Products"
                value={metrics.totalProducts.toString()}
                icon={Package}
                trend={8}
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {isLoading ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : (
            <>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 md:p-6">
                <RevenueChart data={metrics.monthlyRevenue} title="Monthly Revenue" />
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 md:p-6">
                <YearlyTrendChart data={metrics.yearlyComparison} title="Yearly Comparison" />
              </div>
            </>
          )}
        </div>
      </div>

      {showGoalModal && (
        <SetRevenueGoalModal
          currentRevenue={metrics.totalRevenue}
          onClose={() => setShowGoalModal(false)}
          onSave={setRevenueTarget}
        />
      )}
    </DashboardLayout>
  );
};