const common = require("../../common");
const BasePageObject = require("../BasePageObject");

class ReleaseDocumentsModal extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)  
        
        this.headerSelector = `h6`
        this.buttonsSelector = `.bp4-dialog-footer button`

    }   

    async assertAtPage() { 
        await common.waitForText(this.page, this.headerSelector, "Release Documents")
    }

    async clickButton(buttonText) { 
        let buttonElement = await common.findElementInListHavingText(await this.page.$$(this.buttonsSelector), buttonText)
        if(!buttonElement) { 
            throw new Error(`unable to find button ${buttonText}`)
        }
        await buttonElement.click()
        await common.waitForTimeout(1000)
    }    

}

module.exports = ReleaseDocumentsModal