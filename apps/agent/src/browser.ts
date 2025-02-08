import { chromium } from 'playwright';

// CookieEditor format
interface CookieEditorCookie {
  domain: string;
  expirationDate?: number;
  hostOnly?: boolean;
  httpOnly?: boolean;
  name: string;
  path: string;
  sameSite?: string;
  secure?: boolean;
  session?: boolean;
  value: string;
}

// Playwright format
interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  // Additional fields supported by Playwright
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  expires?: number;
}

function convertCookieEditorFormat(cookies: CookieEditorCookie[]): Cookie[] {
  console.log('🍪 Converting cookies');
  return cookies.map((cookie) => {
    // Always use .strava.com for Strava cookies
    const domain = cookie.domain.includes('strava.com')
      ? '.strava.com' // Force .strava.com for all Strava cookies
      : cookie.domain.startsWith('.')
        ? cookie.domain.slice(1)
        : cookie.domain;

    // Convert null sameSite to "Lax" for better compatibility
    const sameSite =
      cookie.sameSite?.toLowerCase() === 'no_restriction'
        ? 'None'
        : cookie.sameSite?.toLowerCase() === 'lax'
          ? 'Lax'
          : cookie.sameSite?.toLowerCase() === 'strict'
            ? 'Strict'
            : 'Lax'; // Default to Lax instead of None

    return {
      name: cookie.name,
      value: cookie.value,
      domain,
      path: cookie.path,
      secure: cookie.secure ?? true,
      httpOnly: cookie.httpOnly ?? true,
      sameSite: sameSite as 'Strict' | 'Lax' | 'None',
      // For session cookies, don't set expires
      expires: cookie.session ? undefined : cookie.expirationDate,
    };
  });
}

export async function capturePageWithCookies(
  url: string,
  cookies: CookieEditorCookie[] | Cookie[]
): Promise<Buffer> {
  console.log(`📸 Capturing ${url}`);

  const playwrightCookies =
    'hostOnly' in (cookies[0] || {})
      ? convertCookieEditorFormat(cookies as CookieEditorCookie[])
      : (cookies as Cookie[]);

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-site-isolation-trials',
      '--disable-web-security',
      '--disable-setuid-sandbox',
      '--no-sandbox',
      '--no-zygote',
      '--no-xshm',
      '--window-size=1920,1080',
      '--start-maximized',
    ],
  });

  try {
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false,
      javaScriptEnabled: true,
      bypassCSP: true,
      ignoreHTTPSErrors: true,
      permissions: ['geolocation'],
    });

    // Enhanced stealth scripts
    await context.addInitScript(() => {
      // Overwrite the navigator properties
      const overwriteProps = {
        webdriver: false,
        // Add common plugins
        plugins: [
          { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer' },
          {
            name: 'Chrome PDF Viewer',
            filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai',
          },
          { name: 'Native Client', filename: 'internal-nacl-plugin' },
        ],
        languages: ['en-US', 'en'],
        platform: 'MacIntel',
        hardwareConcurrency: 8,
        deviceMemory: 8,
        maxTouchPoints: 0,
        vendor: 'Google Inc.',
        connection: {
          effectiveType: '4g',
          rtt: 100,
          downlink: 10,
          saveData: false,
        },
      };

      // Apply all the overwrites
      Object.entries(overwriteProps).forEach(([prop, value]) => {
        if (value === false) {
          Object.defineProperty(navigator, prop, { get: () => undefined });
        } else {
          Object.defineProperty(navigator, prop, { get: () => value });
        }
      });

      // Override chrome runtime
      const win = window as any;
      win.chrome = {
        runtime: {},
        loadTimes: () => {},
        csi: () => {},
        app: {},
      };

      // Override permissions
      const nav = navigator as any;
      const originalQuery = nav.permissions.query;
      nav.permissions.query = (parameters: any) =>
        parameters.name === 'notifications'
          ? Promise.resolve({ state: Notification.permission })
          : originalQuery(parameters);
    });

    const page = await context.newPage();
    await context.addCookies(playwrightCookies);

    try {
      console.log('⏳ Loading page...');

      // First load with networkidle
      await page
        .goto(url, {
          waitUntil: 'networkidle',
          timeout: 30000,
        })
        .catch(() => {
          // If networkidle times out, we still continue
          console.log('⚠️ Initial load timeout, continuing...');
        });

      // Wait for either the title or the elevation profile
      console.log('⏳ Waiting for content...');
      await Promise.race([
        page.waitForSelector('#heading', { timeout: 20000 }),
        page.waitForSelector('#elevation-profile', { timeout: 20000 }),
      ]);

      // Small delay for dynamic content
      await page.waitForTimeout(1000);
    } catch (err) {
      const error = err as Error;
      console.error('❌ Page load failed:', error.message);
      throw error;
    }

    return await page.screenshot({
      fullPage: true,
      clip: { x: 0, y: 0, width: 1920, height: 1600 },
    });
  } catch (err) {
    const error = err as Error;
    console.error('❌ Capture failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}
