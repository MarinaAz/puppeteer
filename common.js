const path = require('path')
const fs = require('fs-extra')
const chai = require('chai')
const assert = require('assert')
chai.use(require('chai-fs'))
const config = require('config')
const timeOutValue = config.get("timeouts.commonWaitForTimeout")
const extract = require('extract-zip')

class common { 
    static async typeIntoSelector(page, selector, text) {
        await page.waitForSelector(selector, {visible: true})    
        let element = await page.$(selector)
        await common.clearElementText(page, element)
        await page.type(selector, text)        
    }

    static async typeIntoElement(page, element, text) {          
        await common.clearElementText(page, element)
        await element.type(text)   
    }

    static async clearElementText(page, element) {
        await element.click();
        await common.waitForTimeout(500)
        await page.keyboard.down('Control')
        await page.keyboard.press('KeyA')
        await page.keyboard.up('Control')
        await page.keyboard.press('Backspace')
    }

    static async clickSelector(page, selector) { 
        await page.waitForSelector(selector, {visible: true})
        await (await page.$(selector)).click()
    }

    static async waitForFirst(page, selector, visible=true) {
        await page.waitForSelector(selector, {visible: visible})
    }

    static async waitForAnyText(page, selector, timeOutMs = 20000, property = "innerText") { 
        try {
            await page.waitForFunction(
                (selector, prop) => {
                    let elements = document.querySelectorAll(selector)
                    for(let i=0; i<elements.length; i++) {
                        let val = elements[i][prop]
                        if (val.trim() != '') {
                            return true
                        }
                    }
                    return false;
                },
                {timeout: timeOutMs},
                selector,
                property
            )
        } catch(err) {
            throw new Error(`waitForAnyText failed waiting for any text in selector "${selector}" : ${err.message}\n\n${err.stack}`)
        }        
    }

    /**     
     * waits for `text` to not be present in any elements matching `selector`
     * throws if timeout is reached
     * @param {*} page puppeteer page object
     * @param {*} selector selector to wait for
     * @param {*} text text to search for
     * @param {*} exactMatch flag to match exactly, defaulted to false / includes
     * @param {*} timeOutMs timeout to wait, defauted to timeOutValue
     */
    static async waitForTextToNotBePresent(page, selector, text, exactMatch=false, timeOutMs = 10000) { 
        try {
            await page.waitForFunction(
                (selector, text, exactMatch) => {                
                    let textFound = false
                    let elements = document.querySelectorAll(selector)
                    for(let i=0; i<elements.length; i++) { 
                        let innerText = elements[i].innerText.trim()
                        if(exactMatch && innerText == text) {
                            textFound = true;
                            break
                        } else if(!exactMatch && innerText.includes(text)) { 
                            textFound = true;
                            break
                        }                        
                    }
                    return !textFound                    
                },
                {timeout: timeOutMs},
                selector,
                text,
                exactMatch
            )
        } catch(err) {
            throw new Error(`waitForTextToNotBePresent failed waiting for "${text}" in selector "${selector}" to not be present: : ${err.message}\n\n${err.stack}`)
        }   
    }

    static async waitForText(page, selector, text, timeOutMs = 10000, exactMatch=false) { 
        try {
            await page.waitForFunction(
                (selector, text, exactMatch) => {     
                    let elements = document.querySelectorAll(selector)
                    for(let i=0; i<elements.length; i++) { 
                        let innerText  = elements[i].innerText.trim()
                        if(exactMatch && innerText == text) {
                            return true                         
                        } else if(!exactMatch && innerText.includes(text)) { 
                            return true
                        }
                    }
                    return false;
                },
                {timeout: timeOutMs},
                selector,
                text,
                exactMatch
            )
        } catch(err) {
            throw new Error(`waitForText failed waiting for "${text}" in selector "${selector}" : ${err.message}\n\n${err.stack}`)
        }        
    }

    
    static async waitForTextInElement(page, element, text, timeOutMs = 10000, exactMatch = false) { 
        try {
            await page.waitForFunction(
                (element, text, exactMatch) => {
                    let innerText  = element.innerText.trim()
                    if(exactMatch && innerText == text) {
                        return true                         
                    } else if(!exactMatch && innerText.includes(text)) { 
                        return true
                    }
                    return false                    
                },
                {timeout: timeOutMs},
                element,
                text,
                exactMatch
            )

        } catch(err) {
            throw new Error(`waitForTextInElement failed waiting for text '${text}' in element: : ${err.message}\n\n${err.stack}`)
        }    
    }
    
