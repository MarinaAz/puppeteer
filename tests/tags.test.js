const ProjectNavigation = require("../pages/components/ProjectNavigation")
const LoginUtil = require("../util/LoginUtil")
const BrowserHelper = require("../util/BrowserHelper")
const chai = require('chai')
const config = require('config')
const common = require("../common")
const TopNavigation = require("../pages/components/TopNavigation")
const SettingsPage = require("../pages/SettingsPage")
const CreateTagModal = require("../pages/modals/CreateTagModal")
const EditTagModal = require("../pages/modals/EditTagModal")
const RemoveTagModal = require("../pages/modals/RemoveTagModal")
const FoldersPage = require("../pages/FoldersPage")
const DocumentViewerPage = require("../pages/DocumentViewerPage")
const SearchPage = require("../pages/SearchPage")
const SearchResultsPage = require("../pages/SearchResultsPage")
const ParentOnlyModal = require("../pages/modals/ParentOnlyModal")
const ChildOnlyModal = require("../pages/modals/ChildOnlyModal")
const ParentAndChildModal = require("../pages/modals/ParentAndChildModal")
const PreservationsPage = require("../pages/PreservationsPage")
const PreserveDocumentsModal = require("../pages/modals/PreserveDocumentsModal")
const CreatePreservationSetModal = require("../pages/modals/CreatePreservationSetModal")
const DeletePreservationModal = require("../pages/modals/DeletePreservationModal")
const CollectionsPage = require("../pages/CollectionsPage")
const CollectDocumentsModal = require("../pages/modals/CollectDocumentsModal")
const CreateCollectionModal = require("../pages/modals/CreateCollectionModal")
const DeleteCollectionModal = require("../pages/modals/DeleteCollectionModal")
const AddToAFolderModal = require("../pages/modals/AddToAFolderModal")
const CreateFolderModal = require("../pages/modals/CreateFolderModal")
const DeleteFolderModal = require("../pages/modals/DeleteFolderModal")
const PoliciesPage = require("../pages/PoliciesPage")
const AddFolderModal = require("../pages/modals/AddFolderModal")
const SaveSearchCriteriaModal = require("../pages/modals/SaveSearchCriteriaModal")
const CreatePolicyModal = require("../pages/modals/CreatePolicyModal")
const DeletePolicyModal = require("../pages/modals/DeletePolicyModal")
const DeleteSearchModal = require("../pages/modals/DeleteSearchModal")
const ExportsPage = require("../pages/ExportsPage")
const AddToAnExportModal = require("../pages/modals/AddToAnExportModal")
const DeleteExportModal = require("../pages/modals/DeleteExportModal")
const CreateExportModal = require("../pages/modals/CreateExportModal")
const ExplorerPage = require("../pages/ExplorerPage")
const ExplorerDocumentPage = require("../pages/ExplorerDocumentPage")


