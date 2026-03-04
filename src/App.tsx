import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import CartDrawer from "@/components/CartDrawer";
import { lazy, Suspense } from "react";
import ScrollToTop from "@/components/ScrollToTop";
import AdminGuard from "@/components/AdminGuard";
const AuthCallback = lazy(() => import("./pages/AuthCallback"));

// Eagerly load the homepage for instant first paint
import Index from "./pages/Index";

// Lazy load all other routes - only downloaded when navigated to
const ProductPage = lazy(() => import("./pages/ProductPage"));
const ShopPage = lazy(() => import("./pages/ShopPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const PoliciesPage = lazy(() => import("./pages/PoliciesPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const ChatWidget = lazy(() => import("./components/ChatWidget"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min - avoid refetching unchanged data
      gcTime: 10 * 60 * 1000, // 10 min cache
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AuthProvider>
            <CartProvider>
              <Toaster />
              <Sonner />
              <CartDrawer />
              <Suspense fallback={null}>
                <ChatWidget />
              </Suspense>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/product/:id" element={<ProductPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/category/:slug" element={<CategoryPage />} />
                  <Route path="/policies" element={<PoliciesPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
                  <Route path="/admin/products" element={<AdminGuard><AdminProducts /></AdminGuard>} />
                  <Route path="/admin/categories" element={<AdminGuard><AdminCategories /></AdminGuard>} />
                  <Route path="/admin/orders" element={<AdminGuard><AdminOrders /></AdminGuard>} />
                  <Route path="/admin/customers" element={<AdminGuard><AdminCustomers /></AdminGuard>} />
                  <Route path="/admin/coupons" element={<AdminGuard><AdminCoupons /></AdminGuard>} />
                  <Route path="/admin/settings" element={<AdminGuard><AdminSettings /></AdminGuard>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
