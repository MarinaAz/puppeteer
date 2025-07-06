const LoginUtil = require("../util/LoginUtil")
const TopNavigation = require("../pages/components/TopNavigation")
const ProjectNavigation = require("../pages/components/ProjectNavigation")
const CollectionsPage = require("../pages/CollectionsPage")
const BrowserHelper = require("../util/BrowserHelper")
const chai = require('chai')
const config = require('config')
const common = require("../common")
const SearchPage = require("../pages/SearchPage")
const SearchResultsPage = require("../pages/SearchResultsPage")
const CreateFolderModal = require("../pages/modals/CreateFolderModal")
const EditFolderModal = require("../pages/modals/EditFolderModal")
const DeleteFolderModal = require("../pages/modals/DeleteFolderModal")
const PreservationsPage = require("../pages/PreservationsPage")
const FoldersPage = require("../pages/FoldersPage")
const PoliciesPage = require("../pages/PoliciesPage")
const ExportsPage = require("../pages/ExportsPage")
const ExplorerPage = require("../pages/ExplorerPage")
const ExplorerDocumentPage = require("../pages/ExplorerDocumentPage")
const CreateExportModal = require("../pages/modals/CreateExportModal")
const EditExportModal = require("../pages/modals/EditExportModal")
const DeleteExportModal = require("../pages/modals/DeleteExportModal")
const AddToAnExportModal = require("../pages/modals/AddToAnExportModal")
const RRCLoginPage = require("../pages/rrc/RRCLoginPage")
const RRCMatterListingPage = require("../pages/rrc/RRCMatterListinPage")
const RRCMatterLoadsSummaryPage = require("../pages/rrc/RRCMatterLoadsSummaryPage")
const RRCDeleteLoadModal = require("../pages/rrc/RRCDeleteLoadModal")


// ==========================
// =======to agent ==========
// ==========================

