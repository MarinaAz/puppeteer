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
const EditFolderModal = require("../pages/modals/EditFolderModal")
const RemoveAllDocumentsModal = require("../pages/modals/RemoveAllDocumentsModal")
const TopNavigation = require("../pages/components/TopNavigation")
const ExplorerDocumentPage = require("../pages/ExplorerDocumentPage")

describe('Folder Sets (Folders page)- create and delete folder and subfolder from left pane', async function () {
    /** @type {LoginUtil} */
    let loginUtil
    /** @type {ProjectNavigation} */
    let projectNavigation
    /** @type {FoldersPage} */
    let foldersPage
    /** @type {BrowserHelper} */
    let browserHelper
    /** @type {CreateFolderModal} */
    let createFolderModal
    /** @type {DeleteFolderModal} */
    let deleteFolderModal
    /** @type {AddToAFolderModal} */
    let addToAFolderModal
    /** @type {EditFolderModal} */
    let editFolderModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        foldersPage = new FoldersPage(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        addToAFolderModal = new AddToAFolderModal(browserHelper.browser, browserHelper.page)
        editFolderModal = new EditFolderModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create a folder from Folders menu', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.clickCreateNewFolder()
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('new folder')
        await createFolderModal.typeDescription('new description')
        await createFolderModal.clickButton('Create')       
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "Folders",
            "new folder"
        ])
    })

    it('User is able to create a subfolder from Folders menu', async function() {
        await foldersPage.assertAtPage()        
        await foldersPage.treeView.openItemMenu('new folder')        
        await foldersPage.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('new subfolder')
        await createFolderModal.typeDescription('new subdescription')
        await createFolderModal.clickButton('Create')      
        await common.waitForTimeout(500)
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "Folders",
            "new folder",
            "new subfolder"
        ])
    })

    it('User is able to create a subfolder from subfolder in Folders menu', async function() {
        await foldersPage.assertAtPage()        
        await foldersPage.treeView.openItemMenu('new subfolder')        
        await foldersPage.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub subfolder')
        await createFolderModal.typeDescription('sub subdescription')
        await createFolderModal.clickButton('Create')       
        await common.waitForTimeout(500)
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "Folders",
            "new folder",
            "new subfolder",
            "sub subfolder"
        ])
    })


    it('User is able to edit a folder', async function() {
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('sub subfolder')
        await foldersPage.treeView.selectItemMenuItem('Edit Folder')
        await editFolderModal.assertAtPage()
        await common.waitForTimeout(500)
        await editFolderModal.typeName('EDITED folder')
        await editFolderModal.typeDescription('it was edited')
        await editFolderModal.clickButton('Save')
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "EDITED folder"
        ])
    })

    it('User is able to move folder to the root, to other folders and subfolders', async function() {
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('EDITED folder')
        //to the root
        await foldersPage.treeView.moveItemUp('EDITED folder', 'Folders')      

        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "Folders",
            "EDITED folder",
            "master folder",
            "new folder",
            "new subfolder"
        ])

        await foldersPage.treeView.selectItem('EDITED folder')
        //to other folder
        await foldersPage.treeView.moveItemDown('EDITED folder', 'new folder')
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "Folders",
            "master folder",
            "new folder",
            "EDITED folder",
            "new subfolder"
        ])

        await foldersPage.treeView.selectItem('EDITED folder')
        //to subfolder
        await foldersPage.treeView.moveItemDown('EDITED folder', 'new subfolder')
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "Folders",
            "master folder",
            "new folder",
            "new subfolder",
            "EDITED folder"
        ])
    })
     
    it('User is able to delete a folder from Folders menu', async function() {        
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('EDITED folder')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await foldersPage.treeView.openItemMenu('new subfolder')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await foldersPage.treeView.openItemMenu('new folder')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "new folder",
            "new subfolder",
            "EDITED folder"
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Folder Sets - Create, add documents remove documents from folder and delete folders and subfolders from Preservations Set', async function() {
    /** @type {LoginUtil} */
    let loginUtil
    /** @type {ProjectNavigation} */
    let projectNavigation
    /** @type {FoldersPage} */
    let foldersPage
    /** @type {BrowserHelper} */
    let browserHelper
    /** @type {CreateFolderModal} */
    let createFolderModal
    /** @type {DeleteFolderModal} */
    let deleteFolderModal
    /** @type {PreservationsPage} */
    let preservationsPage
    /** @type {AddToAFolderModal} */
    let addToAFolderModal
    /** @type {RemoveAllDocumentsModal} */
    let removeAllDocumentsModal
    /** @type {TopNavigation} */
    let topNavigation

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        foldersPage = new FoldersPage(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page) 
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        addToAFolderModal = new AddToAFolderModal(browserHelper.browser, browserHelper.page)
        removeAllDocumentsModal = new RemoveAllDocumentsModal(browserHelper.browser, browserHelper.page)
        topNavigation = new TopNavigation(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create folders, subfolders and add documents from Preservation sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.selectItem('master preservation')
        await preservationsPage.clickToolbarButton('Actions')
        await preservationsPage.clickActionMenuItem('Folder All')

        //open Add to a folder modal
        await addToAFolderModal.assertAtPage()
        await addToAFolderModal.treeView.openItemMenu('Folders')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')
        
        //open create folder modal
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from preservation')
        await createFolderModal.typeDescription('description from preservation')
        await createFolderModal.clickButton('Create')
        
        //create subfolder
        await addToAFolderModal.treeView.openItemMenu('folder from preservation')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from preservation')
        await createFolderModal.typeDescription('sub desc from preservation')
        await createFolderModal.clickButton('Create')

        //create folder modal closes and documents adds fo the folder
        await addToAFolderModal.clickButton('Folder')
    })
    
    it('Verify that folders created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.expandItem('folder from preservation')
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "folder from preservation",
            "sub from preservation"
        ])
        await foldersPage.treeView.selectItem('sub from preservation')
        chai.expect(
            await foldersPage.documentList.getDocumentNames()
        ).to.have.members(['marina test.txt'])
    })

    it('User is able to remove documents from Folders', async function() {
        await foldersPage.assertAtPage()
        // await foldersPage.treeView.expandItem('folder from preservation')
        await foldersPage.treeView.selectItem('sub from preservation')
        chai.expect(
            await foldersPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n1')
        await foldersPage.clickToolbarButton('Actions')
        await foldersPage.clickActionMenuItem('Remove All')        
        await removeAllDocumentsModal.assertAtPage()
        await removeAllDocumentsModal.clickButton('Remove')
        await topNavigation.waitForToastMessageToContain('Documents have been removed from Document Set')
        await foldersPage.treeView.selectItem('sub from preservation')        
        chai.expect(
            await foldersPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n0')
    })

    it('User is able to delete folders', async function() {
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('folder from preservation')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "folder from preservation",
            "sub from preservation"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Folder Sets - Create, add documents and delete folders and subfolders from Collections Set', async function() {
    let loginUtil    
    let projectNavigation
    let foldersPage
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let addToAFolderModal
    let collectionsPage

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        foldersPage = new FoldersPage(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page) 
        addToAFolderModal = new AddToAFolderModal(browserHelper.browser, browserHelper.page)
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create folders, subfolders and add documents from Collections sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.selectItem('master collection')
        await collectionsPage.clickToolbarButton('Actions')
        await collectionsPage.clickActionMenuItem('Folder All')

        //open Add to a folder modal
        await addToAFolderModal.assertAtPage()
        await addToAFolderModal.treeView.openItemMenu('Folders')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')
        
        //open create folder modal
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from collection')
        await createFolderModal.typeDescription('description from collection')
        await createFolderModal.clickButton('Create') 
        
        //create subfolder
        await addToAFolderModal.treeView.openItemMenu('folder from collection')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from collection')
        await createFolderModal.typeDescription('sub desc from collection')
        await createFolderModal.clickButton('Create') 

        //create folder modal closes and documents adds fo the folder
        await addToAFolderModal.clickButton('Folder')
    })
    
    it('Verify that folders created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.expandItem('folder from collection')
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "folder from collection",
            "sub from collection"
        ])
        await foldersPage.treeView.selectItem('sub from collection')
        chai.expect(
            await foldersPage.documentList.getDocumentNames()
        ).to.have.members(['marina test.txt'])
    })

    it('User is able to delete folders', async function() {
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('folder from collection')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "folder from collection",
            "sub from collection"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Folder Sets - Create, add documents and delete folders and subfolders from Folders Set', async function() {
    let loginUtil    
    let projectNavigation
    let foldersPage
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let addToAFolderModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        foldersPage = new FoldersPage(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page) 
        addToAFolderModal = new AddToAFolderModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create folders, subfolders and add documents from Folders sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('master folder')
        await foldersPage.clickToolbarButton('Actions')
        await foldersPage.clickActionMenuItem('Folder All')

        //open Add to a folder modal
        await addToAFolderModal.assertAtPage()
        await addToAFolderModal.treeView.openItemMenu('Folders')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')
        
        //open create folder modal
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from folders')
        await createFolderModal.typeDescription('description from folders')
        await createFolderModal.clickButton('Create') 
        
        //create subfolder
        await addToAFolderModal.treeView.openItemMenu('folder from folders')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from folders')
        await createFolderModal.typeDescription('sub desc from folders')
        await createFolderModal.clickButton('Create') 

        //create folder modal closes and documents adds fo the folder
        await addToAFolderModal.clickButton('Folder')
    })
    
    it('Verify that folders created, documents added', async function() {
        await foldersPage.assertAtPage()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "folder from folders",
            "sub from folders"
        ])
        await foldersPage.treeView.selectItem('sub from folders')
        await common.waitForTimeout(1000)
        chai.expect(
            await foldersPage.documentList.getDocumentNames()
        ).to.have.members(['marina test.txt'])
    })

    it('User is able to delete folders', async function() {
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('folder from folders')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "folder from folders",
            "sub from folders"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Folder Sets - Create, add documents and delete folders and subfolders from Policies Set', async function() {
    let loginUtil    
    let projectNavigation
    let foldersPage
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let addToAFolderModal
    let policiesPage

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        foldersPage = new FoldersPage(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page) 
        addToAFolderModal = new AddToAFolderModal(browserHelper.browser, browserHelper.page)
        policiesPage = new PoliciesPage(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create folders, subfolders and add documents from Policies set', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Policies')
        await policiesPage.assertAtPage()
        await policiesPage.treeView.selectItem('master policy')
        await policiesPage.clickToolbarButton('Actions')
        await policiesPage.clickActionMenuItem('Folder All')

        //open Add to a folder modal
        await addToAFolderModal.assertAtPage()
        await addToAFolderModal.treeView.openItemMenu('Folders')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')
        
        //open create folder modal
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from policies')
        await createFolderModal.typeDescription('description from policies')
        await createFolderModal.clickButton('Create') 
        
        //create subfolder
        await addToAFolderModal.treeView.openItemMenu('folder from policies')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from policies')
        await createFolderModal.typeDescription('sub desc from policies')
        await createFolderModal.clickButton('Create') 

        //create folder modal closes and documents adds fo the folder
        await addToAFolderModal.clickButton('Folder')
    })
    
    it('Verify that folders created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.expandItem('folder from policies')
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "folder from policies",
            "sub from policies"
        ])
        await foldersPage.treeView.selectItem('sub from policies')
        chai.expect(
            await foldersPage.documentList.getDocumentNames()
        ).to.have.members(['marina test.txt'])
    })

    it('User is able to delete folders', async function() {
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('folder from policies')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "folder from policies",
            "sub from policies"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Folder Sets - Create, add documents and delete folders and subfolders from Exports Set', async function() {
    let loginUtil    
    let projectNavigation
    let foldersPage
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let addToAFolderModal
    let exportsPage

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        foldersPage = new FoldersPage(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page) 
        addToAFolderModal = new AddToAFolderModal(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create folders, subfolders and add documents from Exports set', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.selectItem('master export')
        await exportsPage.clickToolbarButton('Actions')
        await exportsPage.clickActionMenuItem('Folder All')

        //open Add to a folder modal
        await addToAFolderModal.assertAtPage()
        await addToAFolderModal.treeView.openItemMenu('Folders')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')
        
        //open create folder modal
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from exports')
        await createFolderModal.typeDescription('description from exports')
        await createFolderModal.clickButton('Create') 
        
        //create subfolder
        await addToAFolderModal.treeView.openItemMenu('folder from exports')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from exports')
        await createFolderModal.typeDescription('sub desc from exports')
        await createFolderModal.clickButton('Create') 

        //create folder modal closes and documents adds fo the folder
        await addToAFolderModal.clickButton('Folder')
    })
    
    it('Verify that folders created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.expandItem('folder from exports')
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "folder from exports",
            "sub from exports"
        ])
        await foldersPage.treeView.selectItem('sub from exports')
        chai.expect(
            await foldersPage.documentList.getDocumentNames()
        ).to.have.members(['marina test.txt'])
    })

    it('User is able to delete folders', async function() {
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('folder from exports')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "folder from exports",
            "sub from exports"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Folder Sets - Create folders, subfolders, add documets and delete folders from Explorer Graph', async function() {
    let loginUtil    
    let projectNavigation
    let foldersPage
    let browserHelper
    let deleteFolderModal
    let explorerPage
    let addToAFolderModal
    let createFolderModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        foldersPage = new FoldersPage(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        explorerPage = new ExplorerPage(browserHelper.browser, browserHelper.page) 
        addToAFolderModal = new AddToAFolderModal(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject')) 
    })

    it('User is able to create a folder and add documents from Explorer Graph', async function () {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Explorer')
        await explorerPage.assertAtPage()
        await explorerPage.resetGraphDataBy()
        await explorerPage.openGraphDataBy()
        await explorerPage.selectGraphDataByOption('Folders')
        await explorerPage.clickGraphBar('master folder')
        await explorerPage.clickActionMenuItem('Folder')

        //open add to a folder modal
        await addToAFolderModal.assertAtPage()
        await addToAFolderModal.treeView.openItemMenu('Folders')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')

        //open create folder modal
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from explorer graph')
        await createFolderModal.typeDescription('description from explorer graph')
        await createFolderModal.clickButton('Create')

        //create subfolder
        await addToAFolderModal.treeView.openItemMenu('folder from explorer graph')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from explorer graph')
        await createFolderModal.typeDescription('sub desc from explorer graph')
        await createFolderModal.clickButton('Create')
        
        //add document to folder
        await addToAFolderModal.assertAtPage()
        await common.waitForTimeout(500)
        await addToAFolderModal.clickButton('Folder')
    })
    
    it('Verify that folders created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.expandItem('folder from explorer graph')
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "folder from explorer graph",
            "sub from explorer graph"
        ])
        await foldersPage.treeView.selectItem('sub from explorer graph')
        chai.expect(
            await foldersPage.documentList.getDocumentNames()
        ).to.have.members(['marina test.txt'])
    })

    it('User is able to delete folders', async function() {
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('folder from explorer graph')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "folder from explorer graph",
            "sub from explorer graph"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Folder Sets - Create folders, subfolders, add documets and delete folders from Search Page', async function() {
    let loginUtil    
    let projectNavigation
    let foldersPage
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let addToAFolderModal
    let searchPage
    let searchResultsPage

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        foldersPage = new FoldersPage(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page) 
        addToAFolderModal = new AddToAFolderModal(browserHelper.browser, browserHelper.page)
        searchPage = new SearchPage(browserHelper.browser, browserHelper.page)
        searchResultsPage = new SearchResultsPage(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create folders and add documents from Search Page', async function() {
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
        await searchResultsPage.clickActionMenuItem('Folder Selected')

        //open Add to a folder modal
        await addToAFolderModal.assertAtPage()
        await addToAFolderModal.treeView.openItemMenu('Folders')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')

        //open create folder modal
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from search')
        await createFolderModal.typeDescription('description from search')
        await createFolderModal.clickButton('Create') 
         
        //create subfolder
        await addToAFolderModal.treeView.openItemMenu('folder from search')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from search')
        await createFolderModal.typeDescription('sub desc from search')
        await createFolderModal.clickButton('Create')

        //add documents to folder
        await addToAFolderModal.treeView.selectItem('sub from search')
        await addToAFolderModal.clickButton('Folder')
    })

    it('Verify that folders created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.expandItem('folder from search')
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "folder from search",
            "sub from search"
        ])
        await foldersPage.treeView.selectItem('sub from search')
        chai.expect(
            await foldersPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n1')
    })

    it('User is able to delete folders', async function() {
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('folder from search')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "folder from search",
            "sub from search"
        ])
    })
 
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Folder Sets - Create folders, subfolders, add documets and delete folders from Explorer Views', async function() {
    let loginUtil    
    let projectNavigation
    let foldersPage
    let browserHelper
    let deleteFolderModal
    let explorerPage
    let topNavigation
    let explorerDocumentPage
    let addToAFolderModal
    let createFolderModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        foldersPage = new FoldersPage(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        explorerPage = new ExplorerPage(browserHelper.browser, browserHelper.page) 
        topNavigation = new TopNavigation(browserHelper.browser, browserHelper.page)
        explorerDocumentPage = new ExplorerDocumentPage(browserHelper.browser, browserHelper.page)
        addToAFolderModal = new AddToAFolderModal(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject')) 
    })

    it('User is able to create a folder and add documents from Explorer Views', async function () {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Explorer')
        await explorerPage.assertAtPage()
        await explorerPage.openActionMenu()
        await explorerPage.clickActionMenuItem('Folder')

        //open add to a folder modal
        await addToAFolderModal.assertAtPage()
        await addToAFolderModal.treeView.openItemMenu('Folders')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')

        //open create folder modal
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from explorer views')
        await createFolderModal.typeDescription('description from explorer views')
        await createFolderModal.clickButton('Create')

        //create subfolder
        await addToAFolderModal.treeView.openItemMenu('folder from explorer views')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from explorer views')
        await createFolderModal.typeDescription('sub desc from explorer views')
        await createFolderModal.clickButton('Create')
        await addToAFolderModal.assertAtPage()
        await addToAFolderModal.clickButton('Cancel')
        
        //add document to folder
        await explorerPage.assertAtPage()
        await explorerPage.openActionMenu()
        await explorerPage.clickActionMenuItem('View Document Set')
        await explorerPage.waitForTaskCountToBeZero('0')
        // sometimes it needs more time to openning
        await common.waitForTimeout(3000)
        await explorerDocumentPage.assertAtPage()
        await explorerDocumentPage.documentList.clickNthDocumentCheckbox(0)
        await explorerDocumentPage.clickToolbarButton('Actions')
        await explorerDocumentPage.clickActionMenuItem('Folder Selected')
        await addToAFolderModal.assertAtPage()
        await addToAFolderModal.treeView.openItemMenu('Folders')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')

        //open create folder modal
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from view')
        await createFolderModal.typeDescription('description from view')
        await createFolderModal.clickButton('Create') 
         
        //create subfolder
        await addToAFolderModal.treeView.openItemMenu('folder from view')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from view')
        await createFolderModal.typeDescription('sub desc from view')
        await createFolderModal.clickButton('Create')
        await addToAFolderModal.clickButton('Folder')

        //wait for success
        await topNavigation.waitForToastMessageToContain('Documents have been added to the folder')
    })
    
    it('Verify that folders created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.expandItem('folder from explorer views')
        await foldersPage.treeView.expandItem('folder from view')
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "folder from explorer views",
            "sub from explorer views",
            "folder from view",
            "sub from view"
        ])
        await foldersPage.treeView.selectItem('sub from view')
        await common.waitForTimeout(1000)
        chai.expect(
            await foldersPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n1')
    })

    it('User is able to delete folders', async function() {
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('folder from explorer views')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await topNavigation.waitForToastMessageToContain('Document Set has been deleted')
        await foldersPage.treeView.openItemMenu('folder from view')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await topNavigation.waitForToastMessageToContain('Document Set has been deleted')
        await foldersPage.assertAtPage()
        await common.waitForTimeout(1000)
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "folder from explorer views",
            "sub from explorer views",
            "folder from view",
            "sub from view"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})
        