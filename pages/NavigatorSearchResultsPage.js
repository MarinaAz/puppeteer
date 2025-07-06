const common = require("../common")
const BasePageObject = require("./BasePageObject")

class NavigatorSearchResultsPage extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)

        this.mainContainerSelector = `.RgNavigatorSearch`
        this.tableRowNamesSelector = `.NavigatorSearchDataTable .ag-body div[col-id="path"] .path-column`
    }

    async assertAtPage() { 
        await common.waitForFirst(this.page, this.mainContainerSelector)
    }

    async waitForFirstResult() { 
        await common.waitForFirst(this.page, this.tableRowNamesSelector)
    }

    async getResultPaths() { 
        return await common.getTextOfElements(await this.page.$$(this.tableRowNamesSelector))
    }
}

module.exports = NavigatorSearchResultsPage

