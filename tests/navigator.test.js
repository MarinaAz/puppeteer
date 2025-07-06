const NavigatorPage = require("../pages/NavigatorPage")
const TopNavigation = require("../pages/components/TopNavigation")
const LoginUtil = require("../util/LoginUtil")
const chai = require('chai')
const NavigatorSearchResultsPage = require("../pages/NavigatorSearchResultsPage")
const BrowserHelper = require("../util/BrowserHelper")
const common = require("../common")
const config = require("config")
chai.use(require('chai-string'))

describe(`RG Navigator`, async function () { 
    let loginUtil
    let topNavigation
    let navigatorPage
    let navigatorSearchResultsPage
    let browserHelper

    before(async function () {
        browserHelper = new BrowserHelper()
        await browserHelper.init()
        
        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)
        topNavigation = new TopNavigation(browserHelper.browser, browserHelper.page)
        navigatorPage = new NavigatorPage(browserHelper.browser, browserHelper.page)
        navigatorSearchResultsPage = new NavigatorSearchResultsPage(browserHelper.browser, browserHelper.page) 
        
        await loginUtil.loginAsRGLocalUser()
    })

    it(`Navigator page loads`, async function() {        
        await topNavigation.clickAdminMenu()
        await topNavigation.clickAdminMenuItem('Navigator')
        await navigatorPage.assertAtPage()
    })

    it(`Navigator page has task count buttons`, async function() {        
        chai.expect(
            await navigatorPage.getTaskCountButtonLabels()
        ).to.have.ordered.members([ 'Pending', 'Running', 'Completed', 'Failed' ])        
    })
    
    it(`Navigator page has expected list of agents`, async function() { 
        chai.expect(
            await navigatorPage.getAgentDropdownOptions()
        ).to.have.members([
            'Dropbox',
            'Exchange',
            'File Share',
            'Google Drive',
            'Google Mail',
            'Office 365 - SharePoint/OneDrive',
            'SharePoint',
            'Disconnected Data'
          ])        
    })


    //this smells very environment-dependent. depending on how much it changes, or if we are to target different envs, we might want to configify this expected out to config
    it(`Agents have expected connections`, async function() {         
        await navigatorPage.selectAgentDropdown('Dropbox')      
        chai.expect(
            await navigatorPage.getAgentConnectionPaneRows()
        ).to.be.empty          

        await navigatorPage.selectAgentDropdown('Exchange')
        chai.expect(
            await navigatorPage.getAgentConnectionPaneRows()
        ).to.have.members(['Connection to 4xw05l.onmicrosoft.com']) 

        await navigatorPage.selectAgentDropdown('File Share')
        chai.expect(
            await navigatorPage.getAgentConnectionPaneRows()
        ).to.have.members([
            'Connection to rg-share.rg.local'
        ])        
        
        await navigatorPage.selectAgentDropdown('Google Drive')
        chai.expect(
            await navigatorPage.getAgentConnectionPaneRows()
        ).to.be.empty

        await navigatorPage.selectAgentDropdown('Google Mail')
        chai.expect(
            await navigatorPage.getAgentConnectionPaneRows()
        ).to.be.empty 

        await navigatorPage.selectAgentDropdown('Office 365 - SharePoint/OneDrive')
        chai.expect(
            await navigatorPage.getAgentConnectionPaneRows()
        ).to.be.empty

        await navigatorPage.selectAgentDropdown('SharePoint')
        chai.expect(
            await navigatorPage.getAgentConnectionPaneRows()
        ).to.have.members([
            'Connection to sp2016.qa.rg.local'
        ])

        await navigatorPage.selectAgentDropdown('Disconnected Data')
        chai.expect(
            await navigatorPage.getAgentConnectionPaneRows()
        ).to.have.members([
            'Dropbox',
            'Exchange',
            'File Share',
            'Google Drive',
            'Google Mail',
            'Office 365 - SharePoint/OneDrive',
            'SharePoint'
        ])
    })

    it(`Expanding an agent connection shows expected repositories`, async function() { 
        await navigatorPage.selectAgentDropdown('File Share')
        await navigatorPage.clickExpandForAgentConnectionPaneRow('Connection to rg-share.rg.local')
        chai.expect(
            await navigatorPage.getAgentConnectionPaneRows()
        ).to.include.members([
            'Connection to rg-share.rg.local',
            '\\\\rg-share.rg.local\\swap\\kseleznev\\'
        ])        
    })         
    
    it(`Expanding an agent connection repository shows expected contents`, async function() { 
        await navigatorPage.clickExpandForAgentConnectionPaneRow('\\\\rg-share.rg.local\\swap\\kseleznev\\')
        chai.expect(
            await navigatorPage.getAgentConnectionPaneRows()
        ).to.include.members([
            '\\\\rg-share.rg.local\\swap\\kseleznev\\',
            '!!!!!',
            '!!endpoint 1705--2'
        ])
    })

    it(`Clicking an agent connection repository row loads documents into right pane`, async function() { 
        await navigatorPage.clickAgentConnectionPaneRow('doc')        
        chai.expect(
            await navigatorPage.getDocumentNames()
        ).to.include.members([
            'file10053.txt', 
            'file10333.txt', 
            'file10429.txt',
            'file10506.txt', 
            'file10536.txt', 
            'file10770.txt',
            'file10944.txt',
        ])        
    })

    it(`Running a search produces results`, async function() {
        await navigatorPage.typeAndSearch(config.get('navigator.searchTerm'))
        await navigatorSearchResultsPage.assertAtPage()        
        await navigatorSearchResultsPage.waitForFirstResult()
        chai.expect(
            await navigatorSearchResultsPage.getResultPaths()
        ).to.include.members(config.get('navigator.expectedPaths'))        
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})