describe('Export Sets - create, edit, move and delete folder, subfolder and export to agent from left pane', async function () {
    let loginUtil    
    let projectNavigation
    let exportsPage
    let createExportModal
    let editExportModal
    let deleteExportModal
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let editFolderModal
    let topNavigation
    let searchPage
    let searchResultsPage
    let addToAnExportModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)
        editExportModal = new EditExportModal(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        editFolderModal = new EditFolderModal(browserHelper.browser, browserHelper.page)
        topNavigation =  new TopNavigation(browserHelper.browser, browserHelper.page)
        searchPage = new SearchPage(browserHelper.browser, browserHelper.page)
        searchResultsPage = new SearchResultsPage(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create a folder from Exports menu', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.clickCreateButton('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('new folder')
        await createFolderModal.typeDescription('new description')
        await createFolderModal.clickButton('Create')        
        await common.waitForTimeout(500)
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "Exports",
            "new folder"
        ])
    })

    it('User is able to create a subfolder from Export menu', async function() {
        await exportsPage.assertAtPage()        
        await exportsPage.treeView.openItemMenu('new folder')        
        await exportsPage.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('new subfolder')
        await createFolderModal.typeDescription('new subdescription')
        await createFolderModal.clickButton('Create')       
        await common.waitForTimeout(500)
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "Exports",
            "new folder",
            "new subfolder",
        ])
    })

    it('User is able to create an export from Export menu', async function() {
        await exportsPage.assertAtPage()        
        await exportsPage.treeView.openItemMenu('Exports')
        await exportsPage.treeView.selectItemMenuItem('New Export')
        await createExportModal.assertAtPage()
        await createExportModal.typeName('new export')
        await createExportModal.typeDesc('export desc')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('automation endpoint')
        await createExportModal.clickButton('Create')        
        await common.waitForTimeout(500)        
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "Exports",
            "new folder",
            "new subfolder",
            "new export"
        ])
    })

    it('User is able to add documents to export', async function() {
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
        await searchResultsPage.clickToolbarButton("Actions")
        await searchResultsPage.clickActionMenuItem('Export Selected')

        //open Add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.selectItem('new export')
        await addToAnExportModal.clickButton('Export')
    })

    it('User is able to edit a folder', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.expandItem('new folder')
        await exportsPage.treeView.openItemMenu('new subfolder')
        await exportsPage.treeView.selectItemMenuItem('Edit Folder')
        await editFolderModal.assertAtPage()
        await editFolderModal.typeName('EDITED folder')
        await editFolderModal.typeDescription('it was edited')
        await editFolderModal.clickButton('Save')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "EDITED folder"
        ])
    })

    it('User is able to move folder to the root, to other folders and subfolders', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.selectItem('EDITED folder')
        //to the root
        await exportsPage.treeView.nestField('EDITED folder', 'Exports')        
        chai.expect(
            await exportsPage.treeView.isItemFoldered('EDITED folder')
        ).to.be.false

        await exportsPage.treeView.selectItem('EDITED folder')
        await exportsPage.treeView.nestField('EDITED folder', 'new folder') 
        //to other folder
        chai.expect(
            await exportsPage.treeView.isItemFoldered('EDITED folder')
        ).to.be.true
    })

    it('User is able to edit export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('new export')
        await exportsPage.treeView.selectItemMenuItem('Edit Export')
        await editExportModal.assertAtPage()
        await common.waitForTimeout(1000)
        await editExportModal.typeName('EDITED export')
        await editExportModal.typeDescription('it was edited')
        await editExportModal.clickButton('Save')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "EDITED export"
        ])
    })

    it('User is able to move export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.selectItem('EDITED export')
        //to other folder
        await exportsPage.treeView.nestField('EDITED export', 'new folder')
        chai.expect(
            await exportsPage.treeView.isItemFoldered('EDITED export')
        ).to.be.true

        await exportsPage.treeView.selectItem('EDITED export')
        //to the root
        await exportsPage.treeView.nestField('EDITED export', 'Exports')
        chai.expect(
            await exportsPage.treeView.isItemFoldered('EDITED export')
        ).to.be.false
    })

    it('User is able to Refresh Collection Info Start and Stop Export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.selectItem('EDITED export')
        await exportsPage.clickDocumentDetailsLink()
        
        // info value before start
        chai.expect(
            await exportsPage.getValueOfStatus('Status:')
        ).to.equal('New')
        await exportsPage.clickDetailsHeaderButton('Start')
        await common.waitForTimeout(500)

        // info value after start
        chai.expect(
            await exportsPage.getValueOfStatus('Status:')
        ).to.equal('In Progress')
        
        // info value before stop
        chai.expect(
            await exportsPage.getValueOfStatus('Status:')
        ).to.equal('In Progress')
        await exportsPage.clickDetailsHeaderButton('Stop')
        await topNavigation.waitForToastMessageToContain('Export stopped')

        // info value after stop
        chai.expect(
            await exportsPage.getValueOfStatus('Status:')
        ).to.equal('Stopped')
        await exportsPage.closeInfoPane()
    })
     
    it('User is able to delete folders and exports from Exports menu', async function() {        
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('EDITED folder')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('new folder')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('EDITED export')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "new folder",
            "EDITED folder",
            "EDITED export"
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Export Sets - Create folders, subfolders and export to agent and add documents from Preservations Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let preservationsPage
    let exportsPage
    let addToAnExportModal
    let createExportModal
    let deleteExportModal
    
    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()
    
        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page)
    
        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })
    
    it('User is able to create folders, subfolders and export to agent and add documents from Preservation sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.selectItem('master preservation')
        await preservationsPage.clickToolbarButton('Actions')
        await preservationsPage.clickActionMenuItem('Export All')
    
        // open add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')
            
        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('export from preservation')
        await createExportModal.typeDesc('exp desc from preservation')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('automation endpoint')
        await createExportModal.clickButton('Create') 
            
        //create folder
        await addToAnExportModal.treeView.openItemMenu('export from preservation')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from preservation')
        await createFolderModal.typeDescription('desc from preservation')
        await createFolderModal.clickButton('Create')
    
        //create subfolder
        await addToAnExportModal.treeView.openItemMenu('folder from preservation')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from preservation')
        await createFolderModal.typeDescription('sub desc from preservation')
        await createFolderModal.clickButton('Create')
    
        //add to an export modal closes and documents adds to the export
        await addToAnExportModal.treeView.selectItem('export from preservation')
        await addToAnExportModal.clickButton('Export')
    })
        
    it('Verify that folders and export are created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.expandItem('folder from preservation')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "export from preservation",
            "folder from preservation",
            "sub from preservation"
        ])
        await exportsPage.treeView.selectItem('export from preservation')
        chai.expect(
            await exportsPage.documentList.getDocumentNames()
        ).to.have.members(['marina test.txt'])
    })
    
    it('User is able to delete folders and export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('sub from preservation')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('folder from preservation')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('export from preservation')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "export from preservation",
            "folder from preservation",
            "sub from preservation"
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Export Sets - Create folders, subfolders and export to agent and add documents from Collections Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let collectionsPage
    let exportsPage
    let addToAnExportModal
    let createExportModal
    let deleteExportModal
    
    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()
    
        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page)
    
        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })
    
    it('User is able to create folders, subfolders and export to agent and add documents from Collections sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.selectItem('master collection')
        await collectionsPage.clickToolbarButton('Actions')
        await collectionsPage.clickActionMenuItem('Export All')
    
        //open add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')
            
        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('export from collection')
        await createExportModal.typeDesc('exp desc from collection')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('automation endpoint')
        await createExportModal.clickButton('Create') 
            
        //create folder
        await addToAnExportModal.treeView.openItemMenu('export from collection')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from collection')
        await createFolderModal.typeDescription('desc from collection')
        await createFolderModal.clickButton('Create')
    
        //create subfolder
        await addToAnExportModal.treeView.openItemMenu('folder from collection')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from collection')
        await createFolderModal.typeDescription('sub desc from collection')
        await createFolderModal.clickButton('Create')
    
        //add to an export modal closes and documents adds to the export
        await addToAnExportModal.treeView.selectItem('export from collection')
        await addToAnExportModal.clickButton('Export')
    })
        
    it('Verify that folders and export are created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.expandItem('folder from collection')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "export from collection",
            "folder from collection",
            "sub from collection"
        ])
        await exportsPage.treeView.selectItem('export from collection')
        chai.expect(
            await exportsPage.documentList.getDocumentNames()
        ).to.have.members(['marina test.txt'])
    })
    
    it('User is able to delete folders and export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('sub from collection')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('folder from collection')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('export from collection')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "export from collection",
            "folder from collection",
            "sub from collection"
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Export Sets - Create folders, subfolders and export to agent and add documents from Folders Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let foldersPage
    let exportsPage
    let addToAnExportModal
    let createExportModal
    let deleteExportModal
    
    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()
    
        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        foldersPage = new FoldersPage(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page)
    
        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })
    
    it('User is able to create folders, subfolders and export to agent and add documents from Folders sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('master folder')
        await foldersPage.clickToolbarButton('Actions')
        await foldersPage.clickActionMenuItem('Export All')
    
        //open add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')
            
        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('export from folder')
        await createExportModal.typeDesc('exp desc from folder')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('automation endpoint')
        await createExportModal.clickButton('Create') 
            
        //create folder
        await addToAnExportModal.treeView.openItemMenu('export from folder')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from folder')
        await createFolderModal.typeDescription('desc from folder')
        await createFolderModal.clickButton('Create')
    
        //create subfolder
        await addToAnExportModal.treeView.openItemMenu('folder from folder')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from folder')
        await createFolderModal.typeDescription('sub desc from folder')
        await createFolderModal.clickButton('Create')
    
        //add to an export modal closes and documents adds to the export
        await addToAnExportModal.treeView.selectItem('export from folder')
        await addToAnExportModal.clickButton('Export')
    })
        
    it('Verify that folders and export are created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.expandItem('folder from folder')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "export from folder",
            "folder from folder",
            "sub from folder"
        ])
        await exportsPage.treeView.selectItem('export from folder')
        chai.expect(
            await exportsPage.documentList.getDocumentNames()
        ).to.have.members(['marina test.txt'])
    })
    
    it('User is able to delete folders and export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('sub from folder')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('folder from folder')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('export from folder')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "export from folder",
            "folder from folder",
            "sub from folder"
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Export Sets - Create folders, subfolders and export to agent and add documents from Policies Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let policiesPage
    let exportsPage
    let addToAnExportModal
    let createExportModal
    let deleteExportModal
    
    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()
    
        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        policiesPage = new PoliciesPage(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page)
    
        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })
    
    it('User is able to create folders, subfolders and export to agent and add documents from Policies sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Policies')
        await policiesPage.assertAtPage()
        await policiesPage.treeView.selectItem('master policy')
        await policiesPage.clickToolbarButton('Actions')
        await policiesPage.clickActionMenuItem('Export All')
    
        //open add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')
            
        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('export from policy')
        await createExportModal.typeDesc('exp desc from policy')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('automation endpoint')
        await createExportModal.clickButton('Create') 
            
        //create folder
        await addToAnExportModal.treeView.openItemMenu('export from policy')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from policy')
        await createFolderModal.typeDescription('desc from policy')
        await createFolderModal.clickButton('Create')
    
        //create subfolder
        await addToAnExportModal.treeView.openItemMenu('folder from policy')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from policy')
        await createFolderModal.typeDescription('sub desc from policy')
        await createFolderModal.clickButton('Create')
    
        //add to an export modal closes and documents adds to the export
        await addToAnExportModal.treeView.selectItem('export from policy')
        await addToAnExportModal.clickButton('Export')
    })
        
    it('Verify that folders and export are created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.expandItem('folder from policy')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "export from policy",
            "folder from policy",
            "sub from policy"
        ])
        await exportsPage.treeView.selectItem('export from policy')
        chai.expect(
            await exportsPage.documentList.getDocumentNames()
        ).to.have.members(['marina test.txt'])
    })
    
    it('User is able to delete folders and export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('sub from policy')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('folder from policy')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('export from policy')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "export from policy",
            "folder from policy",
            "sub from policy"
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Export Sets - Create folders, subfolders and export to agent and add documents from Exports Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let exportsPage
    let addToAnExportModal
    let createExportModal
    let deleteExportModal
    
    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()
    
        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page)
    
        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })
    
    it('User is able to create folders, subfolders and export to agent and add documents from Exports sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.selectItem('master export')
        await exportsPage.clickToolbarButton('Actions')
        await exportsPage.clickActionMenuItem('Export All')
    
        //open add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')
            
        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('export from export')
        await createExportModal.typeDesc('exp desc from export')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('automation endpoint')
        await createExportModal.clickButton('Create') 
            
        //create folder
        await addToAnExportModal.treeView.openItemMenu('export from export')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from export')
        await createFolderModal.typeDescription('desc from export')
        await createFolderModal.clickButton('Create')
    
        //create subfolder
        await addToAnExportModal.treeView.openItemMenu('folder from export')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from export')
        await createFolderModal.typeDescription('sub desc from export')
        await createFolderModal.clickButton('Create')
    
        //add to an export modal closes and documents adds to the export
        await addToAnExportModal.treeView.selectItem('export from export')
        await addToAnExportModal.clickButton('Export')
    })
        
    it('Verify that folders and export are created, documents added', async function() {
        await exportsPage.assertAtPage()
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "export from export",
            "folder from export",
            "sub from export"
        ])
        await exportsPage.treeView.selectItem('export from export')
        chai.expect(
            await exportsPage.documentList.getDocumentNames()
        ).to.have.members(['marina test.txt'])
    })
    
    it('User is able to delete folders and export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('sub from export')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('folder from export')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('export from export')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "export from export",
            "folder from export",
            "sub from export"
        ])
    })
    
    after(async function() {        
    await browserHelper.destroy()
    })
})

