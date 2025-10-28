import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";
import ts from "typescript";

import { FeatureMetadata } from "portal/feature-registry";

export interface ParsedProject {
  projectName: string;
  projectPath: string;
  features: FeatureMetadata[];
  timestamp: string;
  version: string;
}

export class FeatureMetadataParser {
  private program: ts.Program;
  private checker: ts.TypeChecker;

  constructor(private configPath: string) {
    const config = ts.readConfigFile(configPath, ts.sys.readFile);
    const baseParsedConfig = ts.parseJsonConfigFileContent(
      config.config,
      ts.sys,
      path.dirname(configPath)
    );

    // Ensure experimental decorators are enabled
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

  parseDirectory(dirPath: string): FeatureMetadata[] {
    const features: FeatureMetadata[] = [];
    const files = glob.sync(`${dirPath}/**/*.ts`, {
      ignore: "**/node_modules/**",
    });

    for (const file of files) {
      const sourceFile = this.program.getSourceFile(path.resolve(file));
      if (!sourceFile) {
        console.warn(`⚠️ File not part of program: ${file}`);
        continue;
      }
      features.push(...this.parseSourceFile(sourceFile));
    }

    return features;
  }

  private parseSourceFile(sourceFile: ts.SourceFile): FeatureMetadata[] {
    const features: FeatureMetadata[] = [];
    const visit = (node: ts.Node) => {
      if (ts.isClassDeclaration(node)) {
        const className = node.name?.getText(sourceFile) || "Anonymous";

        if ((ts.getDecorators(node) || []).length > 0) {
          const metadata = this.extractFeatureMetadata(node, sourceFile);
          if (metadata) {
            features.push(metadata);
          }
        } else console.log("no decorators for class ", className);
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return features;
  }

  private extractFeatureMetadata(
    classNode: ts.ClassDeclaration,
    sourceFile: ts.SourceFile
  ): FeatureMetadata | null {
    if (!ts.getDecorators(classNode)) return null;

    for (const decorator of ts.getDecorators(classNode)!) {
      let decoratorName: string;
      let decoratorArgs: ts.NodeArray<ts.Expression> =
        ts.factory.createNodeArray();

      if (ts.isCallExpression(decorator.expression)) {
        decoratorName = decorator.expression.expression.getText(sourceFile);
        decoratorArgs = decorator.expression.arguments;
      } else if (ts.isIdentifier(decorator.expression)) {
        decoratorName = decorator.expression.getText(sourceFile);
      } else {
        continue;
      }

      if (decoratorName === "FeatureModule" || decoratorName === "Feature") {
        const metadata: FeatureMetadata = {
          id: "",
          name: "",
          version: "",
          sourceFile: sourceFile.fileName,
          moduleName: classNode.name?.getText(sourceFile),
        };

        if (
          decoratorArgs.length > 0 &&
          ts.isObjectLiteralExpression(decoratorArgs[0])
        ) {
          Object.assign(
            metadata,
            this.parseObjectLiteral(decoratorArgs[0], sourceFile)
          );
        }

        return metadata;
      }
    }

    return null;
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

  private evaluateExpression(
    expr: ts.Expression,
    sourceFile: ts.SourceFile
  ): any {
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

// Scanner class stays unchanged
export class FeatureMetadataScanner {
  static scanProject(projectPath: string): ParsedProject {
    console.log("🔍 Scanning project path:", projectPath);
    const packageJsonPath = path.join(projectPath, "package.json");
    const tsconfigPath = path.join(projectPath, "tsconfig.json");

    if (!fs.existsSync(tsconfigPath)) {
      throw new Error(`tsconfig.json not found in ${projectPath}`);
    }

    let projectName = path.basename(projectPath);
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      projectName = packageJson.name || projectName;
    }

    const parser = new FeatureMetadataParser(tsconfigPath);
    // Suche in allen relevanten Verzeichnissen
    const features = [
      ...parser.parseDirectory(projectPath),
      ...parser.parseDirectory(path.join(projectPath, "src")),
    ].filter(Boolean); // Entferne null-Werte

    return {
      projectName,
      projectPath,
      features,
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    };
  }

  static scanMultipleProjects(projectPaths: string[]): {
    projects: ParsedProject[];
    allFeatures: FeatureMetadata[];
    timestamp: string;
  } {
    const projects = projectPaths.map((p) => this.scanProject(p));
    const allFeatures = projects.flatMap((p) => p.features);

    return {
      projects,
      allFeatures,
      timestamp: new Date().toISOString(),
    };
  }

  static exportToJSON(data: any, outputPath: string): void {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf-8");
    console.log(`✅ Metadata exported to ${outputPath}`);
  }
}
