import { BrowserUtils } from './utils/browser.js';

export class BaseModule {
    constructor(app) {
        this.app = app;
        this.state = {
            initialized: false
        };

        // Initialize browser utilities
        BrowserUtils.init();
    }

    initialize() {
        // First mark as initialized
        this.state.initialized = true;
        
        // Then set up UI
        this.setupUI();
        
        // Finally set up event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Implement module-specific event listeners
    }

    setupUI() {
        // Implement module-specific UI setup
    }

    loadContent() {
        // Implement content loading
    }

    handleError(error) {
        // eslint-disable-next-line no-console
        console.error('Error in module:', error);
        // Add error handling logic
    }
}
