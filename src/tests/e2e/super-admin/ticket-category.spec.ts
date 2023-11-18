import { expect, test } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/super-admin.json' });

test('ticket tag management', async ({ page }) => {
  await page.goto('/ticket-tags');

  // create ticket tag
  await page.getByTestId('link-create-ticket-tag').click();

  await page.waitForURL('/ticket-tags/create');

  await expect(page.getByTestId('heading-page-title')).toHaveText('Create Ticket tag');

  await page.getByTestId('textbox-name').fill('Test Ticket tag');
  await page.getByTestId('textbox-description').fill('Test Ticket tag Description');
  await page.getByTestId('btn-create-ticket-tag').click();

  // redirect to edit ticket tag
  await page.waitForURL(/\/ticket-tags\/(?!.*\bcreate\b)[\w]+/);

  await expect(page.getByTestId('heading-page-title')).toHaveText('Edit Ticket tag');
  await expect(page.getByTestId('textbox-name')).toHaveValue('Test Ticket tag');
  await expect(page.getByTestId('textbox-description')).toHaveValue('Test Ticket tag Description');

  // check if the ticket-tag is in table
  await page.getByTestId('link-back').click();

  await page.waitForURL('/ticket-tags');

  await expect(page.getByTestId('table-ticket-tags')).toContainText('Test Ticket tag');

  // search non-existent ticket-tag
  await page.getByTestId('textbox-search').fill('Non-existent Ticket tag');

  await page.waitForURL('/ticket-tags?search=Non-existent+Ticket+tag');

  await expect(page.getByTestId('table-ticket-tags-empty')).toBeVisible();

  // reset search
  await page.getByTestId('btn-reset').click();

  await page.waitForURL('/ticket-tags');

  // update the ticket tag
  await page.getByTestId('link-edit-ticket-tag-0').click();

  await page.waitForURL(/\/ticket-tags\/(?!.*\bcreate\b)[\w]+/);

  await page.getByTestId('textbox-description').fill('Test Ticket tag Description Updated');
  await page.getByTestId('btn-update-ticket-tag').click();

  // check if the ticket tag description is updated
  await page.reload();

  await expect(page.getByTestId('textbox-description')).toHaveValue(
    'Test Ticket tag Description Updated',
  );

  // archive ticket-tag from table
  await page.getByTestId('link-back').click();

  await page.getByTestId('btn-archive-ticket-tag-0').click();

  await page.getByTestId('btn-confirm-archive-ticket-tag').click();

  await expect(page.getByTestId('table-ticket-tags')).not.toContainText('Test Ticket tag');

  // check if ticket-tag is in archived table
  await page.getByTestId('tab-is_archived-archived').click();

  await page.waitForURL('/ticket-tags?is_archived=1');

  await expect(page.getByTestId('table-ticket-tags')).toContainText('Test Ticket tag');

  // restore ticket-tag from table
  await page.getByTestId('btn-restore-ticket-tag-0').click();

  await page.getByTestId('btn-confirm-restore-ticket-tag').click();

  await expect(page.getByTestId('table-ticket-tags')).not.toContainText('Test Ticket tag');

  // check if ticket-tag is in table
  await page.getByTestId('tab-is_archived-available').click();

  await page.waitForURL('/ticket-tags?is_archived=0');

  await expect(page.getByTestId('table-ticket-tags')).toContainText('Test Ticket tag');
});
