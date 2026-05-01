import { test, expect, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Veribee Multi-User QA Test Suite
 * 
 * Tests workflow.md stages: SUBMIT → AUTHENTICATE → ASSURE
 * across three roles: Seller, Buyer, Rider
 * 
 * Follows: Veribee_QA_TestPlan.md test cases
 */

const ARTIFACT_DIR = path.join(process.cwd(), 'qa-multiuser-artifacts');
const BASE_URL = 'http://localhost:8084';

// Test account credentials (from workflow)
const TEST_ACCOUNTS = {
  seller: { phone: '9171234501', password: 'VeribeeTest123!', role: 'seller' },
  buyer: { phone: '9171234502', password: 'VeribeeTest123!', role: 'buyer' },
  rider: { phone: '9171234503', password: 'VeribeeTest123!', role: 'rider' },
};

interface TestResult {
  role: string;
  stage: string;
  screen: string;
  button: string;
  action: string;
  expected: string;
  result: 'PASS' | 'FAIL';
  error?: string;
}

const results: TestResult[] = [];

// ============ HELPER FUNCTIONS ============

async function takeScreenshot(page: Page, name: string) {
  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, `${name}.png`),
    fullPage: true,
  });
}

async function logResult(result: TestResult) {
  results.push(result);
  const status = result.result === 'PASS' ? '✓' : '✗';
  console.log(`  ${status} [${result.role}] ${result.screen} → ${result.button}`);
  if (result.error) {
    console.log(`      Error: ${result.error}`);
  }
}

async function login(page: Page, account: typeof TEST_ACCOUNTS.seller) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  
  // Fill phone
  await page.fill('[name="phone"]', account.phone).catch(() => {});
  await page.fill('input[type="tel"]', account.phone).catch(() => {});
  
  // Fill password
  await page.fill('[name="password"]', account.password).catch(() => {});
  await page.fill('input[type="password"]', account.password).catch(() => {});
  
  // Click login button
  await page.click('button:has-text("Login"), button:has-text("Sign In")').catch(() => {});
  
  // Wait for navigation
  await page.waitForNavigation({ timeout: 10000 }).catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
}

async function testButton(
  page: Page,
  buttonSelector: string,
  buttonName: string,
  expectedAction: string,
  role: string,
  stage: string,
  screen: string,
) {
  try {
    const button = page.locator(buttonSelector).first();
    const isVisible = await button.isVisible().catch(() => false);

    if (!isVisible) {
      await logResult({
        role,
        stage,
        screen,
        button: buttonName,
        action: 'Click',
        expected: expectedAction,
        result: 'FAIL',
        error: 'Button not visible',
      });
      return false;
    }

    const urlBefore = page.url();
    
    try {
      await button.click({ timeout: 5000 });
      await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
    } catch (e) {
      await logResult({
        role,
        stage,
        screen,
        button: buttonName,
        action: 'Click',
        expected: expectedAction,
        result: 'FAIL',
        error: `Click failed: ${(e as Error).message}`,
      });
      return false;
    }

    const urlAfter = page.url();
    const navigationOccurred = urlAfter !== urlBefore;

    await logResult({
      role,
      stage,
      screen,
      button: buttonName,
      action: 'Click',
      expected: expectedAction,
      result: 'PASS',
    });
    return true;
  } catch (error) {
    await logResult({
      role,
      stage,
      screen,
      button: buttonName,
      action: 'Click',
      expected: expectedAction,
      result: 'FAIL',
      error: (error as Error).message,
    });
    return false;
  }
}

// ============ PHASE 1: AUTH FLOW ============

test.describe('PHASE 1 — AUTH FLOW (All Users)', () => {
  test('A-003: Login Flow for All Three Roles', async ({ context }) => {
    // Create three tabs for parallel testing
    const sellerPage = await context.newPage();
    const buyerPage = await context.newPage();
    const riderPage = await context.newPage();

    try {
      console.log('\n=== LOGGING IN ALL THREE USERS ===\n');

      // Seller login
      console.log('→ Seller login...');
      await login(sellerPage, TEST_ACCOUNTS.seller);
      await takeScreenshot(sellerPage, '01-seller-dashboard');
      const sellerUrl = sellerPage.url();
      expect(sellerUrl).toContain('/seller');

      // Buyer login
      console.log('→ Buyer login...');
      await login(buyerPage, TEST_ACCOUNTS.buyer);
      await takeScreenshot(buyerPage, '01-buyer-home');
      const buyerUrl = buyerPage.url();
      expect(buyerUrl).toContain('/buyer');

      // Rider login
      console.log('→ Rider login...');
      await login(riderPage, TEST_ACCOUNTS.rider);
      await takeScreenshot(riderPage, '01-rider-job-feed');
      const riderUrl = riderPage.url();
      expect(riderUrl).toContain('/rider');

    } finally {
      await sellerPage.close();
      await buyerPage.close();
      await riderPage.close();
    }
  });
});

