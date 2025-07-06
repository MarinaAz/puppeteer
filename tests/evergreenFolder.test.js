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
const ExplorerDocumentPage = require("../pages/ExplorerDocumentPage")
const AddFolderModal = require("../pages/modals/AddFolderModal")
const SaveSearchCriteriaModal = require("../pages/modals/SaveSearchCriteriaModal")
const DeleteSearchModal = require("../pages/modals/DeleteSearchModal")
const SystemDashboardPage = require("../pages/SystemDashboardPage")
const TopNavigation = require("../pages/components/TopNavigation")
const RunSwitchSchemaAndSynchronizationModal = require("../pages/modals/RunSwitchSchemaAndSynchronizationModal")
const RemoveSelectedDocumentsModal = require("../pages/modals/RemoveSelectedDocumentsModal")

describe('Evergreen Folder Sets (Folders page)- create and delete evergreen folder and subfolder from left pane', async function () {
    let loginUtil    
    let projectNavigation
    let foldersPage
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let editFolderModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        foldersPage = new FoldersPage(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        editFolderModal = new EditFolderModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create an evergreen folder from Folders menu', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.clickCreateNewFolder()
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('new evergreen folder')
        await createFolderModal.typeDescription('evergreen description')
        await createFolderModal.openSelectSearch()
        await createFolderModal.searchForSavedSearches('master search')
        await createFolderModal.clickButton('Create')       
        await common.waitForTimeout(500)
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "Folders",
            "new evergreen folder"
        ])
    })

    it('User is able to create an evergreen subfolder from Folders menu', async function() {
        await foldersPage.assertAtPage()        
        await foldersPage.treeView.openItemMenu('new evergreen folder')        
        await foldersPage.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('new evergreen subfolder')
        await createFolderModal.typeDescription('evergreen subdescription')
        await createFolderModal.openSelectSearch()
        await createFolderModal.searchForSavedSearches('master search')
        await createFolderModal.clickButton('Create')       
        await common.waitForTimeout(500)
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "Folders",
            "new evergreen folder",
            "new evergreen subfolder"
        ])
    })

    it('User is able to create an evergreen subfolder from subfolder in Folders menu', async function() {
        await foldersPage.assertAtPage()        
        await foldersPage.treeView.openItemMenu('new evergreen subfolder')        
        await foldersPage.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub evergreen subfolder')
        await createFolderModal.typeDescription('sub evergreen subdescription')
        await createFolderModal.openSelectSearch()
        await createFolderModal.searchForSavedSearches('master search')
        await createFolderModal.clickButton('Create')      
        await common.waitForTimeout(500)
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "Folders",
            "new evergreen folder",
            "new evergreen subfolder",
            "sub evergreen subfolder"
        ])
    })


    it('User is able to edit an evergreen folder', async function() {
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('sub evergreen subfolder')
        await foldersPage.treeView.selectItemMenuItem('Edit Folder')
        await editFolderModal.assertAtPage()
        await common.waitForTimeout(1000)
        await editFolderModal.typeName('EDITED EVG folder')
        await editFolderModal.typeDescription('it was edited')
        await editFolderModal.clickButton('Save')
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "EDITED EVG folder"
        ])
    })

    it('User is able to move evergreen folder to the root, to other folders and subfolders', async function() {
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('EDITED EVG folder')
        // to the root
        await foldersPage.treeView.moveItemUp('EDITED EVG folder', 'Folders')        
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "Folders",
            "EDITED EVG folder",
            "master folder",
            "new evergreen folder",
            "new evergreen subfolder"
        ])

        await foldersPage.treeView.selectItem('EDITED EVG folder')
        //to other folder
        await foldersPage.treeView.moveItemDown('EDITED EVG folder', 'new evergreen folder') 
        chai.expect( 
            await foldersPage.getListedFolders()
        ).to.include.members([
            "Folders",
            "master folder",
            "new evergreen folder",
            "EDITED EVG folder",
            "new evergreen subfolder"
        ])

        await foldersPage.treeView.selectItem('EDITED EVG folder')
        //to subfolder
        await foldersPage.treeView.moveItemDown('EDITED EVG folder', 'new evergreen subfolder')
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "Folders",
            "master folder",
            "new evergreen folder",
            "new evergreen subfolder",
            "EDITED EVG folder"
        ])
    })
     
    it('User is able to delete an evergreen folder from Folders menu', async function() {        
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('EDITED EVG folder')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await foldersPage.treeView.openItemMenu('new evergreen subfolder')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await foldersPage.treeView.openItemMenu('new evergreen folder')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "new evergree folder",
            "new evergreen subfolder",
            "EDITED EVG folder"
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Folder Sets - Create evergreen folder and subfolders from Preservations Set', async function() {
    let loginUtil    
    let projectNavigation
    let foldersPage
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let preservationsPage
    let addToAFolderModal

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

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create Evergreen folders, subfolders from Preservation sets', async function() {
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
        await createFolderModal.typeName('evg folder from preservation')
        await createFolderModal.typeDescription('evg description from preservation')
        await createFolderModal.openSelectSearch()
        await createFolderModal.searchForSavedSearches('master search')
        await createFolderModal.clickButton('Create')
        
        //create subfolder
        await addToAFolderModal.treeView.openItemMenu('evg folder from preservation')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('evg sub from preservation')
        await createFolderModal.typeDescription('evg sub desc from preservation')
        await createFolderModal.openSelectSearch()
        await createFolderModal.searchForSavedSearches('master search')
        await createFolderModal.clickButton('Create')

        //create folder modal closes and evergreen folder is created
        await addToAFolderModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen folders are created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.expandItem('evg folder from preservation')
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "evg folder from preservation",
            "evg sub from preservation"
        ])
    })

    it('User is able to delete evergreen folders', async function() {
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('evg folder from preservation')
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

describe('Evergreen Folder Sets - Create and delete evergreen folders and subfolders from Collections Set', async function() {
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

    it('User is able to create evergreen folders, subfolders from Collections sets', async function() {
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
        await createFolderModal.typeName('evg folder from collection')
        await createFolderModal.typeDescription('evg description from collection')
        await createFolderModal.openSelectSearch()
        await createFolderModal.searchForSavedSearches('master search')
        await createFolderModal.clickButton('Create')
        
        //create subfolder
        await addToAFolderModal.treeView.openItemMenu('evg folder from collection')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('evg sub from collection')
        await createFolderModal.typeDescription('evg sub desc from collection')
        await createFolderModal.clickButton('Create')

        //create folder modal closes and evergreen folder is created
        await addToAFolderModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen folders created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.expandItem('evg folder from collection')
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "evg folder from collection",
            "evg sub from collection"
        ])
    })

    it('User is able to delete evergreen folders', async function() {
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('evg folder from collection')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "evg folder from collection",
            "evg sub from collection"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Folder Sets - Create and delete evergreen folders and subfolders from Folders Set', async function() {
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

    it('User is able to create evergreen folders, subfolders from Folders sets', async function() {
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
        await createFolderModal.typeName('evg folder from folders')
        await createFolderModal.typeDescription('evg description from folders')
        await createFolderModal.openSelectSearch()
        await createFolderModal.searchForSavedSearches('master search')
        await createFolderModal.clickButton('Create') 
        
        //create subfolder
        await addToAFolderModal.treeView.openItemMenu('evg folder from folders')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('evg sub from folders')
        await createFolderModal.typeDescription('evg sub desc from folders')
        await createFolderModal.clickButton('Create')

        //create folder modal closes and evergreen folders are created
        await addToAFolderModal.clickButton('Cancel')
    })
    
    it('Verify that folders created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "evg folder from folders",
            "evg sub from folders"
        ])
    })

    it('User is able to delete evergreen folders', async function() {
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('evg folder from folders')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "evg folder from folders",
            "evg sub from folders"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Folder Sets - Create and delete an evergreen folders and subfolders from Policies Set', async function() {
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

    it('User is able to create an evergreen folders, subfolders from Policies set', async function() {
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
        await createFolderModal.typeName('evg folder from policies')
        await createFolderModal.typeDescription('evg description from policies')
        await createFolderModal.openSelectSearch()
        await createFolderModal.searchForSavedSearches('master search')
        await createFolderModal.clickButton('Create') 
        
        //create subfolder
        await addToAFolderModal.treeView.openItemMenu('evg folder from policies')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('evg sub from policies')
        await createFolderModal.typeDescription('evg sub desc from policies')
        await createFolderModal.openSelectSearch()
        await createFolderModal.searchForSavedSearches('master search')
        await createFolderModal.clickButton('Create')

        //create folder modal closes and evergreen folders are created
        await addToAFolderModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen folders created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.expandItem('evg folder from policies')
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "evg folder from policies",
            "evg sub from policies"
        ])
    })

    it('User is able to delete evergreen folders', async function() {
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('evg folder from policies')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "evg folder from policies",
            "evg sub from policies"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Folder Sets - Create and delete an evergreen folders and subfolders from Export Set', async function() {
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

    it('User is able to create an evergreen folders, subfolders from Exports set', async function() {
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
        await createFolderModal.typeName('evg folder from exports')
        await createFolderModal.typeDescription('evg description from exports')
        await createFolderModal.openSelectSearch()
        await createFolderModal.searchForSavedSearches('master search')
        await createFolderModal.clickButton('Create')
        
        //create subfolder
        await addToAFolderModal.treeView.openItemMenu('evg folder from exports')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('evg sub from exports')
        await createFolderModal.typeDescription('evg sub desc from exports')
        await createFolderModal.openSelectSearch()
        await createFolderModal.searchForSavedSearches('master search')
        await createFolderModal.clickButton('Create')

        //create folder modal closes and evergreen folders are created
        await addToAFolderModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen folders created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.expandItem('evg folder from exports')
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "evg folder from exports",
            "evg sub from exports"
        ])
    })

    it('User is able to delete evergreen folders', async function() {
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('evg folder from exports')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "evg folder from exports",
            "evg sub from exports"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Folder Sets - Create and delete evergreen folders, subfolders from Explorer Graph', async function() {
    let loginUtil    
    let projectNavigation
    let foldersPage
    let browserHelper
    let deleteFolderModal
    let explorerPage
    let createFolderModal
    let explorerDocumentPage
    let addToAFolderModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        foldersPage = new FoldersPage(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        explorerPage = new ExplorerPage(browserHelper.browser, browserHelper.page) 
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        explorerDocumentPage = new ExplorerDocumentPage(browserHelper.browser, browserHelper.page)
        addToAFolderModal = new AddToAFolderModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject')) 
    })

    it('User is able to create an evergreen folder from Explorer Graph', async function () {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Explorer')
        await explorerPage.assertAtPage()
        await explorerPage.openGraphDataBy()
        await explorerPage.selectGraphDataByOption('Folders')
        await explorerPage.clickGraphBar('master folder')
        await explorerPage.clickActionMenuItem('View Document Set')
        await common.waitForTimeout(1000)
        await explorerDocumentPage.assertAtPage()
        await explorerDocumentPage.clickToolbarButton('Actions')
        await explorerDocumentPage.clickActionMenuItem('Folder All')

        //open add to a folder modal
        await addToAFolderModal.assertAtPage()
        await addToAFolderModal.treeView.openItemMenu('Folders')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')

        //open create folder modal
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('evg folder from explorer graph')
        await createFolderModal.typeDescription('evg description from explorer graph')
        await createFolderModal.openSelectSearch()
        await createFolderModal.searchForSavedSearches('master search')
        await createFolderModal.clickButton('Create')

        //create subfolder
        await addToAFolderModal.treeView.openItemMenu('evg folder from explorer graph')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('evg sub from explorer graph')
        await createFolderModal.typeDescription('evg sub desc from explorer graph')
        await createFolderModal.openSelectSearch()
        await createFolderModal.searchForSavedSearches('master search')
        await createFolderModal.clickButton('Create')
        
        //add document to folder
        await addToAFolderModal.assertAtPage()
        await common.waitForTimeout(500)
        await addToAFolderModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen folders are created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.expandItem('evg folder from explorer graph')
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "evg folder from explorer graph",
            "evg sub from explorer graph"
        ])
    })

    it('User is able to delete evergreen folders', async function() {
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('evg folder from explorer graph')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "evg folder from explorer graph",
            "evg sub from explorer graph"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Folder Sets - Create and delete evergreen folders, subfolders from Search Page', async function() {
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

    it('User is able to create evergreen folders from Search Page', async function() {
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
        await searchResultsPage.clickActionMenuItem('Folder All')

        //open Add to a folder modal
        await addToAFolderModal.assertAtPage()
        await addToAFolderModal.treeView.openItemMenu('Folders')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')

        //open create folder modal
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('evg folder from search')
        await createFolderModal.typeDescription('evg description from search')
        await createFolderModal.openSelectSearch()
        await createFolderModal.searchForSavedSearches('master search')
        await createFolderModal.clickButton('Create') 
         
        //create subfolder
        await addToAFolderModal.treeView.openItemMenu('evg folder from search')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('evg sub from search')
        await createFolderModal.typeDescription('evg sub desc from search')
        await createFolderModal.openSelectSearch()
        await createFolderModal.searchForSavedSearches('master search')
        await createFolderModal.clickButton('Create')

        //add documents to folder
        await addToAFolderModal.treeView.selectItem('evg sub from search')
        await addToAFolderModal.clickButton('Cancel')
    })

    it('Verify that evergreen folders are created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.expandItem('evg folder from search')
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "evg folder from search",
            "evg sub from search"
        ])
    })

    it('User is able to delete evergreen folders', async function() {
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('evg folder from search')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "evg folder from search",
            "evg sub from search"
        ])
    })
 
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Folder Sets - Create and delete evergreen folders, subfolders from Explorer Views', async function() {
    let loginUtil    
    let projectNavigation
    let foldersPage
    let browserHelper
    let deleteFolderModal
    let explorerPage
    let createFolderModal
    let explorerDocumentPage
    let addToAFolderModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        foldersPage = new FoldersPage(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        explorerPage = new ExplorerPage(browserHelper.browser, browserHelper.page) 
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        explorerDocumentPage = new ExplorerDocumentPage(browserHelper.browser, browserHelper.page)
        addToAFolderModal = new AddToAFolderModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject')) 
    })

    it('User is able to create an evergreen folder from Explorer Views', async function () {
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
        await explorerDocumentPage.clickActionMenuItem('Folder All')

        //open add to a folder modal
        await addToAFolderModal.assertAtPage()
        await addToAFolderModal.treeView.openItemMenu('Folders')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')

        //open create folder modal
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('evg folder from explorer views')
        await createFolderModal.typeDescription('evg description from explorer views')
        await createFolderModal.openSelectSearch()
        await createFolderModal.searchForSavedSearches('master search')
        await createFolderModal.clickButton('Create')

        //create subfolder
        await addToAFolderModal.treeView.openItemMenu('evg folder from explorer views')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('evg sub from explorer views')
        await createFolderModal.typeDescription('evg sub desc from explorer views')
        await createFolderModal.openSelectSearch()
        await createFolderModal.searchForSavedSearches('master search')
        await createFolderModal.clickButton('Create')
        await addToAFolderModal.assertAtPage()
        await common.waitForTimeout(500)
        await addToAFolderModal.clickButton('Cancel')
    })
    
    it('Verify that evergreen folders are created', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.expandItem('evg folder from explorer views')
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "evg folder from explorer views",
            "evg sub from explorer views"
        ])
    })

    it('User is able to delete evergreen folders', async function() {
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('evg folder from explorer views')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "evg folder from explorer views",
            "evg sub from explorer views"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Evergreen Folder Sets - Add documents to evergreen Folder after "Refresh Evergreen"', async function() {
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
        await createFolderModal.typeName('test folder')
        await createFolderModal.typeDescription('test description')
        await createFolderModal.clickButton('Create')

         //add documents to folder
         await addToAFolderModal.treeView.selectItem('test folder')
         await addToAFolderModal.clickButton('Folder')

         //verify that folder is created
         await projectNavigation.assertAtPage()
         await projectNavigation.openDocumentSetsMenu()
         await projectNavigation.clickMenuItem('Folders')
         await foldersPage.assertAtPage()
         chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "test folder"
        ])
    })

    it('Search for RG Sets -> Folder -> our new created folder and Save Search Criteria', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideSearchPredicateByName('Folder')
        await addFolderModal.assertAtPage()
        await addFolderModal.treeView.addSelectedFolder('test folder')
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

    it('Create a new evergreen folder with Saved Search and check quantity of documents inside', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.clickCreateNewFolder()
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('test evergreen folder')
        await createFolderModal.typeDescription('test evergreen description')
        await createFolderModal.openSelectSearch()
        await createFolderModal.searchForSavedSearches('test')
        await createFolderModal.clickButton('Create')        
        await common.waitForTimeout(500)
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "Folders",
            "test evergreen folder"
        ])

        // check quantiti of documents inside of evergreen folder
        await foldersPage.treeView.selectItem('test evergreen folder')
        await common.waitForTimeout(1000)
        chai.expect(
            await foldersPage.documentList.getDocumentsCount()
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
        await addToAFolderModal.treeView.selectItem('test folder')
        await addToAFolderModal.clickButton('Folder')
        await common.waitForTimeout(1000)

        //check quantity of document inside of folder
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('test folder')
        await common.waitForTimeout(1000)
        chai.expect(
            await foldersPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n5')
    })

    it('Run "Refresh Evergreen" and check quantity of documents inside evergreen folder', async function() {

        //check quantity of document inside of evergreen folder before "Refresh Evergreen"
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('test evergreen folder')
        await common.waitForTimeout(1000)
        chai.expect(
            await foldersPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n3')

        // run "Refresh Evergreen"
        await foldersPage.clickRefreshToolbarButton()
        await foldersPage.clickRefreshMenuItem('Refresh Evergreen')
        await common.waitForTimeout(1000)
        //wait for toast, then wait a bit more
        await topNavigation.waitForToastMessageToContain('Evergreen refresh has finished')

        //check quantity of document inside of evergreen folder after "Refresh Evergreen"
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('test evergreen folder')
        await common.waitForTimeout(1000)
        chai.expect(
            await foldersPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n5')
    })

    it('Delete created folders and saved search', async function() {
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('test evergreen folder')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await foldersPage.treeView.openItemMenu('test folder')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "test evergreen folder",
            "test folder"
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

describe('Evergreen Folder Sets - Add documents to evergreen Folder after "Switch Schema"', async function() {
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
    let systemDashboardPage
    let topNavigation
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
        systemDashboardPage = new SystemDashboardPage(browserHelper.browser, browserHelper.page)
        topNavigation = new TopNavigation(browserHelper.browser, browserHelper.page)
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
        await createFolderModal.typeName('test folder')
        await createFolderModal.typeDescription('test description')
        await createFolderModal.clickButton('Create')

         //add documents to folder
         await addToAFolderModal.treeView.selectItem('test folder')
         await addToAFolderModal.clickButton('Folder')

         //verify that folder is created
         await projectNavigation.assertAtPage()
         await projectNavigation.openDocumentSetsMenu()
         await projectNavigation.clickMenuItem('Folders')
         await foldersPage.assertAtPage()
         chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "test folder"
        ])
    })

    it('Search for RG Sets -> Folder -> our new created folder and Save Search Criteria', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideSearchPredicateByName('Folder')
        await addFolderModal.assertAtPage()
        await addFolderModal.treeView.addSelectedFolder('test folder')
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

    it('Create a new evergreen folder with Saved Search and check quantity of documents inside', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.clickCreateNewFolder()
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('test evergreen folder')
        await createFolderModal.typeDescription('test evergreen description')
        await createFolderModal.openSelectSearch()
        await createFolderModal.searchForSavedSearches('test')
        await createFolderModal.clickButton('Create')        
        await common.waitForTimeout(500)
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "Folders",
            "test evergreen folder"
        ])

        // check quantiti of documents inside of evergreen folder
        await foldersPage.treeView.selectItem('test evergreen folder')
        await common.waitForTimeout(1000)
        chai.expect(
            await foldersPage.documentList.getDocumentsCount()
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
        await addToAFolderModal.treeView.selectItem('test folder')
        await addToAFolderModal.clickButton('Folder')

        //check quantity of document inside of folder
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('test folder')
        await common.waitForTimeout(1000)
        chai.expect(
            await foldersPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n5')
    })

    it('Run "Switch Schema" and check quantity of documents inside evergreen folder', async function() {

        //check quantity of document inside of evergreen folder before "Switch Schema"
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('test evergreen folder')
        await common.waitForTimeout(1000)
        chai.expect(
            await foldersPage.documentList.getDocumentsCount()
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

        //check quantity of document inside of evergreen folder after "Switch Schema"
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('test evergreen folder')
        await common.waitForTimeout(1000)
        chai.expect(
            await foldersPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n5')
    })

    it('Delete created folders and saved search', async function() {
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('test evergreen folder')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await foldersPage.treeView.openItemMenu('test folder')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "test evergreen folder",
            "test folder"
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

describe('Evergreen Folder Sets - Release documents from evergreen Folders after releasing them from the search', async function() {
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
    let removeSelectedDocumentsModal
    let topNavigation

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
        removeSelectedDocumentsModal = new RemoveSelectedDocumentsModal(browserHelper.browser, browserHelper.page)
        topNavigation = new TopNavigation(browserHelper.browser, browserHelper.page)

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
        await createFolderModal.typeName('test folder')
        await createFolderModal.typeDescription('test description')
        await createFolderModal.clickButton('Create')

         //add documents to folder
         await addToAFolderModal.treeView.selectItem('test folder')
         await addToAFolderModal.clickButton('Folder')

         //verify that folder is created
         await projectNavigation.assertAtPage()
         await projectNavigation.openDocumentSetsMenu()
         await projectNavigation.clickMenuItem('Folders')
         await foldersPage.assertAtPage()
         chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "test folder"
        ])
    })

    it('Search for RG Sets -> Folder -> our new created folder and Save Search Criteria', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideSearchPredicateByName('Folder')
        await addFolderModal.assertAtPage()
        await addFolderModal.treeView.addSelectedFolder('test folder')
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

    it('Create a new evergreen folder with Saved Search and check quantity of documents inside', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.clickCreateNewFolder()
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('test evergreen folder')
        await createFolderModal.typeDescription('test evergreen description')
        await createFolderModal.openSelectSearch()
        await createFolderModal.searchForSavedSearches('test')
        await createFolderModal.clickButton('Create')        
        await common.waitForTimeout(500)
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.include.members([
            "Folders",
            "test evergreen folder"
        ])

        // check quantiti of documents inside of evergreen folde
        await foldersPage.treeView.selectItem('test evergreen folder')
        await common.waitForTimeout(1000)
        chai.expect(
            await foldersPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n3')
    })

    it('Remove 1 document from folder of Saved Searches', async function() {
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('test folder')
        await common.waitForTimeout(2000)
        await foldersPage.documentList.clickNthDocumentCheckbox(2)
        await foldersPage.clickToolbarButton('Actions')
        await foldersPage.clickActionMenuItem('Remove Selected')
        await removeSelectedDocumentsModal.assertAtPage()
        await removeSelectedDocumentsModal.clickButton('Remove')
        await common.waitForTimeout(1000)
        chai.expect(
            await foldersPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n2')
    })

    it('Remove documents from evergreen Folders should be unavailable', async function() {
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('test evergreen folder')
        await foldersPage.clickToolbarButton('Actions')
        chai.expect(
            await foldersPage.getActionMenuItems()
        ).to.not.include.members([
            "Remove All",
            "Remove Selected"
        ])
    })

    it('Run "Refresh Evergreen" and check if documents was released from evergreen folder', async function() {
        //check quantity of document inside of evergreen folder before "Refresh Evergreen"
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('test evergreen folder')
        await common.waitForTimeout(1000)
        chai.expect(
            await foldersPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n3')

        // run "Refresh Evergreen"
        await foldersPage.clickRefreshToolbarButton()
        await foldersPage.clickRefreshMenuItem('Refresh Evergreen')
        //wait for toast, then wait a bit more
        await topNavigation.waitForToastMessageToContain('Evergreen refresh has finished')
        await common.waitForTimeout(1000)

        //check quantity of document inside of evergreen folder after "Refresh Evergreen"
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('test evergreen folder')
        await common.waitForTimeout(3000)
        chai.expect(
            await foldersPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n2')
    })

    it('Delete created folders and saved search', async function() {
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('test evergreen folder')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await foldersPage.treeView.openItemMenu('test folder')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "test evergreen folder",
            "test folder"
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
