import { test, expect } from '../../fixtures/testFixtures';

test('User should complete a task successfully @regression', async ({
  loginPage,
  tasksPage,
}) => {
  await loginPage.navigate();

  await loginPage.login(
    process.env.EMAIL!,
    process.env.PASSWORD!
  );

  const taskTitle = `QAForge Completion Test ${Date.now()}`;
  await tasksPage.createTask(taskTitle);

  await tasksPage.completeTask(taskTitle);

  await expect(
    tasksPage.getTaskInDoneColumn(taskTitle)
  ).toBeVisible();

  // keep the shared task board from filling up across test runs
  await tasksPage.deleteTask(taskTitle);
});