const common = require("../../common");
const BasePageObject = require("../BasePageObject");

//scopeSelector should be passed in to define scope, in the case where there are 2 of these present on the page
class TreeView extends BasePageObject {
    constructor(browser, page, scopeSelector="") {
        super(browser, page)  
        this.scopeSelector = scopeSelector

        this.folderTreeNamesSelector = `${this.scopeSelector} .ag-group-value .DocumentsetTreeCellRenderer`
        this.folderTreeRowsSelector = `${this.scopeSelector} .ag-row`
        this.folderTreeRowNameSelector = `.ag-row .ag-group-value`
        this.folderTreeRowExpandSelector = `.ag-icon-tree-closed`
        this.folderTreeRowOpenMenuSelector = `svg[data-icon="more"]`
        this.folderTreeRowSelectSelector = `.ag-group-value .item-name`
        this.folderTreeMenuOptionsSelector = `.bp4-popover-content li a`
        this.addFolderCheckCircleSelector = `svg[data-icon="add"]`

    }

    async assertAtPage() {
        if(this.scopeSelector) {
            await common.waitForFirst(this.page, this.scopeSelector)
        }        
    }

    async getItems() { 
        await common.waitForFirst(this.page, this.folderTreeNamesSelector)
        return await common.getTextOfElements(await this.page.$$(this.folderTreeNamesSelector))
    }

     //expands an item 
     async expandItem(item) { 
        let rowElement = await this._findTreeRow(item)
        let expandElement = await rowElement.$(this.folderTreeRowExpandSelector)
        await expandElement.click()
        await common.waitForTimeout(2000)
    }

    //opens a item menu
    async openItemMenu(item) {
        let rowElement = await this._findTreeRow(item)
        let menuElement = await rowElement.$(this.folderTreeRowOpenMenuSelector)
        await menuElement.hover()
        await menuElement.click()
        await common.waitForTimeout(1000)
    }

    //assumes openItemMenu has been called, selects menuItem from the menu
    async selectItemMenuItem(menuItem) {
        await common.waitForTimeout(500)
        await common.waitForFirst(this.page, this.folderTreeMenuOptionsSelector, menuItem)
        let menuItemElement = await common.findElementInListHavingText(await this.page.$$(this.folderTreeMenuOptionsSelector), menuItem)
        await menuItemElement.click()
        await common.waitForTimeout(1000)
    }

    //selects a left pane item
    async selectItem(item) { 
        let rowElement = await this._findTreeRow(item)
        let selectElement = await rowElement.$(this.folderTreeRowSelectSelector)
        await selectElement.click()
        await common.waitForTimeout(2000)
    }

    //drag and drop item 
    async moveItemUp(fieldName, targetFieldName) {
        
        //find field
        let moveFieldElement = await this._findTreeRow(fieldName)
        let targetFieldElement = await this._findTreeRow(targetFieldName)

        let moveElementBox = await moveFieldElement.boundingBox();
        let targetElementBox = await targetFieldElement.boundingBox();  

        await this.page.mouse.move(moveElementBox.x + moveElementBox.width / 2, moveElementBox.y + moveElementBox.height / 2)          
        await this.page.mouse.down()        
        await this.page.mouse.move(targetElementBox.x + targetElementBox.width / 2, (targetElementBox.y + targetElementBox.height / 2) - 25, { steps: 7 })        
        await this.page.mouse.up()
        await common.waitForTimeout(1000)
    }

    async moveItemDown(fieldName, targetFieldName) {

        //find field
        let moveFieldElement = await this._findTreeRow(fieldName)
        let moveElementBox = await moveFieldElement.boundingBox()
        
        //move to center of field        
        await this.page.mouse.move(moveElementBox.x + moveElementBox.width / 2, moveElementBox.y + moveElementBox.height / 2)      
        await this.page.mouse.down()
        //move down just a few pixels first
        await this.page.mouse.move(moveElementBox.x + moveElementBox.width / 2, (moveElementBox.y + moveElementBox.height / 2) +20)              

        let targetFieldElement = await this._findTreeRow(targetFieldName)
        let targetFieldElementBox = await targetFieldElement.boundingBox()

        await this.page.mouse.move(targetFieldElementBox.x + targetFieldElementBox.width / 2, targetFieldElementBox.y + targetFieldElementBox.height / 2, { steps: 7 })        
        await this.page.mouse.up()
        await common.waitForTimeout(2000)
    }

    async nestField(fieldName, targetFieldName) {
        let fieldElement = await common.findElementInListHavingText(await this.page.$$(this.folderTreeRowNameSelector), fieldName)
        if (!fieldElement) { throw new Error(`unable to find coding field "${fieldName}"`) }

        let targetElement = await common.findElementInListHavingText(await this.page.$$(this.folderTreeRowNameSelector), targetFieldName)
        if (!targetElement) { throw new Error(`unable to find coding field "${targetElement}"`) }

        let fieldElementBox = await fieldElement.boundingBox();
        let targetElementBox = await targetElement.boundingBox();
        await this.page.mouse.move(fieldElementBox.x + fieldElementBox.width / 2, fieldElementBox.y + fieldElementBox.height / 2)      
        await this.page.mouse.down()
        await this.page.mouse.move(targetElementBox.x + targetElementBox.width / 2, targetElementBox.y + targetElementBox.height / 2, { steps: 7 })
        await this.page.mouse.up()
        await common.waitForTimeout(1000)
    }

    async isItemFoldered(folderName) {
        await common.waitForTimeout(250)
        let itemName = await this._findTreeRow(folderName)
        let itemNameClass = await common.getElementAttribute(this.page, itemName, 'class')
        return itemNameClass.includes('ag-row-level-2')
    }

    async _findTreeRow(label) { 
        await common.waitForText(this.page, this.folderTreeNamesSelector, label)
        let row = await common.findElementWithChildHavingText(this.page, this.folderTreeRowsSelector, this.folderTreeRowNameSelector, label)
        if(!row) { 
            throw new Error(`unable to find item in left pane tree ${label}`)
        }
        return row
    }

    async addSelectedFolder(folder) {
        let rowSearch = await this._findTreeRow(folder)
        let checkedCircle = await rowSearch.$(this.addFolderCheckCircleSelector)
        await checkedCircle.click()
        await common.waitForTimeout(1000)
    }
}

module.exports = TreeView