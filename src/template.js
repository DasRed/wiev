import minifyTemplate from './minifyTemplate.js';

/**
 *
 * @param {string[]} strings
 * @param {*[]} values
 * @return {string}
 * @property {import('js-translator')} translator
 */
export default function template(strings, ...values) {
    let content = strings.reduce((content, string, index) => {
        const value = index < values.length ? String(values[index]) : '';
        return content + string + value;
    }, '');

    // convert whitespaces between html tags to nothing and remove Tabs and Linebreaks
    content = minifyTemplate(content);

    if (template.translator?.translateInline instanceof Function) {
        content = template.translator.translateInline(content.trim());
    }

    return content;
}