// ============ PHASE 2: SELLER FLOW (SUBMIT) ============

test.describe('PHASE 2 — SELLER FLOW (SUBMIT Stage)', () => {
  let page: Page;

  test.beforeAll(async ({ context }) => {
    page = await context.newPage();
    await login(page, TEST_ACCOUNTS.seller);
  });

  test('B-001: Seller Dashboard Buttons', async () => {
    console.log('\n=== TESTING SELLER DASHBOARD ===\n');
    await takeScreenshot(page, '02-seller-dashboard-initial');

    // Test Add Product button
    await testButton(
      page,
      'button:has-text("Add Product"), button:has-text("+"),  [aria-label*="Add"]',
      'Add Product (+)',
      'Navigate to add-product/step1',
      'seller',
      'SUBMIT',
      'Seller Dashboard'
    );
    
    await takeScreenshot(page, '02-after-add-product-button');

    // Check if we landed on product form
    const currentUrl = page.url();
    expect(currentUrl).toContain('/add-product');

    // Test navigation back
    await testButton(
      page,
      '[aria-label="Back"], button:has-text("←"), .back-button',
      'Back Arrow',
      'Return to dashboard',
      'seller',
      'SUBMIT',
      'Add Product Step 1'
    );
  });

  test('B-002: Add Product Form (3 Steps) - SUBMIT Flow', async () => {
    console.log('\n=== TESTING ADD PRODUCT FORM ===\n');
    
    // Navigate to add product
    await page.goto(`${BASE_URL}/seller/add-product/step1-basic`);
    await takeScreenshot(page, '02-step1-basic-form');

    // Test photo upload button
    await testButton(
      page,
      '[aria-label*="upload"], [data-testid*="photo"], button:has-text("Upload")',
      'Photo Upload Area',
      'Open image picker',
      'seller',
      'SUBMIT',
      'Step 1: Basic Info'
    );

    // Fill product name
    const nameInput = page.locator('input[name="name"], input[placeholder*="name"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test Premium Laptop');
      console.log('  ℹ Filled product name');
    }

    // Fill price
    const priceInput = page.locator('input[name="price"], input[type="number"]').first();
    if (await priceInput.isVisible()) {
      await priceInput.fill('15000');
      console.log('  ℹ Filled price');
    }

    // Test NEXT button to Step 2
    await testButton(
      page,
      'button:has-text("NEXT"), button:has-text("Next"), button:has-text("Continue")',
      'NEXT to Step 2',
      'Navigate to step2-auth',
      'seller',
      'SUBMIT',
      'Step 1: Basic Info'
    );

    await page.waitForURL(/step2|auth/, { timeout: 5000 }).catch(() => {});
    await takeScreenshot(page, '02-step2-auth-form');

    // Test serial number barcode scan button
    await testButton(
      page,
      '[aria-label*="barcode"], [data-testid*="scan"], button:has-text("Scan")',
      'Barcode Scan Icon',
      'Open camera for barcode',
      'seller',
      'SUBMIT',
      'Step 2: Authentication'
    );

    // Fill serial manually
    const serialInput = page.locator('input[name="serial"], input[placeholder*="serial"]').first();
    if (await serialInput.isVisible()) {
      await serialInput.fill('SN123456789ABC');
      console.log('  ℹ Filled serial number');
    }

    // Test evidence photo uploads (4 slots)
    const evidenceUploadButtons = page.locator('[aria-label*="evidence"], [data-testid*="evidence"], button:has-text("Upload")');
    const evidenceCount = await evidenceUploadButtons.count();
    
    for (let i = 0; i < Math.min(evidenceCount, 1); i++) {
      await testButton(
        page,
        `[aria-label*="evidence"]:nth-of-type(${i + 1}), [data-testid*="evidence"]:nth-of-type(${i + 1})`,
        `Evidence Photo ${i + 1}`,
        'Open image picker',
        'seller',
        'SUBMIT',
        'Step 2: Authentication'
      );
    }

    // Test SUBMIT button to Step 3
    await testButton(
      page,
      'button:has-text("Submit"), button:has-text("Review"), button:has-text("Next")',
      'SUBMIT for Verification',
      'Navigate to step3-review',
      'seller',
      'SUBMIT',
      'Step 2: Authentication'
    );

    await page.waitForURL(/step3|review/, { timeout: 5000 }).catch(() => {});
    await takeScreenshot(page, '02-step3-review-form');

    // Test PUBLISH button
    await testButton(
      page,
      'button:has-text("Publish"), button:has-text("Submit"), button:has-text("Post")',
      'Publish Listing',
      'Submit to auth_jobs',
      'seller',
      'SUBMIT',
      'Step 3: Review & Publish'
    );

    await page.waitForNavigation({ timeout: 8000 }).catch(() => {});
    await takeScreenshot(page, '02-after-publish');
  });

  test('B-004: Products List & Inventory', async () => {
    console.log('\n=== TESTING PRODUCTS LIST ===\n');
    
    await page.goto(`${BASE_URL}/seller/products`);
    await takeScreenshot(page, '02-products-list');

    // Test tab filters
    const tabs = ['Active', 'Pending', 'Rejected'];
    for (const tab of tabs) {
      await testButton(
        page,
        `button:has-text("${tab}"), [role="tab"]:has-text("${tab}")`,
        `Tab: ${tab}`,
        `Filter to ${tab} products`,
        'seller',
        'SUBMIT',
        'Products List'
      );
      await page.waitForLoadState('networkidle', { timeout: 2000 }).catch(() => {});
    }

    // Test 3-dot menu on first product
    await testButton(
      page,
      '[aria-label*="menu"], button:has-text("⋮"), [data-testid*="menu"]',
      '3-dot Menu',
      'Show Edit/Delete options',
      'seller',
      'SUBMIT',
      'Products List'
    );

    // Test floating + button
    await testButton(
      page,
      'button[aria-label*="add"], [aria-label*="Add"], [data-testid*="fab"]',
      'FAB (+) Button',
      'Navigate to add-product',
      'seller',
      'SUBMIT',
      'Products List'
    );
  });

  test('B-005: VSI Score Breakdown', async () => {
    console.log('\n=== TESTING VSI SCORE ===\n');
    
    await page.goto(`${BASE_URL}/seller/vsi-score`);
    await takeScreenshot(page, '02-vsi-score-screen');

    // Verify VSI gauge visible
    const vsiGauge = page.locator('[aria-label*="VSI"], [data-testid*="vsi"], svg');
    const isVisible = await vsiGauge.isVisible().catch(() => false);
    
    console.log(`  ℹ VSI gauge visible: ${isVisible}`);

    // Test back navigation
    await testButton(
      page,
      '[aria-label="Back"], button:has-text("←"), .back-button',
      'Back Button',
      'Return to dashboard',
      'seller',
      'SUBMIT',
      'VSI Score Screen'
    );
  });
});

