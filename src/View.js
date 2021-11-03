import EventEmitter from '../node_modules/eventemitter0/src/eventEmitter.js';

/**
 *
 * @param {Element} element
 * @param {string} name
 * @param {Object<string, {selector: string, listener: (element: Element, event: Event) => void}[]>} events
 */
function installListener(element, name, events) {
    /**
     *
     * @param {Event} event
     */
    const listener = (event) => {
        events[name].forEach((entry) => {
            let target = event.target;
            while (target !== element && target?.matches instanceof Function && target.matches(entry.selector) === false) {
                target = target.parentNode;
            }

            if (target !== element && target.matches instanceof Function) {
                entry.listener(target, event);
            }
        });
    };

    element.addEventListener(name, listener, true);
    events[name].listener = listener;
}

/**
 *
 * @param {Element} element
 * @param {string} name
 * @param {Object<string, {selector: string, listener: (element: Element, event: Event) => void}[]>} events
 */
function removeListener(element, name, events) {
    element.removeEventListener(name, events[name].listener);
}


/**
 * @property {Element|undefined} element
 * @fires View#created
 * @fires View#remove:before
 * @fires View#remove:after
 * @fires View#render:before
 * @fires View#render:after
 */
export default class View extends EventEmitter {
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
     *
     * @param {Element} elementTarget
     * @param {function([data: Object]): Promise<string>} template
     * @param {Object} templateData
     * @param {"beforebegin" | "afterbegin" | "beforeend" | "afterend"} templateInsertType
     * @param {Object<string,(element: Element, event: Event)=> void>} events
     */
    constructor({
                    elementTarget,
                    template,
                    templateData = {},
                    templateInsertType = View.TEMPLATE_INSERT_TYPE.BEFORE_END,
                    events = {}
                }) {
        super();

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
         * @event View#created
         * @type {View}
         */
        this.emit('created', this);
    }

    /**
     *
     * @param {string} name
     * @param {string} selector
     * @param {(element: Element, event: Event) => void} listener
     * @returns {this}
     */
    addElementEventListener(name, selector, listener) {
        this.events[name] ??= [];
        this.events[name].push({selector, listener});

        // a new event... add
        if (this.element !== undefined && this.events[name].length === 1) {
            installListener(this.element, name, this.events);
        }

        return this;
    }

    /**
     *
     * @returns {Promise<function(data: Object): Promise<string>>}
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
     * @returns {Promise<Object>}
     */
    async getTemplateDataForRender() {
        return {
            view: this,
            View: View,
            ...this.templateData
        };
    }

    /**
     *
     * @returns {Promise<this>}
     */
    async remove() {
        /** 
         * @event View#remove:before 
         * @type {View}
         */
        this.emit('remove:before', this);

        Object.keys(this.events).forEach((name) => removeListener(this.element, name, this.events));

        this.element?.remove();
        this.element = undefined;

        /** 
         * @event View#remove:after 
         * @type {View}
         */
        this.emit('remove:after', this);

        return this;
    }

    /**
     *
     * @param {string} name
     * @param {string} selector
     * @param {(element: Element, event: Event) => void} listener
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
            removeListener(this.element, name, this.events);
            delete this.events[name];
        }

        return this;
    }

    /**
     *
     * @returns {Promise<this>}
     */
    async render() {
        /** 
         * @event View#render:before 
         * @type {View}
         */
        this.emit('render:before', this);

        const tmpl     = document.createElement('template');
        tmpl.innerHTML = await this.getTemplateAsHtmlForRender();
        this.element   = tmpl.content.firstElementChild;
        this.elementTarget.insertAdjacentElement(this.templateInsertType, this.element);

        Object.keys(this.events).forEach((name) => installListener(this.element, name, this.events));

        /** 
         * @event View#render:after 
         * @type {View}
         */
        this.emit('render:after', this);

        return this;
    }
}
