const common = require("../../common");
const BasePageObject = require("../BasePageObject");

class AddCustodianModal extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)  
        
        this.headerSelector = `.bp4-dialog-header`
        this.closeButtonSelector = `.bp4-dialog-footer button`
        this.custodianNameSelector = `.ag-cell div`
        this.custodianRowSelector = `.ag-row`
        this.addCustodianButtonSelector = `[col-id="action"]`

    }   
    async assertAtPage() { 
        await common.waitForText(this.page, this.headerSelector, "Add Custodian")
    }

    async _findCustodianRow(name) {
        await common.waitForText(this.page, this.custodianNameSelector, name)
        let custodian = await common.findElementWithChildHavingText(this.page, this.custodianRowSelector, this.custodianNameSelector, name)
        if(!custodian) {
            throw new Error(`unable to locate a custodian ${custodian}`)
        }
        return custodian
    }

    async addSelectedCustodian(custodian) {
        let rowCustodian = await this._findCustodianRow(custodian)
        let element = await rowCustodian.$(this.addCustodianButtonSelector)
        await element.hover()
        await element.click()
        // let checkedCircle = await element.boundingBox()
        // await this.page.mouse.click(checkedCircle.x+10, checkedCircle.y+10)
        await common.waitForTimeout(1000)
    }

    async clickCloseButton() { 
        await common.clickSelector(this.page, this.closeButtonSelector)
        await common.waitForTimeout(1000)
    }    

}

module.exports = AddCustodianModal