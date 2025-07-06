const common = require("../../common");
const BasePageObject = require("../BasePageObject");

class CreatePreservationSetModal extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)

        this.headerSelector = `h6`
        this.nameFieldSelector = `.bp4-form-group input[name="name"]`
        this.descFieldSelector = `.bp4-form-group input[name="description"]`
        this.selectSearchSelector = `.bp4-input-group input[placeholder="Select search"]`
        this.selectSearchOptionsSelector = `a .bp4-fill`
        this.savedSearchesFormInputSelector = `.bp4-input-group input[placeholder="Filter..."]`
        this.savedSearchesSearchButtonSelector = `.saved-search-query button[type="button"]`
        this.buttonsSelector = `.bp4-dialog-footer-actions button`
        this.prioritySelectSelector = `bp4-dialog-body .CollectionPrioritySelector`
    }

    async assertAtPage() { 
        await common.waitForText(this.page, this.headerSelector, "Create Preservation Set")
        await common.waitForTimeout(500)
    }

    async typeName(name) { 
        await common.typeIntoSelector(this.page, this.nameFieldSelector, name)
    }

    async typeDesc(desc) { 
        await common.typeIntoSelector(this.page, this.descFieldSelector, desc)
    }

    async selectPriority(priority) {
        await common.selectOptionByText(this.page, this.prioritySelectSelector, priority)
    }

    async openSelectSearch() {
        await common.clickSelector(this.page, this.selectSearchSelector)
        await common.waitForFirst(this.page, this.selectSearchOptionsSelector)
    }

    async searchForSavedSearches(search) {
        await common.typeIntoSelector(this.page, this.savedSearchesFormInputSelector, search)
        await common.waitForTimeout(1000)
        await this.page.keyboard.press('Enter')
        await common.waitForTimeout(1000)
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


module.exports = CreatePreservationSetModal