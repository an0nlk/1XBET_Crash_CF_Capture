const puppeteer = require('puppeteer-extra');
const launch = require('./launch');

(async () => {
    try{
        let wsEndpoint = await launch()
        console.log(wsEndpoint)
    }catch(e){
        console.error(e)
    }
})();