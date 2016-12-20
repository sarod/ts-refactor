"use strict";
var CodeReplacement = (function () {
    function CodeReplacement(insertPosition, replacedLength, newCode) {
        this.insertPosition = insertPosition;
        this.replacedLength = replacedLength;
        this.newCode = newCode;
        Object.freeze(this);
    }
    CodeReplacement.createReplaceNodeText = function (node, newCode) {
        return new CodeReplacement(node.getStart(), node.getWidth(), newCode);
    };
    CodeReplacement.createReplaceNodeFullText = function (node, newCode) {
        return new CodeReplacement(node.getFullStart(), node.getFullWidth(), newCode);
    };
    CodeReplacement.insertTop = function (newCode) {
        return new CodeReplacement(0, 0, newCode);
    };
    return CodeReplacement;
}());
exports.CodeReplacement = CodeReplacement;
function replaceCode(originalCode, replacements) {
    var newCode = [];
    var lastCopiedPosition = 0;
    replacements.forEach(function (replacement) {
        newCode.push(originalCode.substr(lastCopiedPosition, replacement.insertPosition));
        newCode.push(replacement.newCode);
        lastCopiedPosition = replacement.insertPosition + replacement.replacedLength;
    });
    newCode.push(originalCode.substr(lastCopiedPosition, originalCode.length));
    return newCode.join('');
}
exports.replaceCode = replaceCode;
//# sourceMappingURL=code-replace.js.map