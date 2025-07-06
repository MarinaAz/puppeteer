const LoginUtil = require("../util/LoginUtil")
const TopNavigation = require("../pages/components/TopNavigation")
const ProjectNavigation = require("../pages/components/ProjectNavigation")
const CollectionsPage = require("../pages/CollectionsPage")
const BrowserHelper = require("../util/BrowserHelper")
const chai = require('chai')
const config = require('config')
const common = require("../common")
const CreateCollectionModal = require("../pages/modals/CreateCollectionModal")
const DeleteCollectionModal = require("../pages/modals/DeleteCollectionModal")
const SearchPage = require("../pages/SearchPage")
const SearchResultsPage = require("../pages/SearchResultsPage")
const DocumentViewerPage = require("../pages/DocumentViewerPage")
const CollectDocumentsModal = require("../pages/modals/CollectDocumentsModal")
const CreateFolderModal = require("../pages/modals/CreateFolderModal")
const EditFolderModal = require("../pages/modals/EditFolderModal")
const DeleteFolderModal = require("../pages/modals/DeleteFolderModal")
const EditCollectionModal = require("../pages/modals/EditCollectionModal")
const PreservationsPage = require("../pages/PreservationsPage")
const FoldersPage = require("../pages/FoldersPage")
const PoliciesPage = require("../pages/PoliciesPage")
const ExportsPage = require("../pages/ExportsPage")
const ExplorerPage = require("../pages/ExplorerPage")
const ExplorerDocumentPage = require("../pages/ExplorerDocumentPage")

