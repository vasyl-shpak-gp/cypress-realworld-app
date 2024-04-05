import { test, expect } from "@playwright/test";
import { User } from "../../../src/models";
import { isMobile } from "../../support/utils";
// import "@percy/playwright";
import percySnapshot from "@percy/playwright";

test.describe("User Sign-up and Login", () => {
  test("should redirect unauthenticated user to signin page", async ({ page }) => {
    //cy.visit("/personal");
    //cy.location("pathname").should("equal", "/signin");
    //cy.visualSnapshot("Redirect to SignIn");
    await page.goto("/personal");
    await percySnapshot(page, "Redirect to SignIn", { widths: [1000], minHeight: 1280 });
    await expect(page).toHaveURL("http://localhost:3000/signin");
  });
});
