import { bufferToString, urlSafe, Crypto } from '@openid/appauth';

export class NodeCrypto implements Crypto {
  generateRandom(size: number): string {
    const bytes = window.crypto.getRandomValues(new Uint32Array(size));
    return bufferToString(new Uint8Array(bytes.buffer));
  }

  async deriveChallenge(code: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(code);
    const hash = await window.crypto.subtle.digest('SHA-256', data);
    return urlSafe(new Uint8Array(hash))
  }
}