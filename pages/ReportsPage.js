const common = require("../common")
const BasePageObject = require("./BasePageObject")

class ReportsPage extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)
        
        this.containerSelector = `#siteBodyContent`
        this.repotsMenuItemsSelector = `#reportsDataTable .yui-dt-data tr td`
        this.tableHeaderNamesSelector = `.jrPage tr:nth-child(10) td span`
    }

    async assertAtPage() {
        await common.waitForFirst(this.page, this.containerSelector) 
        await common.waitForTimeout(3000)       
    }

    async selectReportsMenuItem(item) {
        await common.waitForFirst(this.page, this.repotsMenuItemsSelector)
        let reportsMenuItem = await common.findElementInListHavingText(await this.page.$$(this.repotsMenuItemsSelector), item)
        await reportsMenuItem.click()
        await common.waitForTimeout(500)
    }
      
    async getValueOfColumn(headerName) {
        let headerElements = await common.getTextOfElements(await this.page.$$(this.tableHeaderNamesSelector))
        // let allCellValues = await common.getTextOfElements(await this.page.$$('.jrPage tr:nth-child(11) .jrPage td span'))
        let idx = headerElements.indexOf(headerName)
        if(idx < 0) {
            throw new Error(`unable to find option ${headerName}`)
        }
        return idx
    }

    async _findColumnIndex(headerName) {
        let headerElements = await common.getTextOfElements(await this.page.$$(this.tableHeaderNamesSelector))
        let idx = headerElements.indexOf(headerName)
        if(idx < 0) {
            throw new Error(`unable to find option ${headerName}`)
        }
        return idx
    }

    async getAllValuesForColumnCopyLogReport(headerName) {
        //find header index
        let columnIndex = await this._findColumnIndex(headerName)
        //loop thru rows
        let result = []
        let tableBodyIndex = 11
        while(true) {
            let rowElements = await this.page.$$(`.jrPage tr:nth-child(${tableBodyIndex}) td span`)
            let rowElement = rowElements[columnIndex]
            if(rowElement == null) {
                break
            }
            let rowText = await common.getTextOfElement(rowElements[columnIndex])
            if (!rowText) {
                break
            }
            result.push(rowText)
            tableBodyIndex++
        }
        
        return result
    }

    async getAllValuesForColumnProjectDeletionReport(headerName) {
        //find header index
        let columnIndex = await this._findColumnIndex(headerName)
        //loop thru rows
        let result = []
        let tableBodyIndex = 12
        while(true) {
            let rowElements = await this.page.$$(`.jrPage tr:nth-child(${tableBodyIndex}) td span`)
            let rowElement = rowElements[columnIndex]
            if(rowElement == null) {
                break
            }
            let rowText = await common.getTextOfElement(rowElements[columnIndex])
            if (!rowText) {
                break
            }
            result.push(rowText)
            tableBodyIndex++
        }
        
        return result
    }

}

module.exports = ReportsPage