describe('Collection Sets - create, edit, move and delete folder, subfolder and collection from left pane', async function () {
    let loginUtil    
    let projectNavigation
    let collectionsPage
    let browserHelper
    let createCollectionModal
    let createFolderModal
    let deleteFolderModal
    let editFolderModal
    let editCollectionModal
    let deleteCollectionModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)
        createCollectionModal = new CreateCollectionModal(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        editFolderModal = new EditFolderModal(browserHelper.browser, browserHelper.page)
        editCollectionModal = new EditCollectionModal(browserHelper.browser, browserHelper.page)
        deleteCollectionModal = new DeleteCollectionModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create a folder from Collections menu', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        await collectionsPage.clickCreateButton('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('new folder')
        await createFolderModal.typeDescription('new description')
        await createFolderModal.clickButton('Create')        
        await common.waitForTimeout(500)
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.include.members([
            "Collections",
            "new folder"
        ])
    })

    it('User is able to create a subfolder from Collections menu', async function() {
        await collectionsPage.assertAtPage()        
        await collectionsPage.treeView.openItemMenu('new folder')        
        await collectionsPage.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('new subfolder')
        await createFolderModal.typeDescription('new subdescription')
        await createFolderModal.clickButton('Create')     
        await common.waitForTimeout(500)
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.include.members([
            "Collections",
            "new folder",
            "new subfolder",
        ])
    })

    it('User is able to create a collection from Collections menu', async function() {
        await collectionsPage.assertAtPage()        
        await collectionsPage.treeView.openItemMenu('Collections')        
        await collectionsPage.treeView.selectItemMenuItem('New Collection')
        await createCollectionModal.assertAtPage()
        await createCollectionModal.typeName('new collection')
        await createCollectionModal.typeDesc('collection description')
        await createCollectionModal.clickButton('Create')        
        await common.waitForTimeout(500)
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.include.members([
            "Collections",
            "new folder",
            "new subfolder",
            "new collection"
        ])
    })

    it('User is able to edit a folder', async function() {
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.openItemMenu('new subfolder')
        await collectionsPage.treeView.selectItemMenuItem('Edit Folder')
        await editFolderModal.assertAtPage()
        await common.waitForTimeout(1000)
        await editFolderModal.typeName('EDITED folder')
        await editFolderModal.typeDescription('it was edited')
        await editFolderModal.clickButton('Save')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.include.members([
            "EDITED folder"
        ])
    })

    it('User is able to move folder to the root, to other folders and subfolders', async function() {
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.selectItem('EDITED folder')
        //to the root
        await collectionsPage.treeView.nestField('EDITED folder', 'Collections')        
        chai.expect(
            await collectionsPage.treeView.isItemFoldered('EDITED folder')
        ).to.be.false

        await collectionsPage.treeView.selectItem('EDITED folder')
        //to other folder
        await collectionsPage.treeView.nestField('EDITED folder', 'new folder') 
        chai.expect(
            await collectionsPage.treeView.isItemFoldered('EDITED folder')
        ).to.be.true
    })

    it('User is able to edit collection', async function() {
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.openItemMenu('new collection')
        await collectionsPage.treeView.selectItemMenuItem('Edit Collection')
        await editCollectionModal.assertAtPage()
        await common.waitForTimeout(1000)
        await editCollectionModal.typeName('EDITED collection')
        await editCollectionModal.typeDescription('it was edited')
        await editCollectionModal.clickButton('Save')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.include.members([
            "EDITED collection"
        ])
    })

    it('User is able to move collection', async function() {
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.selectItem('EDITED collection')
        //to other folder
        await collectionsPage.treeView.nestField('EDITED collection','new folder')
        chai.expect(
            await collectionsPage.treeView.isItemFoldered('EDITED collection')
        ).to.be.true

        await collectionsPage.treeView.selectItem('EDITED collection')
        //to the root
        await collectionsPage.treeView.nestField('EDITED collection','Collections')
        chai.expect(
            await collectionsPage.treeView.isItemFoldered('EDITED collection')
        ).to.be.false
    })

    it('User is able to Refresh Collection Info and Stop Collection', async function() {
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.selectItem('EDITED collection')
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
     
    it('User is able to delete folders and collections from Collections menu', async function() {        
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.openItemMenu('EDITED folder')
        await collectionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await collectionsPage.treeView.openItemMenu('new folder')
        await collectionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await collectionsPage.treeView.openItemMenu('EDITED collection')
        await collectionsPage.treeView.selectItemMenuItem('Delete Collection')
        await deleteCollectionModal.assertAtPage()
        await deleteCollectionModal.clickButton('Delete')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.not.include.members([
            "new folder",
            "EDITED folder",
            "EDITED collection"
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Collection Sets - Create folders, subfolders and collections and add documents to collection from Preservations Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let preservationsPage
    let collectDocumentsModal
    let collectionsPage
    let createCollectionModal
    let deleteCollectionModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        collectDocumentsModal = new CollectDocumentsModal(browserHelper.browser, browserHelper.page)
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)
        createCollectionModal = new CreateCollectionModal(browserHelper.browser, browserHelper.page)
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        deleteCollectionModal = new DeleteCollectionModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create folders, subfolders and collections and add documents from Preservation sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.selectItem('master preservation')
        await preservationsPage.clickToolbarButton('Actions')
        await preservationsPage.clickActionMenuItem('Collect All')

        //open Collect documents modal
        await collectDocumentsModal.assertAtPage()
        await collectDocumentsModal.treeView.openItemMenu('Collections')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Collection')
        
        //open create collection modal
        await createCollectionModal.assertAtPage()
        await createCollectionModal.typeName('collection from preservation')
        await createCollectionModal.typeDesc('coll desc from preservation')
        await createCollectionModal.clickButton('Create') 
        
        //create folder
        await collectDocumentsModal.treeView.openItemMenu('collection from preservation')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from preservation')
        await createFolderModal.typeDescription('desc from preservation')
        await createFolderModal.clickButton('Create')

        //create subfolder
        await collectDocumentsModal.treeView.openItemMenu('folder from preservation')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from preservation')
        await createFolderModal.typeDescription('sub desc from preservation')
        await createFolderModal.clickButton('Create')

        //collect documents modal closes and documents adds fo the collection
        await collectDocumentsModal.treeView.selectItem('collection from preservation')
        await collectDocumentsModal.clickButton('Collect')
    })
    
    it('Verify that folders and collection created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.expandItem('folder from preservation')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.include.members([
            "collection from preservation",
            "folder from preservation",
            "sub from preservation"
        ])
        await collectionsPage.treeView.selectItem('collection from preservation')
        chai.expect(
            await collectionsPage.documentList.getDocumentNames()
        ).to.have.members(['marina test.txt'])
    })

    it('User is able to delete folders and collection', async function() {
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.openItemMenu('sub from preservation')
        await collectionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await collectionsPage.treeView.openItemMenu('folder from preservation')
        await collectionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await collectionsPage.treeView.openItemMenu('collection from preservation')
        await collectionsPage.treeView.selectItemMenuItem('Delete Collection')
        await deleteCollectionModal.assertAtPage()
        await deleteCollectionModal.clickButton('Delete')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.not.include.members([
            "collection from preservation",
            "folder from preservation",
            "sub from preservation"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Collection Sets - Create folders, subfolders and collections and add documents to collection from Collections Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let collectDocumentsModal
    let collectionsPage
    let createCollectionModal
    let deleteCollectionModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        collectDocumentsModal = new CollectDocumentsModal(browserHelper.browser, browserHelper.page)
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)
        createCollectionModal = new CreateCollectionModal(browserHelper.browser, browserHelper.page)
        deleteCollectionModal = new DeleteCollectionModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create folders, subfolders and collections and add documents from Collections sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.selectItem('master collection')
        await collectionsPage.clickToolbarButton('Actions')
        await collectionsPage.clickActionMenuItem('Collect All')

        //open Collect documents modal
        await collectDocumentsModal.assertAtPage()
        await collectDocumentsModal.treeView.openItemMenu('Collections')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Collection')
        
        //open create collection modal
        await createCollectionModal.assertAtPage()
        await createCollectionModal.typeName('collection from collection')
        await createCollectionModal.typeDesc('coll desc from collection')
        await createCollectionModal.clickButton('Create') 
        
        //create folder
        await collectDocumentsModal.treeView.openItemMenu('collection from collection')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from collection')
        await createFolderModal.typeDescription('desc from collection')
        await createFolderModal.clickButton('Create')

        //create subfolder
        await collectDocumentsModal.treeView.openItemMenu('folder from collection')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from collection')
        await createFolderModal.typeDescription('sub desc from collection')
        await createFolderModal.clickButton('Create')

        //collect documents modal closes and documents adds to the collection
        await collectDocumentsModal.treeView.selectItem('collection from collection')
        await collectDocumentsModal.clickButton('Collect')
    })
    
    it('Verify that folders and collection created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.include.members([
            "collection from collection",
            "folder from collection",
            "sub from collection"
        ])
        await collectionsPage.treeView.selectItem('collection from collection')
        chai.expect(
            await collectionsPage.documentList.getDocumentNames()
        ).to.have.members(['marina test.txt'])
    })

    it('User is able to delete folders and collection', async function() {
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.openItemMenu('sub from collection')
        await collectionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await collectionsPage.treeView.openItemMenu('folder from collection')
        await collectionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await collectionsPage.treeView.openItemMenu('collection from collection')
        await collectionsPage.treeView.selectItemMenuItem('Delete Collection')
        await deleteCollectionModal.assertAtPage()
        await deleteCollectionModal.clickButton('Delete')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.not.include.members([
            "collection from collection",
            "folder from collection",
            "sub from collection"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Collection Sets - Create folders, subfolders and collections and add documents to collection from Folders Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let collectDocumentsModal
    let collectionsPage
    let createCollectionModal
    let deleteCollectionModal
    let foldersPage

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        collectDocumentsModal = new CollectDocumentsModal(browserHelper.browser, browserHelper.page)
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)
        createCollectionModal = new CreateCollectionModal(browserHelper.browser, browserHelper.page)
        deleteCollectionModal = new DeleteCollectionModal(browserHelper.browser, browserHelper.page)
        foldersPage = new FoldersPage(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create folders, subfolders and collections and add documents from Folders sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('master folder')
        await foldersPage.clickToolbarButton('Actions')
        await foldersPage.clickActionMenuItem('Collect All')

        //open Collect documents modal
        await collectDocumentsModal.assertAtPage()
        await collectDocumentsModal.treeView.openItemMenu('Collections')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Collection')
        
        //open create collection modal
        await createCollectionModal.assertAtPage()
        await createCollectionModal.typeName('collection from folders')
        await createCollectionModal.typeDesc('coll desc from folders')
        await createCollectionModal.clickButton('Create') 
        
        //create folder
        await collectDocumentsModal.treeView.openItemMenu('collection from folders')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from folders')
        await createFolderModal.typeDescription('desc from folders')
        await createFolderModal.clickButton('Create')

        //create subfolder
        await collectDocumentsModal.treeView.openItemMenu('folder from folders')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from folders')
        await createFolderModal.typeDescription('sub desc from folders')
        await createFolderModal.clickButton('Create')

        //collect documents modal closes and documents adds to the collection
        await collectDocumentsModal.treeView.selectItem('collection from folders')
        await collectDocumentsModal.clickButton('Collect')
    })
    
    it('Verify that folders and collection created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.expandItem('folder from folders')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.include.members([
            "collection from folders",
            "folder from folders",
            "sub from folders"
        ])
        await collectionsPage.treeView.selectItem('collection from folders')
        chai.expect(
            await collectionsPage.documentList.getDocumentNames()
        ).to.have.members(['marina test.txt'])
    })

    it('User is able to delete folders and collection', async function() {
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.openItemMenu('sub from folders')
        await collectionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await collectionsPage.treeView.openItemMenu('folder from folders')
        await collectionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await collectionsPage.treeView.openItemMenu('collection from folders')
        await collectionsPage.treeView.selectItemMenuItem('Delete Collection')
        await deleteCollectionModal.assertAtPage()
        await deleteCollectionModal.clickButton('Delete')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.not.include.members([
            "collection from folders",
            "folder from folders",
            "sub from folders"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Collection Sets - Create folders, subfolders and collections and add documents to collection from Policies Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let collectDocumentsModal
    let collectionsPage
    let createCollectionModal
    let deleteCollectionModal
    let policiesPage

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        collectDocumentsModal = new CollectDocumentsModal(browserHelper.browser, browserHelper.page)
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)
        createCollectionModal = new CreateCollectionModal(browserHelper.browser, browserHelper.page)
        deleteCollectionModal = new DeleteCollectionModal(browserHelper.browser, browserHelper.page)
        policiesPage = new PoliciesPage(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create folders, subfolders and collections and add documents from Folders sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Policies')
        await policiesPage.assertAtPage()
        await policiesPage.treeView.selectItem('master policy')
        await policiesPage.clickToolbarButton('Actions')
        await policiesPage.clickActionMenuItem('Collect All')

        //open Collect documents modal
        await collectDocumentsModal.assertAtPage()
        await collectDocumentsModal.treeView.openItemMenu('Collections')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Collection')
        
        //open create collection modal
        await createCollectionModal.assertAtPage()
        await createCollectionModal.typeName('collection from policies')
        await createCollectionModal.typeDesc('coll desc from policies')
        await createCollectionModal.clickButton('Create') 
        
        //create folder
        await collectDocumentsModal.treeView.openItemMenu('collection from policies')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from policies')
        await createFolderModal.typeDescription('desc from policies')
        await createFolderModal.clickButton('Create')

        //create subfolder
        await collectDocumentsModal.treeView.openItemMenu('folder from policies')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from policies')
        await createFolderModal.typeDescription('sub desc from policies')
        await createFolderModal.clickButton('Create')

        //collect documents modal closes and documents adds to the collection
        await collectDocumentsModal.treeView.selectItem('collection from policies')
        await collectDocumentsModal.clickButton('Collect')
    })
    
    it('Verify that folders and collection created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.expandItem('folder from policies')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.include.members([
            "collection from policies",
            "folder from policies",
            "sub from policies"
        ])
        await collectionsPage.treeView.selectItem('collection from policies')
        chai.expect(
            await collectionsPage.documentList.getDocumentNames()
        ).to.have.members(['marina test.txt'])
    })

    it('User is able to delete folders and collection', async function() {
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.openItemMenu('sub from policies')
        await collectionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await collectionsPage.treeView.openItemMenu('folder from policies')
        await collectionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await collectionsPage.treeView.openItemMenu('collection from policies')
        await collectionsPage.treeView.selectItemMenuItem('Delete Collection')
        await deleteCollectionModal.assertAtPage()
        await deleteCollectionModal.clickButton('Delete')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.not.include.members([
            "collection from policies",
            "folder from policies",
            "sub from policies"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Collection Sets - Create folders, subfolders and collections and add documents to collection from Exports Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let collectDocumentsModal
    let collectionsPage
    let createCollectionModal
    let deleteCollectionModal
    let exportsPage

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        collectDocumentsModal = new CollectDocumentsModal(browserHelper.browser, browserHelper.page)
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)
        createCollectionModal = new CreateCollectionModal(browserHelper.browser, browserHelper.page)
        deleteCollectionModal = new DeleteCollectionModal(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create folders, subfolders and collections and add documents from Exports sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.selectItem('master export')
        await exportsPage.clickToolbarButton('Actions')
        await exportsPage.clickActionMenuItem('Collect All')

        //open Collect documents modal
        await collectDocumentsModal.assertAtPage()
        await collectDocumentsModal.treeView.openItemMenu('Collections')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Collection')
        
        //open create collection modal
        await createCollectionModal.assertAtPage()
        await createCollectionModal.typeName('collection from exports')
        await createCollectionModal.typeDesc('coll desc from exports')
        await createCollectionModal.clickButton('Create') 
        
        //create folder
        await collectDocumentsModal.treeView.openItemMenu('collection from exports')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from exports')
        await createFolderModal.typeDescription('desc from exports')
        await createFolderModal.clickButton('Create')

        //create subfolder
        await collectDocumentsModal.treeView.openItemMenu('folder from exports')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from exports')
        await createFolderModal.typeDescription('sub desc from exports')
        await createFolderModal.clickButton('Create')

        //collect documents modal closes and documents adds to the collection
        await collectDocumentsModal.treeView.selectItem('collection from exports')
        await collectDocumentsModal.clickButton('Collect')
    })
    
    it('Verify that folders and collection created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.expandItem('folder from exports')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.include.members([
            "collection from exports",
            "folder from exports",
            "sub from exports"
        ])
        await collectionsPage.treeView.selectItem('collection from exports')
        chai.expect(
            await collectionsPage.documentList.getDocumentNames()
        ).to.have.members(['marina test.txt'])
    })

    it('User is able to delete folders and collection', async function() {
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.openItemMenu('sub from exports')
        await collectionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await collectionsPage.treeView.openItemMenu('folder from exports')
        await collectionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await collectionsPage.treeView.openItemMenu('collection from exports')
        await collectionsPage.treeView.selectItemMenuItem('Delete Collection')
        await deleteCollectionModal.assertAtPage()
        await deleteCollectionModal.clickButton('Delete')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.not.include.members([
            "collection from exports",
            "folder from exports",
            "sub from exports"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Collection Sets - Create and delete folders, subfolders and collections, add documets to collections from Explorer Graph', async function() {
    let loginUtil    
    let projectNavigation
    let collectionsPage
    let browserHelper
    let deleteFolderModal
    let explorerPage
    let collectDocumentsModal
    let createFolderModal
    let createCollectionModal
    let deleteCollectionModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        explorerPage = new ExplorerPage(browserHelper.browser, browserHelper.page) 
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        collectDocumentsModal = new CollectDocumentsModal(browserHelper.browser, browserHelper.page)
        createCollectionModal = new CreateCollectionModal(browserHelper.browser, browserHelper.page)
        deleteCollectionModal = new DeleteCollectionModal(browserHelper.browser, browserHelper.page)

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
        await explorerPage.clickActionMenuItem('Collect')

        //open collect documents modal
        await collectDocumentsModal.assertAtPage()
        await collectDocumentsModal.treeView.openItemMenu('Collections')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Collection')

        //open create collection modal
        await createCollectionModal.assertAtPage()
        await createCollectionModal.typeName('collection from explorer graph')
        await createCollectionModal.typeDesc('description from explorer graph')
        await createCollectionModal.clickButton('Create')

        //create folder
        await collectDocumentsModal.treeView.openItemMenu('Collections')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from explorer graph')
        await createFolderModal.typeDescription('desc from explorer graph')
        await createFolderModal.clickButton('Create')
        
        //create subfolder
        await collectDocumentsModal.treeView.openItemMenu('folder from explorer graph')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from explorer graph')
        await createFolderModal.typeDescription('sub desc from explorer graph')
        await createFolderModal.clickButton('Create')
        
        //add document to folder
        await collectDocumentsModal.assertAtPage()
        await collectDocumentsModal.treeView.selectItem('collection from explorer graph')
        await common.waitForTimeout(500)
        await collectDocumentsModal.clickButton('Collect')
    })
    
    it('Verify that folders and collection created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.expandItem('folder from explorer graph')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.include.members([
            "collection from explorer graph",
            "folder from explorer graph",
            "sub from explorer graph"
        ])
        await collectionsPage.treeView.selectItem('collection from explorer graph')
        chai.expect(
            await collectionsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n1')
    })

    it('User is able to delete folders', async function() {
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.openItemMenu('sub from explorer graph')
        await collectionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await collectionsPage.treeView.openItemMenu('folder from explorer graph')
        await collectionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await collectionsPage.treeView.openItemMenu('collection from explorer graph')
        await collectionsPage.treeView.selectItemMenuItem('Delete Collection')
        await deleteCollectionModal.assertAtPage()
        await deleteCollectionModal.clickButton('Delete')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.not.include.members([
            "collection from explorer graph",
            "folder from explorer graph",
            "sub from explorer graph"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Collection Sets - Create and delete folders, subfolders and collections, add documets to collections from Search Page', async function() {
    let loginUtil    
    let projectNavigation
    let collectionsPage
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let collectDocumentsModal
    let searchPage
    let searchResultsPage
    let createCollectionModal
    let deleteCollectionModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page) 
        collectDocumentsModal = new CollectDocumentsModal(browserHelper.browser, browserHelper.page)
        searchPage = new SearchPage(browserHelper.browser, browserHelper.page)
        searchResultsPage = new SearchResultsPage(browserHelper.browser, browserHelper.page)
        createCollectionModal = new CreateCollectionModal(browserHelper.browser, browserHelper.page)
        deleteCollectionModal = new DeleteCollectionModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create a folder, subfolder and collection and add documents from Search Page', async function() {
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
        await searchResultsPage.clickActionMenuItem('Collect Selected')

        //open Collect documents modal
        await collectDocumentsModal.assertAtPage()
        await collectDocumentsModal.treeView.openItemMenu('Collections')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Collection')

        //open create collection modal
        await createCollectionModal.assertAtPage()
        await createCollectionModal.typeName('collection from search')
        await createCollectionModal.typeDesc('description from search')
        await createCollectionModal.clickButton('Create') 
         
        //create folder
        await collectDocumentsModal.treeView.openItemMenu('Collections')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from search')
        await createFolderModal.typeDescription('desc from search')
        await createFolderModal.clickButton('Create')
   
        //create subfolder
        await collectDocumentsModal.treeView.openItemMenu('folder from search')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from search')
        await createFolderModal.typeDescription('sub desc from search')
        await createFolderModal.clickButton('Create')

        //add documents to folder
        await collectDocumentsModal.treeView.selectItem('collection from search')
        await collectDocumentsModal.clickButton('Collect')
    })

    it('Verify that folders created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.expandItem('folder from search')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.include.members([
            "collection from search",
            "folder from search",
            "sub from search"
        ])
        await collectionsPage.treeView.selectItem('collection from search')
        chai.expect(
            await collectionsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n1')
    })

    it('User is able to delete folders', async function() {
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.openItemMenu('sub from search')
        await collectionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await collectionsPage.treeView.openItemMenu('folder from search')
        await collectionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await collectionsPage.treeView.openItemMenu('collection from search')
        await collectionsPage.treeView.selectItemMenuItem('Delete Collection')
        await deleteCollectionModal.assertAtPage()
        await deleteCollectionModal.clickButton('Delete')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.not.include.members([
            "collection from search",
            "folder from search",
            "sub from search"
        ])
    })
 
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Collection Sets - Create and delete folders, subfolders and collections, add documets to collections from Explorer Views', async function() {
    let loginUtil    
    let projectNavigation
    let collectionsPage
    let browserHelper
    let deleteFolderModal
    let explorerPage
    let explorerDocumentPage
    let deleteCollectionModal
    let collectDocumentsModal
    let createCollectionModal
    let createFolderModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        explorerPage = new ExplorerPage(browserHelper.browser, browserHelper.page) 
        explorerDocumentPage = new ExplorerDocumentPage(browserHelper.browser, browserHelper.page)
        deleteCollectionModal = new DeleteCollectionModal(browserHelper.browser, browserHelper.page)
        collectDocumentsModal = new CollectDocumentsModal(browserHelper.browser, browserHelper.page) 
        createCollectionModal = new CreateCollectionModal(browserHelper.browser, browserHelper.page) 
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject')) 
    })

    it('User is able to create a folder, subfolder and collection and add documents from Explorer Views', async function () {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Explorer')
        await explorerPage.assertAtPage()
        await explorerPage.openActionMenu()
        await explorerPage.clickActionMenuItem('Collect')

        //open collect documents modal
        await collectDocumentsModal.assertAtPage()
        await collectDocumentsModal.treeView.openItemMenu('Collections')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Collection')

        //open create collection modal
        await createCollectionModal.assertAtPage()
        await createCollectionModal.typeName('collection from explorer views')
        await createCollectionModal.typeDesc('description from explorer views')
        await createCollectionModal.clickButton('Create')

        //create folder
        await collectDocumentsModal.treeView.openItemMenu('Collections')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from explorer views')
        await createFolderModal.typeDescription('desc from explorer views')
        await createFolderModal.clickButton('Create')
        
        //create subfolder
        await collectDocumentsModal.treeView.openItemMenu('folder from explorer views')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from explorer views')
        await createFolderModal.typeDescription('sub desc from explorer views')
        await createFolderModal.clickButton('Create')
        await collectDocumentsModal.assertAtPage()
        await collectDocumentsModal.clickButton('Cancel')

        //add document to folder
        await explorerPage.assertAtPage()
        await explorerPage.openActionMenu()
        await explorerPage.clickActionMenuItem('View Document Set')
        await explorerPage.waitForTaskCountToBeZero('0')
        await explorerDocumentPage.assertAtPage()
        await explorerDocumentPage.documentList.clickNthDocumentCheckbox(0)
        await explorerDocumentPage.clickToolbarButton('Actions')
        await explorerDocumentPage.clickActionMenuItem('Collect Selected')
        await collectDocumentsModal.assertAtPage()
        await collectDocumentsModal.treeView.openItemMenu('Collections')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Collection')
        
        //open create collection modal
        await createCollectionModal.assertAtPage()
        await createCollectionModal.typeName('collection from view')
        await createCollectionModal.typeDesc('description from view')
        await createCollectionModal.clickButton('Create') 
  
        //create folder
        await collectDocumentsModal.treeView.openItemMenu('Collections')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from view')
        await createFolderModal.typeDescription('desc from view')
        await createFolderModal.clickButton('Create')
   
        //create subfolder
        await collectDocumentsModal.treeView.openItemMenu('folder from view')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from view')
        await createFolderModal.typeDescription('sub desc from view')
        await createFolderModal.clickButton('Create')

        //add documents to folder
        await collectDocumentsModal.treeView.selectItem('collection from view')
        await collectDocumentsModal.clickButton('Collect')
    })
    
    it('Verify that folders and collection created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.expandItem('folder from explorer views')
        await collectionsPage.treeView.expandItem('folder from view')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.include.members([
            "collection from explorer views",
            "folder from explorer views",
            "sub from explorer views",
            "collection from view",
            "folder from view",
            "sub from view"
        ])
        await collectionsPage.treeView.selectItem('collection from view')
        chai.expect(
            await collectionsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n1')
    })

    it('User is able to delete folders', async function() {
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.openItemMenu('sub from explorer views')
        await collectionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await collectionsPage.treeView.openItemMenu('folder from explorer views')
        await collectionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await collectionsPage.treeView.openItemMenu('collection from explorer views')
        await collectionsPage.treeView.selectItemMenuItem('Delete Collection')
        await deleteCollectionModal.assertAtPage()
        await deleteCollectionModal.clickButton('Delete')
        await collectionsPage.treeView.openItemMenu('sub from view')
        await collectionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await collectionsPage.treeView.openItemMenu('folder from view')
        await collectionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await collectionsPage.treeView.openItemMenu('collection from view')
        await collectionsPage.treeView.selectItemMenuItem('Delete Collection')
        await deleteCollectionModal.assertAtPage()
        await deleteCollectionModal.clickButton('Delete')
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.not.include.members([
            "collection from explorer views",
            "folder from explorer views",
            "sub from explorer views",
            "sub from view",
            "folder from view",
            "collection from view"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Collections - collect documents', async function () { 
    let loginUtil
    let browserHelper
    let projectNavigation
    let searchPage
    let searchResultsPage 
    let documentViewerPage
    let collectDocumentsModal
    let createCollectionModal
    let collectionsPage
    let deleteCollectionModal

    let testDataDocumentName

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        searchPage = new SearchPage(browserHelper.browser, browserHelper.page)
        searchResultsPage = new SearchResultsPage(browserHelper.browser, browserHelper.page)
        documentViewerPage = new DocumentViewerPage(browserHelper.browser, browserHelper.page)
        collectDocumentsModal = new CollectDocumentsModal(browserHelper.browser, browserHelper.page)
        createCollectionModal = new CreateCollectionModal(browserHelper.browser, browserHelper.page)
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)
        deleteCollectionModal = new DeleteCollectionModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it(`User is able to search for documents that are not collected`, async function() {
        //goto search page
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()

        //configure predicate 
        await searchPage.clickLeftSideSearchPredicate('Is Collected')
        await searchPage.clickNthOperator(0)
        await searchPage.selectIsOperator('Is Not')
        await searchPage.clickLeftSideSearchPredicate('Is Preserved')
        await searchPage.clickNthOperator(1)
        await searchPage.selectIsOperator('Is Not')
        
        //search
        await searchPage.clickSearchButton()
        await searchResultsPage.assertAtPage()
        await searchResultsPage.documentList.waitForFirstDocument()

        //retrieve a name for the rest of testing
        const actualDocuments = await searchResultsPage.documentList.getDocuments()
        //pick a random one for re-runability. cleaning up requires GC to run
        testDataDocumentName = actualDocuments[common.randomInt(0,20)]

        console.log(`using document: ${testDataDocumentName}`)
    })

    it(`Non-collected document has no native component`, async function() {
        await searchResultsPage.documentList.clickDocument(testDataDocumentName)
        await documentViewerPage.assertAtPage()
        chai.expect(
            await documentViewerPage.getActiveComponentTypes()
        ).to.have.members([ 
            'Text - Outside In', 
            'Text - dtSearch' 
        ])
    })

    it(`Non-collected document is able to be added to a new collection`, async function() {
        //select document
        await searchResultsPage.documentList.clickDocumentCheckbox(testDataDocumentName)
        await searchResultsPage.clickToolbarButton("Actions")
        await searchResultsPage.clickActionMenuItem('Collect Selected')
        
        //open collect documents modal
        await collectDocumentsModal.assertAtPage()
        await collectDocumentsModal.treeView.openItemMenu('Collections')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Collection')

        //open new collection modal, create
        await createCollectionModal.assertAtPage()
        // await createCollectionModal.selectPriority('Urgent')
        await createCollectionModal.typeName('automation - collect me')        
        await createCollectionModal.clickButton('Create')

        //click create on collect documents modal
        await collectDocumentsModal.clickButton('Collect')

    })

    it(`Non-collected added to a collection produces a native component`, async function() {
                
        //open collections
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await common.waitForTimeout(1000)
        await projectNavigation.clickMenuItem('Collections')

        //retry loop - it may take a bit for it to collect
        await common.asyncRetryLoop(20, 1000, async function() {
            await collectionsPage.page.reload()
            await collectionsPage.assertAtPage()

            //open our test collection
            await collectionsPage.treeView.selectItem('automation - collect me')

            //find out test document and select it
            await collectionsPage.documentList.selectDocument(testDataDocumentName)
            await documentViewerPage.assertAtPage()

            //verify native option is present
            chai.expect(
                await documentViewerPage.getActiveComponentTypes()
            ).to.have.members([ 
                'Native',
                'Text - Outside In', 
                'Text - dtSearch' 
            ])
            return true
        } )        
    })

    it(`User is able to delete collection`, async function() {
        await collectionsPage.treeView.openItemMenu('automation - collect me')
        await collectionsPage.treeView.selectItemMenuItem('Delete Collection')
        await deleteCollectionModal.assertAtPage()
        await deleteCollectionModal.clickButton('Delete')
        await common.waitForTimeout(2000)
        
        chai.expect(
            await collectionsPage.getListedCollections()
        ).to.not.include.members([
            "automation - collect me"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})