const common = require("../../common");
const BasePageObject = require("../BasePageObject");

class CreatePolicyModal extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)

        this.headerSelector = `h6`
        this.nameSelector = `.bp4-form-group input[placeholder="Required"]`
        this.descSelector = `.bp4-form-group:nth-child(2) input[type="text"]`
        this.policyRuleSearchSelector = `.PolicyBuilder .SavedSearchSelector`
        this.savedSearchesFormInputSelector = `.bp4-input-group input[placeholder="Filter..."]`
        this.policyRuleActionSelector = `.PolicyBuilder .bp4-popover-target`
        this.policyRuleActionMenuItemSelector = `.bp4-popover-content .bp4-menu-item`
        this.policyRuleWhereCopySelector = `.PolicyBuilder .ExportEndpointSelector`

        // copy
        this.whereCopyEndpointSelector = `.policy-builder-endpoint-popover .bp4-menu-item .bp4-fill`
        this.whenCopySelector = `.PolicyBuilder span:nth-child(11) > span > span`
        this.onOrAfterTimeSelector =  `.on-after-block label` 
        this.whenCopyOnOptionsSelectior = `.bp4-menu li .bp4-popover-dismiss, .bp4-menu li .bp4-popover-wrapper`
        this.whenDurationLabelSelector = `.duration-inputs label`
        this.whenDurationInputSelector = `input`
        this.durationTimeSetOkButtonSelector = `.bp4-transition-container .bp4-button-text`
        this.policyRuleExtractedFilesLinkSelector = `.PolicyBuilder span:nth-child(16)`
        this.policyRuleFullContainersOptionSelector = `.PolicyBuilder span:nth-child(16) .bp4-transition-container`

        // destroy
        this.startDeletingWhenLinkSelector = `.PolicyBuilder span:nth-child(9) > span > span`
        this.custodianOverrideTurnedLinkSelector = `.PolicyBuilder span:nth-child(20) > span > span`
        this.custodianOverrideTurnedLinkMenuOptionSelector = `.PolicyBuilder span:nth-child(20) .bp4-transition-container button`

        // send notification
        this.policyRuleSendNotificationWhenCopyLinkSelector = `.PolicyBuilder span:nth-child(19) .selector-link`
        this.policyRuleSendNotificationWhenDestroyLinkSelector =`.PolicyBuilder span:nth-child(13) .selector-link`
        this.policyRuleSendNotificationWhenLinkMenuOptionSelector = `.PolicyBuilder span:nth-child(19) .bp4-menu-item, .PolicyBuilder span:nth-child(13) .bp4-menu-item`
        this.policyRuleSendNotificationToWhoLinkSelector = `.PolicyBuilder span:nth-child(21) .selector-link, .PolicyBuilder span:nth-child(15) .selector-link`
        this.policyRuleSendNotificationToWhoLinkMenuOptionSelector = `.PolicyBuilder span:nth-child(21) .bp4-menu-item, .PolicyBuilder span:nth-child(15) .bp4-menu-item`
        this.policyRuleSendNotificationPersonLinkSelector = `.PolicyBuilder .CustodiansCondition`
        this.selectCustodianSearchFieldSelector = `.CustodianFilter input`
        this.custodianRowSelector = `.ag-row`
        this.custodianNameSelector = `.ag-cell .bp4-text-overflow-ellipsis`
        this.addCustodianButtonSelector = `[col-id="action"]`
        this.closeSelectCustodiansPanelSelector = `.CloseablePanel i`
        this.closeSentNotificationButtonSelector = `.PolicyBuilder svg[data-icon="small-cross"]`
        this.buttonsSelector = `.bp4-dialog-footer-actions button`
    }   

    async assertAtPage() { 
        await common.waitForText(this.page, this.headerSelector, "Create Policy")
    }

    async typeName(name) {
        await common.typeIntoSelector(this.page, this.nameSelector, name)
    }

    async typeDescription(desc) { 
        await common.typeIntoSelector(this.page, this.descSelector, desc)
    }

    async openPolicyRuleSearch() {
        await common.clickSelector(this.page, this.policyRuleSearchSelector)
        await common.waitForTimeout(1000)
    }

    async searchForSavedSearches(search) {
        await common.typeIntoSelector(this.page, this.savedSearchesFormInputSelector, search)
        await common.waitForTimeout(1000)
        await this.page.keyboard.press('Enter')
        await common.waitForTimeout(1000)
    }

    async openPolicyRuleAction() {
        await common.clickSelector(this.page, this.policyRuleActionSelector)
        await common.waitForTimeout(500)
    }

    async selectPolicyRuleAction(action) {
        let policyAction = await common.findElementInListHavingText(await this.page.$$(this.policyRuleActionMenuItemSelector), action)
        if(!policyAction) {
            throw new Error(`no such option${policyAction}`)
        }
        await policyAction.click()
        await common.waitForTimeout(500)
    }

    // for Copy action Policy Rule
    async openWhereCopy() {
        await common.clickSelector(this.page, this.policyRuleWhereCopySelector)
        await common.waitForTimeout(500)
    }

    async selectEndpointWhereCopy(endpoint) {
        let whereCopyEndpoint = await common.findElementInListHavingText(await this.page.$$(this.whereCopyEndpointSelector), endpoint)
        if(!whereCopyEndpoint) {
            throw new Error(`unable to find endpoint ${endpoint}`)
        }
        await whereCopyEndpoint.click()
        await common.waitForTimeout(500)
    }

    async openWhenCopy() {
        await common.clickSelector(this.page, this.whenCopySelector)
        await common.waitForTimeout(500)
    }

    async selectOnOrAfterTime(time) {
        let onOrAfterTime = await common.findElementInListHavingText(await this.page.$$(this.onOrAfterTimeSelector), time)
        await onOrAfterTime.click()
    }

    async setDurationTime(labelName, value) {
        await common.clickSelector(this.page, this.whenCopySelector)
        let durationElement = await common.findElementInListHavingText(await this.page.$$(this.whenDurationLabelSelector), labelName, true)
        let inputElement = await durationElement.$(this.whenDurationInputSelector)
        await common.typeIntoElement(this.page, inputElement, value)
        await common.waitForTimeout(500)
        await common.clickSelector(this.page, this.durationTimeSetOkButtonSelector)
    }

    async selectWhenOnOption(option) {
        let whenOnOption = await common.findElementInListHavingText(await this.page.$$(this.whenCopyOnOptionsSelectior), option)
        if(!whenOnOption) {
            throw new Error(`unable to find option ${option}`)
        }
        await whenOnOption.click()
        await common.waitForTimeout(500)
    }

    async selectExportFullContainersOption() {
        await common.clickSelector(this.page, this.policyRuleExtractedFilesLinkSelector)
        await common.clickSelector(this.page, this.policyRuleFullContainersOptionSelector)
    }

    async openSendNotificationWhenCopyLink() {
        await common.clickSelector(this.page, this.policyRuleSendNotificationWhenCopyLinkSelector)
        await common.waitForTimeout(1000)
    }

    async openSendNotificationWhenDestroyLink() {
        await common.clickSelector(this.page, this.policyRuleSendNotificationWhenDestroyLinkSelector)
        await common.waitForTimeout(1000)
    }

    async selectSendNotificationWhenLinkMenuOption(option) {
        let menuOption = await common.findElementInListHavingText(await this.page.$$(this.policyRuleSendNotificationWhenLinkMenuOptionSelector), option)
        if(!menuOption) {
            throw new Error(`unable to find option ${option}`)
        }
        await menuOption.click()
        await common.waitForTimeout(500)
    }

    async openSendNotificationToWhoLink() {
        await common.clickSelector(this.page, this.policyRuleSendNotificationToWhoLinkSelector)
        await common.waitForTimeout(500)
    }

    async selectSendNotificationToWhoLinkMenuOption(option) {
        let menuOption = await common.findElementInListHavingText(await this.page.$$(this.policyRuleSendNotificationToWhoLinkMenuOptionSelector), option)
        if(!menuOption) {
            throw new Error(`unable to find option ${option}`)
        }
        await menuOption.click()
        await common.waitForTimeout(500)
    }

    async openSendNotificationToPersonLink() {
        await common.clickSelector(this.page, this.policyRuleSendNotificationPersonLinkSelector)
        await common.waitForTimeout(500)
    }

    // select cusodians
    async searchForCustodianName(name) {
        await common.typeIntoSelector(this.page, this.selectCustodianSearchFieldSelector, name)
        await common.waitForTimeout(500)
        await this.page.keyboard.press('Enter')
        await common.waitForTimeout(500)
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
        await common.waitForTimeout(500)
        await common.clickSelector(this.page, this.closeSelectCustodiansPanelSelector)
    }

    async closeSentNotification() {
        await common.clickSelector(this.page, this.closeSentNotificationButtonSelector)
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
    
    // for Destroy action Policy Rule
    async openStartDeletingWhenLink() {
        await common.clickSelector(this.page, this.startDeletingWhenLinkSelector)
        await common.waitForTimeout(500)
    }

    async openCustodianOverrideTurnedLink() {
        await common.clickSelector(this.page, this.custodianOverrideTurnedLinkSelector)
        await common.waitForTimeout(500)
    }

    async selectCustodianOverrideTurnedOption(option) {
        let overrideOption = await common.findElementInListHavingText(await this.page.$$(this.custodianOverrideTurnedLinkMenuOptionSelector), option)
        if(!overrideOption) {
            throw new Error(`unable to find option ${option}`)
        }
        await overrideOption.click()
        await common.waitForTimeout(500)
    }
}

module.exports = CreatePolicyModal