const DatabaseAndIntegrationConfigurationPage = require("../pages/DatabaseAndIntegrationConfigurationPage")
const SystemDashboardPage = require("../pages/SystemDashboardPage")
const TopNavigation = require("../pages/components/TopNavigation")
const LoginUtil = require("../util/LoginUtil")
const BrowserHelper = require("../util/BrowserHelper")
const chai = require('chai')
const RunSwitchSchemaAndSynchronizationModal = require("../pages/modals/RunSwitchSchemaAndSynchronizationModal")

describe(`Switch Schema`, async function() {

    let loginUtil
    let topNavigation
    let systemDashboardPage
    let databaseAndIntegrationConfigurationPage
    let runSwitchSchemaAndSynchronizationModal
    let browserHelper 

    //test data vars
    let testDataMostRecentId

    before(async function () {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)
        topNavigation = new TopNavigation(browserHelper.browser, browserHelper.page)        
        systemDashboardPage = new SystemDashboardPage(browserHelper.browser, browserHelper.page)
        databaseAndIntegrationConfigurationPage = new DatabaseAndIntegrationConfigurationPage(browserHelper.browser, browserHelper.page)
        runSwitchSchemaAndSynchronizationModal = new RunSwitchSchemaAndSynchronizationModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser()
    })

    it(`System Dashboard page loads`, async function() {
        await topNavigation.clickAdminMenu()
        await topNavigation.clickAdminMenuItem('System Dashboard')
        await systemDashboardPage.assertAtPage()
    })

    it(`Clicking Switch Schema and Synchronization History loads Syncronization table`, async function() {
        await systemDashboardPage.clickOperationLink('Switch Schema and Synchronization History')
        await systemDashboardPage.waitForSwitchSchemaToLoad()
    })

    it(`Most recent entry in Switch Schema table shows 'Finished'`, async function() {
        const actualFirstRowValues = await systemDashboardPage.getSwitchSchemaFirstRowValues()
        //save the current most recent id so we can be sure we trigger a new one later in this test
        testDataMostRecentId = actualFirstRowValues[1]

        chai.expect(
            actualFirstRowValues[4]
        ).to.equal('Finished')        
    })

    it(`Clicking Run Switch Schema and Syncronization button starts a schema switch'`, async function() { 
        await systemDashboardPage.clickRunSwitchSchemaAndSyncButton()
        await runSwitchSchemaAndSynchronizationModal.assertAtPage()
        await runSwitchSchemaAndSynchronizationModal.clickRunButton()
    })

    it(`User eventually gets a success toast for schema switch success`, async function() {         
        await topNavigation.waitForToastMessageToContain('Switch Schema has completed', 100000)
    })

    it(`Reloading the page shows a new entry in switch schema table`, async function() {
        await browserHelper.page.reload()
        await systemDashboardPage.assertAtPage()
        await systemDashboardPage.clickOperationLink('Switch Schema and Synchronization History')
        await systemDashboardPage.waitForSwitchSchemaToLoad()
        const actualFirstRowValues = await systemDashboardPage.getSwitchSchemaFirstRowValues()
        chai.expect(
            actualFirstRowValues[1], 
            "did not find a new id after running switch schema in table"
        ).to.not.equal(testDataMostRecentId) 
    })

    it(`Executed schema switch is reported as finished in history table`, async function() {
        chai.expect(
            (await systemDashboardPage.getSwitchSchemaFirstRowValues())[4]
        ).to.equal('Finished')  
    })

    it(`Database & Integration page, Batch Data Processing configuration has Processing and Halt blocked UNCHECKED`, async function() {
        await topNavigation.clickAdminMenu()
        await topNavigation.clickAdminMenuItem('Database & Integration')
        await databaseAndIntegrationConfigurationPage.assertAtPage()
        await databaseAndIntegrationConfigurationPage.clickOperationLink('Batch Data Processing')
        await databaseAndIntegrationConfigurationPage.waitForBatchDataProcessingToLoad()

        chai.expect(
            await databaseAndIntegrationConfigurationPage.getBatchDataProcessingTableBooleanValueForName('Processing Blocked')
        ).to.be.false

        chai.expect(
            await databaseAndIntegrationConfigurationPage.getBatchDataProcessingTableBooleanValueForName('Halt Processing')
        ).to.be.false
        
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

