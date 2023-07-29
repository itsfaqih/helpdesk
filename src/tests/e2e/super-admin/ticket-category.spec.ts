import { expect, test } from "@playwright/test";

test.use({ storageState: "playwright/.auth/super-admin.json" });

test("ticket category management", async ({ page }) => {
  await page.goto("/ticket-categories");

  // create ticket category
  await page.getByTestId("link-create-ticket-category").click();

  await page.waitForURL("/ticket-categories/create");

  await expect(page.getByTestId("heading-page-title")).toHaveText(
    "Create Ticket Category"
  );

  await page.getByTestId("textbox-name").fill("Test Ticket Category");
  await page
    .getByTestId("textbox-description")
    .fill("Test Ticket Category Description");
  await page.getByTestId("btn-create-ticket-category").click();

  // redirect to edit ticket category
  await page.waitForURL(/\/ticket-categories\/(?!.*\bcreate\b)[\w]+/);

  await expect(page.getByTestId("heading-page-title")).toHaveText(
    "Edit Ticket Category"
  );
  await expect(page.getByTestId("textbox-name")).toHaveValue(
    "Test Ticket Category"
  );
  await expect(page.getByTestId("textbox-description")).toHaveValue(
    "Test Ticket Category Description"
  );

  // check if the ticket-category is in table
  await page.getByTestId("link-back").click();

  await page.waitForURL("/ticket-categories");

  await expect(page.getByTestId("table-ticket-categories")).toContainText(
    "Test Ticket Category"
  );

  // search non-existent ticket-category
  await page.getByTestId("textbox-search").fill("Non-existent Ticket Category");

  await page.waitForURL(
    "/ticket-categories?search=Non-existent+Ticket+Category"
  );

  await expect(page.getByTestId("table-ticket-categories-empty")).toBeVisible();

  // reset search
  await page.getByTestId("btn-reset").click();

  await page.waitForURL("/ticket-categories");

  // update the ticket category
  await page.getByTestId("link-edit-ticket-category-0").click();

  await page.waitForURL(/\/ticket-categories\/(?!.*\bcreate\b)[\w]+/);

  await page
    .getByTestId("textbox-description")
    .fill("Test Ticket Category Description Updated");
  await page.getByTestId("btn-update-ticket-category").click();

  // check if the ticket category description is updated
  await page.reload();

  await expect(page.getByTestId("textbox-description")).toHaveValue(
    "Test Ticket Category Description Updated"
  );

  // archive ticket-category from table
  await page.getByTestId("link-back").click();

  await page.getByTestId("btn-archive-ticket-category-0").click();

  await page.getByTestId("btn-confirm-archive-ticket-category").click();

  await expect(page.getByTestId("table-ticket-categories")).not.toContainText(
    "Test Ticket Category"
  );

  // check if ticket-category is in archived table
  await page.getByTestId("tab-is_archived-archived").click();

  await page.waitForURL("/ticket-categories?is_archived=1");

  await expect(page.getByTestId("table-ticket-categories")).toContainText(
    "Test Ticket Category"
  );

  // restore ticket-category from table
  await page.getByTestId("btn-restore-ticket-category-0").click();

  await page.getByTestId("btn-confirm-restore-ticket-category").click();

  await expect(page.getByTestId("table-ticket-categories")).not.toContainText(
    "Test Ticket Category"
  );

  // check if ticket-category is in table
  await page.getByTestId("tab-is_archived-available").click();

  await page.waitForURL("/ticket-categories?is_archived=0");

  await expect(page.getByTestId("table-ticket-categories")).toContainText(
    "Test Ticket Category"
  );
});
