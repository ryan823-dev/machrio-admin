# 海外银行账户数据导入指南

## 概述

本文档说明如何将从 machrio.com 网站收集的海外银行账户信息导入到后台管理系统中。

## 方法一：通过后台界面手动添加（推荐用于少量账户）

### 步骤

1. 登录后台管理系统
2. 导航到 **系统设置** → **银行账户**
3. 点击 **"添加银行账户"** 按钮
4. 填写银行账户信息：
   - **国家/地区**: 选择账户所在国家
   - **银行名称**: 完整银行名称（英文）
   - **账户名称**: 账户持有人名称
   - **受益人名称**: 可选
   - **账号**: 银行账号
   - **币种**: 账户币种
   - **SWIFT/BIC 代码**: 国际汇款代码
   - **国家特定代码**: 
     - 美国：Routing Number（9 位数字）
     - 英国：Sort Code（6 位数字）
     - 欧盟国家：IBAN（国际银行账号）
     - 其他国家：本地银行代码
   - **银行地址**: 银行分行地址
   - **附加信息**: 其他说明
   - **排序**: 显示顺序（数字越小越靠前）
   - **状态**: 启用/禁用

5. 点击 **"保存"**

### 国家/地区支持

系统支持以下国家的银行账户：

| 国家 | 代码 | 国旗 | 必需代码 | 可选代码 |
|------|------|------|----------|----------|
| 🇺🇸 美国 | US | USD | Routing Number | SWIFT |
| 🇬🇧 英国 | GB | GBP | Sort Code | SWIFT, IBAN |
| 🇩🇪 德国 | DE | EUR | IBAN | Local Bank Code, SWIFT |
| 🇫🇷 法国 | FR | EUR | IBAN | Local Bank Code, SWIFT |
| 🇮🇹 意大利 | IT | EUR | IBAN | Local Bank Code, SWIFT |
| 🇪🇸 西班牙 | ES | EUR | IBAN | Local Bank Code, SWIFT |
| 🇨🇦 加拿大 | CA | CAD | Local Bank Code | SWIFT |
| 🇦🇺 澳大利亚 | AU | AUD | Local Bank Code | SWIFT |
| 🇯🇵 日本 | JP | JPY | Local Bank Code | SWIFT |
| 🇨🇳 中国 | CN | CNY | Local Bank Code | SWIFT |

## 方法二：使用 SQL 脚本批量导入（推荐用于大量账户）

### 步骤

1. 准备 SQL 导入数据（见下方示例）
2. 连接到 Railway PostgreSQL 数据库
3. 执行 SQL 脚本

### SQL 导入示例

```sql
-- 美国银行账户
INSERT INTO bank_accounts (
    country, bank_name, account_name, beneficiary_name, 
    account_number, currency, swift_code, routing_number, 
    bank_address, additional_info, sort_order, active
) VALUES (
    'US',
    'JPMorgan Chase Bank, N.A.',
    'Machrio Inc.',
    NULL,
    '1234567890123456',
    'USD',
    'CHASUS33',
    '021000021',
    '270 Park Avenue, New York, NY 10017, USA',
    'For wire transfers only',
    1,
    TRUE
);

-- 英国银行账户
INSERT INTO bank_accounts (
    country, bank_name, account_name, beneficiary_name,
    account_number, currency, swift_code, sort_code, iban,
    bank_address, sort_order, active
) VALUES (
    'GB',
    'Barclays Bank UK PLC',
    'Machrio Ltd.',
    NULL,
    '12345678',
    'GBP',
    'BARCGB22',
    '20-00-00',
    NULL,
    '1 Churchill Place, London E14 5HP, United Kingdom',
    2,
    TRUE
);

-- 德国银行账户
INSERT INTO bank_accounts (
    country, bank_name, account_name, beneficiary_name,
    account_number, currency, swift_code, iban, local_bank_code,
    bank_address, sort_order, active
) VALUES (
    'DE',
    'Deutsche Bank AG',
    'Machrio GmbH',
    NULL,
    '0456789123',
    'EUR',
    'DEUTDEFF',
    'DE89370400440532013000',
    '37040044',
    'Taunusanlage 12, 60325 Frankfurt am Main, Germany',
    3,
    TRUE
);

-- 法国银行账户
INSERT INTO bank_accounts (
    country, bank_name, account_name,
    account_number, currency, swift_code, iban, local_bank_code,
    bank_address, sort_order, active
) VALUES (
    'FR',
    'BNP Paribas',
    'Machrio France S.A.R.L.',
    '12345678901',
    'EUR',
    'BNPAFRPP',
    'FR1420041010050500013M02606',
    '20041',
    '16 Boulevard des Italiens, 75009 Paris, France',
    4,
    TRUE
);

-- 日本银行账户
INSERT INTO bank_accounts (
    country, bank_name, account_name,
    account_number, currency, swift_code, local_bank_code,
    bank_address, sort_order, active
) VALUES (
    'JP',
    'Mitsubishi UFJ Financial Group',
    'Machrio Japan K.K.',
    '1234567',
    'JPY',
    'BOTKJPJT',
    '0001',
    '7-1, Marunouchi 2-chome, Chiyoda-ku, Tokyo 100-8388, Japan',
    5,
    TRUE
);
```

