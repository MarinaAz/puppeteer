const common = require("../../common");
const BasePageObject = require("../BasePageObject");

class DocumentList extends BasePageObject {
    constructor(browser, page) {
        super(browser, page)

        this.documentMetadataColumnNamesSelector = `.ag-header .ag-header-container .ag-header-cell .ag-header-cell-text`
        this.documentMetadataColumnCellSelector = `.ag-header-container .ag-header-cell-sortable`
        this.configureColumnsTopMenuSelector = `.ActionsBar button span[icon="cog"]`
        this.configureColumnsMetadataNamesSelector = `.ag-center-cols-container div[col-id="name"] .ag-cell-value`
        this.configureColumnsMetadataTopButtonSelector = `.MetadataFields .header-buttons button`
        this.configureColumnsMetadataFooterButtonSelector = `.ConfigureMetadata .footer-buttons button`
        this.findFiltersFieldSelector = `.header-buttons input`
        this.metadataRowsSelector = `.ag-row`
        this.metadataNamesSelector = `.ag-center-cols-container .NameCellRenderer .field-name`
        this.metadataAddButtonSelector = `.metadata-panels .ag-center-cols-container .ag-cell span[icon="add"] svg`
        this.metadataRemoveButtomSelector = `.ag-center-cols-container .ag-cell span[icon="remove"] svg`

        this.documentNamesSelector = `.DocumentNameRenderer .name-label`
        this.documentRowsSelector = `.ag-pinned-left-cols-container .ag-row`
        this.documentRowCheckboxSelector = `.ag-cell .MarkCellRenderer svg`   
        this.documentNameSelector = `.DocumentNameRenderer span`
        this.documentsCountSelector = `.DocumentCounter`
        this.openDocumentTreeSelector = `.DocumentsList .ag-pinned-left-cols-container .ag-icon-tree-closed`
        this.documentIconSelector = `.DocumentNameRenderer .name-icon`

        this.deduplicateToggleSelector = `.ActionsBar .bp4-switch input`
    }

    // documents metadata column names
    async openConfigureColumnsMenu() {
        await common.clickSelector(this.page, this.configureColumnsTopMenuSelector)
        await common.waitForTimeout(1000)
    }

    async getDocumentMetadataListNames() {
        return await common.getTextOfElements(await this.page.$$(this.configureColumnsMetadataNamesSelector))
    }

    async clickTopMetadataButton(button) {
        await common.waitForFirst(this.page, this.configureColumnsMetadataTopButtonSelector)
        let buttonElement = await common.findElementInListHavingText(await this.page.$$(this.configureColumnsMetadataTopButtonSelector), button)
        if(!buttonElement) {
            throw new Error(`unable to locate button ${button}`)
        }
        await buttonElement.click()
        await common.waitForTimeout(1000)
    }

    async typeMetadata(metadata) {
        await common.typeIntoSelector(this.page, this.findFiltersFieldSelector, metadata)
        await common.waitForTimeout(1000)
        await this.page.keyboard.press('Enter')
        await common.waitForTimeout(1000)
    }

    async _findMetadataRow(rowName) { 
        let row = await common.findElementWithChildHavingText(this.page, this.metadataRowsSelector, this.metadataNamesSelector, rowName)
        if(!row){
            throw new Error(`unable to find metadata row ${rowName}`)            
        }
        return row
    }

    async addMetadataField(metadata) { 
        let rowElement = await this._findMetadataRow(metadata)
        await rowElement.hover()
        let metadataElement = await rowElement.$(this.metadataAddButtonSelector)
        await metadataElement.click()
    }

    async _findConfigureColumnsMetadataRow(rowName) {
        let row = await common.findElementWithChildHavingText(this.page, this.metadataRowsSelector, this.configureColumnsMetadataNamesSelector, rowName)
        if(!row){
            throw new Error(`unable to find row ${rowName}`)
        }
        return row
    }

    async removeMetadataField(metadata) {
        let rowElement = await this._findConfigureColumnsMetadataRow(metadata)
        await rowElement.hover()
        let metadataElement = await rowElement.$(this.metadataRemoveButtomSelector)
        await metadataElement.click()
    }

    async clickFooterMetadataButton(button) {
        await common.waitForFirst(this.page, this.configureColumnsMetadataFooterButtonSelector)
        let toolbarElement = await common.findElementInListHavingText(await this.page.$$(this.configureColumnsMetadataFooterButtonSelector), button)
        if(!toolbarElement) {
            throw new Error(`unable to locate button ${button}`)
        }
        await toolbarElement.click()
        await common.waitForTimeout(1000)
    }

    async getDocumentMetadataColumnNames() {
        return await common.getTextOfElements(await this.page.$$(this.documentMetadataColumnNamesSelector))
    }

