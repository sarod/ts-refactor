import * as ts from "typescript";

export class CodeReplacement {
	constructor(public insertPosition: number,
	            public replacedLength: number,
	            public newCode: string) {

		Object.freeze(this);
	}

	public static createReplaceNodeText(node: ts.Node, newCode: string): CodeReplacement {
		return new CodeReplacement(node.getStart(), node.getWidth(), newCode);
	}

	public static createReplaceNodeFullText(node: ts.Node, newCode: string): CodeReplacement {
		return new CodeReplacement(node.getFullStart(), node.getFullWidth(), newCode);
	}

	public static insertTop(newCode: string): CodeReplacement {
		return new CodeReplacement(0, 0, newCode);
	}

	public toString() {
		return '@' + this.insertPosition + '[' + this.replacedLength + ']:"' + this.newCode + '"';
	}
}


export function replaceCode(originalCode: string, replacements: CodeReplacement[]): string {
	let sortedReplacements = replacements
		.slice()
		.sort((replacement: CodeReplacement, replacement2: CodeReplacement) => {
				if (replacement.insertPosition !== replacement2.insertPosition) {
					return replacement.insertPosition - replacement2.insertPosition;
				} else {
					// otherwise sort by orginal positi
					return replacements.indexOf(replacement) - replacements.indexOf(replacement2);
				}
			}
		);
	let newCode: string[] = [];
	let lastCopiedPosition: number = 0;
	console.log('replaceCode:' + sortedReplacements);
	sortedReplacements.forEach((replacement: CodeReplacement) => {
		newCode.push(originalCode.substring(lastCopiedPosition, replacement.insertPosition));
		newCode.push(replacement.newCode);
		lastCopiedPosition = replacement.insertPosition + replacement.replacedLength;
		console.log('newCode:');
		console.log(newCode.join(''));
	});
	newCode.push(originalCode.substring(lastCopiedPosition, originalCode.length));

	return newCode.join('');
}
