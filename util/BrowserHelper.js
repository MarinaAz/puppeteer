const puppeteer = require('puppeteer')
const config = require('config')
const common = require("../common")
class BrowserHelper {
    constructor() {
        this.browser = null
        this.page = null
    }

    async init() { 
        //start and configure browser
        //this somtimes fails not resolving the domain. retry loop!
        await common.asyncRetryLoop(20, 1000, async () => {
            try {
                this.browser = await puppeteer.launch({
                    "headless": false,
                    "slowMo": 0,
                    "args": [
                        "--window-size=1600,768",
                        '--ignore-certificate-errors'
                    ]
                })  
    
                //configure page
                this.page = await this.browser.newPage()    
                await this.page.setViewport({
                    "width": 1600,
                    "height": 768
                })
    
                //drive to login page                
                await this.page.goto(config.get('url'))
                return true

            } catch (err) {
                await this.browser.close()
                return false
            }
        }, "unable to get to base url")
        
    }

    async destroy() {
        if(this.browser) {
           await this.browser.close()
        }
    }

}

module.exports = BrowserHelper