import { test, expect } from '@playwright/test';
import { AuthApi } from '../../api/AuthApi';
import { TasksApi } from '../../api/TasksApi';

test('User should create a task successfully through API', async ({ request }) => {
  const authApi = new AuthApi(request);
  const accessToken = await authApi.login();

  const tasksApi = new TasksApi(request, accessToken);

  const taskTitle = `QAForge API Task ${Date.now()}`;

  const response = await tasksApi.createTask(taskTitle);

  expect(response.status()).toBe(201);

  const responseBody = await response.json();

  expect(responseBody.title).toBe(taskTitle);
  expect(responseBody.priority).toBe('medium');

  // Cleanup: remove the task created by this test
  await tasksApi.deleteTask(responseBody.id);
});