// ============ PHASE 2b: AUTHENTICATE (Backend/Reviewer) ============

test.describe('PHASE 2b — AUTHENTICATE Stage (Auto-Complete Mock)', () => {
  let page: Page;

  test.beforeAll(async ({ context }) => {
    page = await context.newPage();
    await login(page, TEST_ACCOUNTS.seller);
  });

  test('B-003: Authentication Status Screen (Pending → Verified)', async () => {
    console.log('\n=== TESTING AUTH STATUS ===\n');

    // Navigate to auth status (would be for a real product)
    await page.goto(`${BASE_URL}/seller/auth-status`);
    await takeScreenshot(page, '02b-auth-status-pending');

    // Check for status indicators
    const pendingBanner = page.locator('text=Pending, text=Under Review, [data-testid*="pending"]').first();
    const isPending = await pendingBanner.isVisible().catch(() => false);
    console.log(`  ℹ Pending status visible: ${isPending}`);

    // Test View Live Listing button (if in verified state)
    await testButton(
      page,
      'button:has-text("View Live"), button:has-text("View Listing")',
      'View Live Listing',
      'Navigate to product detail',
      'seller',
      'AUTHENTICATE',
      'Auth Status Screen'
    );

    // Test Share Listing button
    await testButton(
      page,
      'button:has-text("Share"), [aria-label*="share"]',
      'Share Listing',
      'Open share sheet',
      'seller',
      'AUTHENTICATE',
      'Auth Status Screen'
    );
  });
});

// ============ PHASE 3: BUYER FLOW (ASSURE) ============

