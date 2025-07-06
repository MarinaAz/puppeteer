
const common = require("../common")
const BasePageObject = require("./BasePageObject")

class ProjectSelectionPage extends BasePageObject { 
    constructor(browser, page) {
        super(browser, page)

        this.projectTableNamesSelector = `.ProjectListGrid .ProjectNameRenderer a`
    }

    async assertAtPage() { 
        await common.waitForFirst(this.page, this.projectTableNamesSelector)
    }    

    //clicks the project link, entering the project
    async clickProject(projectName) { 
        let projectLink = await common.findElementInListHavingText(await this.page.$$(this.projectTableNamesSelector), projectName)
        if(!projectLink) {
            throw new Error(`unable to find project ${projectName}`)
        }
        await projectLink.click()
    }
}

module.exports = ProjectSelectionPage