const common = require("../../common")
const BasePageObject = require("../BasePageObject")

class TopNavigation extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)

        this.containerSelector = `#mainNavBar`

        //user dropdown
        this.userMenuButtonSelector = `#btnUser`
        this.userMenuOptionsSelector = `#menuUser li a`

        //admin dropdown
        this.adminMenuButtonSelector = `#btnRgAdministration`
        this.adminMenuOptionsSelector = `#menuRgAdministration li`

        //policy notification
        this.policyNotificationButtonSelector = `#btnPolicyNotification`

        //toasts. hopefully they are always here on each page
        this.toastContainerSelector = `.bp4-toast-container`

        // tasks
        this.taskCountSelector = `#mainNavNumTotalTasks`
    }

    async assertAtPage() {
        await common.waitForFirst(this.page, this.containerSelector)        
    }

    //user dropdown
    async clickUserMenu() { 
        await common.clickSelector(this.page, this.userMenuButtonSelector)        
        await common.waitForTimeout(500)
    }

    async clickUserMenuItem(item) { 
        await common.waitForFirst(this.page, this.userMenuOptionsSelector)
        let menuItem = await common.findElementInListHavingText(await this.page.$$(this.userMenuOptionsSelector), item)        
        await menuItem.click()
    }

    //admin dropdown
    async clickAdminMenu() { 
        await common.clickSelector(this.page, this.adminMenuButtonSelector)        
    }

    async clickAdminMenuItem(item) { 
        await common.waitForFirst(this.page, this.adminMenuOptionsSelector)
        let menuItem = await common.findElementInListHavingText(await this.page.$$(this.adminMenuOptionsSelector), item)
        await menuItem.click()
    }

    //polocy notification button
    async clickPolicyNotificationButton() {
        await common.clickSelector(this.page, this.policyNotificationButtonSelector)
    }

    //toasts
    async getToastMessage() { 
        return await common.getTextOfSelector(this.page, this.toastContainerSelector)
    }

    async waitForToastMessageToContain(expectedText, timeout=200000) { 
        await common.waitForText(this.page, this.toastContainerSelector, expectedText, timeout )
    }

    async waitForToastsToGoAway() { 
        await common.waitForNone(this.page, this.toastContainerSelector)
        await common.waitForTimeout(2000)
    }

    // tasks count
    async waitForTaskCount(expectedText, timeout=150000) { 
        await common.waitForText(this.page, this.taskCountSelector, expectedText, timeout )
    }
}

module.exports = TopNavigation