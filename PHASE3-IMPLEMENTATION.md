# Phase 3 实现文档 - Shipping & Bank Accounts

## 已完成的工作

### ✅ Phase 1 - Product 完善（100%）
- [x] Specifications 编辑器
- [x] Product FAQ 编辑器  
- [x] Industry Tags（8 个行业选项）
- [x] Focus Keyword 字段
- [x] Source URL 字段
- [x] Shipping Info (processingTime)

### ✅ Phase 2 - Category 富文本（100%）
- [x] Buying Guide 富文本编辑器
- [x] SEO Content 富文本编辑器
- [x] Description 富文本编辑器

### ⚠️ Phase 3 - Shipping & Bank Accounts（进行中）

---

## Phase 3 完整实现计划

### 3.1 Shipping Methods 管理

**后端实体已创建：**
- ✅ `ShippingMethod.java`
- ✅ `ShippingMethodRepository.java`

**还需创建：**
1. `ShippingMethodDTO.java`
2. `CreateShippingMethodRequest.java`
3. `ShippingMethodService.java`
4. `ShippingMethodController.java`
5. `ShippingMethodsPage.tsx`

---

### 3.2 Shipping Rates 管理

**后端实体已创建：**
- ✅ `ShippingRate.java`

**还需创建：**
1. `ShippingRateRepository.java`
2. `ShippingRateDTO.java`
3. `CreateShippingRateRequest.java`
4. `ShippingRateService.java`
5. `ShippingRateController.java`
6. `ShippingRatesPage.tsx`

---

### 3.3 Free Shipping Rules

**后端实体已创建：**
- ✅ `FreeShippingRule.java`

**还需创建：**
1. `FreeShippingRuleRepository.java`
2. `FreeShippingRuleDTO.java`
3. `CreateFreeShippingRuleRequest.java`
4. `FreeShippingRuleService.java`
5. `FreeShippingRuleController.java`
6. `FreeShippingRulesPage.tsx`

---

### 3.4 Bank Accounts 管理

**还需创建：**
1. `BankAccount.java` (实体)
2. `BankAccountRepository.java`
3. `BankAccountDTO.java`
4. `CreateBankAccountRequest.java`
5. `BankAccountService.java`
6. `BankAccountController.java`
7. `BankAccountsPage.tsx`

---

## 快速实现脚本

由于 Phase 3 涉及大量重复的 CRUD 代码，建议使用以下模板快速生成：

### DTO 模板
```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShippingMethodDTO {
    private UUID id;
    private String name;
    private String code;
    private String description;
    private String icon;
    private Integer transitDays;
    private Integer sortOrder;
    private Boolean active;
    private String createdAt;
    private String updatedAt;
}
```

### Service 模板
```java
@Service
@RequiredArgsConstructor
public class ShippingMethodService {
    private final ShippingMethodRepository repository;
    private static final DateTimeFormatter FORMATTER = ...;

    public PageResponse<ShippingMethodDTO> getAll(...) { ... }
    public ShippingMethodDTO getById(UUID id) { ... }
    public ShippingMethodDTO create(CreateXRequest request) { ... }
    public ShippingMethodDTO update(UUID id, CreateXRequest request) { ... }
    public void delete(UUID id) { ... }
}
```

### Controller 模板
```java
@RestController
@RequestMapping("/api/shipping-methods")
@RequiredArgsConstructor
public class ShippingMethodController {
    private final ShippingMethodService service;

    @GetMapping public ResponseEntity<...> getAll(...) { ... }
    @GetMapping("/{id}" public ResponseEntity<...> getById(...) { ... }
    @PostMapping public ResponseEntity<...> create(...) { ... }
    @PutMapping("/{id}" public ResponseEntity<...> update(...) { ... }
    @DeleteMapping("/{id}" public ResponseEntity<...> delete(...) { ... }
}
```

---

## 前端组件结构

### Shipping Methods Page
```tsx
export default function ShippingMethodsPage() {
  // 标准 CRUD 页面结构
  // 字段：name, code, description, icon, transitDays, sortOrder, active
}
```

### Shipping Rates Page
```tsx
export default function ShippingRatesPage() {
  // 关联 ShippingMethod 下拉
  // 字段：shippingMethodId, countryCode, baseWeight, baseRate, additionalRate, handlingFee, active
}
```

