const common = require("../../common");
const BasePageObject = require("../BasePageObject");

class SaveSearchCriteriaModal extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)  
        
        this.headerSelector = `.ui-dialog-title`
        this.searchNameSelector = `#saveSearchFromSearchPageDialog input`
        this.buttonsSelector = `.ft .button-group .yui-push-button button`
    }   

    async assertAtPage() { 
        await common.waitForText(this.page, this.headerSelector, "Save Search Criteria")
    }

    async typeName(name) {
        await common.typeIntoSelector(this.page, this.searchNameSelector, name)
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

module.exports = SaveSearchCriteriaModal