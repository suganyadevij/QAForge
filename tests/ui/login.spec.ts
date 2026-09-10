import { test, expect } from '../../fixtures/testFixtures';

test.use({ storageState: undefined });

test('User should login successfully @smoke', async ({ loginPage, tasksPage }) => {

  await loginPage.navigate();
  await loginPage.login(
    process.env.EMAIL!,
    process.env.PASSWORD!
  );

  await expect(
    tasksPage.myTasksHeading
  ).toBeVisible();
});