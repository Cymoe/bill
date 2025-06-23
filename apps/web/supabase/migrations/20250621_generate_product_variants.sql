-- Generate basic and premium variants for all existing standard products
DO $$
DECLARE
    v_product RECORD;
    v_count INTEGER := 0;
BEGIN
    -- Loop through all standard products without variants
    FOR v_product IN
        SELECT p.id
        FROM products p
        WHERE p.quality_tier = 'standard'
        AND p.parent_product_id IS NULL
        AND p.is_base_product = true
        AND NOT EXISTS (
            SELECT 1 FROM products v 
            WHERE v.parent_product_id = p.id
        )
    LOOP
        -- Generate variants for this product
        PERFORM generate_product_variants(v_product.id);
        v_count := v_count + 1;
    END LOOP;
    
    RAISE NOTICE 'Generated variants for % products', v_count;
END $$;