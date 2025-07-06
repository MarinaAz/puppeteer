const common = require("../common")
const BasePageObject = require("./BasePageObject")

class LoginPage extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)
        
        this.usernameSelector = `#username`
        this.passwordSelector = `#password`
        this.loginButtonSelector = `#kc-login`
    }

    async assertAtPage() { 
        await this.page.waitForSelector(this.usernameSelector)
        await common.waitForTimeout(1000)
    }

    async typeUsername(name) { 
        await common.typeIntoSelector(this.page, this.usernameSelector, name)
    }

    async typePassword(password) { 
        await common.typeIntoSelector(this.page, this.passwordSelector, password)
    }

    async clickLogin() { 
        await common.clickSelector(this.page, this.loginButtonSelector)        
    }
}

module.exports = LoginPage