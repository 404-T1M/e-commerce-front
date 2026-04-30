import { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/Toast';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { LocaleProvider } from '@/contexts/LocaleContext';

// ─── Admin Pages ──────────────────────────────────────────────────────────────
const AdminLoginPage = lazy(() =>
  import('@/features/auth/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })),
);
const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const UsersPage = lazy(() =>
  import('@/features/users/UsersPage').then((m) => ({ default: m.UsersPage })),
);
const AdminProfilePage = lazy(() =>
  import('@/features/dashboard/AdminProfilePage').then((m) => ({ default: m.AdminProfilePage })),
);
const UserDetailsPage = lazy(() =>
  import('@/features/users/UserDetailsPage').then((m) => ({ default: m.UserDetailsPage })),
);
const AdminsPage = lazy(() =>
  import('@/features/admins/AdminsPage').then((m) => ({ default: m.AdminsPage })),
);
const AdminGroupsPage = lazy(() =>
  import('@/features/admin-groups/AdminGroupsPage').then((m) => ({ default: m.AdminGroupsPage })),
);
const CategoriesPage = lazy(() =>
  import('@/features/categories/CategoriesPage').then((m) => ({ default: m.CategoriesPage })),
);
const ProductsPage = lazy(() =>
  import('@/features/products/ProductsPage').then((m) => ({ default: m.ProductsPage })),
);
const ProductDetailsPage = lazy(() =>
  import('@/features/products/ProductDetailsPage').then((m) => ({ default: m.ProductDetailsPage })),
);
const AttributesPage = lazy(() =>
  import('@/features/attributes/AttributesPage').then((m) => ({ default: m.AttributesPage })),
);
const CreateProductPage = lazy(() =>
  import('@/features/products/CreateProductPage').then((m) => ({ default: m.CreateProductPage })),
);
const EditProductPage = lazy(() =>
  import('@/features/products/EditProductPage').then((m) => ({ default: m.EditProductPage })),
);
const OrdersPage = lazy(() =>
  import('@/features/orders/OrdersPage').then((m) => ({ default: m.OrdersPage })),
);
const ShippingMethodsPage = lazy(() =>
  import('@/features/shipping/ShippingMethodsPage').then((m) => ({ default: m.ShippingMethodsPage })),
);
const PaymentMethodsPage = lazy(() =>
  import('@/features/payment/PaymentMethodsPage').then((m) => ({ default: m.PaymentMethodsPage })),
);
const CouponsPage = lazy(() =>
  import('@/features/coupons/CouponsPage').then((m) => ({ default: m.CouponsPage })),
);
const ReviewsPage = lazy(() =>
  import('@/features/reviews/ReviewsPage').then((m) => ({ default: m.ReviewsPage })),
);
const BannersPage = lazy(() =>
  import('@/features/banners/BannersPage').then((m) => ({ default: m.BannersPage })),
);
const SectionsPage = lazy(() =>
  import('@/features/sections/SectionsPage').then((m) => ({ default: m.SectionsPage })),
);
const AdminWalletPage = lazy(() =>
  import('@/features/wallet/AdminWalletPage').then((m) => ({ default: m.AdminWalletPage })),
);
const AdminAddressesPage = lazy(() =>
  import('@/features/addresses/AdminAddressesPage').then((m) => ({ default: m.AdminAddressesPage })),
);
const ProfitReportsPage = lazy(() =>
  import('@/features/analytics/ProfitReportsPage').then((m) => ({ default: m.ProfitReportsPage })),
);
const UserReportsPage = lazy(() =>
  import('@/features/analytics/UserReportsPage').then((m) => ({ default: m.UserReportsPage })),
);
const ProductReportsPage = lazy(() =>
  import('@/features/analytics/ProductReportsPage').then((m) => ({ default: m.ProductReportsPage })),
);
const CouponReportsPage = lazy(() =>
  import('@/features/analytics/CouponReportsPage').then((m) => ({ default: m.CouponReportsPage })),
);

// ─── Public Pages ─────────────────────────────────────────────────────────────
const PublicProductsPage = lazy(() =>
  import('@/features/public/products/PublicProductsPage').then((m) => ({ default: m.PublicProductsPage })),
);
const PublicProductDetailsPage = lazy(() =>
  import('@/features/public/products/PublicProductDetailsPage').then((m) => ({ default: m.PublicProductDetailsPage })),
);
const HomePage = lazy(() =>
  import('@/features/home/HomePage').then((m) => ({ default: m.HomePage })),
);
const LoginPage = lazy(() =>
  import('@/features/user-auth/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import('@/features/user-auth/RegisterPage').then((m) => ({ default: m.RegisterPage })),
);
const VerifyEmailPage = lazy(() =>
  import('@/features/user-auth/VerifyEmailPage').then((m) => ({ default: m.VerifyEmailPage })),
);
const VerifyEmailCodePage = lazy(() =>
  import('@/features/user-auth/VerifyEmailCodePage').then((m) => ({ default: m.VerifyEmailCodePage })),
);
const ResetPasswordPage = lazy(() =>
  import('@/features/user-auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
);
const CartPage = lazy(() =>
  import('@/features/cart/CartPage').then((m) => ({ default: m.CartPage })),
);
const CheckoutPage = lazy(() =>
  import('@/features/checkout/CheckoutPage').then((m) => ({ default: m.CheckoutPage })),
);
const MyOrdersPage = lazy(() =>
  import('@/features/account/MyOrdersPage').then((m) => ({ default: m.MyOrdersPage })),
);
const MyOrderDetailsPage = lazy(() =>
  import('@/features/account/MyOrderDetailsPage').then((m) => ({ default: m.MyOrderDetailsPage })),
);
const MyWalletPage = lazy(() =>
  import('@/features/account/MyWalletPage').then((m) => ({ default: m.MyWalletPage })),
);
const MyAddressesPage = lazy(() =>
  import('@/features/account/MyAddressesPage').then((m) => ({ default: m.MyAddressesPage })),
);
const MyProfilePage = lazy(() =>
  import('@/features/account/MyProfilePage').then((m) => ({ default: m.MyProfilePage })),
);

// ─── Query Client ─────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// ─── Loading Fallback ─────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-[300px]">
      <div className="w-8 h-8 rounded-full border-[3px] border-brand-200 border-t-brand-600 animate-spin" />
    </div>
  );
}

// ─── Protected Admin Layout ───────────────────────────────────────────────────
function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  // Admin routes
  {
    path: '/admin/login',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AdminLoginPage />
      </Suspense>
    ),
  },
  {
    path: '/admin',
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'users/:id', element: <UserDetailsPage /> },
      { path: 'admins', element: <AdminsPage /> },
      { path: 'admin-groups', element: <AdminGroupsPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'attributes', element: <AttributesPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/create', element: <CreateProductPage /> },
      { path: 'products/:id/edit', element: <EditProductPage /> },
      { path: 'products/:id', element: <ProductDetailsPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'shipping-methods', element: <ShippingMethodsPage /> },
      { path: 'payment-methods', element: <PaymentMethodsPage /> },
      { path: 'coupons', element: <CouponsPage /> },
      { path: 'reviews', element: <ReviewsPage /> },
      { path: 'banners', element: <BannersPage /> },
      { path: 'sections', element: <SectionsPage /> },
      { path: 'wallet', element: <AdminWalletPage /> },
      { path: 'addresses', element: <AdminAddressesPage /> },
      { path: 'analytics', element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'analytics/profit-reports', element: <ProfitReportsPage /> },
      { path: 'analytics/user-reports', element: <UserReportsPage /> },
      { path: 'analytics/product-reports', element: <ProductReportsPage /> },
      { path: 'analytics/coupon-reports', element: <CouponReportsPage /> },
      { path: 'profile', element: <Suspense fallback={<PageLoader />}><AdminProfilePage /></Suspense> },
    ],
  },
  // Public routes (wrapped by PublicLayout which provides UserAuthProvider + CartProvider)
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Suspense fallback={<PageLoader />}><HomePage /></Suspense> },
      { path: 'login', element: <Suspense fallback={<PageLoader />}><LoginPage /></Suspense> },
      { path: 'register', element: <Suspense fallback={<PageLoader />}><RegisterPage /></Suspense> },
      { path: 'reset-password/:token', element: <Suspense fallback={<PageLoader />}><ResetPasswordPage /></Suspense> },
      { path: 'verify-email', element: <Suspense fallback={<PageLoader />}><VerifyEmailPage /></Suspense> },
      { path: 'verify-email/code', element: <Suspense fallback={<PageLoader />}><VerifyEmailCodePage /></Suspense> },
      { path: 'products', element: <Suspense fallback={<PageLoader />}><PublicProductsPage /></Suspense> },
      { path: 'products/:id', element: <Suspense fallback={<PageLoader />}><PublicProductDetailsPage /></Suspense> },
      { path: 'cart', element: <Suspense fallback={<PageLoader />}><CartPage /></Suspense> },
      { path: 'checkout', element: <Suspense fallback={<PageLoader />}><CheckoutPage /></Suspense> },
      { path: 'account/orders', element: <Suspense fallback={<PageLoader />}><MyOrdersPage /></Suspense> },
      { path: 'account/orders/:id', element: <Suspense fallback={<PageLoader />}><MyOrderDetailsPage /></Suspense> },
      { path: 'account/wallet', element: <Suspense fallback={<PageLoader />}><MyWalletPage /></Suspense> },
      { path: 'account/addresses', element: <Suspense fallback={<PageLoader />}><MyAddressesPage /></Suspense> },
      { path: 'account/profile', element: <Suspense fallback={<PageLoader />}><MyProfilePage /></Suspense> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <AuthProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </AuthProvider>
      </LocaleProvider>
    </QueryClientProvider>
  );
}
