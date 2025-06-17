import { supabase } from '../lib/supabase';
import { ActivityLogService } from './ActivityLogService';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  type: string;
  category?: string;
  status: string;
  is_base_product: boolean;
  created_at: string;
  updated_at: string;
  trade_id?: string;
  user_id?: string;
  organization_id?: string;
  parent_product_id?: string;
  parent_name?: string;
  variant?: boolean;
  variant_name?: string;
  trade?: {
    id: string;
    name: string;
  };
  variants: any[];
  items?: any[];
}

export interface ProductLineItem {
  product_id: string;
  line_item_id: string;
  quantity: number;
  unit: string;
  price: number;
}

export class ProductService {
  /**
   * List all products for an organization
   */
  static async list(organizationId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        trade:trades(id, name),
        variants:products!parent_product_id(*)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Get a single product by ID
   */
  static async getById(id: string): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        trade:trades(id, name),
        variants:products!parent_product_id(*),
        items:product_line_items(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Create a new product
   */
  static async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'> & {
    organization_id: string;
    lineItems?: ProductLineItem[];
  }): Promise<Product> {
    const { lineItems, ...productData } = product;

    // Create the product
    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (productError) {
      throw productError;
    }

    // Create product_line_items if provided
    if (lineItems && lineItems.length > 0) {
      const lineItemEntries = lineItems.map(item => ({
        ...item,
        product_id: newProduct.id
      }));

      const { error: lineItemsError } = await supabase
        .from('product_line_items')
        .insert(lineItemEntries);

      if (lineItemsError) {
        throw lineItemsError;
      }
    }

    // Log activity
    await ActivityLogService.log({
      organizationId: product.organization_id,
      entityType: 'product',
      entityId: newProduct.id,
      action: 'created',
      description: `created product ${newProduct.name}`,
      metadata: {
        price: newProduct.price,
        unit: newProduct.unit,
        type: newProduct.type,
        category: newProduct.category || 'Uncategorized',
        is_base_product: newProduct.is_base_product
      }
    });

    return newProduct;
  }

  /**
   * Update an existing product
   */
  static async update(id: string, updates: Partial<Product> & { organization_id: string }): Promise<Product> {
    // Get the current product for comparison
    const { data: currentProduct, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Update the product
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Build metadata for what changed
    const metadata: Record<string, any> = {};
    if (updates.name && updates.name !== currentProduct.name) {
      metadata.old_name = currentProduct.name;
      metadata.new_name = updates.name;
    }
    if (updates.price !== undefined && updates.price !== currentProduct.price) {
      metadata.old_price = currentProduct.price;
      metadata.new_price = updates.price;
    }
    if (updates.status && updates.status !== currentProduct.status) {
      metadata.old_status = currentProduct.status;
      metadata.new_status = updates.status;
    }

    // Log activity
    await ActivityLogService.log({
      organizationId: updates.organization_id,
      entityType: 'product',
      entityId: id,
      action: 'updated',
      description: `updated product ${updatedProduct.name}`,
      metadata
    });

    return updatedProduct;
  }

  /**
   * Delete a product
   */
  static async delete(id: string, organizationId: string): Promise<void> {
    // Get product info before deletion
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('name, price, type')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // Delete the product
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    // Log activity
    await ActivityLogService.log({
      organizationId,
      entityType: 'product',
      entityId: id,
      action: 'deleted',
      description: `deleted product ${product.name}`,
      metadata: {
        name: product.name,
        price: product.price,
        type: product.type
      }
    });
  }

  /**
   * Archive a product (soft delete)
   */
  static async archive(id: string, organizationId: string): Promise<Product> {
    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log activity
    await ActivityLogService.log({
      organizationId,
      entityType: 'product',
      entityId: id,
      action: 'archived',
      description: `archived product ${updatedProduct.name}`,
      metadata: {
        name: updatedProduct.name
      }
    });

    return updatedProduct;
  }

  /**
   * Restore an archived product
   */
  static async restore(id: string, organizationId: string): Promise<Product> {
    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Log activity
    await ActivityLogService.log({
      organizationId,
      entityType: 'product',
      entityId: id,
      action: 'restored',
      description: `restored product ${updatedProduct.name}`,
      metadata: {
        name: updatedProduct.name
      }
    });

    return updatedProduct;
  }

  /**
   * Create a product variant
   */
  static async createVariant(parentProductId: string, variant: Omit<Product, 'id' | 'created_at' | 'updated_at'> & {
    organization_id: string;
  }): Promise<Product> {
    // Get parent product info
    const { data: parentProduct, error: parentError } = await supabase
      .from('products')
      .select('name')
      .eq('id', parentProductId)
      .single();

    if (parentError) {
      throw parentError;
    }

    // Create the variant
    const variantData = {
      ...variant,
      parent_product_id: parentProductId,
      parent_name: parentProduct.name,
      variant: true,
      is_base_product: false
    };

    const { data: newVariant, error: variantError } = await supabase
      .from('products')
      .insert(variantData)
      .select()
      .single();

    if (variantError) {
      throw variantError;
    }

    // Log activity
    await ActivityLogService.log({
      organizationId: variant.organization_id,
      entityType: 'product',
      entityId: newVariant.id,
      action: 'created',
      description: `created variant ${newVariant.variant_name || newVariant.name} for product ${parentProduct.name}`,
      metadata: {
        parent_product_id: parentProductId,
        parent_product_name: parentProduct.name,
        variant_name: newVariant.variant_name,
        price: newVariant.price
      }
    });

    return newVariant;
  }
}