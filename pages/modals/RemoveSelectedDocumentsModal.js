const common = require("../../common");
const BasePageObject = require("../BasePageObject");

class RemoveSelectedDocumentsModal extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)  
        
        this.headerSelector = `h6`
        this.buttonsSelector = `.bp4-dialog-footer-actions .bp4-button`
    }   

    async assertAtPage() { 
        await common.waitForText(this.page, this.headerSelector, "Remove Selected Documents")
    }

    async clickButton(buttonText) { 
        let buttonElement = await common.findElementInListHavingText(await this.page.$$(this.buttonsSelector), buttonText)
        if(!buttonElement) { 
            throw new Error(`unable to find button ${buttonText}`)
        }
        await buttonElement.click()
        await common.waitForTimeout(2000)
    }    

}

module.exports = RemoveSelectedDocumentsModal