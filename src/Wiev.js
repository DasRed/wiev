import EventEmitter from '../node_modules/eventemitter0/src/EventEmitter.js';

/**
 *
 * @param {Element[]} elements
 * @param {string} name
 * @param {Object<string, {selector: string, listener: Wiev.DomListener}[]>} events
 */
function installListeners(elements, name, events) {
    elements.forEach((element) => installListener(element, name, events));
}

/**
 *
 * @param {Element} element
 * @param {string} name
 * @param {Object<string, {selector: string, listener: Wiev.DomListener}[]>} events
 */
function installListener(element, name, events) {
    /**
     *
     * @param {Event} event
     */
    const listener = (event) => {
        let preventDefaultValue           = false;
        let stopPropagationValue          = false;
        let stopImmediatePropagationValue = false;

        const preventDefault           = event.preventDefault;
        const stopPropagation          = event.stopPropagation;
        const stopImmediatePropagation = event.stopImmediatePropagation;

        event.preventDefault = function () {
            preventDefaultValue = true;
            return preventDefault.bind(event)();
        };

        event.stopPropagation = function () {
            stopPropagationValue = true;
            return stopPropagation.bind(event)();
        };

        event.stopImmediatePropagation = function () {
            stopImmediatePropagationValue = true;
            return stopImmediatePropagation.bind(event)();
        };

        events[name]
            // map all founded element to the level
            .reduce((acc, entry) => {
                let target = event.target;
                let level  = 0;
                while (target !== element.parentNode && target?.matches instanceof Function && target.matches(entry.selector) === false) {
                    target = target.parentNode;
                    level++;
                }

                if (target !== element.parentNode && target?.matches instanceof Function) {
                    acc.push({level, target, entry});
                }

                return acc;
            }, [])
            // sort by deepest as first
            .sort(({level: levelA}, {level: levelB}) => levelA - levelB)
            // run every listener for the found element, but abort, if the abort functions was called
            .find(({target, entry}) => {
                entry.listener(target, event);
                return preventDefaultValue === true || stopPropagationValue === true || stopImmediatePropagationValue === true;
            });
    };

    element.addEventListener(name, listener, true);
    events[name].listener = listener;
}

/**
 *
 * @param {Element[]} elements
 * @param {string} name
 * @param {Object<string, {selector: string, listener: Wiev.DomListener}[]>} events
 */
function removeListeners(elements, name, events) {
    elements.forEach((element) => element.removeEventListener(name, events[name].listener));
}

/**
 * @property {Element|undefined} element
 * @fires Wiev#created
 * @fires Wiev#remove:before
 * @fires Wiev#remove:after
 * @fires Wiev#render:before
 * @fires Wiev#render:after
 */
export default class Wiev extends EventEmitter {
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentElement
     */
    static TEMPLATE_INSERT_TYPE = {
        BEFORE_BEGIN: 'beforebegin',
        AFTER_BEGIN:  'afterbegin',
        BEFORE_END:   'beforeend',
        AFTER_END:    'afterend',
    };

    /**
     * @deprecated
     * @returns {Element}
     */
    get element() {
        return this.elements[0];
    }

    /**
     *
     * @param {Element} elementTarget
     * @param {Wiev.TemplateFunction} template
     * @param {Object} templateData
     * @param {Wiev.InsertType} templateInsertType
     * @param {Wiev.DomListeners} events
     * @param {EventEmitter.EventListeners} on
     * @param {EventEmitter.EventListeners} once
     */
    constructor({
                    elementTarget,
                    template,
                    templateData = {},
                    templateInsertType = Wiev.TEMPLATE_INSERT_TYPE.BEFORE_END,
                    events = {},
                    on = {},
                    once = {},
                }) {
        super({on, once});

        this.elements           = [];
        this.elementTarget      = elementTarget;
        this.template           = template;
        this.templateData       = templateData;
        this.templateInsertType = templateInsertType;

        /** @type {Object<string, {selector: string, listener: (element: Element, event: Event) => void}[]>} */
        this.events = {};

        Object.entries(events).forEach(([nameAndSelector, listener]) => {
            const [name, selector] = nameAndSelector.split(' ', 2);
            this.addElementEventListener(name, selector, listener);
        });

        /**
         * @event Wiev#created
         * @type {Wiev}
         */
        this.emit('created', this);
    }

