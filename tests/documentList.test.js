const ProjectNavigation = require("../pages/components/ProjectNavigation")
const LoginUtil = require("../util/LoginUtil")
const SearchPage = require("../pages/SearchPage")
const SearchResultsPage = require("../pages/SearchResultsPage")
const TopNavigation = require("../pages/components/TopNavigation")
const DocumentViewerPage = require("../pages/DocumentViewerPage")
const BrowserHelper = require("../util/BrowserHelper")
const chai = require('chai')
chai.use(require('chai-string'))
const common = require('../common')
const config = require('config')

describe.only('(Document List) 01 Search Results document List functionality', async function() {
    let loginUtil
    let projectNavigation
    let searchPage
    let searchResultsPage 
    let topNavigation
    let documentViewerPage 
    let browserHelper

    before(async function() { 
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        searchPage = new SearchPage(browserHelper.browser, browserHelper.page)
        searchResultsPage = new SearchResultsPage(browserHelper.browser, browserHelper.page)
        topNavigation = new TopNavigation(browserHelper.browser, browserHelper.page)
        documentViewerPage = new DocumentViewerPage(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))        
    })

    it('Open document list on Search Results and check that each element has a generic or specific icon', async function() {        
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideSearchPredicate('Full Text Element')
        await searchPage.clickFullTextElementClickToInsert()
        await searchPage.typeFullTextElementTerm('test')
        await searchPage.clickSearchButton()
        await searchResultsPage.assertAtPage()
        await searchResultsPage.documentList.clickNthDocumentCheckbox(0)
        chai.expect(
            await searchResultsPage.documentList.isDocumentIconPresent()
        ).to.be.true
    })

    it('Add document metadata and verify that it is in the column document metadata list', async function() {
        await searchResultsPage.assertAtPage()
        await searchResultsPage.documentList.openConfigureColumnsMenu()

        // check metadata list 
        chai.expect(
            await searchResultsPage.documentList.getDocumentMetadataListNames()
        ).to.have.ordered.members([
            'Initial Ingestion Date',
            'Size (Bytes)'
        ])

        await searchResultsPage.documentList.clickTopMetadataButton("Add metadata")
        await searchResultsPage.documentList.typeMetadata("File Type")
        await searchResultsPage.documentList.addMetadataField("File Type")
        await searchResultsPage.documentList.clickFooterMetadataButton("Apply")

        // check that added metadata is on the header column list
        chai.expect(
            await searchResultsPage.documentList.getDocumentMetadataColumnNames()
        ).to.have.ordered.members([
            'Initial Ingestion Date',
            'Size (Bytes)',
            'File Type'
        ])
    })

    it('Check that grid fields can be moved with the exception of the Document Name', async function() {
        await searchResultsPage.assertAtPage()
        
        // columns order before move
        chai.expect(
            await searchResultsPage.documentList.getDocumentMetadataColumnNames()
        ).to.have.ordered.members([
            'Initial Ingestion Date',
            'Size (Bytes)',
            'File Type'
        ])

        await searchResultsPage.documentList.moveItemLeft('File Type', 'Size (Bytes)')
        await searchResultsPage.page.reload()
        await searchResultsPage.assertAtPage()

        // updated columns order 
        chai.expect(
            await searchResultsPage.documentList.getDocumentMetadataColumnNames()
        ).to.have.ordered.members([
            'Initial Ingestion Date',
            'File Type',
            'Size (Bytes)'
        ])
    })

    it('Check that metadata order is changed on Configure Columns modal and user is able to remove metadata', async function() {
        await searchResultsPage.assertAtPage()
        await searchResultsPage.documentList.openConfigureColumnsMenu()

        // check metadata list 
        chai.expect(
            await searchResultsPage.documentList.getDocumentMetadataListNames()
        ).to.have.ordered.members([
            'Initial Ingestion Date',
            'File Type',
            'Size (Bytes)'
        ])

        await searchResultsPage.documentList.removeMetadataField('File Type')
        await searchResultsPage.documentList.clickFooterMetadataButton("Apply")

        // updated columns order 
        chai.expect(
            await searchResultsPage.documentList.getDocumentMetadataColumnNames()
        ).to.have.ordered.members([
            'Initial Ingestion Date',
            'Size (Bytes)'
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})