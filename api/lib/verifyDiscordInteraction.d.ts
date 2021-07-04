import type { VercelRequest } from '@vercel/node';
import { HttpCodes } from './HttpCodes';
export declare function verifyDiscordInteraction(req: VercelRequest): VerifyDiscordInteractionResponse | null;
export interface VerifyDiscordInteractionResponse {
    statusCode: HttpCodes;
    message: string;
    statusText?: string;
}
declare module 'http' {
    interface IncomingHttpHeaders {
        'x-signature-ed25519'?: string;
        'x-signature-timestamp'?: string;
    }
}
//# sourceMappingURL=verifyDiscordInteraction.d.ts.map