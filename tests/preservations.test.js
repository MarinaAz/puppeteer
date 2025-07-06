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
const CreatePreservationSetModal = require("../pages/modals/CreatePreservationSetModal")
const EditPreservationSetModal = require("../pages/modals/EditPreservationSetModal")
const DeletePreservationModal = require("../pages/modals/DeletePreservationModal")
const PreserveDocumentsModal = require("../pages/modals/PreserveDocumentsModal")
const ReleaseDocumentsModal = require("../pages/modals/ReleaseDocumentsModal")
const AddCustodianModal = require("../pages/modals/AddCustodianModal")
const ReleaseDocumentsComplexModal = require("../pages/modals/ReleaseDocumentsComplexModal")
const AddToAFolderModal = require("../pages/modals/AddToAFolderModal")
const AddFolderModal = require("../pages/modals/AddFolderModal")
const ReleaseDocumentsForSearchModal = require("../pages/modals/ReleaseDocumentsForSearchModal")
const SaveSearchCriteriaModal = require("../pages/modals/SaveSearchCriteriaModal")
const DeleteSearchModal = require("../pages/modals/DeleteSearchModal")

describe('Preservation Sets - create and delete folder, subfolder and preservation from left pane', async function () {
    let loginUtil    
    let projectNavigation
    let preservationsPage
    let createPreservationSetModal
    let editPreservationSetModal
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let editFolderModal
    let deletePreservationModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        createPreservationSetModal = new CreatePreservationSetModal(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        editFolderModal = new EditFolderModal(browserHelper.browser, browserHelper.page)
        editPreservationSetModal = new EditPreservationSetModal(browserHelper.browser, browserHelper.page)
        deletePreservationModal = new DeletePreservationModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create a folder from Preservation Sets menu', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.clickCreateButton('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('new folder')
        await createFolderModal.typeDescription('new description')
        await createFolderModal.clickButton('Create')       
        await common.waitForTimeout(500)
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.include.members([
            "Preservation Sets",
            "new folder"
        ])
    })

    it('User is able to create a subfolder from Preservations menu', async function() {
        await preservationsPage.assertAtPage()        
        await preservationsPage.treeView.openItemMenu('new folder')        
        await preservationsPage.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('new subfolder')
        await createFolderModal.typeDescription('new subdescription')
        await createFolderModal.clickButton('Create')       
        await common.waitForTimeout(500)
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.include.members([
            "Preservation Sets",
            "new folder",
            "new subfolder"
        ])
    })

    it('User is able to create a preservation from Preservations menu', async function() {
        await preservationsPage.assertAtPage()        
        await preservationsPage.treeView.openItemMenu('Preservation Sets')
        await preservationsPage.treeView.selectItemMenuItem('New Preservation Set')
        await createPreservationSetModal.assertAtPage()
        await createPreservationSetModal.typeName('new preservation')
        await createPreservationSetModal.typeDesc('preservation desc')
        await createPreservationSetModal.clickButton('Create')        
        await common.waitForTimeout(500)        
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.include.members([
            "Preservation Sets",
            "new folder",
            "new subfolder",
            "new preservation"
        ])
    })

    it('User is able to edit a folder', async function() {
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.openItemMenu('new subfolder')
        await preservationsPage.treeView.selectItemMenuItem('Edit Folder')
        await editFolderModal.assertAtPage()
        await common.waitForTimeout(1000)
        await editFolderModal.typeName('EDITED folder')
        await editFolderModal.typeDescription('it was edited')
        await editFolderModal.clickButton('Save')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.include.members([
            "EDITED folder"
        ])
    })

    it('User is able to move folder to the root, to other folders', async function() {
        await preservationsPage.assertAtPage()

        //to the root
        await preservationsPage.treeView.nestField('EDITED folder', 'Preservation Sets')        
        chai.expect(
            await preservationsPage.treeView.isItemFoldered('EDITED folder')
        ).to.be.false

        await preservationsPage.treeView.selectItem('EDITED folder')
        //to other folder
        await preservationsPage.treeView.nestField('EDITED folder', 'new folder') 
        chai.expect(
            await preservationsPage.treeView.isItemFoldered('EDITED folder')
        ).to.be.true

    })

    it('User is able to edit preservation', async function() {
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.openItemMenu('new preservation')
        await preservationsPage.treeView.selectItemMenuItem('Edit Preservation Set')
        await editPreservationSetModal.assertAtPage()
        await common.waitForTimeout(1000)
        await editPreservationSetModal.typeName('EDITED preservation')
        await editPreservationSetModal.typeDescription('it was edited')
        await editPreservationSetModal.clickButton('Save')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.include.members([
            "EDITED preservation"
        ])
    })

    it('User is able to move preservation', async function() {
        await preservationsPage.assertAtPage()

        //to other folder
        await preservationsPage.treeView.nestField('EDITED preservation','new folder')
        chai.expect(
            await preservationsPage.treeView.isItemFoldered('EDITED preservation')
        ).to.be.true

        await preservationsPage.treeView.selectItem('EDITED preservation')
        //to the root
        await preservationsPage.treeView.nestField('EDITED preservation','Preservation Sets')
        chai.expect(
            await preservationsPage.treeView.isItemFoldered('EDITED preservation')
        ).to.be.false

 
    })
     
    it('User is able to delete folders and preservation from Preservation Sets menu', async function() {        
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.openItemMenu('EDITED folder')
        await preservationsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await preservationsPage.treeView.openItemMenu('new folder')
        await preservationsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await preservationsPage.treeView.openItemMenu('EDITED preservation')
        await preservationsPage.treeView.selectItemMenuItem('Delete Preservation Set')
        await deletePreservationModal.assertAtPage()
        await deletePreservationModal.clickButton('Delete')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.not.include.members([
            "new folder",
            "EDITED folder",
            "EDITED preservation"
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Preservation Sets - Release documents from Preservation based on All/Selected, Custodian, System, Date, Search', async function() {
    let loginUtil    
    let projectNavigation
    let preservationsPage
    let createPreservationSetModal
    let browserHelper
    let deletePreservationModal
    let searchPage
    let searchResultsPage
    let preserveDocumentsModal
    let releaseDocumentsModal
    let addCustodianModal
    let releaseDocumentsComplexModal
    let topNavigation
    let addToAFolderModal
    let createFolderModal
    let addFolderModal
    let foldersPage
    let releaseDocumentsForSearchModal
    let deleteFolderModal
    let saveSearchCriteriaModal
    let deleteSearchModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        createPreservationSetModal = new CreatePreservationSetModal(browserHelper.browser, browserHelper.page)
        deletePreservationModal = new DeletePreservationModal(browserHelper.browser, browserHelper.page)
        searchPage =  new SearchPage(browserHelper.browser, browserHelper.page)
        searchResultsPage = new SearchResultsPage(browserHelper.browser, browserHelper.page)
        preserveDocumentsModal = new PreserveDocumentsModal(browserHelper.browser, browserHelper.page)
        releaseDocumentsModal = new ReleaseDocumentsModal(browserHelper.browser, browserHelper.page)
        releaseDocumentsComplexModal = new ReleaseDocumentsComplexModal(browserHelper.browser, browserHelper.page)
        addCustodianModal = new AddCustodianModal(browserHelper.browser, browserHelper.page)
        topNavigation = new TopNavigation(browserHelper.browser, browserHelper.page)
        addToAFolderModal = new AddToAFolderModal(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        addFolderModal = new AddFolderModal(browserHelper.browser, browserHelper.page)
        foldersPage = new FoldersPage(browserHelper.browser, browserHelper.page)
        releaseDocumentsForSearchModal = new ReleaseDocumentsForSearchModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        saveSearchCriteriaModal = new SaveSearchCriteriaModal(browserHelper.browser, browserHelper.page)
        deleteSearchModal = new DeleteSearchModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to release documents from Preservation based on All/Selected - preserve 4 documents', async function() {
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
        await searchResultsPage.documentList.clickNthDocumentCheckbox(3) 
        await searchResultsPage.clickToolbarButton("Actions")
        await searchResultsPage.clickActionMenuItem('Preserve Selected')

        //open  Preserve documents modal
        await preserveDocumentsModal.assertAtPage()
        await preserveDocumentsModal.treeView.openItemMenu('Preservation Sets')
        await preservationsPage.treeView.selectItemMenuItem('New Preservation Set')
 
        //open create preservation set modal
        await createPreservationSetModal.assertAtPage()
        await createPreservationSetModal.typeName('test preservation')
        await createPreservationSetModal.typeDesc('test description')
        await createPreservationSetModal.clickButton('Create') 
 
        //add documents to preservation
        await preserveDocumentsModal.clickButton('Preserve')
        await topNavigation.waitForToastMessageToContain('Documents have been added to the preservation')
        await common.waitForTimeout(2000)

        // release selected documents from preservation
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.selectItem('test preservation')
        chai.expect(
            await preservationsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n4')
        await preservationsPage.documentList.clickNthDocumentCheckbox(0)
        await preservationsPage.documentList.clickNthDocumentCheckbox(1)
        await preservationsPage.clickToolbarButton('Actions')
        await preservationsPage.clickActionMenuItem('Release')
        await preservationsPage.clickActionSubMenuItem('Selected')
        await releaseDocumentsModal.assertAtPage()
        await releaseDocumentsModal.clickButton('Release')
        chai.expect(
            await preservationsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n2')

        // reliese all documents from preservation
        await preservationsPage.clickToolbarButton('Actions')
        await preservationsPage.clickActionMenuItem('Release')
        await preservationsPage.clickActionSubMenuItem('All')
        await releaseDocumentsModal.assertAtPage()
        await releaseDocumentsModal.clickButton('Release')
        chai.expect(
            await preservationsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n0')
    })

    it('User is able to release documents from Preservation Based Upon Custodian', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideSearchPredicateByName('Custodian')
        await addCustodianModal.assertAtPage()
        await addCustodianModal.addSelectedCustodian('Alea Bowen')
        await addCustodianModal.clickCloseButton()
        await searchPage.clickSearchButton()
        await searchResultsPage.assertAtPage()

        // add 3 documents with custodian
        await searchResultsPage.documentList.clickNthDocumentCheckbox(0) 
        await searchResultsPage.documentList.clickNthDocumentCheckbox(1) 
        await searchResultsPage.documentList.clickNthDocumentCheckbox(2) 
        await searchResultsPage.clickToolbarButton("Actions")
        await searchResultsPage.clickActionMenuItem('Preserve Selected')

        //open  Preserve documents modal
        await preserveDocumentsModal.assertAtPage()
        await preserveDocumentsModal.treeView.openItemMenu('Preservation Sets')
        await preservationsPage.treeView.selectItemMenuItem('New Preservation Set')
 
        //open create preservation set modal
        await createPreservationSetModal.assertAtPage()
        await createPreservationSetModal.typeName('custodian preservation')
        await createPreservationSetModal.typeDesc('cust description')
        await createPreservationSetModal.clickButton('Create') 
 
        //add documents to preservation
        await preserveDocumentsModal.clickButton('Preserve')

        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideSearchPredicate('Custodian')
        await addCustodianModal.assertAtPage()
        await addCustodianModal.addSelectedCustodian('Unmapped content')
        await addCustodianModal.clickCloseButton()
        await searchPage.clickSearchButton()
        await searchResultsPage.assertAtPage()

        // add 3 documents with Unmapped content
        await searchResultsPage.documentList.clickNthDocumentCheckbox(0) 
        await searchResultsPage.documentList.clickNthDocumentCheckbox(1) 
        await searchResultsPage.documentList.clickNthDocumentCheckbox(2) 
        await searchResultsPage.clickToolbarButton("Actions")
        await searchResultsPage.clickActionMenuItem('Preserve Selected')

        //open Preserve documents modal and add documents
        await preserveDocumentsModal.assertAtPage()
        await preserveDocumentsModal.treeView.selectItem('custodian preservation')
        await preserveDocumentsModal.clickButton('Preserve')
        await topNavigation.waitForToastMessageToContain('Documents have been added to the preservation')
        await common.waitForTimeout(2000)

        // reliese documents from preservation with Custodian
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')

        // we need click Dedublicate for get Document Names
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.selectItem('custodian preservation')
        chai.expect(
            await preservationsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n6')
        await preservationsPage.clickToolbarButton('Actions')
        await preservationsPage.clickActionMenuItem('Release')
        await preservationsPage.clickActionSubMenuItem('Based Upon Custodian, System or Date')
        await releaseDocumentsComplexModal.assertAtPage()
        await releaseDocumentsComplexModal.openAddACustodianList()
        await releaseDocumentsComplexModal.addCustodian('Alea Bowen')
        await releaseDocumentsComplexModal.clickButton('Release')
        
        chai.expect(
            await preservationsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n3')
    })

    it('User is able to release documents from Preservation Based Upon Search Criteria', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()

        // create a folder with 3 documents
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

        await addToAFolderModal.assertAtPage()
        await addToAFolderModal.treeView.openItemMenu('Folders')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')
        
        //open create folder modal
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('temp folder')
        await createFolderModal.typeDescription('desc temp')
        await createFolderModal.clickButton('Create') 
        await addToAFolderModal.clickButton('Folder')

        //create saved search of this folder
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideSearchPredicateByName('Folder')
        await addFolderModal.assertAtPage()
        await addFolderModal.treeView.addSelectedFolder('temp folder')
        await addFolderModal.clickButton('Cancel')
        await searchPage.clickSaveSearchCriteria()
        await saveSearchCriteriaModal.assertAtPage()
        await saveSearchCriteriaModal.typeName('aa')
        await saveSearchCriteriaModal.clickButton('Save')
        await searchResultsPage.assertAtPage()
        await searchResultsPage.clickSearchNavigationTab('Search')
        await searchPage.assertAtPage()
        chai.expect(
            await searchPage.getSavedSearchNames()
        ).to.include.members([
            "aa"
        ])

        //preserve created folder
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('temp folder')
        await foldersPage.clickToolbarButton('Actions')
        await foldersPage.clickActionMenuItem('Preserve All')
        await preserveDocumentsModal.assertAtPage()
        await preserveDocumentsModal.treeView.selectItem('custodian preservation')
        await preserveDocumentsModal.clickButton('Preserve')
        await topNavigation.waitForToastMessageToContain('Documents have been added to the preservation')
        await common.waitForTimeout(2000)

        //release saved search documents from preservation 
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.selectItem('custodian preservation')
        chai.expect(
            await preservationsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n6')
        await preservationsPage.clickToolbarButton('Actions')
        await preservationsPage.clickActionMenuItem('Release')
        await preservationsPage.clickActionSubMenuItem('Based Upon Search Criteria')
        await releaseDocumentsForSearchModal.assertAtPage()
        await releaseDocumentsForSearchModal.clickSelectSearch()
        await releaseDocumentsForSearchModal.addSelectedSearch('aa')
        await releaseDocumentsForSearchModal.clickButton('Release') 
        chai.expect(
            await preservationsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n3')

        // delete seved search and folder
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('temp folder')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "temp folder"
        ])
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.deleteSelectedSavedSearch('aa')
        await deleteSearchModal.assertAtPage()
        await deleteSearchModal.clickButton('Confirm')
        chai.expect(
            await searchPage.getSavedSearchNames()
        ).to.not.include.members([
            "aa"
        ])
    })

    it('User is able to delete preservation', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.openItemMenu('test preservation')
        await preservationsPage.treeView.selectItemMenuItem('Delete Preservation Set')
        await deletePreservationModal.assertAtPage()
        await deletePreservationModal.clickButton('Delete')
        await preservationsPage.treeView.openItemMenu('custodian preservation')
        await preservationsPage.treeView.selectItemMenuItem('Delete Preservation Set')
        await deletePreservationModal.assertAtPage()
        await deletePreservationModal.clickButton('Delete')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.not.include.members([
            "test preservation",
            "custodian preservation"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Preservation Sets - Create folders, subfolders and preservations and add documents from Preservations Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let preservationsPage
    let preserveDocumentsModal
    let createPreservationSetModal
    let deletePreservationModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        preserveDocumentsModal = new PreserveDocumentsModal(browserHelper.browser, browserHelper.page)
        createPreservationSetModal = new CreatePreservationSetModal(browserHelper.browser, browserHelper.page)
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        deletePreservationModal = new DeletePreservationModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create folders, subfolders and preservation and add documents from Preservation sets', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.selectItem('master preservation')
        await preservationsPage.clickToolbarButton('Actions')
        await preservationsPage.clickActionMenuItem('Preserve All')

        //open preserve documents modal
        await preserveDocumentsModal.assertAtPage()
        await preserveDocumentsModal.treeView.openItemMenu('Preservation Sets')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Preservation Set')
        
        //open create preservation set modal
        await createPreservationSetModal.assertAtPage()
        await createPreservationSetModal.typeName('preservation from preservation')
        await createPreservationSetModal.typeDesc('preserv desc from preservation')
        await createPreservationSetModal.clickButton('Create') 
        
        //create folder
        await preserveDocumentsModal.treeView.openItemMenu('preservation from preservation')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from preservation')
        await createFolderModal.typeDescription('desc from preservation')
        await createFolderModal.clickButton('Create')

        //create subfolder
        await preserveDocumentsModal.treeView.openItemMenu('folder from preservation')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from preservation')
        await createFolderModal.typeDescription('sub desc from preservation')
        await createFolderModal.clickButton('Create')

        //preserve documents modal closes and documents adds to the preservation
        await preserveDocumentsModal.treeView.selectItem('preservation from preservation')
        await preserveDocumentsModal.clickButton('Preserve')
    })
    
    it('Verify that folders and preservation are created, documents added', async function() {
        await preservationsPage.assertAtPage()
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.include.members([
            "preservation from preservation",
            "folder from preservation",
            "sub from preservation"
        ])
        await preservationsPage.treeView.selectItem('preservation from preservation')
        chai.expect(
            await preservationsPage.documentList.getDocumentNames()
        ).to.have.members(['marina test.txt'])
    })

    it('User is able to delete folders and preservations', async function() {
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.openItemMenu('sub from preservation')
        await preservationsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await preservationsPage.treeView.openItemMenu('folder from preservation')
        await preservationsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await preservationsPage.treeView.openItemMenu('preservation from preservation')
        await preservationsPage.treeView.selectItemMenuItem('Delete Preservation Set')
        await deletePreservationModal.assertAtPage()
        await deletePreservationModal.clickButton('Delete')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.not.include.members([
            "preservation from preservation",
            "folder from preservation",
            "sub from preservation"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Preservation Sets - Create folders, subfolders and preservations and add documents from Collections', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let createFolderModal
    let deleteFolderModal
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
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        preserveDocumentsModal = new PreserveDocumentsModal(browserHelper.browser, browserHelper.page)
        createPreservationSetModal = new CreatePreservationSetModal(browserHelper.browser, browserHelper.page)
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        deletePreservationModal = new DeletePreservationModal(browserHelper.browser, browserHelper.page)
        collectionsPage = new CollectionsPage(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create folders, subfolders and preservation and add documents Collections', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionsPage.assertAtPage()
        await collectionsPage.treeView.selectItem('master collection')
        await collectionsPage.clickToolbarButton('Actions')
        await collectionsPage.clickActionMenuItem('Preserve All')

        //open preserve documents modal
        await preserveDocumentsModal.assertAtPage()
        await preserveDocumentsModal.treeView.openItemMenu('Preservation Sets')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Preservation Set')
        
        //open create preservation set modal
        await createPreservationSetModal.assertAtPage()
        await createPreservationSetModal.typeName('preservation from collections')
        await createPreservationSetModal.typeDesc('pres desc from collections')
        await createPreservationSetModal.clickButton('Create') 
        
        //create folder
        await preserveDocumentsModal.treeView.openItemMenu('preservation from collections')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from collections')
        await createFolderModal.typeDescription('desc from collections')
        await createFolderModal.clickButton('Create')

        //create subfolder
        await preserveDocumentsModal.treeView.openItemMenu('folder from collections')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from collections')
        await createFolderModal.typeDescription('sub desc from collections')
        await createFolderModal.clickButton('Create')

        //preserve documents modal closes and documents adds to the preservation
        await preserveDocumentsModal.treeView.selectItem('preservation from collections')
        await preserveDocumentsModal.clickButton('Preserve')
    })
    
    it('Verify that folders and preservation are created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.expandItem('folder from collections')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.include.members([
            "preservation from collections",
            "folder from collections",
            "sub from collections"
        ])
        await preservationsPage.treeView.selectItem('preservation from collections')
        chai.expect(
            await preservationsPage.documentList.getDocumentNames()
        ).to.have.members(['marina test.txt'])
    })

    it('User is able to delete folders and preservations', async function() {
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.openItemMenu('sub from collections')
        await preservationsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await preservationsPage.treeView.openItemMenu('folder from collections')
        await preservationsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await preservationsPage.treeView.openItemMenu('preservation from collections')
        await preservationsPage.treeView.selectItemMenuItem('Delete Preservation Set')
        await deletePreservationModal.assertAtPage()
        await deletePreservationModal.clickButton('Delete')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.not.include.members([
            "preservation from collections",
            "folder from collections",
            "sub from collections"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Preservation Sets - Create folders, subfolders and preservations and add documents from Folders Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let createFolderModal
    let deleteFolderModal
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
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        preserveDocumentsModal = new PreserveDocumentsModal(browserHelper.browser, browserHelper.page)
        createPreservationSetModal = new CreatePreservationSetModal(browserHelper.browser, browserHelper.page)
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        deletePreservationModal = new DeletePreservationModal(browserHelper.browser, browserHelper.page)
        foldersPage = new FoldersPage(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create folders, subfolders and preservation and add documents from Folders Set', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('master folder')
        await common.waitForTimeout(1000)
        await foldersPage.clickToolbarButton('Actions')
        await foldersPage.clickActionMenuItem('Preserve All')

        //open preserve documents modal
        await preserveDocumentsModal.assertAtPage()
        await preserveDocumentsModal.treeView.openItemMenu('Preservation Sets')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Preservation Set')
        
        //open create preservation set modal
        await createPreservationSetModal.assertAtPage()
        await createPreservationSetModal.typeName('preservation from folders')
        await createPreservationSetModal.typeDesc('pres desc from folders')
        await createPreservationSetModal.clickButton('Create') 
        
        //create folder
        await preserveDocumentsModal.treeView.openItemMenu('preservation from folders')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from folders')
        await createFolderModal.typeDescription('desc from folders')
        await createFolderModal.clickButton('Create')

        //create subfolder
        await preserveDocumentsModal.treeView.openItemMenu('folder from folders')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from folders')
        await createFolderModal.typeDescription('sub desc from folders')
        await createFolderModal.clickButton('Create')

        //preserve documents modal closes and documents adds to the preservation
        await preserveDocumentsModal.treeView.selectItem('preservation from folders')
        await preserveDocumentsModal.clickButton('Preserve')
    })
    
    it('Verify that folders and preservation are created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.expandItem('folder from folders')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.include.members([
            "preservation from folders",
            "folder from folders",
            "sub from folders"
        ])
        await preservationsPage.treeView.selectItem('preservation from folders')
        chai.expect(
            await preservationsPage.documentList.getDocumentNames()
        ).to.have.members(['marina test.txt'])
    })

    it('User is able to delete folders and preservations', async function() {
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.openItemMenu('sub from folders')
        await preservationsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await preservationsPage.treeView.openItemMenu('folder from folders')
        await preservationsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await preservationsPage.treeView.openItemMenu('preservation from folders')
        await preservationsPage.treeView.selectItemMenuItem('Delete Preservation Set')
        await deletePreservationModal.assertAtPage()
        await deletePreservationModal.clickButton('Delete')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.not.include.members([
            "preservation from folders",
            "folder from folders",
            "sub from folders"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Preservation Sets - Create folders, subfolders and preservations and add documents from Policies Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let createFolderModal
    let deleteFolderModal
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
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        preserveDocumentsModal = new PreserveDocumentsModal(browserHelper.browser, browserHelper.page)
        createPreservationSetModal = new CreatePreservationSetModal(browserHelper.browser, browserHelper.page)
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        deletePreservationModal = new DeletePreservationModal(browserHelper.browser, browserHelper.page)
        policiesPage = new PoliciesPage(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create folders, subfolders and preservation and add documents from Policies Set', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Policies')
        await policiesPage.assertAtPage()
        await policiesPage.treeView.selectItem('master policy')
        await policiesPage.clickToolbarButton('Actions')
        await policiesPage.clickActionMenuItem('Preserve All')

        //open preserve documents modal
        await preserveDocumentsModal.assertAtPage()
        await preserveDocumentsModal.treeView.openItemMenu('Preservation Sets')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Preservation Set')
        
        //open create preservation set modal
        await createPreservationSetModal.assertAtPage()
        await createPreservationSetModal.typeName('preservation from policies')
        await createPreservationSetModal.typeDesc('pres desc from policies')
        await createPreservationSetModal.clickButton('Create') 
        
        //create folder
        await preserveDocumentsModal.treeView.openItemMenu('preservation from policies')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from policies')
        await createFolderModal.typeDescription('desc from policies')
        await createFolderModal.clickButton('Create')

        //create subfolder
        await preserveDocumentsModal.treeView.openItemMenu('folder from policies')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from policies')
        await createFolderModal.typeDescription('sub desc from policies')
        await createFolderModal.clickButton('Create')

        //preserve documents modal closes and documents adds to the preservation
        await preserveDocumentsModal.treeView.selectItem('preservation from policies')
        await preserveDocumentsModal.clickButton('Preserve')
    })
    
    it('Verify that folders and preservation are created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.expandItem('folder from policies')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.include.members([
            "preservation from policies",
            "folder from policies",
            "sub from policies"
        ])
        await preservationsPage.treeView.selectItem('preservation from policies')
        chai.expect(
            await preservationsPage.documentList.getDocumentNames()
        ).to.have.members(['marina test.txt'])
    })

    it('User is able to delete folders and preservations', async function() {
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.openItemMenu('sub from policies')
        await preservationsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await preservationsPage.treeView.openItemMenu('folder from policies')
        await preservationsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await preservationsPage.treeView.openItemMenu('preservation from policies')
        await preservationsPage.treeView.selectItemMenuItem('Delete Preservation Set')
        await deletePreservationModal.assertAtPage()
        await deletePreservationModal.clickButton('Delete')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.not.include.members([
            "preservation from policies",
            "folder from policies",
            "sub from policies"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Preservation Sets - Create folders, subfolders and preservations and add documents from Exports Set', async function() {
    let loginUtil    
    let projectNavigation
    let browserHelper
    let createFolderModal
    let deleteFolderModal
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
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        preserveDocumentsModal = new PreserveDocumentsModal(browserHelper.browser, browserHelper.page)
        createPreservationSetModal = new CreatePreservationSetModal(browserHelper.browser, browserHelper.page)
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        deletePreservationModal = new DeletePreservationModal(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create folders, subfolders and preservation and add documents from Exports Set', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.selectItem('master export')
        await exportsPage.clickToolbarButton('Actions')
        await exportsPage.clickActionMenuItem('Preserve All')

        //open preserve documents modal
        await preserveDocumentsModal.assertAtPage()
        await preserveDocumentsModal.treeView.openItemMenu('Preservation Sets')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Preservation Set')
        
        //open create preservation set modal
        await createPreservationSetModal.assertAtPage()
        await createPreservationSetModal.typeName('preservation from exports')
        await createPreservationSetModal.typeDesc('pres desc from exports')
        await createPreservationSetModal.clickButton('Create') 
        
        //create folder
        await preserveDocumentsModal.treeView.openItemMenu('preservation from exports')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from exports')
        await createFolderModal.typeDescription('desc from exports')
        await createFolderModal.clickButton('Create')

        //create subfolder
        await preserveDocumentsModal.treeView.openItemMenu('folder from exports')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from exports')
        await createFolderModal.typeDescription('sub desc from exports')
        await createFolderModal.clickButton('Create')

        //preserve documents modal closes and documents adds to the preservation
        await preserveDocumentsModal.treeView.selectItem('preservation from exports')
        await preserveDocumentsModal.clickButton('Preserve')
    })
    
    it('Verify that folders and preservation are created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.expandItem('folder from exports')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.include.members([
            "preservation from exports",
            "folder from exports",
            "sub from exports"
        ])
        await preservationsPage.treeView.selectItem('preservation from exports')
        chai.expect(
            await preservationsPage.documentList.getDocumentNames()
        ).to.have.members(['marina test.txt'])
    })

    it('User is able to delete folders and preservations', async function() {
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.openItemMenu('sub from exports')
        await preservationsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await preservationsPage.treeView.openItemMenu('folder from exports')
        await preservationsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await preservationsPage.treeView.openItemMenu('preservation from exports')
        await preservationsPage.treeView.selectItemMenuItem('Delete Preservation Set')
        await deletePreservationModal.assertAtPage()
        await deletePreservationModal.clickButton('Delete')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.not.include.members([
            "preservation from exports",
            "folder from exports",
            "sub from exports"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Preservation Sets - Create and delete folders, subfolders and preservation, add documets to preservation from Explorer Graph', async function() {
    let loginUtil    
    let projectNavigation
    let preservationsPage
    let browserHelper
    let deleteFolderModal
    let explorerPage
    let preserveDocumentsModal
    let createFolderModal
    let deletePreservationModal
    let createPreservationSetModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        explorerPage = new ExplorerPage(browserHelper.browser, browserHelper.page) 
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        preserveDocumentsModal = new PreserveDocumentsModal(browserHelper.browser, browserHelper.page)
        deletePreservationModal = new DeletePreservationModal(browserHelper.browser, browserHelper.page)
        createPreservationSetModal = new CreatePreservationSetModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject')) 
    })

    it('User is able to create a folder, subfolder and preservation and add documents from Explorer Graph', async function () {
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
        await explorerPage.clickActionMenuItem('Preserve')

        //open Preserve documents modal
        await preserveDocumentsModal.assertAtPage()
        await preserveDocumentsModal.treeView.openItemMenu('Preservation Sets')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Preservation Set')

        //open create new preservation set modal
        await createPreservationSetModal.assertAtPage()
        await createPreservationSetModal.typeName('preservation from explorer graph')
        await createPreservationSetModal.typeDesc('desc from explorer graph')
        await createPreservationSetModal.clickButton('Create')

        //create folder
        await preserveDocumentsModal.treeView.openItemMenu('Preservation Sets')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from explorer graph')
        await createFolderModal.typeDescription('desc from explorer graph')
        await createFolderModal.clickButton('Create')
        
        //create subfolder
        await preserveDocumentsModal.treeView.openItemMenu('folder from explorer graph')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from explorer graph')
        await createFolderModal.typeDescription('sub desc from explorer graph')
        await createFolderModal.clickButton('Create')
        
        //add document to preservation
        await preserveDocumentsModal.assertAtPage()
        await preserveDocumentsModal.treeView.selectItem('preservation from explorer graph')
        await common.waitForTimeout(500)
        await preserveDocumentsModal.clickButton('Preserve')
    })
    
    it('Verify that folders and preservation are created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.expandItem('folder from explorer graph')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.include.members([
            "preservation from explorer graph",
            "folder from explorer graph",
            "sub from explorer graph"
        ])
        await preservationsPage.treeView.selectItem('preservation from explorer graph')
        chai.expect(
            await preservationsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n1')
    })

    it('User is able to delete folders', async function() {
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.openItemMenu('sub from explorer graph')
        await preservationsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await preservationsPage.treeView.openItemMenu('folder from explorer graph')
        await preservationsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await preservationsPage.treeView.openItemMenu('preservation from explorer graph')
        await preservationsPage.treeView.selectItemMenuItem('Delete Preservation Set')
        await deletePreservationModal.assertAtPage()
        await deletePreservationModal.clickButton('Delete')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.not.include.members([
            "preservation from explorer graph",
            "folder from explorer graph",
            "sub from explorer graph"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Preservation Sets - Create and delete folders, subfolders and preservation, add documets to preservation from Search Page', async function() {
    let loginUtil    
    let projectNavigation
    let preservationsPage
    let browserHelper
    let createFolderModal
    let deleteFolderModal
    let preserveDocumentsModal
    let searchPage
    let searchResultsPage
    let createPreservationSetModal
    let deletePreservationModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page) 
        preserveDocumentsModal = new PreserveDocumentsModal(browserHelper.browser, browserHelper.page)
        searchPage = new SearchPage(browserHelper.browser, browserHelper.page)
        searchResultsPage = new SearchResultsPage(browserHelper.browser, browserHelper.page)
        createPreservationSetModal = new CreatePreservationSetModal(browserHelper.browser, browserHelper.page)
        deletePreservationModal = new DeletePreservationModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create a folder, subfolder and preservation and add documents from Search Page', async function() {
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
        await searchResultsPage.clickActionMenuItem('Preserve Selected')

        //open Preserve documents modal
        await preserveDocumentsModal.assertAtPage()
        await preserveDocumentsModal.treeView.openItemMenu('Preservation Sets')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Preservation Set')

        //open create preservation set modal
        await createPreservationSetModal.assertAtPage()
        await createPreservationSetModal.typeName('preservation from search')
        await createPreservationSetModal.typeDesc('description from search')
        await createPreservationSetModal.clickButton('Create') 
         
        //create folder
        await preserveDocumentsModal.treeView.openItemMenu('Preservation Sets')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from search')
        await createFolderModal.typeDescription('desc from search')
        await createFolderModal.clickButton('Create')
   
        //create subfolder
        await preserveDocumentsModal.treeView.openItemMenu('folder from search')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from search')
        await createFolderModal.typeDescription('sub desc from search')
        await createFolderModal.clickButton('Create')

        //add documents to preservation
        await preserveDocumentsModal.treeView.selectItem('preservation from search')
        await preserveDocumentsModal.clickButton('Preserve')
    })

    it('Verify that folders created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.expandItem('folder from search')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.include.members([
            "preservation from search",
            "folder from search",
            "sub from search"
        ])
        await preservationsPage.treeView.selectItem('preservation from search')
        chai.expect(
            await preservationsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n1')
    })

    it('User is able to delete folders', async function() {
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.openItemMenu('sub from search')
        await preservationsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await preservationsPage.treeView.openItemMenu('folder from search')
        await preservationsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await preservationsPage.treeView.openItemMenu('preservation from search')
        await preservationsPage.treeView.selectItemMenuItem('Delete Preservation Set')
        await deletePreservationModal.assertAtPage()
        await deletePreservationModal.clickButton('Delete')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.not.include.members([
            "preservation from search",
            "folder from search",
            "sub from search"
        ])
    })
 
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Preservation Sets - Create and delete folders, subfolders and preservation, add documets to preservation from Explorer Views', async function() {
    let loginUtil    
    let projectNavigation
    let preservationsPage
    let browserHelper
    let deleteFolderModal
    let explorerPage
    let deletePreservationModal
    let explorerDocumentPage
    let preserveDocumentsModal
    let createPreservationSetModal
    let createFolderModal
    let topNavigation

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        explorerPage = new ExplorerPage(browserHelper.browser, browserHelper.page) 
        deletePreservationModal = new DeletePreservationModal(browserHelper.browser, browserHelper.page)
        explorerDocumentPage = new ExplorerDocumentPage(browserHelper.browser, browserHelper.page)
        preserveDocumentsModal = new PreserveDocumentsModal(browserHelper.browser, browserHelper.page)
        createPreservationSetModal = new CreatePreservationSetModal(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        topNavigation = new TopNavigation(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject')) 
    })

    it('User is able to create a folder, subfolder and preservation and add documents from Explorer Views', async function () {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Explorer')
        await explorerPage.assertAtPage()
        await explorerPage.openActionMenu()
        await explorerPage.clickActionMenuItem('Preserve')

        //open Preserve documents modal
        await preserveDocumentsModal.assertAtPage()
        await preserveDocumentsModal.treeView.openItemMenu('Preservation Sets')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Preservation Set')

        //open create new preservation set modal
        await createPreservationSetModal.assertAtPage()
        await createPreservationSetModal.typeName('preservation from explorer views')
        await createPreservationSetModal.typeDesc('desc from explorer views')
        await createPreservationSetModal.clickButton('Create')

        //create folder
        await preserveDocumentsModal.treeView.openItemMenu('Preservation Sets')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder from explorer views')
        await createFolderModal.typeDescription('desc from explorer views')
        await createFolderModal.clickButton('Create')
        
        //create subfolder
        await preserveDocumentsModal.treeView.openItemMenu('folder from explorer views')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('sub from explorer views')
        await createFolderModal.typeDescription('sub desc from explorer views')
        await createFolderModal.clickButton('Create')
        await preserveDocumentsModal.assertAtPage()
        await preserveDocumentsModal.clickButton('Cancel')
        
        //add document to folder
        await explorerPage.assertAtPage()
        await explorerPage.openActionMenu()
        await explorerPage.clickActionMenuItem('View Document Set')
        await explorerPage.waitForTaskCountToBeZero('0')
        await explorerDocumentPage.assertAtPage()
        await explorerDocumentPage.documentList.clickNthDocumentCheckbox(0)
        await explorerDocumentPage.clickToolbarButton('Actions')
        await explorerDocumentPage.clickActionMenuItem('Preserve Selected')
        await preserveDocumentsModal.assertAtPage()
        await preserveDocumentsModal.treeView.openItemMenu('Preservation Sets')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Preservation Set')

        //open create preservation set modal
        await createPreservationSetModal.assertAtPage()
        await createPreservationSetModal.typeName('preservation from view')
        await createPreservationSetModal.typeDesc('description from view')
        await createPreservationSetModal.clickButton('Create') 

         //create folder
         await preserveDocumentsModal.treeView.openItemMenu('Preservation Sets')
         await preserveDocumentsModal.treeView.selectItemMenuItem('New Folder')
         await createFolderModal.assertAtPage()
         await createFolderModal.typeName('folder from view')
         await createFolderModal.typeDescription('desc from view')
         await createFolderModal.clickButton('Create')
    
         //create subfolder
         await preserveDocumentsModal.treeView.openItemMenu('folder from view')
         await preserveDocumentsModal.treeView.selectItemMenuItem('New Folder')
         await createFolderModal.assertAtPage()
         await createFolderModal.typeName('sub from view')
         await createFolderModal.typeDescription('sub desc from view')
         await createFolderModal.clickButton('Create')
 
         //add documents to folder
         await preserveDocumentsModal.treeView.selectItem('preservation from view')
         await preserveDocumentsModal.clickButton('Preserve')
        
    })
    
    it('Verify that folders and preservation are created, documents added', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.expandItem('folder from explorer views')
        await preservationsPage.treeView.expandItem('folder from view')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.include.members([
            "preservation from explorer views",
            "folder from explorer views",
            "sub from explorer views",
            "preservation from view",
            "folder from view",
            'sub from view'
        ])
        await preservationsPage.treeView.selectItem('preservation from view')
        chai.expect(
            await preservationsPage.documentList.getDocumentsCount()
        ).to.equal('Documents:\n1')
    })

    it('User is able to delete folders', async function() {
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.openItemMenu('sub from explorer views')
        await preservationsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await preservationsPage.treeView.openItemMenu('folder from explorer views')
        await preservationsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await preservationsPage.treeView.openItemMenu('preservation from explorer views')
        await preservationsPage.treeView.selectItemMenuItem('Delete Preservation Set')
        await deletePreservationModal.assertAtPage()
        await deletePreservationModal.clickButton('Delete')
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.openItemMenu('sub from view')
        await preservationsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.openItemMenu('folder from view')
        await preservationsPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await preservationsPage.treeView.openItemMenu('preservation from view')
        await preservationsPage.treeView.selectItemMenuItem('Delete Preservation Set')
        await deletePreservationModal.assertAtPage()
        await deletePreservationModal.clickButton('Delete')
        await topNavigation.waitForToastMessageToContain('Document Set has been deleted')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.not.include.members([
            "preservation from explorer graph",
            "folder from explorer graph",
            "sub from explorer graph",
            "sub from view",
            "folder from view",
            "preservation from view"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})
