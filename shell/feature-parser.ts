import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

export interface FeatureMetadata {
  id: string;
  name: string;
  version: string;
  routes?: RouteConfig[];
  permissions?: string[];
  dependencies?: string[];
  icon?: string;
  description?: string;
  sourceFile?: string;
  moduleName?: string;
}

export interface RouteConfig {
  path: string;
  name: string;
  component?: string;
  meta?: Record<string, any>;
  children?: RouteConfig[];
}

export interface ParsedProject {
  projectName: string;
  projectPath: string;
  features: FeatureMetadata[];
  timestamp: string;
  version: string;
}

/**
 * Offline parser that extracts feature metadata from TypeScript source files
 */
export class FeatureMetadataParser {
  private program: ts.Program;
  private checker: ts.TypeChecker;

  constructor(private configPath: string) {
    const config = ts.readConfigFile(configPath, ts.sys.readFile);
    const parsedConfig = ts.parseJsonConfigFileContent(
      config.config,
      ts.sys,
      path.dirname(configPath)
    );

    this.program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options);
    this.checker = this.program.getTypeChecker();
  }

  parseDirectory(dirPath: string): FeatureMetadata[] {
    const features: FeatureMetadata[] = [];
    const files = glob.sync(`${dirPath}/**/*.ts`, { ignore: '**/node_modules/**' });

    for (const file of files) {
      const sourceFile = this.program.getSourceFile(file);
      if (sourceFile) {
        const fileFeatures = this.parseSourceFile(sourceFile);
        features.push(...fileFeatures);
      }
    }

    return features;
  }

  private parseSourceFile(sourceFile: ts.SourceFile): FeatureMetadata[] {
    const features: FeatureMetadata[] = [];

    const visit = (node: ts.Node) => {
      if (ts.isClassDeclaration(node) && node.decorators) {
        const featureMetadata = this.extractFeatureMetadata(node, sourceFile);
        if (featureMetadata) {
          features.push(featureMetadata);
        }
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
    if (!classNode.decorators) return null;

    for (const decorator of classNode.decorators) {
      if (!ts.isCallExpression(decorator.expression)) continue;

      const decoratorName = decorator.expression.expression.getText(sourceFile);

      if (decoratorName === 'FeatureModule' || decoratorName === 'Feature') {
        const args = decorator.expression.arguments;
        if (args.length > 0 && ts.isObjectLiteralExpression(args[0])) {
          const metadata = this.parseObjectLiteral(args[0], sourceFile);

          metadata.sourceFile = sourceFile.fileName;
          metadata.moduleName = classNode.name?.getText(sourceFile);

          return metadata as FeatureMetadata;
        }
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

  private evaluateExpression(expr: ts.Expression, sourceFile: ts.SourceFile): any {
    if (ts.isStringLiteral(expr)) {
      return expr.text;
    }

    if (ts.isNumericLiteral(expr)) {
      return Number(expr.text);
    }

    if (expr.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (expr.kind === ts.SyntaxKind.FalseKeyword) return false;

    if (ts.isArrayLiteralExpression(expr)) {
      return expr.elements.map(el => this.evaluateExpression(el, sourceFile));
    }

    if (ts.isObjectLiteralExpression(expr)) {
      return this.parseObjectLiteral(expr, sourceFile);
    }

    return expr.getText(sourceFile).replace(/['"]/g, '');
  }
}

/**
 * Scanner to process projects and generate metadata
 */
export class FeatureMetadataScanner {
  static scanProject(projectPath: string): ParsedProject {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const tsconfigPath = path.join(projectPath, 'tsconfig.json');

    if (!fs.existsSync(tsconfigPath)) {
      throw new Error(`tsconfig.json not found in ${projectPath}`);
    }

    let projectName = path.basename(projectPath);
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      projectName = packageJson.name || projectName;
    }

    const parser = new FeatureMetadataParser(tsconfigPath);
    const srcPath = path.join(projectPath, 'src');
    const features = parser.parseDirectory(srcPath);

    return {
      projectName,
      projectPath,
      features,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  static scanMultipleProjects(projectPaths: string[]): {
    projects: ParsedProject[];
    allFeatures: FeatureMetadata[];
    timestamp: string;
  } {
    const projects = projectPaths.map(p => this.scanProject(p));
    const allFeatures = projects.flatMap(p => p.features);

    return {
      projects,
      allFeatures,
      timestamp: new Date().toISOString()
    };
  }

  static exportToJSON(data: any, outputPath: string): void {
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ Metadata exported to ${outputPath}`);
  }
}