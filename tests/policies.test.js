const LoginUtil = require("../util/LoginUtil")
const TopNavigation = require("../pages/components/TopNavigation")
const ProjectNavigation = require("../pages/components/ProjectNavigation")
const BrowserHelper = require("../util/BrowserHelper")
const chai = require('chai')
const config = require('config')
const common = require("../common")
const SearchPage = require("../pages/SearchPage")
const SearchResultsPage = require("../pages/SearchResultsPage")
const DocumentViewerPage = require("../pages/DocumentViewerPage")
const CollectDocumentsModal = require("../pages/modals/CollectDocumentsModal")
const CreateFolderModal = require("../pages/modals/CreateFolderModal")
const EditFolderModal = require("../pages/modals/EditFolderModal")
const DeleteFolderModal = require("../pages/modals/DeleteFolderModal")
const PoliciesPage = require("../pages/PoliciesPage")
const ExplorerPage = require("../pages/ExplorerPage")
const ExplorerDocumentPage = require("../pages/ExplorerDocumentPage")
const CreatePolicyModal = require("../pages/modals/CreatePolicyModal")
const EditPolicyModal = require("../pages/modals/EditPolicyModal")
const DeletePolicyModal = require("../pages/modals/DeletePolicyModal")
const PolicyNotificationsPage = require("../pages/PolicyNotificationsPage")
const CopyPolicyModal = require("../pages/modals/CopyPolicyModal")
const DraftPolicyModal = require("../pages/modals/DraftPolicyModal")
const ReportsPage = require("../pages/ReportsPage")
const CopyLogReportModal = require("../pages/modals/CopyLogReportModal")
const ProjectDeletionReportModal = require("../pages/modals/ProjectDeletionReportModal")

