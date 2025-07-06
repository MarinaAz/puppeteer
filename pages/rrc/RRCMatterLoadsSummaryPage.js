const common = require('../../common');
const BasePageObject = require('../BasePageObject');

class RRCMatterLoadsSummaryPage extends BasePageObject { 
    constructor(
        browser,
        page,
    ) { 
        super(browser, page, 'Loads · Rational Review');
        this.uri = '/#/app/matter/load/';
        this.selector = '[data-test-id="nav-item-loads"]'
        
        //selectors go here 
        this.loadsTableTitleSelector = `loads-table tile-header h1`
        this.loadsTableRowsSelector = 'loads-table mat-table mat-row'
        this.loadsTableRowCellsSelector = 'mat-cell'
        this.loadsTableRowNameSelector = `.cdk-column-loadTitle a`
        this.loadsTableRowActionsSelector = '.mat-column-actions'
        this.loadsActionsMenuOptionsSelector = `.mat-mdc-menu-panel button`
        this.loadsTableRowNamesSelector = `loads-table mat-table mat-row .cdk-column-loadTitle a` 
        this.loadsTableEmptyStateSelector = `loads-table empty-state h2` 
        this.refreshLoadsButtonSelector = `loads-table button.refresh` 
    }

    async gotoPage() { 
        await common.clickSelector(this.page, this.selector)
    }

    async assertAtPage() { 
        await common.assertHasText(this.page, this.loadsTableTitleSelector, "Loads")
    }

    async clickLoad(loadName) {
        await this.waitForLoadTitle(loadName)
        let loadRow = await this._findLoadRow(loadName)
        let loadNameCell = await loadRow.$(this.loadsTableRowNameSelector)
        await loadNameCell.click()
    }  

    async waitForLoadTitle(loadName) { 
        await common.waitForText(this.page, this.loadsTableRowNamesSelector, loadName)
    }

    async getLoadTitles() {
        await common.waitForFirst(this.page, this.loadsTableRowNamesSelector)
        return await common.getTextOfElements(await this.page.$$(this.loadsTableRowNamesSelector))
    }

    async _findTreeRow(label) { 
        await common.waitForText(this.page, this.loadsTableRowNameSelector, label)
        let row = await common.findElementWithChildHavingText(this.page, this.loadsTableRowsSelector, this.loadsTableRowNameSelector, label)
        if(!row) { 
            throw new Error(`unable to find item ${label}`)
        }
        return row
    }

    async openLoadActionsMenu(item) {
        let rowElement = await this._findTreeRow(item)
        let menuElement = await rowElement.$(this.loadsTableRowActionsSelector)
        await menuElement.click()
        await common.waitForTimeout(1000)
    }

    async selectLoadsMenuOption(menuOption) {
        await common.waitForFirst(this.page, this.loadsActionsMenuOptionsSelector, menuOption)
        let menuItemElement = await common.findElementInListHavingText(await this.page.$$(this.loadsActionsMenuOptionsSelector), menuOption)
        await menuItemElement.click()
        await common.waitForTimeout(1000)
    }

    async clickRefreshLoadsButton() { 
        await common.clickSelector(this.page, this.refreshLoadsButtonSelector)
        await common.waitForTimeout(1000)
    }

    async getLoadsEmptyState() {
        return await common.getTextOfSelector(this.page, this.loadsTableEmptyStateSelector)
    }
}

module.exports = RRCMatterLoadsSummaryPage