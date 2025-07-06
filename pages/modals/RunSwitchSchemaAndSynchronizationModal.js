const common = require("../../common");
const BasePageObject = require("../BasePageObject");

class RunSwitchSchemaAndSynchronizationModal extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)    

        this.headerSelector = `.bp4-dialog-header h6`
        this.runButtonsSelector = `.bp4-dialog-footer-actions .bp4-button`
        
    }

    async assertAtPage() { 
        await common.waitForText(this.page, this.headerSelector, "Run Switch Schema and Synchronization")        
    }

    async clickRunButton() { 
        await common.clickSelector(this.page, this.runButtonsSelector)
        await common.waitForTimeout(1000)
        //there are some hidden buttons on this modal. find the one that says 'ok' 
        // await common.waitForFirst(this.page, this.buttonsSelector)
        // let runButtonElement = await common.findElementInListHavingText(await this.page.$$(this.buttonsSelector), "Run")
        // await runButtonElement.click()        
    }

}

module.exports = RunSwitchSchemaAndSynchronizationModal