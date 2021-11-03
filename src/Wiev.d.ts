export namespace Wiev {
    type TemplateFunction = (data: TemplateData) => Promise<string>;
    type InsertType = InsertType.BeforeBegin | InsertType.AfterBegin | InsertType.BeforeEnd | InsertType.AfterEnd;

    namespace InsertType {
        type BeforeBegin = 'beforebegin';
        type AfterBegin = 'afterbegin';
        type BeforeEnd = 'beforeend';
        type AfterEnd = 'afterend';
    }

    type DomListener = (element: Element, event: Event) => void;
    interface DomListeners {
        [key: string]: DomListener;
    }

    type EventListener = () => void;
    interface EventListeners {
        [key: string]: () => void;
    }

    interface TemplateData {
        [key: string]: any;
        wiev: Wiev;
        Wiev: WievConstructor;
    }

    interface ConstructorOptions {
        elementTarget: Element;
        template: TemplateFunction;
        templateData?: object;
        templateInsertType?: InsertType;
        events?: DomListeners;
        on?: EventListeners;
        once?: EventListeners;
    }

    interface WievConstructor {
        new(options: ConstructorOptions): Wiev;
    }

    namespace FiredEvents {
        type Listener = (wiev: Wiev) => void

        namespace Created {
            type Name = 'created';
            type Listener = FiredEvents.Listener;
        }
        namespace Remove {
            namespace Before {
                type Name = 'remove:before';
                type Listener = FiredEvents.Listener;
            }
            namespace After {
                type Name = 'remove:after';
                type Listener = FiredEvents.Listener;
            }
        }
        namespace Render {
            namespace Before {
                type Name = 'render:before';
                type Listener = FiredEvents.Listener;
            }
            namespace After {
                type Name = 'render:after';
                type Listener = FiredEvents.Listener;
            }
        }
    }
}

export default class Wiev {
    static TEMPLATE_INSERT_TYPE: {
        BEFORE_BEGIN: Wiev.InsertType.BeforeBegin;
        AFTER_BEGIN: Wiev.InsertType.AfterBegin;
        BEFORE_END: Wiev.InsertType.BeforeEnd;
        AFTER_END: Wiev.InsertType.AfterEnd;
    };
    
    element: Element;
    elementTarget: Element;
    template: Wiev.TemplateFunction;
    templateData: object;
    templateInsertType: Wiev.InsertType;

    constructor(options: Wiev.ConstructorOptions);

    addElementEventListener(name: string, selector: string, listener: Wiev.DomListener): this;
    removeElementEventListener(name: string, selector: string, listener: Wiev.DomListener): this;

    getTemplate(): Promise<Wiev.TemplateFunction>;
    getTemplateAsHtmlForRender(): Promise<string>;
    getTemplateDataForRender(): Promise<Wiev.TemplateData>;

    remove():Promise<this>;
    render():Promise<this>;

    on(name: Wiev.FiredEvents.Created.Name, listener: Wiev.FiredEvents.Created.Listener, context?: object): this;
    on(name: Wiev.FiredEvents.Remove.Before.Name, listener: Wiev.FiredEvents.Remove.Before.Listener, context?: object): this;
    on(name: Wiev.FiredEvents.Remove.After.Name, listener: Wiev.FiredEvents.Remove.After.Listener, context?: object): this;
    on(name: Wiev.FiredEvents.Render.Before.Name, listener: Wiev.FiredEvents.Render.Before.Listener, context?: object): this;
    on(name: Wiev.FiredEvents.Render.After.Name, listener: Wiev.FiredEvents.Render.After.Listener, context?: object): this;
    on(name: string, listener: Wiev.EventListener, context?: object): this;

    off(name: Wiev.FiredEvents.Created.Name, listener: Wiev.FiredEvents.Created.Listener, context?: object): this;
    off(name: Wiev.FiredEvents.Remove.Before.Name, listener: Wiev.FiredEvents.Remove.Before.Listener, context?: object): this;
    off(name: Wiev.FiredEvents.Remove.After.Name, listener: Wiev.FiredEvents.Remove.After.Listener, context?: object): this;
    off(name: Wiev.FiredEvents.Render.Before.Name, listener: Wiev.FiredEvents.Render.Before.Listener, context?: object): this;
    off(name: Wiev.FiredEvents.Render.After.Name, listener: Wiev.FiredEvents.Render.After.Listener, context?: object): this;
    off(name?: string | null, listener?: Wiev.EventListener | null, context?: object | null): this;

    emit(name: string, ...args: any[]): this;

    once(name: Wiev.FiredEvents.Created.Name, listener: Wiev.FiredEvents.Created.Listener, context?: object): this;
    once(name: Wiev.FiredEvents.Remove.Before.Name, listener: Wiev.FiredEvents.Remove.Before.Listener, context?: object): this;
    once(name: Wiev.FiredEvents.Remove.After.Name, listener: Wiev.FiredEvents.Remove.After.Listener, context?: object): this;
    once(name: Wiev.FiredEvents.Render.Before.Name, listener: Wiev.FiredEvents.Render.Before.Listener, context?: object): this;
    once(name: Wiev.FiredEvents.Render.After.Name, listener: Wiev.FiredEvents.Render.After.Listener, context?: object): this;
    once(name: string, listener: Wiev.EventListener, context?: object): this;
}
