import * as ts from "typescript";
import { CodeReplacement, replaceCode } from "./code-replace";
import { resolve, relative, dirname } from "path";


export function computeRefactors(baseUrlPath: string, sourceFilePath: string, sourceFile: ts.SourceFile): CodeReplacement[] {

  let varNames = [];
  let codeReplacements: CodeReplacement[] = [];

  processNode(sourceFile);

  return codeReplacements;


  function processNode(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.CallExpression:
        processCallExpression(<ts.CallExpression>node);
        break;
    }
    ts.forEachChild(node, processNode);
  }

  function processCallExpression(callExpression: ts.CallExpression) {
    let expression: ts.LeftHandSideExpression = callExpression.expression;

    if (isAngularComponentExpression(expression)) {
      let componentOptionsArg = callExpression.arguments[1];
      if (componentOptionsArg.kind !== ts.SyntaxKind.ObjectLiteralExpression) {
        console.log('skipping expression: ' + describeNode(callExpression) + ': componentOptions is not an ObjectLiteralExpression');
        return;
      }
      refactorCallExpressionWithComponentOptions(
        callExpression,
        <ts.ObjectLiteralExpression>componentOptionsArg,
        "componentTemplate");
    } else if (isAngularMaterialDialogShowExpression(expression)) {
      let componentOptionsArg = callExpression.arguments[0];
      if (componentOptionsArg.kind !== ts.SyntaxKind.ObjectLiteralExpression) {
        console.log('skipping expression: ' + describeNode(callExpression) + ': componentOptions is not an ObjectLiteralExpression');
        return;
      }
      refactorCallExpressionWithComponentOptions(
        callExpression,
        <ts.ObjectLiteralExpression>componentOptionsArg,
        "dialogTemplate");
    }
  }

  function refactorCallExpressionWithComponentOptions(
    callExpression: ts.CallExpression,
    componentOptionsArg: ts.ObjectLiteralExpression,
    baseVarName: string) {
    let componentOptionsObject: ts.ObjectLiteralExpression = <ts.ObjectLiteralExpression>componentOptionsArg;

    let templateProperty: ts.ObjectLiteralElement = componentOptionsObject
      .properties
      .find((element: ts.ObjectLiteralElement) => element.name.getText() === 'template');
    if (templateProperty) {
      return;
    }

    let templateUrlProperty: ts.ObjectLiteralElement = componentOptionsObject
      .properties
      .find((element: ts.ObjectLiteralElement) => element.name.getText() === 'templateUrl');
    if (!templateUrlProperty) {
      console.log('skipping expression: ' + describeNode(callExpression) + ' templateUrlProperty absent');
      return;
    }

    if (templateUrlProperty.kind !== ts.SyntaxKind.PropertyAssignment) {
      console.log('skipping expression: ' + describeNode(callExpression) + ' templateUrlProperty is not a PropertyAssignment');
      return;
    }

    let urlInitializerExpression: ts.Expression = (<ts.PropertyAssignment>templateUrlProperty).initializer;
    if (urlInitializerExpression.kind !== ts.SyntaxKind.StringLiteral) {
      console.log('skipping expression: ' + describeNode(callExpression) + ' urlInitializerExpression is not a StringLiteral');
      return;
    }

    let templateUrl = extractStringFromLiteral(<ts.StringLiteral>urlInitializerExpression);
    let importPath = templateUrlToImportPath(templateUrl);


    let templateVarName = findUnusedName(baseVarName);
    codeReplacements.push(CodeReplacement.insertTop('import * as ' + templateVarName + ' from \'' + importPath + '\';\n'));
    codeReplacements.push(CodeReplacement.createReplaceNodeText(templateUrlProperty, 'template: ' + templateVarName));
  }

  function findUnusedName(templateVarName) {
    let i;
    for (i = 1; i < 500; i++) {
      let candidate;
      if (i === 1) {
        candidate = templateVarName;
      } else {
        candidate = templateVarName + i;
      }
      if (!varNames.includes(candidate)) {
        varNames.push(candidate);
        return candidate;
      }
    }

  }

  function extractStringFromLiteral(expr: ts.StringLiteral) {
    return expr.getText().slice(1, -1);
  }

  function templateUrlToImportPath(templateUrl: string) {
    let absoluteUrlPath = resolve(baseUrlPath, templateUrl);
    let sourceFileFolder = dirname(sourceFilePath);
    let relativePath = relative(sourceFileFolder, absoluteUrlPath);
    if (!relativePath.startsWith('.')) {
      relativePath = './' + relativePath;
    }
    return relativePath;
  }

  function isAngularComponentExpression(expression: ts.LeftHandSideExpression) {
    if (expression.kind == ts.SyntaxKind.PropertyAccessExpression) {
      let propertyAccessExpression: ts.PropertyAccessExpression = <ts.PropertyAccessExpression>expression;
      return propertyAccessExpression.name.getText() === 'component';
    }
    return false;
  }

  function isAngularMaterialDialogShowExpression(expression: ts.LeftHandSideExpression) {
    if (expression.kind == ts.SyntaxKind.PropertyAccessExpression) {
      let propertyAccessExpression: ts.PropertyAccessExpression = <ts.PropertyAccessExpression>expression;
      return propertyAccessExpression.name.getText() === 'show';
    }
    return false;
  }

  function describeNode(node: ts.Node) {
    return ts.SyntaxKind[node.kind] + ' @' + describePosition(node.getStart()) + ' text:\n' + node.getText() + '\n';
  }

  function describePosition(pos: number) {
    let lineAndChar = sourceFile.getLineAndCharacterOfPosition(pos);
    return lineAndChar.line + ':' + lineAndChar.character;
  }
}

