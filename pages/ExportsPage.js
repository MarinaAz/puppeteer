const common = require("../common")
const BasePageObject = require("./BasePageObject")
const TreeView = require("./components/TreeView")
const DocumentList = require("./components/DocumentList")

class ExportsPage extends BasePageObject {
    constructor(browser, page) {
        super(browser, page) 

        this.atPageSelector = `.RgFoldersView` //hidden, but present on the page

        this.createButtonSelector = `.DocumentsetTreeMenuPopover button`
        this.createPopoverButtonSelector = `.bp4-popover-content ul li a`

        //---------right pane
        this.actionsMenuButtonSelector = `.ActionsBar .bp4-button-group button .bp4-button-text`
        this.actionsMenuItemsSelector = `.ActionsMenu li .bp4-menu-item`
        this.actionsMenuSubmenuItemsSelector = `.bp4-overlay-open`
        this.actionsMenuSubmenuItemNameSelector = `a`
        this.documentDetailsLinkSelector = `.details-link`
        this.refreshButtonSelector = `.ActionsBar .bp4-button-group .bp4-icon-refresh`
        this.refreshMenuOptionsSelector = `.bp4-popover-content ul li a`
        this.exportLoadNameSelector = `.ag-center-cols-container div[col-id="name"]`
        this.exportLoadStatusSelector = `.ag-center-cols-container div[col-id="status"]`

        //---------export info
        this.detailsHeaderButtonsNames = `.ExportInfo .bp4-button`
        this.infoRowSelector = `.FolderDetails .InfoRow`
        this.infoRowLabelSelector = `.collapsible-info-content tr`
        this.infoRowValueSelector = `.collapsible-info-content tr td`
        this.closeInfoPaneSelector = `.ItemDetailsView .bp4-button svg`

        this.treeView = new TreeView(browser, page, ".RgFoldersView")
        this.documentList = new DocumentList(browser, page)
        
    }

    async assertAtPage() { 
        await common.waitForFirst(this.page, this.atPageSelector, false)
        await common.waitForTimeout(3000)
    }

    async clickCreateButton(opt) {
        await common.clickSelector(this.page, this.createButtonSelector)
        await common.waitForFirst(this.page, this.createPopoverButtonSelector)
        let optionMenu = await common.findElementInListHavingText(await this.page.$$(this.createPopoverButtonSelector), opt)
        await optionMenu.click()
    }

    async getListedExports() {
        return await this.treeView.getItems()
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

    async clickActionMenuItem(item) {
        await common.waitForFirst(this.page, this.actionsMenuItemsSelector)
        let menuItem = await common.findElementInListHavingText(await this.page.$$(this.actionsMenuItemsSelector), item)
        await menuItem.click()
        await common.waitForTimeout(500)
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

    async clickDocumentDetailsLink() {
        await common.clickSelector(this.page, this.documentDetailsLinkSelector)
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

    async getExportLoadNames() {
        await common.waitForFirst(this.page, this.exportLoadNameSelector)
        return await common.getTextOfElement(await this.page.$(this.exportLoadNameSelector))
    }

    async getExportLoadStatus() {
        await common.waitForFirst(this.page, this.exportLoadStatusSelector)
        return await common.getTextOfElement(await this.page.$(this.exportLoadStatusSelector))
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
        await common.waitForTimeout(2000)
    }

    async closeInfoPane() {
        await common.clickSelector(this.page, this.closeInfoPaneSelector)
    } 

    async waitForLoadStatus(expectedText, timeout=150000) { 
        await common.waitForText(this.page, this.exportLoadStatusSelector, expectedText, timeout )
    }
}

module.exports = ExportsPage