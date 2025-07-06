const common = require("../../common");
const BasePageObject = require("../BasePageObject");
const TreeView = require("../components/TreeView");

class AddFolderModal extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)  
        
        this.headerSelector = `h6`
        this.buttonsSelector = `.bp4-dialog-footer-actions button`

        this.treeView = new TreeView(browser, page)
    }   
    async assertAtPage() { 
        await common.waitForText(this.page, this.headerSelector, "Add Folder")
    }

    async clickButton(buttonText) { 
        let buttonElement = await common.findElementInListHavingText(await this.page.$$(this.buttonsSelector), buttonText)
        if(!buttonElement) { 
            throw new Error(`unable to find button ${buttonText}`)
        }
        await buttonElement.click()
        await common.waitForTimeout(2000)
    }    

}

module.exports = AddFolderModal