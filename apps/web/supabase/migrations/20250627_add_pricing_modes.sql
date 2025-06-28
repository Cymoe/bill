-- Create pricing modes table for dynamic pricing strategies
CREATE TABLE IF NOT EXISTS pricing_modes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '📊',
    description TEXT,
    adjustments JSONB NOT NULL DEFAULT '{}',
    is_preset BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    successful_estimates INTEGER DEFAULT 0,
    total_estimates INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_org_mode_name UNIQUE(organization_id, name)
);

-- Add RLS policies
ALTER TABLE pricing_modes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's pricing modes and presets"
    ON pricing_modes FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM user_organizations 
            WHERE organization_id = pricing_modes.organization_id
        )
        OR is_preset = true
    );

CREATE POLICY "Users can create pricing modes for their organization"
    ON pricing_modes FOR INSERT
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id 
            FROM user_organizations 
            WHERE organization_id = pricing_modes.organization_id
        )
        AND is_preset = false
    );

CREATE POLICY "Users can update their organization's custom pricing modes"
    ON pricing_modes FOR UPDATE
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM user_organizations 
            WHERE organization_id = pricing_modes.organization_id
        )
        AND is_preset = false
    );

CREATE POLICY "Users can delete their organization's custom pricing modes"
    ON pricing_modes FOR DELETE
    USING (
        auth.uid() IN (
            SELECT user_id 
            FROM user_organizations 
            WHERE organization_id = pricing_modes.organization_id
        )
        AND is_preset = false
    );

-- Add mode tracking to line_item_overrides
ALTER TABLE line_item_overrides 
ADD COLUMN IF NOT EXISTS applied_mode_id UUID REFERENCES pricing_modes(id),
ADD COLUMN IF NOT EXISTS mode_multiplier NUMERIC(10,4);

-- Add mode tracking to estimates
ALTER TABLE estimates
ADD COLUMN IF NOT EXISTS pricing_mode_id UUID REFERENCES pricing_modes(id),
ADD COLUMN IF NOT EXISTS pricing_mode_snapshot JSONB;

-- Create indexes
CREATE INDEX idx_pricing_modes_org_id ON pricing_modes(organization_id);
CREATE INDEX idx_pricing_modes_is_preset ON pricing_modes(is_preset);
CREATE INDEX idx_line_item_overrides_mode ON line_item_overrides(applied_mode_id);
CREATE INDEX idx_estimates_pricing_mode ON estimates(pricing_mode_id);

-- Insert preset pricing modes
INSERT INTO pricing_modes (name, icon, description, adjustments, is_preset) VALUES
('Market Rate', '📊', 'Standard market pricing', '{"all": 1.0}', true),
('Rush Job', '🏃', 'Urgent timeline premium', '{"all": 1.8}', true),
('Competitive', '🎯', 'Win more bids with lower margins', '{"all": 0.85}', true),
('Premium Service', '🏆', 'High-end quality and service', '{"labor": 1.5, "materials": 1.25, "services": 1.5, "installation": 1.4}', true),
('Need This Job', '💰', 'Aggressive pricing to secure work', '{"all": 0.8}', true),
('Busy Season', '☀️', 'Peak demand pricing', '{"labor": 1.25, "materials": 1.1, "services": 1.2}', true),
('Slow Season', '❄️', 'Keep crews busy during slow times', '{"labor": 0.8, "materials": 1.0, "services": 0.85}', true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_pricing_modes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pricing_modes_timestamp
    BEFORE UPDATE ON pricing_modes
    FOR EACH ROW
    EXECUTE FUNCTION update_pricing_modes_updated_at();