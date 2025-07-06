const common = require("../../common");
const BasePageObject = require("../BasePageObject");

class CreateExportModal extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)

        this.headerSelector = `h6`
        this.nameFieldSelector = `.bp4-form-group input[name="name"]`
        this.descFieldSelector = `.bp4-form-group input[name="description"]`
        this.selectSearchSelector = `.bp4-input-group input[placeholder="Select search"]`
        this.selectOptionsSelector = `a .bp4-fill`
        this.savedSearchesFormInputSelector = `.saved-search-selector input`
        this.savedSearchesSearchButtonSelector = `.saved-search-query button[type="button"]`
        this.selectEndpointSelector = `.bp4-input-group input[placeholder="Select endpoint (Required)"]`
        this.buttonsSelector = `.bp4-dialog-footer-actions button`
    }

    async assertAtPage() { 
        await common.waitForText(this.page, this.headerSelector, "Create Export")
        await common.waitForTimeout(2000)
    }

    async typeName(name) { 
        await common.typeIntoSelector(this.page, this.nameFieldSelector, name)
    }

    async typeDesc(desc) { 
        await common.typeIntoSelector(this.page, this.descFieldSelector, desc)
    }

    // search
    async openSelectSearch() {
        await common.clickSelector(this.page, this.selectSearchSelector)
        await common.waitForFirst(this.page, this.selectOptionsSelector)
    }

    async searchForSavedSearches(search) {
        await common.typeIntoSelector(this.page, this.savedSearchesFormInputSelector, search)
        await common.waitForTimeout(1000)
        await this.page.keyboard.press('Enter')
        await common.waitForTimeout(1000)
    }

    async addSelectedItem(search) {
        await common.waitForFirst(this.page, this.selectOptionsSelector)
        let opt = await common.findElementInListHavingText(await this.page.$$(this.selectOptionsSelector), search)
        if(!opt) {
            throw new Error(`unable to find ${opt}`)
        }
        await common.scrollElementIntoView(this.page, opt)
        await opt.click()
    }

    // endpoint
    async openSelectEndpoint() {
        await common.clickSelector(this.page, this.selectEndpointSelector)
        await common.waitForFirst(this.page, this.selectOptionsSelector)
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


module.exports = CreateExportModal