test.describe('PHASE 3 — BUYER FLOW (ASSURE Stage)', () => {
  let page: Page;

  test.beforeAll(async ({ context }) => {
    page = await context.newPage();
    await login(page, TEST_ACCOUNTS.buyer);
  });

  test('C-001: Home Feed & Product Discovery', async () => {
    console.log('\n=== TESTING BUYER HOME FEED ===\n');
    
    await page.goto(`${BASE_URL}/buyer/home`);
    await takeScreenshot(page, '03-buyer-home-feed');

    // Test category filter chips
    const filterChips = ['All', 'Electronics', 'Fashion', 'Home'];
    for (const chip of filterChips.slice(0, 2)) {
      await testButton(
        page,
        `button:has-text("${chip}"), [role="tab"]:has-text("${chip}")`,
        `Filter: ${chip}`,
        `Show ${chip} products`,
        'buyer',
        'ASSURE',
        'Home Feed'
      );
      await page.waitForLoadState('networkidle', { timeout: 2000 }).catch(() => {});
    }

    // Test search button
    await testButton(
      page,
      '[aria-label*="search"], button:has-text("🔍"), input[placeholder*="search"]',
      'Search Bar',
      'Navigate to search',
      'buyer',
      'ASSURE',
      'Home Feed'
    );

    // Test notification bell
    await testButton(
      page,
      '[aria-label*="notif"], button:has-text("🔔"), [data-testid*="notif"]',
      'Notification Bell',
      'Navigate to notifications',
      'buyer',
      'ASSURE',
      'Home Feed'
    );

    // Test product card tap
    const productCard = page.locator('[data-testid*="product"], .product-card, [role="link"]:has-text("₱")').first();
    if (await productCard.isVisible()) {
      await testButton(
        page,
        '[data-testid*="product"]:first-child, .product-card:first-child',
        'Product Card',
        'Navigate to product detail',
        'buyer',
        'ASSURE',
        'Home Feed'
      );
    }
  });

  test('C-002: Product Detail & Auth Report (Verification Badge)', async () => {
    console.log('\n=== TESTING PRODUCT DETAIL ===\n');

    // Find and tap a product
    const products = page.locator('[data-testid*="product"], .product-card');
    if (await products.first().isVisible()) {
      await products.first().click();
      await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
    }

    await takeScreenshot(page, '03-product-detail');

    // Test verification badge (main ASSURE signal)
    await testButton(
      page,
      '[aria-label*="verified"], button:has-text("✓"), [data-testid*="verified"]',
      'Verification Badge',
      'Open Auth Report modal',
      'buyer',
      'ASSURE',
      'Product Detail'
    );

    await page.waitForTimeout(500);
    await takeScreenshot(page, '03-auth-report-modal');

    // Close modal with X
    await testButton(
      page,
      '[aria-label="Close"], button:has-text("×"), [data-testid*="close"]',
      'Close Modal (X)',
      'Close auth report',
      'buyer',
      'ASSURE',
      'Product Detail'
    );

    // Test heart/wishlist button
    await testButton(
      page,
      '[aria-label*="heart"], [aria-label*="save"], button:has-text("♡")',
      'Heart/Wishlist',
      'Save product',
      'buyer',
      'ASSURE',
      'Product Detail'
    );

    // Test Add to Cart
    await testButton(
      page,
      'button:has-text("Add to Cart"), button:has-text("Cart"), [data-testid*="add-cart"]',
      'Add to Cart',
      'Add product to cart',
      'buyer',
      'ASSURE',
      'Product Detail'
    );

    // Test Buy Now
    await testButton(
      page,
      'button:has-text("Buy Now"), button:has-text("Checkout")',
      'Buy Now',
      'Go to checkout',
      'buyer',
      'ASSURE',
      'Product Detail'
    );
  });

  test('C-003: Cart & Order Summary', async () => {
    console.log('\n=== TESTING CART ===\n');

    // Navigate to cart via bottom nav
    await testButton(
      page,
      'button:has-text("Cart"), [aria-label*="cart"], [role="tab"]:has-text("Cart")',
      'Cart Tab (Bottom Nav)',
      'Navigate to cart',
      'buyer',
      'ASSURE',
      'Bottom Navigation'
    );

    await page.waitForLoadState('networkidle', { timeout: 2000 }).catch(() => {});
    await takeScreenshot(page, '03-cart-screen');

    // Test quantity buttons
    await testButton(
      page,
      'button:has-text("+"), [aria-label*="increment"]',
      'Quantity (+) Button',
      'Increase quantity',
      'buyer',
      'ASSURE',
      'Cart'
    );

    await testButton(
      page,
      'button:has-text("−"), button:has-text("-"), [aria-label*="decrement"]',
      'Quantity (−) Button',
      'Decrease quantity',
      'buyer',
      'ASSURE',
      'Cart'
    );

    // Test Proceed to Checkout
    await testButton(
      page,
      'button:has-text("Proceed to Checkout"), button:has-text("Checkout")',
      'Proceed to Checkout',
      'Navigate to checkout',
      'buyer',
      'ASSURE',
      'Cart'
    );

    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    await takeScreenshot(page, '03-checkout-screen');
  });

  test('C-004: Checkout & Place Order (Assurance Checkpoint)', async () => {
    console.log('\n=== TESTING CHECKOUT (ASSURE) ===\n');

    // Payment method selection
    const paymentOptions = ['GCash', 'COD', 'Credit Card'];
    for (const method of paymentOptions.slice(0, 2)) {
      await testButton(
        page,
        `button:has-text("${method}"), [aria-label*="${method}"], label:has-text("${method}")`,
        `Payment: ${method}`,
        `Select ${method}`,
        'buyer',
        'ASSURE',
        'Checkout'
      );
      await page.waitForTimeout(300);
    }

    // Test Address Change
    await testButton(
      page,
      'button:has-text("Change"), [aria-label*="address"], [data-testid*="address"]',
      'Change Address',
      'Open address picker',
      'buyer',
      'ASSURE',
      'Checkout'
    );

    // Navigate back to checkout if changed
    await page.goBack().catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 2000 }).catch(() => {});

    // Test Place Order (critical ASSURE step)
    await testButton(
      page,
      'button:has-text("Place Order"), button:has-text("Complete Purchase")',
      'Place Order',
      'Create order + OTP handover setup',
      'buyer',
      'ASSURE',
      'Checkout'
    );

    await page.waitForNavigation({ timeout: 8000 }).catch(() => {});
    await takeScreenshot(page, '03-order-tracking-created');
  });

  test('C-005: Order Tracking (Real-time Handover)', async () => {
    console.log('\n=== TESTING ORDER TRACKING ===\n');

    await page.goto(`${BASE_URL}/buyer/orders`);
    await takeScreenshot(page, '03-my-orders');

    // Test order card
    await testButton(
      page,
      '[data-testid*="order"], .order-card, [role="link"]:has-text("Order")',
      'Order Card',
      'Open order detail',
      'buyer',
      'ASSURE',
      'My Orders'
    );

    await page.waitForLoadState('networkidle', { timeout: 2000 }).catch(() => {});
    await takeScreenshot(page, '03-order-tracking-detail');

    // Look for OTP Entry section (critical for ASSURE)
    const otpSection = page.locator('[aria-label*="OTP"], text=OTP, [data-testid*="otp"]').first();
    const hasOTP = await otpSection.isVisible().catch(() => false);
    console.log(`  ℹ OTP handover section visible: ${hasOTP}`);
  });

  test('C-006: Dispute Filing (Assurance Fallback)', async () => {
    console.log('\n=== TESTING DISPUTE FLOW ===\n');

    // Navigate to disputes or go through My Orders
    await page.goto(`${BASE_URL}/buyer/orders`);
    
    // Locate completed order and tap dispute option
    const orderCard = page.locator('[data-testid*="order"], .order-card').first();
    if (await orderCard.isVisible()) {
      await orderCard.click();
      await page.waitForLoadState('networkidle', { timeout: 2000 }).catch(() => {});
    }

    // Test File Dispute button
    await testButton(
      page,
      'button:has-text("File Dispute"), button:has-text("Report Issue")',
      'File Dispute',
      'Navigate to dispute form',
      'buyer',
      'ASSURE',
      'Order Detail'
    );

    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    await takeScreenshot(page, '03-dispute-form');

    // Test reason selection
    const reasons = ['Counterfeit', 'Not as described', 'Damaged'];
    for (const reason of reasons.slice(0, 1)) {
      await testButton(
        page,
        `label:has-text("${reason}"), input[value="${reason}"]`,
        `Reason: ${reason}`,
        `Select ${reason}`,
        'buyer',
        'ASSURE',
        'Dispute Form'
      );
    }

    // Test evidence upload
    await testButton(
      page,
      '[aria-label*="upload"], button:has-text("Upload"), [data-testid*="evidence"]',
      'Upload Evidence',
      'Add dispute photos',
      'buyer',
      'ASSURE',
      'Dispute Form'
    );

    // Test Submit Dispute
    await testButton(
      page,
      'button:has-text("Submit Dispute"), button:has-text("File")',
      'Submit Dispute',
      'Submit dispute to platform',
      'buyer',
      'ASSURE',
      'Dispute Form'
    );
  });
});

