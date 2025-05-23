import { BrowserUtils } from './utils/browser.js';

// Get the global Set constructor
const globalSet = Function('return this.Set')();

export class Utils {
    static state = {
        initialized: false
    };

    static initialize() {
        this.state.initialized = true;
        BrowserUtils.getGlobal().console.log('Utils module initialized');
    }

    static sanitizeHTML(html) {
        return html
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    static validateInput(input, type) {
        let isValid = false;
        let emailRegex;
        let urlRegex;
        switch (type) {
            case 'text':
                isValid = typeof input === 'string' && input.length > 0;
                break;
            case 'number':
                isValid = !isNaN(input) && input !== '';
                break;
            case 'email':
                emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailRegex.test(input);
                break;
            case 'url':
                urlRegex = /^(https?:\/\/)?[\w.-]+(?:\/[\w.-]*)*\/?$/;
                isValid = urlRegex.test(input);
                break;
            default:
                isValid = true;
                break;
        }
        return isValid;
    }
}

export class LazyLoader {
    constructor() {
        this.state = {
            observer: null,
            threshold: 0.1,
            loadingImages: new globalSet()
        };
    }

    initialize() {
        this.setupObserver();
        this.loadInitialImages();
    }

    setupObserver() {
        const global = BrowserUtils.getGlobal();
        this.state.observer = new global.IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const img = entry.target;
                if (entry.isIntersecting && !img.dataset.loaded) {
                    this.loadImage(img);
                }
            });
        }, {
            rootMargin: '200px',
            threshold: this.state.threshold
        });
    }

    loadImage(element) {
        try {
            if (this.state.loadingImages.has(element)) {
                return;
            }

            const src = element.getAttribute('data-src');
            if (src) {
                this.state.loadingImages.add(element);
                
                const img = new BrowserUtils.getGlobal().Image();
                img.src = src;
                img.onload = () => {
                    element.setAttribute('src', src);
                    element.setAttribute('data-loaded', 'true');
                    element.classList.add('loaded');
                    element.classList.remove('lazy-load');
                    element.style.opacity = '1';
                    this.state.loadingImages.delete(element);
                };
                img.onerror = () => {
                    BrowserUtils.getGlobal().console.error(`Failed to load image: ${src}`);
                    element.style.opacity = '0.5';
                    element.setAttribute('alt', 'Failed to load image');
                    this.state.loadingImages.delete(element);
                };
            }
        } catch (error) {
            BrowserUtils.getGlobal().console.error('Error loading image:', error);
        }
    }

    loadInitialImages() {
        const images = BrowserUtils.getGlobal().document.querySelectorAll('img[data-src]');
        images.forEach(img => {
            const rect = img.getBoundingClientRect();
            const isInViewport = (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (BrowserUtils.getGlobal().window.innerHeight || BrowserUtils.getGlobal().document.documentElement.clientHeight) &&
                rect.right <= (BrowserUtils.getGlobal().window.innerWidth || BrowserUtils.getGlobal().document.documentElement.clientWidth)
            );
            
            if (isInViewport) {
                this.loadImage(img);
            }
        });
    }
}
