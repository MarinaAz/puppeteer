const DashboardPage = require("../pages/DashboardPage")
const LoginPage = require("../pages/LoginPage")
const ProjectSelectionPage = require("../pages/ProjectSelectionPage")
const TopNavigation = require("../pages/components/TopNavigation")
const config = require('config')
class LoginUtil { 
    constructor(browser, page) { 
        this.browser = browser
        this.page = page

        this.loginPage = new LoginPage(browser, page)
        this.topNavigation = new TopNavigation(browser, page)
        this.projectSelectionPage = new ProjectSelectionPage(browser, page)
        this.dashboardPage = new DashboardPage(browser, page)
    }

    async loginAsRGLocalUser(project=null) { 
        await this.login(config.get('rgLocalUser'), config.get('rgLocalPassword'))
        if(project) { 
            await this.projectSelectionPage.assertAtPage()
            await this.projectSelectionPage.clickProject(project)
            await this.dashboardPage.assertAtPage()
        }
    }

    async loginAsRGCustodian() {
        await this.login(config.get('rgCustodian'), config.get('rgLocalPassword'))
    }

    async loginAsRGApprover(project=null) {
        await this.login(config.get('rgApprover'), config.get('rgApproverPassword'))
        if(project) { 
            await this.projectSelectionPage.assertAtPage()
            await this.projectSelectionPage.clickProject(project)
            await this.dashboardPage.assertAtPage()
        }
    }

    async login(username, password) { 
        await this.loginPage.assertAtPage()
        await this.loginPage.typeUsername(username)
        await this.loginPage.typePassword(password)
        await this.loginPage.clickLogin()   
        await this.projectSelectionPage.assertAtPage()     
    }

    async logout() { 
        await this.topNavigation.assertAtPage()
        await this.topNavigation.clickUserMenu()
        await this.topNavigation.clickUserMenuItem('Logout')
        await this.loginPage.assertAtPage()
    }

}

module.exports = LoginUtil