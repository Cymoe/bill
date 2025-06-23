-- Create invoice_template_items table
CREATE TABLE invoice_template_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES invoice_templates(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_template FOREIGN KEY (template_id) REFERENCES invoice_templates(id),
  CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Create index
CREATE INDEX idx_invoice_template_items_template_id ON invoice_template_items(template_id);

-- Enable RLS
ALTER TABLE invoice_template_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own template items"
  ON invoice_template_items
  FOR SELECT
  USING (
    template_id IN (
      SELECT id FROM invoice_templates WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create template items for their templates"
  ON invoice_template_items
  FOR INSERT
  WITH CHECK (
    template_id IN (
      SELECT id FROM invoice_templates WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own template items"
  ON invoice_template_items
  FOR UPDATE
  USING (
    template_id IN (
      SELECT id FROM invoice_templates WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    template_id IN (
      SELECT id FROM invoice_templates WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own template items"
  ON invoice_template_items
  FOR DELETE
  USING (
    template_id IN (
      SELECT id FROM invoice_templates WHERE user_id = auth.uid()
    )
  ); 