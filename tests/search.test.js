const common = require("../common")
const ProjectNavigation = require("../pages/components/ProjectNavigation")
const SearchPage = require("../pages/SearchPage")
const SearchResultsPage = require("../pages/SearchResultsPage")
const LoginUtil = require("../util/LoginUtil")
const BrowserHelper = require("../util/BrowserHelper")
const chai = require('chai')
const config = require('config')
const DocumentViewerPage = require("../pages/DocumentViewerPage")
const AgentTypesModal = require("../pages/modals/AgentTypesModal")

describe(`Search`, async function() {

    let loginUtil
    let projectNavigation
    let searchPage
    let searchResultsPage 
    let browserHelper
    let documentViewerPage
    let agentTypesModal
    
    before(async function() { 
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        searchPage = new SearchPage(browserHelper.browser, browserHelper.page)
        searchResultsPage = new SearchResultsPage(browserHelper.browser, browserHelper.page)
        documentViewerPage = new DocumentViewerPage(browserHelper.browser, browserHelper.page)
        agentTypesModal = new AgentTypesModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))        
    })

    //------ "Run a search that hasn't been run before. Does it complete successfully?" (we'll use a non-content predicate)
    it(`Search page loads`, async function() {        
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
    })

    it(`Clicking Source / Agent search predicate allows user to select an agent`, async function () {
        await searchPage.clickLeftSideSearchPredicate('Agent')
        await agentTypesModal.assertAtPage()
        await agentTypesModal.selectAgent('File Share')        
        await agentTypesModal.clickCloseButton()        
    })

    it(`Selecting an agent predicate populates search as expected`, async function () {
        chai.expect(
            await searchPage.getSearchPredicateText()
        ).to.equal(
            `Agent Type:\tIs\t\nFile Share\n\toptions`
        )
     })

    it(`Clicking search brings user to search result page for Agent search`, async function () { 
        await searchPage.clickSearchButton()
        await searchResultsPage.assertAtPage()
    })

    it(`At least one expected document is returned by search by Agent`, async function () {
        await searchResultsPage.documentList.waitForFirstDocument()
        chai.expect(
            await searchResultsPage.documentList.getDocuments()
        ).to.include.members([
            'smart_collect_rules.sql'
        ])        
    })

    //------ "Searh for a full text term and view the document in the viewer. Is highlighting working as expected?"
    it(`Clicking search tab returns user to search`, async function() {
        await searchResultsPage.clickSearchNavigationTab('Search')
        await searchPage.assertAtPage()
    })

    it(`Clicking remove all on search removes all search predicates`, async function() { 
        await searchPage.clickRemoveAllButton()
        chai.expect(
            await searchPage.getSearchPredicateText()
        ).to.be.empty
    })

    it(`Clicking Content / Full Text Element populates search with the predicate`, async function() { 
        await searchPage.clickLeftSideSearchPredicate('Full Text Element')
        chai.expect(
            await searchPage.getSearchPredicateText()
        ).to.include('Full Text:\tWith all of the words (AND)')
    })

    it(`Content / Full Text Element allows user to type in a search term`, async function() { 
        await searchPage.clickFullTextElementClickToInsert()
        await searchPage.typeFullTextElementTerm('kiwi')        
    })

    it(`Clicking search brings user to search result page for Full Text Element`, async function() {  
        await searchPage.clickSearchButton()
        await searchResultsPage.assertAtPage()
    })

    it(`At least one expected document is returned by search by Full Text Element`, async function () {
        await searchResultsPage.documentList.clickDeduplicateToggle()
        await searchResultsPage.documentList.waitForFirstDocument()
        chai.expect(
            await searchResultsPage.documentList.getDocuments()
        ).to.include.members([
            'FW: Quality Moves to utilize on your next date'      
        ])        
    })

    it(`Expected document opens in viewer`, async function() {
        await searchResultsPage.documentList.clickDocument('FW: Quality Moves to utilize on your next date')
        await documentViewerPage.assertAtPage()
    })

    it(`Expected document shows term searched for highlighted in Native`, async function() {
        await documentViewerPage.selectComponentType('Native')
        chai.expect(
            await documentViewerPage.getHighlightedTerms()
        ).to.have.members([ 
            'Kiwi'
        ])        
    })

    it(`Expected document shows term searched for highlighted in Text - Outside In`, async function() {
        await documentViewerPage.selectComponentType('Text - Outside In')
        chai.expect(
            await documentViewerPage.getHighlightedTerms()
        ).to.have.members([ 
            'Kiwi'
        ])
    })

    it(`Expected document shows term searched for highlighted in Text - dtSearch`, async function() {
        await documentViewerPage.selectComponentType('Text - dtSearch')
        chai.expect(
            await documentViewerPage.getHighlightedTerms()
        ).to.have.members([ 
            'Kiwi'
        ])
    })    

    after(async function() {        
        await browserHelper.destroy()
    })
})