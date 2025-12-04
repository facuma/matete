import { z } from "zod";

export const discountCodeSchema = z.object({
    code: z.string().min(3, "El código debe tener al menos 3 caracteres").toUpperCase(),
    percentage: z.coerce.number().min(1).max(100),
    usageLimit: z.coerce.number().min(1),
    expiresAt: z.string().optional().nullable(),
});
