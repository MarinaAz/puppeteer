const DatabaseAndIntegrationConfigurationPage = require("../pages/DatabaseAndIntegrationConfigurationPage")
const TopNavigation = require("../pages/components/TopNavigation")
const LoginUtil = require("../util/LoginUtil")
const BrowserHelper = require("../util/BrowserHelper")
const chai = require('chai')
const TestDirectoryServiceConfigurationModal = require("../pages/modals/TestDirectoryServiceConfigurationModal")

describe(`AD Sync`, async function () { 
    
    let loginUtil
    let topNavigation
    let databaseAndIntegrationConfigurationPage
    let testDirectoryServiceConfigurationModal
    let browserHelper
    
    before(async function () {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)
        topNavigation = new TopNavigation(browserHelper.browser, browserHelper.page)
        databaseAndIntegrationConfigurationPage = new DatabaseAndIntegrationConfigurationPage(browserHelper.browser, browserHelper.page)
        testDirectoryServiceConfigurationModal = new TestDirectoryServiceConfigurationModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser()
    })
    it(`Administration Configuration page loads`, async function () {
        await topNavigation.clickAdminMenu()
        await topNavigation.clickAdminMenuItem('Database & Integration')
        await databaseAndIntegrationConfigurationPage.assertAtPage()
    })

    it(`Clicking on Directory Service operation loads Directory Service Configuration section`, async function () {
        await databaseAndIntegrationConfigurationPage.clickOperationLink('Directory Service')
        await databaseAndIntegrationConfigurationPage.waitForDirectoryServiceToLoad()
    })

    it(`Test Directory Service Configuration results in success`, async function () {
        await databaseAndIntegrationConfigurationPage.clickTestDirectoryServiceConfigurationButton()
        await testDirectoryServiceConfigurationModal.assertAtPage()
        chai.expect(
            await testDirectoryServiceConfigurationModal.getModalText()
        ).to.equal('Test Directory Service Configuration\nTest Configuration Status: LDAP test passed successfully\nTest\nClose')        
    })

    it(`Test Directory Service Configuration modal closes correctly`, async function () { 
        await testDirectoryServiceConfigurationModal.clickCloseButton()
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})