describe('Tags - Create Tags on Project Administration -> Settings -> Manage Tags page', async function() {

    let loginUtil
    let projectNavigation
    let browserHelper
    let settingsPage
    let createTagModal
    let editTagModal
    let removeTagModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()
        
        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        settingsPage = new SettingsPage(browserHelper.browser, browserHelper.page)
        createTagModal = new CreateTagModal(browserHelper.browser, browserHelper.page)
        editTagModal = new EditTagModal(browserHelper.browser, browserHelper.page)
        removeTagModal = new RemoveTagModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it(`Create a tag`, async function() {
        await projectNavigation.openProjectAdministrationMenu()
        await projectNavigation.clickMenuItem('Settings')
        await settingsPage.assertAtPage()
        await settingsPage.clickMenuOption('Manage Tags')
        // crete a tag
        await settingsPage.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName('auto tag')
        await createTagModal.clickButton('Create')
        chai.expect(
            await settingsPage.getListedTags()
        ).to.include.members([
            'auto tag'
        ])
    })

    it('Hide tags on the Manage Tags page', async function() {
        await settingsPage.setHiddenTag('auto tag')
        chai.expect(
            await settingsPage.getListedTags()
        ).to.not.include.members([
            'auto tag'
        ])

        await settingsPage.clickTab('Hidden Tags')
        chai.expect(
            await settingsPage.getListedTags()
        ).to.include.members([
            'auto tag'
        ])
    })

    it('Filter Hidden Tags by name on the Manage Tags page', async function() {
        await settingsPage.searchForTag('auto tag')
        chai.expect(
            await settingsPage.getListedTags()
        ).to.have.members(['auto tag'])
        await settingsPage.searchForTag('')
    })
    
    it('Unhide tags on the Manage Tags page', async function() {
        await settingsPage.setVisibleTag('auto tag')
        chai.expect(
            await settingsPage.getListedTags()
        ).to.not.include.members([
            'auto tag'
        ])

        await settingsPage.clickTab('Visible Tags')
        await settingsPage.page.reload()
        chai.expect(
            await settingsPage.getListedTags()
        ).to.include.members([
            'auto tag'
        ])
    })

    it('Filter Visible Tags by name on the Manage Tags page', async function() {
        await settingsPage.searchForTag('auto tag')
        chai.expect(
            await settingsPage.getListedTags()
        ).to.have.members(['auto tag'])
        await settingsPage.searchForTag('')
    })

    it('Edit Tag  on the Manage Tags page', async function() {
        await settingsPage.editTag('auto tag')
        await editTagModal.assertAtPage()
        await editTagModal.typeName('auto tag EDITED')
        await editTagModal.clickButton('Save')
        chai.expect(
            await settingsPage.getListedTags()
        ).to.include.members([
            'auto tag EDITED'
        ])
    })

    it('Delete Tag on the Manage Tags page', async function() {
        await settingsPage.removeTag('auto tag EDITED')
        await removeTagModal.assertAtPage()
        await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        await settingsPage.page.reload()
        chai.expect(
            await settingsPage.getListedTags()
        ).to.not.include.members([
            'auto tag EDITED'
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Tags 01 - Create Tags via Viewer of any document', async function() {
    let loginUtil
    let projectNavigation
    let browserHelper
    let foldersPage
    let createTagModal
    let removeTagModal
    let documentViewerPage
    let settingsPage

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()
        
        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        foldersPage = new FoldersPage(browserHelper.browser, browserHelper.page)
        createTagModal = new CreateTagModal(browserHelper.browser, browserHelper.page)
        removeTagModal = new RemoveTagModal(browserHelper.browser, browserHelper.page)
        documentViewerPage = new DocumentViewerPage(browserHelper.browser, browserHelper.page)
        settingsPage = new SettingsPage(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('Open document in Viewer', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('master folder')
        await foldersPage.documentList.clickDocument('marina test.txt')
        await documentViewerPage.assertAtPage()
    })

    it('Create a new tag from Viewer', async function()  {
        await documentViewerPage.clickTab('Tags')
        await documentViewerPage.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName('auto tag from viewer')
        await createTagModal.clickButton('Create')
        await documentViewerPage.assertAtPage()
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['auto tag from viewer'])
    })

    it('Make document tagged and untagged via Viewer of any document', async function() {
        await documentViewerPage.addSelectedTag('auto tag from viewer')
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['auto tag from viewer'])
        // untag the document
        await documentViewerPage.removeAddedTag('auto tag from viewer')
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.not.include.members(['auto tag from viewer'])
    })

    it('Delete previosly created tag', async function() {
        await projectNavigation.openProjectAdministrationMenu()
        await projectNavigation.clickMenuItem('Settings')
        await settingsPage.assertAtPage()
        await settingsPage.clickMenuOption('Manage Tags')
        await settingsPage.removeTag('auto tag from viewer')
        await removeTagModal.assertAtPage()
        await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        await settingsPage.page.reload()
        chai.expect(
            await settingsPage.getListedTags()
        ).to.not.include.members([
            'auto tag from viewer'
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Tags 03 - Create Tag via Actions menu of Searches Set and add tags to the documents ', async function() {
    let loginUtil
    let projectNavigation
    let browserHelper
    let searchPage
    let searchResultsPage
    let createTagModal
    let removeTagModal
    let documentViewerPage
    let settingsPage
    let parentOnlyModal
    let childOnlyModal
    let parentAndChildModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()
        
        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        searchPage = new SearchPage(browserHelper.browser, browserHelper.page)
        searchResultsPage = new SearchResultsPage(browserHelper.browser, browserHelper.page)
        createTagModal = new CreateTagModal(browserHelper.browser, browserHelper.page)
        removeTagModal = new RemoveTagModal(browserHelper.browser, browserHelper.page)
        documentViewerPage = new DocumentViewerPage(browserHelper.browser, browserHelper.page)
        settingsPage = new SettingsPage(browserHelper.browser, browserHelper.page)
        parentOnlyModal = new ParentOnlyModal(browserHelper.browser, browserHelper.page)
        childOnlyModal = new ChildOnlyModal(browserHelper.browser, browserHelper.page)
        parentAndChildModal = new ParentAndChildModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('Open documents with attachments', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideTab('Metadata')
        await searchPage.selectMetadataFromList('Metadata Field')
        await searchPage.searchForMetadataField('Attachment Count')
        await searchPage.addMetadataField('Attachment Count')
        await searchPage.clickFullTextElementClickToInsert()
        await searchPage.typeFullTextElementTerm('7')  
        await searchPage.clickSearchButton()
    })
    
    it('Create a tag from Action menu "Parent only"', async function() {
        await searchResultsPage.assertAtPage()
        await searchResultsPage.documentList.clickNthDocumentCheckbox(0) 
        await searchResultsPage.clickToolbarButton("Actions")
        await searchResultsPage.clickActionMenuItem('Tag Selected')
        await searchResultsPage.clickActionSubMenuItem('Parent only')
        await parentOnlyModal.assertAtPage()
        await parentOnlyModal.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName("tag from search parent only")
        await createTagModal.clickButton('Create')
        await parentOnlyModal.assertAtPage()
        chai.expect(
            await parentOnlyModal.getTagsList()
        ).to.include.members([
            'tag from search parent only'
        ])
    })

    it('Make "Parent only" documents tagged', async function() {
        await parentOnlyModal.selectTag("tag from search parent only")
        await parentOnlyModal.clickButton('Ok')
        await searchResultsPage.documentList.expandNthDocumentTree(0)
        await searchResultsPage.documentList.clickNthDocument(0)
        await documentViewerPage.assertAtPage()
        await documentViewerPage.clickTab('Tags')
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from search parent only'])

        // click next document to verify that attachmnet doesn't have a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from search parent only'])

        // remove the tag from parent
        await documentViewerPage.clickNavigationButton('Prev')
        await documentViewerPage.removeAddedTag('tag from search parent only')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from search parent only'])
    })

    it('Create a tag from Action menu "Child only"', async function() {
        await searchResultsPage.assertAtPage()
        await searchResultsPage.clickToolbarButton("Actions")
        await searchResultsPage.clickActionMenuItem('Tag Selected')
        await searchResultsPage.clickActionSubMenuItem('Child only')
        await childOnlyModal.assertAtPage()
        await childOnlyModal.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName("tag from search child only")
        await createTagModal.clickButton('Create')
        await childOnlyModal.assertAtPage()
        chai.expect(
            await childOnlyModal.getTagsList()
        ).to.include.members([
            'tag from search child only'
        ])
    })

    it('Make "Child only" documents tagged', async function() {
        await childOnlyModal.selectTag("tag from search child only")
        await childOnlyModal.clickButton('Ok')
        await documentViewerPage.assertAtPage()
        // check that parent doesn't have a tag
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from search child only'])

        // check that child has a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from search child only'])
    })
    
    it('Remove the tag from child via Viewer and via Actions menu', async function() {
        // via Viewer
        await documentViewerPage.removeAddedTag('tag from search child only')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from search parent only'])
        
        // via Actions menu
        await searchResultsPage.assertAtPage()
        await searchResultsPage.clickToolbarButton("Actions")
        await searchResultsPage.clickActionMenuItem('Remove Tag Selected')
        await searchResultsPage.clickActionSubMenuItem('Child only')
        await childOnlyModal.assertAtPage()
        await childOnlyModal.selectTag("tag from search child only")
        await childOnlyModal.clickButton('Ok')
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from search parent only'])
        // back to the parent document
        await documentViewerPage.clickNavigationButton('Prev')
        await documentViewerPage.clickNavigationButton('Prev')
    })

    it('Create a tag from Action menu "Parent and child"', async function() {
        await searchResultsPage.assertAtPage()
        await searchResultsPage.clickToolbarButton("Actions")
        await searchResultsPage.clickActionMenuItem('Tag Selected')
        await searchResultsPage.clickActionSubMenuItem('Parent and child')
        await parentAndChildModal.assertAtPage()
        await parentAndChildModal.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName("tag from search parent and child")
        await createTagModal.clickButton('Create')
        await parentAndChildModal.assertAtPage()
        chai.expect(
            await parentAndChildModal.getTagsList()
        ).to.include.members([
            'tag from search parent and child'
        ])
    })

    it('Make "Parent and child" documents tagged', async function() {
        await parentAndChildModal.selectTag("tag from search parent and child")
        await parentAndChildModal.clickButton('Ok')
        await documentViewerPage.assertAtPage()
        // check that parent has a tag
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from search parent and child'])

        // check that child has a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from search parent and child'])
    })
    
    it('Remove the tag from child and parent via Viewer and via Actions menu', async function() {
        // remove the tag from child
        await documentViewerPage.removeAddedTag('tag from search parent and child')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from search parent and child'])
        await documentViewerPage.clickNavigationButton('Prev')
        // remove the tag from parent
        await documentViewerPage.removeAddedTag('tag from search parent and child')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from search parent and child'])
        // remove tags via Actions menu
        await searchResultsPage.assertAtPage()
        await searchResultsPage.clickToolbarButton("Actions")
        await searchResultsPage.clickActionMenuItem('Remove Tag Selected')
        await searchResultsPage.clickActionSubMenuItem('Parent and child')
        await parentAndChildModal.assertAtPage()
        await parentAndChildModal.selectTag("tag from search parent and child")
        await parentAndChildModal.clickButton('Ok')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from search parent only'])
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from search parent only'])
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from search parent only'])
    })

    it('Delete previosly created tags', async function() {
        await projectNavigation.openProjectAdministrationMenu()
        await projectNavigation.clickMenuItem('Settings')
        await settingsPage.assertAtPage()
        await settingsPage.clickMenuOption('Manage Tags')
        await settingsPage.removeTag('tag from search parent only')
        await removeTagModal.assertAtPage()
        await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        await settingsPage.page.reload()
        await settingsPage.removeTag('tag from search child only')
        await removeTagModal.assertAtPage()
        await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        await settingsPage.page.reload()
        await settingsPage.removeTag('tag from search parent and child')
        await removeTagModal.assertAtPage()
        await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        await settingsPage.page.reload()
        chai.expect(
            await settingsPage.getListedTags()
        ).to.not.include.members([
            'tag from search parent only',
            'tag from search child only',
            'tag from search parent and child'
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Tags 04 - Create Tag via Actions menu of Preservation Sets and add tags to the documents ', async function() {
    let loginUtil
    let projectNavigation
    let browserHelper
    let searchPage
    let preservationsPage
    let preserveDocumentsModal
    let deletePreservationModal
    let createPreservationSetModal
    let searchResultsPage
    let createTagModal
    let removeTagModal
    let documentViewerPage
    let settingsPage
    let parentOnlyModal
    let childOnlyModal
    let parentAndChildModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()
        
        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        searchPage = new SearchPage(browserHelper.browser, browserHelper.page)
        preservationsPage = new PreservationsPage(browserHelper.browser, browserHelper.page)
        preserveDocumentsModal = new PreserveDocumentsModal(browserHelper.browser, browserHelper.page)
        createPreservationSetModal = new CreatePreservationSetModal(browserHelper.browser, browserHelper.page)
        deletePreservationModal = new DeletePreservationModal(browserHelper.browser, browserHelper.page)
        searchResultsPage = new SearchResultsPage(browserHelper.browser, browserHelper.page)
        createTagModal = new CreateTagModal(browserHelper.browser, browserHelper.page)
        removeTagModal = new RemoveTagModal(browserHelper.browser, browserHelper.page)
        documentViewerPage = new DocumentViewerPage(browserHelper.browser, browserHelper.page)
        settingsPage = new SettingsPage(browserHelper.browser, browserHelper.page)
        parentOnlyModal = new ParentOnlyModal(browserHelper.browser, browserHelper.page)
        childOnlyModal = new ChildOnlyModal(browserHelper.browser, browserHelper.page)
        parentAndChildModal = new ParentAndChildModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('Search for documents with attachments', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideTab('Metadata')
        await searchPage.selectMetadataFromList('Metadata Field')
        await searchPage.searchForMetadataField('Attachment Count')
        await searchPage.addMetadataField('Attachment Count')
        await searchPage.clickFullTextElementClickToInsert()
        await searchPage.typeFullTextElementTerm('7')  
        await searchPage.clickSearchButton()
    })

    it('Create a new preservation with family documents', async function() {
        await searchResultsPage.assertAtPage()
        await searchResultsPage.documentList.clickNthDocumentCheckbox(0) 
        await searchResultsPage.clickToolbarButton("Actions")
        await searchResultsPage.clickActionMenuItem('Preserve Selected')

        // open preserve documents modal
        await preserveDocumentsModal.assertAtPage()
        await preserveDocumentsModal.treeView.openItemMenu('Preservation Sets')
        await preserveDocumentsModal.treeView.selectItemMenuItem('New Preservation Set')

        //open create preservation set modal
        await createPreservationSetModal.assertAtPage()
        await createPreservationSetModal.typeName('preservation for tags')
        await createPreservationSetModal.typeDesc('tags testing')
        await createPreservationSetModal.clickButton('Create')

        //preserve documents modal closes and documents adds to the preservation
        await preserveDocumentsModal.treeView.selectItem('preservation for tags')
        await preserveDocumentsModal.clickButton('Preserve')
    })
    
    it('Create a tag from Preservation sets Action menu "Parent only"', async function() {
        // go to preservation sets page
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Preservations')
        await preservationsPage.assertAtPage()
        await preservationsPage.treeView.selectItem('preservation for tags')

        // open viewer
        await preservationsPage.documentList.clickNthDocument(0)
        await documentViewerPage.assertAtPage()
        await documentViewerPage.clickTab('Tags')
        await preservationsPage.documentList.expandNthDocumentTree(0)
        await preservationsPage.clickToolbarButton('Actions')
        await preservationsPage.clickActionMenuItem('Tag All')

        // create a tag
        await preservationsPage.clickActionSubMenuItem('Parent only')
        await parentOnlyModal.assertAtPage()
        await parentOnlyModal.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName("tag from preservation parent only")
        await createTagModal.clickButton('Create')
        await parentOnlyModal.assertAtPage()
        chai.expect(
            await parentOnlyModal.getTagsList()
        ).to.include.members([
            'tag from preservation parent only'
        ])
    })

    it('Make "Parent only" documents tagged', async function() {
        await parentOnlyModal.selectTag("tag from preservation parent only")
        await parentOnlyModal.clickButton('Ok')
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from preservation parent only'])

        // click next document to verify that attachmnet doesn't have a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from preservation parent only'])

        // remove the tag from parent
        await documentViewerPage.clickNavigationButton('Prev')
        await documentViewerPage.removeAddedTag('tag from preservation parent only')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from preservation parent only'])
    })

    it('Create a tag from Preservation sets Action menu "Child only"', async function() {
        await preservationsPage.assertAtPage()
        await preservationsPage.clickToolbarButton("Actions")
        await preservationsPage.clickActionMenuItem('Tag All')
        await preservationsPage.clickActionSubMenuItem('Child only')
        await childOnlyModal.assertAtPage()
        await childOnlyModal.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName("tag from preservation child only")
        await createTagModal.clickButton('Create')
        await childOnlyModal.assertAtPage()
        chai.expect(
            await childOnlyModal.getTagsList()
        ).to.include.members([
            'tag from preservation child only'
        ])
    })

    it('Make "Child only" documents tagged', async function() {
        await childOnlyModal.selectTag("tag from preservation child only")
        await childOnlyModal.clickButton('Ok')
        await documentViewerPage.assertAtPage()
        // check that parent doesn't have a tag
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from preservation child only'])

        // check that child has a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from preservation child only'])
    })
    
    it('Remove the tag from child via Viewer and via Actions menu', async function() {
        // via Viewer
        await documentViewerPage.removeAddedTag('tag from preservation child only')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from preservation child only'])
        
        // via Actions menu
        await preservationsPage.assertAtPage()
        await preservationsPage.clickToolbarButton("Actions")
        await preservationsPage.clickActionMenuItem('Remove Tag All')
        await preservationsPage.clickActionSubMenuItem('Child only')
        await childOnlyModal.assertAtPage()
        await childOnlyModal.selectTag("tag from preservation child only")
        await childOnlyModal.clickButton('Ok')
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from preservation parent only'])
        // back to the parent document
        await documentViewerPage.clickNavigationButton('Prev')
        await documentViewerPage.clickNavigationButton('Prev')
    })

    it('Create a tag from Preservation Sets Action menu "Parent and child"', async function() {
        await preservationsPage.assertAtPage()
        await preservationsPage.clickToolbarButton("Actions")
        await preservationsPage.clickActionMenuItem('Tag All')
        await preservationsPage.clickActionSubMenuItem('Parent and child')
        await parentAndChildModal.assertAtPage()
        await parentAndChildModal.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName("tag from preservation parent and child")
        await createTagModal.clickButton('Create')
        await parentAndChildModal.assertAtPage()
        chai.expect(
            await parentAndChildModal.getTagsList()
        ).to.include.members([
            'tag from preservation parent and child'
        ])
    })

    it('Make "Parent and child" documents tagged', async function() {
        await parentAndChildModal.selectTag("tag from preservation parent and child")
        await parentAndChildModal.clickButton('Ok')
        await documentViewerPage.assertAtPage()
        // check that parent has a tag
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from preservation parent and child'])

        // check that child has a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from preservation parent and child'])
    })
    
    it('Remove the tag from child and parent via Viewer and via Actions menu', async function() {
        // remove the tag from child
        await documentViewerPage.removeAddedTag('tag from preservation parent and child')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from preservation parent and child'])
        await documentViewerPage.clickNavigationButton('Prev')
        // remove the tag from parent
        await documentViewerPage.removeAddedTag('tag from preservation parent and child')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from preservation parent and child'])
        // remove tags via Actions menu
        await preservationsPage.assertAtPage()
        await preservationsPage.clickToolbarButton("Actions")
        await preservationsPage.clickActionMenuItem('Remove Tag All')
        await preservationsPage.clickActionSubMenuItem('Parent and child')
        await parentAndChildModal.assertAtPage()
        await parentAndChildModal.selectTag("tag from preservation parent and child")
        await parentAndChildModal.clickButton('Ok')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from preservation parent only'])
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from preservation parent only'])
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from preservation parent only'])
    })

    it('Delete previosly created preservation and tags', async function() {
        await preservationsPage.treeView.openItemMenu('preservation for tags')
        await preservationsPage.treeView.selectItemMenuItem('Delete Preservation Set')
        await deletePreservationModal.assertAtPage()
        await deletePreservationModal.clickButton('Delete')
        chai.expect(
            await preservationsPage.getListedPreservations()
        ).to.not.include.members([
            "preservation for tags"
        ])
        await projectNavigation.openProjectAdministrationMenu()
        await projectNavigation.clickMenuItem('Settings')
        await settingsPage.assertAtPage()
        await settingsPage.clickMenuOption('Manage Tags')
        await settingsPage.removeTag('tag from preservation parent only')
        await removeTagModal.assertAtPage()
        await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        await settingsPage.page.reload()
        await settingsPage.removeTag('tag from preservation child only')
        await removeTagModal.assertAtPage()
        await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        await settingsPage.page.reload()
        await settingsPage.removeTag('tag from preservation parent and child')
        await removeTagModal.assertAtPage()
        await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        await settingsPage.page.reload()
        chai.expect(
            await settingsPage.getListedTags()
        ).to.not.include.members([
            'tag from preservation parent only',
            'tag from preservation child only',
            'tag from preservation parent and child'
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Tags 05 - Create Tag via Actions menu of Collections Sets and add tags to the documents ', async function() {
    let loginUtil
    let projectNavigation
    let browserHelper
    let searchPage
    let collectionPage
    let collectDocumentsModal
    let deleteCollectionModal
    let createCollectionModal
    let searchResultsPage
    let createTagModal
    let removeTagModal
    let documentViewerPage
    let settingsPage
    let parentOnlyModal
    let childOnlyModal
    let parentAndChildModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()
        
        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        searchPage = new SearchPage(browserHelper.browser, browserHelper.page)
        collectionPage = new CollectionsPage(browserHelper.browser, browserHelper.page)
        collectDocumentsModal = new CollectDocumentsModal(browserHelper.browser, browserHelper.page)
        createCollectionModal = new CreateCollectionModal(browserHelper.browser, browserHelper.page)
        deleteCollectionModal = new DeleteCollectionModal(browserHelper.browser, browserHelper.page)
        searchResultsPage = new SearchResultsPage(browserHelper.browser, browserHelper.page)
        createTagModal = new CreateTagModal(browserHelper.browser, browserHelper.page)
        removeTagModal = new RemoveTagModal(browserHelper.browser, browserHelper.page)
        documentViewerPage = new DocumentViewerPage(browserHelper.browser, browserHelper.page)
        settingsPage = new SettingsPage(browserHelper.browser, browserHelper.page)
        parentOnlyModal = new ParentOnlyModal(browserHelper.browser, browserHelper.page)
        childOnlyModal = new ChildOnlyModal(browserHelper.browser, browserHelper.page)
        parentAndChildModal = new ParentAndChildModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('Search for documents with attachments', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideTab('Metadata')
        await searchPage.selectMetadataFromList('Metadata Field')
        await searchPage.searchForMetadataField('Attachment Count')
        await searchPage.addMetadataField('Attachment Count')
        await searchPage.clickFullTextElementClickToInsert()
        await searchPage.typeFullTextElementTerm('7')  
        await searchPage.clickSearchButton()
    })

    it('Create a new collection with family documents', async function() {
        await searchResultsPage.assertAtPage()
        await searchResultsPage.documentList.clickNthDocumentCheckbox(0) 
        await searchResultsPage.clickToolbarButton("Actions")
        await searchResultsPage.clickActionMenuItem('Collect Selected')

        // open collect documents modal
        await collectDocumentsModal.assertAtPage()
        await collectDocumentsModal.treeView.openItemMenu('Collections')
        await collectDocumentsModal.treeView.selectItemMenuItem('New Collection')

        //open create collection modal
        await createCollectionModal.assertAtPage()
        await createCollectionModal.typeName('collection for tags')
        await createCollectionModal.typeDesc('tags testing')
        await createCollectionModal.clickButton('Create')

        //collect documents modal closes and documents adds to the collection
        await collectDocumentsModal.treeView.selectItem('collection for tags')
        await collectDocumentsModal.clickButton('Collect')
    })
    
    it('Create a tag from Collection Action menu "Parent only"', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Collections')
        await collectionPage.assertAtPage()
        await collectionPage.treeView.selectItem('collection for tags')
        await collectionPage.documentList.clickNthDocument(0)
        await documentViewerPage.assertAtPage()
        await documentViewerPage.clickTab('Tags')
        await collectionPage.documentList.expandNthDocumentTree(0)
        await collectionPage.clickToolbarButton('Actions')
        await collectionPage.clickActionMenuItem('Tag All')
        await collectionPage.clickActionSubMenuItem('Parent only')
        await parentOnlyModal.assertAtPage()
        await parentOnlyModal.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName("tag from collection parent only")
        await createTagModal.clickButton('Create')
        await parentOnlyModal.assertAtPage()
        chai.expect(
            await parentOnlyModal.getTagsList()
        ).to.include.members([
            'tag from collection parent only'
        ])
    })

    it('Make "Parent only" collected documents tagged', async function() {
        await parentOnlyModal.selectTag("tag from collection parent only")
        await parentOnlyModal.clickButton('Ok')
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from collection parent only'])

        // click next document to verify that attachmnet doesn't have a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from collection parent only'])

        // remove the tag from parent
        await documentViewerPage.clickNavigationButton('Prev')
        await documentViewerPage.removeAddedTag('tag from collection parent only')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from collection parent only'])
    })

    it('Create a tag from Collection Action menu "Child only"', async function() {
        await collectionPage.assertAtPage()
        await collectionPage.clickToolbarButton("Actions")
        await collectionPage.clickActionMenuItem('Tag All')
        await collectionPage.clickActionSubMenuItem('Child only')
        await childOnlyModal.assertAtPage()
        await childOnlyModal.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName("tag from collection child only")
        await createTagModal.clickButton('Create')
        await childOnlyModal.assertAtPage()
        chai.expect(
            await childOnlyModal.getTagsList()
        ).to.include.members([
            'tag from collection child only'
        ])
    })

    it('Make "Child only" collected documents tagged', async function() {
        await childOnlyModal.selectTag("tag from collection child only")
        await childOnlyModal.clickButton('Ok')
        await documentViewerPage.assertAtPage()
        // check that parent doesn't have a tag
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from collection child only'])

        // check that child has a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from collection child only'])
    })
    
    it('Remove the tag from child via Viewer and via Actions menu', async function() {
        // via Viewer
        await documentViewerPage.removeAddedTag('tag from collection child only')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from collection child only'])
        
        // via Actions menu
        await collectionPage.assertAtPage()
        await collectionPage.clickToolbarButton("Actions")
        await collectionPage.clickActionMenuItem('Remove Tag All')
        await collectionPage.clickActionSubMenuItem('Child only')
        await childOnlyModal.assertAtPage()
        await childOnlyModal.selectTag("tag from collection child only")
        await childOnlyModal.clickButton('Ok')
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from collection parent only'])
        // back to the parent document
        await documentViewerPage.clickNavigationButton('Prev')
        await documentViewerPage.clickNavigationButton('Prev')
    })

    it('Create a tag from Collections Action menu "Parent and child"', async function() {
        await collectionPage.assertAtPage()
        await collectionPage.clickToolbarButton("Actions")
        await collectionPage.clickActionMenuItem('Tag All')
        await collectionPage.clickActionSubMenuItem('Parent and child')
        await parentAndChildModal.assertAtPage()
        await parentAndChildModal.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName("tag from collection parent and child")
        await createTagModal.clickButton('Create')
        await parentAndChildModal.assertAtPage()
        chai.expect(
            await parentAndChildModal.getTagsList()
        ).to.include.members([
            'tag from collection parent and child'
        ])
    })

    it('Make "Parent and child" documents tagged', async function() {
        await parentAndChildModal.selectTag("tag from collection parent and child")
        await parentAndChildModal.clickButton('Ok')
        await documentViewerPage.assertAtPage()
        // check that parent has a tag
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from collection parent and child'])

        // check that child has a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from collection parent and child'])
    })
    
    it('Remove the tag from child and parent via Viewer and via Actions menu', async function() {
        // remove the tag from child
        await documentViewerPage.removeAddedTag('tag from collection parent and child')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from collection parent and child'])
        await documentViewerPage.clickNavigationButton('Prev')
        // remove the tag from parent
        await documentViewerPage.removeAddedTag('tag from collection parent and child')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from collection parent and child'])
        // remove tags via Actions menu
        await collectionPage.assertAtPage()
        await collectionPage.clickToolbarButton("Actions")
        await collectionPage.clickActionMenuItem('Remove Tag All')
        await collectionPage.clickActionSubMenuItem('Parent and child')
        await parentAndChildModal.assertAtPage()
        await parentAndChildModal.selectTag("tag from collection parent and child")
        await parentAndChildModal.clickButton('Ok')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from collection parent only'])
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from collection parent only'])
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from collection parent only'])
    })

    it('Delete previosly created collection and tags', async function() {
        await collectionPage.treeView.openItemMenu('collection for tags')
        await collectionPage.treeView.selectItemMenuItem('Delete Collection')
        await deleteCollectionModal.assertAtPage()
        await deleteCollectionModal.clickButton('Delete')
        chai.expect(
            await collectionPage.getListedCollections()
        ).to.not.include.members([
            "collection for tags"
        ])
        await projectNavigation.openProjectAdministrationMenu()
        await projectNavigation.clickMenuItem('Settings')
        await settingsPage.assertAtPage()
        await settingsPage.clickMenuOption('Manage Tags')
        await settingsPage.removeTag('tag from collection parent only')
        await removeTagModal.assertAtPage()
        await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        await settingsPage.page.reload()
        await settingsPage.removeTag('tag from collection child only')
        await removeTagModal.assertAtPage()
        await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        await settingsPage.page.reload()
        await settingsPage.removeTag('tag from collection parent and child')
        await removeTagModal.assertAtPage()
        await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        await settingsPage.page.reload()
        chai.expect(
            await settingsPage.getListedTags()
        ).to.not.include.members([
            'tag from collection parent only',
            'tag from collection child only',
            'tag from collection parent and child'
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Tags 06 - Create Tag via Actions menu of Folder Sets and add tags to the documents ', async function() {
    let loginUtil
    let projectNavigation
    let browserHelper
    let searchPage
    let foldersPage
    let addToAFolderModal
    let deleteFolderModal
    let createFolderModal
    let searchResultsPage
    let createTagModal
    let removeTagModal
    let documentViewerPage
    let settingsPage
    let parentOnlyModal
    let childOnlyModal
    let parentAndChildModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()
        
        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        searchPage = new SearchPage(browserHelper.browser, browserHelper.page)
        foldersPage = new FoldersPage(browserHelper.browser, browserHelper.page)
        addToAFolderModal = new AddToAFolderModal(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        searchResultsPage = new SearchResultsPage(browserHelper.browser, browserHelper.page)
        createTagModal = new CreateTagModal(browserHelper.browser, browserHelper.page)
        removeTagModal = new RemoveTagModal(browserHelper.browser, browserHelper.page)
        documentViewerPage = new DocumentViewerPage(browserHelper.browser, browserHelper.page)
        settingsPage = new SettingsPage(browserHelper.browser, browserHelper.page)
        parentOnlyModal = new ParentOnlyModal(browserHelper.browser, browserHelper.page)
        childOnlyModal = new ChildOnlyModal(browserHelper.browser, browserHelper.page)
        parentAndChildModal = new ParentAndChildModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('Search for documents with attachments', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideTab('Metadata')
        await searchPage.selectMetadataFromList('Metadata Field')
        await searchPage.searchForMetadataField('Attachment Count')
        await searchPage.addMetadataField('Attachment Count')
        await searchPage.clickFullTextElementClickToInsert()
        await searchPage.typeFullTextElementTerm('7')  
        await searchPage.clickSearchButton()
    })

    it('Create a new folder with family documents', async function() {
        await searchResultsPage.assertAtPage()
        await searchResultsPage.documentList.clickNthDocumentCheckbox(0) 
        await searchResultsPage.clickToolbarButton("Actions")
        await searchResultsPage.clickActionMenuItem('Folder Selected')

        // open add to a folder modal
        await addToAFolderModal.assertAtPage()
        await addToAFolderModal.treeView.openItemMenu('Folders')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')

        //open create folder modal
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder for tags')
        await createFolderModal.typeDescription('tags testing')
        await createFolderModal.clickButton('Create')

        //add to a folder modal closes and documents adds to the folder
        await addToAFolderModal.treeView.selectItem('folder for tags')
        await addToAFolderModal.clickButton('Folder')
    })
    
    it('Create a tag from Folders Action menu "Parent only"', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.selectItem('folder for tags')
        await foldersPage.documentList.clickNthDocument(0)
        await documentViewerPage.assertAtPage()
        await documentViewerPage.clickTab('Tags')
        await foldersPage.documentList.expandNthDocumentTree(0)
        await foldersPage.clickToolbarButton('Actions')
        await foldersPage.clickActionMenuItem('Tag All')
        await foldersPage.clickActionSubMenuItem('Parent only')
        await parentOnlyModal.assertAtPage()
        await parentOnlyModal.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName("tag from folder parent only")
        await createTagModal.clickButton('Create')
        await parentOnlyModal.assertAtPage()
        chai.expect(
            await parentOnlyModal.getTagsList()
        ).to.include.members([
            'tag from folder parent only'
        ])
    })

    it('Make "Parent only" foldered documents tagged', async function() {
        await parentOnlyModal.selectTag("tag from folder parent only")
        await parentOnlyModal.clickButton('Ok')
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from folder parent only'])

        // click next document to verify that attachmnet doesn't have a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from folder parent only'])

        // remove the tag from parent
        await documentViewerPage.clickNavigationButton('Prev')
        await documentViewerPage.removeAddedTag('tag from folder parent only')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from folder parent only'])
    })

    it('Create a tag from Folders Action menu "Child only"', async function() {
        await foldersPage.assertAtPage()
        await foldersPage.clickToolbarButton("Actions")
        await foldersPage.clickActionMenuItem('Tag All')
        await foldersPage.clickActionSubMenuItem('Child only')
        await childOnlyModal.assertAtPage()
        await childOnlyModal.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName("tag from folder child only")
        await createTagModal.clickButton('Create')
        await childOnlyModal.assertAtPage()
        chai.expect(
            await childOnlyModal.getTagsList()
        ).to.include.members([
            'tag from folder child only'
        ])
    })

    it('Make "Child only" foldered documents tagged', async function() {
        await childOnlyModal.selectTag("tag from folder child only")
        await childOnlyModal.clickButton('Ok')
        await documentViewerPage.assertAtPage()
        // check that parent doesn't have a tag
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from folder child only'])

        // check that child has a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from folder child only'])
    })
    
    it('Remove the tag from child via Viewer and via Actions menu', async function() {
        // via Viewer
        await documentViewerPage.removeAddedTag('tag from folder child only')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from folder child only'])
        
        // via Actions menu
        await foldersPage.assertAtPage()
        await foldersPage.clickToolbarButton("Actions")
        await foldersPage.clickActionMenuItem('Remove Tag All')
        await foldersPage.clickActionSubMenuItem('Child only')
        await childOnlyModal.assertAtPage()
        await childOnlyModal.selectTag("tag from folder child only")
        await childOnlyModal.clickButton('Ok')
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from folder parent only'])
        // back to the parent document
        await documentViewerPage.clickNavigationButton('Prev')
        await documentViewerPage.clickNavigationButton('Prev')
    })

    it('Create a tag from Folders Action menu "Parent and child"', async function() {
        await foldersPage.assertAtPage()
        await foldersPage.clickToolbarButton("Actions")
        await foldersPage.clickActionMenuItem('Tag All')
        await foldersPage.clickActionSubMenuItem('Parent and child')
        await parentAndChildModal.assertAtPage()
        await parentAndChildModal.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName("tag from folder parent and child")
        await createTagModal.clickButton('Create')
        await parentAndChildModal.assertAtPage()
        chai.expect(
            await parentAndChildModal.getTagsList()
        ).to.include.members([
            'tag from folder parent and child'
        ])
    })

    it('Make "Parent and child" documents tagged', async function() {
        await parentAndChildModal.selectTag("tag from folder parent and child")
        await parentAndChildModal.clickButton('Ok')
        await documentViewerPage.assertAtPage()
        // check that parent has a tag
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from folder parent and child'])

        // check that child has a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from folder parent and child'])
    })
    
    it('Remove the tag from child and parent via Viewer and via Actions menu', async function() {
        // remove the tag from child
        await documentViewerPage.removeAddedTag('tag from folder parent and child')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from folder parent and child'])
        await documentViewerPage.clickNavigationButton('Prev')
        // remove the tag from parent
        await documentViewerPage.removeAddedTag('tag from folder parent and child')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from folder parent and child'])
        // remove tags via Actions menu
        await foldersPage.assertAtPage()
        await foldersPage.clickToolbarButton("Actions")
        await foldersPage.clickActionMenuItem('Remove Tag All')
        await foldersPage.clickActionSubMenuItem('Parent and child')
        await parentAndChildModal.assertAtPage()
        await parentAndChildModal.selectTag("tag from folder parent and child")
        await parentAndChildModal.clickButton('Ok')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from folder parent only'])
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from folder parent only'])
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from folder parent only'])
    })

    it('Delete previosly created folder and tags', async function() {
        await foldersPage.treeView.openItemMenu('folder for tags')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "folder for tags"
        ])
        await projectNavigation.openProjectAdministrationMenu()
        await projectNavigation.clickMenuItem('Settings')
        await settingsPage.assertAtPage()
        await settingsPage.clickMenuOption('Manage Tags')
        await settingsPage.removeTag('tag from folder parent only')
        await removeTagModal.assertAtPage()
        await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        await settingsPage.page.reload()
        await settingsPage.removeTag('tag from folder child only')
        await removeTagModal.assertAtPage()
        await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        await settingsPage.page.reload()
        await settingsPage.removeTag('tag from folder parent and child')
        await removeTagModal.assertAtPage()
        await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        await settingsPage.page.reload()
        chai.expect(
            await settingsPage.getListedTags()
        ).to.not.include.members([
            'tag from folder parent only',
            'tag from folder child only',
            'tag from folder parent and child'
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Tags 07 - Create Tag via Actions menu of Policy Sets and add tags to the documents ', async function() {
    let loginUtil
    let projectNavigation
    let browserHelper
    let searchPage
    let foldersPage
    let deleteFolderModal
    let policiesPage
    let createPolicyModal
    let deletePolicyModal
    let deleteSearchModal
    let addToAFolderModal
    let saveSearchCriteriaModal
    let createFolderModal
    let searchResultsPage
    let createTagModal
    let addFolderModal
    let removeTagModal
    let documentViewerPage
    let settingsPage
    let parentOnlyModal
    let childOnlyModal
    let parentAndChildModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()
        
        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        searchPage = new SearchPage(browserHelper.browser, browserHelper.page)
        foldersPage = new FoldersPage(browserHelper.browser, browserHelper.page)
        policiesPage = new PoliciesPage(browserHelper.browser, browserHelper.page)
        addToAFolderModal = new AddToAFolderModal(browserHelper.browser, browserHelper.page)
        deletePolicyModal = new DeletePolicyModal(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        deleteSearchModal = new DeleteSearchModal(browserHelper.browser, browserHelper.page)
        searchResultsPage = new SearchResultsPage(browserHelper.browser, browserHelper.page)
        createPolicyModal = new CreatePolicyModal(browserHelper.browser, browserHelper.page)
        saveSearchCriteriaModal = new SaveSearchCriteriaModal(browserHelper.browser, browserHelper.page)
        addFolderModal = new AddFolderModal(browserHelper.browser, browserHelper.page)
        createTagModal = new CreateTagModal(browserHelper.browser, browserHelper.page)
        removeTagModal = new RemoveTagModal(browserHelper.browser, browserHelper.page)
        documentViewerPage = new DocumentViewerPage(browserHelper.browser, browserHelper.page)
        settingsPage = new SettingsPage(browserHelper.browser, browserHelper.page)
        parentOnlyModal = new ParentOnlyModal(browserHelper.browser, browserHelper.page)
        childOnlyModal = new ChildOnlyModal(browserHelper.browser, browserHelper.page)
        parentAndChildModal = new ParentAndChildModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('Search for documents with attachments', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideTab('Metadata')
        await searchPage.selectMetadataFromList('Metadata Field')
        await searchPage.searchForMetadataField('Attachment Count')
        await searchPage.addMetadataField('Attachment Count')
        await searchPage.clickFullTextElementClickToInsert()
        await searchPage.typeFullTextElementTerm('7')  
        await searchPage.clickSearchButton()
    })

    it('Add search result to Folder', async function() {
        await searchResultsPage.assertAtPage()
        await searchResultsPage.documentList.clickNthDocumentCheckbox(0)
        await searchResultsPage.clickToolbarButton("Actions")
        await searchResultsPage.clickActionMenuItem('Folder Selected')

        // open add to a folder modal
        await addToAFolderModal.assertAtPage()
        await addToAFolderModal.treeView.openItemMenu('Folders')
        await addToAFolderModal.treeView.selectItemMenuItem('New Folder')

        //open create folder modal
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('folder for policy')
        await createFolderModal.typeDescription('tags testing')
        await createFolderModal.clickButton('Create')

        //add to a folder modal closes and documents adds to the folder
        await addToAFolderModal.treeView.selectItem('folder for policy')
        await addToAFolderModal.clickButton('Folder')
    })

    it('Create a saved search for previously created folder', async function() {
        await searchResultsPage.clickSearchNavigationTab('Search')
        await searchPage.clickLeftSideTab('Home')
        await searchPage.clickRemoveAllButton()
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideSearchPredicateByName('Folder')
        await addFolderModal.assertAtPage()
        await addFolderModal.treeView.addSelectedFolder('folder for policy')
        await addFolderModal.clickButton('Cancel')
        await searchPage.clickSaveSearchCriteria()
        await saveSearchCriteriaModal.assertAtPage()
        await saveSearchCriteriaModal.typeName('policy tags')
        await saveSearchCriteriaModal.clickButton('Save')
        await searchResultsPage.assertAtPage()
        await searchResultsPage.clickSearchNavigationTab('Search')
        await searchPage.assertAtPage()
        await searchPage.searchForSavedSearches('policy tags')
        chai.expect(
            await searchPage.getSavedSearchNames()
        ).to.include.members([
            "policy tags"
        ])
    })

    it('Create a policy with created saved search', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Policies')
        await policiesPage.assertAtPage()
        await policiesPage.clickCreateButton('New Policy')
        await createPolicyModal.assertAtPage()
        await createPolicyModal.typeName('policy for tags')
        await createPolicyModal.typeDescription('tags test')
        await createPolicyModal.openPolicyRuleSearch()
        await createPolicyModal.searchForSavedSearches('policy tags')
        await createPolicyModal.openPolicyRuleAction()
        await createPolicyModal.selectPolicyRuleAction('Copy')
        await createPolicyModal.openWhereCopy()
        await createPolicyModal.selectEndpointWhereCopy('automation endpoint')
        await createPolicyModal.openWhenCopy()
        // we need select After time option to be able delete policy
        await createPolicyModal.selectOnOrAfterTime('After')
        await createPolicyModal.selectWhenOnOption('Date Added to Policy')
        await createPolicyModal.setDurationTime('Days:', '10')
        await createPolicyModal.closeSentNotification()
        await createPolicyModal.clickButton('Create')
        chai.expect(
            await policiesPage.getListedPolicies()
        ).to.include.members([
            "Policies",
            "policy for tags"
        ])
    })
    
    it('Create a tag from Policies Action menu "Parent only"', async function() {
        await policiesPage.assertAtPage()
        await policiesPage.treeView.selectItem('policy for tags')
        await policiesPage.documentList.expandNthDocumentTree(0)
        await policiesPage.documentList.clickNthDocument(0)
        await documentViewerPage.assertAtPage()
        await documentViewerPage.clickTab('Tags')
        await policiesPage.clickToolbarButton('Actions')
        await policiesPage.clickActionMenuItem('Tag All')
        await policiesPage.clickActionSubMenuItem('Parent only')
        await parentOnlyModal.assertAtPage()
        await parentOnlyModal.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName("tag from policy parent only")
        await createTagModal.clickButton('Create')
        await parentOnlyModal.assertAtPage()
        chai.expect(
            await parentOnlyModal.getTagsList()
        ).to.include.members([
            'tag from policy parent only'
        ])
    })

    it('Make "Parent only" policy documents tagged', async function() {
        await parentOnlyModal.selectTag("tag from policy parent only")
        await parentOnlyModal.clickButton('Ok')
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from policy parent only'])

        // click next document to verify that attachmnet doesn't have a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from policy parent only'])

        // remove the tag from parent
        await documentViewerPage.clickNavigationButton('Prev')
        await documentViewerPage.removeAddedTag('tag from policy parent only')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from policy parent only'])
    })

    it('Create a tag from Policies Action menu "Child only"', async function() {
        await policiesPage.assertAtPage()
        await policiesPage.clickToolbarButton("Actions")
        await policiesPage.clickActionMenuItem('Tag All')
        await policiesPage.clickActionSubMenuItem('Child only')
        await childOnlyModal.assertAtPage()
        await childOnlyModal.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName("tag from policy child only")
        await createTagModal.clickButton('Create')
        await childOnlyModal.assertAtPage()
        chai.expect(
            await childOnlyModal.getTagsList()
        ).to.include.members([
            'tag from policy child only'
        ])
    })

    it('Make "Child only" policy documents tagged', async function() {
        await childOnlyModal.selectTag("tag from policy child only")
        await childOnlyModal.clickButton('Ok')
        await documentViewerPage.assertAtPage()
        // check that parent doesn't have a tag
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from policy child only'])

        // check that child has a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from policy child only'])
    })
    
    it('Remove the tag from child via Viewer and via Actions menu', async function() {
        // via Viewer
        await documentViewerPage.removeAddedTag('tag from policy child only')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from policy child only'])
        
        // via Actions menu
        await policiesPage.assertAtPage()
        await policiesPage.clickToolbarButton("Actions")
        await policiesPage.clickActionMenuItem('Remove Tag All')
        await policiesPage.clickActionSubMenuItem('Child only')
        await childOnlyModal.assertAtPage()
        await childOnlyModal.selectTag("tag from policy child only")
        await childOnlyModal.clickButton('Ok')
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from policy parent only'])
        // back to the parent document
        await documentViewerPage.clickNavigationButton('Prev')
        await documentViewerPage.clickNavigationButton('Prev')
    })

    it('Create a tag from Policies Action menu "Parent and child"', async function() {
        await policiesPage.assertAtPage()
        await policiesPage.clickToolbarButton("Actions")
        await policiesPage.clickActionMenuItem('Tag All')
        await policiesPage.clickActionSubMenuItem('Parent and child')
        await parentAndChildModal.assertAtPage()
        await parentAndChildModal.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName("tag from policy parent and child")
        await createTagModal.clickButton('Create')
        await parentAndChildModal.assertAtPage()
        chai.expect(
            await parentAndChildModal.getTagsList()
        ).to.include.members([
            'tag from policy parent and child'
        ])
    })

    it('Make "Parent and child" policy documents tagged', async function() {
        await parentAndChildModal.selectTag("tag from policy parent and child")
        await parentAndChildModal.clickButton('Ok')
        await documentViewerPage.assertAtPage()
        // check that parent has a tag
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from policy parent and child'])

        // check that child has a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from policy parent and child'])
    })
    
    it('Remove the tag from child and parent via Viewer and via Actions menu', async function() {
        // remove the tag from child
        await documentViewerPage.removeAddedTag('tag from policy parent and child')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from policy parent and child'])
        await documentViewerPage.clickNavigationButton('Prev')
        // remove the tag from parent
        await documentViewerPage.removeAddedTag('tag from policy parent and child')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from policy parent and child'])
        // remove tags via Actions menu
        await policiesPage.assertAtPage()
        await policiesPage.clickToolbarButton("Actions")
        await policiesPage.clickActionMenuItem('Remove Tag All')
        await policiesPage.clickActionSubMenuItem('Parent and child')
        await parentAndChildModal.assertAtPage()
        await parentAndChildModal.selectTag("tag from policy parent and child")
        await parentAndChildModal.clickButton('Ok')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from policy parent only'])
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from policy parent only'])
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from policy parent only'])
    })

    it('Delete previosly created folder and tags', async function() {
        await policiesPage.treeView.openItemMenu('policy for tags')
        await policiesPage.treeView.selectItemMenuItem('Delete Policy')
        await deletePolicyModal.assertAtPage()
        await deletePolicyModal.clickButton('Delete')
        chai.expect(
            await policiesPage.getListedPolicies()
        ).to.not.include.members([
            "policy for tags"
        ])
        await projectNavigation.openProjectAdministrationMenu()
        await projectNavigation.clickMenuItem('Settings')
        await settingsPage.assertAtPage()
        await settingsPage.clickMenuOption('Manage Tags')
        await settingsPage.removeTag('tag from policy parent only')
        await removeTagModal.assertAtPage()
        await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        await settingsPage.page.reload()
        await settingsPage.removeTag('tag from policy child only')
        await removeTagModal.assertAtPage()
        await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        await settingsPage.page.reload()
        await settingsPage.removeTag('tag from policy parent and child')
        await removeTagModal.assertAtPage()
        await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        await settingsPage.page.reload()
        chai.expect(
            await settingsPage.getListedTags()
        ).to.not.include.members([
            'tag from policy parent only',
            'tag from policy child only',
            'tag from policy parent and child'
        ])
    })

    it('Delete folder and saved search', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()
        await foldersPage.treeView.openItemMenu('folder for policy')
        await foldersPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await foldersPage.getListedFolders()
        ).to.not.include.members([
            "folder for policy"
        ])
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.searchForSavedSearches('policy tags')
        await searchPage.deleteSelectedSavedSearch('policy tags')
        await deleteSearchModal.assertAtPage()
        await deleteSearchModal.clickButton('Confirm')
        chai.expect(
            await searchPage.getSavedSearchNames()
        ).to.not.include.members([
            "policy tags"
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Tags 08 - Create Tag via Actions menu of Export Sets and add tags to the documents ', async function() {
    let loginUtil
    let projectNavigation
    let browserHelper
    let searchPage
    let exportsPage
    let addToAnExportModal
    let deleteExportModal
    let createExportModal
    let searchResultsPage
    let createTagModal
    let removeTagModal
    let documentViewerPage
    let settingsPage
    let parentOnlyModal
    let childOnlyModal
    let parentAndChildModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()
        
        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        searchPage = new SearchPage(browserHelper.browser, browserHelper.page)
        exportsPage = new ExportsPage(browserHelper.browser, browserHelper.page)
        addToAnExportModal = new AddToAnExportModal(browserHelper.browser, browserHelper.page)
        createExportModal = new CreateExportModal(browserHelper.browser, browserHelper.page)
        deleteExportModal = new DeleteExportModal(browserHelper.browser, browserHelper.page)
        searchResultsPage = new SearchResultsPage(browserHelper.browser, browserHelper.page)
        createTagModal = new CreateTagModal(browserHelper.browser, browserHelper.page)
        removeTagModal = new RemoveTagModal(browserHelper.browser, browserHelper.page)
        documentViewerPage = new DocumentViewerPage(browserHelper.browser, browserHelper.page)
        settingsPage = new SettingsPage(browserHelper.browser, browserHelper.page)
        parentOnlyModal = new ParentOnlyModal(browserHelper.browser, browserHelper.page)
        childOnlyModal = new ChildOnlyModal(browserHelper.browser, browserHelper.page)
        parentAndChildModal = new ParentAndChildModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('Search for documents with attachments', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideTab('Metadata')
        await searchPage.selectMetadataFromList('Metadata Field')
        await searchPage.searchForMetadataField('Attachment Count')
        await searchPage.addMetadataField('Attachment Count')
        await searchPage.clickFullTextElementClickToInsert()
        await searchPage.typeFullTextElementTerm('7')  
        await searchPage.clickSearchButton()
    })

    it('Create a new export with family documents', async function() {
        await searchResultsPage.assertAtPage()
        await searchResultsPage.documentList.clickNthDocumentCheckbox(0) 
        await searchResultsPage.clickToolbarButton("Actions")
        await searchResultsPage.clickActionMenuItem('Export Selected')

        // open add to an export modal
        await addToAnExportModal.assertAtPage()
        await addToAnExportModal.treeView.openItemMenu('Exports')
        await addToAnExportModal.treeView.selectItemMenuItem('New Export')

        //open create export modal
        await createExportModal.assertAtPage()
        await createExportModal.typeName('export for tags')
        await createExportModal.typeDesc('tags testing')
        await createExportModal.openSelectEndpoint()
        await createExportModal.addSelectedItem('automation endpoint')
        await createExportModal.clickButton('Create')

        //add to an export modal closes and documents adds to the export
        await addToAnExportModal.treeView.selectItem('export for tags')
        await addToAnExportModal.clickButton('Export')
    })
    
    it('Create a tag from Exports Action menu "Parent only"', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Exports')
        await exportsPage.assertAtPage()
        await exportsPage.treeView.selectItem('export for tags')
        await exportsPage.documentList.clickNthDocument(0)
        await documentViewerPage.assertAtPage()
        await documentViewerPage.clickTab('Tags')
        await exportsPage.documentList.expandNthDocumentTree(0)
        await exportsPage.clickToolbarButton('Actions')
        await exportsPage.clickActionMenuItem('Tag All')
        await exportsPage.clickActionSubMenuItem('Parent only')
        await parentOnlyModal.assertAtPage()
        await parentOnlyModal.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName("tag from export parent only")
        await createTagModal.clickButton('Create')
        await parentOnlyModal.assertAtPage()
        chai.expect(
            await parentOnlyModal.getTagsList()
        ).to.include.members([
            'tag from export parent only'
        ])
    })

    it('Make "Parent only" export documents tagged', async function() {
        await parentOnlyModal.selectTag("tag from export parent only")
        await parentOnlyModal.clickButton('Ok')
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from export parent only'])

        // click next document to verify that attachmnet doesn't have a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from export parent only'])

        // remove the tag from parent
        await documentViewerPage.clickNavigationButton('Prev')
        await documentViewerPage.removeAddedTag('tag from export parent only')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from export parent only'])
    })

    it('Create a tag from Exports Action menu "Child only"', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.clickToolbarButton("Actions")
        await exportsPage.clickActionMenuItem('Tag All')
        await exportsPage.clickActionSubMenuItem('Child only')
        await childOnlyModal.assertAtPage()
        await childOnlyModal.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName("tag from export child only")
        await createTagModal.clickButton('Create')
        await childOnlyModal.assertAtPage()
        chai.expect(
            await childOnlyModal.getTagsList()
        ).to.include.members([
            'tag from export child only'
        ])
    })

    it('Make "Child only" export documents tagged', async function() {
        await childOnlyModal.selectTag("tag from export child only")
        await childOnlyModal.clickButton('Ok')
        await documentViewerPage.assertAtPage()
        // check that parent doesn't have a tag
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from export child only'])

        // check that child has a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from export child only'])
    })
    
    it('Remove the tag from child via Viewer and via Actions menu', async function() {
        // via Viewer
        await documentViewerPage.removeAddedTag('tag from export child only')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from export child only'])
        
        // via Actions menu
        await exportsPage.assertAtPage()
        await exportsPage.clickToolbarButton("Actions")
        await exportsPage.clickActionMenuItem('Remove Tag All')
        await exportsPage.clickActionSubMenuItem('Child only')
        await childOnlyModal.assertAtPage()
        await childOnlyModal.selectTag("tag from export child only")
        await childOnlyModal.clickButton('Ok')
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from export parent only'])
        // back to the parent document
        await documentViewerPage.clickNavigationButton('Prev')
        await documentViewerPage.clickNavigationButton('Prev')
    })

    it('Create a tag from Exports Action menu "Parent and child"', async function() {
        await exportsPage.assertAtPage()
        await exportsPage.clickToolbarButton("Actions")
        await exportsPage.clickActionMenuItem('Tag All')
        await exportsPage.clickActionSubMenuItem('Parent and child')
        await parentAndChildModal.assertAtPage()
        await parentAndChildModal.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName("tag from export parent and child")
        await createTagModal.clickButton('Create')
        await parentAndChildModal.assertAtPage()
        chai.expect(
            await parentAndChildModal.getTagsList()
        ).to.include.members([
            'tag from export parent and child'
        ])
    })

    it('Make "Parent and child" documents tagged', async function() {
        await parentAndChildModal.selectTag("tag from export parent and child")
        await parentAndChildModal.clickButton('Ok')
        await documentViewerPage.assertAtPage()
        // check that parent has a tag
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from export parent and child'])

        // check that child has a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from export parent and child'])
    })
    
    it('Remove the tag from child and parent via Viewer and via Actions menu', async function() {
        // remove the tag from child
        await documentViewerPage.removeAddedTag('tag from export parent and child')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from export parent and child'])
        await documentViewerPage.clickNavigationButton('Prev')
        // remove the tag from parent
        await documentViewerPage.removeAddedTag('tag from export parent and child')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from export parent and child'])
        // remove tags via Actions menu
        await exportsPage.assertAtPage()
        await exportsPage.clickToolbarButton("Actions")
        await exportsPage.clickActionMenuItem('Remove Tag All')
        await exportsPage.clickActionSubMenuItem('Parent and child')
        await parentAndChildModal.assertAtPage()
        await parentAndChildModal.selectTag("tag from export parent and child")
        await parentAndChildModal.clickButton('Ok')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from export parent only'])
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from export parent only'])
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from export parent only'])
    })

    it('Delete previosly created export and tags', async function() {
        await exportsPage.treeView.openItemMenu('export for tags')
        await exportsPage.treeView.selectItemMenuItem('Delete Export')
        await deleteExportModal.assertAtPage()
        await deleteExportModal.clickButton('Delete')
        chai.expect(
            await exportsPage.getListedExports()
        ).to.not.include.members([
            "export for tags"
        ])
        await projectNavigation.openProjectAdministrationMenu()
        await projectNavigation.clickMenuItem('Settings')
        await settingsPage.assertAtPage()
        await settingsPage.clickMenuOption('Manage Tags')
        await settingsPage.removeTag('tag from export parent only')
        await removeTagModal.assertAtPage()
        await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        await settingsPage.page.reload()
        await settingsPage.removeTag('tag from export child only')
        await removeTagModal.assertAtPage()
        await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        await settingsPage.page.reload()
        await settingsPage.removeTag('tag from export parent and child')
        await removeTagModal.assertAtPage()
        await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        await settingsPage.page.reload()
        chai.expect(
            await settingsPage.getListedTags()
        ).to.not.include.members([
            'tag from export parent only',
            'tag from export child only',
            'tag from export parent and child'
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Tags 09 - Create Tag via Explorer Graph and add tags to the documents ', async function() {
    let loginUtil
    let projectNavigation
    let browserHelper
    let searchPage
    let explorerPage
    let explorerDocumentPage
    let createTagModal
    let removeTagModal
    let documentViewerPage
    let settingsPage
    let parentOnlyModal
    let childOnlyModal
    let parentAndChildModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()
        
        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        searchPage = new SearchPage(browserHelper.browser, browserHelper.page)
        explorerPage = new ExplorerPage(browserHelper.browser, browserHelper.page)
        explorerDocumentPage = new ExplorerDocumentPage(browserHelper.browser, browserHelper.page)
        createTagModal = new CreateTagModal(browserHelper.browser, browserHelper.page)
        removeTagModal = new RemoveTagModal(browserHelper.browser, browserHelper.page)
        documentViewerPage = new DocumentViewerPage(browserHelper.browser, browserHelper.page)
        settingsPage = new SettingsPage(browserHelper.browser, browserHelper.page)
        parentOnlyModal = new ParentOnlyModal(browserHelper.browser, browserHelper.page)
        childOnlyModal = new ChildOnlyModal(browserHelper.browser, browserHelper.page)
        parentAndChildModal = new ParentAndChildModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('Search for documents with attachments', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideTab('Metadata')
        await searchPage.selectMetadataFromList('Metadata Field')
        await searchPage.searchForMetadataField('Attachment Count')
        await searchPage.addMetadataField('Attachment Count')
        await searchPage.clickFullTextElementClickToInsert()
        await searchPage.typeFullTextElementTerm('7')  
        await searchPage.clickSearchButton()
    })

    it('Open Explorer and filter by Data Set Searches', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Explorer')
        await explorerPage.assertAtPage()
        await explorerPage.openDataSet()
        await explorerPage.expandDataSetProjectOptionMenu('Searches')
        await explorerPage.selectNthDataProjectOptionMenuItem(0)
        await explorerPage.clickGraphBar('Microsoft Outlook')
        await explorerPage.clickActionSubMenuItem('Tag', 'Parent only')
    })
    
    it('Create a tag from Explorer Graph "Parent only"', async function() {
        await parentOnlyModal.assertAtPage()
        await parentOnlyModal.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName("tag from explorer graph parent only")
        await createTagModal.clickButton('Create')
        await parentOnlyModal.assertAtPage()
        chai.expect(
            await parentOnlyModal.getTagsList()
        ).to.include.members([
            'tag from explorer graph parent only'
        ])
    })

    it('Make "Parent only" explorer graph documents tagged', async function() {
        await parentOnlyModal.selectTag("tag from explorer graph parent only")
        await parentOnlyModal.clickButton('Ok')

        // check that documents were tagged
        await explorerPage.clickGraphBar('Microsoft Outlook')
        await explorerPage.clickActionMenuItem('View Document Set')
        await common.waitForTimeout(1000)
        await explorerDocumentPage.assertAtPage()
        await explorerDocumentPage.documentList.clickNthDocument(0)
        await documentViewerPage.assertAtPage()
        await documentViewerPage.clickTab('Tags')
        await explorerDocumentPage.documentList.expandNthDocumentTree(0)
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from explorer graph parent only'])

        // click next document to verify that attachmnet doesn't have a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer graph parent only'])

        // back to Explorer page
        // await explorerDocumentPage.clickExplorerNavigationTab('Explorer')
    })

    it.skip('Remove tag "Parent only" from explorer graph', async function() {
        await explorerPage.assertAtPage()
        await explorerPage.clickGraphBar('Microsoft Outlook')
        await explorerPage.clickActionSubMenuItem('Remove Tag', 'Parent only')
        await parentOnlyModal.assertAtPage()
        await parentOnlyModal.selectTag("tag from explorer graph parent only")
        await parentOnlyModal.clickButton('Ok')

        // check that document was untagged
        await explorerPage.clickGraphBar('Microsoft Outlook')
        await explorerPage.clickActionMenuItem('View Document Set')
        await common.waitForTimeout(3000)
        await explorerDocumentPage.assertAtPage()
        await explorerDocumentPage.documentList.clickNthDocument(0)
        await documentViewerPage.assertAtPage()
        await documentViewerPage.clickTab('Tags')
        await explorerDocumentPage.documentList.expandNthDocumentTree(0)
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer graph parent only'])
        // click next document to verify that attachmnet doesn't have a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer graph parent only'])

        // back to Explorer page
        await explorerDocumentPage.clickExplorerNavigationTab('Explorer')
    })

    it('Remove tag "Parent only"', async function() {
        // remove the tag from parent
        await documentViewerPage.clickNavigationButton('Prev')
        await documentViewerPage.removeAddedTag('tag from explorer graph parent only')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer graph parent only'])

        // remove tags via Actions menu
        await explorerDocumentPage.assertAtPage()
        await explorerDocumentPage.clickToolbarButton("Actions")
        await explorerDocumentPage.clickActionMenuItem('Remove Tag All')
        await explorerDocumentPage.clickActionSubMenuItem('Parent only')
        await parentOnlyModal.assertAtPage()
        await parentOnlyModal.selectTag("tag from explorer graph parent only")
        await parentOnlyModal.clickButton('Ok')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer graph parent only'])
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer graph parent only'])
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer graph parent only'])

        // back to Explorer page
        await explorerDocumentPage.clickExplorerNavigationTab('Explorer')
    })

    it.skip('[#1425] Create a tag from Explorer Graph "Child only"', async function() {
        await explorerPage.assertAtPage()
        await explorerPage.clickGraphBar('Microsoft Outlook')
        await explorerPage.clickActionSubMenuItem('Tag', 'Child only')
        await childOnlyModal.assertAtPage()
        await childOnlyModal.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName("tag from explorer graph child only")
        await createTagModal.clickButton('Create')
        await childOnlyModal.assertAtPage()
        chai.expect(
            await childOnlyModal.getTagsList()
        ).to.include.members([
            'tag from explorer graph child only'
        ])
    })

    it.skip('[#1425] Make "Child only" explorer graph documents tagged', async function() {
        await childOnlyModal.selectTag("tag from explorer graph child only")
        await childOnlyModal.clickButton('Ok')

        // check that documents were tagged
        await explorerPage.assertAtPage()
        await explorerPage.clickGraphBar('Microsoft Outlook')
        await explorerPage.clickActionMenuItem('View Document Set')
        await common.waitForTimeout(1000)
        await explorerDocumentPage.assertAtPage()
        await explorerDocumentPage.documentList.clickNthDocument(0)
        await documentViewerPage.assertAtPage()
        await documentViewerPage.clickTab('Tags')
        await explorerDocumentPage.documentList.expandNthDocumentTree(0)
        // check that parent doesn't have a tag
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer graph child only'])

        // check that child has a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from explorer graph child only'])

        // back to Explorer page
        await explorerDocumentPage.clickExplorerNavigationTab('Explorer')
    })
    
    it.skip('[#1425] Remove "Child only" tag from explorer graph', async function() {
        await explorerPage.assertAtPage()
        await explorerPage.clickGraphBar('Microsoft Outlook')
        await explorerPage.clickActionSubMenuItem('Remove Tag', 'Child only')
        await childOnlyModal.assertAtPage()
        await childOnlyModal.selectTag("tag from explorer graph child only")
        await childOnlyModal.clickButton('Ok')

        // check that document was untagged
        await explorerPage.clickGraphBar('Microsoft Outlook')
        await explorerPage.clickActionMenuItem('View Document Set')
        await common.waitForTimeout(1000)
        await explorerDocumentPage.assertAtPage()
        await explorerDocumentPage.documentList.clickNthDocument(0)
        await documentViewerPage.assertAtPage()
        await documentViewerPage.clickTab('Tags')
        await explorerDocumentPage.documentList.expandNthDocumentTree(0)
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer graph child only'])
        // click next document to verify that attachmnet doesn't have a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer graph child only'])

        // back to Explorer page
        await explorerDocumentPage.clickExplorerNavigationTab('Explorer')
    })

    it('Create a tag from Explorer Graph "Parent and child"', async function() {
        await explorerPage.assertAtPage()
        await explorerPage.clickGraphBar('Microsoft Outlook')
        await explorerPage.clickActionSubMenuItem('Tag', 'Parent and child')
        await parentAndChildModal.assertAtPage()
        await parentAndChildModal.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName("tag from explorer graph parent and child")
        await createTagModal.clickButton('Create')
        await parentAndChildModal.assertAtPage()
        chai.expect(
            await parentAndChildModal.getTagsList()
        ).to.include.members([
            'tag from explorer graph parent and child'
        ])
    })

    it('Make "Parent and child" documents tagged', async function() {
        await parentAndChildModal.selectTag("tag from explorer graph parent and child")
        await parentAndChildModal.clickButton('Ok')

        await explorerPage.assertAtPage()
        await explorerPage.clickGraphBar('Microsoft Outlook')
        await explorerPage.clickActionMenuItem('View Document Set')
        await common.waitForTimeout(1000)
        await explorerDocumentPage.assertAtPage()
        await explorerDocumentPage.documentList.clickNthDocument(0)
        await documentViewerPage.assertAtPage()
        await documentViewerPage.clickTab('Tags')
        await explorerDocumentPage.documentList.expandNthDocumentTree(0)
        // check that parent has a tag
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from explorer graph parent and child'])

        // check that child has a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from explorer graph parent and child'])

        // back to Explorer page
        // await explorerDocumentPage.clickExplorerNavigationTab('Explorer')
    })
    
    it.skip('Remove "Parent and child" tag from explorer graph', async function() {
        await explorerPage.assertAtPage()
        await explorerPage.clickGraphBar('Microsoft Outlook')
        await explorerPage.clickActionSubMenuItem('Remove Tag', 'Parent and child')
        await parentAndChildModal.assertAtPage()
        await parentAndChildModal.selectTag("tag from explorer graph parent and child")
        await childOnlyModal.clickButton('Ok')

        // check that document was untagged
        await explorerPage.clickGraphBar('Microsoft Outlook')
        await explorerPage.clickActionMenuItem('View Document Set')
        await common.waitForTimeout(1000)
        await explorerDocumentPage.assertAtPage()
        await explorerDocumentPage.documentList.clickNthDocument(0)
        await documentViewerPage.assertAtPage()
        await documentViewerPage.clickTab('Tags')
        await explorerDocumentPage.documentList.expandNthDocumentTree(0)
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer graph parent and child'])
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer graph parent and child'])
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer graph parent and child'])
    })

    it('Remove tag "Parent and child"', async function() {
        // remove the tag from child
        await documentViewerPage.removeAddedTag('tag from explorer graph parent and child')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer graph parent and child'])
        await documentViewerPage.clickNavigationButton('Prev')
        // remove the tag from parent
        await documentViewerPage.removeAddedTag('tag from explorer graph parent and child')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer graph parent and child'])

        // remove tags via Actions menu
        await explorerDocumentPage.assertAtPage()
        await explorerDocumentPage.clickToolbarButton("Actions")
        await explorerDocumentPage.clickActionMenuItem('Remove Tag All')
        await explorerDocumentPage.clickActionSubMenuItem('Parent and child')
        await parentAndChildModal.assertAtPage()
        await parentAndChildModal.selectTag("tag from explorer graph parent and child")
        await parentAndChildModal.clickButton('Ok')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer graph parent and child'])
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer graph parent and child'])
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer graph parent and child'])
    })

    it('Delete previosly created tags', async function() {
        await projectNavigation.openProjectAdministrationMenu()
        await projectNavigation.clickMenuItem('Settings')
        await settingsPage.assertAtPage()
        await settingsPage.clickMenuOption('Manage Tags')
        await settingsPage.removeTag('tag from explorer graph parent only')
        await removeTagModal.assertAtPage()
        await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        // await settingsPage.page.reload()
        // await settingsPage.removeTag('tag from explorer graph child only')
        // await removeTagModal.assertAtPage()
        // await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        await settingsPage.page.reload()
        await settingsPage.removeTag('tag from explorer graph parent and child')
        await removeTagModal.assertAtPage()
        await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        await settingsPage.page.reload()
        chai.expect(
            await settingsPage.getListedTags()
        ).to.not.include.members([
            'tag from explorer graph parent only',
            // 'tag from explorer graph child only',
            'tag from explorer graph parent and child'
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Tags 10 - Create Tag via Explorer Actions and add tags to the documents ', async function() {
    let loginUtil
    let projectNavigation
    let browserHelper
    let searchPage
    let explorerPage
    let explorerDocumentPage
    let createTagModal
    let removeTagModal
    let documentViewerPage
    let settingsPage
    let parentOnlyModal
    let childOnlyModal
    let parentAndChildModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()
        
        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        searchPage = new SearchPage(browserHelper.browser, browserHelper.page)
        explorerPage = new ExplorerPage(browserHelper.browser, browserHelper.page)
        explorerDocumentPage = new ExplorerDocumentPage(browserHelper.browser, browserHelper.page)
        createTagModal = new CreateTagModal(browserHelper.browser, browserHelper.page)
        removeTagModal = new RemoveTagModal(browserHelper.browser, browserHelper.page)
        documentViewerPage = new DocumentViewerPage(browserHelper.browser, browserHelper.page)
        settingsPage = new SettingsPage(browserHelper.browser, browserHelper.page)
        parentOnlyModal = new ParentOnlyModal(browserHelper.browser, browserHelper.page)
        childOnlyModal = new ChildOnlyModal(browserHelper.browser, browserHelper.page)
        parentAndChildModal = new ParentAndChildModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('Search for documents with attachments', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideTab('Metadata')
        await searchPage.selectMetadataFromList('Metadata Field')
        await searchPage.searchForMetadataField('Attachment Count')
        await searchPage.addMetadataField('Attachment Count')
        await searchPage.clickFullTextElementClickToInsert()
        await searchPage.typeFullTextElementTerm('7')  
        await searchPage.clickSearchButton()
    })

    it('Open Explorer and filter by Data Set Searches', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Explorer')
        await explorerPage.assertAtPage()
        await explorerPage.openDataSet()
        await explorerPage.expandDataSetProjectOptionMenu('Searches')
        await explorerPage.selectNthDataProjectOptionMenuItem(0)
        await explorerPage.openActionMenu()
        await explorerPage.clickActionSubMenuItem('Tag', 'Parent only')
    })
    
    it('Create a tag from Explorer Actions "Parent only"', async function() {
        await parentOnlyModal.assertAtPage()
        await parentOnlyModal.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName("tag from explorer actions parent only")
        await createTagModal.clickButton('Create')
        await parentOnlyModal.assertAtPage()
        chai.expect(
            await parentOnlyModal.getTagsList()
        ).to.include.members([
            'tag from explorer actions parent only'
        ])
    })

    it('Make "Parent only" explorer actions documents tagged', async function() {
        await parentOnlyModal.selectTag("tag from explorer actions parent only")
        await parentOnlyModal.clickButton('Ok')

        // check that documents were tagged
        await explorerPage.openActionMenu()
        await explorerPage.clickActionMenuItem('View Document Set')
        await common.waitForTimeout(1000)
        await explorerDocumentPage.assertAtPage()
        await explorerDocumentPage.documentList.clickNthDocument(0)
        await documentViewerPage.assertAtPage()
        await documentViewerPage.clickTab('Tags')
        await explorerDocumentPage.documentList.expandNthDocumentTree(0)
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from explorer actions parent only'])

        // click next document to verify that attachmnet doesn't have a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer actions parent only'])

        // back to Explorer page
        // await explorerDocumentPage.clickExplorerNavigationTab('Explorer')
    })

    it.skip('Remove tag "Parent only" from explorer actions', async function() {
        await explorerPage.assertAtPage()
        await explorerPage.openActionMenu()
        await explorerPage.clickActionSubMenuItem('Remove Tag', 'Parent only')
        await parentOnlyModal.assertAtPage()
        await parentOnlyModal.selectTag("tag from explorer views parent only")
        await parentOnlyModal.clickButton('Ok')

        // check that document was untagged
        await explorerPage.openActionMenu()
        await explorerPage.clickActionMenuItem('View Document Set')
        await explorerPage.waitForTaskCountToBeZero('0')
        await common.waitForTimeout(1000)
        await explorerDocumentPage.assertAtPage()
        await common.waitForTimeout(5000)
        await explorerDocumentPage.documentList.clickNthDocument(0)
        await documentViewerPage.assertAtPage()
        await documentViewerPage.clickTab('Tags')
        await explorerDocumentPage.documentList.expandNthDocumentTree(0)
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer actions parent only'])
        // click next document to verify that attachmnet doesn't have a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer actions parent only'])

        // back to Explorer page
        await explorerDocumentPage.clickExplorerNavigationTab('Explorer')
    })

    it('Remove tag "Parent only"', async function() {
        // remove the tag from parent
        await documentViewerPage.clickNavigationButton('Prev')
        await documentViewerPage.removeAddedTag('tag from explorer actions parent only')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer actions parent only'])

        // remove tags via Actions menu
        await explorerDocumentPage.assertAtPage()
        await explorerDocumentPage.clickToolbarButton("Actions")
        await explorerDocumentPage.clickActionMenuItem('Remove Tag All')
        await explorerDocumentPage.clickActionSubMenuItem('Parent only')
        await parentOnlyModal.assertAtPage()
        await parentOnlyModal.selectTag("tag from explorer actions parent only")
        await parentOnlyModal.clickButton('Ok')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer actions parent only'])
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer actions parent only'])
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer actions parent only'])

        // back to Explorer page
        await explorerDocumentPage.clickExplorerNavigationTab('Explorer')
    })

    it.skip('[#1425] Create a tag from Explorer Actions "Child only"', async function() {
        await explorerPage.assertAtPage()
        await explorerPage.openActionMenu()
        await explorerPage.clickActionSubMenuItem('Tag', 'Child only')
        await childOnlyModal.assertAtPage()
        await childOnlyModal.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName("tag from explorer actions child only")
        await createTagModal.clickButton('Create')
        await childOnlyModal.assertAtPage()
        chai.expect(
            await childOnlyModal.getTagsList()
        ).to.include.members([
            'tag from explorer actions child only'
        ])
    })

    it.skip('[#1425] Make "Child only" explorer actions documents tagged', async function() {
        await childOnlyModal.selectTag("tag from explorer actions child only")
        await childOnlyModal.clickButton('Ok')

        // check that documents were tagged
        await explorerPage.assertAtPage()
        await explorerPage.openActionMenu()
        await explorerPage.clickActionMenuItem('View Document Set')
        await common.waitForTimeout(1000)
        await explorerDocumentPage.assertAtPage()
        await explorerDocumentPage.documentList.clickNthDocument(0)
        await documentViewerPage.assertAtPage()
        await documentViewerPage.clickTab('Tags')
        await explorerDocumentPage.documentList.expandNthDocumentTree(0)
        // check that parent doesn't have a tag
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer actions child only'])

        // check that child has a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from explorer actions child only'])

        // back to Explorer page
        await explorerDocumentPage.clickExplorerNavigationTab('Explorer')
    })
    
    it.skip('[#1425] Remove "Child only" tag from explorer actions', async function() {
        await explorerPage.assertAtPage()
        await explorerPage.openActionMenu()
        await explorerPage.clickActionSubMenuItem('Remove Tag', 'Child only')
        await childOnlyModal.assertAtPage()
        await childOnlyModal.selectTag("tag from explorer actions child only")
        await childOnlyModal.clickButton('Ok')

        // check that document was untagged
        await explorerPage.openActionMenu()
        await explorerPage.clickActionMenuItem('View Document Set')
        await common.waitForTimeout(1000)
        await explorerDocumentPage.assertAtPage()
        await explorerDocumentPage.documentList.clickNthDocument(0)
        await documentViewerPage.assertAtPage()
        await documentViewerPage.clickTab('Tags')
        await explorerDocumentPage.documentList.expandNthDocumentTree(0)
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer actions child only'])
        // click next document to verify that attachmnet doesn't have a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer actions child only'])

        // back to Explorer page
        await explorerDocumentPage.clickExplorerNavigationTab('Explorer')
    })

    it('Create a tag from Explorer Views "Parent and child"', async function() {
        await explorerPage.assertAtPage()
        await explorerPage.openActionMenu()
        await explorerPage.clickActionSubMenuItem('Tag', 'Parent and child')
        await parentAndChildModal.assertAtPage()
        await parentAndChildModal.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName("tag from explorer actions parent and child")
        await createTagModal.clickButton('Create')
        await parentAndChildModal.assertAtPage()
        chai.expect(
            await parentAndChildModal.getTagsList()
        ).to.include.members([
            'tag from explorer actions parent and child'
        ])
    })

    it('Make "Parent and child" documents tagged', async function() {
        await parentAndChildModal.selectTag("tag from explorer actions parent and child")
        await parentAndChildModal.clickButton('Ok')

        await explorerPage.assertAtPage()
        await explorerPage.openActionMenu()
        await explorerPage.clickActionMenuItem('View Document Set')
        await common.waitForTimeout(1000)
        await explorerDocumentPage.assertAtPage()
        await explorerDocumentPage.documentList.clickNthDocument(0)
        await documentViewerPage.assertAtPage()
        await documentViewerPage.clickTab('Tags')
        await explorerDocumentPage.documentList.expandNthDocumentTree(0)
        // check that parent has a tag
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from explorer actions parent and child'])

        // check that child has a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from explorer actions parent and child'])

        // back to Explorer page
        // await explorerDocumentPage.clickExplorerNavigationTab('Explorer')
    })
    
    it.skip('Remove "Parent and child" tag from explorer actions', async function() {
        await explorerPage.assertAtPage()
        await explorerPage.openActionMenu()
        await explorerPage.clickActionSubMenuItem('Remove Tag', 'Parent and child')
        await parentAndChildModal.assertAtPage()
        await parentAndChildModal.selectTag("tag from explorer actions parent and child")
        await childOnlyModal.clickButton('Ok')

        // check that document was untagged
        await explorerPage.openActionMenu()
        await explorerPage.clickActionMenuItem('View Document Set')
        await common.waitForTimeout(1000)
        await explorerDocumentPage.assertAtPage()
        await explorerDocumentPage.documentList.clickNthDocument(0)
        await documentViewerPage.assertAtPage()
        await documentViewerPage.clickTab('Tags')
        await explorerDocumentPage.documentList.expandNthDocumentTree(0)
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer actions parent and child'])
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer actions parent and child'])
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer actions parent and child'])
    })

    it('Remove tag "Parent and child"', async function() {
        // remove the tag from child
        await documentViewerPage.removeAddedTag('tag from explorer actions parent and child')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer actions parent and child'])
        await documentViewerPage.clickNavigationButton('Prev')
        // remove the tag from parent
        await documentViewerPage.removeAddedTag('tag from explorer actions parent and child')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer actions parent and child'])

        // remove tags via Actions menu
        await explorerDocumentPage.assertAtPage()
        await explorerDocumentPage.clickToolbarButton("Actions")
        await explorerDocumentPage.clickActionMenuItem('Remove Tag All')
        await explorerDocumentPage.clickActionSubMenuItem('Parent and child')
        await parentAndChildModal.assertAtPage()
        await parentAndChildModal.selectTag("tag from explorer actions parent and child")
        await parentAndChildModal.clickButton('Ok')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer actions parent and child'])
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer actions parent and child'])
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer actions parent and child'])
    })

    it('Delete previosly created tags', async function() {
        await projectNavigation.openProjectAdministrationMenu()
        await projectNavigation.clickMenuItem('Settings')
        await settingsPage.assertAtPage()
        await settingsPage.clickMenuOption('Manage Tags')
        await settingsPage.removeTag('tag from explorer actions parent only')
        await removeTagModal.assertAtPage()
        await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        // await settingsPage.page.reload()
        // await settingsPage.removeTag('tag from explorer actions child only')
        // await removeTagModal.assertAtPage()
        // await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        await settingsPage.page.reload()
        await settingsPage.removeTag('tag from explorer actions parent and child')
        await removeTagModal.assertAtPage()
        await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        await settingsPage.page.reload()
        chai.expect(
            await settingsPage.getListedTags()
        ).to.not.include.members([
            'tag from explorer actions parent only',
            // 'tag from explorer actions child only',
            'tag from explorer actions parent and child'
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Tags 11 - Create Tag via Explorer Views and add tags to the documents ', async function() {
    let loginUtil
    let projectNavigation
    let browserHelper
    let searchPage
    let explorerPage
    let explorerDocumentPage
    let createTagModal
    let removeTagModal
    let documentViewerPage
    let settingsPage
    let parentOnlyModal
    let childOnlyModal
    let parentAndChildModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()
        
        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        searchPage = new SearchPage(browserHelper.browser, browserHelper.page)
        explorerPage = new ExplorerPage(browserHelper.browser, browserHelper.page)
        explorerDocumentPage = new ExplorerDocumentPage(browserHelper.browser, browserHelper.page)
        createTagModal = new CreateTagModal(browserHelper.browser, browserHelper.page)
        removeTagModal = new RemoveTagModal(browserHelper.browser, browserHelper.page)
        documentViewerPage = new DocumentViewerPage(browserHelper.browser, browserHelper.page)
        settingsPage = new SettingsPage(browserHelper.browser, browserHelper.page)
        parentOnlyModal = new ParentOnlyModal(browserHelper.browser, browserHelper.page)
        childOnlyModal = new ChildOnlyModal(browserHelper.browser, browserHelper.page)
        parentAndChildModal = new ParentAndChildModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('Search for documents with attachments', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Search')
        await searchPage.assertAtPage()
        await searchPage.clickLeftSideTab('Metadata')
        await searchPage.selectMetadataFromList('Metadata Field')
        await searchPage.searchForMetadataField('Attachment Count')
        await searchPage.addMetadataField('Attachment Count')
        await searchPage.clickFullTextElementClickToInsert()
        await searchPage.typeFullTextElementTerm('7')  
        await searchPage.clickSearchButton()
    })

    it('Open Explorer and filter by Data Set Searches', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Explorer')
        await explorerPage.assertAtPage()
        await explorerPage.openDataSet()
        await explorerPage.expandDataSetProjectOptionMenu('Searches')
        await explorerPage.selectNthDataProjectOptionMenuItem(0)
        await explorerPage.clickGraphBar('Microsoft Outlook')
        await explorerPage.clickActionMenuItem('View Document Set')
        await common.waitForTimeout(1000)
    })
    
    it('Create a tag from Explorer Views "Parent only"', async function() {
        await explorerDocumentPage.assertAtPage()
        await explorerDocumentPage.documentList.clickNthDocument(0)
        await documentViewerPage.assertAtPage()
        await documentViewerPage.clickTab('Tags')
        await explorerDocumentPage.documentList.expandNthDocumentTree(0)
        await explorerDocumentPage.clickToolbarButton("Actions")
        await explorerDocumentPage.clickActionMenuItem('Tag All')
        await explorerDocumentPage.clickActionSubMenuItem('Parent only')
        await parentOnlyModal.assertAtPage()
        await parentOnlyModal.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName("tag from explorer views parent only")
        await createTagModal.clickButton('Create')
        await parentOnlyModal.assertAtPage()
        chai.expect(
            await parentOnlyModal.getTagsList()
        ).to.include.members([
            'tag from explorer views parent only'
        ])
    })

    it('Make "Parent only" explorer views documents tagged', async function() {
        await parentOnlyModal.selectTag("tag from explorer views parent only")
        await parentOnlyModal.clickButton('Ok')

        // check that documents were tagged
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from explorer views parent only'])

        // click next document to verify that attachmnet doesn't have a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer views parent only'])
    })

    it('Remove tag "Parent only" from explorer views', async function() {
        await explorerDocumentPage.clickToolbarButton("Actions")
        await explorerDocumentPage.clickActionMenuItem('Remove Tag All')
        await explorerDocumentPage.clickActionSubMenuItem('Parent only')
        await parentOnlyModal.assertAtPage()
        await parentOnlyModal.selectTag("tag from explorer views parent only")
        await parentOnlyModal.clickButton('Ok')

        // check that document was untagged
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer views parent only'])
        // click next document to verify that attachmnet doesn't have a tag
        await documentViewerPage.clickNavigationButton('Prev')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer views parent only'])
    })

    it.skip('[#1425] Create a tag from Explorer Views "Child only"', async function() {
        await explorerDocumentPage.assertAtPage()
        await explorerDocumentPage.clickToolbarButton("Actions")
        await explorerDocumentPage.clickActionMenuItem('Tag All')
        await explorerDocumentPage.clickActionSubMenuItem('Child only')
        await childOnlyModal.assertAtPage()
        await childOnlyModal.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName("tag from explorer views child only")
        await createTagModal.clickButton('Create')
        await childOnlyModal.assertAtPage()
        chai.expect(
            await childOnlyModal.getTagsList()
        ).to.include.members([
            'tag from explorer views child only'
        ])
    })

    it.skip('[#1425] Make "Child only" explorer views documents tagged', async function() {
        await childOnlyModal.selectTag("tag from explorer views child only")
        await childOnlyModal.clickButton('Ok')
        // check that parent doesn't have a tag
        await documentViewerPage.assertAtPage()
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer views child only'])

        // check that child has a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from explorer views child only'])
    })
    
    it.skip('[#1425] Remove "Child only" tag from explorer views', async function() {
        await explorerDocumentPage.assertAtPage()
        await explorerDocumentPage.clickToolbarButton("Actions")
        await explorerDocumentPage.clickActionMenuItem('Remove Tag All')
        await explorerDocumentPage.clickActionSubMenuItem('Child only')
        await childOnlyModal.assertAtPage()
        await childOnlyModal.selectTag("tag from explorer views child only")
        await childOnlyModal.clickButton('Ok')

        // check that document was untagged
        await documentViewerPage.assertAtPage()
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer views child only'])
        // click next document to verify that attachmnet doesn't have a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer views child only'])
    })

    it('Create a tag from Explorer Views "Parent and child"', async function() {
        await explorerDocumentPage.clickToolbarButton("Actions")
        await explorerDocumentPage.clickActionMenuItem('Tag All')
        await explorerDocumentPage.clickActionSubMenuItem('Parent and child')
        await parentAndChildModal.assertAtPage()
        await parentAndChildModal.clickCreateTagButton()
        await createTagModal.assertAtPage()
        await createTagModal.typeName("tag from explorer views parent and child")
        await createTagModal.clickButton('Create')
        await parentAndChildModal.assertAtPage()
        chai.expect(
            await parentAndChildModal.getTagsList()
        ).to.include.members([
            'tag from explorer views parent and child'
        ])
    })

    it('Make "Parent and child" documents tagged', async function() {
        await parentAndChildModal.selectTag("tag from explorer views parent and child")
        await parentAndChildModal.clickButton('Ok')

        // check that parent has a tag
        await documentViewerPage.assertAtPage()
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from explorer views parent and child'])

        // check that child has a tag
        await documentViewerPage.clickNavigationButton('Next')
        chai.expect(
            await documentViewerPage.getAddedTagsList()
        ).to.include.members(['tag from explorer views parent and child'])
    })
    
    it('Remove "Parent and child" tag from explorer views', async function() {
        await explorerDocumentPage.clickToolbarButton("Actions")
        await explorerDocumentPage.clickActionMenuItem('Remove Tag All')
        await explorerDocumentPage.clickActionSubMenuItem('Parent and child')
        await parentAndChildModal.assertAtPage()
        await parentAndChildModal.selectTag("tag from explorer views parent and child")
        await childOnlyModal.clickButton('Ok')

        // check that document was untagged
        await documentViewerPage.assertAtPage()
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer views parent and child'])
        await documentViewerPage.clickNavigationButton('Prev')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer views parent and child'])
        await documentViewerPage.clickNavigationButton('Prev')
        chai.expect(
            await documentViewerPage.getCreatedTagsList()
        ).to.include.members(['tag from explorer views parent and child'])
    })

    it('Delete previosly created tags', async function() {
        await projectNavigation.openProjectAdministrationMenu()
        await projectNavigation.clickMenuItem('Settings')
        await settingsPage.assertAtPage()
        await settingsPage.clickMenuOption('Manage Tags')
        await settingsPage.removeTag('tag from explorer views parent only')
        await removeTagModal.assertAtPage()
        await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        // await settingsPage.page.reload()
        // await settingsPage.removeTag('tag from explorer graph child only')
        // await removeTagModal.assertAtPage()
        // await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        await settingsPage.page.reload()
        await settingsPage.removeTag('tag from explorer views parent and child')
        await removeTagModal.assertAtPage()
        await removeTagModal.clickButton('Delete')
        // needs page refresh due to #1551
        await settingsPage.page.reload()
        chai.expect(
            await settingsPage.getListedTags()
        ).to.not.include.members([
            'tag from explorer views parent only',
            // 'tag from explorer views child only',
            'tag from explorer views parent and child'
        ])
    })
    
    after(async function() {        
        await browserHelper.destroy()
    })
})