const { chromium } = require('playwright');

(async () => {
    console.log('Starting Playwright test...');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Collect console messages
    const consoleMessages = [];
    page.on('console', msg => {
        consoleMessages.push({ type: msg.type(), text: msg.text() });
    });

    // Collect page errors
    const pageErrors = [];
    page.on('pageerror', error => {
        pageErrors.push(error.message);
    });

    try {
        // Navigate to the app
        console.log('Navigating to http://127.0.0.1:5000...');
        await page.goto('http://127.0.0.1:5000', { waitUntil: 'networkidle', timeout: 30000 });
        console.log('Page loaded successfully!');

        // Check if key elements exist
        const title = await page.title();
        console.log('Page title:', title);

        const tweetInput = await page.$('#tweetInput');
        console.log('Tweet input found:', !!tweetInput);

        const submitBtn = await page.$('#submitBtn');
        console.log('Submit button found:', !!submitBtn);

        const feedStream = await page.$('#feedStream');
        console.log('Feed stream found:', !!feedStream);

        // Test typing and submitting a tweet
        console.log('\nTesting tweet submission...');
        await page.fill('#tweetInput', 'I love this amazing day!');
        
        // Check if button is enabled
        const isDisabled = await page.$eval('#submitBtn', btn => btn.disabled);
        console.log('Submit button enabled after typing:', !isDisabled);

        // Click submit
        await page.click('#submitBtn');
        
        // Wait for the tweet to appear
        await page.waitForSelector('.tweet', { timeout: 5000 });
        console.log('New tweet appeared in feed!');

        // Check for sentiment badge
        const sentimentBadge = await page.$('.sentiment-badge');
        if (sentimentBadge) {
            const badgeText = await sentimentBadge.textContent();
            console.log('Sentiment badge text:', badgeText);
        }

        // Print console messages
        console.log('\nConsole messages:');
        consoleMessages.forEach(msg => {
            console.log(`  [${msg.type}] ${msg.text}`);
        });

        // Print page errors
        if (pageErrors.length > 0) {
            console.log('\nPage errors:');
            pageErrors.forEach(err => console.log(`  ERROR: ${err}`));
        } else {
            console.log('\nNo page errors detected!');
        }

        console.log('\n✓ All tests passed!');

    } catch (error) {
        console.error('Test failed:', error.message);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
