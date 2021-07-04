/// <reference types="node" />
export declare const PublicKey: string;
export declare const PublicKeyBuffer: Buffer;
export declare function cast<T>(value: unknown): T;
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PUBLIC_KEY: string;
        }
    }
}
//# sourceMappingURL=constants.d.ts.map