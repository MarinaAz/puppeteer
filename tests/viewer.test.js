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

describe(`Viewer`, async function () {

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

    it(`Search page loads`, async function() {        
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
    })

    it(`Searching for Is Collected returns expected document`, async function() {
        await searchPage.clickLeftSideSearchPredicate('Is Collected')
        await searchPage.clickSearchButton()
        await topNavigation.waitForToastMessageToContain('Search has completed')
        await searchResultsPage.assertAtPage()
        await searchResultsPage.documentList.waitForFirstDocument()        
        //search sometimes refreshes slightly. wait a bit
        await common.waitForTimeout(1000)        
        chai.expect(
            await searchResultsPage.documentList.getDocuments()
        ).to.include.members([
            'client_session_params.sql, client_session_params 20210518 10.37.59.263.sql'
        ])
    })

    it(`Clicking on document opens viewer`, async function() {
        await searchResultsPage.documentList.clickDocument('client_session_params.sql, client_session_params 20210518 10.37.59.263.sql')
        await documentViewerPage.assertAtPage()
    })

    it(`Text - Outside In - Expected text found`, async function() {
        await documentViewerPage.selectComponentType('Text - Outside In')
        chai.expect(
            await documentViewerPage.getViewerText()
        ).to.startWith(
            'create table &&RR_APP..client_session_params'
        ).and.to.endWith(
            'FOREIGN KEY (Client_Sessionid) REFERENCES &&RR_APP..client_sessions(Client_Sessionid);'
        )
    })

    it(`Text - Outside In - Searching for text in viewer highlights expected terms`, async function() { 
        chai.expect(
            await documentViewerPage.getHighlightedTerms()
        ).to.be.empty
        
        await documentViewerPage.typeSearchTerm('create')
        await documentViewerPage.clickSearchButton()
        
        chai.expect(
            await documentViewerPage.getSearchHitsString()
        ).to.equal('1 of 2')        

        chai.expect(
            await documentViewerPage.getHighlightedTerms()
        ).to.have.ordered.members([ 
            'create', 
            'CREATE' 
        ])
    })

    it(`Text - Outside In - Moving to next found search term changes highlighted term accordingly`, async function() { 
        //check first highlighted term
        chai.expect(
            await documentViewerPage.getSelectedHighlightedTerm()
        ).to.equal('create')

        //move next, check that
        await documentViewerPage.clickNextSearchResultButton()
        chai.expect(
            await documentViewerPage.getSelectedHighlightedTerm()
        ).to.equal('CREATE')

        //move back, check that
        await documentViewerPage.clickPrevSearchResultButton()
        chai.expect(
            await documentViewerPage.getSelectedHighlightedTerm()
        ).to.equal('create')        
    })

    it(`Text - dtSearch - Expected text found`, async function() {
        await documentViewerPage.selectComponentType('Text - dtSearch')
        chai.expect(
            await documentViewerPage.getViewerText()
        ).to.startWith(
            'create table &&RR_APP..client_session_params'
        ).and.to.endWith(
            'FOREIGN KEY (Client_Sessionid) REFERENCES &&RR_APP..client_sessions(Client_Sessionid);'
        )
    })

    
    it(`Text - dtSearch - Searching for text in viewer highlights expected terms`, async function() { 
        chai.expect(
            await documentViewerPage.getHighlightedTerms()
        ).to.be.empty
        
        await documentViewerPage.typeSearchTerm('create')
        await documentViewerPage.clickSearchButton()

        chai.expect(
            await documentViewerPage.getSearchHitsString()
        ).to.equal('1 of 2')        

        chai.expect(
            await documentViewerPage.getHighlightedTerms()
        ).to.have.ordered.members([ 
            'create', 
            'CREATE' 
        ])
    })

    it(`Text - dtSearch - Moving to next found search term changes highlighted term accordingly`, async function() { 
        //check first highlighted term
        chai.expect(
            await documentViewerPage.getSelectedHighlightedTerm()
        ).to.equal('create')

        //move next, check that
        await documentViewerPage.clickNextSearchResultButton()
        chai.expect(
            await documentViewerPage.getSelectedHighlightedTerm()
        ).to.equal('CREATE')

        //move back, check that
        await documentViewerPage.clickPrevSearchResultButton()
        chai.expect(
            await documentViewerPage.getSelectedHighlightedTerm()
        ).to.equal('create')        
    })

    it(`Native - Expected text found`, async function() {
        await documentViewerPage.selectComponentType('Native')
        chai.expect(
            await documentViewerPage.getViewerText()
        ).to.startWith(
            'create table &&RR_APP..client_session_params'
        ).and.to.endWith(
            'FOREIGN KEY (Client_Sessionid) REFERENCES &&RR_APP..client_sessions(Client_Sessionid);'
        )
    })

    it(`Native - Searching for text in viewer highlights expected terms`, async function() { 
        chai.expect(
            await documentViewerPage.getHighlightedTerms()
        ).to.be.empty
        
        await documentViewerPage.typeSearchTerm('create')
        await documentViewerPage.clickSearchButton()

        chai.expect(
            await documentViewerPage.getSearchHitsString()
        ).to.equal('1 of 2')        

        chai.expect(
            await documentViewerPage.getHighlightedTerms()
        ).to.have.ordered.members([ 
            'create', 
            'CREATE' 
        ])
    })

    it(`Native - Moving to next found search term changes highlighted term accordingly`, async function() { 
        //check first highlighted term
        chai.expect(
            await documentViewerPage.getSelectedHighlightedTerm()
        ).to.equal('create')

        //move next, check that
        await documentViewerPage.clickNextSearchResultButton()
        chai.expect(
            await documentViewerPage.getSelectedHighlightedTerm()
        ).to.equal('CREATE')

        //move back, check that
        await documentViewerPage.clickPrevSearchResultButton()
        chai.expect(
            await documentViewerPage.getSelectedHighlightedTerm()
        ).to.equal('create')        
    })

    it(`Clicking metadata tab shows expected metadata for document`, async function() {
        await documentViewerPage.clickTab('Metadata')
        let actualMetadata = await documentViewerPage.getMetadataValueMap()
        
        chai.expect(
            [...actualMetadata.keys()]
        ).to.have.members([
            'Collected',
            'File Type Category',
            'Collection Date',
            'Is Preserved',
            'dtSearch Text Size',
            'Size (Bytes)',
            'Initial Ingestion Date',
            'SHA1 Hash of Document Contents',
            'Text Size',
            'MD5 Hash of Document Contents',
            'Number of Locations',
            'File Type',
            'Original Text Size',
            'Implicit Collect',
            'Original dtSearch Text Size',
            "Is dtSearch'd",
            "Is OCR'd",
            'Email',
            'Attachment Count'
        ])

        chai.expect(
            [...actualMetadata.values()]
        ).to.have.members([
            'ASCII7BITTEXT',
            'N',
            '1.18 KB',
            'Text',
            '01/25/2023 11:47:12 AM',
            '1.19 KB',
            '01/19/2023 2:33:09 PM',
            '186068f10a7e5a9449d82fbc09681221f0604c78',
            '1.19 KB',
            'b4bd1f46baf13c01f1e0695d36a551a8',
            '7',
            'Y',
            'N',
            '0',
            '1.19 KB',
            'N',
            '1.19 KB',
            'Y',
            'N'
        ])
    })

    it(`Clicking Locations tab loads expected locations`, async function() {
        await documentViewerPage.clickTab('Locations')
        chai.expect(
            await documentViewerPage.getLocations()
        ).to.include.members([
            '///swap/kseleznev/$/re-oracle-4.7.53-dev5-bin 20210518 11.08.22.909.zip!re-oracle-4.7.53-DEV5/corporate/app/table/client_session_params.sql',
            '///swap/kseleznev/$/client_session_params 20210518 10.37.59.263.sql',
            '///swap/kseleznev/和平与善良的世界 temp-path-with-long-filenames/re-oracle-4.7.47-dev1-bin (2).zip!re-oracle-4.7.47-DEV1/corporate/app/table/client_session_params.sql',
            '///swap/kseleznev/和平与善良的世界 temp-path-with-long-filenames/re-oracle-4.7.47-dev1-bin (4).zip!re-oracle-4.7.47-DEV1/corporate/app/table/client_session_params.sql',
            '///swap/kseleznev/和平与善良的世界 temp-path-with-long-filenames/re-oracle-4.7.47-dev1-bin (3).zip!re-oracle-4.7.47-DEV1/corporate/app/table/client_session_params.sql',
            '///swap/kseleznev/和平与善良的世界 temp-path-with-long-filenames/re-oracle-4.7.47-dev1-bin.zip!re-oracle-4.7.47-DEV1/corporate/app/table/client_session_params.sql',
        ])        
    })

    it(`Clicking a location loads expected metadata into table`, async function() {
        await documentViewerPage.clickLocation('///swap/kseleznev/$/client_session_params 20210518 10.37.59.263.sql')
        let actualValues = await documentViewerPage.getLocationValueMap()

        chai.expect(
            [...actualValues.keys()]
        ).to.have.ordered.members([
            'Is Holdable',
            'OS Created',
            'OS Last Modified',
            'OS Last Accessed',
            'RG Last Modified',
            'Custodian',
            'Filename',
            'File Path',
            'System Name',
            'System Type',
            'Owner'
        ])

        chai.expect(
            [...actualValues.values()]
        ).to.have.ordered.members([
            'N',
            '05/18/2021 6:37:40 AM',
            '05/18/2021 6:38:02 AM',
            '05/18/2021 6:37:40 AM',
            '01/19/2023 2:33:09 PM',
            'Alea Bowen (abowen@qa.rg.local)',
            'client_session_params 20210518 10.37.59.263.sql',
            '///swap/kseleznev/$/',
            'TEST2-CS',
            'File Share',
            'S-1-5-21-1406174247-2093118590-2687079363-1000'
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})