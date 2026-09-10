import { test as base } from '@playwright/test';
import { AuthApi } from '../api/AuthApi';
import { TasksApi } from '../api/TasksApi';

type ApiFixtures = {
  tasksApi: TasksApi;
};

export const test = base.extend<ApiFixtures>({
  tasksApi: async ({ request }, use) => {
    const authApi = new AuthApi(request);
    const accessToken = await authApi.login();

    const tasksApi = new TasksApi(request, accessToken);

    await use(tasksApi);
  },
});

export { expect } from '@playwright/test';