## 方法三：使用导入脚本（自动化）

### 准备数据 JSON 文件

创建 `bank-accounts-data.json` 文件：

```json
{
  "accounts": [
    {
      "country": "US",
      "bankName": "JPMorgan Chase Bank, N.A.",
      "accountName": "Machrio Inc.",
      "accountNumber": "1234567890123456",
      "currency": "USD",
      "swiftCode": "CHASUS33",
      "routingNumber": "021000021",
      "bankAddress": "270 Park Avenue, New York, NY 10017, USA",
      "additionalInfo": "For wire transfers only",
      "sortOrder": 1,
      "active": true
    },
    {
      "country": "GB",
      "bankName": "Barclays Bank UK PLC",
      "accountName": "Machrio Ltd.",
      "accountNumber": "12345678",
      "currency": "GBP",
      "swiftCode": "BARCGB22",
      "sortCode": "20-00-00",
      "bankAddress": "1 Churchill Place, London E14 5HP, United Kingdom",
      "sortOrder": 2,
      "active": true
    }
  ]
}
```

### 使用 cURL 通过 API 导入

```bash
#!/bin/bash

# 配置 API 端点和认证
API_URL="https://your-backend.railway.app/api/bank-accounts"
API_KEY="your-api-key"

# 读取 JSON 文件并逐个创建账户
jq -c '.accounts[]' bank-accounts-data.json | while read -r account; do
    echo "Importing: $(echo $account | jq -r '.bankName')"
    
    curl -X POST "$API_URL" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $API_KEY" \
        -d "$account"
    
    echo ""
done

echo "Import completed!"
```

## 数据验证

### 字段验证规则

| 字段 | 必填 | 格式要求 | 示例 |
|------|------|----------|------|
| country | ✅ | 2 位国家代码 | US, GB, DE |
| bank_name | ✅ | 文本 | JPMorgan Chase Bank |
| account_name | ✅ | 文本 | Machrio Inc. |
| account_number | ✅ | 文本 | 1234567890123456 |
| currency | ✅ | 3 位币种代码 | USD, EUR, GBP |
| swift_code | ❌ | 8-11 位字母数字 | CHASUS33 |
| routing_number | ❌ (美国) | 9 位数字 | 021000021 |
| sort_code | ❌ (英国) | 6 位数字 (XX-XX-XX) | 20-00-00 |
| iban | ❌ (欧盟) | 字母数字组合 | DE89370400440532013000 |
| local_bank_code | ❌ | 文本 | 37040044 |

### 验证查询

执行以下 SQL 查询验证导入的数据：

```sql
-- 检查所有已启用的账户
SELECT 
    country, 
    bank_name, 
    account_name, 
    currency,
    swift_code,
    active
FROM bank_accounts
WHERE active = TRUE
ORDER BY sort_order;

-- 按国家统计账户数量
SELECT 
    country,
    COUNT(*) as account_count,
    STRING_AGG(currency, ', ') as currencies
FROM bank_accounts
GROUP BY country
ORDER BY country;

-- 检查缺少 SWIFT 代码的账户（国际汇款可能需要）
SELECT 
    country,
    bank_name,
    account_name,
    currency
FROM bank_accounts
WHERE swift_code IS NULL 
  AND active = TRUE
ORDER BY country;
```

## 常见问题

### Q1: 我应该使用哪种方法导入？

- **1-5 个账户**: 使用后台界面手动添加
- **5-20 个账户**: 使用 SQL 脚本批量导入
- **20+ 个账户**: 使用导入脚本自动化

### Q2: 如何测试导入的账户？

1. 在后台查看银行账户列表
2. 确认所有字段正确显示
3. 检查国家特定代码（Routing Number, Sort Code, IBAN 等）
4. 验证排序顺序

### Q3: 如何处理敏感信息？

⚠️ **重要安全提示**:

- 不要在代码仓库中存储真实的银行账号
- 使用环境变量或密钥管理服务存储敏感数据
- 对数据库连接使用加密
- 限制访问银行账户信息的权限

### Q4: 能否添加自定义字段？

可以。数据库表支持 `additional_info` 字段存储额外信息。如需更多自定义字段，需要：

1. 修改数据库迁移文件添加新字段
2. 更新后端 DTO 和 Entity
3. 修改前端表单界面

## 后续步骤

1. ✅ 收集 machrio.com 网站的所有银行账户信息
2. ✅ 选择导入方法
3. ✅ 准备数据
4. ✅ 执行导入
5. ✅ 验证数据
6. ✅ 在网站上显示（如需要）

## 相关文档

- [银行账户 API 文档](./backend/machrio-api/src/main/java/com/machrio/admin/controller/BankAccountController.java)
- [数据库架构](./backend/migrations/V004__create_bank_accounts_table.sql)
- [前端界面](./frontend/src/pages/BankAccountsPage.tsx)