    //drag and drop item to the left
    async moveItemLeft(columnName, targetColumnName) {
        try{
            // Find the column elements
            let moveColumnElement = await this._findColumnRow(columnName)
            let targetColumnElement = await this._findColumnRow(targetColumnName)

            if(!moveColumnElement || !targetColumnElement) {
                throw new Error('Column elements not found')
            }

            // Get the bounding boxes for each column
            let moveElementBox = await moveColumnElement.boundingBox();
            let targetElementBox = await targetColumnElement.boundingBox(); 

            if(!moveElementBox || !targetElementBox) {
                throw new Error('Bounding boxes could not be determined')
            }

            // Calculate the target position for dragging left
            const targetX = targetElementBox.x + targetElementBox.width / 2 - 25
            const targetY = targetElementBox.y + targetElementBox.height / 2

            // Move the mouse to the start position
            await this.page.mouse.move(moveElementBox.x + moveElementBox.width / 2, moveElementBox.y + moveElementBox.height / 2)

            // Initiate drag
            await this.page.mouse.down()

            // Perform the drag to the target position on the left
            await this.page.mouse.move(targetX, targetY, {steps: 10})

            // Complete the drag-and-drop
            await this.page.mouse.up()

            await this.page.waitForTimeout(3000)

        } catch (error) {
            console.error('Error moving item:', error.message)
        }
    }

    async _findColumnRow(label) { 
        await common.waitForText(this.page, this.documentMetadataColumnNamesSelector, label)
        let row = await common.findElementWithChildHavingText(this.page, this.documentMetadataColumnCellSelector, this.documentMetadataColumnNamesSelector, label)
        if(!row) { 
            throw new Error(`unable to find item in left pane tree ${label}`)
        }
        return row
    }
    
    //returns a list of documents displayed
    async getDocuments() {
        return await common.getTextOfElements(await this.page.$$(this.documentNamesSelector))
    }

    async waitForFirstDocument() {
        await common.waitForFirst(this.page, this.documentNamesSelector)
        //and then a bit more, as sometimes search results can what appears to be reload
        await common.waitForTimeout(2000)
    }

    async getDocumentNames() {
        await common.waitForFirst(this.page, this.documentNameSelector)
        return await common.getTextOfElements(await this.page.$$(this.documentNameSelector))
    }

    async getDocumentsCount() {
        await common.waitForTextToNotBePresent(this.page, this.documentsCountSelector, "Loading" )
        return await common.getTextOfElement(await this.page.$(this.documentsCountSelector))
    }

    //select a document
    async clickDocumentCheckbox(document) { 
        let rowElement = await this._findDocumentRow(document)
        let checkboxElement = await rowElement.$(this.documentRowCheckboxSelector)
        await checkboxElement.click()
    }

    async clickNthDocumentCheckbox(n) {
        await common.waitForFirst(this.page, this.documentRowCheckboxSelector)
        let allCheckboxes = await this.page.$$(this.documentRowCheckboxSelector)
        await allCheckboxes[n].click()
    }

    async _findDocumentRow(rowName) { 
        let row = await common.findElementWithChildHavingText(this.page, this.documentRowsSelector, this.documentNamesSelector, rowName)
        if(!row){
            throw new Error(`unable to find search result row ${rowName}`)            
        }
        return row
    }

    async isDocumentIconPresent() {
        let selectedAttributeValue = await common.getElementAttribute(this.page, await this.page.$(this.documentIconSelector), "class")
        return selectedAttributeValue.includes('icon')
    }

    async selectDocument(documentName) {
        await common.waitForText(this.page, this.documentNamesSelector, documentName)
        let documentElement = await common.findElementInListHavingText(await this.page.$$(this.documentNamesSelector), documentName)
        await documentElement.click()
        await common.waitForTimeout(1000)
    }

    async expandNthDocumentTree(n) {
        await common.waitForFirst(this.page, this.openDocumentTreeSelector)
        let allArrows = await this.page.$$(this.openDocumentTreeSelector)
        await allArrows[n].click()
        await common.waitForTimeout(500)
    }

    //opens the viewer
    async clickDocument(documentName) { 
        await common.waitForText(this.page, this.documentNamesSelector, documentName)
        let documentLinkElement = await common.findElementInListHavingText(await this.page.$$(this.documentNamesSelector), documentName)
        await documentLinkElement.click()        
        await common.waitForTimeout(1000) 
    }

    async clickNthDocument(n) {
        await common.waitForFirst(this.page, this.documentNamesSelector)
        let allDocuments = await this.page.$$(this.documentNamesSelector)
        await allDocuments[n].click()
        await common.waitForTimeout(500)
    }

    //click 'Deduplicate' toggle
    async clickDeduplicateToggle() {
        await common.clickSelector(this.page, this.deduplicateToggleSelector)
        await common.waitForTimeout(1000)
    }
}

module.exports = DocumentList