    static async waitForNone(page, selector) { 
        try { 
            await page.waitForFunction(
                (selector) => document.querySelectorAll(selector).length == 0,
                {timeout: 10000},
                selector
            )

        } catch (err) {
            throw new Error(`waitForNone failed in selector "${selector}" : ${err.message}\n\n${err.stack}`)
        }
    }

    /**
     * sets select element located by `selectSelector` to visible option `optionText`  
     * @see https://stackoverflow.com/questions/49116472/puppeteer-how-select-a-dropdown-option-based-from-its-text?rq=1
     * @param {*} page puppeteer page object
     * @param {*} selectSelector <select> element selector (ie, 'select#meow')
     * @param {*} optionsSelector selector to select all <option> elements (ie, 'select#meow option')
     * @param {*} optionText visible text in dropdown to select
     */
    static async selectByVisibleText(page, selectSelector, optionsSelector, optionText) {
        let optionElements = await page.$$(optionsSelector)
        let optionValue = null;
        for(let i=0; i<optionElements.length; i++) {
            let optionElement = optionElements[i]
            let displayedOptionText = await common.getTextOfElement(optionElement)            
            if(displayedOptionText == optionText) { 
                optionValue = await (await optionElement.getProperty('value')).jsonValue();                
                break;
            }
        }        
        await page.select(selectSelector, optionValue)
    }

    /**
    * returns the text of `selector`, waiting on the element before retrieving text
    * @param {*} page puppeteer page object
    * @param {*} selector selector of the element to get the text of
    * @param {*} property optional property to read from, defaults to innerText (also use innerHTML or textContent)
    */
    static async getTextOfSelector(page, selector, property='innerText') { 
       try {
           await page.waitForSelector(selector, {visible: true, timeout: timeOutValue})
           let element = await page.$(selector) 
           return await common.getTextOfElement(element, property)
       } catch (err) {
           throw new Error(`getTextOfSelector failed in selector "${selector}" : ${err.message}\n\n${err.stack}`)
       }        
    }

    /**
     * waits for `selector`, then asserts `selector` has innerHTML == to `text`
     * @param {*} page puppeteer page object
     * @param {*} selector selector to wait for and inspect
     * @param {*} text text to assert on
     */
    static async assertHasText(page, selector, text) {
        await page.waitForSelector(selector, {visible: true, timeout: timeOutValue})
        var htmlText = await page.$eval(selector, async (e) => {
            return await (e.innerHTML).trim()
        })
        await assert.equal(htmlText, text)
    }

    static async getTextOfElement(element, property='innerText') {
        return (await (await element.getProperty(property)).jsonValue()).trim();
    }

    static async getTextOfElements(elements, includeEmpties=false, property='innerText') { 
        let results = []
        for(let i=0; i<elements.length; i++) { 
            let txt = await common.getTextOfElement(elements[i], property) 
            if(txt || includeEmpties) { 
                results.push(txt)
            }
        }
        return results;
    }

    /**
     * returns the value of attribute `attributeName` on `element`
     * @param {*} page puppeteer page object
     * @param {*} element element to check
     * @param {*} attributeName name of attribute to retrieve
     */
    static async getElementAttribute(page, element, attributeName) { 
        return await page.evaluate(async (e,a) => {
            return e.getAttribute(a)
        }, element, attributeName)
    }

    static async findElementInListHavingText(elementList, text, contains=false, property = "innerText") {
        let result = null;
        for(let i=0; i<elementList.length; i++) { 
            let el = elementList[i]
            let elText =  await common.getTextOfElement(el, property) 
            if((contains && elText.includes(text)) || (!contains && elText == text)) { 
                result = el;
                break;
            } 
        }
        return result;
    }

    static async findElementWithChildHavingText(page, parentSelectors, childSelector, childText, contains = false) {
        let result = null;
        let tableRows = await page.$$(parentSelectors)
        for(let i=0; i<tableRows.length; i++) {
            let row = tableRows[i]
            let cell = await row.$(childSelector)
            if(!cell) { continue }
            let actualCellText = await common.getTextOfElement(cell)            
            if((contains && actualCellText.includes(childText)) || (!contains && actualCellText == childText)) { 
                result = row;
                break;
            }
        }
        return result;
    }

    static async waitForTimeout(ms) { 
        return new Promise(r => setTimeout(r, ms))
    }

    static async getElementProperty(element, property) { 
        return await (await element.getProperty(property)).jsonValue()
    }

