-- =====================================================
-- 海外银行账户数据导入脚本
-- =====================================================
-- 说明：将此文件中的示例数据替换为实际的银行账户信息
-- 使用方法：psql -h <host> -U <user> -d <database> -f import-bank-accounts.sql
-- =====================================================

-- 清空现有数据（谨慎使用！生产环境建议先备份）
-- DELETE FROM bank_accounts;

-- =====================================================
-- 北美地区
-- =====================================================

-- 🇺🇸 美国银行账户
INSERT INTO bank_accounts (
    id, country, bank_name, account_name, beneficiary_name,
    account_number, currency, swift_code, routing_number,
    bank_address, additional_info, flag, sort_order, active,
    created_at, updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',  -- 替换为实际 UUID 或留空使用默认值
    'US',
    'JPMorgan Chase Bank, N.A.',              -- 替换为实际银行名称
    'Machrio Inc.',                           -- 替换为实际账户名称
    NULL,                                     -- 受益人名称（可选）
    '1234567890123456',                       -- 替换为实际账号
    'USD',
    'CHASUS33',                               -- 替换为实际 SWIFT 代码
    '021000021',                              -- 替换为实际 Routing Number
    '270 Park Avenue, New York, NY 10017, USA',
    'Wire transfers only. For ACH use different account.',
    '🇺🇸',
    1,                                        -- 排序顺序
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (id) DO UPDATE SET
    bank_name = EXCLUDED.bank_name,
    account_name = EXCLUDED.account_name,
    account_number = EXCLUDED.account_number,
    swift_code = EXCLUDED.swift_code,
    routing_number = EXCLUDED.routing_number,
    updated_at = CURRENT_TIMESTAMP;

-- 🇨🇦 加拿大银行账户
INSERT INTO bank_accounts (
    id, country, bank_name, account_name, beneficiary_name,
    account_number, currency, swift_code, local_bank_code,
    bank_address, additional_info, flag, sort_order, active,
    created_at, updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    'CA',
    'Royal Bank of Canada',                  -- 替换为实际银行名称
    'Machrio Canada Inc.',                   -- 替换为实际账户名称
    NULL,
    '1234567890',                            -- 替换为实际账号
    'CAD',
    'ROYCCAT2',                              -- 替换为实际 SWIFT 代码
    '003',                                   -- 替换为实际机构号码
    '200 Bay Street, Toronto, ON M5J 2J5, Canada',
    'Institution Number: 003, Transit: 00001',
    '🇨🇦',
    2,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (id) DO UPDATE SET
    bank_name = EXCLUDED.bank_name,
    account_name = EXCLUDED.account_name,
    account_number = EXCLUDED.account_number,
    swift_code = EXCLUDED.swift_code,
    local_bank_code = EXCLUDED.local_bank_code,
    updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- 欧洲地区
-- =====================================================

-- 🇬🇧 英国银行账户
INSERT INTO bank_accounts (
    id, country, bank_name, account_name, beneficiary_name,
    account_number, currency, swift_code, sort_code, iban,
    bank_address, additional_info, flag, sort_order, active,
    created_at, updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000003',
    'GB',
    'Barclays Bank UK PLC',                  -- 替换为实际银行名称
    'Machrio Ltd.',                          -- 替换为实际账户名称
    NULL,
    '12345678',                              -- 替换为实际账号
    'GBP',
    'BARCGB22',                              -- 替换为实际 SWIFT 代码
    '20-00-00',                              -- 替换为实际 Sort Code
    NULL,                                    -- IBAN（英国通常不使用）
    '1 Churchill Place, London E14 5HP, United Kingdom',
    'Sort Code: 20-00-00',
    '🇬🇧',
    3,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (id) DO UPDATE SET
    bank_name = EXCLUDED.bank_name,
    account_name = EXCLUDED.account_name,
    account_number = EXCLUDED.account_number,
    swift_code = EXCLUDED.swift_code,
    sort_code = EXCLUDED.sort_code,
    updated_at = CURRENT_TIMESTAMP;

-- 🇩🇪 德国银行账户
INSERT INTO bank_accounts (
    id, country, bank_name, account_name, beneficiary_name,
    account_number, currency, swift_code, iban, local_bank_code,
    bank_address, additional_info, flag, sort_order, active,
    created_at, updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000004',
    'DE',
    'Deutsche Bank AG',                      -- 替换为实际银行名称
    'Machrio GmbH',                          -- 替换为实际账户名称
    NULL,
    '0456789123',                            -- 替换为实际账号
    'EUR',
    'DEUTDEFF',                              -- 替换为实际 SWIFT 代码
    'DE89370400440532013000',               -- 替换为实际 IBAN
    '37040044',                              -- 替换为实际银行代码
    'Taunusanlage 12, 60325 Frankfurt am Main, Germany',
    'BLZ: 37040044',
    '🇩🇪',
    4,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (id) DO UPDATE SET
    bank_name = EXCLUDED.bank_name,
    account_name = EXCLUDED.account_name,
    account_number = EXCLUDED.account_number,
    swift_code = EXCLUDED.swift_code,
    iban = EXCLUDED.iban,
    local_bank_code = EXCLUDED.local_bank_code,
    updated_at = CURRENT_TIMESTAMP;

-- 🇫🇷 法国银行账户
INSERT INTO bank_accounts (
    id, country, bank_name, account_name, beneficiary_name,
    account_number, currency, swift_code, iban, local_bank_code,
    bank_address, additional_info, flag, sort_order, active,
    created_at, updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000005',
    'FR',
    'BNP Paribas',                           -- 替换为实际银行名称
    'Machrio France S.A.R.L.',               -- 替换为实际账户名称
    NULL,
    '12345678901',                           -- 替换为实际账号
    'EUR',
    'BNPAFRPP',                              -- 替换为实际 SWIFT 代码
    'FR1420041010050500013M02606',          -- 替换为实际 IBAN
    '20041',                                 -- 替换为实际银行代码
    '16 Boulevard des Italiens, 75009 Paris, France',
    'Code Banque: 20041, Code Guichet: 01005',
    '🇫🇷',
    5,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (id) DO UPDATE SET
    bank_name = EXCLUDED.bank_name,
    account_name = EXCLUDED.account_name,
    account_number = EXCLUDED.account_number,
    swift_code = EXCLUDED.swift_code,
    iban = EXCLUDED.iban,
    local_bank_code = EXCLUDED.local_bank_code,
    updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- 亚太地区
-- =====================================================

-- 🇯🇵 日本银行账户
INSERT INTO bank_accounts (
    id, country, bank_name, account_name, beneficiary_name,
    account_number, currency, swift_code, local_bank_code,
    bank_address, additional_info, flag, sort_order, active,
    created_at, updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000006',
    'JP',
    'Mitsubishi UFJ Financial Group',        -- 替换为实际银行名称
    'Machrio Japan K.K.',                    -- 替换为实际账户名称
    NULL,
    '1234567',                               -- 替换为实际账号
    'JPY',
    'BOTKJPJT',                              -- 替换为实际 SWIFT 代码
    '0001',                                  -- 替换为实际银行代码
    '7-1, Marunouchi 2-chome, Chiyoda-ku, Tokyo 100-8388, Japan',
    'Branch Code: 001, Account Type: Ordinary',
    '🇯🇵',
    6,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (id) DO UPDATE SET
    bank_name = EXCLUDED.bank_name,
    account_name = EXCLUDED.account_name,
    account_number = EXCLUDED.account_number,
    swift_code = EXCLUDED.swift_code,
    local_bank_code = EXCLUDED.local_bank_code,
    updated_at = CURRENT_TIMESTAMP;

-- 🇦🇺 澳大利亚银行账户
INSERT INTO bank_accounts (
    id, country, bank_name, account_name, beneficiary_name,
    account_number, currency, swift_code, local_bank_code,
    bank_address, additional_info, flag, sort_order, active,
    created_at, updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000007',
    'AU',
    'Commonwealth Bank of Australia',        -- 替换为实际银行名称
    'Machrio Australia Pty Ltd.',            -- 替换为实际账户名称
    NULL,
    '123456789',                             -- 替换为实际账号
    'AUD',
    'CTBAAU2S',                              -- 替换为实际 SWIFT 代码
    '062-000',                               -- 替换为实际 BSB 号码
    'Ground Floor, Tower 1, 201 Sussex Street, Sydney NSW 2000, Australia',
    'BSB: 062-000',
    '🇦🇺',
    7,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (id) DO UPDATE SET
    bank_name = EXCLUDED.bank_name,
    account_name = EXCLUDED.account_name,
    account_number = EXCLUDED.account_number,
    swift_code = EXCLUDED.swift_code,
    local_bank_code = EXCLUDED.local_bank_code,
    updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- 验证导入结果
-- =====================================================

-- 查看所有已启用的账户
SELECT 
    id,
    country,
    flag,
    bank_name,
    account_name,
    currency,
    swift_code,
    active,
    sort_order
FROM bank_accounts
WHERE active = TRUE
ORDER BY sort_order;

-- 按地区统计
SELECT 
    CASE 
        WHEN country IN ('US', 'CA') THEN '🌎 北美'
        WHEN country IN ('GB', 'DE', 'FR', 'IT', 'ES') THEN '🇪🇺 欧洲'
        WHEN country IN ('JP', 'AU', 'CN') THEN '🌏 亚太'
        ELSE '其他'
    END as region,
    COUNT(*) as account_count,
    STRING_AGG(DISTINCT currency, ', ') as currencies
FROM bank_accounts
WHERE active = TRUE
GROUP BY region
ORDER BY region;
