const common = require("../common")
const BasePageObject = require("./BasePageObject")

class ReportConfigurationPage extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)

        //left pane
        this.leftPaneReportListReportNamesSelector = `#reportsDataTable table tbody.yui-dt-data tr td:nth-child(2) > div > div:nth-child(1)`
        this.leftPaneReportListTotalPagesSelector = `#reportsPaginator .changer-slash`
        this.leftPaneReportsListNextPageButtonSelector = `#reportsPaginator .yui-pg-next`
    } 

    async assertAtPage() {
        await common.waitForFirst(this.page, this.leftPaneReportListReportNamesSelector)
        await common.waitForTimeout(1000)
    }

    async getLeftPaneTableTotalPageCount() { 
        return await common.getTextOfElement(await this.page.$(this.leftPaneReportListTotalPagesSelector))
    }

    async getLeftPaneTableReportNames() { 
        return await common.getTextOfElements(await this.page.$$(this.leftPaneReportListReportNamesSelector))
    }

    async clickLeftPaneTableNextPage() {
        await common.scrollSelectorIntoView(this.page, this.leftPaneReportsListNextPageButtonSelector) 
        await common.clickSelector(this.page, this.leftPaneReportsListNextPageButtonSelector)
        await common.waitForTimeout(1000)
    }

}

module.exports = ReportConfigurationPage