# Machrio Admin - Gap Analysis vs Frontend (machrio.com)

## Current Admin Capabilities vs Frontend Requirements

### Legend
- OK = Admin can manage this
- MISSING = Frontend uses it, Admin cannot manage it
- PARTIAL = Admin has some fields, missing others

---

### 1. Products

| Field / Feature | Frontend Uses | Admin Has | Status |
|---|---|---|---|
| name, slug, sku | Yes | Yes | OK |
| shortDescription | Yes | Yes | OK |
| fullDescription (Lexical richText) | Yes (renders HTML) | No | **MISSING** |
| primaryCategoryId | Yes (breadcrumbs, URL) | Yes | OK |
| brand | Yes (PDP shows brand) | No | **MISSING** |
| status (draft/published/discontinued) | Yes (filters published) | Yes | OK |
| pricing.basePrice | Yes | Yes | OK |
| pricing.compareAtPrice | Yes (strikethrough) | Yes | OK |
| pricing.costPrice | Internal | Yes | OK |
| pricing.tieredPricing[] | Yes (volume discount table) | No | **MISSING** |
| pricing.currency | Yes | No | **MISSING** |
| pricing.priceUnit | Yes ("/each", "/box") | No | **MISSING** |
| availability (in-stock/made-to-order/contact) | Yes (badges) | Yes | OK |
| purchaseMode (buy-online/rfq-only/both) | Yes (determines CTA buttons) | Yes | OK |
| minOrderQuantity | Yes (MOQ on PDP) | Yes | OK |
| packageQty, packageUnit | Yes (per-item price calc) | Yes | OK |
| leadTime | Yes (delivery estimate) | Yes | OK |
| weight | Shipping calc | Yes | OK |
| specifications[] (label/value/unit) | Yes (spec table on PDP) | No | **MISSING** |
| externalImageUrl | Yes (product image) | Yes | OK |
| additionalImageUrls | Yes | No | **MISSING** |
| images (Payload media) | Yes | No | **MISSING** |
| tags | Yes | Yes | OK |
| metaTitle, metaDescription | Yes (SEO) | Yes | OK |
| focusKeyword | Yes | Yes | OK |
| sourceUrl | Internal | Yes | OK |
| relatedProducts | Yes (PDP section) | No | **MISSING** |
| FAQ (auto-generated) | Yes (schema.org) | No | **MISSING** |

### 2. Categories

| Field / Feature | Frontend Uses | Admin Has | Status |
|---|---|---|---|
| name, slug | Yes | Yes | OK |
| description (richText) | Yes (SEO section) | Yes (plain text) | **PARTIAL** |
| shortDescription | Yes (listing) | Yes | OK |
| introContent | Yes (expandable intro) | Yes | OK |
| parent (hierarchy L1>L2>L3) | Yes (breadcrumbs, navigation) | Yes (parentId) | OK |
| displayOrder | Yes (sort) | Yes | OK |
| featured | Yes | Yes | OK |
| status | Yes | Yes | OK |
| buyingGuide (richText) | Yes (rendered on page) | No | **MISSING** |
| seoContent (richText) | Yes (rendered on page) | No | **MISSING** |
| FAQ[] (question/answer) | Yes (FAQ section + schema) | No | **MISSING** |
| facetGroups / customFilters | Yes (FilterBar component) | No | **MISSING** |
| heroImage | Yes | No | **MISSING** |
| icon / iconEmoji | Admin only | Yes | OK |
| metaTitle, metaDescription | Admin only | Yes | OK |
| productCount (cached) | Yes (home page) | No | **MISSING** |

### 3. Entirely Missing Modules

| Module | Frontend Uses | Admin Has | Priority |
|---|---|---|---|
| **Orders** | Full order flow (create, track, invoice) | No module | **HIGH** |
| **Customers** | Account, shipping addresses, billing | No module | **HIGH** |
| **Brands** | Product attribution, brand pages | No module | **MEDIUM** |
| **Industries** | Industry solution pages | No module | **MEDIUM** |
| **Articles / Knowledge Center** | Buying guides, how-to articles, SEO | No module | **MEDIUM** |
| **RFQ Submissions** | Quote request management | No module | **HIGH** |
| **Contact Submissions** | Customer inquiries | No module | **MEDIUM** |
| **Glossary Terms** | SEO glossary pages | No module | **LOW** |
| **Shipping Methods/Rates** | Shipping calculator | No module | **LOW** |
| **Media Library** | Image/file management | No module | **MEDIUM** |
| **Redirects** | SEO redirect management | No module | **LOW** |

---

## Recommended Development Plan (Priority Order)

### Phase 1: Critical Operations (Orders + Customers + RFQ)
1. Orders management (list, view, status update, invoice)
2. Customer management (list, view, edit)
3. RFQ/Contact submission inbox

### Phase 2: Product Data Completeness
4. Tiered pricing editor
5. Specifications editor (key/value/unit array)
6. Product FAQ editor
7. Related products selector
8. Brand management module

### Phase 3: Category Enhancement
9. Category FAQ editor
10. Buying guide / SEO content editors
11. Facet group configuration

### Phase 4: Content & SEO
12. Articles / Knowledge Center management
13. Industry pages management
14. Glossary management
