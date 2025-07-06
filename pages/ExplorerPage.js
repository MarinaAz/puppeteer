const common = require("../common")
const BasePageObject = require("./BasePageObject")

class ExplorerPage extends BasePageObject {
    constructor(browser, page) {
        super(browser, page)
         
        this.explorerContainerSelector = `#siteBodyContent`

        //--------------- right pane
        this.documentActionsSelector = `a.document-action-link`
        this.documentActionsMenuContainerSelector = `.rg-menu-body`
        this.documentActionsMenuItemSelector = `.rg-menu-item`
        this.documentActionsMenuDropdownSelector = `i.fa-caret-square-o-down`
        this.actionsMenuSubmenuItemNameSelector = `.rg-sub-menu .rg-menu-item`
        this.graphTitleSelector = `.dimple-axis.dimple-axis-y text`
        this.taskCountSelector = `rg-tasks .ng-binding`

        //---------------- left pane
        this.graphDataByResetButtonSelector = `.graph-data-by .select-group-1 span i`
        this.graphDataByFirstSelector = `.graph-data-by .select-group-1 select`
        this.graphDataByFirstOptionSelector = `.graph-data-by .select-group-1 select option`
        this.updateButtonSelector = `#updateChart`

        // ----------------top bar
        this.topBarDataSetButtonSelector = `.top-bar rg-breadcrumbs span:nth-child(1) span`
        this.dataSetProjectMenuOptionRowSelector = `.rg-tree-item-group rg-tree .rg-tree-item`
        this.dataSetProjectMenuOptionNameSelector = `.rg-tree-item-group rg-tree span span`
        this.dataSetProjectMenuExpanderSelector = `.fa-caret-right`
        this.dataSetProjectMenuOptionItemSelector = `rg-tree[tree="item.children"] .rg-tree-item span span.selectable`
    }

    async assertAtPage() {
        await common.waitForFirst(this.page, this.explorerContainerSelector)
        await common.waitForTimeout(4000)
    }

    async resetGraphDataBy() {
        await common.clickSelector(this.page, this.graphDataByResetButtonSelector)
    }

    async openGraphDataBy() {
        await common.clickSelector(this.page, this.graphDataByFirstSelector)
    }

    async selectGraphDataByOption(option) {
        await common.waitForTimeout(500)
        await common.selectByVisibleText(this.page, "select", "select option", option)
        await common.waitForTimeout(500)
        await common.clickSelector(this.page, this.updateButtonSelector)
        await common.waitForTimeout(1000)
    }

    async openDataSet() {
        await common.clickSelector(this.page, this.topBarDataSetButtonSelector)
        await common.waitForTimeout(1000)
    }

    async expandDataSetProjectOptionMenu(option) {
        await common.waitForText(this.page, this.dataSetProjectMenuOptionNameSelector, option)
        let optionElement = await common.findElementWithChildHavingText(this.page, this.dataSetProjectMenuOptionRowSelector, this.dataSetProjectMenuOptionNameSelector, option)
        let expandElement = await optionElement.$(this.dataSetProjectMenuExpanderSelector)
        await expandElement.click()
        await common.waitForTimeout(500) 
    }

    async selectNthDataProjectOptionMenuItem(n) {
        await common.waitForFirst(this.page, this.dataSetProjectMenuOptionItemSelector)
        let allItems = await this.page.$$(this.dataSetProjectMenuOptionItemSelector)
        await allItems[n].click()
        await common.waitForTimeout(1000)
    }

    async openActionMenu() {
        await common.clickSelector(this.page, this.documentActionsMenuDropdownSelector)
        await common.waitForTimeout(1000)
    }

    async clickActionMenuItem(item) {
        await common.waitForFirst(this.page, this.documentActionsMenuItemSelector)
        let menuItem = await common.findElementInListHavingText(await this.page.$$(this.documentActionsMenuItemSelector), item)
        await menuItem.click()
        await common.waitForTimeout(1000)
    }

    async clickActionSubMenuItem(item, submenuItem) {
        await common.waitForFirst(this.page, this.documentActionsMenuItemSelector)
        let menuItem = await common.findElementInListHavingText(await this.page.$$(this.documentActionsMenuItemSelector), item)
        await menuItem.hover()
        await common.waitForTimeout(1000)
        let submenuElementItem = await common.findElementInListHavingText(await this.page.$$(this.actionsMenuSubmenuItemNameSelector), submenuItem)
        // await common.scrollElementIntoView(this.page, submenuElementItem)
        await common.waitForTimeout(1000)
        await submenuElementItem.click()
        // let box = await submenuElementItem.boundingBox()
        // await this.page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
    }

    async waitForGraphTitile(title) {
        await common.waitForText(this.page, this.graphTitleSelector, title)
    }

    async clickGraphBar(barTitle) { 
        //the bars appear to have the title in the id. this should work for most cases by name
        let selector = `svg .dimple-bar[id*="${barTitle}"]`
        await common.waitForFirst(this.page, selector)
        let barElement = await this.page.$(selector)
        await common.waitForTimeout(500)
        await barElement.click()
        await common.waitForTimeout(1000)
    }

    async waitForTaskCountToBeZero(expectedText, timeout=180000) { 
        await common.waitForText(this.page, this.taskCountSelector, expectedText, timeout )
    }

}

module.exports = ExplorerPage