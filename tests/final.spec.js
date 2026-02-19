import { test, expect } from '@playwright/test';
import { login } from '../helper/login';


test('login test', async ({ page }) => {

  await page.goto('https://www.saucedemo.com/');
  
  await page.locator('[data-test="username"]').fill('standard_user');

  await page.locator('[data-test="password"]').fill('secret_sauce');

  await page.locator('[data-test="login-button"]').click();

  await expect(page).toHaveURL(/.*inventory\.html/);

  const inventoryList = page.locator('[data-test="inventory-list"]');
  await expect(inventoryList).toBeVisible();
  const items = inventoryList.locator('[data-test="inventory-item"]');
  await expect(items.first()).toBeVisible();


});


test('add item to cart', async ({ page }) => {

  await login(page, 'standard_user');

  const firstItem = page.locator('[data-test="inventory-item"]').first();
  await firstItem.locator('button:has-text("Add to cart")').click();

  const cartBadge = page.locator('[data-test="shopping-cart-badge"]');
  await expect(cartBadge).toHaveText('1');

  await page.locator('[data-test="shopping-cart-link"]').click();
  await expect(page).toHaveURL('https://www.saucedemo.com/cart.html');

  const cartItem = page.locator('[data-test="inventory-item"]');
  await expect(cartItem.first()).toBeVisible();
});


test('checkout process', async ({ page}) => {

  await login(page, 'standard_user');

  const firstItem = page.locator('[data-test="inventory-item"]').first();
  await firstItem.locator('button:has-text("Add to cart")').click();

  await page.locator('[data-test="shopping-cart-link"]').click();
  await expect(page).toHaveURL('https://www.saucedemo.com/cart.html');

  await page.locator('[data-test="checkout"]').click();
  await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-one.html');

  await page.locator('[data-test="firstName"]').fill('Nazrin');
  await page.locator('[data-test="lastName"]').fill('Aliyeva');
  await page.locator('[data-test="postalCode"]').fill('1010');

  await page.locator('[data-test="continue"]').click();
  await expect(page).toHaveURL('https://www.saucedemo.com/checkout-step-two.html');

  const totalPrice = page.locator('[data-test="total-label"]');
  await expect(totalPrice).toBeVisible();

  await page.locator('[data-test="finish"]').click();
  await expect(page).toHaveURL('https://www.saucedemo.com/checkout-complete.html');

  const successMessage = page.locator('[data-test="complete-header"]');
  await expect(successMessage).toHaveText('Thank you for your order!');
});

test('filter', async ({ page }) => {

  await login(page, 'standard_user');

  await page.locator('[data-test="product-sort-container"]').selectOption('lohi');

  const prices = await page.locator('.inventory_item_price').allTextContents();
  const numericPrices = prices.map(price =>
    parseFloat(price.replace('$', ''))
  );
  const sortedPrices = [...numericPrices].sort((a, b) => a - b);
  expect(numericPrices).toEqual(sortedPrices);

})
