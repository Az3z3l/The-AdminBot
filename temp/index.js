//requiring path and fs modules
const path = require('path');
const fs = require('fs');

let x=[]
//joining path of directory 
//passsing directoryPath and callback function
fs.readdir("../bots", function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach
    files.forEach(function (file) {
        // Do whatever you want to do with the file
        console.log(file); 
        x[x.length] = file.split(".")[0]
        console.log(x)
    });
});


console.log(x)