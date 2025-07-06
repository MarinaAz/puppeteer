const common = require("../../common");
const BasePageObject = require("../BasePageObject");

class EditDeletionSetModal extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)

        this.headerSelector = `h6`
        this.nameSelector = `.bp4-form-group input[name="name"]`
        this.descSelector = `.bp4-form-group input[name="description"]`
        this.buttonsSelector = `.bp4-dialog-footer button`
    }   

    async assertAtPage() { 
        await common.waitForText(this.page, this.headerSelector, "Edit Deletion Set")

    }

    async typeName(name) {
        await common.typeIntoSelector(this.page, this.nameSelector, name)

    }

    async typeDescription(desc) { 
        await common.typeIntoSelector(this.page, this.descSelector, desc)
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

module.exports = EditDeletionSetModal