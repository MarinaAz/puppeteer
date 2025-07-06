const common = require("../../common");
const BasePageObject = require("../BasePageObject");

class CreateDeletionSetModal extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)

        this.headerSelector = `h6`
        this.nameFieldSelector = `.bp4-form-group input[name="name"]`
        this.descFieldSelector = `.bp4-form-group input[name="description"]`
        this.overridePreservationsCheckboxSelector = `#override-preservations-checkbox`
        this.addFullContainersCheckboxSelector = `#add-full-containers-checkbox`

        this.buttonsSelector = `.bp4-dialog-footer-actions button`
    }

    async assertAtPage() { 
        await common.waitForText(this.page, this.headerSelector, "Create Deletion Set")
        await common.waitForTimeout(500)
    }

    async typeName(name) { 
        await common.typeIntoSelector(this.page, this.nameFieldSelector, name)
    }

    async typeDesc(desc) { 
        await common.typeIntoSelector(this.page, this.descFieldSelector, desc)
    }

    async checkOverridePreservationsCheckbox() {
        await common.clickSelector(this.page, this.overridePreservationsCheckboxSelector)
        await common.waitForTimeout(500)
    }

    async checkAddFullContainersCheckbox() {
        await common.clickSelector(this.page, this.addFullContainersCheckboxSelector)
        await common.waitForTimeout(500)
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


module.exports = CreateDeletionSetModal