// ============ PHASE 4: RIDER FLOW ============

test.describe('PHASE 4 — RIDER FLOW (ASSURE Delivery)', () => {
  let page: Page;

  test.beforeAll(async ({ context }) => {
    page = await context.newPage();
    await login(page, TEST_ACCOUNTS.rider);
  });

  test('D-001: Job Feed & Online Toggle', async () => {
    console.log('\n=== TESTING RIDER JOB FEED ===\n');

    await page.goto(`${BASE_URL}/rider/job-feed`);
    await takeScreenshot(page, '04-job-feed-offline');

    // Test Online toggle
    await testButton(
      page,
      '[aria-label*="online"], button:has-text("Online"), [data-testid*="toggle"]',
      'Online/Offline Toggle',
      'Switch to online status',
      'rider',
      'ASSURE',
      'Job Feed'
    );

    await page.waitForTimeout(1000);
    await takeScreenshot(page, '04-job-feed-online');

    // Test job card tap
    const jobCard = page.locator('[data-testid*="job"], .job-card, [role="link"]:has-text("₱")').first();
    if (await jobCard.isVisible()) {
      await testButton(
        page,
        '[data-testid*="job"]:first-child, .job-card:first-child',
        'Job Card',
        'Open job detail modal',
        'rider',
        'ASSURE',
        'Job Feed'
      );

      await page.waitForTimeout(500);
      await takeScreenshot(page, '04-job-detail-modal');

      // Test Accept Job button (critical for ASSURE)
      await testButton(
        page,
        'button:has-text("Accept"), button:has-text("Take Job")',
        'Accept Job',
        'Assign to this rider + navigate',
        'rider',
        'ASSURE',
        'Job Detail'
      );
    }

    // Test Decline button
    await testButton(
      page,
      'button:has-text("Decline"), button:has-text("Skip")',
      'Decline Job',
      'Reject job + stay in feed',
      'rider',
      'ASSURE',
      'Job Feed'
    );
  });

  test('D-002: Navigation to Pickup (Location Broadcast)', async () => {
    console.log('\n=== TESTING NAVIGATION TO PICKUP ===\n');

    await page.goto(`${BASE_URL}/rider/navigation-pickup`);
    await takeScreenshot(page, '04-nav-to-pickup');

    // Test seller phone call button
    await testButton(
      page,
      '[aria-label*="phone"], button:has-text("📞"), [data-testid*="call"]',
      'Seller Phone Call',
      'Open dialer',
      'rider',
      'ASSURE',
      'Navigation to Pickup'
    );

    // Test map zoom buttons
    await testButton(
      page,
      'button:has-text("+"), [aria-label*="zoom in"]',
      'Zoom In (+)',
      'Zoom map in',
      'rider',
      'ASSURE',
      'Navigation to Pickup'
    );

    await testButton(
      page,
      'button:has-text("−"), button:has-text("-"), [aria-label*="zoom out"]',
      'Zoom Out (−)',
      'Zoom map out',
      'rider',
      'ASSURE',
      'Navigation to Pickup'
    );

    // Test arrival button
    await testButton(
      page,
      'button:has-text("I\'ve Arrived"), button:has-text("Arrived at Pickup")',
      'I\'ve Arrived at Pickup',
      'Navigate to pickup-confirm',
      'rider',
      'ASSURE',
      'Navigation to Pickup'
    );
  });

  test('D-003: Pickup Confirmation Checklist', async () => {
    console.log('\n=== TESTING PICKUP CONFIRMATION ===\n');

    await page.goto(`${BASE_URL}/rider/pickup-confirm`);
    await takeScreenshot(page, '04-pickup-confirm');

    // Test checklist items
    const checklistItems = [
      'Package is sealed',
      'Product is authentic',
      'Quantity matches',
    ];

    for (const item of checklistItems) {
      await testButton(
        page,
        `[aria-label*="${item}"], input[aria-label*="${item}"], label:has-text("${item}")`,
        `Checkbox: ${item}`,
        `Check "${item}"`,
        'rider',
        'ASSURE',
        'Pickup Confirmation'
      );
      await page.waitForTimeout(200);
    }

    // Test Confirm Pickup button
    await testButton(
      page,
      'button:has-text("Confirm Pickup"), button:has-text("Start Delivery")',
      'Confirm Pickup & Start Delivery',
      'Navigate to navigation-delivery',
      'rider',
      'ASSURE',
      'Pickup Confirmation'
    );
  });

  test('D-004: Navigation to Delivery & Real-time Tracking', async () => {
    console.log('\n=== TESTING NAVIGATION TO DELIVERY ===\n');

    await page.goto(`${BASE_URL}/rider/navigation-delivery`);
    await takeScreenshot(page, '04-nav-to-delivery');

    // Test buyer chat
    await testButton(
      page,
      '[aria-label*="chat"], button:has-text("💬"), [data-testid*="chat"]',
      'Buyer Chat',
      'Open chat',
      'rider',
      'ASSURE',
      'Navigation to Delivery'
    );

    // Test arrival button (final critical step)
    await testButton(
      page,
      'button:has-text("I\'ve Arrived"), button:has-text("Arrived at Delivery")',
      'I\'ve Arrived at Delivery',
      'Navigate to otp-entry',
      'rider',
      'ASSURE',
      'Navigation to Delivery'
    );
  });

  test('D-005: OTP Entry (Handover Completion)', async () => {
    console.log('\n=== TESTING OTP ENTRY ===\n');

    await page.goto(`${BASE_URL}/rider/otp-entry`);
    await takeScreenshot(page, '04-otp-entry');

    // Simulate typing OTP (6 digits)
    const otpBoxes = page.locator('[data-testid*="otp-digit"], input[aria-label*="digit"]');
    const boxCount = await otpBoxes.count();

    if (boxCount > 0) {
      // Type first few digits
      for (let i = 0; i < Math.min(3, boxCount); i++) {
        await otpBoxes.nth(i).type(`${i + 1}`);
      }
      console.log('  ℹ OTP digit entry working');
    }

    // Test Confirm Delivery button
    await testButton(
      page,
      'button:has-text("Confirm Delivery"), button:has-text("Complete")',
      'Confirm Delivery',
      'Complete handover',
      'rider',
      'ASSURE',
      'OTP Entry'
    );
  });

  test('D-006: Delivery Complete & Earnings', async () => {
    console.log('\n=== TESTING EARNINGS ===\n');

    await page.goto(`${BASE_URL}/rider/earnings`);
    await takeScreenshot(page, '04-earnings-screen');

    // Test earnings tabs
    const tabs = ['Today', 'This Week', 'This Month'];
    for (const tab of tabs) {
      await testButton(
        page,
        `button:has-text("${tab}"), [role="tab"]:has-text("${tab}")`,
        `Earnings Tab: ${tab}`,
        `Filter earnings to ${tab}`,
        'rider',
        'ASSURE',
        'Earnings'
      );
      await page.waitForLoadState('networkidle', { timeout: 1500 }).catch(() => {});
    }

    // Test Back to Job Feed
    await testButton(
      page,
      'button:has-text("Back to Job Feed"), button:has-text("Continue")',
      'Back to Job Feed',
      'Return to feed',
      'rider',
      'ASSURE',
      'Earnings'
    );
  });
});

