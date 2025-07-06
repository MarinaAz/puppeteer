const LoginUtil = require("../util/LoginUtil")
const ProjectNavigation = require("../pages/components/ProjectNavigation")
const FoldersPage = require("../pages/FoldersPage")
const CollectionsPage = require("../pages/CollectionsPage")
const BrowserHelper = require("../util/BrowserHelper")
const chai = require('chai')
const common = require("../common")
const config = require('config')
const PreservationsPage = require("../pages/PreservationsPage")
const ExportsPage = require("../pages/ExportsPage")
const PoliciesPage = require("../pages/PoliciesPage")
const CreateFolderModal = require("../pages/modals/CreateFolderModal")
const DeleteFolderModal = require("../pages/modals/DeleteFolderModal")
const SearchPage = require("../pages/SearchPage")
const SearchResultsPage = require("../pages/SearchResultsPage")
const AddToAFolderModal = require("../pages/modals/AddToAFolderModal")
const ExplorerPage = require("../pages/ExplorerPage")
const ExplorerDocumentPage = require("../pages/ExplorerDocumentPage")
const AddFolderModal = require("../pages/modals/AddFolderModal")
const SaveSearchCriteriaModal = require("../pages/modals/SaveSearchCriteriaModal")
const DeleteSearchModal = require("../pages/modals/DeleteSearchModal")
const SystemDashboardPage = require("../pages/SystemDashboardPage")
const TopNavigation = require("../pages/components/TopNavigation")
const RunSwitchSchemaAndSynchronizationModal = require("../pages/modals/RunSwitchSchemaAndSynchronizationModal")
const CreateCollectionModal = require("../pages/modals/CreateCollectionModal")
const EditCollectionModal = require("../pages/modals/EditCollectionModal")
const DeleteCollectionModal = require("../pages/modals/DeleteCollectionModal")
const CollectDocumentsModal = require("../pages/modals/CollectDocumentsModal")
const RemoveSelectedDocumentsModal = require("../pages/modals/RemoveSelectedDocumentsModal")

