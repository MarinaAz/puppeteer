const common = require("../common")
const BasePageObject = require("./BasePageObject")
const TreeView = require("./components/TreeView")
const DocumentList = require("./components/DocumentList")

class CollectionsPage extends BasePageObject {
    constructor(browser, page) {
        super(browser, page)

        this.collectionsContainerSelector = `.RgFoldersView`        
        this.createButtonSelector = `.DocumentsetTreeMenuPopover button`
        this.createPopoverButtonSelector = `.bp4-popover-content ul li a`

        //---------right pane
        this.actionsMenuButtonSelector = `.ActionsBar .bp4-button-group button .bp4-button-text`
        this.actionsMenuItemsSelector = `.ActionsMenu li .bp4-menu-item`
        this.actionsMenuSubmenuItemsSelector = `.bp4-overlay-open`
        this.actionsMenuSubmenuItemNameSelector = `a`
        this.documentDetailsLinkSelector = `.details-link`
        this.refreshMenuOptionsSelector = `.bp4-popover-content ul li a`
        this.refreshButtonSelector = `.ActionsBar .bp4-button-group .bp4-icon-refresh`

        //---------collection info
        this.detailsHeaderButtonsNames = `.CollectionInfo .bp4-button`
        this.infoRowLabelSelector = `.collapsible-info-content tr`
        this.infoRowValueSelector = `.collapsible-info-content tr td`
        this.closeInfoPaneSelector = `.ItemDetailsView .bp4-button svg`

        //subcomponents
        this.treeView = new TreeView(browser, page, ".RgFoldersView")
        this.documentList = new DocumentList(browser, page)
    }

    async assertAtPage() {
        await common.waitForFirst(this.page, this.collectionsContainerSelector)
        await common.waitForTimeout(2000)
    }

    async getListedCollections() {
        await common.waitForTimeout(1000)
        return await this.treeView.getItems()
    }

    async clickCreateButton(opt) {
        await common.clickSelector(this.page, this.createButtonSelector)
        await common.waitForFirst(this.page, this.createPopoverButtonSelector)
        let optionMenu = await common.findElementInListHavingText(await this.page.$$(this.createPopoverButtonSelector), opt)
        await optionMenu.click()
    }

    //-----------right pane
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
        await common.waitForTimeout(1000)
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

    async clickDocumentDetailsLink() {
        await common.clickSelector(this.page, this.documentDetailsLinkSelector)
        await common.waitForTimeout(1000)
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

    // -------right info pane 
    async getValueOfStatus(statusName) {
        let rowElements = await this.page.$$(this.infoRowLabelSelector)
        let statusValue = ""
        for (let idx in rowElements) {
            let tdList = await rowElements[idx].$$(this.infoRowValueSelector)
            if (tdList) {
                let keyText = await common.getTextOfElement(tdList[0])
                if (keyText == statusName) {
                    let keyValue = await tdList[1].evaluate(el => el.textContent)
                    statusValue = keyValue
                    break
                }
            }
        }
        return statusValue
    }

    async clickDetailsHeaderButton(button) {
        await common.waitForFirst(this.page, this.detailsHeaderButtonsNames)
        let detailsElement = await common.findElementInListHavingText(await this.page.$$(this.detailsHeaderButtonsNames), button)
        await detailsElement.click()
        await common.waitForTimeout(1000)
    }

    async closeInfoPane() {
        await common.clickSelector(this.page, this.closeInfoPaneSelector)
    }
}

module.exports = CollectionsPage