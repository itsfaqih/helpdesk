import { expect, test } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/super-admin.json' });

test('ticket tag management', async ({ page }) => {
  await page.goto('/ticket-tags');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ticket Tags');

  // create ticket tag
  await page.getByRole('link', { name: 'Add Ticket Tag', exact: true }).click();

  await page.waitForURL('/ticket-tags/create');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Create Ticket Tag');

  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Test Ticket Tag');
  await page.getByRole('textbox', { name: 'Description', exact: true }).fill('Test Description');
  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await expect(
    page.getByRole('status').filter({ hasText: 'Ticket tag created successfully' }).first(),
  ).toBeVisible();

  // redirect to edit ticket tag
  await page.waitForURL(/\/ticket-tags\/(?!create).*$/);

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Edit Ticket Tag');
  await expect(page.getByRole('textbox', { name: 'Name', exact: true })).toHaveValue(
    'Test Ticket Tag',
  );
  await expect(page.getByRole('textbox', { name: 'Name', exact: true })).toHaveAttribute(
    'readonly',
  );
  await expect(page.getByRole('textbox', { name: 'Description', exact: true })).toHaveValue(
    'Test Description',
  );

  // update ticket tag
  await page
    .getByRole('textbox', { name: 'Description', exact: true })
    .fill('Test Description Updated');

  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await expect(
    page.getByRole('status').filter({ hasText: 'Ticket tag updated successfully' }).first(),
  ).toBeVisible();

  // check if ticket tag is in table
  await page.getByRole('link', { name: 'Back' }).click();

  await page.waitForURL('/ticket-tags');

  await page.getByRole('searchbox', { name: 'Search' }).fill('Test Ticket Tag');

  await expect(page.getByRole('cell').filter({ hasText: 'Test Ticket Tag' }).first()).toBeVisible();

  // archive ticket tag from table
  await page.getByRole('button', { name: `Archive Test Ticket Tag`, exact: true }).click();

  await page
    .getByRole('dialog', { name: 'Archive Test Ticket Tag', exact: true })
    .getByRole('button', { name: 'Archive', exact: true })
    .click();

  await expect(
    page.getByRole('dialog', { name: 'Archive Test Ticket Tag', exact: true }),
  ).toBeHidden();

  await expect(
    page.getByRole('status').filter({ hasText: 'Ticket tag archived successfully' }).first(),
  ).toBeVisible();

  await expect(page.getByRole('cell').filter({ hasText: 'Test Ticket Tag' }).first()).toBeHidden();

  // check if ticket tag is in archived table
  await page.getByRole('tab', { name: 'Archived', exact: true }).click();

  await page.waitForURL('/ticket-tags?is_archived=1');

  await page.getByRole('searchbox', { name: 'Search' }).fill('Test Ticket Tag');

  await expect(page.getByRole('cell').filter({ hasText: 'Test Ticket Tag' }).first()).toBeVisible();

  // restore ticket tag from table
  await page.getByRole('button', { name: 'Restore Test Ticket Tag', exact: true }).click();

  await page
    .getByRole('dialog', { name: 'Restore Test Ticket Tag', exact: true })
    .getByRole('button', { name: 'Restore', exact: true })
    .click();

  await expect(
    page.getByRole('dialog', { name: 'Restore Test Ticket Tag', exact: true }),
  ).toBeHidden();

  await expect(
    page.getByRole('status').filter({ hasText: 'Ticket tag restored successfully' }).first(),
  ).toBeVisible();

  await expect(page.getByRole('cell').filter({ hasText: 'Test Ticket Tag' }).first()).toBeHidden();

  // check if ticket tag is in available table
  await page.getByRole('tab', { name: 'Available', exact: true }).click();

  await page.waitForURL('/ticket-tags?is_archived=0');

  await expect(page.getByRole('cell').filter({ hasText: 'Test Ticket Tag' })).toBeVisible();

  // go to edit ticket tag
  await page.getByRole('link', { name: 'Edit Test Ticket Tag', exact: true }).click();

  await page.waitForURL(/\/ticket-tags\/(?!create).*$/);

  // archive ticket tag from edit page
  await expect(page.getByRole('button', { name: 'Restore', exact: true })).toBeHidden();

  await page.getByRole('button', { name: 'Archive', exact: true }).click();

  await page
    .getByRole('dialog', { name: 'Archive Test Ticket Tag', exact: true })
    .getByRole('button', { name: 'Archive', exact: true })
    .click();

  await expect(
    page.getByRole('dialog', { name: 'Archive Test Ticket Tag', exact: true }),
  ).toBeHidden();

  await expect(
    page.getByRole('status').filter({ hasText: 'Ticket Tag archived successfully' }),
  ).toBeVisible();

  // restore ticket tag from edit page
  await expect(page.getByRole('button', { name: 'Archive', exact: true })).toBeHidden();

  await page.getByRole('button', { name: 'Restore', exact: true }).click();

  await page
    .getByRole('dialog', { name: 'Restore Test Ticket Tag', exact: true })
    .getByRole('button', { name: 'Restore', exact: true })
    .click();

  await expect(
    page.getByRole('dialog', { name: 'Restore Test Ticket Tag', exact: true }),
  ).toBeHidden();

  await expect(
    page.getByRole('status').filter({ hasText: 'Ticket Tag restored successfully' }),
  ).toBeVisible();

  await expect(page.getByRole('button', { name: 'Archive', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Restore', exact: true })).toBeHidden();
});
