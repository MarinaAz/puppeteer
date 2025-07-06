const common = require("../../common");
const BasePageObject = require("../BasePageObject");

class DeleteExportModal extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)

        this.headerSelector = `h6`        
        this.buttonsSelector = `.bp4-dialog-footer button`
    }

    async assertAtPage() { 
        await common.waitForText(this.page, this.headerSelector, "Delete Export")
    }

    async clickButton(name) { 
        let buttonElement = await common.findElementInListHavingText(await this.page.$$(this.buttonsSelector), name)
        if(!buttonElement) { 
            throw new Error(`unable to find button ${name}`)
        }
        await buttonElement.click()
        await common.waitForTimeout(1000)
    }
}

module.exports = DeleteExportModal