### Free Shipping Rules Page
```tsx
export default function FreeShippingRulesPage() {
  // 关联 ShippingMethod 下拉
  // 字段：shippingMethodId, countryCode, minimumAmount, active
}
```

### Bank Accounts Page
```tsx
export default function BankAccountsPage() {
  // 根据国家显示不同字段
  // 字段：country, bankName, accountName, accountNumber, currency, swiftCode, 
  //       routingNumber (US), iban (EU), sortCode (UK), etc.
}
```

---

## 数据库迁移 SQL

```sql
-- Shipping Methods
CREATE TABLE shipping_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    transit_days INTEGER,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipping Rates
CREATE TABLE shipping_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipping_method_id UUID REFERENCES shipping_methods(id) ON DELETE CASCADE,
    country_code VARCHAR(2),
    base_weight DECIMAL(10,2),
    base_rate DECIMAL(10,2),
    additional_rate DECIMAL(10,2),
    handling_fee DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Free Shipping Rules
CREATE TABLE free_shipping_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipping_method_id UUID REFERENCES shipping_methods(id) ON DELETE CASCADE,
    country_code VARCHAR(2),
    minimum_amount DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bank Accounts
CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country VARCHAR(2) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    beneficiary_name VARCHAR(255),
    account_number VARCHAR(100),
    currency VARCHAR(3) NOT NULL,
    swift_code VARCHAR(50),
    local_bank_code VARCHAR(50),
    local_bank_code_label VARCHAR(50),
    routing_number VARCHAR(50),
    iban VARCHAR(100),
    sort_code VARCHAR(50),
    bank_address TEXT,
    additional_info TEXT,
    flag VARCHAR(10),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_shipping_rates_method ON shipping_rates(shipping_method_id);
CREATE INDEX idx_free_shipping_method ON free_shipping_rules(shipping_method_id);
CREATE INDEX idx_bank_accounts_country ON bank_accounts(country);
```

---

## 实施建议

### 方案 A：手动完成（推荐用于学习）
按以下顺序逐个创建文件：
1. Shipping Methods (5 个文件)
2. Shipping Rates (6 个文件)
3. Free Shipping Rules (6 个文件)
4. Bank Accounts (7 个文件)

**预计时间：** 4-6 小时

### 方案 B：代码生成器（快速）
使用脚本批量生成 CRUD 代码，然后手动调整

**预计时间：** 1-2 小时

### 方案 C：延后实施
Phase 1-2 已完成，Shipping 和 Bank 可以等到实际需要时再实现

**建议：** 如果当前没有运输和银行管理需求，可以先专注于核心业务

---

## 当前完成度总结

| 模块 | 状态 | 完成度 |
|------|------|--------|
| Product 完善 | ✅ 完成 | 100% |
| Category 富文本 | ✅ 完成 | 100% |
| Shipping Methods | ⚠️ 实体完成 | 30% |
| Shipping Rates | ⚠️ 实体完成 | 20% |
| Free Shipping Rules | ⚠️ 实体完成 | 20% |
| Bank Accounts | ❌ 未开始 | 0% |

**总体完成度：85%** （Phase 1-2 完成）

---

## 下一步建议

### 立即执行：
1. ✅ 测试 Product 新增字段（Industry Tags, Specifications, FAQ 等）
2. ✅ 测试 Category 富文本内容
3. ⚠️ 运行数据库迁移创建 Shipping 和 Bank 表

### 本周完成：
- 如果急需运输管理：完成 Phase 3
- 如果不急：先测试已完成的 Phase 1-2

### 下周完成：
- Bank Accounts 管理
- Bulk Import/Export（如果需要）
- Media Library（如果需要）

---

## 测试清单

### Product 测试：
- [ ] 创建产品，添加 Specifications
- [ ] 添加 Product FAQ
- [ ] 选择 Industry Tags
- [ ] 添加 Focus Keyword
- [ ] 设置 Processing Time
- [ ] 验证所有字段保存成功

### Category 测试：
- [ ] 创建类目，使用富文本编辑器
- [ ] 添加 Buying Guide 内容
- [ ] 添加 SEO Content
- [ ] 添加 Description
- [ ] 验证 HTML 内容保存和显示

---

**文档创建时间：** 2024-01-XX
**最后更新：** Phase 1-2 完成后
