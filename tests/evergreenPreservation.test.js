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
const CreatePreservationSetModal = require("../pages/modals/CreatePreservationSetModal")
const EditPreservationSetModal = require("../pages/modals/EditPreservationSetModal")
const DeletePreservationModal = require("../pages/modals/DeletePreservationModal")
const PreserveDocumentsModal = require("../pages/modals/PreserveDocumentsModal")
const RemoveSelectedDocumentsModal = require("../pages/modals/RemoveSelectedDocumentsModal")

describe('Evergreen Preservation Sets (Preservation page)- create and delete evergreen preservation from left pane', async function () {
    let loginUtil    
    let projectNavigation
    let preservationsPage
    let createPreservationSetModal
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let editPreservationSetModal
    let deletePreservationModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        createPreservationSetModal = new CreatePreservationSetModal(browserHelper.browser, browserHelper.page)
        editPreservationSetModal = new EditPreservationSetModal(browserHelper.browser, browserHelper.page)
        deletePreservationModal = new DeletePreservationModal(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create a folder from Preservation menu', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.clickCreateButton('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from evg preservation')
        await createFolderModal.typeDescription('folder description')
        await createFolderModal.clickButton('Create')       
        await common.waitForTimeout(500)
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.include.members([
            "Preservation Sets",
            "folder from evg preservation"
        ])
    })

    it('User is able to create an evergreen preservation from Preservation menu', async function() {
        await preservationsPage.assertAtPage()        
        await preservationsPage.treeView.openItemMenu('Preservation Sets')        
        await preservationsPage.treeView.selectItemMenuItem('New Preservation Set')
        await createPreservationSetModal.assertAtPage()
        await createPreservationSetModal.typeName('evergreen preservation')
        await createPreservationSetModal.typeDesc('evergreen description')
        await createPreservationSetModal.openSelectSearch()
        await createPreservationSetModal.searchForSavedSearches('master search')
        await createPreservationSetModal.clickButton('Create')        
        await common.waitForTimeout(500)
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.include.members([
            "Preservation Sets",
            "folder from evg preservation",
            "evergreen preservation"
        ])
    })

    it('User is able to edit an evergreen preservation', async function() {
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.openItemMenu('evergreen preservation')
        await preservationsPage.treeView.selectItemMenuItem('Edit Preservation Set')
        await editPreservationSetModal.assertAtPage()
        await common.waitForTimeout(1000)
        await editPreservationSetModal.typeName('EDITED EVG preservation')
        await editPreservationSetModal.typeDescription('it was edited')
        await editPreservationSetModal.clickButton('Save')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.include.members([
            "EDITED EVG preservation"
        ])
    })

    it('User is able to move evergreen preservation to the root, to another folders', async function() {
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.selectItem('EDITED EVG preservation')
        await preservationsPage.treeView.nestField('EDITED EVG preservation', 'folder from evg preservation')        
        //to folder
        chai.expect(
            await preservationsPage.treeView.isItemFoldered('EDITED EVG preservation')
        ).to.be.true
        // to the root
        await preservationsPage.treeView.selectItem('EDITED EVG preservation')
        await preservationsPage.treeView.nestField('EDITED EVG preservation', 'Preservation Sets') 
        chai.expect( 
            await preservationsPage.treeView.isItemFoldered('EDITED EVG preservation')
        ).to.be.false
    })
     
    it('User is able to delete an evergreen preservation from Preservation menu', async function() {        
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.openItemMenu('folder from evg preservation')
        await preservationsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await preservationsPage.treeView.openItemMenu('EDITED EVG preservation')
        await preservationsPage.treeView.selectItemMenuItem('Delete Preservation Set')
        await deletePreservationModal.assertAtPage()
        await deletePreservationModal.clickButton('Delete')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.not.include.members([
            "EDITED EVG preservation",
            "folder from evg preservation"
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Preservation Sets - Create evergreen preservation from Preservations Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let preservationsPage
    let preserveDocumentsModal
    let createPreservationSetModal
    let deletePreservationModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        preserveDocumentsModal = new PreserveDocumentsModal(browserHelper.browser, browserHelper.page)
        createPreservationSetModal = new CreatePreservationSetModal(browserHelper.browser, browserHelper.page)
        deletePreservationModal = new DeletePreservationModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create Evergreen preservation from Preservation sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.selectItem('master preservation')
        await preservationsPage.clickToolbarButton('Actions')
        await preservationsPage.clickActionMenuItem('Preserve All')

        //open Preserve documents modal
        await preserveDocumentsModal.assertAtPage()
        await preserveDocumentsModal.treeView.openItemMenu('Preservation Sets')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Preservation Set')
        
        //open create preservation modal
        await createPreservationSetModal.assertAtPage()
        await createPreservationSetModal.typeName('evg preservation from preservation')
        await createPreservationSetModal.typeDesc('evg description from preservation')
        await createPreservationSetModal.openSelectSearch()
        await createPreservationSetModal.searchForSavedSearches('master search')
        await createPreservationSetModal.clickButton("Create") 

        //create preservation modal closes and evergreen preservation is created
        await preserveDocumentsModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen preservation is created', async function() {
        await preservationsPage.assertAtPage()
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.include.members([
            "evg preservation from preservation"
        ])
    })

    it('User is able to delete evergreen preservation', async function() {
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.openItemMenu("evg preservation from preservation")
        await preservationsPage.treeView.selectItemMenuItem('Delete Preservation Set')
        await deletePreservationModal.assertAtPage()
        await deletePreservationModal.clickButton('Delete')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.not.include.members([
            "evg preservation from preservation"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Preservation Sets - Create evergreen preservation from Collections Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let preservationsPage
    let preserveDocumentsModal
    let createPreservationSetModal
    let deletePreservationModal
    let collectionsPage

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        preserveDocumentsModal = new PreserveDocumentsModal(browserHelper.browser, browserHelper.page)
        createPreservationSetModal = new CreatePreservationSetModal(browserHelper.browser, browserHelper.page)
        deletePreservationModal = new DeletePreservationModal(browserHelper.browser, browserHelper.page)
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create Evergreen preservation from Collection sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.selectItem('master collection')
        await collectionsPage.clickToolbarButton('Actions')
        await collectionsPage.clickActionMenuItem('Preserve All')

        //open Preserve documents modal
        await preserveDocumentsModal.assertAtPage()
        await preserveDocumentsModal.treeView.openItemMenu('Preservation Sets')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Preservation Set')
        
        //open create preservation modal
        await createPreservationSetModal.assertAtPage()
        await createPreservationSetModal.typeName('evg preservation from collection')
        await createPreservationSetModal.typeDesc('evg description from collection')
        await createPreservationSetModal.openSelectSearch()
        await createPreservationSetModal.searchForSavedSearches('master search')
        await createPreservationSetModal.clickButton("Create") 

        //create preservation modal closes and evergreen preservation is created
        await preserveDocumentsModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen preservation is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.include.members([
            "evg preservation from collection"
        ])
    })

    it('User is able to delete evergreen preservation', async function() {
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.openItemMenu("evg preservation from collection")
        await preservationsPage.treeView.selectItemMenuItem('Delete Preservation Set')
        await deletePreservationModal.assertAtPage()
        await deletePreservationModal.clickButton('Delete')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.not.include.members([
            "evg preservation from collection"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Preservation Sets - Create evergreen preservation from Folders Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let preservationsPage
    let preserveDocumentsModal
    let createPreservationSetModal
    let deletePreservationModal
    let foldersPage

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        preserveDocumentsModal = new PreserveDocumentsModal(browserHelper.browser, browserHelper.page)
        createPreservationSetModal = new CreatePreservationSetModal(browserHelper.browser, browserHelper.page)
        deletePreservationModal = new DeletePreservationModal(browserHelper.browser, browserHelper.page)
        foldersPage = new FoldersPage(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create Evergreen preservation from Collection sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('master folder')
        await foldersPage.clickToolbarButton('Actions')
        await foldersPage.clickActionMenuItem('Preserve All')

        //open Preserve documents modal
        await preserveDocumentsModal.assertAtPage()
        await preserveDocumentsModal.treeView.openItemMenu('Preservation Sets')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Preservation Set')
        
        //open create preservation modal
        await createPreservationSetModal.assertAtPage()
        await createPreservationSetModal.typeName('evg preservation from folders')
        await createPreservationSetModal.typeDesc('evg description from folders')
        await createPreservationSetModal.openSelectSearch()
        await createPreservationSetModal.searchForSavedSearches('master search')
        await createPreservationSetModal.clickButton("Create") 

        //create preservation modal closes and evergreen preservation is created
        await preserveDocumentsModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen preservation is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.include.members([
            "evg preservation from folders"
        ])
    })

    it('User is able to delete evergreen preservation', async function() {
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.openItemMenu("evg preservation from folders")
        await preservationsPage.treeView.selectItemMenuItem('Delete Preservation Set')
        await deletePreservationModal.assertAtPage()
        await deletePreservationModal.clickButton('Delete')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.not.include.members([
            "evg preservation from folders"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Preservation Sets - Create evergreen preservation from Policies Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let preservationsPage
    let preserveDocumentsModal
    let createPreservationSetModal
    let deletePreservationModal
    let policiesPage

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        preserveDocumentsModal = new PreserveDocumentsModal(browserHelper.browser, browserHelper.page)
        createPreservationSetModal = new CreatePreservationSetModal(browserHelper.browser, browserHelper.page)
        deletePreservationModal = new DeletePreservationModal(browserHelper.browser, browserHelper.page)
        policiesPage = new PoliciesPage(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create Evergreen preservation from Policies sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Policies')
        await policiesPage.assertAtPage()
        await policiesPage.treeView.selectItem('master policy')
        await policiesPage.clickToolbarButton('Actions')
        await policiesPage.clickActionMenuItem('Preserve All')

        //open Preserve documents modal
        await preserveDocumentsModal.assertAtPage()
        await preserveDocumentsModal.treeView.openItemMenu('Preservation Sets')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Preservation Set')
        
        //open create preservation modal
        await createPreservationSetModal.assertAtPage()
        await createPreservationSetModal.typeName('evg preservation from policy')
        await createPreservationSetModal.typeDesc('evg description from policy')
        await createPreservationSetModal.openSelectSearch()
        await createPreservationSetModal.searchForSavedSearches('master search')
        await createPreservationSetModal.clickButton("Create") 

        //create preservation modal closes and evergreen preservation is created
        await preserveDocumentsModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen preservation is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.include.members([
            "evg preservation from policy"
        ])
    })

    it('User is able to delete evergreen preservation', async function() {
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.openItemMenu("evg preservation from policy")
        await preservationsPage.treeView.selectItemMenuItem('Delete Preservation Set')
        await deletePreservationModal.assertAtPage()
        await deletePreservationModal.clickButton('Delete')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.not.include.members([
            "evg preservation from policy"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Preservation Sets - Create evergreen preservation from Exports Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let preservationsPage
    let preserveDocumentsModal
    let createPreservationSetModal
    let deletePreservationModal
    let exportsPage

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        preserveDocumentsModal = new PreserveDocumentsModal(browserHelper.browser, browserHelper.page)
        createPreservationSetModal = new CreatePreservationSetModal(browserHelper.browser, browserHelper.page)
        deletePreservationModal = new DeletePreservationModal(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create Evergreen preservation from Exports sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.selectItem('master export')
        await exportsPage.clickToolbarButton('Actions')
        await exportsPage.clickActionMenuItem('Preserve All')

        //open Preserve documents modal
        await preserveDocumentsModal.assertAtPage()
        await preserveDocumentsModal.treeView.openItemMenu('Preservation Sets')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Preservation Set')
        
        //open create preservation modal
        await createPreservationSetModal.assertAtPage()
        await createPreservationSetModal.typeName('evg preservation from exports')
        await createPreservationSetModal.typeDesc('evg description from exports')
        await createPreservationSetModal.openSelectSearch()
        await createPreservationSetModal.searchForSavedSearches('master search')
        await createPreservationSetModal.clickButton("Create") 

        //create preservation modal closes and evergreen preservation is created
        await preserveDocumentsModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen preservation is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.include.members([
            "evg preservation from exports"
        ])
    })

    it('User is able to delete evergreen preservation', async function() {
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.openItemMenu("evg preservation from exports")
        await preservationsPage.treeView.selectItemMenuItem('Delete Preservation Set')
        await deletePreservationModal.assertAtPage()
        await deletePreservationModal.clickButton('Delete')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.not.include.members([
            "evg preservation from exports"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Preservation Sets - Create and delete evergreen preservation from Explorer Graph', async function() {
    let loginUtil    
    let projectNavigation
    let preservationsPage
    let browserHelper
    let deletePreservationModal
    let explorerPage
    let createPreservationSetModal
    let explorerDocumentPage
    let preserveDocumentsModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        explorerPage = new ExplorerPage(browserHelper.browser, browserHelper.page) 
        explorerDocumentPage = new ExplorerDocumentPage(browserHelper.browser, browserHelper.page)
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        deletePreservationModal = new DeletePreservationModal(browserHelper.browser, browserHelper.page)
        createPreservationSetModal = new CreatePreservationSetModal(browserHelper.browser, browserHelper.page)
        preserveDocumentsModal = new PreserveDocumentsModal(browserHelper.browser, browserHelper.page)
       
        await loginUtil.loginAsRGLocalUser(config.get('rgProject')) 
    })

    it('User is able to create an evergreen preservation from Explorer Graph', async function () {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Explorer')
        await explorerPage.assertAtPage()
        await explorerPage.openDataSet()
        await explorerPage.expandDataSetProjectOptionMenu('Folders')
        await explorerPage.selectNthDataProjectOptionMenuItem(0)
        await explorerPage.openActionMenu()
        await explorerPage.clickGraphBar('Text')
        await explorerPage.clickActionMenuItem('View Document Set')
        await common.waitForTimeout(4000)
        await explorerDocumentPage.assertAtPage()
        await explorerDocumentPage.clickToolbarButton('Actions')
        await explorerDocumentPage.clickActionMenuItem('Preserve All')

        //open Preserve documents modal
        await preserveDocumentsModal.assertAtPage()
        await preserveDocumentsModal.treeView.openItemMenu('Preservation Sets')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Preservation Set')

        //open create preservation modal
        await createPreservationSetModal.assertAtPage()
        await createPreservationSetModal.typeName('evg preservation from explorer graph')
        await createPreservationSetModal.typeDesc('evg preservation from explorer graph')
        await createPreservationSetModal.openSelectSearch()
        await createPreservationSetModal.searchForSavedSearches('master search')
        await createPreservationSetModal.clickButton('Create')
        
        //close Preserve documents modal
        await preserveDocumentsModal.assertAtPage()
        await common.waitForTimeout(500)
        await preserveDocumentsModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen preservation is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.include.members([
            "evg preservation from explorer graph"
        ])
    })

    it('User is able to delete evergreen preservation', async function() {
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.openItemMenu('evg preservation from explorer graph')
        await preservationsPage.treeView.selectItemMenuItem('Delete Preservation Set')
        await deletePreservationModal.assertAtPage()
        await deletePreservationModal.clickButton('Delete')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.not.include.members([
            "evg preservation from explorer graph"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Preservation Sets - Create and delete evergreen preservation from Search Page', async function() {
    let loginUtil    
    let projectNavigation
    let preservationsPage
    let browserHelper
    let preserveDocumentsModal
    let deletePreservationModal
    let createPreservationSetModal
    let searchPage
    let searchResultsPage

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        preserveDocumentsModal = new PreserveDocumentsModal(browserHelper.browser, browserHelper.page)
        deletePreservationModal =  new DeletePreservationModal(browserHelper.browser, browserHelper.page)
        createPreservationSetModal = new CreatePreservationSetModal(browserHelper.browser, browserHelper.page)
        searchPage = new SearchPage(browserHelper.browser, browserHelper.page)
        searchResultsPage = new SearchResultsPage(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create evergreen preservation from Search Page', async function() {
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
        await searchResultsPage.clickActionMenuItem('Preserve All')

        //open Preserve documents modal
        await preserveDocumentsModal.assertAtPage()
        await preserveDocumentsModal.treeView.openItemMenu('Preservation Sets')
        await preservationsPage.treeView.selectItemMenuItem('New Preservation Set')

        //open create preservation modal
        await createPreservationSetModal.assertAtPage()
        await createPreservationSetModal.typeName('evg preservation from search')
        await createPreservationSetModal.typeDesc('evg description from search')
        await createPreservationSetModal.openSelectSearch()
        await createPreservationSetModal.searchForSavedSearches('master search')
        await createPreservationSetModal.clickButton("Create")

        //close Preserve documents modal
        await preserveDocumentsModal.assertAtPage()
        await preserveDocumentsModal.clickButton('Cancel')
    })

    it('Verify that evergreen preservation is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.include.members([
            "evg preservation from search"
        ])
    })

    it('User is able to delete evergreen preservation', async function() {
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.openItemMenu('evg preservation from search')
        await preservationsPage.treeView.selectItemMenuItem('Delete Preservation Set')
        await deletePreservationModal.assertAtPage()
        await deletePreservationModal.clickButton('Delete')
        await common.waitForTimeout(3000)
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.not.include.members([
            "evg preservation from search"
        ])
    })
 
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Preservation Sets - Create and delete evergreen preservation from Explorer Views', async function() {
    let loginUtil    
    let projectNavigation
    let preservationsPage
    let browserHelper
    let deletePreservationModal
    let explorerPage
    let createPreservationSetModal
    let explorerDocumentPage
    let preserveDocumentsModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        explorerPage = new ExplorerPage(browserHelper.browser, browserHelper.page) 
        explorerDocumentPage = new ExplorerDocumentPage(browserHelper.browser, browserHelper.page)
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        deletePreservationModal = new DeletePreservationModal(browserHelper.browser, browserHelper.page)
        createPreservationSetModal = new CreatePreservationSetModal(browserHelper.browser, browserHelper.page)
        preserveDocumentsModal = new PreserveDocumentsModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject')) 
    })

    it('User is able to create an evergreen preservation from Explorer Viewes', async function () {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Explorer')
        await explorerPage.assertAtPage()
        await explorerPage.openActionMenu()
        await explorerPage.clickActionMenuItem('View Document Set')
        await explorerPage.waitForTaskCountToBeZero('0')
        await explorerDocumentPage.assertAtPage()
        await common.waitForTimeout(7000)
        await explorerDocumentPage.clickToolbarButton('Actions')
        await explorerDocumentPage.clickActionMenuItem('Preserve All')

        //open Preserve documents modal
        await preserveDocumentsModal.assertAtPage()
        await preserveDocumentsModal.treeView.openItemMenu('Preservation Sets')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Preservation Set')

        //open create preservation modal
        await createPreservationSetModal.assertAtPage()
        await createPreservationSetModal.typeName('evg preservation from explorer views')
        await createPreservationSetModal.typeDesc('desc from explorer views')
        await createPreservationSetModal.openSelectSearch()
        await createPreservationSetModal.searchForSavedSearches('master search')
        await createPreservationSetModal.clickButton('Create')
        
        //close Preservation document modal
        await preserveDocumentsModal.assertAtPage()
        await common.waitForTimeout(500)
        await preserveDocumentsModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen preservation is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.include.members([
            "evg preservation from explorer views"
        ])
    })

    it('User is able to delete evergreen preservation', async function() {
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.openItemMenu('evg preservation from explorer views')
        await preservationsPage.treeView.selectItemMenuItem('Delete Preservation Set')
        await deletePreservationModal.assertAtPage()
        await deletePreservationModal.clickButton('Delete')
        await common.waitForTimeout(6000)
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.not.include.members([
            "evg preservation from explorer views"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Presrevation Sets - Add documents to Evergreen Preservation after "Refresh Evergreen"', async function() {
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
    let preservationsPage
    let createPreservationSetModal
    let deletePreservationModal

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
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        createPreservationSetModal = new CreatePreservationSetModal(browserHelper.browser, browserHelper.page)
        deletePreservationModal = new DeletePreservationModal(browserHelper.browser, browserHelper.page)

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
        await createFolderModal.typeName('test folder preservation')
        await createFolderModal.typeDescription('test description')
        await createFolderModal.clickButton('Create')

         //add documents to folder
         await addToAFolderModal.treeView.selectItem('test folder preservation')
         await addToAFolderModal.clickButton('Folder')

         //verify that folder is created
         await projectNavigation.assertAtPage()
         await projectNavigation.openDocumentSetsMenu()
         await projectNavigation.clickMenuItem('Folders')
         await foldersPage.assertAtPage()
         chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "test folder preservation"
        ])
    })

    it('Search for RG Sets -> Folder -> our new created folder and Save Search Criteria', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideSearchPredicateByName('Folder')
        await addFolderModal.assertAtPage()
        await addFolderModal.treeView.addSelectedFolder('test folder preservation')
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

    it('Create a new evergreen preservation with Saved Search and check quantity of documents inside', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.clickCreateButton('New Preservation Set')
        await createPreservationSetModal.assertAtPage()
        await createPreservationSetModal.typeName('test evergreen preservation')
        await createPreservationSetModal.typeDesc('test evergreen description')
        await createPreservationSetModal.openSelectSearch()
        await createPreservationSetModal.searchForSavedSearches('test')
        await createPreservationSetModal.clickButton('Create')        
        await common.waitForTimeout(500)
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.include.members([
            "Preservation Sets",
            "test evergreen preservation"
        ])

        // check quantiti of documents inside of evergreen preservation
        await preservationsPage.treeView.selectItem('test evergreen preservation')
        await common.waitForTimeout(1000)
        chai.expect(
            await preservationsPage.documentList.getDocumentsCount()
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
        await addToAFolderModal.treeView.selectItem('test folder preservation')
        await addToAFolderModal.clickButton('Folder')
        await common.waitForTimeout(1000)

        //check quantity of document inside of folder
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('test folder preservation')
        await common.waitForTimeout(1000)
        chai.expect(
            await foldersPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n5')
    })

    it('Run "Refresh Evergreen" and check quantity of documents inside evergreen preservation', async function() {

        //check quantity of document inside of evergreen preservation before "Refresh Evergreen"
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.selectItem('test evergreen preservation')
        await common.waitForTimeout(1000)
        chai.expect(
            await preservationsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n3')

        // run "Refresh Evergreen"
        await preservationsPage.clickRefreshToolbarButton()
        await preservationsPage.clickRefreshMenuItem('Refresh Evergreen')
        //wait for toast, then wait a bit more
        await topNavigation.waitForToastMessageToContain('Evergreen refresh has finished')
        await common.waitForTimeout(1000)

        //check quantity of document inside of evergreen preservation after "Refresh Evergreen"
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.selectItem('test evergreen preservation')
        await common.waitForTimeout(1000)
        chai.expect(
            await preservationsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n5')
    })

    it('Delete created preservation, folder and saved search', async function() {
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.openItemMenu('test evergreen preservation')
        await preservationsPage.treeView.selectItemMenuItem('Delete Preservation Set')
        await deletePreservationModal.assertAtPage()
        await deletePreservationModal.clickButton('Delete')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.not.include.members([
            "test evergreen preservation"
        ])
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('test folder preservation')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "test folder preservation"
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

describe('Evergreen Preservation Sets - Add documents to Evergreen Preservation after "Switch Schema"', async function() {
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
    let preservationsPage
    let createPreservationSetModal
    let deletePreservationModal
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
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        createPreservationSetModal = new CreatePreservationSetModal(browserHelper.browser, browserHelper.page)
        deletePreservationModal = new DeletePreservationModal(browserHelper.browser, browserHelper.page)
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
        await createFolderModal.typeName('test folder preservation')
        await createFolderModal.typeDescription('test description')
        await createFolderModal.clickButton('Create')

        //add documents to folder
        await addToAFolderModal.treeView.selectItem('test folder preservation')
        await addToAFolderModal.clickButton('Folder')

        //verify that folder is created
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
           "test folder preservation"
        ])
    })

    it('Search for RG Sets -> Folder -> our new created folder and Save Search Criteria', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideSearchPredicateByName('Folder')
        await addFolderModal.assertAtPage()
        await addFolderModal.treeView.addSelectedFolder('test folder preservation')
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

    it('Create a new evergreen preservation with Saved Search and check quantity of documents inside', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.clickCreateButton('New Preservation Set')
        await createPreservationSetModal.assertAtPage()
        await createPreservationSetModal.typeName('test evergreen preservation')
        await createPreservationSetModal.typeDesc('test evergreen description')
        await createPreservationSetModal.openSelectSearch()
        await createPreservationSetModal.searchForSavedSearches('test')
        await createPreservationSetModal.clickButton('Create')        
        await common.waitForTimeout(500)
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.include.members([
            "Preservation Sets",
            "test evergreen preservation"
        ])

        // check quantiti of documents inside of evergreen preservation
        await preservationsPage.treeView.selectItem('test evergreen preservation')
        await common.waitForTimeout(1000)
        chai.expect(
            await preservationsPage.documentList.getDocumentsCount()
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
        await addToAFolderModal.treeView.selectItem('test folder preservation')
        await addToAFolderModal.clickButton('Folder')
        await common.waitForTimeout(1000)

        //check quantity of document inside of folder
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('test folder preservation')
        await common.waitForTimeout(1000)
        chai.expect(
            await foldersPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n5')
    })

    it('Run "Switch Schema and Sincronization" and check quantity of documents inside evergreen preservation', async function() {

        //check quantity of document inside of evergreen preservation before run "Switch Schema and Sincronization"
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.selectItem('test evergreen preservation')
        await common.waitForTimeout(1000)
        chai.expect(
            await preservationsPage.documentList.getDocumentsCount()
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

        //check quantity of document inside of evergreen preservation after "Switch Schema and Sincronization"
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.selectItem('test evergreen preservation')
        await common.waitForTimeout(1000)
        chai.expect(
            await preservationsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n5')
    })

    it('Delete created preservation, folder and saved search', async function() {
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.openItemMenu('test evergreen preservation')
        await preservationsPage.treeView.selectItemMenuItem('Delete Preservation Set')
        await deletePreservationModal.assertAtPage()
        await deletePreservationModal.clickButton('Delete')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.not.include.members([
            "test evergreen preservation"
        ])
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('test folder preservation')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "test folder preservation"
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

describe('Evergreen Preservation Sets - Leave documents in evergreen Preservation after releasing them from the search', async function() {
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
    let preservationsPage
    let createPreservationSetModal
    let deletePreservationModal
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
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        createPreservationSetModal = new CreatePreservationSetModal(browserHelper.browser, browserHelper.page)
        deletePreservationModal = new DeletePreservationModal(browserHelper.browser, browserHelper.page)
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
        await createFolderModal.typeName('test folder preservation')
        await createFolderModal.typeDescription('test description')
        await createFolderModal.clickButton('Create')

         //add documents to folder
         await addToAFolderModal.treeView.selectItem('test folder preservation')
         await addToAFolderModal.clickButton('Folder')

         //verify that folder is created
         await projectNavigation.assertAtPage()
         await projectNavigation.openDocumentSetsMenu()
         await projectNavigation.clickMenuItem('Folders')
         await foldersPage.assertAtPage()
         chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "test folder preservation"
        ])
    })

    it('Search for RG Sets -> Folder -> our new created folder and Save Search Criteria', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideSearchPredicateByName('Folder')
        await addFolderModal.assertAtPage()
        await addFolderModal.treeView.addSelectedFolder('test folder preservation')
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

    it('Create a new evergreen preservation with Saved Search and check quantity of documents inside', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.clickCreateButton('New Preservation Set')
        await createPreservationSetModal.assertAtPage()
        await createPreservationSetModal.typeName('test evergreen preservation')
        await createPreservationSetModal.typeDesc('test evergreen description')
        await createPreservationSetModal.openSelectSearch()
        await createPreservationSetModal.searchForSavedSearches('test')
        await createPreservationSetModal.clickButton('Create')        
        await common.waitForTimeout(500)
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.include.members([
            "Preservation Sets",
            "test evergreen preservation"
        ])

        // check quantiti of documents inside of evergreen preservation
        await preservationsPage.treeView.selectItem('test evergreen preservation')
        await common.waitForTimeout(1000)
        chai.expect(
            await preservationsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n3')
    })

    it('Remove 1 document from folder of Saved Searches', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('test folder preservation')
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

    it('Run "Refresh Evergreen" and check if documents was released from evergreen Preservation', async function() {

        //check quantity of document inside of evergreen preservation before "Refresh Evergreen"
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.selectItem('test evergreen preservation')
        await common.waitForTimeout(1000)
        chai.expect(
            await preservationsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n3')

        // run "Refresh Evergreen"
        await preservationsPage.clickRefreshToolbarButton()
        await preservationsPage.clickRefreshMenuItem('Refresh Evergreen')
        //wait for toast, then wait a bit more
        await topNavigation.waitForToastMessageToContain('Evergreen refresh has finished')
        await common.waitForTimeout(1000)

        //check quantity of document inside of evergreen preservation after "Refresh Evergreen"
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.selectItem('test evergreen preservation')
        await common.waitForTimeout(2000)
        chai.expect(
            await preservationsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n3')
    })

    it('Delete created preservation, folder and saved search', async function() {
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.openItemMenu('test evergreen preservation')
        await preservationsPage.treeView.selectItemMenuItem('Delete Preservation Set')
        await deletePreservationModal.assertAtPage()
        await deletePreservationModal.clickButton('Delete')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.not.include.members([
            "test evergreen preservation"
        ])
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('test folder preservation')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "test folder preservation"
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