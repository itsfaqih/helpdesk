import { expect, test } from "@playwright/test";

test.use({ storageState: "playwright/.auth/super-admin.json" });

test("client management", async ({ page }) => {
  await page.goto("/clients");

  // create client
  await page.getByTestId("link-create-client").click();

  await page.waitForURL("/clients/create");

  await expect(page.getByTestId("heading-page-title")).toHaveText(
    "Create Client"
  );

  await page.getByTestId("textbox-full-name").fill("Test Client");
  await page.getByTestId("btn-create-client").click();

  await page.waitForURL(/\/clients\/(?!.*\bcreate\b)[\w]+/);

  await expect(page.getByTestId("heading-page-title")).toHaveText(
    "Edit Client"
  );
  await expect(page.getByTestId("textbox-full-name")).toHaveValue(
    "Test Client"
  );

  await page.getByTestId("link-back").click();

  await page.waitForURL("/clients");

  await expect(page.getByTestId("table-clients")).toContainText("Test Client");

  await page.getByTestId("textbox-search").fill("Non-existent Client");

  await page.waitForURL("/clients?search=Non-existent+Client");

  await expect(page.getByTestId("table-clients-empty")).toBeVisible();

  await page.getByTestId("btn-reset").click();

  await page.waitForURL("/clients");

  await page.getByTestId("link-edit-client-0").click();

  await page.waitForURL(/\/clients\/(?!.*\bcreate\b)[\w]+/);

  await page.getByTestId("textbox-full-name").fill("Test Client Updated");
  await page.getByTestId("btn-update-client").click();

  await page.getByTestId("link-back").click();

  await page.waitForURL("/clients");

  await expect(page.getByTestId("table-clients")).toContainText(
    "Test Client Updated"
  );

  await page.waitForURL("/clients");

  await page.getByTestId("btn-archive-client-0").click();

  await page.getByTestId("btn-confirm-archive-client").click();

  await expect(page.getByTestId("table-clients")).not.toContainText(
    "Test Client Updated"
  );

  await page.getByTestId("tabs-is_archived-archived").click();

  await page.waitForURL("/clients?is_archived=1");

  await expect(page.getByTestId("table-clients")).toContainText(
    "Test Client Updated"
  );

  await page.getByTestId("btn-restore-client-0").click();

  await page.getByTestId("btn-confirm-restore-client").click();

  await expect(page.getByTestId("table-clients")).not.toContainText(
    "Test Client Updated"
  );

  await page.getByTestId("tabs-is_archived-available").click();

  await page.waitForURL("/clients?is_archived=0");

  await expect(page.getByTestId("table-clients")).toContainText(
    "Test Client Updated"
  );
});
