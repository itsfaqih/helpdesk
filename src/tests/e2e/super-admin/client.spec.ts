import { expect, test } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/super-admin.json' });

test('client management', async ({ page }) => {
  await page.goto('/clients');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Clients');

  // create client
  await page.getByRole('link', { name: 'Add Client', exact: true }).click();

  await page.waitForURL('/clients/create');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Create Client');

  await page.getByRole('textbox', { name: 'Full Name', exact: true }).fill('Test Client');
  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await expect(
    page.getByRole('status').filter({ hasText: 'Client created successfully' }).first(),
  ).toBeVisible();

  // redirect to edit client
  await page.waitForURL(/\/clients\/(?!create).*$/);

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Edit Client');
  await expect(page.getByRole('textbox', { name: 'Full Name', exact: true })).toHaveValue(
    'Test Client',
  );

  // update client
  await page.getByRole('textbox', { name: 'Full Name', exact: true }).fill('Test Client Updated');

  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await expect(
    page.getByRole('status').filter({ hasText: 'Client updated successfully' }).first(),
  ).toBeVisible();

  // check if client is in table
  await page.getByRole('link', { name: 'Back' }).click();

  await page.waitForURL('/clients');

  await page.getByRole('searchbox', { name: 'Search' }).fill('Test Client Updated');

  await expect(
    page.getByRole('cell').filter({ hasText: 'Test Client Updated' }).first(),
  ).toBeVisible();

  // archive client from table
  await page.getByRole('button', { name: `Archive Test Client Updated`, exact: true }).click();

  await page
    .getByRole('dialog', { name: 'Archive Test Client Updated', exact: true })
    .getByRole('button', { name: 'Archive', exact: true })
    .click();

  await expect(
    page.getByRole('dialog', { name: 'Archive Test Client Updated', exact: true }),
  ).toBeHidden();

  await expect(
    page.getByRole('status').filter({ hasText: 'Client archived successfully' }).first(),
  ).toBeVisible();

  await expect(
    page.getByRole('cell').filter({ hasText: 'Test Client Updated' }).first(),
  ).toBeHidden();

  // check if client is in archived table
  await page.getByRole('tab', { name: 'Archived', exact: true }).click();

  await page.waitForURL('/clients?is_archived=1');

  await page.getByRole('searchbox', { name: 'Search' }).fill('Test Client Updated');

  await expect(
    page.getByRole('cell').filter({ hasText: 'Test Client Updated' }).first(),
  ).toBeVisible();

  // restore client from table
  await page.getByRole('button', { name: 'Restore Test Client Updated', exact: true }).click();

  await page
    .getByRole('dialog', { name: 'Restore Test Client Updated', exact: true })
    .getByRole('button', { name: 'Restore', exact: true })
    .click();

  await expect(
    page.getByRole('dialog', { name: 'Restore Test Client Updated', exact: true }),
  ).toBeHidden();

  await expect(
    page.getByRole('status').filter({ hasText: 'Client restored successfully' }).first(),
  ).toBeVisible();

  await expect(
    page.getByRole('cell').filter({ hasText: 'Test Client Updated' }).first(),
  ).toBeHidden();

  // check if client is in available table
  await page.getByRole('tab', { name: 'Available', exact: true }).click();

  await page.waitForURL('/clients?is_archived=0');

  await expect(page.getByRole('cell').filter({ hasText: 'Test Client Updated' })).toBeVisible();

  // go to edit client
  await page.getByRole('link', { name: 'Edit Test Client Updated', exact: true }).click();

  await page.waitForURL(/\/clients\/(?!create).*$/);

  // archive client from edit page
  await expect(page.getByRole('button', { name: 'Restore', exact: true })).toBeHidden();

  await page.getByRole('button', { name: 'Archive', exact: true }).click();

  await page
    .getByRole('dialog', { name: 'Archive Test Client Updated', exact: true })
    .getByRole('button', { name: 'Archive', exact: true })
    .click();

  await expect(
    page.getByRole('dialog', { name: 'Archive Test Client Updated', exact: true }),
  ).toBeHidden();

  await expect(
    page.getByRole('status').filter({ hasText: 'Client archived successfully' }),
  ).toBeVisible();

  // restore client from edit page
  await expect(page.getByRole('button', { name: 'Archive', exact: true })).toBeHidden();

  await page.getByRole('button', { name: 'Restore', exact: true }).click();

  await page
    .getByRole('dialog', { name: 'Restore Test Client Updated', exact: true })
    .getByRole('button', { name: 'Restore', exact: true })
    .click();

  await expect(
    page.getByRole('dialog', { name: 'Restore Test Client Updated', exact: true }),
  ).toBeHidden();

  await expect(
    page.getByRole('status').filter({ hasText: 'Client restored successfully' }),
  ).toBeVisible();

  await expect(page.getByRole('button', { name: 'Archive', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Restore', exact: true })).toBeHidden();
});
