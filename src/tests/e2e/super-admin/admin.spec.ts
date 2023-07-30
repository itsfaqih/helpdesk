import { expect, test } from "@playwright/test";

test.use({ storageState: "playwright/.auth/super-admin.json" });

test("admin management", async ({ page }) => {
  await page.goto("/admins");

  // create admin
  await page.getByTestId("link-create-admin").click();

  await page.waitForURL("/admins/create");

  await expect(page.getByTestId("heading-page-title")).toHaveText(
    "Create Administrator"
  );

  await page.getByTestId("textbox-full-name").fill("Test Admin");
  await page.getByTestId("textbox-email").fill("test@example.com");
  await page.getByTestId("textbox-password").fill("qwerty123");

  await page.getByTestId("select-role").click();
  await page.getByTestId("option-operator").click();

  await page.getByTestId("btn-create-admin").click();

  // redirect to edit admin
  await page.waitForURL(/\/admins\/(?!.*\bcreate\b)[\w]+/);

  await expect(page.getByTestId("heading-page-title")).toHaveText(
    "Edit Administrator"
  );
  await expect(page.getByTestId("textbox-full-name")).toHaveValue("Test Admin");
  await expect(page.getByTestId("textbox-email")).toHaveValue(
    "test@example.com"
  );
  await expect(page.getByTestId("select-role")).toHaveText("Operator");

  // check if the admin is in table
  await page.getByTestId("link-back").click();

  await page.waitForURL("/admins");

  await expect(page.getByTestId("table-admins")).toContainText("Test Admin");

  // search non-existent admin
  await page.getByTestId("textbox-search").fill("Non-existent Admin");

  await page.waitForURL("/admins?search=Non-existent+Admin");

  await expect(page.getByTestId("table-admins-empty")).toBeVisible();

  // reset search
  await page.getByTestId("btn-reset").click();

  await page.waitForURL("/admins");

  // update the admin
  await page.getByTestId("link-edit-admin-0").click();

  await page.waitForURL(/\/admins\/(?!.*\bcreate\b)[\w]+/);

  await page.getByTestId("textbox-full-name").fill("Test Admin Updated");
  await page.getByTestId("btn-update-admin").click();

  // check if the updated admin is in table
  await page.getByTestId("link-back").click();

  await page.waitForURL("/admins");

  await expect(page.getByTestId("table-admins")).toContainText(
    "Test Admin Updated"
  );

  // deactivate admin from table
  await page.getByTestId("btn-deactivate-admin-0").click();

  await page.getByTestId("btn-confirm-deactivate-admin").click();

  await expect(page.getByTestId("table-admins")).not.toContainText(
    "Test Admin Updated"
  );

  // check if admin is in deactivated table
  await page.getByTestId("tab-is_deactivated-deactivated").click();

  await page.waitForURL("/admins?is_active=0");

  await expect(page.getByTestId("table-admins")).toContainText(
    "Test Admin Updated"
  );

  // reactivate admin from table
  await page.getByTestId("btn-reactivate-admin-0").click();

  await page.getByTestId("btn-confirm-reactivate-admin").click();

  await expect(page.getByTestId("table-admins")).not.toContainText(
    "Test Admin Updated"
  );

  // check if admin is in table
  await page.getByTestId("tab-is_deactivated-active").click();

  await page.waitForURL("/admins?is_active=1");

  await expect(page.getByTestId("table-admins")).toContainText(
    "Test Admin Updated"
  );
});
