import { supabase } from '../lib/supabase';

interface ExpenseTemplate {
  id: string;
  category_id: string;
  description: string;
  typical_amount: number;
  expense_category: string;
  vendor: string;
  display_order: number;
}

interface ProjectExpense {
  user_id: string;
  project_id: string;
  description: string;
  amount: number;
  category: string;
  vendor: string;
  date: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  category_id: string;
}

export class ExpenseService {
  /**
   * Generate expenses for a project based on its category templates
   */
  static async generateExpensesFromTemplates(
    projectId: string,
    categoryId: string,
    userId: string,
    startDate: string
  ): Promise<void> {
    try {
      // Fetch expense templates for the category
      const { data: templates, error: templatesError } = await supabase
        .from('expense_templates')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('display_order');

      if (templatesError) throw templatesError;
      if (!templates || templates.length === 0) return;

      // Generate expenses from templates
      const expenses: ProjectExpense[] = templates.map((template, index) => {
        // Stagger expense dates based on typical project timeline
        const expenseDate = this.calculateExpenseDate(startDate, index, templates.length);
        
        return {
          user_id: userId,
          project_id: projectId,
          description: template.description,
          amount: template.typical_amount,
          category: template.expense_category,
          vendor: template.vendor || '',
          date: expenseDate,
          status: 'pending' as const,
          category_id: categoryId
        };
      });

      // Insert all expenses
      const { error: insertError } = await supabase
        .from('expenses')
        .insert(expenses);

      if (insertError) throw insertError;

      console.log(`Generated ${expenses.length} expenses for project ${projectId}`);
    } catch (error) {
      console.error('Error generating expenses from templates:', error);
      throw error;
    }
  }

  /**
   * Calculate expense date based on project start date and expense order
   */
  private static calculateExpenseDate(startDate: string, index: number, totalExpenses: number): string {
    const start = new Date(startDate);
    // Distribute expenses across a typical 30-day project timeline
    const daysToAdd = Math.floor((index / totalExpenses) * 30);
    start.setDate(start.getDate() + daysToAdd);
    return start.toISOString().split('T')[0];
  }

  /**
   * Get all expenses for a project
   */
  static async getProjectExpenses(projectId: string) {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('project_id', projectId)
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Update expense status
   */
  static async updateExpenseStatus(
    expenseId: string,
    status: 'pending' | 'approved' | 'paid' | 'rejected'
  ) {
    const { error } = await supabase
      .from('expenses')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', expenseId);

    if (error) throw error;
  }

  /**
   * Get expense summary for a project
   */
  static async getProjectExpenseSummary(projectId: string) {
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('amount, category, status')
      .eq('project_id', projectId);

    if (error) throw error;

    const summary = {
      total: 0,
      byCategory: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      paidTotal: 0,
      pendingTotal: 0
    };

    expenses?.forEach(expense => {
      summary.total += expense.amount;
      
      // By category
      if (!summary.byCategory[expense.category]) {
        summary.byCategory[expense.category] = 0;
      }
      summary.byCategory[expense.category] += expense.amount;

      // By status
      if (!summary.byStatus[expense.status]) {
        summary.byStatus[expense.status] = 0;
      }
      summary.byStatus[expense.status] += expense.amount;

      // Paid vs pending
      if (expense.status === 'paid') {
        summary.paidTotal += expense.amount;
      } else if (expense.status === 'pending' || expense.status === 'approved') {
        summary.pendingTotal += expense.amount;
      }
    });

    return summary;
  }
} 