import { Env, SessionData } from '../types';

const SESSION_PREFIX = 'session:';

export class SessionManager {
  private kv: KVNamespace;
  private sessionTimeout: number;

  constructor(kv: KVNamespace, timeoutSeconds: number = 3600) {
    this.kv = kv;
    this.sessionTimeout = timeoutSeconds;
  }

  private getSessionKey(sessionId: string): string {
    return `${SESSION_PREFIX}${sessionId}`;
  }

  async createSession(data: Partial<SessionData>): Promise<string> {
    const sessionId = this.generateSessionId();
    const now = Date.now();
    
    const sessionData: SessionData = {
      ...data,
      created_at: now,
      expires_at: now + this.sessionTimeout * 1000,
    };

    await this.kv.put(
      this.getSessionKey(sessionId),
      JSON.stringify(sessionData),
      {
        expirationTtl: this.sessionTimeout,
      }
    );

    return sessionId;
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    const data = await this.kv.get(this.getSessionKey(sessionId), 'json');
    
    if (!data) return null;

    const session = data as SessionData;
    
    if (session.expires_at < Date.now()) {
      await this.deleteSession(sessionId);
      return null;
    }

    return session;
  }

  async updateSession(
    sessionId: string,
    updates: Partial<SessionData>
  ): Promise<boolean> {
    const session = await this.getSession(sessionId);
    
    if (!session) return false;

    const updated: SessionData = {
      ...session,
      ...updates,
      expires_at: Date.now() + this.sessionTimeout * 1000,
    };

    await this.kv.put(
      this.getSessionKey(sessionId),
      JSON.stringify(updated),
      {
        expirationTtl: this.sessionTimeout,
      }
    );

    return true;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.kv.delete(this.getSessionKey(sessionId));
  }

  async addToCart(sessionId: string, itemId: string, quantity: number): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) return false;
    if (!session.cart) session.cart = {};
    session.cart[itemId] = (session.cart[itemId] || 0) + quantity;
    return this.updateSession(sessionId, { cart: session.cart });
  }

  async removeFromCart(sessionId: string, itemId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session || !session.cart) return false;
    delete session.cart[itemId];
    return this.updateSession(sessionId, { cart: session.cart });
  }

  async clearCart(sessionId: string): Promise<boolean> {
    return this.updateSession(sessionId, { cart: {} });
  }

  private generateSessionId(): string {
    return crypto.randomUUID();
  }
}

export function getSessionIdFromCookie(cookieHeader: string): string | null {
  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'session_id') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

export function setSessionCookie(sessionId: string, maxAge: number = 3600): string {
  return `session_id=${encodeURIComponent(sessionId)}; Max-Age=${maxAge}; Path=/; HttpOnly; SameSite=Lax`;
}
