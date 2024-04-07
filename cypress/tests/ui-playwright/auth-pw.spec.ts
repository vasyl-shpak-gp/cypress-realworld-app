import { test, expect } from "@playwright/test";
import percySnapshot from "@percy/playwright";
import { fetchDataFromDatabase } from "./databaseUtils";

test.describe("User Sign-up and Login", () => {
  //? intercepting with playwright as an option
  //signup
  // await page.getByRole("button", { name: "Submit" }).click();
  // await page.waitForResponse((response) => response.url().includes("/users/"));

  test("should redirect unauthenticated user to signin page", async ({ page }) => {
    await page.goto("/personal");
    await percySnapshot(page, "Redirect to SignIn");
    await expect(page).toHaveURL("http://localhost:3000/signin");
  });

  test("should redirect to the home page after login", async ({ page }) => {
    await page.goto("/");
    const usersData = await fetchDataFromDatabase("find", "users");
    //pick some valid username (could be moved to separate funct and picking random)
    const username = usersData.results[0].username;
    await page.fill('[name="username"]', username);
    await page.fill('[name="password"]', "s3cret");
    await page.click('[data-test="signin-submit"]');
    await expect(page).toHaveURL("http://localhost:3000/");
  });

  test("should remember a user for 30 days after login", async ({ page }) => {
    await page.goto("/");
    const usersData = await fetchDataFromDatabase("find", "users");
    const username = usersData.results[0].username;
    await page.fill('[name="username"]', username);
    await page.fill('[name="password"]', "s3cret");
    await page.locator('[name="remember"]').check();
    await page.click('[data-test="signin-submit"]');
    await page.waitForURL("http://localhost:3000/");
    const cookies = await (await page.context()).cookies();
    const sessionCookie = cookies.find((cookie) => cookie.name === "connect.sid");
    if (sessionCookie) {
      expect(sessionCookie.expires).toBeDefined();
    } else {
      throw new Error("Session cookie not found.");
    }
    expect(sessionCookie).not.toBe(null);
    expect(sessionCookie.expires).toBeDefined();
    const isMobile = async () => {
      const viewport = await page.viewportSize();
      const mobileViewportWidthBreakpoint = 414;
      return viewport && viewport.width < mobileViewportWidthBreakpoint;
    };
    if (await isMobile()) {
      await page.click('[data-test="sidenav-toggle"]');
    }
    await page.click('[data-test="sidenav-signout"]');
    await expect(page).toHaveURL("http://localhost:3000/signin");
    await percySnapshot(page, "Redirect to SignIn - login");
  });

  test("should allow a visitor to sign-up, login, and logout", async ({ page }) => {
    function generateRandomChars() {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      return Array.from({ length: 3 }, () =>
        characters.charAt(Math.floor(Math.random() * characters.length))
      ).join("");
    }
    const randomChars = generateRandomChars();
    const userInfo = {
      firstName: "Bob",
      lastName: "Ross",
      username: `${randomChars}_PainterJoy90`,
      password: `$s3cret`,
    };

    await page.goto("/");
    await page.click('[data-test="signup"]');
    await page.click('[data-test="signup"]');
    await percySnapshot(page, "Sign Up Title");
    //signup
    await page.fill('[name="firstName"]', userInfo.firstName);
    await page.fill('[name="lastName"]', userInfo.lastName);
    await page.fill('[name="username"]', userInfo.username);
    await page.fill('[name="password"]', userInfo.password);
    await page.fill('[name="confirmPassword"]', userInfo.password);
    await percySnapshot(page, "About to Sign Up");
    await page.click('[data-test="signup-submit"]');
    //login
    await page.fill('[name="username"]', userInfo.username);
    await page.fill('[name="password"]', userInfo.password);
    await page.click('[data-test="signin-submit"]');
    //onboarding
    await percySnapshot(page, "User Onboarding Dialog");
    await page.waitForSelector('[data-test="list-skeleton"]', { state: "hidden" });
    await page.waitForSelector('[data-test="nav-top-notifications-count"]');
    await page.click('[data-test="user-onboarding-next"]');
    await page.fill('[name="bankName"]', "The Best Bank");
    await page.fill('[name="accountNumber"]', "123456789");
    await page.fill('[name="routingNumber"]', "987654321");
    await percySnapshot(page, "About to complete User Onboarding");
    await page.click('[data-test="bankaccount-submit"]');
    //logout
    await percySnapshot(page, "Finished User Onboarding");
    await page.click('[data-test="user-onboarding-next"]');
    await page.waitForSelector('[data-test="transaction-list"]');
    await percySnapshot(page, "Transaction List is visible after User Onboarding");

    const isMobile = async () => {
      const viewport = await page.viewportSize();
      const mobileViewportWidthBreakpoint = 414;
      return viewport && viewport.width < mobileViewportWidthBreakpoint;
    };
    if (await isMobile()) {
      await page.click('[data-test="sidenav-toggle"]');
    }
    await page.click('[data-test="sidenav-signout"]');
    await percySnapshot(page, "Redirect to SignIn");
    await expect(page).toHaveURL("http://localhost:3000/signin");
  });
});
