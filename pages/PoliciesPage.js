const common = require("../common")
const BasePageObject = require("./BasePageObject")
const TreeView = require("./components/TreeView")
const DocumentList = require("./components/DocumentList")

class PoliciesPage extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)

        this.atPageSelector = `.RgFoldersView` //hidden, but present on the policy page        
       
        this.treeView = new TreeView(browser, page)
        this.documentList = new DocumentList(browser, page)

        this.createButtonSelector = `.DocumentsetTreeMenuPopover button`
        this.createPopoverButtonSelector = `.bp4-popover-content ul li a` 
        this.activatePolicyButtonSelector = `.panel-content .bp4-intent-primary`
        this.documentDetailsLinkSelector = `.details-link`

        // --------info pane
        this.policyInfoHeaderButtonSelector = `.PolicyInfo .bp4-button`
        this.infoRowLabelSelector = `.collapsible-info-content tr`
        this.infoRowValueSelector = `.collapsible-info-content tr td`
        this.closeInfoPaneSelector = `.ItemDetailsView .bp4-button svg`
        
        //---------right pane
        this.actionsMenuButtonSelector = `.ActionsBar .bp4-button-group button .bp4-button-text`
        this.actionsMenuItemsSelector = `.ActionsMenu li .bp4-menu-item`
        this.actionsMenuSubmenuItemsSelector = `.bp4-overlay-open`
        this.actionsMenuSubmenuItemNameSelector = `a`
        this.refreshButtonSelector = `.ActionsBar .bp4-button-group .bp4-icon-refresh`
        this.refreshMenuOptionsSelector = `.bp4-popover-content ul li a`
        
    }

    async assertAtPage() { 
        await common.waitForFirst(this.page, this.atPageSelector, false)
        //then blindly wait a bit more for things to load
        await common.waitForTimeout(2000)
    }   

    async clickCreateButton(opt) {
        await common.clickSelector(this.page, this.createButtonSelector)
        await common.waitForFirst(this.page, this.createPopoverButtonSelector)
        let optionMenu = await common.findElementInListHavingText(await this.page.$$(this.createPopoverButtonSelector), opt)
        await optionMenu.click()
    }

    async getListedPolicies() {
        return await this.treeView.getItems()
    }

    async clickActivatePolicyButton() {
        await common.clickSelector(this.page, this.activatePolicyButtonSelector)
        await common.waitForTimeout(500)
    }

    async clickDocumentDetailsLink() {
        await common.clickSelector(this.page, this.documentDetailsLinkSelector)
        await common.waitForTimeout(2000)
    }

    // ----------info pane
    async clickPolicyInfoHeaderButton(button) {
        await common.waitForFirst(this.page, this.policyInfoHeaderButtonSelector)
        let detailsElement = await common.findElementInListHavingText(await this.page.$$(this.policyInfoHeaderButtonSelector), button)
        await detailsElement.click()
        await common.waitForTimeout(1000)
    }

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

    async closeInfoPane() {
        await common.clickSelector(this.page, this.closeInfoPaneSelector)
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

    async clickRefreshToolbarButton() {
        await common.clickSelector(this.page, this.refreshButtonSelector)
    }

    async clickRefreshMenuItem(item) {
        await common.waitForFirst(this.page, this.refreshMenuOptionsSelector)
        let menuItem = await common.findElementInListHavingText(await this.page.$$(this.refreshMenuOptionsSelector), item)
        await menuItem.click()
        await common.waitForTimeout(1000)
    }
}

module.exports = PoliciesPage