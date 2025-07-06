class BasePageObject { 
    constructor(browser, page) { 
        this.browser = browser
        this.page = page
    }

    //clild classes are assumed to implement this
    async assertAtPage() { 
        throw new Error(`${this.constructor.name} has not defined or overridden assertAtPage`)
    }

}

module.exports = BasePageObject