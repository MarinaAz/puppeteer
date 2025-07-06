const common = require("../../common");
const BasePageObject = require("../BasePageObject");

class ChooseDownloadOptionModal extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)  
        
        this.headerSelector = `.CsvColumnsSelectorDialog h6`
        this.footerButtonsSelector = `.CsvColumnsSelectorDialog .bp4-dialog-footer button`
    }   

    async assertAtPage() { 
        await common.waitForText(this.page, this.headerSelector, "Choose download option")
    }

    async clickFooterButton(buttonText) { 
        let buttonElement = await common.findElementInListHavingText(await this.page.$$(this.footerButtonsSelector), buttonText)
        await buttonElement.click()
    }

}

module.exports = ChooseDownloadOptionModal