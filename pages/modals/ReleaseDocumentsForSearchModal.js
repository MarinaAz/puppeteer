const common = require("../../common");
const BasePageObject = require("../BasePageObject");

class ReleaseDocumentsForSearchModal extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)  
        
        this.headerSelector = `h6`
        this.selectSearchSelector = `.SavedSearchSelector input`
        this.selectSearchOptionsSelector = `ul[aria-label="selectable options"] li a`
        this.buttonsSelector = `.bp4-dialog-footer-actions button`

    }   

    async assertAtPage() { 
        await common.waitForText(this.page, this.headerSelector, "Release Documents")
    }

    async clickSelectSearch() {
        await common.clickSelector(this.page, this.selectSearchSelector)
        await common.waitForTimeout(500)
    }

    async addSelectedSearch(search) {
        await common.waitForFirst(this.page, this.selectSearchOptionsSelector, search)
        let menuItem = await common.findElementInListHavingText(await this.page.$$(this.selectSearchOptionsSelector), search)
        await menuItem.click()
        await common.waitForTimeout(500)
    }

    async clickButton(buttonText) { 
        let buttonElement = await common.findElementInListHavingText(await this.page.$$(this.buttonsSelector), buttonText)
        if(!buttonElement) { 
            throw new Error(`unable to find button ${buttonText}`)
        }
        await buttonElement.click()
        await common.waitForTimeout(1000)
    }    

}

module.exports = ReleaseDocumentsForSearchModal