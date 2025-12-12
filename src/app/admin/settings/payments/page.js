import { getServerSession } from 'next-auth';
import { authOptions } from '../../../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import MpConnectionPanel from './MpConnectionPanel';

export default async function PaymentSettingsPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/auth/signin');
    }

    // Single Tenant: Check Global Settings
    const settings = await prisma.siteSettings.findUnique({
        where: { id: 1 }
    });

    // Check if mpAccessToken is present
    const isConnected = !!settings?.mpAccessToken;

    let status = 'disconnected';
    let mpUserId = null;
    let mpExpiresAt = null;

    if (isConnected) {
        status = 'connected';
        if (settings.mpExpiresAt && settings.mpExpiresAt < new Date()) {
            status = 'expired';
        }
        mpUserId = settings.mpUserId ? settings.mpUserId.toString() : null;
        mpExpiresAt = settings.mpExpiresAt;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Configuración de Pagos</h1>
            <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
                <h2 className="text-xl font-semibold mb-4">Mercado Pago</h2>
                <MpConnectionPanel
                    initialStatus={status}
                    mpUserId={mpUserId}
                    mpExpiresAt={mpExpiresAt}
                />
            </div>
        </div>
    );
}
