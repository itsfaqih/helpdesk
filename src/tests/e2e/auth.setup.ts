import { mockUserRecords } from '@/mocks/records/user.record';
import { expect, test as setup } from '@playwright/test';

const superUserFile = 'playwright/.auth/super-admin.json';

setup('authenticate as super admin', async ({ page }) => {
  await page.goto('/auth/login');

  await page.getByLabel('Email').fill(mockUserRecords[0].email);
  await page.getByLabel('Password').fill(mockUserRecords[0].password);
  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForURL('/');

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.context().storageState({ path: superUserFile });
});

const operatorFile = 'playwright/.auth/operator.json';

setup('authenticate as operator', async ({ page }) => {
  await page.goto('/auth/login');

  await page.getByLabel('Email').fill(mockUserRecords[1].email);
  await page.getByLabel('Password').fill(mockUserRecords[1].password);
  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForURL('/');

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.context().storageState({ path: operatorFile });
});
