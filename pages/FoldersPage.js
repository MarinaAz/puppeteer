const common = require("../common")
const BasePageObject = require("./BasePageObject")
const TreeView = require("./components/TreeView")
const DocumentList = require("./components/DocumentList")

class FoldersPage extends BasePageObject {
    constructor(browser, page) {
        super(browser, page)

        this.foldersContainerSelector = `.RgFoldersView`
        this.createFolderButtonSelector = `.DocumentsetTreeMenuPopover button`
        this.createFolderPopoverButtonSelector = `.bp4-popover-content ul li a`
        
        this.treeView = new TreeView(browser, page)

        //-------------- right pane
        this.actionsMenuButtonSelector = `.ActionsBar .bp4-button-group button .bp4-button-text`
        this.actionsMenuItemsSelector = `.ActionsMenu li .bp4-menu-item`
        this.actionsMenuSubmenuItemsSelector = `.bp4-overlay-open`
        this.actionsMenuSubmenuItemNameSelector = `a`
        this.refreshButtonSelector = `.ActionsBar .bp4-button-group .bp4-icon-refresh`
        this.refreshMenuOptionsSelector = `.bp4-popover-content ul li a`
        this.modalMenuRowSelector = `.CloseablePanel .bp4-tree-node`
        this.modalMenuRowNameSelector = `.CloseablePanel .bp4-tree-node-content`
        this.modalRowOpenMenuSelector = `.CloseablePanel .fa-chevron-down`
        
        this.documentList = new DocumentList(browser, page)
    }

    async assertAtPage() {
        await common.waitForFirst(this.page, this.foldersContainerSelector)
        await common.waitForTimeout(3000)
    }

    async clickCreateNewFolder() {
        await common.waitForTimeout(500)
        await common.clickSelector(this.page, this.createFolderButtonSelector)
        await common.clickSelector(this.page, this.createFolderPopoverButtonSelector)
    }
   
    async getListedFolders() {
        await common.waitForTimeout(1000)
        return await this.treeView.getItems()
    }

    async clickToolbarButton(toolbarOption) {
        await common.waitForFirst(this.page, this.actionsMenuButtonSelector)
        let toolbarElement = await common.findElementInListHavingText(await this.page.$$(this.actionsMenuButtonSelector), toolbarOption)
        if(!toolbarElement) {
            throw new Error(`unable to locate toolbar option ${toolbarOption}`)
        }
        await toolbarElement.click()
        await common.waitForTimeout(1000)
    }

    async clickRefreshToolbarButton() {
        await common.clickSelector(this.page, this.refreshButtonSelector)
    }

    async clickRefreshMenuItem(item) {
        await common.waitForFirst(this.page, this.refreshMenuOptionsSelector)
        let menuItem = await common.findElementInListHavingText(await this.page.$$(this.refreshMenuOptionsSelector), item)
        await menuItem.click()
        await common.waitForTimeout(1000)
    }

    async clickActionMenuItem(item) {
        await common.waitForFirst(this.page, this.actionsMenuItemsSelector)
        let menuItem = await common.findElementInListHavingText(await this.page.$$(this.actionsMenuItemsSelector), item)
        await menuItem.click()
        await common.waitForTimeout(500)
    }

    async getActionMenuItems() {
        await common.waitForFirst(this.page, this.actionsMenuItemsSelector)
        return await common.getTextOfElements(await this.page.$$(this.actionsMenuItemsSelector))
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
}

module.exports = FoldersPage