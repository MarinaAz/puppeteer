const common = require("../common")
const FoldersPage = require("../pages/FoldersPage")
const UserTasksPage = require("../pages/UserTasksPage")
const ProjectNavigation = require("../pages/components/ProjectNavigation")
const TopNavigation = require("../pages/components/TopNavigation")
const ChooseDownloadOptionModal = require("../pages/modals/ChooseDownloadOptionModal")
const BrowserHelper = require("../util/BrowserHelper")
const LoginUtil = require("../util/LoginUtil")
const config = require("config")
const chai = require('chai')
const path = require('path')

//if filesize tests fail, the expected downloaded files for comparison are in resources/expected-master folder_documents
describe('Download All, Download Documents', async function () {
    let loginUtil    
    let browserHelper
    let projectNavigation
    let foldersPage
    let chooseDownloadOptionModal
    let topNavigation
    let userTasksPage

    let testDataDownloadPath = './downloads/'
   
    before(async function() {
        browserHelper = new BrowserHelper() 
        await browserHelper.init()        

        loginUtil = new LoginUtil(browserHelper.browser, browserHelper.page)  
        projectNavigation = new ProjectNavigation(browserHelper.browser, browserHelper.page) 
        foldersPage = new FoldersPage(browserHelper.browser, browserHelper.page) 
        chooseDownloadOptionModal = new ChooseDownloadOptionModal(browserHelper.browser, browserHelper.page)
        topNavigation = new TopNavigation(browserHelper.browser, browserHelper.page)
        userTasksPage = new UserTasksPage(browserHelper.browser, browserHelper.page)

        await loginUtil.loginAsRGLocalUser(config.get('rgProject'))
        

        //empty the download directory before this test
        await common.emptyDirectory(testDataDownloadPath)
    })


    it(`User is able start a download task from a document list`, async function() {
        await projectNavigation.assertAtPage()
        await projectNavigation.openDocumentSetsMenu()
        await projectNavigation.clickMenuItem('Folders')
        await foldersPage.assertAtPage()

        //open test folder and download all
        await foldersPage.treeView.selectItem('master folder')
        await foldersPage.clickToolbarButton('Actions')
        await foldersPage.clickActionMenuItem('Download All')
        await foldersPage.clickActionSubMenuItem('Download Documents')
       
        //modal
        await chooseDownloadOptionModal.assertAtPage()
        await chooseDownloadOptionModal.clickFooterButton('Ok')
        
        //wait for toast 
        await topNavigation.waitForToastMessageToContain('Document download is ready')
    })

    it(`Completed download task shows on task list page`, async function() {

        //open user tasks
        await topNavigation.clickAdminMenu()
        await topNavigation.clickAdminMenuItem('Tasks')
        await userTasksPage.assertAtPage()

        chai.expect(
            await userTasksPage.getTopTaskName()
        ).to.equal('Download Documents')
    })

    it(`Downloading from task list results in download`, async function() {    
        //download
        await common.setDownloadBehavior(browserHelper.page, testDataDownloadPath)
        await userTasksPage.clickLinkInTopTaskDetails('here')
        await common.awaitDownload('master folder_documents.zip', testDataDownloadPath)

        //unzip
        await common.unzipDownload(`master folder_documents.zip`, testDataDownloadPath)
    })

    it(`Download zip contains expected folders and files`, async function() { 
        chai.expect(
            common.getFilesInDirectory(path.resolve(testDataDownloadPath, `master folder_documents`))
        ).to.have.members([
            'rg_dtsearch_text',
            'rg_metadata',
            'rg_native',
            'rg_ocr_text',
            'rg_text'
        ])
    })

    it(`Download zip rg_dtsearch_text folder contains expected folders and files`, async function() { 
        chai.expect(
            common.getFilesInDirectory(path.resolve(testDataDownloadPath, `master folder_documents`, 'rg_dtsearch_text'))
        ).to.have.members([
            'RG201000.txt.txt'
        ])

        chai.expect(
            common.getFileSize(path.resolve(testDataDownloadPath, `master folder_documents`, 'rg_dtsearch_text', 'RG201000.txt.txt'))
        ).to.equal(23)
    })

    it(`Download zip rg_metadata folder contains expected folders and files`, async function() { 
        chai.expect(
            common.getFilesInDirectory(path.resolve(testDataDownloadPath, `master folder_documents`, 'rg_metadata'))
        ).to.have.members([
            'metadata.csv'
        ])

        chai.expect(
            common.getFileSize(path.resolve(testDataDownloadPath, `master folder_documents`, 'rg_metadata', 'metadata.csv'))
        ).to.be.closeTo(3732, 3800)
    })

    it(`Download zip rg_native folder contains expected folders and files`, async function() { 
        chai.expect(
            common.getFilesInDirectory(path.resolve(testDataDownloadPath, `master folder_documents`, 'rg_native'))
        ).to.have.members([
            'RG201000.txt'
        ])

        chai.expect(
            common.getFileSize(path.resolve(testDataDownloadPath, `master folder_documents`, 'rg_native', 'RG201000.txt'))
        ).to.equal(23)
    })

    it(`Download zip rg_ocr_text folder contains expected folders and files`, async function() { 
        chai.expect(
            common.getFilesInDirectory(path.resolve(testDataDownloadPath, `master folder_documents`, 'rg_ocr_text'))
        ).to.be.empty
    })

    it(`Download zip rg_text folder contains expected folders and files`, async function() { 
        chai.expect(
            common.getFilesInDirectory(path.resolve(testDataDownloadPath, `master folder_documents`, 'rg_text'))
        ).to.have.members([
            'RG201000.txt.txt'
        ])

        chai.expect(
            common.getFileSize(path.resolve(testDataDownloadPath, `master folder_documents`, 'rg_text', 'RG201000.txt.txt'))
        ).to.equal(25)
    })

    it(`User can remove download task`, async function() {
        //3x check to ensure its a download task we're removing
        chai.expect(
            await userTasksPage.getTopTaskName()
        ).to.equal('Download Documents')

        await userTasksPage.clickDeleteOnTopTask()
    })
        
    after(async function() {           
        await browserHelper.destroy()
    })

})