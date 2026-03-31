import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryFormPage from './pages/CategoryFormPage';
import ProductsPage from './pages/ProductsPage';
import ProductFormWizard from './pages/ProductFormWizard';
import BulkUploadProducts from './pages/BulkUploadProducts';
import OrdersPage from './pages/OrdersPage';
import CustomersPage from './pages/CustomersPage';
import BrandsPage from './pages/BrandsPage';
import RfqInboxPage from './pages/RfqInboxPage';
import ContactInboxPage from './pages/ContactInboxPage';
import SmsInboxPage from './pages/SmsInboxPage';
import BankAccountsPage from './pages/BankAccountsPage';
import ShippingMethodsPage from './pages/ShippingMethodsPage';
import ShippingRatesPage from './pages/ShippingRatesPage';
import FreeShippingRulesPage from './pages/FreeShippingRulesPage';
import AIConversationsPage from './pages/AIConversationsPage';
import CustomerRequirementsPage from './pages/CustomerRequirementsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          {/* Catalog */}
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/categories/new" element={<CategoryFormPage />} />
          <Route path="/categories/:id/edit" element={<CategoryFormPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/new" element={<ProductFormWizard />} />
          <Route path="/products/:id/edit" element={<ProductFormWizard />} />
          <Route path="/products/bulk-upload" element={<BulkUploadProducts />} />
          <Route path="/brands" element={<BrandsPage />} />
          {/* Sales */}
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          {/* Inbox */}
          <Route path="/rfq-inbox" element={<RfqInboxPage />} />
          <Route path="/contact-inbox" element={<ContactInboxPage />} />
          <Route path="/sms-inbox" element={<SmsInboxPage />} />
          {/* Settings */}
          <Route path="/bank-accounts" element={<BankAccountsPage />} />
          <Route path="/shipping-methods" element={<ShippingMethodsPage />} />
          <Route path="/shipping-rates" element={<ShippingRatesPage />} />
          <Route path="/free-shipping-rules" element={<FreeShippingRulesPage />} />
          {/* AI & Analytics */}
          <Route path="/ai-conversations" element={<AIConversationsPage />} />
          <Route path="/customer-requirements" element={<CustomerRequirementsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}