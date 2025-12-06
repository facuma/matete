import { Expo } from 'expo-server-sdk';
import { prisma } from '@/lib/prisma';

let expo = new Expo();

export async function sendPushNotification(title, body, data = {}, userId = null) {
    try {
        // Find tokens. If userId is provided, filter by it. Otherwise, get all (or admin tokens ideally)
        // For this use case (New Order), we want to notify ADMINS.
        // Assuming we notify all registered devices for now, or filter by role if possible.
        // Let's fetch all tokens for now as this is an Admin App specific feature.

        const tokens = await prisma.deviceToken.findMany({
            where: userId ? { userId } : {}
        });

        if (tokens.length === 0) {
            console.log('No devices to notify');
            return;
        }

        let messages = [];
        for (let device of tokens) {
            if (!Expo.isExpoPushToken(device.token)) {
                console.error(`Push token ${device.token} is not a valid Expo push token`);
                continue;
            }

            messages.push({
                to: device.token,
                sound: 'default',
                title: title,
                body: body,
                data: data,
            });
        }

        let chunks = expo.chunkPushNotifications(messages);

        for (let chunk of chunks) {
            try {
                let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                console.log('Notification sent:', ticketChunk);
            } catch (error) {
                console.error('Error sending chunk:', error);
            }
        }
    } catch (error) {
        console.error('Error in sendPushNotification:', error);
    }
}
