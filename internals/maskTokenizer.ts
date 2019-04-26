import { IMaskToken } from './types';

const specialCharacters: string[] = ['0', 'x', 'X', 's', 'a'];

function getNextTokenLength(mask: string, startIndex: number): number {
	const char = mask.charAt(startIndex);
	if (char === '\\') {
		const lookAhead = mask.charAt(startIndex+2);
		if (lookAhead === '?') {
			return 3;
		}
		return 2;
	}

	const nextChar = mask.charAt(startIndex+1);
	if (nextChar === '?') {
		return 2;
	}

	return 1;
}

export function tokenize(mask: string): string[] {
	const tokens = [];
	let currentIndex = 0;

	while (currentIndex < mask.length) {
		const nextTokenLength = getNextTokenLength(mask, currentIndex);
		const nextToken = mask.substr(currentIndex, nextTokenLength);
		tokens.push(nextToken);
		currentIndex += nextTokenLength;
	}

	return tokens;
}

function createMaskTokenFromString(tokenString: string): IMaskToken {
	let realTokenValue = tokenString;
	const maskToken: IMaskToken = {
		token: '',
		literal: false,
		optional: false
	};
	if (isLiteral(tokenString)) {
		realTokenValue = realTokenValue.substr(1);
		maskToken.literal = true;
		if (tokenString.length > 2 && isOptional(tokenString)) {
			realTokenValue = realTokenValue.substr(0, realTokenValue.length-1);
			maskToken.optional = true;
		}
	} else if (isOptional(tokenString)) {
		realTokenValue = realTokenValue.replace('?', '');
		maskToken.optional = true;
	}

	maskToken.token = realTokenValue;

	if (isImplicitLiteral(maskToken.token)) {
		maskToken.literal = true;
	}

	return maskToken;
}

function isOptional(token: string): boolean {
	return token.endsWith('?');
}

function isLiteral(token: string): boolean {
	return token.startsWith('\\');
}

function isImplicitLiteral(token: string): boolean {
	return !specialCharacters.includes(token);
}

export function getTokens(mask: string): IMaskToken[] {
	const tokens = tokenize(mask);
	return tokens.map(createMaskTokenFromString);
}