const common = require("../common")
const BasePageObject = require("./BasePageObject")

class SystemDashboardPage extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)

        //left pane
        this.leftPaneMenuContainerSelector = `.SystemDashboardMenu`
        this.operationListItemsSelector = `.SystemDashboardMenu li:not(.bp3-menu-header)`

        //right pane        
        this.switchSchemaTableRowsSelector = `.dashboard-view-panel .ag-body-viewport div:not(.ag-header)[role="row"]`        
        this.switchSchemaTableSwitchSchemaButtonSelector = `.switch-schema-footer button`        
    }

    async assertAtPage() { 
        await common.waitForFirst(this.page, this.leftPaneMenuContainerSelector)
    }

    //=============== left pane
    async clickOperationLink(operation) { 
        //wait a bit before clicking. and wait on the operation to appear
        await common.waitForText(this.page, this.operationListItemsSelector, operation)
        await common.waitForTimeout(500)
        const operationLink = await common.findElementInListHavingText(await this.page.$$(this.operationListItemsSelector), operation)
        if(!operationLink) {
            throw new Error(`unable to locate operation '${operation}' in configuration list`)
        }
        await operationLink.click()
    }

    //=============== right pane
    async waitForSwitchSchemaToLoad() {         
        await common.waitForFirst(this.page, this.switchSchemaTableRowsSelector)
        await common.waitForTimeout(1000)
    }

    async getSwitchSchemaFirstRowValues() { 
        const allTableRows = await this.page.$$(this.switchSchemaTableRowsSelector)        
        return await common.getTextOfElements(await allTableRows[0].$$('div'))
    }

    async clickRunSwitchSchemaAndSyncButton() {
        await common.clickSelector(this.page, this.switchSchemaTableSwitchSchemaButtonSelector)
    }

}

module.exports = SystemDashboardPage