const BasePageObject = require("./BasePageObject")
const common = require("../common")

class DocumentViewerPage extends  BasePageObject { 
    constructor(browser, page) {
        super(browser, page)

        this.containerSelector = `.DocumentDetails`

        //top tabs
        this.tabsSelector = `.DocumentDetails .bp4-tab-list div[data-tab-id]`
        this.topNavigationButtonTextSelector = `.DocumentDetailsNavigation button`

        //component selection
        this.componentSelectionButtonSelector = `.DocumentDetails .bp4-popover-wrapper button`
        this.componentSelectionMenuItemsSelector = `.DocumentComponentMenu a`
        this.componentSelectionActiveMenuItemsSelector = `a.bp4-popover-dismiss`

        //viewer pane
        this.viewerPaneSelector = `.viewer-frame`
        this.viewerHighlightedTermsSelector = `.oit-ss1, .oit-ss2`
        this.viewerSelectedHighlightedTermSelector = `.oit-ss1`
        this.viewerSearchInputSelector = `.SearchBar input`
        this.viewerSearchButtonSelector = `.SearchBar .bp4-minimal`
        this.viewerSearchResultPrevButtonSelector = `.SearchBar .search-nav-buttons button:nth-child(1)`
        this.viewerSearchResultNextButtonSelector = `.SearchBar .search-nav-buttons button:nth-child(2)`
        this.viewerSearchHitStringSelector = `.SearchBar .highlight-counter`

        //metadata pane
        this.metadataNamesSelector = `.DocumentMetadataView .mmd .name`
        this.metadataValuesSelector = `.DocumentMetadataView .mmd .value`

        // tags pane
        this.createTagButtonSelector = `.TagsView .tags-operation-panel .bp4-icon-add`
        this.createdTagNameSelector = `.tags-lists .add-tags-list .ag-row`
        this.addedTagNameSelector = `.tags-lists .current-tags-list .ag-row div[col-id="name"]`
        this.createdTagRowSelector = `.tags-lists .add-tags-list .ag-center-cols-container`
        this.addedTagRowSelector = `.tags-lists .current-tags-list .ag-center-cols-container .ag-row`
        this.addTagToContentButtonSelector = `.AddTagRenderer svg`
        this.removeTagFromContentButtonSelector = `.CurrentTagRenderer svg`
        this.createdTagEmptyStateTextSelector = `.add-tags-list .ag-overlay .ag-overlay-wrapper span`

        //location pane
        this.locationRowsSelector = `.location-list .ag-body div[role="row"] div`
        this.locationTableNamesSelector = `.LocationsView .details .ag-body [col-id=name]`
        this.locationTableValuesSelector = `.LocationsView .details .ag-body [col-id=value]`
    }

    async assertAtPage() { 
        await common.waitForFirst(this.page, this.containerSelector)
    }

    //===================== top tabs
    //selects a tab, such as 'Document', 'Metadata', etc
    async clickTab(tabName) { 
        let tabElement = await common.findElementInListHavingText(await this.page.$$(this.tabsSelector), tabName)
        if(!tabElement) {
            throw new Error(`unable to locate viewer tab "${tabName}"`)
        }
        await tabElement.click()
        await common.waitForTimeout(2000)
    }

    // ====================top navigation
    async clickNavigationButton(buttonText) {
        let buttonElement = await common.findElementInListHavingText(await this.page.$$(this.topNavigationButtonTextSelector), buttonText)
        if(!buttonElement) { 
            throw new Error(`unable to find button ${buttonText}`)
        }
        await buttonElement.click()
        await common.waitForTimeout(1000)
    }

    //===================== component selection
    async selectComponentType(type) {
        await common.clickSelector(this.page, this.componentSelectionButtonSelector)
        let optionElement = await common.findElementInListHavingText(await this.page.$$(this.componentSelectionMenuItemsSelector), type)
        await optionElement.click()
        await common.waitForTimeout(2000)
        await common.waitForAnyText(this.page, this.viewerPaneSelector)
    }

    //returns a list of active component types - the ones NOT greyed out
    async getActiveComponentTypes() { 
        await common.clickSelector(this.page, this.componentSelectionButtonSelector)
        await common.waitForFirst(this.page, this.componentSelectionActiveMenuItemsSelector)
        let ret = await common.getTextOfElements(await this.page.$$(this.componentSelectionActiveMenuItemsSelector))
        await this.page.keyboard.press('Escape')
        await common.waitForNone(this.page, this.componentSelectionActiveMenuItemsSelector)
        return ret
    }   

