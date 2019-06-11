/**
 * Helper functions
 */
const sleepFunction = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = {
    API_URL: `https://vidi.alexshumilov.ru:8081/api`,
    // Base instance URL
    PAGE_URL_BASE: `https://vidi.alexshumilov.ru:8081/`,
    // Vidi instance with default template
    PAGE_URL_DEFAULT: `https://vidi.alexshumilov.ru:8081/app/aleksandrshumilov/public/#osm/13/39.2963/-6.8335/`,
    // Vidi instance that works with newest backend (swarm.gc2.tio testing:aDvvi9802dmosd)
    PAGE_URL_LATEST_GC2: `https://vidi.alexshumilov.ru:8086/app/testing/public/#osm/13/39.2963/-6.8335/`,
    // Vidi instance with default template without SSL
    PAGE_URL_DEFAULT_NO_SSL: `http://vidi.alexshumilov.ru:8084/app/aleksandrshumilov/public/#osm/13/39.2963/-6.8335/`,
    // Vidi instance with embedded template
    PAGE_URL_EMBEDDED: `https://vidi.alexshumilov.ru:8082/app/aleksandrshumilov/public/#osm/13/39.2963/-6.8335/`,
    PAGE_LOAD_TIMEOUT: 1000,
    EMULATED_SCREEN: {
        viewport: {
        width: 1920,
            height: 1080
        },
        userAgent: 'Puppeteer'
    },
    sleep: sleepFunction,
    duplicate: (target) => JSON.parse(JSON.stringify(target)),
    waitForPageToLoad: async (page) => {
        let loadedPage = new Promise((resolve, reject) => {
            page.on('console', async (msg) => {
                //console.log(msg.text());
                if (msg.text().indexOf(`Vidi is now loaded`) !== -1) {
                    await sleepFunction(1000);
                    resolve(page);
                } else if (msg.text().indexOf(`Limit of connection check attempts exceeded`) !== -1) {
                    reject(new Error(`Unable to load the page`));
                }
            });
        });
    
        return await loadedPage;
    },
    img: async (page, path = `./test.png`) => {
        await page.screenshot({ path });
    }
};