const htmlStripWhitespacesRegEx                 = [
    [/(\n)|(\r)/gi, ' '],
    [/(\t)/gi, ''],
    [/>\s*</gi, '><'],
    [/[\f]/g, '\\f'],
    [/[\b]/g, '\\b'],
    [/[\n]/g, '\\n'],
    [/[\t]/g, '\\t'],
    [/[\r]/g, '\\r'],
    [/[\u2028]/g, '\\u2028'],
    [/[\u2029]/g, '\\u2029'],
];
const htmlStripWhitespacesRegExWithSingleQuotes = [
    [/(\n)|(\r)/gi, ' '],
    [/(\t)/gi, ''],
    [/>\s*</gi, '><'],
    [/(['\\])/g, '\\$1'],
    [/[\f]/g, '\\f'],
    [/[\b]/g, '\\b'],
    [/[\n]/g, '\\n'],
    [/[\t]/g, '\\t'],
    [/[\r]/g, '\\r'],
    [/[\u2028]/g, '\\u2028'],
    [/[\u2029]/g, '\\u2029'],
];

/**
 * convert whitespaces between html tags to nothing and remove Tabs and Linebreaks
 *
 * @param {string} content
 * @param {boolean} escapeSingleQuotes
 * @return {string}
 */
export default function minifyTemplate(content, escapeSingleQuotes = true) {
    content = content.split('\n').map((string) => string.trim()).join('\n');

    const replacements = escapeSingleQuotes === true ? htmlStripWhitespacesRegExWithSingleQuotes : htmlStripWhitespacesRegEx;
    return replacements
        .reduce((content, [searchValue, replacer]) => content.replace(searchValue, replacer), content)
        .trim();
}
