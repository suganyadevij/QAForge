import { Page, Locator } from '@playwright/test';

export class TasksPage {
  readonly page: Page;
  readonly myTasksHeading: Locator;
  readonly newTaskButton: Locator;
  readonly taskTitleInput: Locator;
  readonly taskDescriptionInput: Locator;
  readonly taskSubmitButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.myTasksHeading = page.getByRole('heading', { name: 'My Tasks' });
    this.newTaskButton = page.getByTestId('new-task-button');
    this.taskTitleInput = page.getByTestId('task-title-input');
    this.taskDescriptionInput = page.getByTestId('task-description-input');
    this.taskSubmitButton = page.getByTestId('task-submit-button');
  }

  async isDisplayed() {
    return await this.myTasksHeading.isVisible();
  }

  async createTask(title: string, description?: string) {
    await this.newTaskButton.click();
    await this.taskTitleInput.fill(title);

    if (description) {
      await this.taskDescriptionInput.fill(description);
    }

    await this.taskSubmitButton.click();
  }

  getTask(title: string) {
  return this.page.getByText(title);
  }

  getTaskInDoneColumn(title: string) {
    return this.page.getByTestId('column-done').getByText(title);
  }

  private async getTaskId(title: string) {
    const taskHeading = this.page.getByRole('heading', { name: title, exact: true });
    return (await taskHeading.getAttribute('data-testid'))!.replace('task-title-', '');
  }

  async deleteTask(title: string) {
    const taskId = await this.getTaskId(title);

    // app confirms deletion via a native confirm() dialog
    this.page.once('dialog', (dialog) => dialog.accept());

    await this.page.getByTestId(`task-menu-${taskId}`).click();
    const deleteMenuItem = this.page.getByTestId(`task-delete-${taskId}`);
    await deleteMenuItem.waitFor({ state: 'visible' });
    await deleteMenuItem.click();
  }

  async completeTask(title: string) {
    const taskId = await this.getTaskId(title);
    const taskDragHandle = this.page.getByTestId(`task-drag-handle-${taskId}`);
    const doneColumn = this.page.getByTestId('column-done');

    // the task card may be far down a long backlog list, out of the current viewport
    await taskDragHandle.scrollIntoViewIfNeeded();

    const handleBox = await taskDragHandle.boundingBox();
    const doneBox = await doneColumn.boundingBox();
    if (!handleBox || !doneBox) {
      throw new Error('Could not locate drag handle or done column');
    }

    const viewportHeight = this.page.viewportSize()?.height ?? 720;
    const startX = handleBox.x + handleBox.width / 2;
    const startY = handleBox.y + handleBox.height / 2;
    const endX = doneBox.x + doneBox.width / 2;
    // clamp to the visible viewport, since the done column can be much taller than the screen
    const endY = Math.min(Math.max(doneBox.y + 100, 50), viewportHeight - 50);

    // dnd-kit uses pointer sensors with an activation distance, so it needs
    // an initial small move plus pauses rather than a single dragTo() jump
    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(startX + 5, startY + 5, { steps: 5 });
    await this.page.waitForTimeout(150);
    await this.page.mouse.move((startX + endX) / 2, (startY + endY) / 2, { steps: 15 });
    await this.page.waitForTimeout(150);
    await this.page.mouse.move(endX, endY, { steps: 15 });
    await this.page.waitForTimeout(150);
    await this.page.mouse.up();
    await this.page.waitForTimeout(500);
  }
}