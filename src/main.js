"use strict";
require("babel-polyfill");
var fs_1 = require("fs");
var path = require("path");
var ts = require("typescript");
var minimist = require("minimist");
var refactor_1 = require("./refactor");
var args = minimist(process.argv.slice(2), { default: {
        templateUrlBase: process.cwd(),
        targetDir: process.cwd(),
    } });
var targetDir = path.resolve(process.cwd(), args.targetDir);
var templateUrlBase = path.resolve(process.cwd(), args.templateUrlBase);
var fileNames = args._;
fileNames.forEach(function (fileName) {
    var absoluteFileName = path.resolve(process.cwd(), fileName);
    console.log("parsing: " + fileName);
    // Parse a file
    var sourceFile = ts.createSourceFile(fileName, fs_1.readFileSync(fileName).toString(), ts.ScriptTarget.Latest, /*setParentNodes */ true);
    // delint it
    var newCode = refactor_1.processSourceFile(templateUrlBase, absoluteFileName, sourceFile);
    var targetFile = computeTargetFileName(absoluteFileName);
    fs_1.writeFileSync(targetFile, newCode);
});
function computeTargetFileName(originalFileName) {
    var relativePath = path.relative(originalFileName, process.cwd());
    return path.resolve(targetDir, relativePath);
}
//# sourceMappingURL=main.js.map