import { test, expect } from '../../fixtures/apiFixtures';

test('User should create a task successfully through API', async ({ tasksApi  }) => {

  const taskTitle = `QAForge API Task ${Date.now()}`;

  const response = await tasksApi.createTask(taskTitle);

  expect(response.status()).toBe(201);

  const responseBody = await response.json();

  expect(responseBody.title).toBe(taskTitle);
  expect(responseBody.priority).toBe('medium');

  // Cleanup: remove the task created by this test
  await tasksApi.deleteTask(responseBody.id);
});

test('User should retrieve their task list successfully @regression', async ({ tasksApi }) => {
  const response = await tasksApi.getTasks();

  expect(response.status()).toBe(200);

  const responseBody = await response.json();

  expect(Array.isArray(responseBody));
});
test('User should update a task successfully @regression', async ({ tasksApi }) => {
  const taskTitle = `QAForge API Task ${Date.now()}`;

  const createResponse = await tasksApi.createTask(taskTitle);

  expect(createResponse.status()).toBe(201);

  const createdTask = await createResponse.json();

  const updatedTitle = `QAForge API Task Updated ${Date.now()}`;

  const updateResponse = await tasksApi.updateTask(createdTask.id, {
    title: updatedTitle,
    priority: 'high',
  });

  expect(updateResponse.status()).toBe(200);

  const updatedTask = await updateResponse.json();

  expect(updatedTask.title).toBe(updatedTitle);
  expect(updatedTask.priority).toBe('high');

  // Cleanup: remove the task created by this test
  await tasksApi.deleteTask(createdTask.id);
});

test('User should delete a task successfully @regression', async ({ tasksApi }) => {
  const taskTitle = `QAForge API Task ${Date.now()}`;

  const createResponse = await tasksApi.createTask(taskTitle);

  expect(createResponse.status()).toBe(201);

  const createdTask = await createResponse.json();

  const deleteResponse = await tasksApi.deleteTask(createdTask.id);

  expect(deleteResponse.status()).toBe(200);

  // Verify the task is no longer retrievable
  const getResponse = await tasksApi.getTask(createdTask.id);

  expect(getResponse.status()).toBe(404);
});