describe('Export Sets - Create and delete folders, subfolders and export, add documets to export to agent from Explorer Graph', async function() {
    let loginUtil    
    let projectNavigation
    let exportsPage
    let browserHelper
    let deleteFolderModal
    let explorerPage
    let addToAnExportModal
    let createFolderModal
    let deleteExportModal
    let createExportModal
    
    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()
    
        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        explorerPage = new ExplorerPage(browserHelper.browser, browserHelper.page) 
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)
    
        await loginUtil.loginAsRGLocalUser(config.get('rgProject')) 
    })
    
    it('User is able to create a folder, subfolder and collection and add documents from Explorer Graph', async function () {
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
        await explorerPage.clickActionMenuItem('Export')
    
        //open Add To An Export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')
    
        //open create new export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('export from explorer graph')
        await createExportModal.typeDesc('desc from explorer graph')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('automation endpoint')
        await createExportModal.clickButton('Create')
    
        //create folder
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from explorer graph')
        await createFolderModal.typeDescription('desc from explorer graph')
        await createFolderModal.clickButton('Create')
            
        //create subfolder
        await addToAnExportModal.treeView.openItemMenu('folder from explorer graph')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from explorer graph')
        await createFolderModal.typeDescription('sub desc from explorer graph')
        await createFolderModal.clickButton('Create')
            
        //add document to export
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.selectItem('export from explorer graph')
        await common.waitForTimeout(500)
        await addToAnExportModal.clickButton('Export')
    })
        
    it('Verify that folders and export are created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.expandItem('folder from explorer graph')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "export from explorer graph",
            "folder from explorer graph",
            "sub from explorer graph"
        ])
        await exportsPage.treeView.selectItem('export from explorer graph')
        chai.expect(
            await exportsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n1')
    })
    
    it('User is able to delete folders and export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('sub from explorer graph')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('folder from explorer graph')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('export from explorer graph')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "export from explorer graph",
            "folder from explorer graph",
            "sub from explorer graph"
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Export Sets - Create and delete folders, subfolders and export, add documets to export to agent from Search Page', async function() {
    let loginUtil    
    let projectNavigation
    let exportsPage
    let browserHelper
    let addToAnExportModal
    let deleteExportModal
    let deleteFolderModal
    let createExportModal
    let createFolderModal
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
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        searchPage = new SearchPage(browserHelper.browser, browserHelper.page)
        searchResultsPage = new SearchResultsPage(browserHelper.browser, browserHelper.page)
    
        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })
    
    it('User is able to create a folder, subfolder and export and add documents to export to agent from Search Page', async function() {
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
        await searchResultsPage.clickToolbarButton("Actions")
        await searchResultsPage.clickActionMenuItem('Export Selected')
    
        //open Add To An Export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')
    
        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('export from search')
        await createExportModal.typeDesc('description from search')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('automation endpoint')
        await createExportModal.clickButton('Create') 
             
        //create folder
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from search')
        await createFolderModal.typeDescription('desc from search')
        await createFolderModal.clickButton('Create')
       
        //create subfolder
        await addToAnExportModal.treeView.openItemMenu('folder from search')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from search')
        await createFolderModal.typeDescription('sub desc from search')
        await createFolderModal.clickButton('Create')
    
        //add documents to export
        await addToAnExportModal.treeView.selectItem('export from search')
        await addToAnExportModal.clickButton('Export')
    })
    
    it('Verify that folders created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.expandItem('folder from search')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "export from search",
            "folder from search",
            "sub from search"
        ])
        await exportsPage.treeView.selectItem('export from search')
        chai.expect(
            await exportsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n1')
    })
    
    it('User is able to delete folders and export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('sub from search')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('folder from search')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('export from search')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "export from search",
            "folder from search",
            "sub from search"
        ])
    })
     
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Export Sets - Create and delete folders, subfolders and export, add documets to export to agent from Explorer Views', async function() {
    let loginUtil    
    let projectNavigation
    let exportsPage
    let browserHelper
    let deleteFolderModal
    let explorerPage
    let explorerDocumentPage
    let addToAnExportModal
    let createFolderModal
    let deleteExportModal
    let createExportModal
    let topNavigation
    
    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()
    
        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        explorerPage = new ExplorerPage(browserHelper.browser, browserHelper.page) 
        explorerDocumentPage = new ExplorerDocumentPage(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)
        topNavigation = new TopNavigation(browserHelper.browser, browserHelper.page)
    
        await loginUtil.loginAsRGLocalUser(config.get('rgProject')) 
    })
    
    it('User is able to create a folder, subfolder and collection and add documents from Explorer Views', async function () {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Explorer')
        await explorerPage.assertAtPage()
        await explorerPage.openActionMenu()
        await explorerPage.clickActionMenuItem('Export')
    
        //open Add To An Export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')
    
        //open create new export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('export from explorer view')
        await createExportModal.typeDesc('desc from explorer view')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('automation endpoint')
        await createExportModal.clickButton('Create')
    
        //create folder
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from explorer view')
        await createFolderModal.typeDescription('desc from explorer view')
        await createFolderModal.clickButton('Create')
            
        //create subfolder
        await addToAnExportModal.treeView.openItemMenu('folder from explorer view')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from explorer view')
        await createFolderModal.typeDescription('sub desc from explorer view')
        await createFolderModal.clickButton('Create')
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.clickButton('Cancel')
            
        //add document to export
        await explorerPage.assertAtPage()
        await explorerPage.openActionMenu()
        await explorerPage.clickActionMenuItem('View Document Set')
        await explorerPage.waitForTaskCountToBeZero('0')
        await explorerDocumentPage.assertAtPage()
        await explorerDocumentPage.documentList.clickNthDocumentCheckbox(0)
        await explorerDocumentPage.clickToolbarButton('Actions')
        await explorerDocumentPage.clickActionMenuItem('Export Selected')
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')

        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('export from view')
        await createExportModal.typeDesc('description from view')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('automation endpoint')
        await createExportModal.clickButton('Create') 

        //create folder
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from view')
        await createFolderModal.typeDescription('desc from view')
        await createFolderModal.clickButton('Create')
    
        //create subfolder
        await addToAnExportModal.treeView.openItemMenu('folder from view')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from view')
        await createFolderModal.typeDescription('sub desc from view')
        await createFolderModal.clickButton('Create')
 
        //add documents to export
        await addToAnExportModal.treeView.selectItem('export from view')
        await addToAnExportModal.clickButton('Export') 
    })
        
    it('Verify that folders and export are created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.expandItem('folder from explorer view')
        await exportsPage.treeView.expandItem('folder from view')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "export from explorer view",
            "folder from explorer view",
            "sub from explorer view",
            "export from view",
            "folder from view",
            'sub from view'
        ])
        await exportsPage.treeView.selectItem('export from view')
        chai.expect(
            await exportsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n1')
    })
    it('User is able to delete folders and export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('sub from explorer view')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('folder from explorer view')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('export from explorer view')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('sub from view')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('folder from view')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('export from view')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        await topNavigation.waitForToastMessageToContain('Document Set has been deleted')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "export from explorer view",
            "folder from explorer view",
            "sub from explorer view",
            "sub from view",
            "folder from view",
            "export from view"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

// ========================
// ======= to RRC==========
// ========================

describe('Export Sets - create, edit, move and delete folder, subfolder and export to RRC from left pane', async function () {
    let loginUtil    
    let projectNavigation
    let exportsPage
    let createExportModal
    let editExportModal
    let deleteExportModal
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let editFolderModal
    let topNavigation
    let searchPage
    let searchResultsPage
    let addToAnExportModal
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
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)
        editExportModal = new EditExportModal(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        editFolderModal = new EditFolderModal(browserHelper.browser, browserHelper.page)
        topNavigation =  new TopNavigation(browserHelper.browser, browserHelper.page)
        searchPage = new SearchPage(browserHelper.browser, browserHelper.page)
        searchResultsPage = new SearchResultsPage(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))

        // RRC setup
        rrcLoginPage = new RRCLoginPage(browserHelper.browser, browserHelper.page)
        rrcMatterListingPage = new RRCMatterListingPage(browserHelper.browser, browserHelper.page)
        rrcMatterLoadsSummaryPage = new RRCMatterLoadsSummaryPage(browserHelper.browser, browserHelper.page)
        rrcDeleteLoadModal = new RRCDeleteLoadModal(browserHelper.browser, browserHelper.page)
    })

    it('User is able to create a folder from Exports menu', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.clickCreateButton('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('new folder')
        await createFolderModal.typeDescription('new description')
        await createFolderModal.clickButton('Create')        
        await common.waitForTimeout(500)
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "Exports",
            "new folder"
        ])
    })

    it('User is able to create a subfolder from Export menu', async function() {
        await exportsPage.assertAtPage()        
        await exportsPage.treeView.openItemMenu('new folder')        
        await exportsPage.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('new subfolder')
        await createFolderModal.typeDescription('new subdescription')
        await createFolderModal.clickButton('Create')       
        await common.waitForTimeout(500)
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "Exports",
            "new folder",
            "new subfolder",
        ])
    })

    it('User is able to create an export to RRC from Export menu', async function() {
        await exportsPage.assertAtPage()        
        await exportsPage.treeView.openItemMenu('Exports')
        await exportsPage.treeView.selectItemMenuItem('New Export')
        await createExportModal.assertAtPage()
        await createExportModal.typeName('new export')
        await createExportModal.typeDesc('export desc')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('RRC automation')
        await createExportModal.clickButton('Create')        
        await common.waitForTimeout(500)        
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "Exports",
            "new folder",
            "new subfolder",
            "new export"
        ])
    })

    it('User is able to add documents to export', async function() {
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
        await searchResultsPage.clickToolbarButton("Actions")
        await searchResultsPage.clickActionMenuItem('Export Selected')

        //open Add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.selectItem('new export')
        await addToAnExportModal.clickButton('Export')
    })

    it('User is able to edit a folder', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.expandItem('new folder')
        await exportsPage.treeView.openItemMenu('new subfolder')
        await exportsPage.treeView.selectItemMenuItem('Edit Folder')
        await editFolderModal.assertAtPage()
        await common.waitForTimeout(1000)
        await editFolderModal.typeName('EDITED folder')
        await editFolderModal.typeDescription('it was edited')
        await editFolderModal.clickButton('Save')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "EDITED folder"
        ])
    })

    it('User is able to move folder to the root, to other folders and subfolders', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.selectItem('EDITED folder')
        //to the root
        await exportsPage.treeView.nestField('EDITED folder', 'Exports')        
        chai.expect(
            await exportsPage.treeView.isItemFoldered('EDITED folder')
        ).to.be.false

        await exportsPage.treeView.selectItem('EDITED folder')
        await exportsPage.treeView.nestField('EDITED folder', 'new folder') 
        //to other folder
        chai.expect(
            await exportsPage.treeView.isItemFoldered('EDITED folder')
        ).to.be.true
    })

    it('User is able to edit export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('new export')
        await exportsPage.treeView.selectItemMenuItem('Edit Export')
        await editExportModal.assertAtPage()
        await common.waitForTimeout(1000)
        await editExportModal.typeName('EDITED export')
        await editExportModal.typeDescription('it was edited')
        await editExportModal.clickButton('Save')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "EDITED export"
        ])
    })

    it('User is able to move export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.selectItem('EDITED export')
        //to other folder
        await exportsPage.treeView.nestField('EDITED export', 'new folder')
        chai.expect(
            await exportsPage.treeView.isItemFoldered('EDITED export')
        ).to.be.true

        await exportsPage.treeView.selectItem('EDITED export')
        //to the root
        await exportsPage.treeView.nestField('EDITED export', 'Exports')
        chai.expect(
            await exportsPage.treeView.isItemFoldered('EDITED export')
        ).to.be.false
    })

    it('User is able to Start Export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.selectItem('EDITED export')
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
        await common.waitForTimeout(5000)
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
        await exportsPage.treeView.selectItem('EDITED export')
        await exportsPage.clickDocumentDetailsLink()
        // info value before stop
        chai.expect(
            await exportsPage.getValueOfStatus('Status:')
        ).to.equal('Complete')
        await exportsPage.clickDetailsHeaderButton('Stop')
        await topNavigation.waitForTaskCount('0')
        await topNavigation.waitForToastMessageToContain('Export stopped')

        // info value after stop
        chai.expect(
            await exportsPage.getValueOfStatus('Status:')
        ).to.equal('Stopped')
        await exportsPage.closeInfoPane()
    })
     
    it('User is able to delete folders and exports from Exports menu', async function() {        
        await exportsPage.assertAtPage()
        await exportsPage.treeView.expandItem('new folder')
        await exportsPage.treeView.openItemMenu('EDITED folder')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('new folder')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('EDITED export')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "new folder",
            "EDITED folder",
            "EDITED export"
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Export Sets - Create folders, subfolders and export to RRC and add documents from Preservations Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let preservationsPage
    let exportsPage
    let addToAnExportModal
    let createExportModal
    let deleteExportModal
    
    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()
    
        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page)
    
        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })
    
    it('User is able to create folders, subfolders and export to RRC and add documents from Preservation sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.selectItem('master preservation')
        await preservationsPage.clickToolbarButton('Actions')
        await preservationsPage.clickActionMenuItem('Export All')
    
        // open add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')
            
        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('export from preservation')
        await createExportModal.typeDesc('exp desc from preservation')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('RRC automation')
        await createExportModal.clickButton('Create') 
            
        //create folder
        await addToAnExportModal.treeView.openItemMenu('export from preservation')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from preservation')
        await createFolderModal.typeDescription('desc from preservation')
        await createFolderModal.clickButton('Create')
    
        //create subfolder
        await addToAnExportModal.treeView.openItemMenu('folder from preservation')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from preservation')
        await createFolderModal.typeDescription('sub desc from preservation')
        await createFolderModal.clickButton('Create')
    
        //add to an export modal closes and documents adds to the export
        await addToAnExportModal.treeView.selectItem('export from preservation')
        await addToAnExportModal.clickButton('Export')
    })
        
    it('Verify that folders and export are created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.expandItem('folder from preservation')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "export from preservation",
            "folder from preservation",
            "sub from preservation"
        ])
        await exportsPage.treeView.selectItem('export from preservation')
        chai.expect(
            await exportsPage.documentList.getDocumentNames()
        ).to.have.members(['marina test.txt'])
    })
    
    it('User is able to delete folders and export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('sub from preservation')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('folder from preservation')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('export from preservation')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "export from preservation",
            "folder from preservation",
            "sub from preservation"
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Export Sets - Create folders, subfolders and export to RRC and add documents from Collections Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let collectionsPage
    let exportsPage
    let addToAnExportModal
    let createExportModal
    let deleteExportModal
    
    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()
    
        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page)
    
        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })
    
    it('User is able to create folders, subfolders and export to RRC and add documents from Collections sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.selectItem('master collection')
        await collectionsPage.clickToolbarButton('Actions')
        await collectionsPage.clickActionMenuItem('Export All')
    
        //open add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')
            
        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('export from collection')
        await createExportModal.typeDesc('exp desc from collection')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('RRC automation')
        await createExportModal.clickButton('Create') 
            
        //create folder
        await addToAnExportModal.treeView.openItemMenu('export from collection')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from collection')
        await createFolderModal.typeDescription('desc from collection')
        await createFolderModal.clickButton('Create')
    
        //create subfolder
        await addToAnExportModal.treeView.openItemMenu('folder from collection')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from collection')
        await createFolderModal.typeDescription('sub desc from collection')
        await createFolderModal.clickButton('Create')
    
        //add to an export modal closes and documents adds to the export
        await addToAnExportModal.treeView.selectItem('export from collection')
        await addToAnExportModal.clickButton('Export')
    })
        
    it('Verify that folders and export are created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.expandItem('folder from collection')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "export from collection",
            "folder from collection",
            "sub from collection"
        ])
        await exportsPage.treeView.selectItem('export from collection')
        chai.expect(
            await exportsPage.documentList.getDocumentNames()
        ).to.have.members(['marina test.txt'])
    })
    
    it('User is able to delete folders and export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('sub from collection')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('folder from collection')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('export from collection')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "export from collection",
            "folder from collection",
            "sub from collection"
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Export Sets - Create folders, subfolders and export to RRC and add documents from Folders Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let foldersPage
    let exportsPage
    let addToAnExportModal
    let createExportModal
    let deleteExportModal
    
    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()
    
        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        foldersPage = new FoldersPage(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page)
    
        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })
    
    it('User is able to create folders, subfolders and export to RRC and add documents from Folders sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('master folder')
        await foldersPage.clickToolbarButton('Actions')
        await foldersPage.clickActionMenuItem('Export All')
    
        //open add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')
            
        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('export from folder')
        await createExportModal.typeDesc('exp desc from folder')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('RRC automation')
        await createExportModal.clickButton('Create') 
            
        //create folder
        await addToAnExportModal.treeView.openItemMenu('export from folder')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from folder')
        await createFolderModal.typeDescription('desc from folder')
        await createFolderModal.clickButton('Create')
    
        //create subfolder
        await addToAnExportModal.treeView.openItemMenu('folder from folder')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from folder')
        await createFolderModal.typeDescription('sub desc from folder')
        await createFolderModal.clickButton('Create')
    
        //add to an export modal closes and documents adds to the export
        await addToAnExportModal.treeView.selectItem('export from folder')
        await addToAnExportModal.clickButton('Export')
    })
        
    it('Verify that folders and export are created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.expandItem('folder from folder')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "export from folder",
            "folder from folder",
            "sub from folder"
        ])
        await exportsPage.treeView.selectItem('export from folder')
        chai.expect(
            await exportsPage.documentList.getDocumentNames()
        ).to.have.members(['marina test.txt'])
    })
    
    it('User is able to delete folders and export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('sub from folder')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('folder from folder')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('export from folder')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "export from folder",
            "folder from folder",
            "sub from folder"
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Export Sets - Create folders, subfolders and export to RRC and add documents from Policies Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let policiesPage
    let exportsPage
    let addToAnExportModal
    let createExportModal
    let deleteExportModal
    
    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()
    
        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        policiesPage = new PoliciesPage(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page)
    
        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })
    
    it('User is able to create folders, subfolders and export to RRC and add documents from Policies sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Policies')
        await policiesPage.assertAtPage()
        await policiesPage.treeView.selectItem('master policy')
        await policiesPage.clickToolbarButton('Actions')
        await policiesPage.clickActionMenuItem('Export All')
    
        //open add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')
            
        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('export from policy')
        await createExportModal.typeDesc('exp desc from policy')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('RRC automation')
        await createExportModal.clickButton('Create') 
            
        //create folder
        await addToAnExportModal.treeView.openItemMenu('export from policy')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from policy')
        await createFolderModal.typeDescription('desc from policy')
        await createFolderModal.clickButton('Create')
    
        //create subfolder
        await addToAnExportModal.treeView.openItemMenu('folder from policy')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from policy')
        await createFolderModal.typeDescription('sub desc from policy')
        await createFolderModal.clickButton('Create')
    
        //add to an export modal closes and documents adds to the export
        await addToAnExportModal.treeView.selectItem('export from policy')
        await addToAnExportModal.clickButton('Export')
    })
        
    it('Verify that folders and export are created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.expandItem('folder from policy')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "export from policy",
            "folder from policy",
            "sub from policy"
        ])
        await exportsPage.treeView.selectItem('export from policy')
        chai.expect(
            await exportsPage.documentList.getDocumentNames()
        ).to.have.members(['marina test.txt'])
    })
    
    it('User is able to delete folders and export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('sub from policy')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('folder from policy')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('export from policy')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "export from policy",
            "folder from policy",
            "sub from policy"
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Export Sets - Create folders, subfolders and export to RRC and add documents from Exports Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let exportsPage
    let addToAnExportModal
    let createExportModal
    let deleteExportModal
    
    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()
    
        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page)
    
        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })
    
    it('User is able to create folders, subfolders and export to RRC and add documents from Exports sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.selectItem('master export')
        await exportsPage.clickToolbarButton('Actions')
        await exportsPage.clickActionMenuItem('Export All')
    
        //open add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')
            
        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('export from export')
        await createExportModal.typeDesc('exp desc from export')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('RRC automation')
        await createExportModal.clickButton('Create') 
            
        //create folder
        await addToAnExportModal.treeView.openItemMenu('export from export')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from export')
        await createFolderModal.typeDescription('desc from export')
        await createFolderModal.clickButton('Create')
    
        //create subfolder
        await addToAnExportModal.treeView.openItemMenu('folder from export')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from export')
        await createFolderModal.typeDescription('sub desc from export')
        await createFolderModal.clickButton('Create')
    
        //add to an export modal closes and documents adds to the export
        await addToAnExportModal.treeView.selectItem('export from export')
        await addToAnExportModal.clickButton('Export')
    })
        
    it('Verify that folders and export are created, documents added', async function() {
        await exportsPage.assertAtPage()
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "export from export",
            "folder from export",
            "sub from export"
        ])
        await exportsPage.treeView.selectItem('export from export')
        chai.expect(
            await exportsPage.documentList.getDocumentNames()
        ).to.have.members(['marina test.txt'])
    })
    
    it('User is able to delete folders and export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('sub from export')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('folder from export')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('export from export')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "export from export",
            "folder from export",
            "sub from export"
        ])
    })
    
    after(async function() {        
    await browserHelper.destroy()
    })
})

