-- Add Hail Mary and Reset to Baseline pricing modes

-- Add Hail Mary mode (10x pricing for those impossible jobs)
INSERT INTO pricing_modes (name, icon, description, adjustments, is_preset) 
VALUES ('Hail Mary', '🚀', 'When you really don''t want the job', '{"all": 10.0}', true);

-- Add Reset to Baseline mode (back to market rate)
INSERT INTO pricing_modes (name, icon, description, adjustments, is_preset) 
VALUES ('Reset to Baseline', '↩️', 'Back to standard market pricing', '{"all": 1.0}', true);