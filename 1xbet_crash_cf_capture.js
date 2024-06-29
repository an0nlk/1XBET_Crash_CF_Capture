const puppeteer = require("puppeteer-extra");
const launch = require("./launch");
const fs = require('fs');
const wait = (ms) => new Promise(res => setTimeout(res, ms));

// Get WebSocket endpoint
async function getWsEndpoint() {
    console.log("Launching browser...");
    let wsEndpoint = await launch();
    console.log("WebSocket endpoint obtained:", wsEndpoint);
    return wsEndpoint;
}

(async () => {
    console.log("Starting script...");

    const browserWSEndpoint = await getWsEndpoint();
    console.log("Connecting to browser with WebSocket endpoint...");
    const browser = await puppeteer.connect({
        browserWSEndpoint,
        defaultViewport: null,
    });

    console.log("Opening new page...");
    let page = await browser.newPage();
    console.log("Navigating to the URL...");
    await page.goto("https://eg1xbet.com/ar/allgamesentrance/crash");

    const client = await page.target().createCDPSession();

    console.log("Enabling Network...");
    await client.send('Network.enable');

    client.on('Network.webSocketFrameReceived', ({ requestId, timestamp, response }) => {
        console.log("WebSocket frame received:", response);
        let payloadString = response.payloadData.toString('utf8');

        try {
            // Remove non-printable characters
            payloadString = payloadString.replace(/[^\x20-\x7E]/g, '');
            const payload = JSON.parse(payloadString);
            
            console.log("Parsed payload:", payload);

            // Check if payload is of the correct type and target
            if (payload.type === 1 && payload.target === "OnCrash") {
                const { l, f, ts } = payload.arguments[0];

                const csvData = `${ts},${f},${l}\n`;
                const txtData = `ts: ${ts}, f: ${f}, l: ${l}\n`;

                // Append to CSV
                fs.appendFile('data.csv', csvData, (err) => {
                    if (err) throw err;
                    console.log("Data appended to CSV:", csvData);
                });

                // Append to TXT
                fs.appendFile('data.txt', txtData, (err) => {
                    if (err) throw err;
                    console.log("Data appended to TXT:", txtData);
                });
            }
        } catch (error) {
            console.error('Error processing WebSocket frame:', error);
        }
    });

    console.log("Starting key press loop...");
    while (true) {
        console.log("Pressing 'Tab' key...");
        await page.keyboard.press("Tab");
        await wait(1000);
        console.log("Pressing 'ArrowDown' key...");
        await page.keyboard.press("ArrowDown");
        await wait(1000);
    }
})();
