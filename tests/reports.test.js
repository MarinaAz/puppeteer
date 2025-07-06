const ReportConfigurationPage = require("../pages/ReportConfigurationPage")
const TopNavigation = require("../pages/components/TopNavigation")
const LoginUtil = require("../util/LoginUtil")
const BrowserHelper = require("../util/BrowserHelper")
const chai = require('chai')
describe(`Reports`, async function () { 
    let loginUtil
    let topNavigation
    let reportConfigurationPage
    let browserHelper
    
    before(async function() { 
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)
        topNavigation = new TopNavigation(browserHelper.browser, browserHelper.page)
        reportConfigurationPage = new ReportConfigurationPage(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser()
    })

    it(`Report Configuration page loads`, async function() { 
        await topNavigation.clickAdminMenu()
        await topNavigation.clickAdminMenuItem('Report Configuration')
        await reportConfigurationPage.assertAtPage()
    })

    it(`Report Configuration reports table contains expected amount of pages`, async function() { 
        chai.expect(
            await reportConfigurationPage.getLeftPaneTableTotalPageCount()
        ).to.equal('3')
    })

    it(`Report Configuration reports table page1 contains expected reports`, async function() { 
        chai.expect(
            await reportConfigurationPage.getLeftPaneTableReportNames()
        ).to.have.ordered.members([
            'Action Blockage',
            'Administrator Legal Overview',
            'Administrators Records Retention',
            'Backup Report',
            'Collection',
            'Copy Log',
            'Custodian Legal Obligations',
            'Cybersecurity Alert Report - Smart PII',
            'Data Summary',
            'Document Access Log',
            'Document Chain of Custody',
            'Exchange Ingestion',
            'Extraction Errors',
            'Failed Login Attempts',
            'File Errors'            
          ])  
    })

    it(`Report Configuration reports table page2 contains expected reports`, async function() { 
        await reportConfigurationPage.clickLeftPaneTableNextPage()
        chai.expect(
            await reportConfigurationPage.getLeftPaneTableReportNames()
        ).to.have.ordered.members([
            'Health Check',
            'Inaccessible Content',
            'Location Errors',
            'Navigator Deletion',
            'Navigator Tasks Duration',
            'Notification Activity',
            'Notification Metrics',
            'Notification Response',
            'Policy Details and Modification',
            'Preservation',
            'Project Content Custodian',
            'Project Deletion',
            'Project Info Summary',
            'RG Components',
            'Record Traceability'            
        ])  
    })

    it(`Report Configuration reports table page3 contains expected reports`, async function() { 
        await reportConfigurationPage.clickLeftPaneTableNextPage()
        chai.expect(
            await reportConfigurationPage.getLeftPaneTableReportNames()
        ).to.have.ordered.members([
            'Records Retention',
            'Search Log',
            'Site Access Log',
            'Unmapped Content',
            'User Activity Audit Log',
            'User Permissions & Audit Log',
            'User Permissions & Audit Log [Project]'
        ])  
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })

})