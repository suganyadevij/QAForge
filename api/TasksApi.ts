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

  async updateTask(taskId: string, updateData: Partial<{ title: string; description: string; priority: string; status: string; position: number }>) {
    return await this.request.put(`/api/tasks/${taskId}`, {
      headers: this.headers,
      data: updateData,
    });
  }

  async deleteTask(taskId: string) {
    return await this.request.delete(`/api/tasks/${taskId}`, {
      headers: this.headers,
    });
  }

  async getTasks() {
    return await this.request.get('/api/tasks', {
      headers: this.headers,
    });
  }

  async getTask(taskId: string) {
    return await this.request.get(`/api/tasks/${taskId}`, {
      headers: this.headers,
    });
  }
}