describe('Evergreen Collection Sets (Collection page)- create and delete evergreen collection from left pane', async function () {
    let loginUtil    
    let projectNavigation
    let collectionsPage
    let createCollectionModal
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let editCollectionModal
    let deleteCollectionModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)
        createCollectionModal =  new CreateCollectionModal(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        deleteCollectionModal = new DeleteCollectionModal(browserHelper.browser, browserHelper.page)
        editCollectionModal = new EditCollectionModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create a folder from Collection menu', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        await collectionsPage.clickCreateButton('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from evg collection')
        await createFolderModal.typeDescription('folder description')
        await createFolderModal.clickButton('Create')        
        await common.waitForTimeout(500)
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.include.members([
            "Collections",
            "folder from evg collection"
        ])
    })

    it('User is able to create an evergreen collection from Collections menu', async function() {
        await collectionsPage.assertAtPage()        
        await collectionsPage.treeView.openItemMenu('Collections')        
        await collectionsPage.treeView.selectItemMenuItem('New Collection')
        await createCollectionModal.assertAtPage()
        await createCollectionModal.typeName('evergreen collection')
        await createCollectionModal.typeDesc('evergreen description')
        await createCollectionModal.openSelectSearch()
        await createCollectionModal.searchForSavedSearches('master search')
        await createCollectionModal.clickButton('Create')        
        await common.waitForTimeout(500)
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.include.members([
            "Collections",
            "folder from evg collection",
            "evergreen collection"
        ])
    })

    it('User is able to edit an evergreen collection', async function() {
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.openItemMenu('evergreen collection')
        await collectionsPage.treeView.selectItemMenuItem('Edit Collection')
        await editCollectionModal.assertAtPage()
        await common.waitForTimeout(500)
        await editCollectionModal.typeName('EDITED EVG collection')
        await editCollectionModal.typeDescription('it was edited')
        await editCollectionModal.clickButton('Save')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.include.members([
            "EDITED EVG collection"
        ])
    })

    it('User is able to move evergreen collection to the root, to the folder', async function() {
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.selectItem('EDITED EVG collection')        
        //to another folder
        await collectionsPage.treeView.nestField('EDITED EVG collection', 'folder from evg collection')
        chai.expect(
            await collectionsPage.treeView.isItemFoldered('EDITED EVG collection')
        ).to.be.true

        await collectionsPage.treeView.selectItem('EDITED EVG collection')
        //to the root
        await collectionsPage.treeView.nestField('EDITED EVG collection', 'Collections')
        await common.waitForTimeout(1000)
        chai.expect( 
            await collectionsPage.treeView.isItemFoldered('EDITED EVG collection')
        ).to.be.false
    })

    it('User is able to Refresh evergreen Collection Info and Stop Collection', async function() {
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.selectItem('EDITED EVG collection')
        await collectionsPage.clickDocumentDetailsLink()

        // info value before refresh
        chai.expect(
            await collectionsPage.getValueOfStatus('Step 1: Preparing to Collect')
        ).to.equal('Click the Refresh link.')
        await collectionsPage.clickDetailsHeaderButton('Refresh')

        // info value after refresh
        chai.expect(
            await collectionsPage.getValueOfStatus('Step 1: Preparing to Collect')
        ).to.equal('0%')

        // info value before stop
        chai.expect(
            await collectionsPage.getValueOfStatus('Collection Status:')
        ).to.equal('In Progress')
        await collectionsPage.clickDetailsHeaderButton('Stop')

        // info value after stop
        chai.expect(
            await collectionsPage.getValueOfStatus('Collection Status:')
        ).to.equal('Stopped')
        await collectionsPage.closeInfoPane()
    })
     
    it('User is able to delete an evergreen collection from Collection menu', async function() {        
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.openItemMenu('folder from evg collection')
        await collectionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await collectionsPage.treeView.openItemMenu('EDITED EVG collection')
        await collectionsPage.treeView.selectItemMenuItem('Delete Collection')
        await deleteCollectionModal.assertAtPage()
        await deleteCollectionModal.clickButton('Delete')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.not.include.members([
            "evergreen collection",
            "folder from evg collection"
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Collection Sets - Create evergreen collection from Preservations Set', async function() {
    let loginUtil    
    let projectNavigation
    let collectionsPage
    let browserHelper
    let deleteCollectionModal
    let preservationsPage
    let collectDocumentsModal
    let createCollectionModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)
        deleteCollectionModal = new DeleteCollectionModal(browserHelper.browser, browserHelper.page) 
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        collectDocumentsModal = new CollectDocumentsModal(browserHelper.browser, browserHelper.page)
        createCollectionModal = new CreateCollectionModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create Evergreen collecion from Preservation sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.selectItem('master preservation')
        await preservationsPage.clickToolbarButton('Actions')
        await preservationsPage.clickActionMenuItem('Collect All')

        //open Collect document modal
        await collectDocumentsModal.assertAtPage()
        await collectDocumentsModal.treeView.openItemMenu('Collections')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Collection')
        
        //open create collection modal
        await createCollectionModal.assertAtPage()
        await createCollectionModal.typeName('evg collection from preservation')
        await createCollectionModal.typeDesc('evg description from preservation')
        await createCollectionModal.openSelectSearch()
        await createCollectionModal.searchForSavedSearches('master search')
        await createCollectionModal.clickButton("Create") 

        //create collection modal closes and evergreen collection is created
        await collectDocumentsModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen collection is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.include.members([
            "evg collection from preservation"
        ])
    })

    it('User is able to delete evergreen collection', async function() {
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.openItemMenu('evg collection from preservation')
        await collectionsPage.treeView.selectItemMenuItem('Delete Collection')
        await deleteCollectionModal.assertAtPage()
        await deleteCollectionModal.clickButton('Delete')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.not.include.members([
            "evg collection from preservation"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Collection Sets - Create evergreen collection from Collections Set', async function() {
    let loginUtil    
    let projectNavigation
    let collectionsPage
    let browserHelper
    let deleteCollectionModal
    let collectDocumentsModal
    let createCollectionModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)
        deleteCollectionModal = new DeleteCollectionModal(browserHelper.browser, browserHelper.page) 
        collectDocumentsModal = new CollectDocumentsModal(browserHelper.browser, browserHelper.page)
        createCollectionModal = new CreateCollectionModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create Evergreen collecion from Collection sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.selectItem('master collection')
        await collectionsPage.clickToolbarButton('Actions')
        await collectionsPage.clickActionMenuItem('Collect All')

        //open Collect document modal
        await collectDocumentsModal.assertAtPage()
        await collectDocumentsModal.treeView.openItemMenu('Collections')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Collection')
        
        //open create collection modal
        await createCollectionModal.assertAtPage()
        await createCollectionModal.typeName('evg collection from collection')
        await createCollectionModal.typeDesc('evg description from collection')
        await createCollectionModal.openSelectSearch()
        await createCollectionModal.searchForSavedSearches('master search')
        await createCollectionModal.clickButton("Create") 

        //create collection modal closes and evergreen collection is created
        await collectDocumentsModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen collection is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.include.members([
            "evg collection from collection"
        ])
    })

    it('User is able to delete evergreen collection', async function() {
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.openItemMenu('evg collection from collection')
        await collectionsPage.treeView.selectItemMenuItem('Delete Collection')
        await deleteCollectionModal.assertAtPage()
        await deleteCollectionModal.clickButton('Delete')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.not.include.members([
            "evg collection from collection"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Collection Sets - Create evergreen collection from Folders Set', async function() {
    let loginUtil    
    let projectNavigation
    let collectionsPage
    let foldersPage
    let browserHelper
    let deleteCollectionModal
    let collectDocumentsModal
    let createCollectionModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)
        foldersPage = new FoldersPage(browserHelper.browser, browserHelper.page)
        deleteCollectionModal = new DeleteCollectionModal(browserHelper.browser, browserHelper.page) 
        collectDocumentsModal = new CollectDocumentsModal(browserHelper.browser, browserHelper.page)
        createCollectionModal = new CreateCollectionModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create Evergreen collecion from Folder sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('master folder')
        await foldersPage.clickToolbarButton('Actions')
        await foldersPage.clickActionMenuItem('Collect All')

        //open Collect document modal
        await collectDocumentsModal.assertAtPage()
        await collectDocumentsModal.treeView.openItemMenu('Collections')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Collection')
        
        //open create collection modal
        await createCollectionModal.assertAtPage()
        await createCollectionModal.typeName('evg collection from folder')
        await createCollectionModal.typeDesc('evg description from folder')
        await createCollectionModal.openSelectSearch()
        await createCollectionModal.searchForSavedSearches('master search')
        await createCollectionModal.clickButton("Create") 

        //create collection modal closes and evergreen collection is created
        await collectDocumentsModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen collection is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.include.members([
            "evg collection from folder"
        ])
    })

    it('User is able to delete evergreen collection', async function() {
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.openItemMenu('evg collection from folder')
        await collectionsPage.treeView.selectItemMenuItem('Delete Collection')
        await deleteCollectionModal.assertAtPage()
        await deleteCollectionModal.clickButton('Delete')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.not.include.members([
            "evg collection from folder"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Collection Sets - Create evergreen collection from Policies Set', async function() {
    let loginUtil    
    let projectNavigation
    let collectionsPage
    let policiesPage
    let browserHelper
    let deleteCollectionModal
    let collectDocumentsModal
    let createCollectionModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)
        policiesPage = new PoliciesPage(browserHelper.browser, browserHelper.page)
        deleteCollectionModal = new DeleteCollectionModal(browserHelper.browser, browserHelper.page) 
        collectDocumentsModal = new CollectDocumentsModal(browserHelper.browser, browserHelper.page)
        createCollectionModal = new CreateCollectionModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create Evergreen collecion from Policy sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Policies')
        await policiesPage.assertAtPage()
        await policiesPage.treeView.selectItem('master policy')
        await policiesPage.clickToolbarButton('Actions')
        await policiesPage.clickActionMenuItem('Collect All')

        //open Collect document modal
        await collectDocumentsModal.assertAtPage()
        await collectDocumentsModal.treeView.openItemMenu('Collections')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Collection')
        
        //open create collection modal
        await createCollectionModal.assertAtPage()
        await createCollectionModal.typeName('evg collection from policy')
        await createCollectionModal.typeDesc('evg description from policy')
        await createCollectionModal.openSelectSearch()
        await createCollectionModal.searchForSavedSearches('master search')
        await createCollectionModal.clickButton("Create") 

        //create collection modal closes and evergreen collection is created
        await collectDocumentsModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen collection is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.include.members([
            "evg collection from policy"
        ])
    })

    it('User is able to delete evergreen collection', async function() {
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.openItemMenu('evg collection from policy')
        await collectionsPage.treeView.selectItemMenuItem('Delete Collection')
        await deleteCollectionModal.assertAtPage()
        await deleteCollectionModal.clickButton('Delete')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.not.include.members([
            "evg collection from folder"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Collection Sets - Create evergreen collection from Exports Set', async function() {
    let loginUtil    
    let projectNavigation
    let collectionsPage
    let exportsPage
    let browserHelper
    let deleteCollectionModal
    let collectDocumentsModal
    let createCollectionModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        deleteCollectionModal = new DeleteCollectionModal(browserHelper.browser, browserHelper.page) 
        collectDocumentsModal = new CollectDocumentsModal(browserHelper.browser, browserHelper.page)
        createCollectionModal = new CreateCollectionModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create Evergreen collecion from Export sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.selectItem('master export')
        await exportsPage.clickToolbarButton('Actions')
        await exportsPage.clickActionMenuItem('Collect All')

        //open Collect document modal
        await collectDocumentsModal.assertAtPage()
        await collectDocumentsModal.treeView.openItemMenu('Collections')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Collection')
        
        //open create collection modal
        await createCollectionModal.assertAtPage()
        await createCollectionModal.typeName('evg collection from export')
        await createCollectionModal.typeDesc('evg description from export')
        await createCollectionModal.openSelectSearch()
        await createCollectionModal.searchForSavedSearches('master search')
        await createCollectionModal.clickButton("Create") 

        //create collection modal closes and evergreen collection is created
        await collectDocumentsModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen collection is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.include.members([
            "evg collection from export"
        ])
    })

    it('User is able to delete evergreen collection', async function() {
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.openItemMenu('evg collection from export')
        await collectionsPage.treeView.selectItemMenuItem('Delete Collection')
        await deleteCollectionModal.assertAtPage()
        await deleteCollectionModal.clickButton('Delete')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.not.include.members([
            "evg collection from export"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Collection Sets - Create and delete evergreen collection from Explorer Graph', async function() {
    let loginUtil    
    let projectNavigation
    let collectionsPage
    let browserHelper
    let deleteCollectionModal
    let explorerPage
    let createCollectionModal
    let explorerDocumentPage
    let collectDocumentsModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)
        deleteCollectionModal = new DeleteCollectionModal(browserHelper.browser, browserHelper.page)
        explorerPage = new ExplorerPage(browserHelper.browser, browserHelper.page) 
        createCollectionModal = new CreateCollectionModal(browserHelper.browser, browserHelper.page)
        explorerDocumentPage = new ExplorerDocumentPage(browserHelper.browser, browserHelper.page)
        collectDocumentsModal = new CollectDocumentsModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject')) 
    })

    it('User is able to create an evergreen collection from Explorer Graph', async function () {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Explorer')
        await explorerPage.assertAtPage()
        // filter for Folders
        await explorerPage.openDataSet()
        await explorerPage.expandDataSetProjectOptionMenu('Folders')
        await explorerPage.selectNthDataProjectOptionMenuItem(0)
        await explorerPage.openActionMenu()
        await explorerPage.clickGraphBar('Text')
        await explorerPage.clickActionMenuItem('View Document Set')
        await common.waitForTimeout(4000)
        await explorerDocumentPage.assertAtPage()
        await explorerDocumentPage.clickToolbarButton('Actions')
        await explorerDocumentPage.clickActionMenuItem('Collect All')

        //open Collect documents modal
        await collectDocumentsModal.assertAtPage()
        await collectDocumentsModal.treeView.openItemMenu('Collections')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Collection')

        //open create collection modal
        await createCollectionModal.assertAtPage()
        await createCollectionModal.typeName('evg collection from explorer graph')
        await createCollectionModal.typeDesc('evg collection from explorer graph')
        await createCollectionModal.openSelectSearch()
        await createCollectionModal.searchForSavedSearches('master search')
        await createCollectionModal.clickButton('Create')
        
        //close Collect document modal
        await collectDocumentsModal.assertAtPage()
        await common.waitForTimeout(500)
        await collectDocumentsModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen collection is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.include.members([
            "evg collection from explorer graph"
        ])
    })

    it('User is able to delete evergreen collection', async function() {
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.openItemMenu('evg collection from explorer graph')
        await collectionsPage.treeView.selectItemMenuItem('Delete Collection')
        await deleteCollectionModal.assertAtPage()
        await deleteCollectionModal.clickButton('Delete')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.not.include.members([
            "evg collection from explorer graph"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Collection Sets - Create and delete evergreen collection from Search Page', async function() {
    let loginUtil    
    let projectNavigation
    let collectionsPage
    let browserHelper
    let collectDocumentsModal
    let deleteCollectionModal
    let createCollectionModal
    let searchPage
    let searchResultsPage

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)
        collectDocumentsModal = new CollectDocumentsModal(browserHelper.browser, browserHelper.page)
        deleteCollectionModal = new DeleteCollectionModal(browserHelper.browser, browserHelper.page) 
        createCollectionModal = new CreateCollectionModal(browserHelper.browser, browserHelper.page)
        searchPage = new SearchPage(browserHelper.browser, browserHelper.page)
        searchResultsPage = new SearchResultsPage(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create evergreen collection from Search Page', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideSearchPredicate('Full Text Element')
        await searchPage.clickFullTextElementClickToInsert()
        await searchPage.typeFullTextElementTerm('test')
        await searchPage.clickSearchButton()
        await searchResultsPage.assertAtPage()
        await common.waitForTimeout(3000)
        await searchResultsPage.clickToolbarButton("Actions")
        await searchResultsPage.clickActionMenuItem('Collect All')

        //open Collect documents modal
        await collectDocumentsModal.assertAtPage()
        await collectDocumentsModal.treeView.openItemMenu('Collections')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Collection')

        //open create colection modal
        await createCollectionModal.assertAtPage()
        await createCollectionModal.typeName('evg collection from search')
        await createCollectionModal.typeDesc('evg description from search')
        await createCollectionModal.openSelectSearch()
        await createCollectionModal.searchForSavedSearches('master search')
        await createCollectionModal.clickButton("Create")

        //close Collect documents modal
        await collectDocumentsModal.assertAtPage()
        await collectDocumentsModal.clickButton('Cancel')
    })

    it('Verify that evergreen collection is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.include.members([
            "evg collection from search"
        ])
    })

    it('User is able to delete evergreen collection', async function() {
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.openItemMenu('evg collection from search')
        await collectionsPage.treeView.selectItemMenuItem('Delete Collection')
        await deleteCollectionModal.assertAtPage()
        await deleteCollectionModal.clickButton('Delete')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.not.include.members([
            "evg collection from search"
        ])
    })
 
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Collection Sets - Create and delete evergreen collection from Explorer Views', async function() {
    let loginUtil    
    let projectNavigation
    let collectionsPage
    let browserHelper
    let deleteCollectionModal
    let explorerPage
    let createCollectionModal
    let explorerDocumentPage
    let collectDocumentsModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)
        deleteCollectionModal = new DeleteCollectionModal(browserHelper.browser, browserHelper.page)
        explorerPage = new ExplorerPage(browserHelper.browser, browserHelper.page) 
        createCollectionModal = new CreateCollectionModal(browserHelper.browser, browserHelper.page)
        explorerDocumentPage = new ExplorerDocumentPage(browserHelper.browser, browserHelper.page)
        collectDocumentsModal = new CollectDocumentsModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject')) 
    })

    it('User is able to create an evergreen collection from Explorer Viewes', async function () {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Explorer')
        await explorerPage.assertAtPage()
        await explorerPage.openActionMenu()
        await explorerPage.clickActionMenuItem('View Document Set')
        await explorerPage.waitForTaskCountToBeZero('0')
        await explorerDocumentPage.assertAtPage()
        await common.waitForTimeout(10000)
        await explorerDocumentPage.clickToolbarButton('Actions')
        await explorerDocumentPage.clickActionMenuItem('Collect All')

        //open Collect documents modal
        await collectDocumentsModal.assertAtPage()
        await collectDocumentsModal.treeView.openItemMenu('Collections')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Collection')

        //open create collection modal
        await createCollectionModal.assertAtPage()
        await createCollectionModal.typeName('evg collection from explorer views')
        await createCollectionModal.typeDesc('evg collection from explorer views')
        await createCollectionModal.openSelectSearch()
        await createCollectionModal.searchForSavedSearches('master search')
        await createCollectionModal.clickButton('Create')
        
        //close Collect document modal
        await collectDocumentsModal.assertAtPage()
        await common.waitForTimeout(500)
        await collectDocumentsModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen collection is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.include.members([
            "evg collection from explorer views"
        ])
    })

    it('User is able to delete evergreen collection', async function() {
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.openItemMenu('evg collection from explorer views')
        await collectionsPage.treeView.selectItemMenuItem('Delete Collection')
        await deleteCollectionModal.assertAtPage()
        await deleteCollectionModal.clickButton('Delete')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.not.include.members([
            "evg collection from explorer views"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Collection Sets - Add documents to Evergreen Collection after "Refresh Evergreen"', async function() {
    let loginUtil    
    let projectNavigation
    let foldersPage
    let browserHelper
    let searchPage
    let searchResultsPage
    let addToAFolderModal
    let createFolderModal
    let addFolderModal
    let saveSearchCriteriaModal
    let deleteFolderModal
    let deleteSearchModal
    let topNavigation
    let collectionsPage
    let createCollectionModal
    let deleteCollectionModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        foldersPage = new FoldersPage(browserHelper.browser, browserHelper.page)
        searchPage = new SearchPage(browserHelper.browser, browserHelper.page)
        searchResultsPage = new SearchResultsPage(browserHelper.browser, browserHelper.page)
        addToAFolderModal = new AddToAFolderModal(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        addFolderModal = new AddFolderModal(browserHelper.browser, browserHelper.page)
        saveSearchCriteriaModal = new SaveSearchCriteriaModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        deleteSearchModal = new DeleteSearchModal(browserHelper.browser, browserHelper.page)
        topNavigation = new TopNavigation(browserHelper.browser, browserHelper.page)
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)
        createCollectionModal = new CreateCollectionModal(browserHelper.browser, browserHelper.page)
        deleteCollectionModal = new DeleteCollectionModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject')) 
    })

    it('Create a folder with documents', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideSearchPredicate('Full Text Element')
        await searchPage.clickFullTextElementClickToInsert()
        await searchPage.typeFullTextElementTerm('test')
        await searchPage.clickSearchButton()
        await searchResultsPage.assertAtPage()
        await searchResultsPage.documentList.clickNthDocumentCheckbox(0)
        await searchResultsPage.documentList.clickNthDocumentCheckbox(1)
        await searchResultsPage.documentList.clickNthDocumentCheckbox(2)
        await searchResultsPage.clickToolbarButton("Actions")
        await searchResultsPage.clickActionMenuItem('Folder Selected')

        //open Add to a folder modal
        await addToAFolderModal.assertAtPage()
        await addToAFolderModal.treeView.openItemMenu('Folders')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')

        //open create folder modal
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('test folder coll')
        await createFolderModal.typeDescription('test description')
        await createFolderModal.clickButton('Create')

         //add documents to folder
         await addToAFolderModal.treeView.selectItem('test folder coll')
         await addToAFolderModal.clickButton('Folder')

         //verify that folder is created
         await projectNavigation.assertAtPage()
         await projectNavigation.openDocumentSetsMenu()
         await projectNavigation.clickMenuItem('Folders')
         await foldersPage.assertAtPage()
         chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "test folder coll"
        ])
    })

    it('Search for RG Sets -> Folder -> our new created folder and Save Search Criteria', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideSearchPredicateByName('Folder')
        await addFolderModal.assertAtPage()
        await addFolderModal.treeView.addSelectedFolder('test folder coll')
        await addFolderModal.clickButton('Cancel')
        await searchPage.clickSaveSearchCriteria()
        await saveSearchCriteriaModal.assertAtPage()
        await saveSearchCriteriaModal.typeName('test')
        await saveSearchCriteriaModal.clickButton('Save')
        await searchResultsPage.assertAtPage()
        await searchResultsPage.clickSearchNavigationTab('Search')
        await searchPage.assertAtPage()
        await searchPage.searchForSavedSearches('test')
        chai.expect(
            await searchPage.getSavedSearchNames()
        ).to.include.members([
            "test"
        ])
    })

    it('Create a new evergreen collection with Saved Search and check quantity of documents inside', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        await collectionsPage.clickCreateButton('New Collection')
        await createCollectionModal.assertAtPage()
        await createCollectionModal.typeName('test evergreen collection')
        await createCollectionModal.typeDesc('test evergreen description')
        await createCollectionModal.openSelectSearch()
        await createCollectionModal.searchForSavedSearches('test')
        await createCollectionModal.clickButton('Create')        
        await common.waitForTimeout(500)
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.include.members([
            "Collections",
            "test evergreen collection"
        ])

        // check quantiti of documents inside of evergreen collection
        await collectionsPage.treeView.selectItem('test evergreen collection')
        await common.waitForTimeout(1000)
        chai.expect(
            await collectionsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n3')
    })

    it('Add 2 more documens on folder', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideSearchPredicate('Full Text Element')
        await searchPage.clickFullTextElementClickToInsert()
        await searchPage.typeFullTextElementTerm('apple')
        await searchPage.clickSearchButton()
        await searchResultsPage.assertAtPage()
        await searchResultsPage.documentList.clickNthDocumentCheckbox(0)
        await searchResultsPage.documentList.clickNthDocumentCheckbox(1)
        await searchResultsPage.clickToolbarButton("Actions")
        await searchResultsPage.clickActionMenuItem('Folder Selected')

        //add documents to a folder
        await addToAFolderModal.assertAtPage()
        await addToAFolderModal.treeView.selectItem('test folder coll')
        await addToAFolderModal.clickButton('Folder')
        await common.waitForTimeout(1000)

        //check quantity of document inside of folder
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('test folder coll')
        await common.waitForTimeout(1000)
        chai.expect(
            await foldersPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n5')
    })

    it('Run "Refresh Evergreen" and check quantity of documents inside evergreen collection', async function() {

        //check quantity of document inside of evergreen collection before "Refresh Evergreen"
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.selectItem('test evergreen collection')
        await common.waitForTimeout(1000)
        chai.expect(
            await collectionsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n3')

        // run "Refresh Evergreen"
        await collectionsPage.clickRefreshToolbarButton()
        await collectionsPage.clickRefreshMenuItem('Refresh Evergreen')
        //wait for toast, then wait a bit more
        await topNavigation.waitForToastMessageToContain('Evergreen refresh has finished')
        await common.waitForTimeout(1000)

        //check quantity of document inside of evergreen collection after "Refresh Evergreen"
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.selectItem('test evergreen collection')
        await common.waitForTimeout(1000)
        chai.expect(
            await collectionsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n5')
    })

    it('Delete created collection, folder and saved search', async function() {
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.openItemMenu('test evergreen collection')
        await collectionsPage.treeView.selectItemMenuItem('Delete Collection')
        await deleteCollectionModal.assertAtPage()
        await deleteCollectionModal.clickButton('Delete')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.not.include.members([
            "test evergreen collection"
        ])
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('test folder coll')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "test folder coll"
        ])
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.searchForSavedSearches('test')
        await searchPage.deleteSelectedSavedSearch('test')
        await deleteSearchModal.assertAtPage()
        await deleteSearchModal.clickButton('Confirm')
        chai.expect(
            await searchPage.getSavedSearchNames()
        ).to.not.include.members([
            "test"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Collection Sets - Add documents to Evergreen Collection after "Switch Schema"', async function() {
    let loginUtil    
    let projectNavigation
    let foldersPage
    let browserHelper
    let searchPage
    let searchResultsPage
    let addToAFolderModal
    let createFolderModal
    let addFolderModal
    let saveSearchCriteriaModal
    let deleteFolderModal
    let deleteSearchModal
    let topNavigation
    let collectionsPage
    let createCollectionModal
    let deleteCollectionModal
    let systemDashboardPage
    let runSwitchSchemaAndSynchronizationModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        foldersPage = new FoldersPage(browserHelper.browser, browserHelper.page)
        searchPage = new SearchPage(browserHelper.browser, browserHelper.page)
        searchResultsPage = new SearchResultsPage(browserHelper.browser, browserHelper.page)
        addToAFolderModal = new AddToAFolderModal(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        addFolderModal = new AddFolderModal(browserHelper.browser, browserHelper.page)
        saveSearchCriteriaModal = new SaveSearchCriteriaModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        deleteSearchModal = new DeleteSearchModal(browserHelper.browser, browserHelper.page)
        topNavigation = new TopNavigation(browserHelper.browser, browserHelper.page)
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)
        createCollectionModal = new CreateCollectionModal(browserHelper.browser, browserHelper.page)
        deleteCollectionModal = new DeleteCollectionModal(browserHelper.browser, browserHelper.page)
        systemDashboardPage = new SystemDashboardPage(browserHelper.browser, browserHelper.page)
        runSwitchSchemaAndSynchronizationModal = new RunSwitchSchemaAndSynchronizationModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject')) 
    })

    it('Create a folder with documents', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideSearchPredicate('Full Text Element')
        await searchPage.clickFullTextElementClickToInsert()
        await searchPage.typeFullTextElementTerm('test')
        await searchPage.clickSearchButton()
        await searchResultsPage.assertAtPage()
        await searchResultsPage.documentList.clickNthDocumentCheckbox(0)
        await searchResultsPage.documentList.clickNthDocumentCheckbox(1)
        await searchResultsPage.documentList.clickNthDocumentCheckbox(2)
        await searchResultsPage.clickToolbarButton("Actions")
        await searchResultsPage.clickActionMenuItem('Folder Selected')

        //open Add to a folder modal
        await addToAFolderModal.assertAtPage()
        await addToAFolderModal.treeView.openItemMenu('Folders')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')

        //open create folder modal
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('test folder coll')
        await createFolderModal.typeDescription('test description')
        await createFolderModal.clickButton('Create')

         //add documents to folder
         await addToAFolderModal.treeView.selectItem('test folder coll')
         await addToAFolderModal.clickButton('Folder')

         //verify that folder is created
         await projectNavigation.assertAtPage()
         await projectNavigation.openDocumentSetsMenu()
         await projectNavigation.clickMenuItem('Folders')
         await foldersPage.assertAtPage()
         chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "test folder coll"
        ])
    })

    it('Search for RG Sets -> Folder -> our new created folder and Save Search Criteria', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideSearchPredicateByName('Folder')
        await addFolderModal.assertAtPage()
        await addFolderModal.treeView.addSelectedFolder('test folder coll')
        await addFolderModal.clickButton('Cancel')
        await searchPage.clickSaveSearchCriteria()
        await saveSearchCriteriaModal.assertAtPage()
        await saveSearchCriteriaModal.typeName('test')
        await saveSearchCriteriaModal.clickButton('Save')
        await searchResultsPage.assertAtPage()
        await searchResultsPage.clickSearchNavigationTab('Search')
        await searchPage.assertAtPage()
        await searchPage.searchForSavedSearches('test')
        chai.expect(
            await searchPage.getSavedSearchNames()
        ).to.include.members([
            "test"
        ])
    })

    it('Create a new evergreen collection with Saved Search and check quantity of documents inside', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        await collectionsPage.clickCreateButton('New Collection')
        await createCollectionModal.assertAtPage()
        await createCollectionModal.typeName('test evergreen collection')
        await createCollectionModal.typeDesc('test evergreen description')
        await createCollectionModal.openSelectSearch()
        await createCollectionModal.searchForSavedSearches('test')
        await createCollectionModal.clickButton('Create')        
        await common.waitForTimeout(500)
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.include.members([
            "Collections",
            "test evergreen collection"
        ])

        // check quantiti of documents inside of evergreen collection
        await collectionsPage.treeView.selectItem('test evergreen collection')
        await common.waitForTimeout(1000)
        chai.expect(
            await collectionsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n3')
    })

    it('Add 2 more documens on folder', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideSearchPredicate('Full Text Element')
        await searchPage.clickFullTextElementClickToInsert()
        await searchPage.typeFullTextElementTerm('apple')
        await searchPage.clickSearchButton()
        await searchResultsPage.assertAtPage()
        await searchResultsPage.documentList.clickNthDocumentCheckbox(0)
        await searchResultsPage.documentList.clickNthDocumentCheckbox(1)
        await searchResultsPage.clickToolbarButton("Actions")
        await searchResultsPage.clickActionMenuItem('Folder Selected')

        //add documents to a folder
        await addToAFolderModal.assertAtPage()
        await addToAFolderModal.treeView.selectItem('test folder coll')
        await addToAFolderModal.clickButton('Folder')
        await common.waitForTimeout(1000)

        //check quantity of document inside of folder
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('test folder coll')
        await common.waitForTimeout(1000)
        chai.expect(
            await foldersPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n5')
    })

    it('Run "Switch Schema and Sincronization" and check quantity of documents inside evergreen collection', async function() {

        //check quantity of document inside of evergreen collection before run "Switch Schema and Sincronization"
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.selectItem('test evergreen collection')
        await common.waitForTimeout(1000)
        chai.expect(
            await collectionsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n3')

        // run "Switch Schema and Sincronization"
        await topNavigation.clickAdminMenu()
        await topNavigation.clickAdminMenuItem('System Dashboard')
        await systemDashboardPage.assertAtPage()
        await systemDashboardPage.clickOperationLink('Switch Schema and Synchronization History')
        await systemDashboardPage.waitForSwitchSchemaToLoad()
        await systemDashboardPage.clickRunSwitchSchemaAndSyncButton()
        await runSwitchSchemaAndSynchronizationModal.assertAtPage()
        await runSwitchSchemaAndSynchronizationModal.clickRunButton()
        await topNavigation.waitForToastMessageToContain('Switch Schema has completed', 50000)

        //check quantity of document inside of evergreen collection after "Switch Schema and Sincronization"
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.selectItem('test evergreen collection')
        await common.waitForTimeout(1000)
        chai.expect(
            await collectionsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n5')
    })

    it('Delete created collection, folder and saved search', async function() {
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.openItemMenu('test evergreen collection')
        await collectionsPage.treeView.selectItemMenuItem('Delete Collection')
        await deleteCollectionModal.assertAtPage()
        await deleteCollectionModal.clickButton('Delete')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.not.include.members([
            "test evergreen collection"
        ])
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('test folder coll')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "test folder coll"
        ])
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.searchForSavedSearches('test')
        await searchPage.deleteSelectedSavedSearch('test')
        await deleteSearchModal.assertAtPage()
        await deleteSearchModal.clickButton('Confirm')
        chai.expect(
            await searchPage.getSavedSearchNames()
        ).to.not.include.members([
            "test"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Collection Sets - After releasing documents from the search amount of documents of Evergreen Collection shoudnt change', async function() {
    let loginUtil    
    let projectNavigation
    let foldersPage
    let browserHelper
    let searchPage
    let searchResultsPage
    let addToAFolderModal
    let createFolderModal
    let addFolderModal
    let saveSearchCriteriaModal
    let deleteFolderModal
    let deleteSearchModal
    let topNavigation
    let collectionsPage
    let createCollectionModal
    let deleteCollectionModal
    let removeSelectedDocumentsModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        foldersPage = new FoldersPage(browserHelper.browser, browserHelper.page)
        searchPage = new SearchPage(browserHelper.browser, browserHelper.page)
        searchResultsPage = new SearchResultsPage(browserHelper.browser, browserHelper.page)
        addToAFolderModal = new AddToAFolderModal(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        addFolderModal = new AddFolderModal(browserHelper.browser, browserHelper.page)
        saveSearchCriteriaModal = new SaveSearchCriteriaModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        deleteSearchModal = new DeleteSearchModal(browserHelper.browser, browserHelper.page)
        topNavigation = new TopNavigation(browserHelper.browser, browserHelper.page)
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)
        createCollectionModal = new CreateCollectionModal(browserHelper.browser, browserHelper.page)
        deleteCollectionModal = new DeleteCollectionModal(browserHelper.browser, browserHelper.page)
        removeSelectedDocumentsModal = new RemoveSelectedDocumentsModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject')) 
    })

    it('Create a folder with documents', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideSearchPredicate('Full Text Element')
        await searchPage.clickFullTextElementClickToInsert()
        await searchPage.typeFullTextElementTerm('test')
        await searchPage.clickSearchButton()
        await searchResultsPage.assertAtPage()
        await searchResultsPage.documentList.clickNthDocumentCheckbox(0)
        await searchResultsPage.documentList.clickNthDocumentCheckbox(1)
        await searchResultsPage.documentList.clickNthDocumentCheckbox(2)
        await searchResultsPage.clickToolbarButton("Actions")
        await searchResultsPage.clickActionMenuItem('Folder Selected')

        //open Add to a folder modal
        await addToAFolderModal.assertAtPage()
        await addToAFolderModal.treeView.openItemMenu('Folders')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')

        //open create folder modal
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('test folder coll')
        await createFolderModal.typeDescription('test description')
        await createFolderModal.clickButton('Create')

         //add documents to folder
         await addToAFolderModal.treeView.selectItem('test folder coll')
         await addToAFolderModal.clickButton('Folder')

         //verify that folder is created
         await projectNavigation.assertAtPage()
         await projectNavigation.openDocumentSetsMenu()
         await projectNavigation.clickMenuItem('Folders')
         await foldersPage.assertAtPage()
         chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "test folder coll"
        ])
    })

    it('Search for RG Sets -> Folder -> our new created folder and Save Search Criteria', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideSearchPredicateByName('Folder')
        await addFolderModal.assertAtPage()
        await addFolderModal.treeView.addSelectedFolder('test folder coll')
        await addFolderModal.clickButton('Cancel')
        await searchPage.clickSaveSearchCriteria()
        await saveSearchCriteriaModal.assertAtPage()
        await saveSearchCriteriaModal.typeName('test')
        await saveSearchCriteriaModal.clickButton('Save')
        await searchResultsPage.assertAtPage()
        await searchResultsPage.clickSearchNavigationTab('Search')
        await searchPage.assertAtPage()
        await searchPage.searchForSavedSearches('test')
        chai.expect(
            await searchPage.getSavedSearchNames()
        ).to.include.members([
            "test"
        ])
    })

    it('Create a new evergreen collection with Saved Search and check quantity of documents inside', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        await collectionsPage.clickCreateButton('New Collection')
        await createCollectionModal.assertAtPage()
        await createCollectionModal.typeName('test evergreen collection')
        await createCollectionModal.typeDesc('test evergreen description')
        await createCollectionModal.openSelectSearch()
        await createCollectionModal.searchForSavedSearches('test')
        await createCollectionModal.clickButton('Create')        
        await common.waitForTimeout(500)
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.include.members([
            "Collections",
            "test evergreen collection"
        ])

        // check quantiti of documents inside of evergreen collection
        await collectionsPage.treeView.selectItem('test evergreen collection')
        await common.waitForTimeout(1000)
        chai.expect(
            await collectionsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n3')
    })

    it('Remove 1 document from folder of Saved Searches', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('test folder coll')
        await foldersPage.documentList.clickNthDocumentCheckbox(0)
        await foldersPage.clickToolbarButton('Actions')
        await foldersPage.clickActionMenuItem('Remove Selected')
        await removeSelectedDocumentsModal.assertAtPage()
        await removeSelectedDocumentsModal.clickButton('Remove')
        await common.waitForTimeout(1000)
        chai.expect(
            await foldersPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n2')
    })

    it('Run "Refresh Evergreen" and check if documents was released from evergreen Collection', async function() {

        //check quantity of document inside of evergreen collection before "Refresh Evergreen"
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.selectItem('test evergreen collection')
        await common.waitForTimeout(1000)
        chai.expect(
            await collectionsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n3')

        // run "Refresh Evergreen"
        await collectionsPage.clickRefreshToolbarButton()
        await collectionsPage.clickRefreshMenuItem('Refresh Evergreen')
        //wait for toast, then wait a bit more
        await topNavigation.waitForToastMessageToContain('Evergreen refresh has finished')
        await common.waitForTimeout(1000)

        //check quantity of document inside of evergreen collection after "Refresh Evergreen"
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.selectItem('test evergreen collection')
        await common.waitForTimeout(2000)
        chai.expect(
            await collectionsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n3')
    })

    it('Delete created collection, folder and saved search', async function() {
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.openItemMenu('test evergreen collection')
        await collectionsPage.treeView.selectItemMenuItem('Delete Collection')
        await deleteCollectionModal.assertAtPage()
        await deleteCollectionModal.clickButton('Delete')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.not.include.members([
            "test evergreen collection"
        ])
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('test folder coll')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "test folder coll"
        ])
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.searchForSavedSearches('test')
        await searchPage.deleteSelectedSavedSearch('test')
        await deleteSearchModal.assertAtPage()
        await deleteSearchModal.clickButton('Confirm')
        chai.expect(
            await searchPage.getSavedSearchNames()
        ).to.not.include.members([
            "test"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})