    //===================== viewer pane
    //returns the full text displayed in the viewer
    async getViewerText() { 
        return await common.getTextOfElement(await this.page.$(this.viewerPaneSelector))        
    }

    //returns all highlighted terms displayed on viewer
    async getHighlightedTerms() { 
        return await common.getTextOfElements(await this.page.$$(this.viewerHighlightedTermsSelector))
    }   

    //returns the term that is highlighted and selected.
    async getSelectedHighlightedTerm() { 
        return await common.getTextOfElement(await this.page.$(this.viewerSelectedHighlightedTermSelector))
    }

    //types a term into the document pane search field
    async typeSearchTerm(term) { 
        await common.typeIntoSelector(this.page, this.viewerSearchInputSelector, term)
    }


    //clicks search button on the document pane
    async clickSearchButton() { 
        await common.clickSelector(this.page, this.viewerSearchButtonSelector)
        await common.waitForTimeout(1000)
    }

    async clickNextSearchResultButton() { 
        await common.clickSelector(this.page, this.viewerSearchResultNextButtonSelector)        
    }

    async clickPrevSearchResultButton() { 
        await common.clickSelector(this.page, this.viewerSearchResultPrevButtonSelector)        
    }

    async getSearchHitsString() { 
        return await common.getTextOfElement(await this.page.$(this.viewerSearchHitStringSelector))
    }

    
    //===================== metadata pane
    //returns a map of (name->value) for all metadata values displayed
    async getMetadataValueMap() { 
        let ret = new Map()
        let allNames = await common.getTextOfElements(await this.page.$$(this.metadataNamesSelector))
        let allValues = await common.getTextOfElements(await this.page.$$(this.metadataValuesSelector))
        for(let i = 0; i<allValues.length; i++) {
            ret.set(allNames[i], allValues[i])
        }        
        return ret
    }

    // =================== tags pane
    async clickCreateTagButton() {
        await common.clickSelector(this.page, this.createTagButtonSelector)
    }

    async getCreatedTagsList()  {
        await common.waitForFirst(this.page, this.createdTagNameSelector)
        return common.getTextOfElements(await this.page.$$(this.createdTagNameSelector))
    }

    async getAddedTagsList() {
        await common.waitForFirst(this.page, this.addedTagNameSelector)
        return common.getTextOfElements(await this.page.$$(this.addedTagNameSelector))
    }

    async addSelectedTag(tagName) {
        await common.waitForText(this.page, this.createdTagNameSelector, tagName)
        let rowTag = await common.findElementWithChildHavingText(this.page, this.createdTagRowSelector, this.createdTagNameSelector, tagName)
        let element = await rowTag.$(this.addTagToContentButtonSelector)
        await element.click()
        await common.waitForTimeout(1000)
    }

    async removeAddedTag(tagName) {
        await common.waitForText(this.page, this.addedTagNameSelector, tagName)
        let rowTag = await common.findElementWithChildHavingText(this.page, this.addedTagRowSelector, this.addedTagNameSelector, tagName)
        let element = await rowTag.$(this.removeTagFromContentButtonSelector)
        await element.click()
        await common.waitForTimeout(1000)
    }
    
    async getCreatedTagsEmptyStateText() {    
        return await common.getTextOfSelector(this.page, this.createdTagEmptyStateTextSelector)     
    }

    //===================== location pane
    async getLocations() { 
        await common.waitForFirst(this.page, this.locationRowsSelector)
        return await common.getTextOfElements(await this.page.$$(this.locationRowsSelector))        
    }

    async clickLocation(location) {
        await common.waitForText(this.page, this.locationRowsSelector, location)
        let locationElement = await common.findElementInListHavingText(await this.page.$$(this.locationRowsSelector), location)
        await locationElement.click()
    }

    //returns a map of the bottom table after a location has been clicked
    async getLocationValueMap() { 
        await common.waitForFirst(this.page, this.locationTableNamesSelector)
        let ret = new Map()
        let allNames = await common.getTextOfElements(await this.page.$$(this.locationTableNamesSelector))
        let allValues = await common.getTextOfElements(await this.page.$$(this.locationTableValuesSelector))
        for(let i = 0; i<allValues.length; i++) {
            ret.set(allNames[i], allValues[i])
        }        
        return ret
    }

}

module.exports = DocumentViewerPage