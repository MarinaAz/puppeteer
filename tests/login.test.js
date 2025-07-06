const LoginPage = require("../pages/LoginPage")
const ProjectSelectionPage = require("../pages/ProjectSelectionPage")
const TopNavigation = require("../pages/components/TopNavigation")
const BrowserHelper = require("../util/BrowserHelper")
const common = require("../common")
const config = require('config')
const chai = require('chai')
chai.use(require('chai-string'))

describe(`RG Login`, async function () {
    let loginPage
    let projectSelectionPage
    let topNavigation   
    let browserHelper  

    before(async function() {
        browserHelper = new BrowserHelper()
        await browserHelper.init()

        loginPage = new LoginPage(browserHelper.browser, browserHelper.page)
        projectSelectionPage = new ProjectSelectionPage(browserHelper.browser, browserHelper.page)
        topNavigation = new TopNavigation(browserHelper.browser, browserHelper.page)
    })

    it(`RG Local user is able to log in`, async function () {    
        await loginPage.assertAtPage()
        await loginPage.typeUsername(config.get('rgLocalUser'))
        await loginPage.typePassword(config.get('rgLocalPassword'))
        await loginPage.clickLogin()   
        await projectSelectionPage.assertAtPage()     
    })    

    //TODO: the domain user tests

    after(async function() {        
        await browserHelper.destroy()
    })
})
