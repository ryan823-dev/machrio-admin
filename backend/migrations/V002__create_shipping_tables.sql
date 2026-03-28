-- Create shipping_methods table
CREATE TABLE IF NOT EXISTS shipping_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    transit_days INTEGER,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create shipping_rates table
CREATE TABLE IF NOT EXISTS shipping_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipping_method_id UUID NOT NULL REFERENCES shipping_methods(id) ON DELETE CASCADE,
    country_code VARCHAR(2),
    base_weight DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    base_rate DECIMAL(10,2) NOT NULL,
    additional_rate DECIMAL(10,2) NOT NULL,
    handling_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create free_shipping_rules table
CREATE TABLE IF NOT EXISTS free_shipping_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipping_method_id UUID NOT NULL REFERENCES shipping_methods(id) ON DELETE CASCADE,
    country_code VARCHAR(2),
    minimum_amount DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_shipping_methods_active ON shipping_methods(is_active);
CREATE INDEX idx_shipping_methods_sort_order ON shipping_methods(sort_order);

CREATE INDEX idx_shipping_rates_method ON shipping_rates(shipping_method_id);
CREATE INDEX idx_shipping_rates_country ON shipping_rates(country_code);
CREATE INDEX idx_shipping_rates_active ON shipping_rates(is_active);

CREATE INDEX idx_free_shipping_rules_method ON free_shipping_rules(shipping_method_id);
CREATE INDEX idx_free_shipping_rules_country ON free_shipping_rules(country_code);
CREATE INDEX idx_free_shipping_rules_active ON free_shipping_rules(is_active);

-- Insert sample shipping methods
INSERT INTO shipping_methods (name, code, description, icon, transit_days, sort_order, is_active) VALUES
('Standard Shipping', 'STANDARD', 'Regular delivery service', '📦', 5, 1, TRUE),
('Express Shipping', 'EXPRESS', 'Fast delivery service', '🚀', 2, 2, TRUE),
('Overnight Shipping', 'OVERNIGHT', 'Next day delivery', '⚡', 1, 3, TRUE),
('Economy Shipping', 'ECONOMY', 'Budget-friendly delivery', '🐌', 10, 4, TRUE);

-- Insert sample shipping rates
INSERT INTO shipping_rates (shipping_method_id, country_code, base_weight, base_rate, additional_rate, handling_fee, is_active) VALUES
((SELECT id FROM shipping_methods WHERE code = 'STANDARD'), 'US', 1.00, 5.99, 2.00, 1.00, TRUE),
((SELECT id FROM shipping_methods WHERE code = 'EXPRESS'), 'US', 1.00, 15.99, 5.00, 2.00, TRUE),
((SELECT id FROM shipping_methods WHERE code = 'OVERNIGHT'), 'US', 1.00, 29.99, 10.00, 3.00, TRUE),
((SELECT id FROM shipping_methods WHERE code = 'ECONOMY'), 'US', 1.00, 3.99, 1.00, 0.50, TRUE);

-- Insert sample free shipping rules
INSERT INTO free_shipping_rules (shipping_method_id, country_code, minimum_amount, is_active) VALUES
((SELECT id FROM shipping_methods WHERE code = 'STANDARD'), 'US', 50.00, TRUE),
((SELECT id FROM shipping_methods WHERE code = 'ECONOMY'), 'US', 35.00, TRUE);
