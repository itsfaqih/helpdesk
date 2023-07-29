import { expect, test } from "@playwright/test";

test.use({ storageState: "playwright/.auth/super-admin.json" });

test("channel management", async ({ page }) => {
  await page.goto("/channels");

  // create channel
  await page.getByTestId("link-create-channel").click();

  await page.waitForURL("/channels/create");

  await expect(page.getByTestId("heading-page-title")).toHaveText(
    "Create Channel"
  );

  await page.getByTestId("textbox-name").fill("Test Channel");
  await page.getByTestId("btn-create-channel").click();

  // redirect to view channel
  await page.waitForURL(/\/channels\/(?!.*\bcreate\b)[\w]+/);

  await expect(page.getByTestId("heading-page-title")).toHaveText(
    "View Channel"
  );
  await expect(page.getByTestId("textbox-name")).toHaveValue("Test Channel");

  // check if channel is in table
  await page.getByTestId("link-back").click();

  await page.waitForURL("/channels");

  await expect(page.getByTestId("table-channels")).toContainText(
    "Test Channel"
  );

  // search non-existent channel
  await page.getByTestId("textbox-search").fill("Non-existent Channel");

  await page.waitForURL("/channels?search=Non-existent+Channel");

  await expect(page.getByTestId("table-channels-empty")).toBeVisible();

  // reset search
  await page.getByTestId("btn-reset").click();

  await page.waitForURL("/channels");

  // archive channel from table
  await page.getByTestId("btn-archive-channel-0").click();

  await page.getByTestId("btn-confirm-archive-channel").click();

  await expect(page.getByTestId("table-channels")).not.toContainText(
    "Test Channel"
  );

  // check if channel is in archived table
  await page.getByTestId("tab-is_archived-archived").click();

  await page.waitForURL("/channels?is_archived=1");

  await expect(page.getByTestId("table-channels")).toContainText(
    "Test Channel"
  );

  // restore channel from table
  await page.getByTestId("btn-restore-channel-0").click();

  await page.getByTestId("btn-confirm-restore-channel").click();

  await expect(page.getByTestId("table-channels")).not.toContainText(
    "Test Channel"
  );

  // check if channel is in available table
  await page.getByTestId("tab-is_archived-available").click();

  await page.waitForURL("/channels?is_archived=0");

  await expect(page.getByTestId("table-channels")).toContainText(
    "Test Channel"
  );

  // go to view channel
  await page.getByTestId("link-view-channel-0").click();

  await page.waitForURL(/\/channels\/(?!.*\bcreate\b)[\w]+/);

  // archive channel from view
  await page.getByTestId("btn-archive-channel").click();

  await page.getByTestId("btn-confirm-archive-channel").click();

  await expect(page.getByTestId("btn-archive-channel")).toBeHidden();

  // restore channel from view
  await page.getByTestId("btn-restore-channel").click();

  await page.getByTestId("btn-confirm-restore-channel").click();

  await expect(page.getByTestId("btn-restore-channel")).toBeHidden();
  await expect(page.getByTestId("btn-archive-channel")).toBeVisible();
});
