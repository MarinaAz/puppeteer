const common = require("../../common");
const BasePageObject = require("../BasePageObject");

class AgentTypesModal extends BasePageObject {
    constructor(browser, page) {
        super(browser, page)

        this.presentSelector = `#agentTypeSelectionDialog`
        this.agentSelectModalTableRowsSelector = `form[name='frm_agentTypeSelectionDialog'] table tbody tr`
        this.agentSelectModalTableRowNameSelector = `td.yui-dt-col-agentTypeName div`
        this.agentSelectModalTableRowClickSelector = `td.yui-dt-col-select`
        this.agentSelectoModalCloseSelector = `#agentTypeSelectionDialog .ft .button-group button`

    }

    async assertAtPage() { 
        await common.waitForFirst(this.page, this.presentSelector)
    }

    async selectAgent(agent) {
        await common.waitForText(this.page, this.agentSelectModalTableRowsSelector, agent)
        let agentRow = await common.findElementWithChildHavingText(this.page, this.agentSelectModalTableRowsSelector, this.agentSelectModalTableRowNameSelector, agent)
        if(!agentRow) {
            throw new Error(`unable to locate agent ${agent} in Select Agent modal`)
        }

        let selectElement = await agentRow.$(this.agentSelectModalTableRowClickSelector)
        await selectElement.click()
    }

    async clickCloseButton() { 
        await common.clickSelector(this.page, this.agentSelectoModalCloseSelector)
        await common.waitForTimeout(250)
    }
    
}

module.exports = AgentTypesModal