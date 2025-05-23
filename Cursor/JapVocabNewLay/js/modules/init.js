import JAPVOC from '../app.js';

// Initialize application when DOM is ready
// eslint-disable-next-line no-undef
/* global document */
document.addEventListener('DOMContentLoaded', () => {
    // Create safe console wrapper
    const safeConsole = {
        log: (message) => {
            try {
                const global = Function('return this')();
                if (global.console && typeof global.console.log === 'function') {
                    global.console.log(message);
                }
            } catch (e) {
                // Ignore console errors
            }
        }
    };

    safeConsole.log('DOM is ready, initializing application');
    const japvoc = new JAPVOC();
    japvoc.initialize();
});
