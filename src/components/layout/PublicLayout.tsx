import { Outlet } from 'react-router-dom';
import { UserAuthProvider } from '@/contexts/UserAuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { PublicHeader } from './PublicHeader';
import { Footer } from './Footer';
import { CartDrawer } from '@/components/CartDrawer';

export function PublicLayout() {
    return (
        <UserAuthProvider>
            <CartProvider>
                <div className="min-h-screen flex flex-col bg-ink-50 text-ink-900 font-sans">
                    <PublicHeader />
                    <main className="flex-grow pt-20">
                        <Outlet />
                    </main>
                    <Footer />
                    <CartDrawer />
                </div>
            </CartProvider>
        </UserAuthProvider>
    );
}
