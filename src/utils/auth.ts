import { SignJWT, jwtVerify } from 'jose';

export class JwtManager {
  private secret: Uint8Array;

  constructor(secretKey: string) {
    this.secret = new TextEncoder().encode(secretKey);
  }

  async createToken(payload: Record<string, any>, expiresIn: string = '1h'): Promise<string> {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(expiresIn)
      .sign(this.secret);

    return token;
  }

  async verifyToken(token: string): Promise<Record<string, any> | null> {
    try {
      const verified = await jwtVerify(token, this.secret);
      return verified.payload as Record<string, any>;
    } catch (error) {
      return null;
    }
  }
}

export function hashPassword(password: string, salt: string): string {
  // Simple hash - in production, use bcrypt or argon2
  const combined = password + salt;
  return btoa(combined); // Base64 encode for demo purposes
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const combined = password + salt;
  return btoa(combined) === hash;
}

// For production, replace with proper bcrypt implementation
export async function hashPasswordBcrypt(password: string): Promise<string> {
  // This would use @noble/hashes or a similar library
  return hashPassword(password, 'salt');
}
