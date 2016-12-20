"use strict";
var ts = require("typescript");
var code_replace_1 = require("./code-replace");
var path_1 = require("path");
function processSourceFile(baseUrlPath, sourceFilePath, sourceFile) {
    var codeReplacements = [];
    processNode(sourceFile);
    return code_replace_1.replaceCode(sourceFile.getFullText(), codeReplacements);
    function processNode(node) {
        switch (node.kind) {
            case ts.SyntaxKind.CallExpression:
                handleCallExpression(node);
                break;
        }
        ts.forEachChild(node, processNode);
    }
    function handleCallExpression(callExpression) {
        var expression = callExpression.expression;
        if (!isAngularComponentExpression(expression)) {
            console.log('skipping expression: ' + describeNode(callExpression) + ' componentOptions is not an object literal');
            return;
        }
        else {
            var componentNameArg = callExpression.arguments[0];
            var componentName = void 0;
            if (componentNameArg.kind !== ts.SyntaxKind.StringLiteral) {
                console.log('skipping expression: ' + describeNode(callExpression) + ': componentName is not a string literal');
                return;
            }
            componentName = extractStringFromLiteral(componentNameArg);
            var componentOptionsArg = callExpression.arguments[1];
            if (componentOptionsArg.kind !== ts.SyntaxKind.ObjectLiteralExpression) {
                console.log('skipping expression: ' + describeNode(callExpression) + ': componentOptions is not an ObjectLiteralExpression');
                return;
            }
            var componentOptionsObject = componentOptionsArg;
            var templateProperty = componentOptionsObject
                .properties
                .find(function (element) { return element.name.getText() === 'template'; });
            if (templateProperty) {
                console.log('skipping expression: ' + describeNode(callExpression) + ' templateProperty already defined ');
                return;
            }
            var templateUrlProperty = componentOptionsObject
                .properties
                .find(function (element) { return element.name.getText() === 'templateUrl'; });
            if (!templateUrlProperty) {
                console.log('skipping expression: ' + describeNode(callExpression) + ' templateUrlProperty absent');
                return;
            }
            if (templateUrlProperty.kind !== ts.SyntaxKind.PropertyAssignment) {
                console.log('skipping expression: ' + describeNode(callExpression) + ' templateUrlProperty is not a PropertyAssignment');
                return;
            }
            var urlInitializerExpression = templateUrlProperty.initializer;
            if (urlInitializerExpression.kind !== ts.SyntaxKind.StringLiteral) {
                console.log('skipping expression: ' + describeNode(callExpression) + ' urlInitializerExpression is not a StringLiteral');
                return;
            }
            var templateUrl = extractStringFromLiteral(urlInitializerExpression);
            var importPath = templateUrlToImportPath(templateUrl);
            codeReplacements.push(code_replace_1.CodeReplacement.insertTop('import * as template from \'' + importPath + '\';\n'));
            codeReplacements.push(code_replace_1.CodeReplacement.createReplaceNodeText(templateUrlProperty, 'template: template'));
        }
    }
    function extractStringFromLiteral(expr) {
        return expr.getText().slice(1, -1);
    }
    function templateUrlToImportPath(templateUrl) {
        var absoluteUrlPath = path_1.resolve(baseUrlPath, templateUrl);
        var sourceFileFolder = path_1.dirname(sourceFilePath);
        var relativePath = path_1.relative(sourceFileFolder, absoluteUrlPath);
        if (!relativePath.startsWith('.')) {
            relativePath = './' + relativePath;
        }
        return relativePath;
    }
    function isAngularComponentExpression(expression) {
        if (expression.kind == ts.SyntaxKind.PropertyAccessExpression) {
            var propertyAccessExpression = expression;
            return propertyAccessExpression.name.getText() === 'component';
        }
        return false;
    }
    function describeNode(node) {
        return ts.SyntaxKind[node.kind] + ' @' + describePosition(node.getStart()) + ' text:\n' + node.getText() + '\n';
    }
    function describePosition(pos) {
        var lineAndChar = sourceFile.getLineAndCharacterOfPosition(pos);
        return lineAndChar.line + ':' + lineAndChar.character;
    }
}
exports.processSourceFile = processSourceFile;
//# sourceMappingURL=refactor.js.map