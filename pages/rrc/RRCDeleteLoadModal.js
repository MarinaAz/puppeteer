const common = require("../../common");
const BasePageObject = require("../BasePageObject");

class DeleteLoadModal extends BasePageObject { 
    constructor(browser,page) { 
        super(browser, page);

        this.headerSelector = `delete-load-dialog h4`
        this.loadNameInputSelector = `delete-load-dialog mat-form-field input`
        this.buttonsSelector = `base-dialog-footer button .mdc-button__label`
        this.progressBarSelector = '.progress-bar'
    }

    async assertAtPage() {
        await common.waitForText(this.page, this.headerSelector, "Delete Load")
        await common.waitForTimeout(200)
    }

    async typeLoadName(name) {
        await common.typeIntoSelector(this.page, this.loadNameInputSelector, name)
    }

    async clickButton(buttonText) { 
        let buttonElement = await common.findElementInListHavingText(await this.page.$$(this.buttonsSelector), buttonText)
        if(!buttonElement) { 
            throw new Error(`unable to find button ${buttonText}`)
        }
        await buttonElement.click()
        await common.waitForTimeout(3000)
    }  

    async waitForProgressBarToBe(expectedText, timeout = 20000) { 
        await common.waitForText(this.page, this.progressBarSelector, expectedText, timeout, true)
    }
}

module.exports = DeleteLoadModal