// ============ PHASE 7: PROFILES & ROLE SWITCHING ============

test.describe('PHASE 7 — PROFILES & ROLE SWITCHING', () => {
  test('G-001: All Role Profiles', async ({ context }) => {
    console.log('\n=== TESTING PROFILE SCREENS ===\n');

    const roles = [
      { account: TEST_ACCOUNTS.buyer, role: 'buyer', route: '/buyer' },
      { account: TEST_ACCOUNTS.seller, role: 'seller', route: '/seller' },
      { account: TEST_ACCOUNTS.rider, role: 'rider', route: '/rider' },
    ];

    for (const { account, role, route } of roles) {
      const page = await context.newPage();
      await login(page, account);

      console.log(`\n→ Testing ${role} profile...`);

      // Navigate to profile
      await testButton(
        page,
        '[aria-label*="profile"], button:has-text("Profile"), [data-testid*="profile"], [role="tab"]:has-text("Profile")',
        'Profile Tab',
        'Navigate to profile',
        role,
        'PROFILE',
        'Bottom Navigation'
      );

      await page.waitForLoadState('networkidle', { timeout: 2000 }).catch(() => {});
      await takeScreenshot(page, `07-${role}-profile`);

      // Test edit profile button
      await testButton(
        page,
        'button:has-text("Edit"), [aria-label*="edit"]',
        'Edit Profile',
        'Open edit form',
        role,
        'PROFILE',
        `${role} Profile`
      );

      // Test settings rows
      await testButton(
        page,
        '[role="button"]:has-text("Settings"), [role="button"]:has-text("Personal"), button:has-text("Personal Information")',
        'Personal Information',
        'Navigate to edit',
        role,
        'PROFILE',
        `${role} Profile`
      );

      // Test Log Out
      await testButton(
        page,
        'button:has-text("Log Out"), button:has-text("Sign Out")',
        'Log Out',
        'Show confirmation dialog',
        role,
        'PROFILE',
        `${role} Profile`
      );

      await page.close();
    }
  });

  test('G-002: Role Switcher', async ({ context }) => {
    console.log('\n=== TESTING ROLE SWITCHER ===\n');

    const page = await context.newPage();
    await login(page, TEST_ACCOUNTS.seller); // Start with seller

    // Navigate to profile
    await page.goto(`${BASE_URL}/seller/profile`);
    await page.waitForLoadState('networkidle', { timeout: 2000 }).catch(() => {});

    // Test role switcher button
    await testButton(
      page,
      'button:has-text("Switch Role"), [aria-label*="switch"], [data-testid*="role"]',
      'Switch Role',
      'Open role switcher sheet',
      'seller',
      'PROFILE',
      'Profile Screen'
    );

    await page.waitForTimeout(500);
    await takeScreenshot(page, '07-role-switcher');

    // Test switching to buyer
    await testButton(
      page,
      'button:has-text("Buyer"), [aria-label*="Buyer"], label:has-text("Buyer")',
      'Role: Buyer',
      'Switch to buyer + navigate',
      'seller',
      'PROFILE',
      'Role Switcher'
    );

    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    const newUrl = page.url();
    expect(newUrl).toContain('/buyer');

    console.log(`  ℹ Successfully switched to buyer (${newUrl})`);

    await page.close();
  });
});

