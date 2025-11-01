#!/usr/bin/env tsx
import * as fs from "fs";
import * as path from "path";
import { FeatureMetadataParser, FeatureMetadataScanner } from "./feature-parser";

// read CLI args
const args = process.argv.slice(2);
const moduleFolderArgIndex = args.findIndex(a => a.startsWith("--moduleFolder="));
const outFileArgIndex = args.findIndex(a => a.startsWith("--outFile="));

if (moduleFolderArgIndex === -1 || outFileArgIndex === -1) {
  throw new Error("Usage: build-metadata.ts --moduleFolder=<path> --outFile=<file>");
}

const moduleFolder = args[moduleFolderArgIndex].split("=")[1];
const outputFile = args[outFileArgIndex].split("=")[1];

// determine tsconfig in the module folder
const tsconfigFile = fs.existsSync(path.join(moduleFolder, "tsconfig.app.json"))
    ? path.join(moduleFolder, "tsconfig.app.json")
    : fs.existsSync(path.join(moduleFolder, "tsconfig.json"))
    ? path.join(moduleFolder, "tsconfig.json")
    : (() => { throw new Error(`No tsconfig found in ${moduleFolder}. Tried tsconfig.json and tsconfig.app.json`); })();

// parse features
const parser = new FeatureMetadataParser(tsconfigFile);
const moduleData = parser.parseDirectory(moduleFolder);

console.log(moduleData);

// export JSON
if (moduleData.length > 0)
FeatureMetadataScanner.exportToJSON(moduleData[0], outputFile);
