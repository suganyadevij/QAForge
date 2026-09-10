import { APIRequestContext, expect } from '@playwright/test';

export class TasksApi {
  constructor(
    private request: APIRequestContext,
    private accessToken: string
  ) {}

  private get headers() {
    return {
      Authorization: `Bearer ${this.accessToken}`,
    };
  }

  async createTask(title: string, priority: string = 'medium') {
    return await this.request.post('/api/tasks', {
      headers: this.headers,
      data: {
        title,
        priority,
      },
    });
  }

  async deleteTask(taskId: string) {
    return await this.request.delete(`/api/tasks/${taskId}`, {
      headers: this.headers,
    });
  }
}