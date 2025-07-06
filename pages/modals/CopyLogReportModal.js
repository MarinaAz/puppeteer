const common = require("../../common");
const BasePageObject = require("../BasePageObject");

class CopyLogReportModal extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)

        this.headerSelector = `#reportTitle`  
        this.addCopyOrArchivePoliciesLinkSelector = `.ui-picker .ui-picker-prompt` 
        this.addCopyOrArchivePolicyRow = `.tree-row`  
        this.addCopyOrArchivePolicyLabel = `.tree-row .tree-label` 
        this.addCopyOrArchivePolicySelectButtonSelector = `.tree-select` 
        this.closeAddCopyOrArchivePolicyMenuSelector = `div[id*="policyFolderIdsFolderTablePicker"] .container-close` 
        this.buttonsSelector = `.button-group button`
    }

    async assertAtPage() { 
        await common.waitForText(this.page, this.headerSelector, "Copy Log Report")
    }

    async openAddCopyOrArchivePoliciesMenu() {
        await common.clickSelector(this.page,this.addCopyOrArchivePoliciesLinkSelector)
    }

    async addCopyOrArchivePolicies(policy) {
        await common.waitForText(this.page, this.addCopyOrArchivePolicyLabel, policy)
        let rowPolicy = await common.findElementWithChildHavingText(this.page, this.addCopyOrArchivePolicyRow, this.addCopyOrArchivePolicyLabel, policy)
        let element = await rowPolicy.$(this.addCopyOrArchivePolicySelectButtonSelector)
        await element.hover()
        let checkedCircle = await element.boundingBox()
        await this.page.mouse.click(checkedCircle.x+10, checkedCircle.y+10)
        await common.waitForTimeout(500)
        await common.clickSelector(this.page, this.closeAddCopyOrArchivePolicyMenuSelector)
    }

    async clickButton(name) { 
        let buttonElement = await common.findElementInListHavingText(await this.page.$$(this.buttonsSelector), name)
        if(!buttonElement) { 
            throw new Error(`unable to find button ${name}`)
        }
        await buttonElement.click()
        await common.waitForTimeout(3000)
    }
}

module.exports = CopyLogReportModal