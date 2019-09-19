/**
 * Testing layerTree module
 */

const { expect } = require("chai");
const helpers = require("./../../helpers");

describe('Layer tree common', () => {
    it(`should keep offline mode settings for layers after page reload`, async () => {
        let page = await browser.newPage();
        await page.goto(helpers.PAGE_URL_DEFAULT + `v:public.test`);
        await page.emulate(helpers.EMULATED_SCREEN);
        page = await helpers.waitForPageToLoad(page);

        await page.evaluate(`$('[href="#layer-content"]').trigger('click')`);
        await page.evaluate(`$('[href="#collapseUHVibGljIGdyb3Vw"]').trigger('click')`);
        await helpers.sleep(8000);

        expect(await page.evaluate(`$('#layers').find('.js-app-is-online-badge').hasClass('hidden');`)).to.be.false;
        expect(await page.evaluate(`$('#layers').find('.js-app-is-offline-badge').hasClass('hidden');`)).to.be.true;
        expect(await page.evaluate(`$('[data-gc2-layer-key="public.test_point_no_type.the_geom"]').find('.js-set-online').is(':visible')`)).to.be.false;
        expect(await page.evaluate(`$('[data-gc2-layer-key="public.test_point_no_type.the_geom"]').find('.js-set-offline').is(':visible')`)).to.be.false;
        expect(await page.evaluate(`$('[data-gc2-layer-key="public.test_line.the_geom"]').find('.js-set-online').prop('disabled')`)).to.be.true;
        expect(await page.evaluate(`$('[data-gc2-layer-key="public.test_line.the_geom"]').find('.js-set-offline').prop('disabled')`)).to.be.true;
        expect(await page.evaluate(`$('[data-gc2-layer-key="public.test.the_geom"]').find('.js-set-online').prop('disabled')`)).to.be.true;
        expect(await page.evaluate(`$('[data-gc2-layer-key="public.test.the_geom"]').find('.js-set-offline').prop('disabled')`)).to.be.false;
        expect(await page.evaluate(`$('[data-gc2-layer-key="public.test.the_geom"]').find('.js-refresh').prop('disabled')`)).to.be.true;
        await helpers.sleep(1000);

        await page.evaluate(`$('[data-gc2-layer-key="public.test_point_no_type.the_geom"]').find('.js-set-offline').trigger('click')`);
        await page.evaluate(`$('[data-gc2-layer-key="public.test.the_geom"]').find('.js-set-offline').trigger('click')`);
        await helpers.sleep(2000);
        await helpers.img(page);

        // Reload page
        await page.reload(helpers.PAGE_LOAD_TIMEOUT);
        page = await helpers.waitForPageToLoad(page);
        
        await page.evaluate(`$('[href="#layer-content"]').trigger('click')`);
        await page.evaluate(`$('[href="#collapseUHVibGljIGdyb3Vw"]').trigger('click')`);
        await helpers.sleep(4000);

        expect(await page.evaluate(`$('#layers').find('.js-app-is-online-badge').hasClass('hidden');`)).to.be.false;
        expect(await page.evaluate(`$('#layers').find('.js-app-is-offline-badge').hasClass('hidden');`)).to.be.true;
        expect(await page.evaluate(`$('[data-gc2-layer-key="public.test_point_no_type.the_geom"]').find('.js-set-online').is(':visible')`)).to.be.false;
        expect(await page.evaluate(`$('[data-gc2-layer-key="public.test_point_no_type.the_geom"]').find('.js-set-offline').is(':visible')`)).to.be.false;
        expect(await page.evaluate(`$('[data-gc2-layer-key="public.test_line.the_geom"]').find('.js-set-online').prop('disabled')`)).to.be.true;
        expect(await page.evaluate(`$('[data-gc2-layer-key="public.test_line.the_geom"]').find('.js-set-offline').prop('disabled')`)).to.be.true;
        expect(await page.evaluate(`$('[data-gc2-layer-key="public.test.the_geom"]').find('.js-set-online').prop('disabled')`)).to.be.false;
        expect(await page.evaluate(`$('[data-gc2-layer-key="public.test.the_geom"]').find('.js-set-offline').prop('disabled')`)).to.be.true;
        expect(await page.evaluate(`$('[data-gc2-layer-key="public.test.the_geom"]').find('.js-refresh').prop('disabled')`)).to.be.false;

        await page.close();
    });

    it(`should allow loading vector layers in both dynamic and static mode`, async () => {
        let page = await browser.newPage();
        await page.goto(helpers.PAGE_URL_DEFAULT + `v:public.test`);
        await page.emulate(helpers.EMULATED_SCREEN);
        page = await helpers.waitForPageToLoad(page);

        await page.evaluate(`$('[href="#layer-content"]').trigger('click')`);
        await page.evaluate(`$('[href="#collapseUHVibGljIGdyb3Vw"]').trigger('click')`);
        await helpers.sleep(1000);
        await page.evaluate(`$('[data-gc2-layer-key="public.test.the_geom"]').find('.js-toggle-load-strategy').trigger('click')`)
        await helpers.sleep(1000);

        let layerWasRequestedDynamically = false;
        await page.setRequestInterception(true);
        page.on('request', interceptedRequest => {
            if (interceptedRequest.url().indexOf(`api/sql/aleksandrshumilov`) !== -1) {
                if (Buffer.from(interceptedRequest._postData.split(`&`)[0].split(`=`)[1], 'base64').toString().indexOf(`ST_Transform(ST_MakeEnvelope`) !== -1) {
                    layerWasRequestedDynamically = true;
                } else {
                    layerWasRequestedDynamically = false;
                }
            }

            interceptedRequest.continue();
        });

        // Enable dynamic load
        await page.evaluate(`$('[data-gc2-layer-key="public.test.the_geom"]').find('.js-layer-settings-load-strategy').find('input').trigger('click')`);
        await helpers.sleep(2000);
        expect(layerWasRequestedDynamically).to.be.true;

        // Disable dynamic load
        await page.evaluate(`$('[data-gc2-layer-key="public.test.the_geom"]').find('.js-layer-settings-load-strategy').find('input').trigger('click')`);
        await helpers.sleep(2000);
        expect(layerWasRequestedDynamically).to.be.false;
    });

    it(`pulls layer data from cache if the vector is set to be offline, pulls data from server if it is not`, async () => {
        let page = await browser.newPage();
        await page.goto(helpers.PAGE_URL_DEFAULT + `v:public.test`);
        await page.emulate(helpers.EMULATED_SCREEN);
        page = await helpers.waitForPageToLoad(page);

        await page.evaluate(`$('[href="#layer-content"]').trigger('click')`);
        await page.evaluate(`$('[href="#collapseUHVibGljIGdyb3Vw"]').trigger('click')`);
        await helpers.sleep(8000);

        expect(await page.evaluate(`$('[data-gc2-layer-key="public.test.the_geom"]').find('.js-set-online').prop('disabled')`)).to.be.true;
        expect(await page.evaluate(`$('[data-gc2-layer-key="public.test.the_geom"]').find('.js-set-offline').prop('disabled')`)).to.be.false;
        await helpers.sleep(1000);

        await page.evaluate(`navigator.serviceWorker.addEventListener('message', event => {
            console.log('Service worker reports: ' + event.data.msg);
        });`);

        let requestWasServedFromSWCache = false;
        page.on('console', async (msg) => {
            if (msg.text().indexOf(`RESPONSE_CACHED_DUE_TO_OFFLINE_MODE_SETTINGS`) !== -1) {
                requestWasServedFromSWCache = true;
            }
        });

        await page.evaluate(`$('[data-gc2-layer-key="public.test.the_geom"]').find('.check').trigger('click')`);
        await helpers.sleep(1000);
        await page.evaluate(`$('[data-gc2-layer-key="public.test.the_geom"]').find('.check').trigger('click')`);
        await helpers.sleep(2000);

        expect(requestWasServedFromSWCache).to.be.false;

        requestWasServedFromSWCache = false;

        await page.evaluate(`$('[data-gc2-layer-key="public.test.the_geom"]').find('.js-set-offline').trigger('click')`);
        await helpers.sleep(3000);

        await page.evaluate(`$('[data-gc2-layer-key="public.test.the_geom"]').find('.check').trigger('click')`);
        await helpers.sleep(1000);
        await page.evaluate(`$('[data-gc2-layer-key="public.test.the_geom"]').find('.check').trigger('click')`);
        await helpers.sleep(2000);

        expect(requestWasServedFromSWCache).to.be.true;

        requestWasServedFromSWCache = false;
        await page.evaluate(`$('[data-gc2-layer-key="public.test.the_geom"]').find('.js-set-online').trigger('click')`);
        await helpers.sleep(3000);

        await page.evaluate(`$('[data-gc2-layer-key="public.test.the_geom"]').find('.check').trigger('click')`);
        await helpers.sleep(1000);
        await page.evaluate(`$('[data-gc2-layer-key="public.test.the_geom"]').find('.check').trigger('click')`);
        await helpers.sleep(2000);

        expect(requestWasServedFromSWCache).to.be.false;

        await page.close();
    });

    it(`uses Service worker API in order to control offline mode settings for layers`, async () => {
        let page = await browser.newPage();
        await page.goto(helpers.PAGE_URL_DEFAULT + `v:public.test`);
        await page.emulate(helpers.EMULATED_SCREEN);
        page = await helpers.waitForPageToLoad(page);

        await page.evaluate(`$('[href="#layer-content"]').trigger('click')`);
        await page.evaluate(`$('[href="#collapseUHVibGljIGdyb3Vw"]').trigger('click')`);
        await helpers.sleep(2000);

        const requestServiceWorkerAboutCachedLayers = () => {
            return new Promise((resolve, reject) => {
                var messageChannel = new MessageChannel();
                messageChannel.port1.onmessage = (event) => {
                    resolve(JSON.stringify(event.data));
                };
        
                navigator.serviceWorker.controller.postMessage({ action: `getListOfCachedRequests` }, [messageChannel.port2]);
            });
        };

        let reply = JSON.parse(await page.evaluate(requestServiceWorkerAboutCachedLayers)).pop();
        await helpers.sleep(2000);
        expect(reply.layerKey).to.equal(`public.test`);
        expect(reply.offlineMode).to.equal(false);
        
        await page.evaluate(`$('[data-gc2-layer-key="public.test.the_geom"]').find('.js-set-offline').trigger('click')`);
        await helpers.sleep(3000);

        reply = JSON.parse(await page.evaluate(requestServiceWorkerAboutCachedLayers)).pop();
        await helpers.sleep(2000);
        expect(reply.layerKey).to.equal(`public.test`);
        expect(reply.offlineMode).to.equal(true);
    });

    it(`refreshes the vector layer in offline mode`, async () => {
        let page = await browser.newPage();
        await page.goto(helpers.PAGE_URL_DEFAULT + `v:public.test`);
        await page.emulate(helpers.EMULATED_SCREEN);
        page = await helpers.waitForPageToLoad(page);

        await page.evaluate(`$('[href="#layer-content"]').trigger('click')`);
        await page.evaluate(`$('[href="#collapseUHVibGljIGdyb3Vw"]').trigger('click')`);
        await helpers.sleep(2000);

        await page.evaluate(`$('[data-gc2-layer-key="public.test.the_geom"]').find('.js-set-offline').trigger('click')`);
        await helpers.sleep(3000);

        expect(await page.evaluate(`$('[data-gc2-layer-key="public.test.the_geom"]').find('.js-refresh').prop('disabled')`)).to.be.false;

        // Accepting dialog windows
        page.on('dialog', (dialog) => {
            dialog.accept();
        });

        let layerWasRequested = false;
        await page.setRequestInterception(true);
        page.on('request', interceptedRequest => {
            if (interceptedRequest.url().indexOf(`api/sql/aleksandrshumilov`) !== -1) {
                layerWasRequested = true;
            }

            interceptedRequest.continue();
        });

        await page.evaluate(`$('[data-gc2-layer-key="public.test.the_geom"]').find('.js-refresh').trigger('click')`);
        await helpers.sleep(3000);

        expect(layerWasRequested).to.equal(true);
    });

    it('should load layers from page URL from same schema', async () => {
        let page = await browser.newPage();
        await page.goto(`${helpers.PAGE_URL_EMBEDDED}v:public.test,public.test_poly`);
        page = await helpers.waitForPageToLoad(page);

        await page.click(`#burger-btn`);
        await helpers.sleep(1000);
        await page.evaluate(`$('[href="#collapseUHVibGljIGdyb3Vw"]').trigger('click')`);
        await helpers.sleep(1000);

        expect(await page.evaluate(`$('input[data-gc2-id="public.test"][class="js-show-layer-control"]').length`)).to.equal(1);
        expect(await page.evaluate(`$('input[data-gc2-id="public.test"][class="js-show-layer-control"]').is(':checked')`)).to.be.true;
        expect(await page.evaluate(`$('input[data-gc2-id="public.test_line"][class="js-show-layer-control"]').length`)).to.equal(1);
        expect(await page.evaluate(`$('input[data-gc2-id="public.test_line"][class="js-show-layer-control"]').is(':checked')`)).to.be.false;
        expect(await page.evaluate(`$('input[data-gc2-id="public.test_poly"][class="js-show-layer-control"]').length`)).to.equal(1);
        expect(await page.evaluate(`$('input[data-gc2-id="public.test_poly"][class="js-show-layer-control"]').is(':checked')`)).to.be.true;

        await page.close();
    });

    it('should load layers from page URL from different schemas', async () => {
        let page = await browser.newPage();
        await page.goto(`${helpers.PAGE_URL_EMBEDDED}test.polygon,public.urbanspatial_dar_es_salaam_luse_2002,public.test_poly,v:public.test,v:public.test_line`);
        page = await helpers.waitForPageToLoad(page);

        await page.click(`#burger-btn`);
        await helpers.sleep(1000);
        await page.evaluate(`$('[href="#collapseUHVibGljIGdyb3Vw"]').trigger('click')`);
        await helpers.sleep(1000);
        await page.evaluate(`$('[href="#collapseRGFyIGVzIFNhbGFhbSBMYW5kIFVzZSBhbmQgSW5mb3JtYWwgU2V0dGxlbWVudCBEYXRhIFNldA"]').trigger('click')`);
        await helpers.sleep(1000);
        await page.evaluate(`$('[data-gc2-subgroup-id="Urban spatial development 1"]').find('.js-subgroup-toggle-button').first().trigger('click')`);
        await helpers.sleep(1000);

        expect(await page.evaluate(`$('input[data-gc2-id="test.polygon"]').length`)).to.equal(1);
        expect(await page.evaluate(`$('input[data-gc2-id="test.polygon"]').is(':checked')`)).to.be.true;
        expect(await page.evaluate(`$('input[data-gc2-id="public.test"]').length`)).to.equal(1);
        expect(await page.evaluate(`$('input[data-gc2-id="public.test"]').is(':checked')`)).to.be.true;
        expect(await page.evaluate(`$('input[data-gc2-id="public.test_line"]').length`)).to.equal(1);
        expect(await page.evaluate(`$('input[data-gc2-id="public.test_line"]').is(':checked')`)).to.be.true;
        expect(await page.evaluate(`$('input[data-gc2-id="public.test_point_no_type"]').length`)).to.equal(1);
        expect(await page.evaluate(`$('input[data-gc2-id="public.test_point_no_type"]').is(':checked')`)).to.be.false;
        expect(await page.evaluate(`$('input[data-gc2-id="public.urbanspatial_dar_es_salaam_luse_2002"][class="js-show-layer-control"]').length`)).to.equal(1);
        expect(await page.evaluate(`$('input[data-gc2-id="public.urbanspatial_dar_es_salaam_luse_2002"][class="js-show-layer-control"]').is(':checked')`)).to.be.true;
        expect(await page.evaluate(`$('input[data-gc2-id="public.test_poly"][class="js-show-layer-control"]').length`)).to.equal(1);
        expect(await page.evaluate(`$('input[data-gc2-id="public.test_poly"][class="js-show-layer-control"]').is(':checked')`)).to.be.true;

        // Check if the panel for different schema was drawn as well
        expect(await page.evaluate(`$('#layers_list').find('.accordion-toggle').eq(0).text()`)).to.equal(`Test group`);
        expect(await page.evaluate(`$('#layers_list').find('.accordion-toggle').eq(1).text()`)).to.equal(`Dar es Salaam Land Use and Informal Settlement Data Set`);
        expect(await page.evaluate(`$('#layers_list').find('.accordion-toggle').eq(2).text()`)).to.equal(`Public group`);
        expect(await page.evaluate(`$('#layers_list').find('.accordion-toggle').eq(3).text()`)).to.equal(`Snapping`);
        expect(await page.evaluate(`$('#layers_list').find('.accordion-toggle').eq(4).text()`)).to.equal(`Dynamic load test`);

        await page.close();
    });

    it('should load vector and tile layers', async () => {
        let page = await browser.newPage();
        await page.goto(helpers.PAGE_URL_EMBEDDED);
        page = await helpers.waitForPageToLoad(page);

        await page.click(`#burger-btn`);
        await page.evaluate(`$('[href="#collapseUHVibGljIGdyb3Vw"]').trigger('click')`);
        await helpers.sleep(1000);

        await page._client.send('Network.enable');

        let apiWasRequested = false;
        await page._client.on('Network.requestWillBeSent', event => {
            if (event.request.url.indexOf(`/api/legend/aleksandrshumilov?l=v:public.test&db=aleksandrshumilov`) !== -1) {
                apiWasRequested = true;
            }
        });

        await page.evaluate(`$('[data-gc2-layer-key="public.test.the_geom"]').find('[type="checkbox"]').trigger('click')`);
        expect(await page.evaluate(`$('[data-gc2-layer-key="public.test.the_geom"]').find('[type="checkbox"]').prop('checked')`)).to.be.true;
        expect(apiWasRequested).to.be.true;
        await helpers.sleep(2000);

        let tilesWereRequested = false;
        await page._client.on('Network.requestWillBeSent', event => {
            if (event.request.url.indexOf(`service=WMS&request=GetMap&version=1.1.1&layers=public.test_poly`) !== -1) {
                tilesWereRequested = true;
            }
        });

        await page.evaluate(`$('[data-gc2-layer-key="public.test_poly.the_geom"]').find('[type="checkbox"]').trigger('click')`);
        await helpers.sleep(2000);
        expect(tilesWereRequested).to.be.true;

        await page.close();
    });

    it('should load vector layers', async () => {
        let page = await browser.newPage();
        await page.goto(helpers.PAGE_URL_EMBEDDED);
        page = await helpers.waitForPageToLoad(page);

        await page.click(`#burger-btn`);
        await page.evaluate(`$('[href="#collapseUHVibGljIGdyb3Vw"]').trigger('click')`);
        await helpers.sleep(1000);
        await page._client.send('Network.enable');

        let apiWasRequested = false;
        await page._client.on('Network.requestWillBeSent', event => {
            if (event.request.url.indexOf(`/api/legend/aleksandrshumilov?l=v:public.test_line&db=aleksandrshumilov`) !== -1) {
                apiWasRequested = true;
            }
        });

        await page.evaluate(`$('[data-gc2-layer-key="public.test_line.the_geom"]').find('.js-show-layer-control').trigger('click')`);
        expect(apiWasRequested).to.be.true;

        await page.close();
    });

    it('should load tile layers', async () => {
        let page = await browser.newPage();
        await page._client.send('Network.enable');

        let tilesWereRequested = false;
        await page._client.on('Network.requestWillBeSent', event => {
            if (event.request.url.indexOf(`service=WMS&request=GetMap&version=1.1.1&layers=public.test_poly`) !== -1) {
                tilesWereRequested = true;
            }
        });

        await page.goto(helpers.PAGE_URL_EMBEDDED);
        page = await helpers.waitForPageToLoad(page);

        await page.click(`#burger-btn`);
        await page.evaluate(`$('[href="#collapseUHVibGljIGdyb3Vw"]').trigger('click')`);
        await helpers.sleep(1000);
        await page.evaluate(`$('[data-gc2-layer-key="public.test_poly.the_geom"]').find('.check').trigger('click')`);
        expect(tilesWereRequested).to.be.true;

        await page.close();
    });

    it('should keep layer and layer group order', async () => {
        let page = await browser.newPage();
        await page.goto(helpers.PAGE_URL_EMBEDDED);
        await page.emulate(helpers.EMULATED_SCREEN);
        page = await helpers.waitForPageToLoad(page);
        await page.click(`#burger-btn`);
        await helpers.sleep(1000);

        expect(await page.evaluate(`$('#layer-slide').find('[data-toggle="collapse"]').eq(0).text()`)).to.equal(`Dar es Salaam Land Use and Informal Settlement Data Set`);
        expect(await page.evaluate(`$('#layer-slide').find('[data-toggle="collapse"]').eq(1).text()`)).to.equal(`Public group`);
        expect(await page.evaluate(`$('#layer-slide').find('[data-toggle="collapse"]').eq(2).text()`)).to.equal(`Snapping`);
        expect(await page.evaluate(`$('#layer-slide').find('[data-toggle="collapse"]').eq(3).text()`)).to.equal(`Dynamic load test`);

        let e = await page.$('#layer-panel-UHVibGljIGdyb3Vw .layer-move-vert');
        let box = await e.boundingBox();
        let x = box.x + box.width / 2;
        let y = box.y + box.height / 2;
        await page.mouse.move(x, y);
        await page.mouse.down();
        await page.mouse.move(x, y + 50);
        await helpers.sleep(100);
        await page.mouse.move(x, y + 55);
        await page.mouse.move(x, y + 50);
        await page.mouse.move(x, y + 55);
        await page.mouse.move(x, y + 50);
        await page.mouse.up();
        await page.mouse.click(1, 1);
        await helpers.sleep(1000);

        await page.reload();
        page = await helpers.waitForPageToLoad(page);
        await helpers.sleep(1000);

        expect(await page.evaluate(`$('#layer-slide').find('[data-toggle="collapse"]').eq(0).text()`)).to.equal(`Dar es Salaam Land Use and Informal Settlement Data Set`);
        expect(await page.evaluate(`$('#layer-slide').find('[data-toggle="collapse"]').eq(1).text()`)).to.equal(`Snapping`);
        expect(await page.evaluate(`$('#layer-slide').find('[data-toggle="collapse"]').eq(2).text()`)).to.equal(`Public group`);
        expect(await page.evaluate(`$('#layer-slide').find('[data-toggle="collapse"]').eq(3).text()`)).to.equal(`Dynamic load test`);

        await page.close();
    });
});
