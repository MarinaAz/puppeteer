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
const DeletionsPage = require("../pages/DeletionsPage")
const CreateDeletionSetModal = require("../pages/modals/CreateDeletionSetModal")
const EditDeletionSetModal = require("../pages/modals/EditDeletionSetModal")
const DeleteSetModal = require("../pages/modals/DeleteSetModal")
const AddToADeletionModal = require("../pages/modals/AddToADeletionModal")

describe('Deletion Sets (Deletion Page) - create, edit, move and delete folder, subfolder and deletion from left pane', async function () {
    let loginUtil    
    let projectNavigation
    let deletionsPage
    let browserHelper
    let createDeletionSetModal
    let createFolderModal
    let deleteFolderModal
    let editFolderModal
    let editDeletionSetModal
    let deleteSetModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        deletionsPage = new DeletionsPage(browserHelper.browser, browserHelper.page)
        createDeletionSetModal = new CreateDeletionSetModal(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        editFolderModal = new EditFolderModal(browserHelper.browser, browserHelper.page)
        editDeletionSetModal = new EditDeletionSetModal(browserHelper.browser, browserHelper.page)
        deleteSetModal = new DeleteSetModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create a folder from Deletions menu', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Deletions')
        await deletionsPage.assertAtPage()
        await deletionsPage.clickCreateButton('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('new folder')
        await createFolderModal.typeDescription('new description')
        await createFolderModal.clickButton('Create')        
        await common.waitForTimeout(500)
        chai.expect(
            await deletionsPage.getListedDeletions()
        ).to.include.members([
            "Deletion Sets",
            "new folder"
        ])
    })

    it('User is able to create a subfolder from Deletions menu', async function() {
        await deletionsPage.assertAtPage()        
        await deletionsPage.treeView.openItemMenu('new folder')        
        await deletionsPage.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('new subfolder')
        await createFolderModal.typeDescription('new subdescription')
        await createFolderModal.clickButton('Create')     
        await common.waitForTimeout(500)
        chai.expect(
            await deletionsPage.getListedDeletions()
        ).to.include.members([
            "Deletion Sets",
            "new folder",
            "new subfolder",
        ])
    })

    it('User is able to create a deletion without checkboxes from Deletions menu', async function() {
        await deletionsPage.assertAtPage()        
        await deletionsPage.treeView.openItemMenu('Deletion Sets')        
        await deletionsPage.treeView.selectItemMenuItem('New Deletion')
        await createDeletionSetModal.assertAtPage()
        await createDeletionSetModal.typeName('new deletion')
        await createDeletionSetModal.typeDesc('del description')
        await createDeletionSetModal.clickButton('Create')        
        await common.waitForTimeout(500)
        chai.expect(
            await deletionsPage.getListedDeletions()
        ).to.include.members([
            "Deletion Sets",
            "new folder",
            "new subfolder",
            "new deletion"
        ])
    })

    it('User is able to edit a folder', async function() {
        await deletionsPage.assertAtPage()
        await deletionsPage.treeView.openItemMenu('new subfolder')
        await deletionsPage.treeView.selectItemMenuItem('Edit Folder')
        await editFolderModal.assertAtPage()
        await common.waitForTimeout(1000)
        await editFolderModal.typeName('EDITED folder')
        await editFolderModal.typeDescription('it was edited')
        await editFolderModal.clickButton('Save')
        chai.expect(
            await deletionsPage.getListedDeletions()
        ).to.include.members([
            "EDITED folder"
        ])
    })

    it('User is able to move folder to the root, to other folders and subfolders', async function() {
        await deletionsPage.assertAtPage()
        await deletionsPage.treeView.selectItem('EDITED folder')
        //to the root
        await deletionsPage.treeView.nestField('EDITED folder', 'Deletion Sets')        
        chai.expect(
            await deletionsPage.treeView.isItemFoldered('EDITED folder')
        ).to.be.false

        await deletionsPage.treeView.selectItem('EDITED folder')
        //to other folder
        await deletionsPage.treeView.nestField('EDITED folder', 'new folder') 
        chai.expect(
            await deletionsPage.treeView.isItemFoldered('EDITED folder')
        ).to.be.true
    })

    it('User is able to edit deletion', async function() {
        await deletionsPage.assertAtPage()
        await deletionsPage.treeView.openItemMenu('new deletion')
        await deletionsPage.treeView.selectItemMenuItem('Edit Deletion')
        await editDeletionSetModal.assertAtPage()
        await common.waitForTimeout(1000)
        await editDeletionSetModal.typeName('EDITED deletion')
        await editDeletionSetModal.typeDescription('it was edited')
        await editDeletionSetModal.clickButton('Save')
        chai.expect(
            await deletionsPage.getListedDeletions()
        ).to.include.members([
            "EDITED deletion"
        ])
    })

    it('User is able to move collection', async function() {
        await deletionsPage.assertAtPage()
        await deletionsPage.treeView.selectItem('EDITED deletion')
        //to other folder
        await deletionsPage.treeView.nestField('EDITED deletion','new folder')
        chai.expect(
            await deletionsPage.treeView.isItemFoldered('EDITED deletion')
        ).to.be.true

        await deletionsPage.treeView.selectItem('EDITED deletion')
        //to the root
        await deletionsPage.treeView.nestField('EDITED deletion', 'Deletion Sets')
        chai.expect(
            await deletionsPage.treeView.isItemFoldered('EDITED deletion')
        ).to.be.false
    })
     
    it('User is able to delete folders and deletion from Deletions menu', async function() {        
        await deletionsPage.assertAtPage()
        await deletionsPage.treeView.openItemMenu('EDITED folder')
        await deletionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await deletionsPage.treeView.openItemMenu('new folder')
        await deletionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await deletionsPage.treeView.openItemMenu('EDITED deletion')
        await deletionsPage.treeView.selectItemMenuItem('Delete Set')
        await deleteSetModal.assertAtPage()
        await deleteSetModal.clickDeleteButton()
        chai.expect(
            await deletionsPage.getListedDeletions()
        ).to.not.include.members([
            "new folder",
            "EDITED folder",
            "EDITED deletion"
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Deletion Sets (Deletion Page) - Create folders, subfolders and deletion and add documents to deletion from Preservations Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let preservationsPage
    let addToADeletionModal
    let deletionsPage
    let createDeletionSetModal
    let deleteSetModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        addToADeletionModal = new AddToADeletionModal(browserHelper.browser, browserHelper.page)
        deletionsPage = new DeletionsPage(browserHelper.browser, browserHelper.page)
        createDeletionSetModal = new CreateDeletionSetModal(browserHelper.browser, browserHelper.page)
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        deleteSetModal = new DeleteSetModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create folders, subfolders and deletetion with "Override Preservations" checkbox only and add documents from Preservation sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.selectItem('master preservation')
        await preservationsPage.clickToolbarButton('Actions')
        await preservationsPage.clickActionMenuItem('Delete All')

        //open Add to a deletion modal
        await addToADeletionModal.assertAtPage()
        await addToADeletionModal.treeView.openItemMenu('Deletion Sets')
        await addToADeletionModal.treeView.selectItemMenuItem('New Deletion')
        
        //open create deletion set modal
        await createDeletionSetModal.assertAtPage()
        await createDeletionSetModal.typeName('deletion from preservation')
        await createDeletionSetModal.typeDesc('del desc from preservation')
        // check Override Preservations checkbox
        await createDeletionSetModal.checkOverridePreservationsCheckbox()
        await createDeletionSetModal.clickButton('Create') 
        
        //create folder
        await addToADeletionModal.treeView.openItemMenu('deletion from preservation')
        await addToADeletionModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from preservation')
        await createFolderModal.typeDescription('desc from preservation')
        await createFolderModal.clickButton('Create')

        //create subfolder
        await addToADeletionModal.treeView.openItemMenu('folder from preservation')
        await addToADeletionModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from preservation')
        await createFolderModal.typeDescription('sub desc from preservation')
        await createFolderModal.clickButton('Create')

        //add to a deletion modal closes and documents adds to the deletion 
        await addToADeletionModal.treeView.selectItem('deletion from preservation')
        await addToADeletionModal.clickButton('Save')
        await common.waitForTimeout(2000)
    })
    
    it('Verify that folders and deletion are created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Deletions')
        await deletionsPage.assertAtPage()
        await deletionsPage.treeView.expandItem('folder from preservation')
        chai.expect(
            await deletionsPage.getListedDeletions()
        ).to.include.members([
            "deletion from preservation",
            "folder from preservation",
            "sub from preservation"
        ])
        await deletionsPage.treeView.selectItem('deletion from preservation')
        chai.expect(
            await deletionsPage.documentList.getDocumentNames()
        ).to.include.members(['marina test.txt'])
    })

    it('User is able to delete folders and deletion', async function() {
        await deletionsPage.assertAtPage()
        await deletionsPage.treeView.openItemMenu('sub from preservation')
        await deletionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await deletionsPage.treeView.openItemMenu('folder from preservation')
        await deletionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await deletionsPage.treeView.openItemMenu('deletion from preservation')
        await deletionsPage.treeView.selectItemMenuItem('Delete Set')
        await deleteSetModal.assertAtPage()
        await deleteSetModal.clickDeleteButton()
        chai.expect(
            await deletionsPage.getListedDeletions()
        ).to.not.include.members([
            "deletion from preservation",
            "folder from preservation",
            "sub from preservation"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Deletion Sets (Deletion Page) - Create folders, subfolders and deletion and add documents to deletion from Collections Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let addToADeletionModal
    let deletionsPage
    let collectionsPage
    let createDeletionSetModal
    let deleteSetModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        addToADeletionModal = new AddToADeletionModal(browserHelper.browser, browserHelper.page)
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)
        createDeletionSetModal = new CreateDeletionSetModal(browserHelper.browser, browserHelper.page)
        deleteSetModal = new DeleteSetModal(browserHelper.browser, browserHelper.page)
        deletionsPage = new DeletionsPage(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create folders, subfolders and deletion with "Add Full Container" checkbox only and add documents from Collections sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.selectItem('master collection')
        await collectionsPage.clickToolbarButton('Actions')
        await collectionsPage.clickActionMenuItem('Delete All')

        //open Add to a deletion modal
        await addToADeletionModal.assertAtPage()
        await addToADeletionModal.treeView.openItemMenu('Deletion Sets')
        await addToADeletionModal.treeView.selectItemMenuItem('New Deletion')
        
        //open create deletion set modal
        await createDeletionSetModal.assertAtPage()
        await createDeletionSetModal.typeName('deletion from collection')
        await createDeletionSetModal.typeDesc('del desc from collection')
        // check Add Full Container checkbox
        await createDeletionSetModal.checkAddFullContainersCheckbox()
        await createDeletionSetModal.clickButton('Create') 
        
        //create folder
        await addToADeletionModal.treeView.openItemMenu('deletion from collection')
        await addToADeletionModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from collection')
        await createFolderModal.typeDescription('desc from collection')
        await createFolderModal.clickButton('Create')

        //create subfolder
        await addToADeletionModal.treeView.openItemMenu('folder from collection')
        await addToADeletionModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from collection')
        await createFolderModal.typeDescription('sub desc from collection')
        await createFolderModal.clickButton('Create')

        //add to a deletion modal closes and documents adds to the deletion 
        await addToADeletionModal.treeView.selectItem('deletion from collection')
        await addToADeletionModal.clickButton('Save')
        await common.waitForTimeout(2000)
    })
    
    it('Verify that folders and deletion are created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Deletions')
        await deletionsPage.assertAtPage()
        await deletionsPage.treeView.expandItem('folder from collection')
        chai.expect(
            await deletionsPage.getListedDeletions()
        ).to.include.members([
            "deletion from collection",
            "folder from collection",
            "sub from collection"
        ])
        await deletionsPage.treeView.selectItem('deletion from collection')
        chai.expect(
            await deletionsPage.documentList.getDocumentNames()
        ).to.include.members(['marina test.txt'])
    })

    it('User is able to delete folders and deletion', async function() {
        await deletionsPage.assertAtPage()
        await deletionsPage.treeView.openItemMenu('sub from collection')
        await deletionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await deletionsPage.treeView.openItemMenu('folder from collection')
        await deletionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await deletionsPage.treeView.openItemMenu('deletion from collection')
        await deletionsPage.treeView.selectItemMenuItem('Delete Set')
        await deleteSetModal.assertAtPage()
        await deleteSetModal.clickDeleteButton()
        chai.expect(
            await deletionsPage.getListedDeletions()
        ).to.not.include.members([
            "deletion from collection",
            "folder from collection",
            "sub from collection"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Deletion Sets (Deletion Page) - Create folders, subfolders and deletion and add documents from Folders Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let addToADeletionModal
    let deletionsPage
    let createDeletionSetModal
    let deleteSetModal
    let foldersPage

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        addToADeletionModal = new AddToADeletionModal(browserHelper.browser, browserHelper.page)
        deletionsPage = new DeletionsPage(browserHelper.browser, browserHelper.page)
        createDeletionSetModal = new CreateDeletionSetModal(browserHelper.browser, browserHelper.page)
        deleteSetModal = new DeleteSetModal(browserHelper.browser, browserHelper.page)
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
        await foldersPage.clickActionMenuItem('Delete All')

        //open Add to a deletion modal
        await addToADeletionModal.assertAtPage()
        await addToADeletionModal.treeView.openItemMenu('Deletion Sets')
        await addToADeletionModal.treeView.selectItemMenuItem('New Deletion')
        
        //open create deletion set modal
        await createDeletionSetModal.assertAtPage()
        await createDeletionSetModal.typeName('deletion from folder')
        await createDeletionSetModal.typeDesc('del desc from folder')
        await createDeletionSetModal.clickButton('Create') 
        
        //create folder
        await addToADeletionModal.treeView.openItemMenu('deletion from folder')
        await addToADeletionModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from folder')
        await createFolderModal.typeDescription('desc from folder')
        await createFolderModal.clickButton('Create')

        //create subfolder
        await addToADeletionModal.treeView.openItemMenu('folder from folder')
        await addToADeletionModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from folder')
        await createFolderModal.typeDescription('sub desc from folder')
        await createFolderModal.clickButton('Create')

        //add to a deletion modal closes and documents added to the deletion 
        await addToADeletionModal.treeView.selectItem('deletion from folder')
        await addToADeletionModal.clickButton('Save')
        await common.waitForTimeout(2000)
    })
    
    it('Verify that folders and deletion are created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Deletions')
        await deletionsPage.assertAtPage()
        await deletionsPage.treeView.expandItem('folder from folder')
        chai.expect(
            await deletionsPage.getListedDeletions()
        ).to.include.members([
            "deletion from folder",
            "folder from folder",
            "sub from folder"
        ])
        await deletionsPage.treeView.selectItem('deletion from folder')
        chai.expect(
            await deletionsPage.documentList.getDocumentNames()
        ).to.include.members(['marina test.txt'])
    })

    it('User is able to delete folders and deletion', async function() {
        await deletionsPage.assertAtPage()
        await deletionsPage.treeView.openItemMenu('sub from folder')
        await deletionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await deletionsPage.treeView.openItemMenu('folder from folder')
        await deletionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await deletionsPage.treeView.openItemMenu('deletion from folder')
        await deletionsPage.treeView.selectItemMenuItem('Delete Set')
        await deleteSetModal.assertAtPage()
        await deleteSetModal.clickDeleteButton()
        chai.expect(
            await deletionsPage.getListedDeletions()
        ).to.not.include.members([
            "deletion from folder",
            "folder from folder",
            "sub from folder"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Deletion Sets (Deletion Page) - Create folders, subfolders and deletion and add documents from Policies Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let addToADeletionModal
    let deletionsPage
    let createDeletionSetModal
    let deleteSetModal
    let policiesPage

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        addToADeletionModal = new AddToADeletionModal(browserHelper.browser, browserHelper.page)
        deletionsPage = new DeletionsPage(browserHelper.browser, browserHelper.page)
        createDeletionSetModal = new CreateDeletionSetModal(browserHelper.browser, browserHelper.page)
        deleteSetModal = new DeleteSetModal(browserHelper.browser, browserHelper.page)
        policiesPage = new PoliciesPage(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create folders, subfolders and deletion and add documents from Policy sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Policies')
        await policiesPage.assertAtPage()
        await policiesPage.treeView.selectItem('master policy')
        await policiesPage.clickToolbarButton('Actions')
        await policiesPage.clickActionMenuItem('Delete All')
        
        //open Add to a deletion modal
        await addToADeletionModal.assertAtPage()
        await addToADeletionModal.treeView.openItemMenu('Deletion Sets')
        await addToADeletionModal.treeView.selectItemMenuItem('New Deletion')
        
        //open create deletion set modal
        await createDeletionSetModal.assertAtPage()
        await createDeletionSetModal.typeName('deletion from policy')
        await createDeletionSetModal.typeDesc('del desc from policy')
        await createDeletionSetModal.clickButton('Create') 
        
        //create folder
        await addToADeletionModal.treeView.openItemMenu('deletion from policy')
        await addToADeletionModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from policy')
        await createFolderModal.typeDescription('desc from policy')
        await createFolderModal.clickButton('Create')

        //create subfolder
        await addToADeletionModal.treeView.openItemMenu('folder from policy')
        await addToADeletionModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from policy')
        await createFolderModal.typeDescription('sub desc from policy')
        await createFolderModal.clickButton('Create')

        //add to a deletion modal closes and documents added to the deletion 
        await addToADeletionModal.treeView.selectItem('deletion from policy')
        await addToADeletionModal.clickButton('Save')
        await common.waitForTimeout(2000)
    })
    
    it('Verify that folders and deletion created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Deletions')
        await deletionsPage.assertAtPage()
        await deletionsPage.treeView.expandItem('folder from policy')
        chai.expect(
            await deletionsPage.getListedDeletions()
        ).to.include.members([
            "deletion from policy",
            "folder from policy",
            "sub from policy"
        ])
        await deletionsPage.treeView.selectItem('deletion from policy')
        chai.expect(
            await deletionsPage.documentList.getDocumentNames()
        ).to.include.members(['marina test.txt'])
    })

    it('User is able to delete folders and deletion', async function() {
        await deletionsPage.assertAtPage()
        await deletionsPage.treeView.openItemMenu('sub from policy')
        await deletionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await deletionsPage.treeView.openItemMenu('folder from policy')
        await deletionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await deletionsPage.treeView.openItemMenu('deletion from policy')
        await deletionsPage.treeView.selectItemMenuItem('Delete Set')
        await deleteSetModal.assertAtPage()
        await deleteSetModal.clickDeleteButton()
        chai.expect(
            await deletionsPage.getListedDeletions()
        ).to.not.include.members([
            "deletion from policy",
            "folder from policy",
            "sub from policy"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Deletion Sets (Deletion Page)- Create folders, subfolders and deletion and add documents from Exports Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let addToADeletionModal
    let deletionsPage
    let deleteSetModal
    let createDeletionSetModal
    let exportsPage

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        addToADeletionModal = new AddToADeletionModal(browserHelper.browser, browserHelper.page)
        deleteSetModal = new DeleteSetModal(browserHelper.browser, browserHelper.page)
        createDeletionSetModal = new CreateDeletionSetModal(browserHelper.browser, browserHelper.page)
        deletionsPage = new DeletionsPage(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create folders, subfolders and deletion with "Override Preservations" and "Add Full Containers" checkboxes and add documents from Exports sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.selectItem('master export')
        await exportsPage.clickToolbarButton('Actions')
        await exportsPage.clickActionMenuItem('Delete All')

        //open Add to a deletion modal
        await addToADeletionModal.assertAtPage()
        await addToADeletionModal.treeView.openItemMenu('Deletion Sets')
        await addToADeletionModal.treeView.selectItemMenuItem('New Deletion')
       
        //open create deletion set modal
        await createDeletionSetModal.assertAtPage()
        await createDeletionSetModal.typeName('deletion from export')
        await createDeletionSetModal.typeDesc('del desc from export')
        // check 'Override Preservations' and 'Add Full Containers' checkboxes
        await createDeletionSetModal.checkOverridePreservationsCheckbox()
        await createDeletionSetModal.checkAddFullContainersCheckbox()
        await createDeletionSetModal.clickButton('Create') 
       
        //create folder
        await addToADeletionModal.treeView.openItemMenu('deletion from export')
        await addToADeletionModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from export')
        await createFolderModal.typeDescription('desc from export')
        await createFolderModal.clickButton('Create')

        //create subfolder
        await addToADeletionModal.treeView.openItemMenu('folder from export')
        await addToADeletionModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from export')
        await createFolderModal.typeDescription('sub desc from export')
        await createFolderModal.clickButton('Create')

        //add to a deletion modal closes and documents added to the deletion 
        await addToADeletionModal.treeView.selectItem('deletion from export')
        await addToADeletionModal.clickButton('Save')
        await common.waitForTimeout(1000)
    })
    
    it('Verify that folders and deletion created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Deletions')
        await deletionsPage.assertAtPage()
        await deletionsPage.treeView.expandItem('folder from export')
        chai.expect(
            await deletionsPage.getListedDeletions()
        ).to.include.members([
            "deletion from export",
            "folder from export",
            "sub from export"
        ])
        await deletionsPage.treeView.selectItem('deletion from export')
        chai.expect(
            await deletionsPage.documentList.getDocumentNames()
        ).to.have.members(['marina test.txt'])
    })

    it('User is able to delete folders and deletion', async function() {
        await deletionsPage.assertAtPage()
        await deletionsPage.treeView.openItemMenu('sub from export')
        await deletionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await deletionsPage.treeView.openItemMenu('folder from export')
        await deletionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await deletionsPage.treeView.openItemMenu('deletion from export')
        await deletionsPage.treeView.selectItemMenuItem('Delete Set')
        await deleteSetModal.assertAtPage()
        await deleteSetModal.clickDeleteButton()
        chai.expect(
            await deletionsPage.getListedDeletions()
        ).to.not.include.members([
            "deletion from export",
            "folder from export",
            "sub from export"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Deletion Sets (Deletion Page) - Create and delete folders, subfolders and deletion, add documets from Explorer Graph', async function() {
    let loginUtil    
    let projectNavigation
    let deletionsPage
    let browserHelper
    let deleteFolderModal
    let explorerPage
    let addToADeletionModal
    let createFolderModal
    let createDeletionSetModal
    let deleteSetModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        deletionsPage = new DeletionsPage(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        explorerPage = new ExplorerPage(browserHelper.browser, browserHelper.page) 
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        addToADeletionModal = new AddToADeletionModal(browserHelper.browser, browserHelper.page)
        createDeletionSetModal = new CreateDeletionSetModal(browserHelper.browser, browserHelper.page)
        deleteSetModal = new DeleteSetModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject')) 
    })

    it('User is able to create a folder, subfolder and deletion and add documents from Explorer Graph', async function () {
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
        await explorerPage.clickActionMenuItem('Delete')

        //open Add to a deletion modal
        await addToADeletionModal.assertAtPage()
        await addToADeletionModal.treeView.openItemMenu('Deletion Sets')
        await addToADeletionModal.treeView.selectItemMenuItem('New Deletion')
       
        //open create deletion set modal
        await createDeletionSetModal.assertAtPage()
        await createDeletionSetModal.typeName('deletion from explorer graph')
        await createDeletionSetModal.typeDesc('del desc from explorer graph')
        await createDeletionSetModal.clickButton('Create') 
       
        //create folder
        await addToADeletionModal.treeView.openItemMenu('deletion from explorer graph')
        await addToADeletionModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from explorer graph')
        await createFolderModal.typeDescription('desc from explorer graph')
        await createFolderModal.clickButton('Create')

        //create subfolder
        await addToADeletionModal.treeView.openItemMenu('folder from explorer graph')
        await addToADeletionModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from explorer graph')
        await createFolderModal.typeDescription('sub desc from explorer graph')
        await createFolderModal.clickButton('Create')

        //add to a deletion modal closes and documents added to the deletion 
        await addToADeletionModal.treeView.selectItem('deletion from explorer graph')
        await addToADeletionModal.clickButton('Save')
        await common.waitForTimeout(1000)
    })
    
    it('Verify that folders and deletion created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Deletions')
        await deletionsPage.assertAtPage()
        await deletionsPage.treeView.expandItem('folder from explorer graph')
        chai.expect(
            await deletionsPage.getListedDeletions()
        ).to.include.members([
            "deletion from explorer graph",
            "folder from explorer graph",
            "sub from explorer graph"
        ])
        await deletionsPage.treeView.selectItem('deletion from explorer graph')
        chai.expect(
            await deletionsPage.documentList.getDocumentsCount()
        ).to.equal('Locations:\n1')
    })

    it('User is able to delete folders', async function() {
        await deletionsPage.assertAtPage()
        await deletionsPage.treeView.openItemMenu('sub from explorer graph')
        await deletionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await deletionsPage.treeView.openItemMenu('folder from explorer graph')
        await deletionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await deletionsPage.treeView.openItemMenu('deletion from explorer graph')
        await deletionsPage.treeView.selectItemMenuItem('Delete Set')
        await deleteSetModal.assertAtPage()
        await deleteSetModal.clickDeleteButton()
        chai.expect(
            await deletionsPage.getListedDeletions()
        ).to.not.include.members([
            "deletion from explorer graph",
            "folder from explorer graph",
            "sub from explorer graph"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Deletion Sets - Create and delete folders, subfolders and deletion, add documets to deletion from Search Page', async function() {
    let loginUtil    
    let projectNavigation
    let deletionsPage
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let addToADeletionModal
    let searchPage
    let searchResultsPage
    let createDeletionSetModal
    let deleteSetModal
    let topNavigation

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        deletionsPage = new DeletionsPage(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page) 
        addToADeletionModal = new AddToADeletionModal(browserHelper.browser, browserHelper.page)
        searchPage = new SearchPage(browserHelper.browser, browserHelper.page)
        searchResultsPage = new SearchResultsPage(browserHelper.browser, browserHelper.page)
        createDeletionSetModal = new CreateDeletionSetModal(browserHelper.browser, browserHelper.page)
        deleteSetModal = new DeleteSetModal(browserHelper.browser, browserHelper.page)
        topNavigation = new TopNavigation(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create a folder, subfolder and deletion and add documents from Search Page', async function() {
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
        await searchResultsPage.clickActionMenuItem('Delete Selected')

        //open Add to a deletion modal
        await addToADeletionModal.assertAtPage()
        await addToADeletionModal.treeView.openItemMenu('Deletion Sets')
        await addToADeletionModal.treeView.selectItemMenuItem('New Deletion')
       
        //open create deletion set modal
        await createDeletionSetModal.assertAtPage()
        await createDeletionSetModal.typeName('deletion from search')
        await createDeletionSetModal.typeDesc('del desc from search')
        await createDeletionSetModal.clickButton('Create') 
       
        //create folder
        await addToADeletionModal.treeView.openItemMenu('deletion from search')
        await addToADeletionModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from search')
        await createFolderModal.typeDescription('desc from search')
        await createFolderModal.clickButton('Create')

        //create subfolder
        await addToADeletionModal.treeView.openItemMenu('folder from search')
        await addToADeletionModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from search')
        await createFolderModal.typeDescription('sub desc from search')
        await createFolderModal.clickButton('Create')

        //add to a deletion modal closes and documents added to the deletion 
        await addToADeletionModal.treeView.selectItem('deletion from search')
        await addToADeletionModal.clickButton('Save')
        await common.waitForTimeout(1000)
    })

    it('Verify that folders created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Deletions')
        await deletionsPage.assertAtPage()
        await deletionsPage.treeView.expandItem('folder from search')
        chai.expect(
            await deletionsPage.getListedDeletions()
        ).to.include.members([
            "deletion from search",
            "folder from search",
            "sub from search"
        ])
        await deletionsPage.treeView.selectItem('deletion from search')
        chai.expect(
            await deletionsPage.documentList.getDocumentsCount()
        ).to.equal('Locations:\n6')
    })

    it('Approve and Start deletion', async function() {
        await deletionsPage.assertAtPage()
        await deletionsPage.treeView.selectItem('deletion from search')
        await deletionsPage.clickDocumentDetailsLink()

        // info value before start
        chai.expect(
            await deletionsPage.getValueOfStatus('Deletion Status:')
        ).to.equal('New')
        await deletionsPage.clickDetailsHeaderButton('Start')
        await common.waitForTimeout(500)

         // info value after start
         chai.expect(
            await deletionsPage.getValueOfStatus('Deletion Status:')
        ).to.equal('Awaiting Approval')

        // logout and login with approval account
        await loginUtil.logout()
        await loginUtil.loginAsRGApprover(config.get('rgProject'))
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Deletions')
        await deletionsPage.assertAtPage()
        await deletionsPage.treeView.selectItem('deletion from search')
        await deletionsPage.clickDocumentDetailsLink()
        await deletionsPage.clickDetailsHeaderButton('Approve')
        await common.waitForTimeout(500)

        // info value after approve
        chai.expect(
            await deletionsPage.getValueOfStatus('Deletion Status:')
        ).to.equal('In Progress')
        
    })

    it('Verify that New Documents cannot be added into Started Deletion', async function() {
        // back to primery account
        await loginUtil.logout()
        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')

        // add a new document to started deletion
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideSearchPredicate('Full Text Element')
        await searchPage.clickFullTextElementClickToInsert()
        await searchPage.typeFullTextElementTerm('test')
        await searchPage.clickSearchButton()
        await searchResultsPage.assertAtPage()
        await searchResultsPage.documentList.clickNthDocumentCheckbox(0)
        await searchResultsPage.clickToolbarButton("Actions")
        await searchResultsPage.clickActionMenuItem('Delete Selected')

        // open Add to a deletio modal
        await addToADeletionModal.assertAtPage()
        await addToADeletionModal.treeView.selectItem('deletion from search')
        await addToADeletionModal.clickButton('Save')
        chai.expect(
            await topNavigation.getToastMessage()
        ).to.equal('Documents could not be added to the deletion')
    })

    it('Stop deletion', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Deletions')
        await deletionsPage.assertAtPage()
        await deletionsPage.treeView.selectItem('deletion from search')
        await deletionsPage.clickDocumentDetailsLink()
        chai.expect(
            await deletionsPage.getValueOfStatus('Deletion Status:')
        ).to.equal('In Progress')
        await deletionsPage.clickDetailsHeaderButton('Stop')
        await common.waitForTimeout(500)
        await topNavigation.waitForToastMessageToContain('Deletion has stopped')    
        await deletionsPage.closeInfoPane()
        await deletionsPage.page.reload()
        await common.waitForTimeout(1000)
    })

    it('Verify that New Documents cannot be added into Stopped Deletion', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')

        // add a new document to started deletion
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideSearchPredicate('Full Text Element')
        await searchPage.clickFullTextElementClickToInsert()
        await searchPage.typeFullTextElementTerm('test')
        await searchPage.clickSearchButton()
        await searchResultsPage.assertAtPage()
        await searchResultsPage.documentList.clickNthDocumentCheckbox(0)
        await searchResultsPage.clickToolbarButton("Actions")
        await searchResultsPage.clickActionMenuItem('Delete Selected')

        // open Add to a deletion modal
        await addToADeletionModal.assertAtPage()
        await addToADeletionModal.treeView.selectItem('deletion from search')
        await addToADeletionModal.clickButton('Save')
        chai.expect(
            await topNavigation.getToastMessage()
        ).to.equal('Documents could not be added to the deletion')
    })

    it('User is able to delete folders', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Deletions')
        await deletionsPage.assertAtPage()
        await deletionsPage.treeView.expandItem('folder from search')
        await deletionsPage.treeView.openItemMenu('sub from search')
        await deletionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await deletionsPage.treeView.openItemMenu('folder from search')
        await deletionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await deletionsPage.treeView.openItemMenu('deletion from search')
        await deletionsPage.treeView.selectItemMenuItem('Delete Set')
        await deleteSetModal.assertAtPage()
        await deleteSetModal.clickDeleteButton()
        chai.expect(
            await deletionsPage.getListedDeletions()
        ).to.not.include.members([
            "deletion from search",
            "folder from search",
            "sub from search"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Deletion Sets (Deletion page) - Create and delete folders, subfolders and deletion, add documets to deletion from Explorer Views', async function() {
    let loginUtil    
    let projectNavigation
    let deletionsPage
    let browserHelper
    let deleteFolderModal
    let explorerPage
    let explorerDocumentPage
    let deleteSetModal
    let addToADeletionModal
    let createDeletionSetModal
    let createFolderModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        deletionsPage = new DeletionsPage(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        explorerPage = new ExplorerPage(browserHelper.browser, browserHelper.page) 
        explorerDocumentPage = new ExplorerDocumentPage(browserHelper.browser, browserHelper.page)
        deleteSetModal = new DeleteSetModal(browserHelper.browser, browserHelper.page)
        addToADeletionModal = new AddToADeletionModal(browserHelper.browser, browserHelper.page) 
        createDeletionSetModal = new CreateDeletionSetModal(browserHelper.browser, browserHelper.page) 
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject')) 
    })

    it('User is able to create a folder, subfolder and deletion and add documents from Explorer Views', async function () {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Explorer')
        await explorerPage.assertAtPage()
        await explorerPage.openActionMenu()
        await explorerPage.clickActionMenuItem('Delete')

        //open add to a deletion modal
        await addToADeletionModal.assertAtPage()
        await addToADeletionModal.treeView.openItemMenu('Deletion Sets')
        await addToADeletionModal.treeView.selectItemMenuItem('New Deletion')

        //open create deletion modal
        await createDeletionSetModal.assertAtPage()
        await createDeletionSetModal.typeName('deletion from explorer view')
        await createDeletionSetModal.typeDesc('description from explorer view')
        await createDeletionSetModal.clickButton('Create')

        //create folder
        await addToADeletionModal.treeView.openItemMenu('Deletion Sets')
        await addToADeletionModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from explorer view')
        await createFolderModal.typeDescription('desc from explorer view')
        await createFolderModal.clickButton('Create')
        
        //create subfolder
        await addToADeletionModal.treeView.openItemMenu('folder from explorer view')
        await addToADeletionModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from explorer view')
        await createFolderModal.typeDescription('sub desc from explorer view')
        await createFolderModal.clickButton('Create')
        await addToADeletionModal.assertAtPage()
        await addToADeletionModal.clickButton('Cancel')

        //add document to folder
        await explorerPage.assertAtPage()
        await explorerPage.openActionMenu()
        await explorerPage.clickActionMenuItem('View Document Set')
        await explorerPage.waitForTaskCountToBeZero('0')
        await common.waitForTimeout(6000)
        await explorerDocumentPage.assertAtPage()
        await explorerDocumentPage.documentList.clickNthDocumentCheckbox(0)
        await explorerDocumentPage.clickToolbarButton('Actions')
        await explorerDocumentPage.clickActionMenuItem('Delete Selected')
        await addToADeletionModal.assertAtPage()
        await addToADeletionModal.treeView.openItemMenu('Deletion Sets')
        await addToADeletionModal.treeView.selectItemMenuItem('New Deletion')
        
        //open creat deletion set modal
        await createDeletionSetModal.assertAtPage()
        await createDeletionSetModal.typeName('deletion from view')
        await createDeletionSetModal.typeDesc('description from view')
        await createDeletionSetModal.clickButton('Create') 
  
        //create folder
        await addToADeletionModal.treeView.openItemMenu('Deletion Sets')
        await addToADeletionModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from view')
        await createFolderModal.typeDescription('desc from view')
        await createFolderModal.clickButton('Create')
   
        //create subfolder
        await addToADeletionModal.treeView.openItemMenu('folder from view')
        await addToADeletionModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from view')
        await createFolderModal.typeDescription('sub desc from view')
        await createFolderModal.clickButton('Create')

        //add documents to folder
        await addToADeletionModal.treeView.selectItem('deletion from view')
        await addToADeletionModal.clickButton('Save')
        await common.waitForTimeout(1000)
    })
    
    it('Verify that folders and deletion are created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Deletions')
        await deletionsPage.assertAtPage()
        await deletionsPage.treeView.expandItem('folder from explorer view')
        await deletionsPage.treeView.expandItem('folder from view')
        chai.expect(
            await deletionsPage.getListedDeletions()
        ).to.include.members([
            "deletion from explorer view",
            "folder from explorer view",
            "sub from explorer view",
            "deletion from view",
            "folder from view",
            "sub from view"
        ])
        await deletionsPage.treeView.selectItem('deletion from view')
        chai.expect(
            await deletionsPage.documentList.getDocumentsCount()
        ).to.equal('Locations:\n1')
    })

    it('User is able to delete folders and deletions', async function() {
        await deletionsPage.assertAtPage()
        await deletionsPage.treeView.openItemMenu('sub from explorer view')
        await deletionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await deletionsPage.treeView.openItemMenu('folder from explorer view')
        await deletionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await deletionsPage.treeView.openItemMenu('deletion from explorer view')
        await deletionsPage.treeView.selectItemMenuItem('Delete Set')
        await deleteSetModal.assertAtPage()
        await deleteSetModal.clickDeleteButton()
        await deletionsPage.treeView.openItemMenu('sub from view')
        await deletionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await deletionsPage.treeView.openItemMenu('folder from view')
        await deletionsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await deletionsPage.treeView.openItemMenu('deletion from view')
        await deletionsPage.treeView.selectItemMenuItem('Delete Set')
        await deleteSetModal.assertAtPage()
        await deleteSetModal.clickDeleteButton()
        chai.expect(
            await deletionsPage.getListedDeletions()
        ).to.not.include.members([
            "deleteion from explorer view",
            "folder from explorer view",
            "sub from explorer view",
            "sub from view",
            "folder from view",
            "deletion from view"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})
