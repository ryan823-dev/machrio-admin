-- Create bank_accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country VARCHAR(2) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    beneficiary_name VARCHAR(255),
    account_number VARCHAR(100) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    swift_code VARCHAR(50),
    local_bank_code VARCHAR(50),
    routing_number VARCHAR(20),
    iban VARCHAR(100),
    sort_code VARCHAR(20),
    bank_address TEXT,
    additional_info TEXT,
    flag VARCHAR(10),
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_bank_accounts_country ON bank_accounts(country);
CREATE INDEX idx_bank_accounts_active ON bank_accounts(active);
CREATE INDEX idx_bank_accounts_currency ON bank_accounts(currency);
CREATE INDEX idx_bank_accounts_sort_order ON bank_accounts(sort_order);

-- Insert sample data
INSERT INTO bank_accounts (country, bank_name, account_name, account_number, currency, swift_code, routing_number, sort_order, active) VALUES
('US', 'JPMorgan Chase Bank', 'Machrio Inc.', '123456789012', 'USD', 'CHASUS33', '021000021', 1, TRUE),
('GB', 'Barclays Bank UK PLC', 'Machrio Ltd.', '987654321098', 'GBP', 'BARCGB22', NULL, 2, TRUE, NULL, NULL, NULL, '20-00-00'),
('DE', 'Deutsche Bank AG', 'Machrio GmbH', '456789123456', 'EUR', 'DEUTDEFF', NULL, 3, TRUE, NULL, NULL, 'DE89370400440532013000', NULL);
