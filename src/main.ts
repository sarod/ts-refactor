import "babel-polyfill";
import { readFileSync, writeFileSync } from "fs";
import * as path from "path";
import * as ts from "typescript";
import * as minimist from "minimist";
import * as mkdirp from "mkdirp";

import {processSourceFile} from "./refactor";


const args: any = minimist(process.argv.slice(2), 
{ default: {
  templateUrlBase: process.cwd(),
  targetDir: process.cwd(),
}});

const targetDir = path.resolve(process.cwd(), args.targetDir);
const templateUrlBase = path.resolve(process.cwd(), args.templateUrlBase);
const fileNames = args._;


fileNames.forEach(fileName => {
  const absoluteFileName = path.resolve(process.cwd(), fileName);

  console.log("parsing: " + fileName);

  // Parse a file
  let sourceFile = ts.createSourceFile(fileName, readFileSync(fileName).toString(), ts.ScriptTarget.Latest, /*setParentNodes */ true);

  // delint it
  let newCode = processSourceFile(templateUrlBase, absoluteFileName, sourceFile);


  let targetFile: string = computeTargetFileName(absoluteFileName);
  mkdirp.sync(path.dirname(targetFile));
  writeFileSync(targetFile, newCode);
});

function computeTargetFileName(originalFileName: string) {
  let relativePath = path.relative(process.cwd(), originalFileName);
  return path.resolve(targetDir, relativePath);
}
