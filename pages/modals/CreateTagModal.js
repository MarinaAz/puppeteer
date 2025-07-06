const common = require("../../common");
const BasePageObject = require("../BasePageObject");

class CreateTagModal extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)

        this.headerSelector = `h6`
        this.nameSelector = `.bp4-form-group input[placeholder="Required"]`
        this.selectSearchSelector = `.bp4-input-group input[placeholder="Select search"]`
        this.savedSearchesFormInputSelector = `.bp4-input-group input[placeholder="Filter..."]`
        this.buttonsSelector = `.bp4-dialog-footer-actions button`

    }

    async assertAtPage() { 
        await common.waitForText(this.page, this.headerSelector, "Create Tag")
    }
    
    async typeName(name) {
        await common.typeIntoSelector(this.page, this.nameSelector, name)
    }

    async openSelectSearch() {
        await common.clickSelector(this.page, this.selectSearchSelector)
        await common.waitForTimeout(1000)
    }

    async searchForSavedSearches(search) {
        await common.typeIntoSelector(this.page, this.savedSearchesFormInputSelector, search)
        await common.waitForTimeout(1000)
        await this.page.keyboard.press('Enter')
        await common.waitForTimeout(1000)
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

module.exports = CreateTagModal