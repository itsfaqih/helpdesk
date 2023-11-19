import { expect, test } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/super-admin.json' });

test('channel management', async ({ page }) => {
  await page.goto('/channels');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Channels');

  // create channel
  await page.getByRole('link', { name: 'Add Channel', exact: true }).click();

  await page.waitForURL('/channels/create');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Create Channel');

  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Test Channel');
  await page.getByRole('textbox', { name: 'Description', exact: true }).fill('Test Description');
  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await expect(
    page.getByRole('status').filter({ hasText: 'Channel created successfully' }).first(),
  ).toBeVisible();

  // redirect to view channel
  await page.waitForURL(/\/channels\/(?!.*\bcreate\b)[\w]+/);

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Edit Channel');
  await expect(page.getByRole('textbox', { name: 'Name', exact: true })).toHaveValue(
    'Test Channel',
  );
  await expect(page.getByRole('textbox', { name: 'Name', exact: true })).toHaveAttribute(
    'readonly',
  );
  await expect(page.getByRole('textbox', { name: 'Description', exact: true })).toHaveValue(
    'Test Description',
  );

  // update channel
  await page
    .getByRole('textbox', { name: 'Description', exact: true })
    .fill('Test Description Updated');

  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await expect(
    page.getByRole('status').filter({ hasText: 'Channel updated successfully' }).first(),
  ).toBeVisible();

  // check if channel is in table
  await page.getByRole('link', { name: 'Back' }).click();

  await page.waitForURL('/channels');

  await page.getByRole('searchbox', { name: 'Search' }).fill('Test Channel');

  await expect(page.getByRole('cell').filter({ hasText: 'Test Channel' }).first()).toBeVisible();

  // archive channel from table
  await page.getByRole('button', { name: `Archive Test Channel`, exact: true }).click();

  await page
    .getByRole('dialog', { name: 'Archive Test Channel', exact: true })
    .getByRole('button', { name: 'Archive', exact: true })
    .click();

  await expect(
    page.getByRole('dialog', { name: 'Archive Test Channel', exact: true }),
  ).toBeHidden();

  await expect(
    page.getByRole('status').filter({ hasText: 'Channel archived successfully' }).first(),
  ).toBeVisible();

  await expect(page.getByRole('cell').filter({ hasText: 'Test Channel' }).first()).toBeHidden();

  // check if channel is in archived table
  await page.getByRole('tab', { name: 'Archived', exact: true }).click();

  await page.waitForURL('/channels?is_archived=1');

  await page.getByRole('searchbox', { name: 'Search' }).fill('Test Channel');

  await expect(page.getByRole('cell').filter({ hasText: 'Test Channel' }).first()).toBeVisible();

  // restore channel from table
  await page.getByRole('button', { name: 'Restore Test Channel', exact: true }).click();

  await page
    .getByRole('dialog', { name: 'Restore Test Channel', exact: true })
    .getByRole('button', { name: 'Restore', exact: true })
    .click();

  await expect(
    page.getByRole('dialog', { name: 'Restore Test Channel', exact: true }),
  ).toBeHidden();

  await expect(
    page.getByRole('status').filter({ hasText: 'Channel restored successfully' }).first(),
  ).toBeVisible();

  await expect(page.getByRole('cell').filter({ hasText: 'Test Channel' }).first()).toBeHidden();

  // check if channel is in available table
  await page.getByRole('tab', { name: 'Available', exact: true }).click();

  await page.waitForURL('/channels?is_archived=0');

  await expect(page.getByRole('cell').filter({ hasText: 'Test Channel' })).toBeVisible();

  // go to edit channel
  await page.getByRole('link', { name: 'Edit Test Channel', exact: true }).click();

  await page.waitForURL(/\/channels\/(?!.*\bcreate\b)[\w]+/);

  // archive channel from edit page
  await expect(page.getByRole('button', { name: 'Restore', exact: true })).toBeHidden();

  await page.getByRole('button', { name: 'Archive', exact: true }).click();

  await page
    .getByRole('dialog', { name: 'Archive Test Channel', exact: true })
    .getByRole('button', { name: 'Archive', exact: true })
    .click();

  await expect(
    page.getByRole('dialog', { name: 'Archive Test Channel', exact: true }),
  ).toBeHidden();

  await expect(
    page.getByRole('status').filter({ hasText: 'Channel archived successfully' }),
  ).toBeVisible();

  // restore channel from edit page
  await expect(page.getByRole('button', { name: 'Archive', exact: true })).toBeHidden();

  await page.getByRole('button', { name: 'Restore', exact: true }).click();

  await page
    .getByRole('dialog', { name: 'Restore Test Channel', exact: true })
    .getByRole('button', { name: 'Restore', exact: true })
    .click();

  await expect(
    page.getByRole('dialog', { name: 'Restore Test Channel', exact: true }),
  ).toBeHidden();

  await expect(
    page.getByRole('status').filter({ hasText: 'Channel restored successfully' }),
  ).toBeVisible();

  await expect(page.getByRole('button', { name: 'Archive', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Restore', exact: true })).toBeHidden();
});
