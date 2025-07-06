const common = require("../../common");
const BasePageObject = require("../BasePageObject");

class ProjectDeletionReportModal extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)

        this.headerSelector = `#reportTitle`  

        this.projectDeletionReportOptionTabSelector = `.report-tab ul li a em`
        this.addPoliciesLinkSelector = `[id*=policyFolderIdsFolderTablePicker] a.ui-picker-prompt` 
        this.addPolicyRow = `.tree-row`  
        this.addPolicyLabel = `.tree-row .tree-label` 
        this.addPolicySelectButtonSelector = `.tree-select` 
        this.closeAddPolicyMenuSelector = `div[id*="policyFolderIdsFolderTablePicker"] .container-close` 
        this.buttonsSelector = `.button-group button`
    }

    async assertAtPage() { 
        await common.waitForText(this.page, this.headerSelector, "Project Deletion Report")
    }

    async clickOptionTab(tab) {
        let tabName = await common.findElementInListHavingText(await this.page.$$(this.projectDeletionReportOptionTabSelector), tab)
        if(!tabName) {
            throw new Error(`unable to find tab ${tab}`)
        }
        await tabName.click()
        await common.waitForTimeout(1000)
    }

    async openAddPoliciesMenu() {
        await common.clickSelector(this.page, this.addPoliciesLinkSelector)
        await common.waitForTimeout(500)
    }

    async addPolicy(policy) {
        await common.waitForText(this.page, this.addPolicyLabel, policy)
        let rowPolicy = await common.findElementWithChildHavingText(this.page, this.addPolicyRow, this.addPolicyLabel, policy)
        let element = await rowPolicy.$(this.addPolicySelectButtonSelector)
        await element.hover()
        let checkedCircle = await element.boundingBox()
        await this.page.mouse.click(checkedCircle.x+10, checkedCircle.y+10)
        await common.waitForTimeout(500)
        await common.clickSelector(this.page, this.closeAddPolicyMenuSelector)
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

module.exports = ProjectDeletionReportModal