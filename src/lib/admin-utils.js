import { prisma } from '@/lib/prisma';

// Add activity log
export async function logActivity(type, description, metadata = {}) {
    try {
        const newActivity = await prisma.activity.create({
            data: {
                type,
                description,
                metadata
            }
        });
        return newActivity;
    } catch (error) {
        console.error('Error logging activity:', error);
        return null;
    }
}
