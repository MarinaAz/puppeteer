const common = require('./common')

let tests = [
    
    //---- mikes smoke test
    "./tests/login.test.js",
    "./tests/navigator.test.js",
    "./tests/adsync.test.js",
    "./tests/schemaswitch.test.js",
    "./tests/reports.test.js",
    "./tests/search.test.js",
    "./tests/viewer.test.js",
    "./tests/downloads.test.js",
    // -- nicks test plan
    "./tests/folders.test.js",
    "./tests/collections.test.js",
    "./tests/evergreenFolder.test.js",
    "./tests/evergreenCollection.test.js",
    "./tests/preservations.test.js",
    "./tests/evergreenPreservation.test.js",
    "./tests/exports.test.js",
    "./tests/evergreenExport.test.js",
    "./tests/policies.test.js",
    "./tests/deletions.test.js",
    "./tests/tags.test.js",
    "./tests/documentList.test.js"
]

//random execution ordering
for(let test of common.shuffleArray(tests)) { 
    require(test)
}



