const common = require("../common")
const BasePageObject = require("./BasePageObject")

class SettingsPage extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)

        this.mainContainerSelector = `.RgProjectSettingsView`
        this.leftPaneMenuSelector = `.ProjectSettingsNavigationMenu li a`
        this.createTagButtonSelector = `.VisibleTagsHeader button .bp4-icon-add`
        this.tagNameSelector = `div[aria-hidden="false"] .ag-center-cols-container .ag-row .NameCellRenderer span`
        this.tagRowSelector = `.ag-center-cols-container .ag-row`
        this.setHiddenIconSelector = `svg[data-icon="eye-off"]`
        this.setVisibleIconSelector = `.bp4-icon-eye-on svg`
        this.editTagIconSelector = `svg[data-icon="edit"]`
        this.deleteTagIconSelector = `svg[data-icon="trash"]`
        this.manageTagsTab = `.bp4-tab-list div[role="tab"]`
        this.searchTagsInputSelector = `div[aria-hidden="false"] .bp4-input-group input`
        this.searchTagsButtonSelector = `div[aria-hidden="false"] .bp4-input-group button`
    }

    async assertAtPage() { 
        await common.waitForFirst(this.page, this.mainContainerSelector)
    }

    async clickMenuOption(menuItem) { 
        await common.waitForText(this.page, this.leftPaneMenuSelector, menuItem)
        let menuItemElement = await common.findElementInListHavingText(await this.page.$$(this.leftPaneMenuSelector), menuItem)
        await menuItemElement.click()
        await common.waitForTimeout(1000)
    }
    
    // Manage Tags
    async clickCreateTagButton() {
        await common.clickSelector(this.page, this.createTagButtonSelector)
    }

    async getListedTags() { 
        await common.waitForFirst(this.page, this.tagNameSelector)
        return await common.getTextOfElements(await this.page.$$(this.tagNameSelector))
    }

    async _findTagRow(tagName) {
        await common.waitForText(this.page, this.tagNameSelector, tagName)
        let tag = await common.findElementWithChildHavingText(this.page, this.tagRowSelector, this.tagNameSelector, tagName)
        if(!tag) {
            throw new Error(`unable to locate a tag ${tag}`)
        }
        return tag
    }

    async setHiddenTag(tagName) {
        let rowTag = await this._findTagRow(tagName)
        let element = await rowTag.$(this.setHiddenIconSelector)
        await element.click()
        await common.waitForTimeout(500)
    }

    async setVisibleTag(tagName) {
        let rowTag = await this._findTagRow(tagName)
        let element = await rowTag.$(this.setVisibleIconSelector)
        await element.click()
        await common.waitForTimeout(500)
    }

    async editTag(tagName) {
        let rowTag = await this._findTagRow(tagName)
        let element = await rowTag.$(this.editTagIconSelector)
        await element.click()
        await common.waitForTimeout(500)
    }

    async removeTag(tagName) {
        let rowTag = await this._findTagRow(tagName)
        let element = await rowTag.$(this.deleteTagIconSelector)
        await element.click()
        await common.waitForTimeout(500)
    }

    async clickTab(tabName) { 
        await common.waitForFirst(this.page, this.manageTagsTab)
        let tabElement = await common.findElementInListHavingText(await this.page.$$(this.manageTagsTab), tabName)
        if(!tabElement) {
            throw new Error(`unable to locate tab "${tabName}"`)
        }
        await tabElement.click()
        await common.waitForTimeout(500)
    }

    async searchForTag(tagName) {
        await common.typeIntoSelector(this.page, this.searchTagsInputSelector, tagName)
        await common.waitForTimeout(500)
        await common.clickSelector(this.page, this.searchTagsButtonSelector)
        await common.waitForTimeout(500)
    }

}

module.exports = SettingsPage