describe('[#1387] Policy Sets 01 - Create Folders and Subfolders from the Policies page, move, edit and delete them', async function(){
    let loginUtil    
    let projectNavigation
    let policiesPage
    let browserHelper
    let createFolderModal
    let createPolicyModal
    let deleteFolderModal
    let editFolderModal
    let editPolicyModal
    let deletePolicyModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)        
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        policiesPage = new PoliciesPage(browserHelper.browser, browserHelper.page)
        createFolderModal = new CreateFolderModal(browserHelper.browser, browserHelper.page)
        createPolicyModal = new CreatePolicyModal(browserHelper.browser, browserHelper.page)
        deleteFolderModal = new DeleteFolderModal(browserHelper.browser, browserHelper.page)
        editFolderModal = new EditFolderModal(browserHelper.browser, browserHelper.page)
        editPolicyModal = new EditPolicyModal(browserHelper.browser, browserHelper.page)
        deletePolicyModal = new DeletePolicyModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('User is able to create a folder from Policies Menu', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Policies')
        await policiesPage.assertAtPage()
        await policiesPage.clickCreateButton('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('new folder')
        await createFolderModal.typeDescription('new description')
        await createFolderModal.clickButton('Create')        
        await common.waitForTimeout(500)
        chai.expect(
            await policiesPage.getListedPolicies()
        ).to.include.members([
            "Policies",
            "new folder"
        ])
    })

    it('User is able to create a subfolder from Policies menu', async function() {
        await policiesPage.assertAtPage()        
        await policiesPage.treeView.openItemMenu('new folder')        
        await policiesPage.treeView.selectItemMenuItem('New Folder')
        await createFolderModal.assertAtPage()
        await createFolderModal.typeName('new subfolder')
        await createFolderModal.typeDescription('new subdescription')
        await createFolderModal.clickButton('Create')     
        await common.waitForTimeout(500)
        chai.expect(
            await policiesPage.getListedPolicies()
        ).to.include.members([
            "Policies",
            "new folder",
            "new subfolder",
        ])
    })

    it(`Create Copy Policies (extracted files) without Policy Notifications`, async function() {
        await policiesPage.assertAtPage()
        await policiesPage.clickCreateButton('New Policy')
        await createPolicyModal.assertAtPage()
        await createPolicyModal.typeName('copy policy01')
        await createPolicyModal.typeDescription('without notifications')
        await createPolicyModal.openPolicyRuleSearch()
        await createPolicyModal.searchForSavedSearches('master search')
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
            "new folder",
            "new subfolder",
            "copy policy01"
        ])
    })

    it('User is able to edit a folder', async function() {
        await policiesPage.assertAtPage()
        await policiesPage.treeView.openItemMenu('new subfolder')
        await policiesPage.treeView.selectItemMenuItem('Edit Folder')
        await editFolderModal.assertAtPage()
        await common.waitForTimeout(1000)
        await editFolderModal.typeName('EDITED folder')
        await editFolderModal.typeDescription('it was edited')
        await editFolderModal.clickButton('Save')
        chai.expect(
            await policiesPage.getListedPolicies()
        ).to.include.members([
            "EDITED folder"
        ])
    })

    it('User is able to move folder to the root, to other folders and subfolders', async function() {
        await policiesPage.assertAtPage()
        await policiesPage.treeView.selectItem('EDITED folder')
        //to the root
        await policiesPage.treeView.nestField('EDITED folder', 'Policies')        
        chai.expect(
            await policiesPage.treeView.isItemFoldered('EDITED folder')
        ).to.be.false

        await policiesPage.treeView.selectItem('EDITED folder')
        //to other folder
        await policiesPage.treeView.nestField('EDITED folder', 'new folder') 
        chai.expect(
            await policiesPage.treeView.isItemFoldered('EDITED folder')
        ).to.be.true
    })

    it('User is able to edit policy', async function() {
        await policiesPage.assertAtPage()
        await policiesPage.treeView.expandItem('EDITED folder')
        await policiesPage.treeView.openItemMenu('copy policy01')
        await policiesPage.treeView.selectItemMenuItem('Edit Policy')
        await editPolicyModal.assertAtPage()
        await common.waitForTimeout(1000)
        await editPolicyModal.typeName('EDITED policy')
        await editPolicyModal.typeDescription('it was edited')
        await editPolicyModal.clickButton('Edit')
        chai.expect(
            await policiesPage.getListedPolicies()
        ).to.include.members([
            "EDITED policy"
        ])
    })
    
    it('User is able to move policy', async function() {
        await policiesPage.assertAtPage()
        await policiesPage.treeView.selectItem('EDITED policy')
        //to other folder
        await policiesPage.treeView.nestField('EDITED policy','new folder')
        chai.expect(
            await policiesPage.treeView.isItemFoldered('EDITED policy')
        ).to.be.true

        await policiesPage.treeView.selectItem('EDITED policy')
        //to the root
        await policiesPage.treeView.nestField('EDITED policy', 'Policies')
        chai.expect(
            await policiesPage.treeView.isItemFoldered('EDITED policy')
        ).to.be.false
    })

    it('User is able to delete folders and policy from Policies menu', async function() {        
        await policiesPage.assertAtPage()
        await policiesPage.treeView.openItemMenu('EDITED policy')
        await policiesPage.treeView.selectItemMenuItem('Delete Policy')
        await deletePolicyModal.assertAtPage()
        await deletePolicyModal.clickButton('Delete')
        await policiesPage.treeView.openItemMenu('EDITED folder')
        await policiesPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        await policiesPage.treeView.openItemMenu('new folder')
        await policiesPage.treeView.selectItemMenuItem('Delete Folder')
        await deleteFolderModal.assertAtPage()
        await deleteFolderModal.clickDeleteButton()
        chai.expect(
            await policiesPage.getListedPolicies()
        ).to.not.include.members([
            "new folder",
            "EDITED folder",
            "EDITED policy"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('[#1387] Policy Sets 02 - Create Copy Policies (full containers) with and without Policy Notifications and create Copy Log report', async function() {
    let loginUtil   
    let topNavigation 
    let projectNavigation
    let policiesPage
    let browserHelper
    let createPolicyModal
    let deletePolicyModal
    let copyPolicyModal
    let draftPolicyModal
    let policyNotificationsPage
    let reportsPage
    let copyLogReportModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)   
        topNavigation = new TopNavigation(browserHelper.browser, browserHelper.page)     
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        policiesPage = new PoliciesPage(browserHelper.browser, browserHelper.page)
        policyNotificationsPage = new PolicyNotificationsPage(browserHelper.browser, browserHelper.page)
        createPolicyModal = new CreatePolicyModal(browserHelper.browser, browserHelper.page)
        draftPolicyModal = new DraftPolicyModal(browserHelper.browser, browserHelper.page)
        deletePolicyModal = new DeletePolicyModal(browserHelper.browser, browserHelper.page)
        copyPolicyModal = new CopyPolicyModal(browserHelper.browser, browserHelper.page)
        reportsPage = new ReportsPage(browserHelper.browser, browserHelper.page)
        copyLogReportModal = new CopyLogReportModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('Create Copy Policies (full containers) without Policy Notifications', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Policies')
        await policiesPage.assertAtPage()
        await policiesPage.clickCreateButton('New Policy')
        await createPolicyModal.assertAtPage()
        await createPolicyModal.typeName('copy policy02')
        await createPolicyModal.typeDescription('without notifications')
        await createPolicyModal.openPolicyRuleSearch()
        await createPolicyModal.searchForSavedSearches('auto pol01')
        await createPolicyModal.openPolicyRuleAction()
        await createPolicyModal.selectPolicyRuleAction('Copy')
        await createPolicyModal.openWhereCopy()
        await createPolicyModal.selectEndpointWhereCopy('automation endpoint')
        await createPolicyModal.openWhenCopy()
        // we need select After time option to be able delete policy
        await createPolicyModal.selectOnOrAfterTime('After')
        await createPolicyModal.selectWhenOnOption('Date Added to Policy')
        await createPolicyModal.setDurationTime('Days:', '10')
        // change to full container option
        await createPolicyModal.selectExportFullContainersOption()
        await createPolicyModal.closeSentNotification()
        await createPolicyModal.clickButton('Create')
        chai.expect(
            await policiesPage.getListedPolicies()
        ).to.include.members([
            "Policies",
            "copy policy02"
        ])
    })

    it('Create Copy Policies with several Policy Notifications', async function() {
        await policiesPage.assertAtPage()
        await policiesPage.clickCreateButton('New Policy')
        await createPolicyModal.assertAtPage()
        await createPolicyModal.typeName('copy policy03')
        await createPolicyModal.typeDescription('with notifications')
        await createPolicyModal.openPolicyRuleSearch()
        await createPolicyModal.searchForSavedSearches('auto pol01')
        await createPolicyModal.openPolicyRuleAction()
        await createPolicyModal.selectPolicyRuleAction('Copy')
        await createPolicyModal.openWhereCopy()
        await createPolicyModal.selectEndpointWhereCopy('automation endpoint')
        await createPolicyModal.openWhenCopy()
        // we need select After time option to be able delete policy
        await createPolicyModal.selectOnOrAfterTime('After')
        await createPolicyModal.selectWhenOnOption('Date Added to Policy')
        await createPolicyModal.setDurationTime('Days:', '10')
        await createPolicyModal.openSendNotificationWhenCopyLink()
        await createPolicyModal.selectSendNotificationWhenLinkMenuOption('New documents are added to the policy')
        await createPolicyModal.openSendNotificationToWhoLink()
        await createPolicyModal.selectSendNotificationToWhoLinkMenuOption('Additional Person')
        await createPolicyModal.openSendNotificationToPersonLink()
        await createPolicyModal.searchForCustodianName('MA auto')
        await createPolicyModal.addSelectedCustodian('MA auto')
        await createPolicyModal.clickButton('Create')
        chai.expect(
            await policiesPage.getListedPolicies()
        ).to.include.members([
            "Policies",
            "copy policy02",
            "copy policy03"
        ])
    })

    it('Copy Policies into selected Project and Activate them', async function() {
        await policiesPage.assertAtPage()
        await policiesPage.treeView.openItemMenu('copy policy03')
        await policiesPage.treeView.selectItemMenuItem('Copy Policy')
        await copyPolicyModal.assertAtPage()
        await copyPolicyModal.typeName('copy policy03 Copy')
        await copyPolicyModal.typeDescription('its a copy')
        await copyPolicyModal.clickButton('Copy')
        await policiesPage.clickActivatePolicyButton()
        await draftPolicyModal.assertAtPage()
        await draftPolicyModal.clickButton('Activate')
        chai.expect(
            await policiesPage.getListedPolicies()
        ).to.include.members([
            "Policies",
            "copy policy02",
            "copy policy03",
            "copy policy03 Copy"
        ])
    })

    it('Create Copy Log report for these policies', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Reports')
        await reportsPage.assertAtPage()
        await reportsPage.selectReportsMenuItem('Copy Log')
        await copyLogReportModal.assertAtPage()
        await copyLogReportModal.openAddCopyOrArchivePoliciesMenu()
        await copyLogReportModal.addCopyOrArchivePolicies('copy policy02')
        await copyLogReportModal.openAddCopyOrArchivePoliciesMenu()
        await copyLogReportModal.addCopyOrArchivePolicies('copy policy03')
        await copyLogReportModal.openAddCopyOrArchivePoliciesMenu()
        await copyLogReportModal.addCopyOrArchivePolicies('copy policy03 Copy')
        await copyLogReportModal.clickButton('Generate')
        await reportsPage.assertAtPage()
        chai.expect(
            await reportsPage.getAllValuesForColumnCopyLogReport('POLICY NAME')
        ).to.include.members([
            "copy policy02",
            "copy policy03",
            "copy policy03 Copy"
        ])
    })

    it('Check that the custodian received the notification', async function() {
        // const policiesUrlToReturn = await browserHelper.page.url()
        await reportsPage.assertAtPage()
        await loginUtil.logout()
        await loginUtil.loginAsRGCustodian()
        await topNavigation.clickPolicyNotificationButton()
        await policyNotificationsPage.assertAtPage()
        chai.expect(
            await policyNotificationsPage.getValueOfColumn('Policy Name')
        ).to.include("copy policy03")
        await loginUtil.logout()
        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Policies')
        // await browserHelper.page.goto(policiesUrlToReturn)
        await policiesPage.assertAtPage()
    })

    it('User is able to delete the previously created policy', async function() {        
        await policiesPage.assertAtPage()
        await policiesPage.treeView.openItemMenu('copy policy02')
        await policiesPage.treeView.selectItemMenuItem('Delete Policy')
        await deletePolicyModal.assertAtPage()
        await deletePolicyModal.clickButton('Delete')
        await policiesPage.treeView.openItemMenu('copy policy03')
        await policiesPage.treeView.selectItemMenuItem('Delete Policy')
        await deletePolicyModal.assertAtPage()
        await deletePolicyModal.clickButton('Delete')
        await policiesPage.treeView.openItemMenu('copy policy03 Copy')
        await policiesPage.treeView.selectItemMenuItem('Delete Policy')
        await deletePolicyModal.assertAtPage()
        await deletePolicyModal.clickButton('Delete')
        chai.expect(
            await policiesPage.getListedPolicies()
        ).to.not.include.members([
            "copy policy02",
            "copy policy03",
            "copy policy03 Copy"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})

describe('Policy Sets 03 - Create Destroy Policies with and without Notifications and create project Deletion report', async function() {
    let loginUtil   
    let topNavigation 
    let projectNavigation
    let policiesPage
    let browserHelper
    let createPolicyModal
    let deletePolicyModal
    let policyNotificationsPage
    let reportsPage
    let projectDeletionReportModal

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)   
        topNavigation = new TopNavigation(browserHelper.browser, browserHelper.page)     
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page)
        policiesPage = new PoliciesPage(browserHelper.browser, browserHelper.page)
        policyNotificationsPage = new PolicyNotificationsPage(browserHelper.browser, browserHelper.page)
        createPolicyModal = new CreatePolicyModal(browserHelper.browser, browserHelper.page)
        deletePolicyModal = new DeletePolicyModal(browserHelper.browser, browserHelper.page)
        reportsPage = new ReportsPage(browserHelper.browser, browserHelper.page)
        projectDeletionReportModal = new ProjectDeletionReportModal(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
    })

    it('Create Destroy Policies without Policy Notifications', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Policies')
        await policiesPage.assertAtPage()
        await policiesPage.clickCreateButton('New Policy')
        await createPolicyModal.assertAtPage()
        await createPolicyModal.typeName('destroy policy01')
        await createPolicyModal.typeDescription('without notifications')
        await createPolicyModal.openPolicyRuleSearch()
        await createPolicyModal.searchForSavedSearches('auto pol04')
        await createPolicyModal.openPolicyRuleAction()
        await createPolicyModal.selectPolicyRuleAction('Destroy')
        await createPolicyModal.openStartDeletingWhenLink()
        await createPolicyModal.selectWhenOnOption('Date Added to Policy')
        await createPolicyModal.closeSentNotification()
        await createPolicyModal.clickButton('Create')
        chai.expect(
            await policiesPage.getListedPolicies()
        ).to.include.members([
            "Policies",
            "destroy policy01"
        ])
    })

    it('Create Destroy Policies with several Policy Notifications but without "override" option', async function() {
        await policiesPage.assertAtPage()
        await policiesPage.clickCreateButton('New Policy')
        await createPolicyModal.assertAtPage()
        await createPolicyModal.typeName('destroy policy02')
        await createPolicyModal.typeDescription('with notifications')
        await createPolicyModal.openPolicyRuleSearch()
        await createPolicyModal.searchForSavedSearches('auto pol04')
        await createPolicyModal.openPolicyRuleAction()
        await createPolicyModal.selectPolicyRuleAction('Destroy')
        await createPolicyModal.openStartDeletingWhenLink()
        await createPolicyModal.selectWhenOnOption('Date Added to Policy')

        // setup notification
        await createPolicyModal.openSendNotificationWhenDestroyLink()
        await createPolicyModal.selectSendNotificationWhenLinkMenuOption('Before Deletion takes place')
        await createPolicyModal.openSendNotificationToWhoLink()
        await createPolicyModal.selectSendNotificationToWhoLinkMenuOption('Additional Person')
        await createPolicyModal.openSendNotificationToPersonLink()
        await createPolicyModal.searchForCustodianName('MA auto')
        await createPolicyModal.addSelectedCustodian('MA auto')
        await createPolicyModal.clickButton('Create')
        chai.expect(
            await policiesPage.getListedPolicies()
        ).to.include.members([
            "Policies",
            "destroy policy01",
            "destroy policy02"
        ])
    })

    it('Create Destroy Policies with "override" option', async function() {
        await policiesPage.assertAtPage()
        await policiesPage.clickCreateButton('New Policy')
        await createPolicyModal.assertAtPage()
        await createPolicyModal.typeName('destroy policy03')
        await createPolicyModal.typeDescription('with notifications')
        await createPolicyModal.openPolicyRuleSearch()
        await createPolicyModal.searchForSavedSearches('auto pol04')
        await createPolicyModal.openPolicyRuleAction()
        await createPolicyModal.selectPolicyRuleAction('Destroy')
        await createPolicyModal.openStartDeletingWhenLink()
        await createPolicyModal.selectWhenOnOption('Date Added to Policy')
        await createPolicyModal.openSendNotificationWhenDestroyLink()
        await createPolicyModal.selectSendNotificationWhenLinkMenuOption('Before Deletion takes place')

        // choose override option ON
        await createPolicyModal.openCustodianOverrideTurnedLink()
        await createPolicyModal.selectCustodianOverrideTurnedOption('on')

        // select notification option
        await createPolicyModal.openSendNotificationToWhoLink()
        await createPolicyModal.selectSendNotificationToWhoLinkMenuOption('Additional Person')
        await createPolicyModal.openSendNotificationToPersonLink()
        await createPolicyModal.searchForCustodianName('MA auto')
        await createPolicyModal.addSelectedCustodian('MA auto')
        await createPolicyModal.clickButton('Create')
        chai.expect(
            await policiesPage.getListedPolicies()
        ).to.include.members([
            "Policies",
            "destroy policy01",
            "destroy policy02",
            "destroy policy03"
        ])
    })

    it('Create Project Deletion report for these policies', async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openAnalyticToolsMenu()
        await projectNavigation.clickMenuItem('Reports')
        await reportsPage.assertAtPage()
        await reportsPage.selectReportsMenuItem('Project Deletion')
        await projectDeletionReportModal.assertAtPage()
        await projectDeletionReportModal.clickOptionTab('Policy(ies)')
        await projectDeletionReportModal.openAddPoliciesMenu()
        await projectDeletionReportModal.addPolicy('destroy policy01')
        await projectDeletionReportModal.openAddPoliciesMenu()
        await projectDeletionReportModal.addPolicy('destroy policy02')
        await projectDeletionReportModal.openAddPoliciesMenu()
        await projectDeletionReportModal.addPolicy('destroy policy03')
        await projectDeletionReportModal.clickButton('Generate')
        await reportsPage.assertAtPage()
        chai.expect(
            await reportsPage.getAllValuesForColumnProjectDeletionReport('Name\n(Policy or Deletion)')
        ).to.include.members([
            "destroy policy01",
            "destroy policy02",
            "destroy policy03"
        ])
    })

    it('Approve Destroy Policies', async function() {
        await reportsPage.assertAtPage()
        await loginUtil.logout()
        await loginUtil.loginAsRGApprover(config.get('rgProject'))
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Policies')
        await policiesPage.assertAtPage()
        await policiesPage.treeView.selectItem('destroy policy02')
        await policiesPage.clickDocumentDetailsLink()

        // info value before approve
        chai.expect(
            await policiesPage.getValueOfStatus('Approval Status:')
        ).to.equal('Approval Request Sent')
        await policiesPage.clickPolicyInfoHeaderButton('Approve')

        // info value after approve
        chai.expect(
            await policiesPage.getValueOfStatus('Approval Status:')
        ).to.equal('Approved')
        await policiesPage.closeInfoPane()

        await policiesPage.assertAtPage()
        await policiesPage.treeView.selectItem('destroy policy03')
        await policiesPage.clickDocumentDetailsLink()

        // info value before approve
        chai.expect(
            await policiesPage.getValueOfStatus('Approval Status:')
        ).to.equal('Approval Request Sent')
        await policiesPage.clickPolicyInfoHeaderButton('Approve')

        // info value after approve
        chai.expect(
            await policiesPage.getValueOfStatus('Approval Status:')
        ).to.equal('Approved')
        await policiesPage.closeInfoPane()
    })

    it('Check the Policies Status on the Project', async function() {
        await loginUtil.logout()
        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Policies')
        await policiesPage.treeView.selectItem('destroy policy02')
        await policiesPage.clickDocumentDetailsLink()

        chai.expect(
            await policiesPage.getValueOfStatus('Approval Status:')
        ).to.equal('Approved')
        await policiesPage.closeInfoPane()

         // run "Refresh Evergreen"
         await policiesPage.clickRefreshToolbarButton()
         await policiesPage.clickRefreshMenuItem('Refresh Evergreen')
         await common.waitForTimeout(1000)
         //wait for toast, then wait a bit more
         await topNavigation.waitForToastMessageToContain('Evergreen refresh has finished')

        await policiesPage.assertAtPage()
        await policiesPage.treeView.selectItem('destroy policy03')
        await policiesPage.clickDocumentDetailsLink()
    
        chai.expect(
            await policiesPage.getValueOfStatus('Approval Status:')
        ).to.equal('Approved')
        await policiesPage.closeInfoPane()
    })

    it('Check that the custodian received the notification', async function() {
        // const policiesUrlToReturn = await browserHelper.page.url()
        await loginUtil.logout()
        await loginUtil.loginAsRGCustodian()
        await topNavigation.clickPolicyNotificationButton()
        await policyNotificationsPage.assertAtPage()

        // needs a time to appear notifications
        await common.waitForTimeout(3000)
        await policyNotificationsPage.page.reload()
        await policyNotificationsPage.assertAtPage()
        chai.expect(
            await policyNotificationsPage.getValueOfColumn('Policy Name')
        ).to.include("destroy policy03")
        await policyNotificationsPage.clickRightToolbarButton('Snooze All')
        await policyNotificationsPage.waitForToolbarButtonCount('0')
        await common.waitForTimeout(3000)
        await loginUtil.logout()
        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Policies')
        // await browserHelper.page.goto(policiesUrlToReturn)
    })

    it('User is able to delete the previously created destroy policies', async function() {        
        await policiesPage.assertAtPage()
        await policiesPage.treeView.openItemMenu('destroy policy01')
        await policiesPage.treeView.selectItemMenuItem('Delete Policy')
        await deletePolicyModal.assertAtPage()
        await deletePolicyModal.clickButton('Delete')
        await policiesPage.treeView.openItemMenu('destroy policy02')
        await policiesPage.treeView.selectItemMenuItem('Delete Policy')
        await deletePolicyModal.assertAtPage()
        await deletePolicyModal.clickButton('Delete')
        await policiesPage.treeView.openItemMenu('destroy policy03')
        await policiesPage.treeView.selectItemMenuItem('Delete Policy')
        await deletePolicyModal.assertAtPage()
        await deletePolicyModal.clickButton('Delete')
        chai.expect(
            await policiesPage.getListedPolicies()
        ).to.not.include.members([
            "destroy policy01",
            "destroy policy02",
            "destroy policy03"
        ])
    })

    after(async function() {        
        await browserHelper.destroy()
    })
})