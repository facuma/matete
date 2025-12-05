import { Suspense } from 'react';
import FacebookPixel from '@/components/FacebookPixel';
import WhatsAppButton from '@/components/WhatsAppButton';
import { CartProvider } from '@/contexts/cart-context';
import { SessionProvider } from '@/components/SessionProvider';
import { ConditionalLayout } from '@/components/ConditionalLayout';
import "@/styles/globals.css";
import { prisma } from '@/lib/prisma';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'MATETÉ - El ritual de cada día',
  description: 'Mates artesanales, bombillas premium y los mejores accesorios para que tu momento sea único.',
};

export default async function RootLayout({ children }) {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } }).catch(() => null);
  const pixelId = settings?.facebookPixelId;

  return (
    <html lang="es">
      <body className="font-sans bg-[#FAF9F6]">
        <Suspense fallback={null}>
          <FacebookPixel pixelId={pixelId} />
        </Suspense>
        <SessionProvider>
          <CartProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            <WhatsAppButton />
            <Toaster position="top-right" richColors />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}