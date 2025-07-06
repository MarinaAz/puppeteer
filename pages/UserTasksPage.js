const common = require("../common")
const BasePageObject = require("./BasePageObject")


class UserTasksPage extends BasePageObject {
    constructor(browser, page) {
        super(browser, page) 
        
        this.taskRowsSelector = `.RgGlobalTasksView .ag-body-viewport [role="row"]` 
        this.taskRowNameSelector = `[col-id="taskName"]`
        this.taskRowDetailLinksSelector = `[col-id="taskDetails"] a`
        this.taskRowDeleteButtonSelector = `[col-id="taskAction"] button`
    }

    async assertAtPage() { 
        await common.waitForFirst(this.page, this.taskRowsSelector)
        await common.waitForTimeout(1000)
    }

    async getTopTaskName() {
        let topRow = await this._getTopTaskRow()
        let topRowNameElement = await topRow.$(this.taskRowNameSelector)
        return common.getTextOfElement(topRowNameElement)
    }

    //clicks a link in the top task details. ie, "clickLinkInTopTaskDetails('here') clicks the here link"
    async clickLinkInTopTaskDetails(linkText) { 
        let topRow = await this._getTopTaskRow()
        let topRowDetailLinks = await topRow.$$(this.taskRowDetailLinksSelector)
        let linkToClick = await common.findElementInListHavingText(topRowDetailLinks, linkText)
        await linkToClick.click()
    }

    //clicks delete on the top task
    async clickDeleteOnTopTask() {
        let topRow = await this._getTopTaskRow()
        let deleteElement = await topRow.$(this.taskRowDeleteButtonSelector)
        await deleteElement.click()
    }

    //returns the top task row
    async _getTopTaskRow() { 
        let allRows = await this.page.$$(this.taskRowsSelector)
        return allRows[0]
    }

}

module.exports = UserTasksPage