const common = require('../../common');
const BasePageObject = require('../BasePageObject');

class RRCMatterListingPage extends BasePageObject { 

    constructor(browser, page) { 
        super(browser, page);

        this.uri = `/#/app/matter/listing`
        this.headerTextSelector = `matter-list section h1`
        //this selector works when we DON'T have pre-discovery button on top navigation
        //this.selector = '[data-test-id="nav-item-matters"]'
        //this selector works when we have pre-discovery button on top navigation
        this.selector = '[data-test-id="nav-item-matters"]:nth-child(3)'
        //Integration - specific goto method for Cinnamon role as button location changes based on the role, Prediscovery doesn't exist for Cinnamon
        this.otherSelector = '[data-test-id="nav-item-matters"]'
        //table selectors
        this.matterTableNamesSelector = 'matter-table mat-row [data-test-id="matter-link"]'        
        this.matterTableRowsSelector = 'matter-table mat-row'
        this.matterTableRowNameSelector = '[data-test-id="matter-link"]'

    }


    async gotoPage() { 
        await common.clickSelector(this.page, this.selector)
        await common.waitForTimeout(500)
    }

    //Integration - specific goto method for Cinnamon role as button location changes based on the role, Prediscovery doesn't exist for Cinnamon
    async gotoPageOther(){
        await common.clickSelector(this.page, this.otherSelector)
        await common.waitForTimeout(500)
    }

    async assertAtPage() {
        await common.assertHasText(this.page, this.headerTextSelector, "Matters")
    }

    async clickMatter(matterName) {
        let matterRow = await this._getMatterRow(matterName)
        let matterNameCell = await matterRow.$(this.matterTableRowNameSelector)
        await matterNameCell.click()
        await common.waitForTimeout(4000); //initial matter load can take a bit.
    }

    async clickMatterRow(matterName) {
        let matterRow = await this._getMatterRow(matterName)     
        await matterRow.click()
        await common.waitForTimeout(4000); //initial matter load can take a bit.
    }

    async waitForMatter(matterName) { 
        await common.waitForText(this.page, this.matterTableNamesSelector, matterName)
    }

    async _getMatterRow(matterName) {
        await common.waitForText(this.page, this.matterTableNamesSelector, matterName)
        let matterRowElement =  await common.findElementWithChildHavingText(
            this.page,
            this.matterTableRowsSelector,
            this.matterTableRowNameSelector,
            matterName
        )
        if(!matterRowElement) { 
            throw new Error(`unable to find matter named "${matterName}"`)
        }
        return matterRowElement
    }
}
module.exports = RRCMatterListingPage