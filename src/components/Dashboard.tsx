import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, Users, Package, Target, ArrowUp } from 'lucide-react';
import { formatCurrency } from '../utils/format';

import { RevenueProgress } from './dashboard/RevenueProgress';
import { MetricCard } from './dashboard/MetricCard';
import { RevenueChart } from './dashboard/RevenueChart';
import { YearlyTrendChart } from './dashboard/YearlyTrendChart';
import { DashboardLayout } from './layouts/DashboardLayout';
import { CardSkeleton } from './skeletons/CardSkeleton';
import { ChartSkeleton } from './skeletons/ChartSkeleton';
import { SetRevenueGoalModal } from './dashboard/SetRevenueGoalModal';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from './common/PageHeader';

interface Invoice {
  id: string;
  total_amount: number;
  status: string;
  date: string;
}

interface Client {
  id: string;
}

interface Product {
  id: string;
}

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

  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const [invoicesRes, clientsRes, productsRes] = await Promise.all([
            supabase.from('invoices').select('*').eq('user_id', user.id),
            supabase.from('clients').select('*').eq('user_id', user.id),
            supabase.from('products').select('*').eq('user_id', user.id)
          ]);

          if (invoicesRes.error) throw invoicesRes.error;
          if (clientsRes.error) throw clientsRes.error;
          if (productsRes.error) throw productsRes.error;

          setInvoices(invoicesRes.data || []);
          setClients(clientsRes.data || []);
          setProducts(productsRes.data || []);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [user]);

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
      <PageHeader
        hideTitle={true}
      />
      <div className="space-y-6">
        <div className="bg-[#121212] rounded-[4px] border border-[#333333] p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-white font-['Roboto_Condensed'] uppercase">Revenue Progress</h3>
              <p className="text-sm text-[#9E9E9E] font-['Roboto']">Track your revenue goals</p>
            </div>
            <button
              onClick={() => setShowGoalModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-[#121212] bg-[#F9D71C] hover:bg-[#F9D71C]/90 rounded-[4px] uppercase font-['Roboto']"
            >
              <Target className="w-4 h-4" />
              Set Goal
            </button>
          </div>

          {isLoading ? (
            <div className="h-32 bg-[#1E1E1E] rounded-[4px] animate-pulse"></div>
          ) : (
            <RevenueProgress 
              currentValue={metrics.totalRevenue} 
              outstandingAmount={metrics.outstandingAmount}
              targetValue={revenueTarget} 
            />
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
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
                trendIcon={ArrowUp}
              />
              <MetricCard
                title="Total Invoices"
                value={metrics.totalInvoices.toString()}
                icon={FileText}
                trend={5}
                trendIcon={ArrowUp}
              />
              <MetricCard
                title="Total Clients"
                value={metrics.totalClients.toString()}
                icon={Users}
                trend={15}
                trendIcon={ArrowUp}
              />
              <MetricCard
                title="Total Products"
                value={metrics.totalProducts.toString()}
                icon={Package}
                trend={8}
                trendIcon={ArrowUp}
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : (
            <>
              <div className="bg-[#121212] rounded-[4px] border border-[#333333] p-6">
                <RevenueChart data={metrics.monthlyRevenue} title="Monthly Revenue" />
              </div>
              <div className="bg-[#121212] rounded-[4px] border border-[#333333] p-6">
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