const common = require("../common")
const BasePageObject = require("./BasePageObject")

class SearchPage extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)
        
        this.searchButtonSelector = `#submitSearchButton`

        //---- left side  
        this.leftSideTabNameSelector = `.yui-navset-top .yui-nav li a`      
        this.leftSidePredicateListItemsSelector = `.search-links li`
        this.leftSideFullTextElementSelector = `#addSimpleFullTextLink` //here cause this html is different than other predicates (tooltip throws it off)
        this.leftSideBatchSearchElementSelector = `#batchSearchLink` //here cause this html is different than other predicates (tooltip throws it off)
        this.leftSidePredicateNamesSelector = `.yui-content .group-content li`

        // ----- Metadata Tab
        this.leftSideMetadataFieldSearchInputSelector = `.coding-presentation-search-container .coding-presentation-search-input`
        this.leftSideMetadataFieldSearchButtonSelector = `.coding-presentation-search-container .coding-presentation-search-button`
        this.leftSideMetadataListSelector = `#coding ul`
        this.metadataFieldNameSelector = `tr td label`
        this.metadataFieldRow = `.yui-dt-data .yui-dt-rec`
        this.metadataFieldAddButtonSelector = `a[title="Select"]`

        //---- Saved Searches
        this.leftSideSavedSearchesFormInputSelector = `.left-column #savedSearchesForm input[type="text"]`
        this.leftSideSavedSearchesSearchButton = `.left-column #savedSearchesForm input[type="submit"]`
        this.leftSideSavedSearchesNamesSelector = `#savedSearchesDataTable .yui-dt-liner .search`
        this.leftSideSavedSearchesRowSelector = `#savedSearchesDataTable .yui-dt-rec`
        this.leftSideSavedSearchesBinSelector = `#savedSearchesDataTable .yui-dt-rec a[title="Delete search"]`


        //---right side
        this.searchPredicateTextSelector = `#searchRootContainer`
        this.searchButtonSelector = `#submitSearchButton`
        this.saveSearchCriteriaSelector = `#saveSearch`
        this.removeAllButtonSelector = `#removeAllButton`

        //---predicates / Full Text Element
        this.fullTextElementClickToInsertSelector = `.predicate-term span.searchRequired`
        this.fullTextElementInputSelector = `.predicate-term .primaryTermEdit input`

        //---predicates / Is Collected
        this.isCollectedOperatorClickSelector = `.predicateTableRow .predicate-operator a`
        this.isCollectedOperatorMenuItemsSelector = `.yui-module.yui-overlay.yuimenu.visible li a`

    }

    async assertAtPage() {
        await common.waitForFirst(this.page, this.searchButtonSelector)        
        //and then a bit more. tryign to clear predicates sometimes fails if we dont
        await common.waitForTimeout(2000)
    }


    //---- left side
    async clickLeftSideTab(tabName) {
        await common.waitForFirst(this.page, this.leftSideTabNameSelector)
        let tabElement = await common.findElementInListHavingText(await this.page.$$(this.leftSideTabNameSelector), tabName)
        if(!tabElement) {
            throw new Error(`unable to locate tab name ${tabName}`)
        }
        await tabElement.click()
        await common.waitForTimeout(500)
    }

    async clickLeftSideSearchPredicate(predicateName) { 
        //special case handling for the 2 that arent the same as the others
        switch(predicateName) {
            case "Full Text Element": 
                await common.waitForFirst(this.page, this.leftSideFullTextElementSelector)
                await common.clickSelector(this.page, this.leftSideFullTextElementSelector)
                break

            case "Batch Search Element":
                await common.waitForFirst(this.page, this.leftSideBatchSearchElementSelector)
                await common.clickSelector(this.page, this.leftSideBatchSearchElementSelector)
                break

            default:
                await common.waitForFirst(this.page, this.leftSidePredicateListItemsSelector)
                let predicateElement = await common.findElementInListHavingText(await this.page.$$(this.leftSidePredicateListItemsSelector), predicateName)
                await predicateElement.click()
                break;
        }

        await common.waitForTimeout(1000)
    }

    async clickLeftSideSearchPredicateByName(name) {
        await common.waitForFirst(this.page, this.leftSidePredicateNamesSelector)
        let predicateName = await common.findElementInListHavingText(await this.page.$$(this.leftSidePredicateNamesSelector), name)
        await predicateName.click()
    }

    async searchForSavedSearches(search) {
        await common.typeIntoSelector(this.page, this.leftSideSavedSearchesFormInputSelector, search)
        await common.waitForTimeout(1000)
        await common.clickSelector(this.page, this.leftSideSavedSearchesSearchButton)
        await common.waitForTimeout(1000)
    }

    async deleteSelectedSavedSearch(search) {
        let rowSearch = await this._findSavedSearchRow(search)
        let checkedBin = await rowSearch.$(this.leftSideSavedSearchesBinSelector)
        await checkedBin.click()
        await common.waitForTimeout(500)
    }

    async _findSavedSearchRow(opt) {
        await common.waitForFirst(this.page, this.leftSideSavedSearchesNamesSelector, opt)
        let search = await common.findElementWithChildHavingText(this.page, this.leftSideSavedSearchesRowSelector, this.leftSideSavedSearchesNamesSelector, opt)
        if(!search) {
            throw new Error(`unable to locate a search ${search}`)
        }
        return search
    }

    async getSavedSearchNames() {
        return await common.getTextOfElements(await this.page.$$(this.leftSideSavedSearchesNamesSelector))
    }

    // ------Metadata
    async selectMetadataFromList(metadata) {
        await common.waitForText(this.page, this.leftSideMetadataListSelector, metadata)
        let metadataOption = await common.findElementInListHavingText(await this.page.$$(this.leftSideMetadataListSelector), metadata)
        await metadataOption.click()
        await common.waitForTimeout(500)
    }

    async searchForMetadataField(metadata) {
        await common.typeIntoSelector(this.page, this.leftSideMetadataFieldSearchInputSelector, metadata)
        await common.waitForTimeout(500)
        await common.clickSelector(this.page, this.leftSideMetadataFieldSearchButtonSelector)
        await common.waitForTimeout(500)
    }

    async _findMetadataRow(metadataName) {
        await common.waitForText(this.page, this.metadataFieldNameSelector, metadataName)
        let metadata = await common.findElementWithChildHavingText(this.page, this.metadataFieldRow, this.metadataFieldNameSelector, metadataName)
        if(!metadata) {
            throw new Error(`unable to locate a metadata ${metadata}`)
        }
        return metadata
    }

    async addMetadataField(metadata) {
        let rowMetadata = await this._findMetadataRow(metadata)
        let element = await rowMetadata.$(this.metadataFieldAddButtonSelector)
        await element.hover()
        await element.click()
    }
    
    //---- right pane
    //returns the full search predicate text that appears on the page
    async getSearchPredicateText() { 
        return await common.getTextOfElement(await this.page.$(this.searchPredicateTextSelector))
    }

    async clickSearchButton() { 
        await common.clickSelector(this.page, this.searchButtonSelector)
    }

    async clickSaveSearchCriteria() {
        await common.clickSelector(this.page, this.saveSearchCriteriaSelector)
    }

    async clickRemoveAllButton() { 
        await common.clickSelector(this.page, this.removeAllButtonSelector)
    }

    //---- right pane / Full Text Element predicate
    async clickFullTextElementClickToInsert() { 
        await common.clickSelector(this.page, this.fullTextElementClickToInsertSelector)
    }

    async typeFullTextElementTerm(term) {
        await common.typeIntoSelector(this.page, this.fullTextElementInputSelector, term)
    }

    //---- right pane / Is Collected predicate  

    //sets the IsCollected predicate operator to op (Is, Is Not)
    async clickNthOperator(n) {
        await common.waitForFirst(this.page, this.isCollectedOperatorClickSelector)
        let allOperators = await this.page.$$(this.isCollectedOperatorClickSelector)
        await allOperators[n].click()
    }

    async selectIsOperator(op) { 
        await common.waitForFirst(this.page, this.isCollectedOperatorMenuItemsSelector)
        let opElement = await common.findElementInListHavingText(await this.page.$$(this.isCollectedOperatorMenuItemsSelector), op)
        await opElement.click()
        await common.waitForTimeout(200)
    }
}

module.exports = SearchPage