const common = require("../../common");
const BasePageObject = require("../BasePageObject");

class ReleaseDocumentsComplexModal extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)  
        
        this.headerSelector = `h6`
        this.addACustodianLinkSelector = `.selected-list-header:nth-child(1) .bp4-minimal`
        this.custodianNameSelector = `.bp4-popover2-content li a div`
        this.addCustodianCircleButtonSelector = `.fa-plus-circle`
        this.closeButtonSelector = `.CloseablePanel .closeIcon`
        this.footerButtonsSelector = `.bp4-dialog-footer-actions button`

    }   

    async assertAtPage() { 
        await common.waitForText(this.page, this.headerSelector, "Release Documents")
    }

    async openAddACustodianList() {
        await common.clickSelector(this.page, this.addACustodianLinkSelector)
        await common.waitForTimeout(500)
    }

    async addCustodian(custodian) {
        await common.waitForFirst(this.page, this.custodianNameSelector, custodian)
        let menuItem = await common.findElementInListHavingText(await this.page.$$(this.custodianNameSelector), custodian)
        await menuItem.click()
        await common.waitForTimeout(500)
    }

    async closeAddACustodianList() {
        await common.clickSelector(this.page, this.closeButtonSelector)
        await common.waitForTimeout(1000)
    }

    async clickButton(buttonText) { 
        let buttonElement = await common.findElementInListHavingText(await this.page.$$(this.footerButtonsSelector), buttonText)
        if(!buttonElement) { 
            throw new Error(`unable to find button ${buttonText}`)
        }
        await buttonElement.click()
        await common.waitForTimeout(2000)
    }    

}

module.exports = ReleaseDocumentsComplexModal