const common = require("../../common");
const BasePageObject = require("../BasePageObject");

class DeleteFolderModal extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)

        this.headerSelector = `h6`
        this.deleteButtonSelector = `.bp4-dialog-footer-actions button[type="submit"]`

    }

    async assertAtPage() { 
        await common.waitForText(this.page, this.headerSelector, "Delete Folder")
    }

    async clickDeleteButton() { 
        await common.clickSelector(this.page, this.deleteButtonSelector)
        await common.waitForTimeout(500)
        await common.waitForTextToNotBePresent(this.page, this.headerSelector, "Delete Folder")
    }

}

module.exports = DeleteFolderModal