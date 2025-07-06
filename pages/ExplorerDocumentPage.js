const common = require("../common")
const BasePageObject = require("./BasePageObject")
const DocumentList = require("./components/DocumentList")

class ExplorerDocumentPage extends BasePageObject {
    constructor(browser, page) {
        super(browser, page)

        this.atPageSelector = `.RgContentExplorerView`
        this.explorerNavigationTabsSelector = `.submenuPanel li`

        //---------- actions menu
        this.actionsMenuButtonSelector = `.ActionsBar .bp4-button .bp4-button-text`
        this.actionsMenuItemsSelector = `.ActionsMenu li .bp4-menu-item`
        this.actionsMenuSubmenuItemsSelector = `.bp4-overlay-open`
        this.actionsMenuSubmenuItemNameSelector = `a`

        this.documentList =  new DocumentList(browser, page)
    }

    async assertAtPage() {
        await common.waitForFirst(this.page, this.atPageSelector)                
        //extra wait here too to account for the semi-reloading that can happend
        await common.waitForTimeout(7000)
    }
    
    //open a Toolbar option
    async clickToolbarButton(toolbarOption) {
        await common.waitForFirst(this.page, this.actionsMenuButtonSelector)
        let toolbarElement = await common.findElementInListHavingText(await this.page.$$(this.actionsMenuButtonSelector), toolbarOption)
        if(!toolbarElement) {
            throw new Error(`unable to locate toolbar option ${toolbarOption}`)
        }
        await toolbarElement.click()
        await common.waitForTimeout(1000)
    }

    async clickActionMenuItem(item) {
        await common.waitForFirst(this.page, this.actionsMenuItemsSelector)
        let menuItem = await common.findElementInListHavingText(await this.page.$$(this.actionsMenuItemsSelector), item)
        await menuItem.click()
    }

    //assumes the submenu is already open. 
    async clickActionSubMenuItem(submenuItem) {
        //submenu will be the second one that matches this selector when open. 
        await common.waitForTimeout(500)
        let submenuElements = await this.page.$$(this.actionsMenuSubmenuItemsSelector)
        let submenuElement = submenuElements[1]

        let submenuElementItems = await submenuElement.$$(this.actionsMenuSubmenuItemNameSelector)
        let submenuElementItemToClick = await common.findElementInListHavingText(submenuElementItems, submenuItem)
        await submenuElementItemToClick.click()
        await common.waitForTimeout(500)
    }

    async clickExplorerNavigationTab(tabName) {
        let tabElement = await common.findElementInListHavingText(await this.page.$$(this.explorerNavigationTabsSelector), tabName)
        await tabElement.click()        
    }
    
}

module.exports = ExplorerDocumentPage