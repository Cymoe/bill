import { supabase } from '../lib/supabase';
import { ActivityLogService } from './ActivityLogService';

export interface CostCode {
  id: string;
  code: string;
  name: string;
  description: string;
  category: 'labor' | 'material' | 'equipment' | 'subcontractor' | 'service';
  organization_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface IndustryMarkupRule {
  industry_id: string;
  cost_code_category: string;
  markup_percentage: number;
  tier: 'budget' | 'standard' | 'premium';
}

export interface BulkProductGenerationParams {
  cost_code_ids: string[];
  industry_id: string;
  organization_id: string;
  tier: 'budget' | 'standard' | 'premium';
  custom_markup?: number;
  name_prefix?: string;
  name_suffix?: string;
}

export interface GeneratedProduct {
  name: string;
  description: string;
  price: number;
  unit: string;
  cost_code_id: string;
  industry_id: string;
  tier: string;
  markup_percentage: number;
  base_cost: number;
}

export class CostCodeProductService {
  /**
   * Get industry-specific markup rules
   */
  static async getIndustryMarkupRules(industryId: string): Promise<IndustryMarkupRule[]> {
    const { data, error } = await supabase
      .from('industry_markup_rules')
      .select('*')
      .eq('industry_id', industryId);

    if (error) {
      console.error('Error fetching markup rules:', error);
      // Return default markup rules if table doesn't exist yet
      return this.getDefaultMarkupRules();
    }

    return data || this.getDefaultMarkupRules();
  }

  /**
   * Default markup rules by category and tier
   */
  static getDefaultMarkupRules(): IndustryMarkupRule[] {
    const categories = ['labor', 'material', 'equipment', 'subcontractor', 'service'];
    const tiers = [
      { name: 'budget', markup: 15 },
      { name: 'standard', markup: 30 },
      { name: 'premium', markup: 50 }
    ];

    const rules: IndustryMarkupRule[] = [];
    
    categories.forEach(category => {
      tiers.forEach(tier => {
        // Adjust markup based on category
        let adjustedMarkup = tier.markup;
        if (category === 'labor') adjustedMarkup *= 1.2; // 20% higher for labor
        if (category === 'equipment') adjustedMarkup *= 0.8; // 20% lower for equipment
        
        rules.push({
          industry_id: 'default',
          cost_code_category: category,
          markup_percentage: adjustedMarkup,
          tier: tier.name as 'budget' | 'standard' | 'premium'
        });
      });
    });

    return rules;
  }

