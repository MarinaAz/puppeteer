const common = require("../common")
const BasePageObject = require("./BasePageObject")

class PolicyNotificationsPage extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)
        
        this.containerSelector = `.RgPolicyNotificationsView`
        this.headerColumnNameSelector = `.ag-header-cell-text`
        this.columnValueSelector = `.ag-center-cols-container .ag-cell`
        this.rightToolbarButtonSelector = `.PolicyNotificationsActionsBar .right-toolbar button .bp4-button-text`
        this.rightToolbarButtonRowSelector = '.PolicyNotificationsActionsBar .right-toolbar button'
        this.rightToolbarButtonCountSelector = `.PolicyNotificationsActionsBar .right-toolbar button .button-all-count`
    }

    async assertAtPage() {
        await common.waitForFirst(this.page, this.containerSelector) 
        await common.waitForTimeout(3000)       
    }
      
    async getValueOfColumn(columnName) {
        let headerElements = await common.getTextOfElements(await this.page.$$(this.headerColumnNameSelector))
        let allCellValues = await common.getTextOfElements(await this.page.$$(this.columnValueSelector))
        let idx = headerElements.indexOf(columnName)
        if(idx < 0) {
            throw new Error(`unable to find option ${columnName}`)
        }
        return allCellValues[idx]
    }

    async clickRightToolbarButton(button) {
        let buttonElement = await common.findElementInListHavingText(await this.page.$$(this.rightToolbarButtonSelector), button)
        if(!buttonElement) { 
            throw new Error(`unable to find button ${button}`)
        }
        await buttonElement.click()
        await common.waitForTimeout(3000)
    }

    async waitForToolbarButtonCount(expectedText, timeout=150000) { 
        await common.waitForText(this.page, this.rightToolbarButtonCountSelector, expectedText, timeout )
    }

}

module.exports = PolicyNotificationsPage