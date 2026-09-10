import { APIRequestContext, expect } from '@playwright/test';

export class AuthApi {
  constructor(private request: APIRequestContext) {}

  async login() {
    const response = await this.request.post('/api/auth/login', {
      data: {
        email: process.env.EMAIL!,
        password: process.env.PASSWORD!,
      },
    });

    expect(response.status()).toBe(200);

    const responseBody = await response.json();

    return responseBody.access_token;
  }
}