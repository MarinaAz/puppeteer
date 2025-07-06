const common = require("../../common");
const BasePageObject = require("../BasePageObject");

class DeleteSetModal extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)

        this.headerSelector = `h6`
        this.deleteButtonSelector = `.bp4-dialog-footer-actions button[type="submit"]`

    }

    async assertAtPage() { 
        await common.waitForText(this.page, this.headerSelector, "Delete")
    }

    async clickDeleteButton() { 
        await common.clickSelector(this.page, this.deleteButtonSelector)
        await common.waitForTextToNotBePresent(this.page, this.headerSelector, "Delete")
    }

}

module.exports = DeleteSetModal