describe('Export Sets - Create and delete folders, subfolders and export, add documets to export to RRC from Explorer Graph', async function() {
    let loginUtil    
    let projectNavigation
    let exportsPage
    let browserHelper
    let deleteFolderModal
    let explorerPage
    let addToAnExportModal
    let createFolderModal
    let deleteExportModal
    let createExportModal
    
    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()
    
        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        explorerPage = new ExplorerPage(browserHelper.browser, browserHelper.page) 
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)
    
        await loginUtil.loginAsRGLocalUser(config.get('rgProject')) 
    })
    
    it('User is able to create a folder, subfolder and collection  to RRC and add documents from Explorer Graph', async function () {
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
        await explorerPage.clickActionMenuItem('Export')
        
        //open Add To An Export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')
    
        //open create new export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('export from explorer graph')
        await createExportModal.typeDesc('desc from explorer graph')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('RRC automation')
        await createExportModal.clickButton('Create')
    
        //create folder
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from explorer graph')
        await createFolderModal.typeDescription('desc from explorer graph')
        await createFolderModal.clickButton('Create')
            
        //create subfolder
        await addToAnExportModal.treeView.openItemMenu('folder from explorer graph')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from explorer graph')
        await createFolderModal.typeDescription('sub desc from explorer graph')
        await createFolderModal.clickButton('Create')
            
        //add document to export
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.selectItem('export from explorer graph')
        await common.waitForTimeout(500)
        await addToAnExportModal.clickButton('Export')
    })
        
    it('Verify that folders and export are created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.expandItem('folder from explorer graph')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "export from explorer graph",
            "folder from explorer graph",
            "sub from explorer graph"
        ])
        await exportsPage.treeView.selectItem('export from explorer graph')
        chai.expect(
            await exportsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n1')
    })
    
    it('User is able to delete folders and export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('sub from explorer graph')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('folder from explorer graph')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('export from explorer graph')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "export from explorer graph",
            "folder from explorer graph",
            "sub from explorer graph"
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Export Sets - Create and delete folders, subfolders and export, add documets to export to RRC from Search Page', async function() {
    let loginUtil    
    let projectNavigation
    let exportsPage
    let browserHelper
    let addToAnExportModal
    let deleteExportModal
    let deleteFolderModal
    let createExportModal
    let createFolderModal
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
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        searchPage = new SearchPage(browserHelper.browser, browserHelper.page)
        searchResultsPage = new SearchResultsPage(browserHelper.browser, browserHelper.page)
    
        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })
    
    it('User is able to create a folder, subfolder and export and add documents to export to RRC from Search Page', async function() {
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
        await searchResultsPage.clickToolbarButton("Actions")
        await searchResultsPage.clickActionMenuItem('Export Selected')
    
        //open Add To An Export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')
    
        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('export from search')
        await createExportModal.typeDesc('description from search')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('RRC automation')
        await createExportModal.clickButton('Create') 
             
        //create folder
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from search')
        await createFolderModal.typeDescription('desc from search')
        await createFolderModal.clickButton('Create')
       
        //create subfolder
        await addToAnExportModal.treeView.openItemMenu('folder from search')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from search')
        await createFolderModal.typeDescription('sub desc from search')
        await createFolderModal.clickButton('Create')
    
        //add documents to export
        await addToAnExportModal.treeView.selectItem('export from search')
        await addToAnExportModal.clickButton('Export')
    })
    
    it('Verify that folders created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.expandItem('folder from search')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "export from search",
            "folder from search",
            "sub from search"
        ])
        await exportsPage.treeView.selectItem('export from search')
        chai.expect(
            await exportsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n1')
    })
    
    it('User is able to delete folders and export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('sub from search')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('folder from search')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('export from search')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "export from search",
            "folder from search",
            "sub from search"
        ])
    })
     
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Export Sets - Create and delete folders, subfolders and export, add documets to export to RRC from Explorer Views', async function() {
    let loginUtil    
    let projectNavigation
    let exportsPage
    let browserHelper
    let deleteFolderModal
    let explorerPage
    let explorerDocumentPage
    let addToAnExportModal
    let createFolderModal
    let deleteExportModal
    let createExportModal
    let topNavigation
    
    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()
    
        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        explorerPage = new ExplorerPage(browserHelper.browser, browserHelper.page) 
        explorerDocumentPage = new ExplorerDocumentPage(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)
        topNavigation = new TopNavigation(browserHelper.browser, browserHelper.page)
    
        await loginUtil.loginAsRGLocalUser(config.get('rgProject')) 
    })
    
    it('User is able to create a folder, subfolder and collection to RRC and add documents from Explorer Views', async function () {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Explorer')
        await explorerPage.assertAtPage()
        await explorerPage.openActionMenu()
        await explorerPage.clickActionMenuItem('Export')
    
        //open Add To An Export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')
    
        //open create new export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('export from explorer view')
        await createExportModal.typeDesc('desc from explorer view')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('RRC automation')
        await createExportModal.clickButton('Create')
    
        //create folder
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from explorer view')
        await createFolderModal.typeDescription('desc from explorer view')
        await createFolderModal.clickButton('Create')
            
        //create subfolder
        await addToAnExportModal.treeView.openItemMenu('folder from explorer view')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from explorer view')
        await createFolderModal.typeDescription('sub desc from explorer view')
        await createFolderModal.clickButton('Create')
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.clickButton('Cancel')
            
        //add document to export
        await explorerPage.assertAtPage()
        await explorerPage.openActionMenu()
        await explorerPage.clickActionMenuItem('View Document Set')
        await explorerPage.waitForTaskCountToBeZero('0')
        await explorerDocumentPage.assertAtPage()
        await explorerDocumentPage.documentList.clickNthDocumentCheckbox(0)
        await explorerDocumentPage.clickToolbarButton('Actions')
        await explorerDocumentPage.clickActionMenuItem('Export Selected')
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')

        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('export from view')
        await createExportModal.typeDesc('description from view')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('automation endpoint')
        await createExportModal.clickButton('Create') 

        //create folder
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from view')
        await createFolderModal.typeDescription('desc from view')
        await createFolderModal.clickButton('Create')
    
        //create subfolder
        await addToAnExportModal.treeView.openItemMenu('folder from view')
        await addToAnExportModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from view')
        await createFolderModal.typeDescription('sub desc from view')
        await createFolderModal.clickButton('Create')
 
        //add documents to export
        await addToAnExportModal.treeView.selectItem('export from view')
        await addToAnExportModal.clickButton('Export') 
    })
        
    it('Verify that folders and export are created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.expandItem('folder from explorer view')
        await exportsPage.treeView.expandItem('folder from view')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.include.members([
            "export from explorer view",
            "folder from explorer view",
            "sub from explorer view",
            "export from view",
            "folder from view",
            'sub from view'
        ])
        await exportsPage.treeView.selectItem('export from view')
        chai.expect(
            await exportsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n1')
    })
    it('User is able to delete folders and export', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('sub from explorer view')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('folder from explorer view')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('export from explorer view')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('sub from view')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.assertAtPage()
        await exportsPage.treeView.openItemMenu('folder from view')
        await exportsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await exportsPage.treeView.openItemMenu('export from view')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        await topNavigation.waitForToastMessageToContain('Document Set has been deleted')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "export from explorer view",
            "folder from explorer view",
            "sub from explorer view",
            "sub from view",
            "folder from view",
            "export from view"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})


