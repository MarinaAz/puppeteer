const common = require("../common")
const BasePageObject = require("./BasePageObject")

class DatabaseAndIntegrationConfigurationPage extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)

        //=============== left pane
        this.directoryServiceLinkSelector = `.RgConfigurationView`
        this.operationListItemsSelector = `.left-panel a`

        //=============== right pane / directory service
        this.directoryServiceConfigurationContainerSelector = `.RgDirectoryServiceConfigurationView`
        this.directoryServiceTestDirectoryServiceConfigurationButtonSelector = `button[title="Test Directory Service Configuration"]`        

        //=============== right pane / batch data processing        
        this.batchDataProcessingTableRowsSelector = `.ConfigurationGrid .ag-body .ag-row`
        this.batchDataProcessingTableRowNameSelector = `.ConfigurationGrid .ag-body .ag-row div[col-id="displayName"]`
        this.batchDataProcessingTableRowValueSelector = `.ConfigurationGrid .ag-body .ag-row .ag-cell-value .BooleanRenderer`
    }

    async assertAtPage() { 
        //wait for at least directory service operation to load
        await common.waitForFirst(this.page, this.directoryServiceLinkSelector)
        await common.waitForTimeout(1000)
    }

    //=============== left pane
    async clickOperationLink(operation) { 
        await common.waitForText(this.page, this.operationListItemsSelector, operation)
        let operationLink = await common.findElementInListHavingText(await this.page.$$(this.operationListItemsSelector), operation)
        if(!operationLink) {
            throw new Error(`unable to locate operation '${operation}' in configuration list`)
        }
        await operationLink.click()
    }


    //=============== right pane / directory service
    async waitForDirectoryServiceToLoad() { 
        //wait on the test config button to appear
        await common.waitForFirst(this.page, this.directoryServiceTestDirectoryServiceConfigurationButtonSelector)
        //and then some more for reasons.
        await common.waitForTimeout(1000)
    }

    async clickTestDirectoryServiceConfigurationButton() { 
        await common.clickSelector(this.page, this.directoryServiceTestDirectoryServiceConfigurationButtonSelector)
    }

    //=============== right pane / batch data processing
    async waitForBatchDataProcessingToLoad() { 
        await common.waitForFirst(this.page, this.batchDataProcessingTableRowsSelector, false)
        //wait just a bit more for vals to populate
        await common.waitForTimeout(2000)        
    }

    //returns true or false for a given name. if the checkbox svg attribute is blank, we'll return true. 
    //if the empty/field svg attribute is tick, we'll return false
    //if we cant determine, we'll error
    async getBatchDataProcessingTableBooleanValueForName(name) { 
        let tableRowElement = await this._findBatchDataProcessingTableRowByName(name)
        let valueElement = await tableRowElement.$(this.batchDataProcessingTableRowValueSelector)
        let svgElement = await valueElement.$('svg')
        let dataAttributeValue = await common.getElementAttribute(this.page, svgElement, 'data-icon')
        if(dataAttributeValue === 'blank') {
            return false
        } else if (dataAttributeValue === 'tick') {
            return true
        } else {
            throw new Error(`unable to determine status of boolean value for ${name}`)
        }
    }

    async _findBatchDataProcessingTableRowByName(name) { 
        await common.waitForText(this.page, this.batchDataProcessingTableRowNameSelector, name)
        let rowElement = await common.findElementWithChildHavingText(this.page, this.batchDataProcessingTableRowsSelector, this.batchDataProcessingTableRowNameSelector, name)
        if(!rowElement) { 
            throw new Error(`unable to locate row with name ${name} in batch data processing table`)
        }
        return rowElement
    }
}

module.exports = DatabaseAndIntegrationConfigurationPage

