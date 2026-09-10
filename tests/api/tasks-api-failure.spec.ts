import { test, expect } from '../../fixtures/testFixtures';

test('Tasks board handles a Tasks API failure gracefully @regression', async ({
  page,
  loginPage,
  tasksPage,
}) => {
  await loginPage.navigate();
  await loginPage.login(
    process.env.EMAIL!,
    process.env.PASSWORD!
  );

  await expect(tasksPage.myTasksHeading).toBeVisible();

  // simulate the Tasks API failing before the board reloads
  await page.route('**/api/tasks', (route) => {
    if (route.request().method() !== 'GET') {
      return route.continue();
    }
    return route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Internal Server Error' }),
    });
  });

  await page.reload();

  // app degrades gracefully: heading stays up and every column falls back to an empty state
  await expect(tasksPage.myTasksHeading).toBeVisible();
  await expect(page.getByText('No tasks')).toHaveCount(3);
});