  /**
   * Generate products from cost codes with industry-specific markup
   */
  static async generateProductsFromCostCodes(
    params: BulkProductGenerationParams
  ): Promise<{ success: boolean; products: GeneratedProduct[]; errors?: string[] }> {
    try {
      // Fetch cost codes
      const { data: costCodes, error: costCodeError } = await supabase
        .from('cost_codes')
        .select('*')
        .in('id', params.cost_code_ids);

      if (costCodeError) throw costCodeError;
      if (!costCodes || costCodes.length === 0) {
        return { success: false, products: [], errors: ['No cost codes found'] };
      }

      // Get markup rules
      const markupRules = await this.getIndustryMarkupRules(params.industry_id);
      
      // Generate products
      const generatedProducts: GeneratedProduct[] = [];
      const errors: string[] = [];

      for (const costCode of costCodes) {
        try {
          // Find applicable markup rule
          const markupRule = markupRules.find(
            rule => rule.cost_code_category === costCode.category && rule.tier === params.tier
          ) || { markup_percentage: 30 }; // Default 30% markup

          const markupPercentage = params.custom_markup || markupRule.markup_percentage;
          // Since cost codes are now pure categories, we'll use a default base price
          // This would typically come from a base product or cost database
          const basePrice = 0; // Default base price since cost codes no longer contain pricing
          const markedUpPrice = basePrice * (1 + markupPercentage / 100);

          // Generate product name
          let productName = costCode.name;
          if (params.name_prefix) productName = `${params.name_prefix} ${productName}`;
          if (params.name_suffix) productName = `${productName} ${params.name_suffix}`;

          // Get default unit based on category
          const getDefaultUnit = (category: string) => {
            switch (category) {
              case 'labor': return 'hour';
              case 'material': return 'each';
              case 'equipment': return 'day';
              case 'subcontractor': return 'lump';
              case 'service': return 'each';
              default: return 'each';
            }
          };

          const product: GeneratedProduct = {
            name: productName,
            description: costCode.description || `${costCode.category} - ${costCode.name}`,
            price: Math.round(markedUpPrice * 100) / 100, // Round to 2 decimal places
            unit: getDefaultUnit(costCode.category),
            cost_code_id: costCode.id,
            industry_id: params.industry_id,
            tier: params.tier,
            markup_percentage: markupPercentage,
            base_cost: basePrice
          };

          generatedProducts.push(product);
        } catch (error) {
          errors.push(`Failed to generate product for cost code ${costCode.code}: ${error}`);
        }
      }

      // Log activity
      try {
        await ActivityLogService.log({
          organizationId: params.organization_id,
          entityType: 'product',
          action: 'bulk_generated',
          description: `Generated ${generatedProducts.length} products from cost codes`,
          metadata: {
            cost_code_count: params.cost_code_ids.length,
            industry_id: params.industry_id,
            tier: params.tier,
            products_generated: generatedProducts.length,
            errors: errors.length
          }
        });
      } catch (logError) {
        console.error('Failed to log bulk generation:', logError);
      }

      return {
        success: generatedProducts.length > 0,
        products: generatedProducts,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      console.error('Error generating products from cost codes:', error);
      return {
        success: false,
        products: [],
        errors: [`Failed to generate products: ${error}`]
      };
    }
  }

  /**
   * Create products in the database from generated products
   */
  static async createGeneratedProducts(
    products: GeneratedProduct[],
    organizationId: string,
    userId: string
  ): Promise<{ success: boolean; created: number; errors?: string[] }> {
    const errors: string[] = [];
    let created = 0;

    for (const product of products) {
      try {
        const { error } = await supabase
          .from('products')
          .insert({
            name: product.name,
            description: product.description,
            price: product.price,
            unit: product.unit,
            cost_code_id: product.cost_code_id,
            organization_id: organizationId,
            user_id: userId,
            is_base_product: false,
            type: 'product',
            status: 'active',
            metadata: {
              industry_id: product.industry_id,
              tier: product.tier,
              markup_percentage: product.markup_percentage,
              base_cost: product.base_cost,
              generated_from_cost_code: true
            }
          });

        if (error) throw error;
        created++;
      } catch (error) {
        errors.push(`Failed to create product "${product.name}": ${error}`);
      }
    }

    // Log activity
    if (created > 0) {
      try {
        await ActivityLogService.log({
          organizationId,
          entityType: 'product',
          action: 'bulk_created',
          description: `Created ${created} products from cost codes`,
          metadata: {
            total_attempted: products.length,
            successful: created,
            failed: errors.length
          }
        });
      } catch (logError) {
        console.error('Failed to log product creation:', logError);
      }
    }

    return {
      success: created > 0,
      created,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Get cost codes grouped by category
   */
  static async getCostCodesByCategory(organizationId?: string): Promise<Map<string, CostCode[]>> {
    const query = supabase
      .from('cost_codes')
      .select('*')
      .order('code');

    if (organizationId) {
      query.or(`organization_id.eq.${organizationId},organization_id.is.null`);
    }

    const { data, error } = await query;

    if (error) throw error;

    const groupedCodes = new Map<string, CostCode[]>();
    
    (data || []).forEach(code => {
      const category = code.category || 'other';
      if (!groupedCodes.has(category)) {
        groupedCodes.set(category, []);
      }
      groupedCodes.get(category)!.push(code);
    });

    return groupedCodes;
  }

  /**
   * Search cost codes
   */
  static async searchCostCodes(
    searchTerm: string,
    organizationId?: string
  ): Promise<CostCode[]> {
    const query = supabase
      .from('cost_codes')
      .select('*')
      .or(`code.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('code')
      .limit(50);

    if (organizationId) {
      query.or(`organization_id.eq.${organizationId},organization_id.is.null`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  }
}