let requiredTests = process.argv.slice(2);

function getFolders(directory) {
    try {
      const files = fs.readdirSync(directory, { withFileTypes: true });
      const folders = files
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
  
      return folders;
    } catch (err) {
      console.error(`Error reading directory: ${err.message}`);
      return [];
    }
}

const fs = require('fs');

let testFiles = [];

if (requiredTests.length == 0){
    let folders = getFolders("./");
    folders.forEach(folder => {
        fs.readdirSync("./"+folder).forEach(file => {
            testFiles.push(folder+"/"+file);
        });
    });
} else {
    testFiles = requiredTests;
};

testFiles.forEach(fileName => {
    let test = require("./"+fileName);
    let result = test.execute();
    let title = fileName;
    switch (result.code) {
        case 0:
            console.log(title,"\x1b[32mPassed\x1b[0m");
            break;
        default:
            console.log(title,"\x1b[31mFailed\x1b[0m");
            console.log("Error:",result.err.message);
            break;
    }
});