    /**
     *
     * @param {string} name
     * @param {string} selector
     * @param {Wiev.DomListener} listener
     * @returns {this}
     */
    addElementEventListener(name, selector, listener) {
        this.events[name] ??= [];
        this.events[name].push({selector, listener});

        // a new event... add
        if (this.events[name].length === 1) {
            installListeners(this.elements, name, this.events);
        }

        return this;
    }

    /**
     *
     * @returns {Promise<Wiev.TemplateFunction>}
     */
    async getTemplate() {
        return this.template;
    }

    /**
     * @returns {Promise<string>}
     */
    async getTemplateAsHtmlForRender() {
        const template = await this.getTemplate();
        const data     = await this.getTemplateDataForRender();
        return template(data);
    }

    /**
     *
     * @returns {Promise<Wiev.TemplateData>}
     */
    async getTemplateDataForRender() {
        return {
            wiev: this,
            Wiev: Wiev,
            ...this.templateData
        };
    }

    /**
     *
     * @param {string} name
     * @param {string} selector
     * @param {Wiev.DomListener} listener
     * @returns {this}
     */
    onceElementEventListener(name, selector, listener) {
        const callback = (...args) => {
            this.removeElementEventListener(name, selector, callback);
            return listener(...args);
        };

        return this.addElementEventListener(name, selector, callback);
    }

    /**
     *
     * @param {string} selector
     * @returns {Element|null}
     */
    querySelector(selector) {
        return this.elements.find((element) => element.matches(selector) || element.querySelector(selector)) ?? null;
    }

    /**
     *
     * @param {string} selector
     * @returns {Element[]}
     */
    querySelectorAll(selector) {
        return this.elements.reduce((acc, element) => {
            if (element.matches(selector) === true) {
                acc.push(element);
            }

            return acc.concat(Array.from(element.querySelectorAll(selector)));
        }, []);
    }

    /**
     *
     * @returns {Promise<this>}
     */
    async remove() {
        /**
         * @event Wiev#remove:before
         * @type {Wiev}
         */
        await this.emit('remove:before', this);

        Object.keys(this.events).forEach((name) => removeListeners(this.elements, name, this.events));

        this.elements.forEach((element) => element.remove());
        this.elements = [];

        /**
         * @event Wiev#remove:after
         * @type {Wiev}
         */
        await this.emit('remove:after', this);

        return this;
    }

    /**
     *
     * @param {string} name
     * @param {string} selector
     * @param {Wiev.DomListener} listener
     * @returns {this}
     */
    removeElementEventListener(name, selector, listener) {
        if (this.events[name] === undefined) {
            return this;
        }

        const index = this.events[name].findIndex((event) => event.selector === selector && event.listener === listener);
        if (index === -1) {
            return this;
        }
        this.events[name].splice(index, 1);

        // remove the listener completely
        if (this.events[name].length === 0) {
            removeListeners(this.elements, name, this.events);
            delete this.events[name];
        }

        return this;
    }

    /**
     *
     * @returns {Promise<this>}
     */
    async render() {
        if (this.elements.length !== 0) {
            return this;
        }

        /**
         * @event Wiev#render:before
         * @type {Wiev}
         */
        await this.emit('render:before', this);

        const tmpl     = document.createElement('template');
        tmpl.innerHTML = await this.getTemplateAsHtmlForRender();

        this.elements = Array.from(tmpl.content.children);
        this.elements.forEach((element, index, array) => {
            if (index === 0) {
                this.elementTarget.insertAdjacentElement(this.templateInsertType, element);
            }
            else {
                array[index - 1].insertAdjacentElement(Wiev.TEMPLATE_INSERT_TYPE.AFTER_END, element);
            }
        });

        Object.keys(this.events).forEach((name) => installListeners(this.elements, name, this.events));

        /**
         * @event Wiev#render:after
         * @type {Wiev}
         */
        await this.emit('render:after', this);

        return this;
    }
}
