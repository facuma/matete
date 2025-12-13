import { POST as WebhookPOST, GET as WebhookGET } from '../webhook/route';

/**
 * IPN Handler
 * Delegates completely to the robust Webhook handler which supports:
 * - Query Params (IPN style: ?topic=payment&id=...)
 * - JSON Body (Webhook style)
 * - Safe 200 OK responses
 */

export async function POST(request) {
    return WebhookPOST(request);
}

export async function GET(request) {
    return WebhookGET(request);
}
