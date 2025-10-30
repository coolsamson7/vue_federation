import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";
import ts from "typescript";

import { FeatureMetadata, ModuleMetadata } from "portal/feature-registry";

export class FeatureMetadataParser {
  private program: ts.Program;
  private checker: ts.TypeChecker;

  constructor(private tsconfigPath: string) {
    const config = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
    const baseParsedConfig = ts.parseJsonConfigFileContent(
      config.config,
      ts.sys,
      path.dirname(tsconfigPath)
    );

    const parsedConfig = {
      ...baseParsedConfig,
      options: {
        ...baseParsedConfig.options,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
    };

    this.program = ts.createProgram({
      rootNames: parsedConfig.fileNames,
      options: parsedConfig.options,
      projectReferences: parsedConfig.projectReferences,
    });

    this.checker = this.program.getTypeChecker();
  }

  parseDirectory(dirPath: string): ModuleMetadata[] {
    const modules: ModuleMetadata[] = [];
    const files = glob.sync(`${dirPath}/**/*.ts`, {
      ignore: "**/node_modules/**",
    });

    for (const file of files) {
      const sourceFile = this.program.getSourceFile(path.resolve(file));
      if (!sourceFile) continue;

      const moduleMetadata = this.parseSourceFileForModule(sourceFile);
      if (moduleMetadata) {
        // Merge features from folder and preserve any features in the module decorator
        const folderFeatures = this.collectFeaturesFromFolder(path.dirname(file));
        moduleMetadata.features = [
          ...(moduleMetadata.features || []),
          ...folderFeatures,
        ];
        moduleMetadata.moduleName = path.basename(sourceFile.fileName);
        modules.push(moduleMetadata);
      }
    }

    return modules;
  }

  private parseSourceFileForModule(
    sourceFile: ts.SourceFile
  ): ModuleMetadata | null {
    let foundModule: ModuleMetadata | null = null;

    const visit = (node: ts.Node) => {
      if (ts.isClassDeclaration(node)) {
        const decorators = ts.getDecorators(node) || [];
        for (const decorator of decorators) {
          let decoratorName: string;
          let decoratorArgs: ts.NodeArray<ts.Expression> = ts.factory.createNodeArray();

          if (ts.isCallExpression(decorator.expression)) {
            decoratorName = decorator.expression.expression.getText(sourceFile);
            decoratorArgs = decorator.expression.arguments;
          } else if (ts.isIdentifier(decorator.expression)) {
            decoratorName = decorator.expression.getText(sourceFile);
          } else {
            continue;
          }

          if (decoratorName === "FeatureModule") {
            if (foundModule)
              throw new Error(
                `Multiple @FeatureModule decorators found in ${sourceFile.fileName}`
              );

            const moduleData: ModuleMetadata = {
              id: "",
              label: "",
              version: "",
              features: [],
            };

            if (decoratorArgs.length > 0 && ts.isObjectLiteralExpression(decoratorArgs[0])) {
              Object.assign(moduleData, this.parseObjectLiteral(decoratorArgs[0], sourceFile));
            }

            foundModule = moduleData;
          }
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return foundModule;
  }

  private collectFeaturesFromFolder(folderPath: string): FeatureMetadata[] {
    const features: FeatureMetadata[] = [];
    const files = glob.sync(`${folderPath}/**/*.ts`, {
      ignore: "**/node_modules/**",
    });

    for (const file of files) {
      const sourceFile = this.program.getSourceFile(path.resolve(file));
      if (!sourceFile) continue;

      ts.forEachChild(sourceFile, (node) => {
        if (!ts.isClassDeclaration(node)) return;

        const decorators = ts.getDecorators(node) || [];
        for (const decorator of decorators) {
          let decoratorName: string;
          let decoratorArgs: ts.NodeArray<ts.Expression> = ts.factory.createNodeArray();

          if (ts.isCallExpression(decorator.expression)) {
            decoratorName = decorator.expression.expression.getText(sourceFile);
            decoratorArgs = decorator.expression.arguments;
          } else if (ts.isIdentifier(decorator.expression)) {
            decoratorName = decorator.expression.getText(sourceFile);
          } else {
            continue;
          }

          if (decoratorName === "Feature") {
            const metadata: FeatureMetadata = {
              id: "",
              label: "",
              path: "",
              component: node.name?.getText(sourceFile)!,
            };

            if (decoratorArgs.length > 0 && ts.isObjectLiteralExpression(decoratorArgs[0])) {
              Object.assign(metadata, this.parseObjectLiteral(decoratorArgs[0], sourceFile));
            }

            features.push(metadata);
          }
        }
      });
    }

    return features;
  }

  private parseObjectLiteral(
    obj: ts.ObjectLiteralExpression,
    sourceFile: ts.SourceFile
  ): Record<string, any> {
    const result: Record<string, any> = {};
    for (const property of obj.properties) {
      if (ts.isPropertyAssignment(property)) {
        const name = property.name.getText(sourceFile);
        const value = this.evaluateExpression(property.initializer, sourceFile);
        result[name] = value;
      }
    }
    return result;
  }

  private evaluateExpression(expr: ts.Expression, sourceFile: ts.SourceFile): any {
    if (ts.isStringLiteral(expr)) return expr.text;
    if (ts.isNumericLiteral(expr)) return Number(expr.text);
    if (expr.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (expr.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (ts.isArrayLiteralExpression(expr))
      return expr.elements.map((el) => this.evaluateExpression(el, sourceFile));
    if (ts.isObjectLiteralExpression(expr))
      return this.parseObjectLiteral(expr, sourceFile);
    return expr.getText(sourceFile).replace(/['"]/g, "");
  }
}

export class FeatureMetadataScanner {
  static scanModuleFolder(moduleFolderPath: string): ModuleMetadata {
    const tsconfigPath = path.join(moduleFolderPath, "tsconfig.json");
    if (!fs.existsSync(tsconfigPath)) {
      throw new Error(`tsconfig.json not found in ${moduleFolderPath}`);
    }

    const parser = new FeatureMetadataParser(tsconfigPath);
    const modules = parser.parseDirectory(moduleFolderPath);

    if (modules.length === 0)
      throw new Error(`No @FeatureModule found in ${moduleFolderPath}`);

    if (modules.length > 1)
      throw new Error(`Multiple @FeatureModule found in ${moduleFolderPath}`);

    return modules[0];
  }

  static exportToJSON(data: ModuleMetadata, outputPath: string): void {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf-8");
    console.log(`✅ Module metadata exported to ${outputPath}`);
  }
}
