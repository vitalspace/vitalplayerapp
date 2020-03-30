const CDP = require('chrome-remote-interface');

(async function () {

    // you need to have a Chrome open with remote debugging enabled
    // ie. chrome --remote-debugging-port=9222
    const protocol = await CDP({port: 9222});

    const {Page, Network} = protocol;
    await Page.enable();
    await Network.enable(); // need this to call Network.getResponseBody below

    Page.navigate({url: 'https://adictosalatele.com/TV/latinos/fox-sports-premium/'}); // your URL

    const onDataReceived = async (e) => {
        try {
            let response = await Network.getResponseBody({requestId: e.requestId})
            if (typeof response.body === 'string') {
                console.log(response.body);
            }
        } catch (ex) {
            console.log(ex.message)
        }
    }

    protocol.on('Network.dataReceived', onDataReceived)
})();