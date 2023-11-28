import { expect, test } from '@playwright/test';

test.use({ storageState: 'playwright/.auth/super-admin.json' });

test('user management', async ({ page }) => {
  await page.goto('/users');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Users');

  // create user
  await page.getByRole('link', { name: 'Add User', exact: true }).click();

  await page.waitForURL('/users/create');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Create User');

  await page.getByRole('textbox', { name: 'Full Name', exact: true }).fill('Test User');
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill('test@example.com');
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('password');
  await page.getByRole('button', { name: 'Role', exact: true }).click();
  await page
    .getByRole('listbox', { name: 'Role', exact: true })
    .getByRole('option', { name: 'Operator', exact: true })
    .click();

  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await expect(
    page.getByRole('status').filter({ hasText: 'User created successfully' }).first(),
  ).toBeVisible();

  // redirect to view user
  await page.waitForURL(/\/users\/(?!.*\bcreate\b)[\w]+/);

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Edit User');
  await expect(page.getByRole('textbox', { name: 'Name', exact: true })).toHaveValue('Test User');
  await expect(page.getByRole('textbox', { name: 'Email', exact: true })).toHaveValue(
    'test@example.com',
  );

  // update user
  await page.getByRole('textbox', { name: 'Name', exact: true }).fill('Test User Updated');

  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await expect(
    page.getByRole('status').filter({ hasText: 'User updated successfully' }).first(),
  ).toBeVisible();

  // check if user is in table
  await page.getByRole('link', { name: 'Back' }).click();

  await page.waitForURL('/users');

  await page.getByRole('searchbox', { name: 'Search' }).fill('Test User Updated');

  await expect(
    page.getByRole('cell').filter({ hasText: 'Test User Updated' }).first(),
  ).toBeVisible();

  // archive user from table
  await page.getByRole('button', { name: `Archive test@example.com`, exact: true }).click();

  await page
    .getByRole('dialog', { name: 'Archive test@example.com', exact: true })
    .getByRole('button', { name: 'Archive', exact: true })
    .click();

  await expect(
    page.getByRole('dialog', { name: 'Archive Test User Updated', exact: true }),
  ).toBeHidden();

  await expect(
    page.getByRole('status').filter({ hasText: 'User archived successfully' }).first(),
  ).toBeVisible();

  await expect(
    page.getByRole('cell').filter({ hasText: 'Test User Updated' }).first(),
  ).toBeHidden();

  // check if user is in archived table
  await page.getByRole('tab', { name: 'Archived', exact: true }).click();

  await page.waitForURL('/users?is_archived=1');

  await page.getByRole('searchbox', { name: 'Search' }).fill('Test User Updated');

  await expect(
    page.getByRole('cell').filter({ hasText: 'Test User Updated' }).first(),
  ).toBeVisible();

  // restore user from table
  await page.getByRole('button', { name: 'Restore test@example.com', exact: true }).click();

  await page
    .getByRole('dialog', { name: 'Restore Test User Updated', exact: true })
    .getByRole('button', { name: 'Restore', exact: true })
    .click();

  await expect(page.getByRole('dialog', { name: 'Restore Test User', exact: true })).toBeHidden();

  await expect(
    page.getByRole('status').filter({ hasText: 'User restored successfully' }).first(),
  ).toBeVisible();

  await expect(
    page.getByRole('cell').filter({ hasText: 'Test User Updated' }).first(),
  ).toBeHidden();

  // check if user is in available table
  await page.getByRole('tab', { name: 'Available', exact: true }).click();

  await page.waitForURL('/users?is_archived=0');

  await expect(page.getByRole('cell').filter({ hasText: 'Test User Updated' })).toBeVisible();

  // go to edit user
  await page.getByRole('link', { name: 'Edit test@example.com', exact: true }).click();

  await page.waitForURL(/\/users\/(?!.*\bcreate\b)[\w]+/);

  // archive user from edit page
  await expect(page.getByRole('button', { name: 'Restore', exact: true })).toBeHidden();

  await page.getByRole('button', { name: 'Archive', exact: true }).click();

  await page
    .getByRole('dialog', { name: 'Archive Test User Updated', exact: true })
    .getByRole('button', { name: 'Archive', exact: true })
    .click();

  await expect(
    page.getByRole('dialog', { name: 'Archive Test User Updated', exact: true }),
  ).toBeHidden();

  await expect(
    page.getByRole('status').filter({ hasText: 'User archived successfully' }),
  ).toBeVisible();

  // restore user from edit page
  await expect(page.getByRole('button', { name: 'Archive', exact: true })).toBeHidden();

  await page.getByRole('button', { name: 'Restore', exact: true }).click();

  await page
    .getByRole('dialog', { name: 'Restore Test User', exact: true })
    .getByRole('button', { name: 'Restore', exact: true })
    .click();

  await expect(page.getByRole('dialog', { name: 'Restore Test User', exact: true })).toBeHidden();

  await expect(
    page.getByRole('status').filter({ hasText: 'User restored successfully' }),
  ).toBeVisible();

  await expect(page.getByRole('button', { name: 'Archive', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Restore', exact: true })).toBeHidden();
});
