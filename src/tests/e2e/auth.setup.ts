import { mockAdminRecords } from "@/mocks/records/admin.record";
import { test as setup } from "@playwright/test";

const superAdminFile = "playwright/.auth/super-admin.json";

setup("authenticate as super admin", async ({ page }) => {
  await page.goto("/auth/login");

  await page.getByLabel("Email").fill(mockAdminRecords[0].email);
  await page.getByLabel("Password").fill(mockAdminRecords[0].password);
  await page.getByRole("button", { name: "Login" }).click();

  await page.waitForURL("/");

  await page.context().storageState({ path: superAdminFile });
});

const operatorFile = "playwright/.auth/operator.json";

setup("authenticate as operator", async ({ page }) => {
  await page.goto("/auth/login");

  await page.getByLabel("Email").fill(mockAdminRecords[1].email);
  await page.getByLabel("Password").fill(mockAdminRecords[1].password);
  await page.getByRole("button", { name: "Login" }).click();

  await page.waitForURL("/");

  await page.context().storageState({ path: operatorFile });
});
