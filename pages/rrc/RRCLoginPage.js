const common = require("../../common")
const config = require('config')
const BasePageObject = require("../BasePageObject")

class RRCLoginPage extends BasePageObject { 
    constructor(browser, page) { 
        super(browser, page);
        
        //selectors go here. 
        this.usernameSelector = "input[type='email']";
        this.passwordSelector = "input[type='password']";
        this.loginButtonSelector = "[data-test-id='login-button']";
        this.logInTextSelector = "mat-card-header mat-card-title";
        this.forgotPasswordLinkSelector = "[data-test-id='forgot-password-link']";

        this.loginWarningTextSelector = 'toast'
        this.passwordWarningTextSelector = 'main mat-form-field:nth-child(2) mat-error'
    }
    
    async navigateToPage() {
        await this.page.goto(config.get('rrc.url'))
    }

    async isLoginWarningTextPresent() { 
        return await common.isDisplayed(this.page, this.loginWarningTextSelector)
    }
    async getLoginWarningText() { 
        return await common.getTextOfSelector(this.page, this.loginWarningTextSelector)
    }
    
    async isPasswordWarningTextPresent() { 
        return await common.isDisplayed(this.page, this.passwordWarningTextSelector)
    }
    async getPasswordWarningText() { 
        return await common.getTextOfSelector(this.page, this.passwordWarningTextSelector)
    }

    async clickForgotPassword() { 
        await common.clickSelector(this.page, this.forgotPasswordLinkSelector);
    }   

    async getForgotPasswordLinkText() { 
        return await common.getTextOfSelector(this.page, this.forgotPasswordLinkSelector)
    }

    async atPage() { 
        return await common.isPresent(this.page, this.logInTextSelector);
    }

    async assertAtPage() { 
        await common.assertHasText(this.page, this.logInTextSelector, "Login");
    }

    async typeUsername(username) { 
        await common.typeIntoSelector(this.page, this.usernameSelector, username);
    }

    async typePassword(password) { 
        await common.typeIntoSelector(this.page, this.passwordSelector, password);
    }

    async clickLogin() { 
        await common.clickSelector(this.page, this.loginButtonSelector);
    }    
}

module.exports = RRCLoginPage