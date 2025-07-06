const common = require("../common")
const BasePageObject = require("./BasePageObject")

class DashboardPage extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)
        
        this.dashboardGraphIsPresentSelector = `#dashboardApp svg .dimple-axis`
    }

    async assertAtPage() {
        await common.waitForFirst(this.page, this.dashboardGraphIsPresentSelector)
        //and then wait a bit more for things
        await common.waitForTimeout(2000)
    }
}

module.exports = DashboardPage