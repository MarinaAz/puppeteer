const common = require("../../common")
const BasePageObject = require("../BasePageObject")

class TestDirectoryServiceConfigurationModal extends BasePageObject {
    constructor(browser, page) {
        super(browser, page)    

        this.presentSelector = `.TestConnectionDialog`
        this.closeButtonSelector = `.TestConnectionDialog .bp4-dialog-footer-actions button:nth-child(2)`
    }

    async assertAtPage() { 
        await common.waitForFirst(this.page, this.presentSelector)
        //and a bit more cause status updates
        await common.waitForTimeout(1000)
    }

    async getModalText() { 
        return await common.getTextOfElement(await this.page.$(this.presentSelector))
    }

    async clickCloseButton() { 
        await common.clickSelector(this.page, this.closeButtonSelector)
        await common.waitForNone(this.page, this.presentSelector)
    }

}

module.exports = TestDirectoryServiceConfigurationModal