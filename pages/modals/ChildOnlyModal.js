const common = require("../../common");
const BasePageObject = require("../BasePageObject");

class ChildOnlyModal extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)

        this.headerSelector = `h6`
        this.createTagButtonSelector = `.ModifyFolderTagDialog .tags-list-header button`
        this.tagNamesSelector = `.tags-list .ag-center-cols-container .ag-row .ag-cell-value`
        this.tagRowSelector = `.tags-list .ag-center-cols-container .ag-row`
        this.checkboxSelector = `.ag-input-wrapper input`
        this.buttonsSelector = `.bp4-dialog-footer-actions button`

    }

    async assertAtPage() { 
        await common.waitForText(this.page, this.headerSelector, "Child only")
    }
    
    async clickCreateTagButton() {
        await common.clickSelector(this.page, this.createTagButtonSelector)
    }

    async getTagsList() {
        return await common.getTextOfElements(await this.page.$$(this.tagNamesSelector))
    }

    async _findTagRow(tagName) {
        await common.waitForText(this.page, this.tagNamesSelector, tagName)
        let tag = await common.findElementWithChildHavingText(this.page, this.tagRowSelector, this.tagNamesSelector, tagName)
        if(!tag) {
            throw new Error(`unable to locate a tag ${tag}`)
        }
        return tag
    }

    async selectTag(tagName) {
        let rowTag = await this._findTagRow(tagName)
        let element = await rowTag.$(this.checkboxSelector)
        await element.click()
        await common.waitForTimeout(500)
    }

    async clickButton(buttonText) { 
        let buttonElement = await common.findElementInListHavingText(await this.page.$$(this.buttonsSelector), buttonText)
        if(!buttonElement) { 
            throw new Error(`unable to find button ${buttonText}`)
        }
        await buttonElement.click()
        await common.waitForTimeout(500)
    }   

}

module.exports = ChildOnlyModal