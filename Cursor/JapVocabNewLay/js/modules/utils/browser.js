export class BrowserUtils {
    static isInitialized = false;
    static doc = null;
    static global = null;
    static consoleAvailable = false;
    static safeConsole = null;

    static init() {
        if (this.isInitialized) return true;

        try {
            // Detect global object
            this.global = typeof window !== 'undefined' ? window : globalThis;

            // Check for document existence
            if (typeof document !== 'undefined') {
                this.doc = document;
            } else {
                this.doc = null;
            }

            // Check if console is usable
            const c = this.global.console;
            this.consoleAvailable = !!(c && typeof c.log === 'function' && typeof c.warn === 'function' && typeof c.error === 'function');

            // Initialize safe console
            this.safeConsole = {
                log: (msg) => {
                    if (this.consoleAvailable) this.global.console.log('[JAPVOC]', msg);
                },
                warn: (msg) => {
                    if (this.consoleAvailable) this.global.console.warn('[JAPVOC]', msg);
                },
                error: (msg) => {
                    if (this.consoleAvailable) this.global.console.error('[JAPVOC]', msg);
                }
            };

            this.isInitialized = true;
            return true;
        } catch (err) {
            this.doc = null;
            this.consoleAvailable = false;
            this.safeConsole = null;
            return false;
        }
    }

    static get isBrowser() {
        return typeof window !== 'undefined' && typeof document !== 'undefined';
    }

    static getDocument() {
        return this.doc;
    }

    static getGlobal() {
        return this.global;
    }

    static getSafeConsole() {
        if (!this.isInitialized) {
            this.init();
        }
        
        if (!this.safeConsole) {
            // Fallback if initialization failed
            return {
                log: () => {},
                warn: () => {},
                error: () => {}
            };
        }
        
        return this.safeConsole;
    }

    static getDOMElement(selector) {
        if (!this.isBrowser) return null;
        try {
            return this.doc?.querySelector(selector) ?? null;
        } catch {
            this.getSafeConsole().error(`Failed to query selector: ${selector}`);
            return null;
        }
    }

    static setDOMElement(selector, html) {
        const el = this.getDOMElement(selector);
        if (!el) {
            this.getSafeConsole().warn(`Element not found: ${selector}`);
            return false;
        }
        try {
            el.innerHTML = html;
            return true;
        } catch {
            this.getSafeConsole().error(`Failed to set HTML for: ${selector}`);
            return false;
        }
    }

    static createInterval(callback, delay) {
        if (!this.isBrowser) return null;
        try {
            return this.global.setInterval(callback, delay);
        } catch {
            this.getSafeConsole().error('setInterval failed');
            return null;
        }
    }

    static clearInterval(intervalId) {
        try {
            this.global.clearInterval(intervalId);
        } catch {
            this.getSafeConsole().error('clearInterval failed');
        }
    }

    static addEventListener(element, event, callback) {
        if (!this.isBrowser || !element) return false;
        try {
            element.addEventListener(event, callback);
            return true;
        } catch {
            this.getSafeConsole().error(`Failed to add event: ${event}`);
            return false;
        }
    }

    static removeEventListener(element, event, callback) {
        if (!this.isBrowser || !element) return false;
        try {
            element.removeEventListener(event, callback);
            return true;
        } catch {
            this.getSafeConsole().error(`Failed to remove event: ${event}`);
            return false;
        }
    }
}
