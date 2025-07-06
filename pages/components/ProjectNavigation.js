const common = require("../../common")
const BasePageObject = require("../BasePageObject")

class ProjectNavigation extends BasePageObject { 

    constructor(browser, page) {
        super(browser, page)

        this.mainListElementSelector = `#mainNavMenuList`
        this.projectMenuButtonSelector = `#mainNavGetStarted`
        this.documentSetsButtonSelector = "#mainNavDocumentSets"
        this.analyticToolsButtonSelector = `#mainNavAnalyticTools`
        this.projectAdminButtonSelector = `#mainNavProjectAdministration`
        this.menuItemsSelector= `.yuimenu ul li a`
    }

    async assertAtPage() {
        await common.waitForFirst(this.page, this.mainListElementSelector)
        await common.waitForTimeout(1000)
    }

    async openProjectMenu() { 
        await common.clickSelector(this.page, this.projectMenuButtonSelector)
        await common.waitForTimeout(1000)
        await common.waitForText(this.page, this.menuItemsSelector, 'Dashboard')
    }

    async openDocumentSetsMenu() { 
        await common.clickSelector(this.page, this.documentSetsButtonSelector)
        await common.waitForTimeout(2000)
        await common.waitForText(this.page, this.menuItemsSelector, 'Preservations')
    }

    async openAnalyticToolsMenu() {
        await common.clickSelector(this.page, this.analyticToolsButtonSelector)
        await common.waitForTimeout(2000)
        await common.waitForText(this.page, this.menuItemsSelector, 'Search')
    }

    async openProjectAdministrationMenu() { 
        await common.clickSelector(this.page, this.projectAdminButtonSelector)
        await common.waitForTimeout(1000)
        await common.waitForText(this.page, this.menuItemsSelector, 'Access')
    }

    async clickMenuItem(menuItem) { 
        await common.waitForText(this.page, this.menuItemsSelector, menuItem)
        let menuItemElement = await common.findElementInListHavingText(await this.page.$$(this.menuItemsSelector), menuItem)
        await menuItemElement.click()
        await common.waitForTimeout(3000)
    }
}

module.exports = ProjectNavigation
