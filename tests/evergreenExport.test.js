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
const RemoveSelectedDocumentsModal = require("../pages/modals/RemoveSelectedDocumentsModal")
const CreateExportModal = require("../pages/modals/CreateExportModal")
const DeleteExportModal = require("../pages/modals/DeleteExportModal")
const EditExportModal = require("../pages/modals/EditExportModal")
const AddToAnExportModal = require("../pages/modals/AddToAnExportModal")
const RRCLoginPage = require("../pages/rrc/RRCLoginPage")
const RRCMatterListingPage = require("../pages/rrc/RRCMatterListinPage")
const RRCMatterLoadsSummaryPage = require("../pages/rrc/RRCMatterLoadsSummaryPage")
const RRCDeleteLoadModal = require("../pages/rrc/RRCDeleteLoadModal")

// ==========================
// =======to agent ==========
// ==========================

describe('Evergreen Export Sets (Export page)- create and delete evergreen export to agent from left pane', async function () {
    let loginUtil    
    let projectNavigation
    let exportsPage
    let createExportModal
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let editExportModal
    let deleteExportModal
    let topNavigation

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        createExportModal =  new CreateExportModal(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page)
        editExportModal = new EditExportModal(browserHelper.browser, browserHelper.page)
        topNavigation = new TopNavigation(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create a folder from Export menu', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.clickCreateButton('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from evg export')
        await createFolderModal.typeDescription('folder description')
        await createFolderModal.clickButton('Create')        
        await common.waitForTimeout(500)
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "Exports",
            "folder from evg export"
        ])
    })

    it('User is able to create an evergreen export from Exports menu', async function() {
        await exportsPage.assertAtPage()        
        await exportsPage.treeView.openItemMenu('Exports')        
        await exportsPage.treeView.selectItemMenuItem('New Export')
        await createExportModal.assertAtPage()
        await createExportModal.typeName('evergreen export')
        await createExportModal.typeDesc('evergreen description')
        await createExportModal.openSelectSearch()
        await createExportModal.searchForSavedSearches('master search')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('automation endpoint')
        await createExportModal.clickButton('Create')        
        await common.waitForTimeout(500)
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "Exports",
            "folder from evg export",
            "evergreen export"
        ])
    })

    it('User is able to edit an evergreen export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('evergreen export')
        await exportsPage.treeView.selectItemMenuItem('Edit Export')
        await editExportModal.assertAtPage()
        await common.waitForTimeout(500)
        await editExportModal.typeName('EDITED evg export')
        await editExportModal.typeDescription('it was edited')
        await editExportModal.clickButton('Save')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "EDITED evg export"
        ])
    })

    it('User is able to move evergreen export to the root, to the folder', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.selectItem('EDITED evg export')        
        //to another folder
        await exportsPage.treeView.nestField('EDITED evg export', 'folder from evg export')
        chai.expect(
            await exportsPage.treeView.isItemFoldered('EDITED evg export')
        ).to.be.true

        await exportsPage.treeView.selectItem('EDITED evg export')
        //to the root
        await exportsPage.treeView.nestField('EDITED evg export', 'Exports')
        await common.waitForTimeout(1000)
        chai.expect( 
            await exportsPage.treeView.isItemFoldered('EDITED evg export')
        ).to.be.false
    })

    it('User is able to Refresh evergreen Export Info and Stop Export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.selectItem('EDITED evg export')
        await exportsPage.clickDocumentDetailsLink()

        // info value before refresh
        chai.expect(
            await exportsPage.getValueOfStatus('Step 1: Preparing to Collect')
        ).to.equal('Click the Refresh link.')
        await exportsPage.clickDetailsHeaderButton('Refresh')

        // info value after refresh
        chai.expect(
            await exportsPage.getValueOfStatus('Step 1: Preparing to Collect')
        ).to.equal('0%')

        // info value before start
        chai.expect(
            await exportsPage.getValueOfStatus('Status:')
        ).to.equal('New')
        await exportsPage.clickDetailsHeaderButton('Start')

        // info value after start
        chai.expect(
            await exportsPage.getValueOfStatus('Status:')
        ).to.equal('In Progress')
       
        // info value before stop
        chai.expect(
            await exportsPage.getValueOfStatus('Status:')
        ).to.equal('In Progress')
        await exportsPage.clickDetailsHeaderButton('Stop')
        await topNavigation.waitForTaskCount('0')

        // info value after stop
        chai.expect(
            await exportsPage.getValueOfStatus('Status:')
        ).to.equal('Stopped')
        await exportsPage.closeInfoPane()
    })
     
    it('User is able to delete an evergreen export from Export menu', async function() {        
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('folder from evg export')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('EDITED evg export')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "evergreen export",
            "folder from evg export"
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Export Sets (Export Page) - Create evergreen export to agent from Preservations Set', async function() {
    let loginUtil    
    let projectNavigation
    let exportsPage
    let browserHelper
    let deleteExportModal
    let preservationsPage
    let addToAnExportModal
    let createExportModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page) 
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create Evergreen export to agent from Preservation sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.selectItem('master preservation')
        await preservationsPage.clickToolbarButton('Actions')
        await preservationsPage.clickActionMenuItem('Export All')

        //open Add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')
        
        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('evg export from preservation')
        await createExportModal.typeDesc('evg description from preservation')
        await createExportModal.openSelectSearch()
        await createExportModal.searchForSavedSearches('master search')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('automation endpoint')
        await createExportModal.clickButton("Create") 

        //add to an export modal closes and evergreen export is created
        await addToAnExportModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen export is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "evg export from preservation"
        ])
    })

    it('User is able to delete evergreen export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('evg export from preservation')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "evg export from preservation"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Export Sets (Export Page) - Create evergreen export to agent from Collections Set', async function() {
    let loginUtil    
    let projectNavigation
    let exportsPage
    let browserHelper
    let deleteExportModal
    let collectionsPage
    let addToAnExportModal
    let createExportModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page) 
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create Evergreen export to agent from Collection sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.selectItem('master collection')
        await collectionsPage.clickToolbarButton('Actions')
        await collectionsPage.clickActionMenuItem('Export All')

        //open Add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')
        
        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('evg export from collection')
        await createExportModal.typeDesc('evg description from collection')
        await createExportModal.openSelectSearch()
        await createExportModal.searchForSavedSearches('master search')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('automation endpoint')
        await createExportModal.clickButton("Create") 

        //add to an export modal closes and evergreen export is created
        await addToAnExportModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen export is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "evg export from collection"
        ])
    })

    it('User is able to delete evergreen export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('evg export from collection')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "evg export from collection"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Export Sets (Export Page) - Create evergreen export to agent from Folders Set', async function() {
    let loginUtil    
    let projectNavigation
    let exportsPage
    let browserHelper
    let deleteExportModal
    let foldersPage
    let addToAnExportModal
    let createExportModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page) 
        foldersPage = new FoldersPage(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create Evergreen export to agent from Collection sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('master folder')
        await foldersPage.clickToolbarButton('Actions')
        await foldersPage.clickActionMenuItem('Export All')

        //open Add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')
        
        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('evg export from folders')
        await createExportModal.typeDesc('evg description from folders')
        await createExportModal.openSelectSearch()
        await createExportModal.searchForSavedSearches('master search')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('automation endpoint')
        await createExportModal.clickButton("Create") 

        //add to an export modal closes and evergreen export is created
        await addToAnExportModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen export is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "evg export from folders"
        ])
    })

    it('User is able to delete evergreen export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('evg export from folders')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "evg export from folders"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Export Sets (Export Page) - Create evergreen export to agent from Policies Set', async function() {
    let loginUtil    
    let projectNavigation
    let exportsPage
    let browserHelper
    let deleteExportModal
    let policiesPage
    let addToAnExportModal
    let createExportModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page) 
        policiesPage = new PoliciesPage(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create Evergreen export to agent from Policy sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Policies')
        await policiesPage.assertAtPage()
        await policiesPage.treeView.selectItem('master policy')
        await policiesPage.clickToolbarButton('Actions')
        await policiesPage.clickActionMenuItem('Export All')

        //open Add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')
        
        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('evg export from policies')
        await createExportModal.typeDesc('evg description from policies')
        await createExportModal.openSelectSearch()
        await createExportModal.searchForSavedSearches('master search')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('automation endpoint')
        await createExportModal.clickButton("Create") 

        //add to an export modal closes and evergreen export is created
        await addToAnExportModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen export is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "evg export from policies"
        ])
    })

    it('User is able to delete evergreen export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('evg export from policies')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "evg export from policies"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Export Sets (Export Page) - Create evergreen export to agent from Exports Set', async function() {
    let loginUtil    
    let projectNavigation
    let exportsPage
    let browserHelper
    let deleteExportModal
    let addToAnExportModal
    let createExportModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page) 
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create Evergreen export to agent from Export sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.selectItem('master export')
        await exportsPage.clickToolbarButton('Actions')
        await exportsPage.clickActionMenuItem('Export All')

        //open Add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')
        
        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('evg export from exports')
        await createExportModal.typeDesc('evg description from exports')
        await createExportModal.openSelectSearch()
        await createExportModal.searchForSavedSearches('master search')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('automation endpoint')
        await createExportModal.clickButton("Create") 

        //add to an export modal closes and evergreen export is created
        await addToAnExportModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen export is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "evg export from exports"
        ])
    })

    it('User is able to delete evergreen export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('evg export from exports')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "evg export from exports"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Export Sets (Export Page) - Create and delete evergreen export to agent from Explorer Graph', async function() {
    let loginUtil    
    let projectNavigation
    let exportsPage
    let browserHelper
    let deleteExportModal
    let explorerPage
    let createExportModal
    let addToAnExportModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page)
        explorerPage = new ExplorerPage(browserHelper.browser, browserHelper.page) 
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject')) 
    })

    it('User is able to create an evergreen export to agent from Explorer Graph', async function () {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Explorer')
        await explorerPage.assertAtPage()
        await explorerPage.openDataSet()
        await explorerPage.expandDataSetProjectOptionMenu('Folders')
        await explorerPage.selectNthDataProjectOptionMenuItem(0)
        await explorerPage.openActionMenu()
        await explorerPage.clickGraphBar('Text')
        await explorerPage.clickActionMenuItem('Export')

        //open add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')

        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('evg export from explorer graph')
        await createExportModal.typeDesc('evg export from explorer graph')
        await createExportModal.openSelectSearch()
        await createExportModal.searchForSavedSearches('master search')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('automation endpoint')
        await createExportModal.clickButton('Create')
        
        //close export document modal
        await addToAnExportModal.assertAtPage()
        await common.waitForTimeout(500)
        await addToAnExportModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen export is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "evg export from explorer graph"
        ])
    })

    it('User is able to delete evergreen export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('evg export from explorer graph')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "evg export from explorer graph"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Export Sets (Export Page) - Create and delete evergreen export to agent from Search Page', async function() {
    let loginUtil    
    let projectNavigation
    let exportsPage
    let browserHelper
    let addToAnExportModal
    let deleteExportModal
    let createExportModal
    let searchPage
    let searchResultsPage

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page) 
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)
        searchPage = new SearchPage(browserHelper.browser, browserHelper.page)
        searchResultsPage = new SearchResultsPage(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create evergreen export to agent from Search Page', async function() {
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
        await searchResultsPage.clickActionMenuItem('Export All')

        //open Add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')

        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('evg export from search')
        await createExportModal.typeDesc('evg description from search')
        await createExportModal.openSelectSearch()
        await createExportModal.searchForSavedSearches('master search')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('automation endpoint')
        await createExportModal.clickButton("Create")

        //close Add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.clickButton('Cancel')
    })

    it('Verify that evergreen export is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "evg export from search"
        ])
    })

    it('User is able to delete evergreen export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('evg export from search')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "evg export from search"
        ])
    })
 
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Export Sets (Export page) - Create and delete evergreen export to agent from Explorer Views', async function() {
    let loginUtil    
    let projectNavigation
    let exportsPage
    let browserHelper
    let deleteExportModal
    let explorerPage
    let createExportModal
    let explorerDocumentPage
    let addToAnExportModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page)
        explorerPage = new ExplorerPage(browserHelper.browser, browserHelper.page) 
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)
        explorerDocumentPage = new ExplorerDocumentPage(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject')) 
    })

    it('User is able to create an evergreen export to agent from Explorer Viewes', async function () {
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
        await explorerDocumentPage.clickActionMenuItem('Export All')

        //open Add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')

        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('evg export from explorer views')
        await createExportModal.typeDesc('evg desc from explorer views')
        await createExportModal.openSelectSearch()
        await createExportModal.searchForSavedSearches('master search')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('automation endpoint')
        await createExportModal.clickButton('Create')
        
        //close Add to an export document modal
        await addToAnExportModal.assertAtPage()
        await common.waitForTimeout(500)
        await addToAnExportModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen export is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "evg export from explorer views"
        ])
    })

    it('User is able to delete evergreen export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('evg export from explorer views')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "evg export from explorer views"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

// ========================
// ======= to RRC==========
// ========================

describe('Evergreen Export Sets (Export page) - create and delete evergreen export to RRC from left pane', async function () {
    let loginUtil    
    let projectNavigation
    let exportsPage
    let createExportModal
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let editExportModal
    let deleteExportModal
    let topNavigation
    let rrcLoginPage
    let rrcMatterListingPage
    let rrcMatterLoadsSummaryPage
    let rrcDeleteLoadModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        createExportModal =  new CreateExportModal(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page)
        editExportModal = new EditExportModal(browserHelper.browser, browserHelper.page)
        topNavigation = new TopNavigation(browserHelper.browser, browserHelper.page)
        
        // RRC setup
        rrcLoginPage = new RRCLoginPage(browserHelper.browser, browserHelper.page)
        rrcMatterListingPage = new RRCMatterListingPage(browserHelper.browser, browserHelper.page)
        rrcMatterLoadsSummaryPage = new RRCMatterLoadsSummaryPage(browserHelper.browser, browserHelper.page)
        rrcDeleteLoadModal = new RRCDeleteLoadModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create a folder from Export menu', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.clickCreateButton('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from evg export')
        await createFolderModal.typeDescription('folder description')
        await createFolderModal.clickButton('Create')        
        await common.waitForTimeout(500)
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "Exports",
            "folder from evg export"
        ])
    })

    it('User is able to create an evergreen export from Exports menu', async function() {
        await exportsPage.assertAtPage()        
        await exportsPage.treeView.openItemMenu('Exports')        
        await exportsPage.treeView.selectItemMenuItem('New Export')
        await createExportModal.assertAtPage()
        await createExportModal.typeName('evergreen export')
        await createExportModal.typeDesc('evergreen description')
        await createExportModal.openSelectSearch()
        await createExportModal.searchForSavedSearches('master search')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('RRC automation')
        await createExportModal.clickButton('Create')        
        await common.waitForTimeout(500)
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "Exports",
            "folder from evg export",
            "evergreen export"
        ])
    })

    it('User is able to edit an evergreen export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('evergreen export')
        await exportsPage.treeView.selectItemMenuItem('Edit Export')
        await editExportModal.assertAtPage()
        await common.waitForTimeout(500)
        await editExportModal.typeName('EDITED evg export')
        await editExportModal.typeDescription('it was edited')
        await editExportModal.clickButton('Save')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "EDITED evg export"
        ])
    })

    it('User is able to move evergreen export to the root, to the folder', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.selectItem('EDITED evg export')        
        //to another folder
        await exportsPage.treeView.nestField('EDITED evg export', 'folder from evg export')
        chai.expect(
            await exportsPage.treeView.isItemFoldered('EDITED evg export')
        ).to.be.true

        await exportsPage.treeView.selectItem('EDITED evg export')
        //to the root
        await exportsPage.treeView.nestField('EDITED evg export', 'Exports')
        await common.waitForTimeout(1000)
        chai.expect( 
            await exportsPage.treeView.isItemFoldered('EDITED evg export')
        ).to.be.false
    })

    it('User is able to Start Export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.selectItem('EDITED evg export')
        await exportsPage.clickDocumentDetailsLink()

        // info value before start
        chai.expect(
            await exportsPage.getValueOfStatus('Status:')
        ).to.equal('New')
        await exportsPage.clickDetailsHeaderButton('Start')

        // info value after start
        chai.expect(
            await exportsPage.getValueOfStatus('Status:')
        ).to.equal('In Progress')
    
        await topNavigation.waitForToastMessageToContain('Export load completed')
        await exportsPage.waitForLoadStatus('Finished')
        await common.waitForTimeout(2000)
    })

    it('Go to the RRC page and verify that load was exported', async function() {  
        const exportName = await exportsPage.getExportLoadNames()
        const exportsUrlToReturn = await browserHelper.page.url()
        await rrcLoginPage.navigateToPage()
        await rrcLoginPage.assertAtPage()
        await rrcLoginPage.typeUsername(config.get('rrc.username'))
        await rrcLoginPage.typePassword(config.get('rrc.password'))
        await rrcLoginPage.clickLogin()
        await rrcMatterListingPage.assertAtPage()
        await rrcMatterListingPage.clickMatter(config.get('rrc.existingMatterName'))

        // verify that exported load is on the list
        await rrcMatterLoadsSummaryPage.gotoPage()
        await rrcMatterLoadsSummaryPage.assertAtPage()

        chai.expect(
            await rrcMatterLoadsSummaryPage.getLoadTitles()
        ).to.include.members([exportName])

        // delete exported load
        await rrcMatterLoadsSummaryPage.openLoadActionsMenu(exportName)
        await rrcMatterLoadsSummaryPage.selectLoadsMenuOption('Delete Load')
        await rrcDeleteLoadModal.assertAtPage()
        await rrcDeleteLoadModal.typeLoadName(exportName)
        await rrcDeleteLoadModal.clickButton('Delete')
        // we need extra wait for toasts msgs to go away
        await common.waitForTimeout(8000)
        chai.expect(
            await rrcMatterLoadsSummaryPage.getLoadsEmptyState()
        ).to.equal('There are no loads yet')

        // go back to RG page Exports
        await browserHelper.page.goto(exportsUrlToReturn)
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
    })
        
    it('User is able to Stop Export', async function() {
        await exportsPage.treeView.selectItem('EDITED evg export')
        await exportsPage.clickDocumentDetailsLink()
        // info value before stop
        chai.expect(
            await exportsPage.getValueOfStatus('Status:')
        ).to.equal('In Progress (evergreen)')
        await exportsPage.clickDetailsHeaderButton('Stop')
        await topNavigation.waitForTaskCount('0')
        await topNavigation.waitForToastMessageToContain('Export stopped', 200000)

        // info value after stop
        chai.expect(
            await exportsPage.getValueOfStatus('Status:')
        ).to.equal('Stopped')
        await exportsPage.closeInfoPane()
    })
     
    it('User is able to delete an evergreen export from Export menu', async function() {        
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('folder from evg export')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('EDITED evg export')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "evergreen export",
            "folder from evg export"
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Export Sets (Export Page) - Create evergreen export to RRC from Preservations Set', async function() {
    let loginUtil    
    let projectNavigation
    let exportsPage
    let browserHelper
    let deleteExportModal
    let preservationsPage
    let addToAnExportModal
    let createExportModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page) 
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create Evergreen export to RRC from Preservation sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.selectItem('master preservation')
        await preservationsPage.clickToolbarButton('Actions')
        await preservationsPage.clickActionMenuItem('Export All')

        //open Add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')
        
        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('evg export from preservation')
        await createExportModal.typeDesc('evg description from preservation')
        await createExportModal.openSelectSearch()
        await createExportModal.searchForSavedSearches('master search')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('RRC automation')
        await createExportModal.clickButton("Create") 

        //add to an export modal closes and evergreen export is created
        await addToAnExportModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen export is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "evg export from preservation"
        ])
    })

    it('User is able to delete evergreen export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('evg export from preservation')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "evg export from preservation"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Export Sets (Export Page) - Create evergreen export to RRC from Collections Set', async function() {
    let loginUtil    
    let projectNavigation
    let exportsPage
    let browserHelper
    let deleteExportModal
    let collectionsPage
    let addToAnExportModal
    let createExportModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page) 
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create Evergreen export to RRC from Collection sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.selectItem('master collection')
        await collectionsPage.clickToolbarButton('Actions')
        await collectionsPage.clickActionMenuItem('Export All')

        //open Add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')
        
        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('evg export from collection')
        await createExportModal.typeDesc('evg description from collection')
        await createExportModal.openSelectSearch()
        await createExportModal.searchForSavedSearches('master search')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('RRC automation')
        await createExportModal.clickButton("Create") 

        //add to an export modal closes and evergreen export is created
        await addToAnExportModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen export is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "evg export from collection"
        ])
    })

    it('User is able to delete evergreen export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('evg export from collection')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "evg export from collection"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Export Sets (Export Page) - Create evergreen export to RRC from Folders Set', async function() {
    let loginUtil    
    let projectNavigation
    let exportsPage
    let browserHelper
    let deleteExportModal
    let foldersPage
    let addToAnExportModal
    let createExportModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page) 
        foldersPage = new FoldersPage(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create Evergreen export to RRC from Collection sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('master folder')
        await foldersPage.clickToolbarButton('Actions')
        await foldersPage.clickActionMenuItem('Export All')

        //open Add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')
        
        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('evg export from folders')
        await createExportModal.typeDesc('evg description from folders')
        await createExportModal.openSelectSearch()
        await createExportModal.searchForSavedSearches('master search')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('RRC automation')
        await createExportModal.clickButton("Create") 

        //add to an export modal closes and evergreen export is created
        await addToAnExportModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen export is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "evg export from folders"
        ])
    })

    it('User is able to delete evergreen export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('evg export from folders')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "evg export from folders"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Export Sets (Export Page) - Create evergreen export to RRC from Policies Set', async function() {
    let loginUtil    
    let projectNavigation
    let exportsPage
    let browserHelper
    let deleteExportModal
    let policiesPage
    let addToAnExportModal
    let createExportModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page) 
        policiesPage = new PoliciesPage(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create Evergreen export to RRC from Policy sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Policies')
        await policiesPage.assertAtPage()
        await policiesPage.treeView.selectItem('master policy')
        await policiesPage.clickToolbarButton('Actions')
        await policiesPage.clickActionMenuItem('Export All')

        //open Add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')
        
        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('evg export from policies')
        await createExportModal.typeDesc('evg description from policies')
        await createExportModal.openSelectSearch()
        await createExportModal.searchForSavedSearches('master search')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('RRC automation')
        await createExportModal.clickButton("Create") 

        //add to an export modal closes and evergreen export is created
        await addToAnExportModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen export is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "evg export from policies"
        ])
    })

    it('User is able to delete evergreen export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('evg export from policies')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "evg export from policies"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Export Sets (Export Page) - Create evergreen export to RRC from Exports Set', async function() {
    let loginUtil    
    let projectNavigation
    let exportsPage
    let browserHelper
    let deleteExportModal
    let addToAnExportModal
    let createExportModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page) 
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create Evergreen export to RRC from Export sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.selectItem('master export')
        await exportsPage.clickToolbarButton('Actions')
        await exportsPage.clickActionMenuItem('Export All')

        //open Add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')
        
        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('evg export from exports')
        await createExportModal.typeDesc('evg description from exports')
        await createExportModal.openSelectSearch()
        await createExportModal.searchForSavedSearches('master search')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('RRC automation')
        await createExportModal.clickButton("Create") 

        //add to an export modal closes and evergreen export is created
        await addToAnExportModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen export is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "evg export from exports"
        ])
    })

    it('User is able to delete evergreen export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('evg export from exports')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "evg export from exports"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Export Sets (Export Page) - Create and delete evergreen export to RRC from Explorer Graph', async function() {
    let loginUtil    
    let projectNavigation
    let exportsPage
    let browserHelper
    let deleteExportModal
    let explorerPage
    let createExportModal
    let addToAnExportModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page)
        explorerPage = new ExplorerPage(browserHelper.browser, browserHelper.page) 
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject')) 
    })

    it('User is able to create an evergreen export to RRC from Explorer Graph', async function () {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Explorer')
        await explorerPage.assertAtPage()
        await explorerPage.openDataSet()
        await explorerPage.expandDataSetProjectOptionMenu('Folders')
        await explorerPage.selectNthDataProjectOptionMenuItem(0)
        await explorerPage.openActionMenu()
        await explorerPage.clickGraphBar('Text')
        await explorerPage.clickActionMenuItem('Export')

        //open add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')

        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('evg export from explorer graph')
        await createExportModal.typeDesc('evg export from explorer graph')
        await createExportModal.openSelectSearch()
        await createExportModal.searchForSavedSearches('master search')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('RRC automation')
        await createExportModal.clickButton('Create')
        
        //close export document modal
        await addToAnExportModal.assertAtPage()
        await common.waitForTimeout(500)
        await addToAnExportModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen export is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "evg export from explorer graph"
        ])
    })

    it('User is able to delete evergreen export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('evg export from explorer graph')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "evg export from explorer graph"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Export Sets (Export Page) - Create and delete evergreen export to RRC from Search Page', async function() {
    let loginUtil    
    let projectNavigation
    let exportsPage
    let browserHelper
    let addToAnExportModal
    let deleteExportModal
    let createExportModal
    let searchPage
    let searchResultsPage

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page) 
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)
        searchPage = new SearchPage(browserHelper.browser, browserHelper.page)
        searchResultsPage = new SearchResultsPage(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create evergreen export to RRC from Search Page', async function() {
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
        await searchResultsPage.clickActionMenuItem('Export All')

        //open Add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')

        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('evg export from search')
        await createExportModal.typeDesc('evg description from search')
        await createExportModal.openSelectSearch()
        await createExportModal.searchForSavedSearches('master search')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('RRC automation')
        await createExportModal.clickButton("Create")

        //close Add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.clickButton('Cancel')
    })

    it('Verify that evergreen export is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "evg export from search"
        ])
    })

    it('User is able to delete evergreen export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('evg export from search')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "evg export from search"
        ])
    })
 
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Export Sets (Export page) - Create and delete evergreen export to RRC from Explorer Views', async function() {
    let loginUtil    
    let projectNavigation
    let exportsPage
    let browserHelper
    let deleteExportModal
    let explorerPage
    let createExportModal
    let explorerDocumentPage
    let addToAnExportModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page)
        explorerPage = new ExplorerPage(browserHelper.browser, browserHelper.page) 
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)
        explorerDocumentPage = new ExplorerDocumentPage(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject')) 
    })

    it('User is able to create an evergreen export to RRC from Explorer Viewes', async function () {
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
        await explorerDocumentPage.clickActionMenuItem('Export All')

        //open Add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')

        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('evg export from explorer views')
        await createExportModal.typeDesc('evg desc from explorer views')
        await createExportModal.openSelectSearch()
        await createExportModal.searchForSavedSearches('master search')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('RRC automation')
        await createExportModal.clickButton('Create')
        
        //close Add to an export document modal
        await addToAnExportModal.assertAtPage()
        await common.waitForTimeout(500)
        await addToAnExportModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen export is created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "evg export from explorer views"
        ])
    })

    it('User is able to delete evergreen export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('evg export from explorer views')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "evg export from explorer views"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Export Sets - Add documents to Evergreen Export after "Refresh Evergreen"', async function() {
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
    let exportsPage
    let createExportModal
    let deleteExportModal

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
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page)

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
        await createFolderModal.typeName('test folder exp')
        await createFolderModal.typeDescription('test description')
        await createFolderModal.clickButton('Create')

         //add documents to folder
         await addToAFolderModal.treeView.selectItem('test folder exp')
         await addToAFolderModal.clickButton('Folder')

         //verify that folder is created
         await projectNavigation.assertAtPage()
         await projectNavigation.openDocumentSetsMenu()
         await projectNavigation.clickMenuItem('Folders')
         await foldersPage.assertAtPage()
         chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "test folder exp"
        ])
    })

    it('Search for RG Sets -> Folder -> our new created folder and Save Search Criteria', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideSearchPredicateByName('Folder')
        await addFolderModal.assertAtPage()
        await addFolderModal.treeView.addSelectedFolder('test folder exp')
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

    it('Create a new evergreen export with Saved Search and check quantity of documents inside', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.clickCreateButton('New Export')
        await createExportModal.assertAtPage()
        await createExportModal.typeName('test evergreen export')
        await createExportModal.typeDesc('test evergreen description')
        await createExportModal.openSelectSearch()
        await createExportModal.searchForSavedSearches('test')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('automation endpoint')
        await createExportModal.clickButton('Create')        
        await common.waitForTimeout(500)
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "Exports",
            "test evergreen export"
        ])

        // check quantiti of documents inside of evergreen export
        await exportsPage.treeView.selectItem('test evergreen export')
        await common.waitForTimeout(1000)
        chai.expect(
            await exportsPage.documentList.getDocumentsCount()
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
        await addToAFolderModal.treeView.selectItem('test folder exp')
        await addToAFolderModal.clickButton('Folder')
        await common.waitForTimeout(1000)

        //check quantity of document inside of folder
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('test folder exp')
        await common.waitForTimeout(1000)
        chai.expect(
            await foldersPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n5')
    })

    it('Run "Refresh Evergreen" and check quantity of documents inside evergreen export', async function() {

        //check quantity of document inside of evergreen export before "Refresh Evergreen"
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.selectItem('test evergreen export')
        await common.waitForTimeout(1000)
        chai.expect(
            await exportsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n3')

        // run "Refresh Evergreen"
        await exportsPage.clickRefreshToolbarButton()
        await exportsPage.clickRefreshMenuItem('Refresh Evergreen')
        //wait for toast, then wait a bit more
        await topNavigation.waitForToastMessageToContain('Evergreen refresh has finished')
        await common.waitForTimeout(1000)

        //check quantity of document inside of evergreen export after "Refresh Evergreen"
        await exportsPage.assertAtPage()
        await exportsPage.treeView.selectItem('test evergreen export')
        await common.waitForTimeout(1000)
        chai.expect(
            await exportsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n5')
    })

    it('Delete created export, folder and saved search', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('test evergreen export')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "test evergreen export"
        ])
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('test folder exp')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "test folder exp"
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

describe('Evergreen Export Sets (Export Page) - Add documents to Evergreen Export after "Switch Schema"', async function() {
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
    let exportsPage
    let createExportModal
    let deleteExportModal
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
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page)
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
        await createFolderModal.typeName('test folder exp')
        await createFolderModal.typeDescription('test description')
        await createFolderModal.clickButton('Create')

         //add documents to folder
         await addToAFolderModal.treeView.selectItem('test folder exp')
         await addToAFolderModal.clickButton('Folder')

         //verify that folder is created
         await projectNavigation.assertAtPage()
         await projectNavigation.openDocumentSetsMenu()
         await projectNavigation.clickMenuItem('Folders')
         await foldersPage.assertAtPage()
         chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "test folder exp"
        ])
    })

    it('Search for RG Sets -> Folder -> our new created folder and Save Search Criteria', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideSearchPredicateByName('Folder')
        await addFolderModal.assertAtPage()
        await addFolderModal.treeView.addSelectedFolder('test folder exp')
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

    it('Create a new evergreen export with Saved Search and check quantity of documents inside', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.clickCreateButton('New Export')
        await createExportModal.assertAtPage()
        await createExportModal.typeName('test evergreen export')
        await createExportModal.typeDesc('test evergreen description')
        await createExportModal.openSelectSearch()
        await createExportModal.searchForSavedSearches('test')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('automation endpoint')
        await createExportModal.clickButton('Create')        
        await common.waitForTimeout(500)
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "Exports",
            "test evergreen export"
        ])

        // check quantiti of documents inside of evergreen export
        await exportsPage.treeView.selectItem('test evergreen export')
        await common.waitForTimeout(1000)
        chai.expect(
            await exportsPage.documentList.getDocumentsCount()
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
        await addToAFolderModal.treeView.selectItem('test folder exp')
        await addToAFolderModal.clickButton('Folder')
        await common.waitForTimeout(1000)

        //check quantity of document inside of folder
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('test folder exp')
        await common.waitForTimeout(1000)
        chai.expect(
            await foldersPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n5')
    })

    it('Run "Switch Schema and Sincronization" and check quantity of documents inside evergreen export', async function() {

        //check quantity of document inside of evergreen export before run "Switch Schema and Sincronization"
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.selectItem('test evergreen export')
        await common.waitForTimeout(1000)
        chai.expect(
            await exportsPage.documentList.getDocumentsCount()
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

        //check quantity of document inside of evergreen export after "Switch Schema and Sincronization"
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.selectItem('test evergreen export')
        await common.waitForTimeout(1000)
        chai.expect(
            await exportsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n5')
    })

    it('Delete created export, folder and saved search', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('test evergreen export')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "test evergreen export"
        ])
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('test folder exp')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "test folder exp"
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

describe('Evergreen Export Sets (Export Page) - Leave documents in evergreen Export after releasing them from the search', async function() {
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
    let exportsPage
    let createExportModal
    let deleteExportModal
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
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page)
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
        await createFolderModal.typeName('test folder exp')
        await createFolderModal.typeDescription('test description')
        await createFolderModal.clickButton('Create')

         //add documents to folder
         await addToAFolderModal.treeView.selectItem('test folder exp')
         await addToAFolderModal.clickButton('Folder')

         //verify that folder is created
         await projectNavigation.assertAtPage()
         await projectNavigation.openDocumentSetsMenu()
         await projectNavigation.clickMenuItem('Folders')
         await foldersPage.assertAtPage()
         chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "test folder exp"
        ])
    })

    it('Search for RG Sets -> Folder -> our new created folder and Save Search Criteria', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideSearchPredicateByName('Folder')
        await addFolderModal.assertAtPage()
        await addFolderModal.treeView.addSelectedFolder('test folder exp')
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

    it('Create a new evergreen export with Saved Search and check quantity of documents inside', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.clickCreateButton('New Export')
        await createExportModal.assertAtPage()
        await createExportModal.typeName('test evergreen export')
        await createExportModal.typeDesc('test evergreen description')
        await createExportModal.openSelectSearch()
        await createExportModal.searchForSavedSearches('test')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('automation endpoint')
        await createExportModal.clickButton('Create')        
        await common.waitForTimeout(500)
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "Exports",
            "test evergreen export"
        ])

        // check quantiti of documents inside of evergreen export
        await exportsPage.treeView.selectItem('test evergreen export')
        await common.waitForTimeout(1000)
        chai.expect(
            await exportsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n3')
    })

    it('Remove 1 document from folder of Saved Searches', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('test folder exp')
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

    it('Run "Refresh Evergreen" and check if documents was released from evergreen Export', async function() {

        //check quantity of document inside of evergreen export before "Refresh Evergreen"
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.selectItem('test evergreen export')
        await common.waitForTimeout(1000)
        chai.expect(
            await exportsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n3')

        // run "Refresh Evergreen"
        await exportsPage.clickRefreshToolbarButton()
        await exportsPage.clickRefreshMenuItem('Refresh Evergreen')
        //wait for toast, then wait a bit more
        await topNavigation.waitForToastMessageToContain('Evergreen refresh has finished')
        await common.waitForTimeout(1000)

        //check quantity of document inside of evergreen export after "Refresh Evergreen"
        await exportsPage.assertAtPage()
        await exportsPage.treeView.selectItem('test evergreen export')
        await common.waitForTimeout(2000)
        chai.expect(
            await exportsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n3')
    })

    it('Delete created export, folder and saved search', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('test evergreen export')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "test evergreen export"
        ])
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('test folder exp')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "test folder exp"
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

    