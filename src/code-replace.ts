import * as ts from "typescript";

export class CodeReplacement {
  constructor(
    public insertPosition: number,
    public replacedLength: number,
    public newCode: string) {

    Object.freeze(this);
  }

  static createReplaceNodeText(node: ts.Node, newCode: string): CodeReplacement {
    return new CodeReplacement(node.getStart(), node.getWidth(), newCode);
  }

  static createReplaceNodeFullText(node: ts.Node, newCode: string): CodeReplacement {
    return new CodeReplacement(node.getFullStart(), node.getFullWidth(), newCode);
  }

  static insertTop(newCode: string): CodeReplacement {
    return new CodeReplacement(0, 0, newCode);
  }
}


export function replaceCode(originalCode: string, replacements: CodeReplacement[]): string {
  let newCode: string[] = [];
  let lastCopiedPosition: number = 0;
  replacements.forEach((replacement: CodeReplacement) => {
      newCode.push(originalCode.substr(lastCopiedPosition, replacement.insertPosition));
      newCode.push(replacement.newCode);
      lastCopiedPosition = replacement.insertPosition + replacement.replacedLength;
  });
  newCode.push(originalCode.substr(lastCopiedPosition, originalCode.length));
  
  return newCode.join('');
}
