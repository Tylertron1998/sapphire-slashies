import { bold, hideLinkEmbed, hyperlink, italic, underscore, userMention } from '@discordjs/builders';
import type { Snowflake } from 'discord-api-types/v9';
import Doc from 'discord.js-docs';
import { DjsDocsDevIcon, DjsDocsStableIcon } from '../lib/constants/emotes';
import type { FastifyResponse } from '../lib/types/Api';
import { errorResponse, interactionResponse, sendJson } from '../lib/util/responseHelpers';

function escapeMDLinks(s = ''): string {
	return s.replace(/\[(.+?)\]\((.+?)\)/g, '[$1](<$2>)');
}

function formatInheritance(prefix: string, inherits: DocElement[], doc: Doc): string {
	const res = inherits.map((element: any) => element.flat(5));
	return ` (${prefix} ${res.map((element) => escapeMDLinks(doc.formatType(element))).join(' and ')})`;
}

function resolveElementString(element: DocElement, doc: Doc): string {
	const parts = [];
	if (element.docType === 'event') parts.push(`${bold('(event)')} `);
	if (element.static) parts.push(`${bold('(static)')} `);
	parts.push(underscore(bold(escapeMDLinks(element.link ?? ''))));
	if (element.extends) parts.push(formatInheritance('extends', element.extends, doc));
	if (element.implements) parts.push(formatInheritance('implements', element.implements, doc));
	if (element.access === 'private') parts.push(` ${bold('PRIVATE')}`);
	if (element.deprecated) parts.push(` ${bold('DEPRECATED')}`);

	const s = escapeMDLinks(element.formattedDescription ?? element.description ?? '').split('\n');
	const description = s.length > 1 ? `${s[0]} ${hyperlink('(more...)', hideLinkEmbed(element.url ?? ''))}` : s[0];

	return `${parts.join('')}\n${description}`;
}

function resolveResultString(results: DocElement[]): string {
	const res = [`No match. Here are some search results:`, ...results.map((res) => `• ${bold(escapeMDLinks(res.link ?? ''))}`)];
	return res.join('\n');
}

export async function djsDocs({ query, response, source, target }: DjsDocsParameters): Promise<FastifyResponse> {
	const doc = await Doc.fetch(source, { force: true });
	const element = doc.get(...query.split(/[.#]/));
	const icon = source === 'master' ? DjsDocsDevIcon : DjsDocsStableIcon;

	if (element) {
		return sendJson(
			response,
			interactionResponse({
				content: `${target ? `${italic(`Documentation suggestion for ${userMention(target)}:`)}\n` : ''}${icon} ${resolveElementString(
					element,
					doc
				)}`,
				users: target ? [target] : []
			})
		);
	}

	const results = doc.search(query);
	if (results?.length) {
		return sendJson(
			response,
			interactionResponse({
				content: resolveResultString(results),
				ephemeral: true
			})
		);
	}

	return sendJson(
		response,
		errorResponse({
			content: 'I was unable to find anything with the provided parameters.'
		})
	);
}

interface DjsDocsParameters {
	response: FastifyResponse;
	source: string;
	query: string;
	target: Snowflake;
}