    static async selectOptionByText(page, selectSelector, optionText) { 
        let optionValue = await page.$$eval('option', (options, optionText) => options.find(o => o.innerText === optionText)?.value, optionText)
        await page.select(selectSelector, optionValue);
    }

    static async scrollElementIntoView(page, element) { 
        await page.evaluate(
            (el) => {el.scrollIntoView()},            
            element
        )
    }

    static async scrollSelectorIntoView(page, selector) { 
        let el = await page.$(selector)
        await common.scrollElementIntoView(page, el)
    }

    /**
     * blocks until `asyncClosure` returns true; trying `tries` times, pausing `pauseTime` ms inbetween tries
     * throws if tries are exhaused
     * @param {*} tries amount of tries, including the initial try
     * @param {*} pauseTime ms to wait before each retry
     * @param {*} asyncClosure 0-arg callback to call  
     * @param {*} errorMessage optional error message to include error if retries are exhaused
     */
    static async asyncRetryLoop(tries, pauseTime, asyncClosure, errorMessage='') {
        let success = false;
        let res = false;
        for(let i=0; i<tries; i++) { 
            try { 
                //console.log(`try number ${i}`)
                res = await asyncClosure();
                if(!res) { 
                    //console.log('closure returned false')
                    throw new Error('returned false');
                }
                success = true;
                break;                               
            } catch(err) {                 
                await new Promise(function(resolve) {
                    setTimeout(resolve, pauseTime)
                })                                            
            }
        }
        if(!success) {
            throw new Error(`asyncRetryLoop: failed after ${tries} tries. ${errorMessage}`)
        }  
        return res 
    }

    /**
     * shuffles an array. jacked from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
     * @param {*} arr array to shuffle
     * @returns new array, shuffled
     */
    static shuffleArray(arr) { 
        return arr
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value)
    }

    // The maximum is exclusive and the minimum is inclusive
    static randomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); 
    }

    //================================================
    //=============== download helpers
    //================================================

    /**
     * preps puppeteer for downloading to downloadPath
     * call this before performing a file download
     * @param {*} page puppeteer page object
     * @param {*} downloadPath base directory for downloads to use
     */
    static async setDownloadBehavior(page, downloadPath) { 
        let localpath = path.resolve(__dirname, downloadPath)
        await page._client().send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: localpath 
        })
    }

    /**
     * blocks until `expectedFileName` is found in `downloadPath`
     * throws if retries are exhaused
     * @param {*} expectedFileName filename, including extension (ex: 'test.txt')
     * @param {*} downloadPath base directory for downloads to use
     */
    static async awaitDownload(expectedFileName, downloadPath, tries = 30) { 
        let pauseTime = 2000
        let expectedFullPath = path.resolve(__dirname, downloadPath, expectedFileName)
        
        await common.asyncRetryLoop(tries, pauseTime, async() =>{
            chai.assert.isFile(expectedFullPath) 
            return true
        },`did not find expected file ${expectedFullPath}`)
    }

    /**
     * unzips a file
     * @param {*} zipPath path to the zip
     * @param {*} targetPath target dir to unzip to
     */
    static async unzip(zipPath, targetPath) { 
        await extract(zipPath, { dir: targetPath })
    }

    /**
     * shortcut to unzip a downloaded zip. 
     * creates a folder with the same name, and returns the entire path
     * @param {*} downloadZipName file name as it exists in downloads. ie 'meow.zip'
     * @param {*} downloadPath base directory for downloads to use
     */
    static async unzipDownload(downloadZipName, downloadPath) { 
        let zipFullPath = path.resolve(__dirname, downloadPath, downloadZipName)
        let unzipDirName = `${path.basename(zipFullPath, ".zip")}`
        let unzipFullPath = path.resolve(__dirname, downloadPath, unzipDirName)
        await common.unzip(zipFullPath, unzipFullPath)
        return unzipFullPath
    }

    //================================================
    //=============== fs helpers
    //================================================

    /**
     * Ensures that a directory exists and is empty, 
     * deleting contents and creating the directoru if necessary
     * @param {*} directory string path of directory
     */
    static async emptyDirectory(directory) {
        await fs.emptyDir(directory)
    }

     /**
     * returns an array of filenames in a dir(file.ext)
     * @param {*} directory dir to read
     */
     static getFilesInDirectory(directory) {
        return fs.readdirSync(directory)
    }

     /**
     * get File Size
     * @param {*} filepath path of the file
     */
     static getFileSize(filepath){
        return fs.statSync(filepath).size
    }
}

module.exports = common
