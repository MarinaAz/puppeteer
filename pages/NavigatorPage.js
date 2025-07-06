const common = require("../common")
const BasePageObject = require("./BasePageObject")

class NavigatorPage extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)

        //top
        this.taskCountsButtonsSelector = `.TasksCounts button`
        this.searchFieldSelector = `.SearchPanel input`

        //left pane
        this.agentDropdownOptionsSelector = `.AgentTypeSelector option`
        this.agentDropdownSelectSelector = `.AgentTypeSelector select`
        this.agentConnectionRowsSelector = `.ag-body-viewport div[role="row"]`
        this.agentConnectionRowNameSelector = `.tree-value`
        this.agentConnectionRowExpandSelector = `.tree-expander`

        //right pane
        this.documentTableNamesSelector = `.ContentNavigatorDataTable .ag-body div[col-id="label"] .value`
    }

    async assertAtPage() { 
        await common.waitForFirst(this.page, this.taskCountsButtonsSelector)
    }


    async getTaskCountButtonLabels() { 
        //strip off the actual counts for now to ensure labels are present
        let allTaskCountButtonLabels = await common.getTextOfElements(await this.page.$$(this.taskCountsButtonsSelector))
        return allTaskCountButtonLabels.map(x=>x.match(/(.*): \d+/)[1])
    }

    async typeAndSearch(searchTerm) { 
        await common.typeIntoSelector(this.page, this.searchFieldSelector, searchTerm)
        await this.page.keyboard.press('Enter')
    }

    //====================== left pane
    async getAgentDropdownOptions() { 
        await common.waitForFirst(this.page, this.agentDropdownOptionsSelector, false)
        return await common.getTextOfElements(await this.page.$$(this.agentDropdownOptionsSelector))
    }
    
    async selectAgentDropdown(dropdownOption) { 
        await common.selectOptionByText(this.page, this.agentDropdownSelectSelector, dropdownOption)
        await common.waitForTimeout(2000) //wait for things to start to populate 
    }

    //returns list of each row's text displayed in the connection pane on the left
    async getAgentConnectionPaneRows() { 
        return await common.getTextOfElements(await this.page.$$(this.agentConnectionRowsSelector))
    }

    //clicks expand next to agent connection pane row
    async clickExpandForAgentConnectionPaneRow(rowTitle) {
        let agentConnectionRow = await common.findElementWithChildHavingText(this.page, this.agentConnectionRowsSelector, this.agentConnectionRowNameSelector, rowTitle)
        if(!agentConnectionRow) { 
            throw new Error(`unable to find agent connection pane row "${rowTitle}"`)
        }
        let expandElement = await agentConnectionRow.$(this.agentConnectionRowExpandSelector)
        await expandElement.click()
        await common.waitForTimeout(1000)
    }

    //clicks an agent connection pane row, loading it into the right pane
    async clickAgentConnectionPaneRow(rowTitle) {
        let agentConnectionRow = await common.findElementWithChildHavingText(this.page, this.agentConnectionRowsSelector, this.agentConnectionRowNameSelector, rowTitle)
        if(!agentConnectionRow) { 
            throw new Error(`unable to find agent connection pane row "${rowTitle}"`)
        }
        let clickElement = await agentConnectionRow.$(this.agentConnectionRowNameSelector)
        await clickElement.click()
        await common.waitForTimeout(1000)
    }

    //====================== right pane

    //assumes there is at least one that should be present
    async getDocumentNames() { 
        await common.waitForFirst(this.page, this.documentTableNamesSelector)
        return await common.getTextOfElements(await this.page.$$(this.documentTableNamesSelector))
    }
}

module.exports = NavigatorPage