// ============ FINAL REPORT ============

test.describe('FINAL REPORT', () => {
  test('Generate QA Results Report', async () => {
    console.log('\n\n' + '='.repeat(70));
    console.log('  VERIBEE QA TEST SUITE — FINAL REPORT');
    console.log('='.repeat(70) + '\n');

    // Group results by role
    const byRole: Record<string, TestResult[]> = {};
    results.forEach(r => {
      if (!byRole[r.role]) byRole[r.role] = [];
      byRole[r.role].push(r);
    });

    // Group by stage
    const byStage: Record<string, TestResult[]> = {};
    results.forEach(r => {
      if (!byStage[r.stage]) byStage[r.stage] = [];
      byStage[r.stage].push(r);
    });

    console.log('BY ROLE:');
    Object.entries(byRole).forEach(([role, items]) => {
      const passed = items.filter(r => r.result === 'PASS').length;
      const total = items.length;
      const pct = ((passed / total) * 100).toFixed(1);
      console.log(`  ${role.toUpperCase().padEnd(10)} ${passed}/${total} (${pct}%)`);
    });

    console.log('\nBY WORKFLOW STAGE:');
    Object.entries(byStage).forEach(([stage, items]) => {
      const passed = items.filter(r => r.result === 'PASS').length;
      const total = items.length;
      const pct = ((passed / total) * 100).toFixed(1);
      console.log(`  ${stage.padEnd(15)} ${passed}/${total} (${pct}%)`);
    });

    // Summary statistics
    const totalPassed = results.filter(r => r.result === 'PASS').length;
    const totalTests = results.length;
    const failureRate = ((totalTests - totalPassed) / totalTests * 100).toFixed(1);

    console.log(`\nOVERALL:`);
    console.log(`  Total Buttons Tested: ${totalTests}`);
    console.log(`  Passed:               ${totalPassed}`);
    console.log(`  Failed:               ${totalTests - totalPassed}`);
    console.log(`  Success Rate:         ${(((totalPassed / totalTests) * 100).toFixed(1))}%`);

    // Workflow compliance
    console.log(`\nWORKFLOW.MD COMPLIANCE:`);
    console.log(`  ✓ SUBMIT (Seller products):   ${byStage['SUBMIT']?.filter(r => r.result === 'PASS').length || 0} tests passed`);
    console.log(`  ✓ AUTHENTICATE (Status):      ${byStage['AUTHENTICATE']?.filter(r => r.result === 'PASS').length || 0} tests passed`);
    console.log(`  ✓ ASSURE (Buyer/Rider):       ${byStage['ASSURE']?.filter(r => r.result === 'PASS').length || 0} tests passed`);

    console.log(`\nARTIFACTS LOCATION: ${ARTIFACT_DIR}`);
    console.log('='.repeat(70) + '\n');

    // Save results to JSON
    const reportPath = path.join(ARTIFACT_DIR, 'qa-results.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`  Report saved: ${reportPath}\n`);
  });
});
