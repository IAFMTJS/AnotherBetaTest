import { UI } from './modules/ui.js';
import { Quiz } from './modules/quiz.js';
import { Flashcards } from './modules/flashcards.js';
import { Kanji } from './modules/kanji.js';
import { SRS } from './modules/srs.js';
import { Listening } from './modules/listening.js';
import { BrowserUtils } from './modules/utils/browser.js';
import { LazyLoader } from './modules/utils.js';
import Progress from './modules/progress.js';
import { vocabulary } from './data/vocabulary.js';
import { kanji } from './data/kanji.js';
import { listening } from './data/listening.js';

import Grammar from './modules/grammar.js';
import { wordBank } from './modules/word-bank.js';
import { grammar as grammarModule } from './data/grammar.js';

export default class JAPVOC {
    constructor() {
        // Initialize configuration
        this.config = {
            version: '1.0.0',
            initializationTimeout: 5000, // 5 seconds timeout for initialization
            retryAttempts: 3, // Number of retry attempts for failed operations
            resourcePreloadTimeout: 2000 // 2 seconds timeout for resource preloading
        };

        // Initialize data structure with error handling
        try {
            this.data = {
                vocabulary,
                kanji,
                grammar: grammarModule,
                listening
            };
        } catch (error) {
            BrowserUtils.getSafeConsole().error('Failed to initialize data structure:', error);
            this.data = {};
        }
        
        // Enhanced state management
        this.state = {
            initialized: false,
            currentSection: 'welcome-page',
            loading: false,
            user: null,
            isDarkMode: false,
            lastError: null,
            initializationStartTime: null,
            progress: {
                quiz: {},
                flashcards: {},
                kanji: {},
                srs: {},
                grammar: {},
                listening: {}
            },
            moduleStatus: {
                ui: { initialized: false, error: null, lastAttempt: null },
                quiz: { initialized: false, error: null, lastAttempt: null },
                flashcards: { initialized: false, error: null, lastAttempt: null },
                kanji: { initialized: false, error: null, lastAttempt: null },
                srs: { initialized: false, error: null, lastAttempt: null },
                grammar: { initialized: false, error: null, lastAttempt: null },
                listening: { initialized: false, error: null, lastAttempt: null },
                progress: { initialized: false, error: null, lastAttempt: null },
                lazyLoader: { initialized: false, error: null, lastAttempt: null }
            },
            resources: {
                preloaded: new Set(),
                failed: new Set(),
                pending: new Set()
            },
            timers: {},
            intervals: {}
        };

        // Initialize modules with error handling
        try {
            this.modules = {
                ui: new UI(this),
                quiz: new Quiz(this),
                flashcards: new Flashcards(this),
                kanji: new Kanji(this),
                srs: new SRS(this),
                grammar: new Grammar(this),
                listening: new Listening(this),
                progress: new Progress(this),
                lazyLoader: new LazyLoader(this)
            };
        } catch (error) {
            BrowserUtils.getSafeConsole().error('Failed to initialize modules:', error);
            this.modules = {};
        }
    }

    // Initialize app after DOM is loaded with enhanced error handling
    static init() {
        if (typeof BrowserUtils.getGlobal().window === 'undefined') {
            BrowserUtils.getSafeConsole().error('This application must be run in a browser environment');
            return;
        }

        const initApp = () => {
            try {
                const app = new JAPVOC();
                BrowserUtils.getGlobal().window.JAPVOC = app;
                app.initialize();
            } catch (error) {
                BrowserUtils.getSafeConsole().error('Failed to initialize application:', error);
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initApp);
        } else {
            initApp();
        }
    }

    // Enhanced initialization with timeout and retry logic
    async initialize() {
        this.state.initializationStartTime = Date.now();
        
        try {
            await this.initializeWithTimeout();
        } catch (error) {
            this.handleInitializationError(error);
        }
    }

    async initializeWithTimeout() {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Initialization timeout')), this.config.initializationTimeout);
        });

        try {
            await Promise.race([
                this.initializeModules(),
                timeoutPromise
            ]);
        } catch (error) {
            throw error;
        }
    }

    async initializeModules() {
        // Initialize UI first
        await this.initializeModule('ui');

        // Load and validate data
        await this.loadInitialData();

        // Initialize remaining modules sequentially
        const moduleOrder = ['progress', 'lazyLoader', 'quiz', 'flashcards', 'kanji', 'srs', 'grammar', 'listening'];
        
        for (const moduleName of moduleOrder) {
            await this.initializeModule(moduleName);
        }

        // Set up event listeners
        this.setupEventListeners();

        // Show initial section
        await this.showSection(this.state.currentSection);

        // Mark as initialized
        this.state.initialized = true;
        BrowserUtils.getSafeConsole().log('Application initialized successfully');
    }

    async initializeModule(moduleName, attempt = 1) {
        const module = this.modules[moduleName];
        if (!module || !module.initialize) return;

        try {
            this.state.moduleStatus[moduleName].lastAttempt = Date.now();
            await module.initialize();
            this.state.moduleStatus[moduleName].initialized = true;
            this.state.moduleStatus[moduleName].error = null;
        } catch (error) {
            this.state.moduleStatus[moduleName].error = error;
            
            if (attempt < this.config.retryAttempts) {
                BrowserUtils.getSafeConsole().warn(`Retrying initialization of ${moduleName} (attempt ${attempt + 1})`);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                return this.initializeModule(moduleName, attempt + 1);
            }
            
            throw error;
        }
    }

    handleInitializationError(error) {
        this.state.lastError = error;
        this.state.initialized = false;
        
        BrowserUtils.getSafeConsole().error('Initialization failed:', error);
        
        // Show error in UI if available
        if (this.modules.ui) {
            this.modules.ui.showError('Initialization failed', error.message);
        }
    }

    // Enhanced data loading with validation
    async loadInitialData() {
        const requiredDataTypes = ['vocabulary', 'kanji', 'grammar', 'listening'];
        const missingData = requiredDataTypes.filter(type => !this.data[type]);
        
        if (missingData.length > 0) {
            throw new Error(`Missing required data: ${missingData.join(', ')}`);
        }

        try {
            // Validate all data types
            await Promise.all([
                this.validateVocabularyData(this.data.vocabulary),
                this.validateKanjiData(this.data.kanji),
                this.validateGrammarData(this.data.grammar),
                this.validateListeningData(this.data.listening)
            ]);

            // Initialize word bank
            this.wordBank = wordBank;
            await this.wordBank.loadFromAppData(this.data);

            // Initialize progress data
            this.state.progress = await this.modules.progress.loadProgress();
            
            BrowserUtils.getSafeConsole().log('All data initialized successfully');
        } catch (error) {
            throw new Error(`Error initializing data: ${error.message}`);
        }
    }

    // Enhanced section management
    async showSection(section) {
        try {
            // Clean up current section
            await this.cleanupSection(this.state.currentSection);

            // Show new section
            const newSection = document.querySelector(`.section[data-section="${section}"]`);
            if (!newSection) {
                throw new Error(`Section not found: ${section}`);
            }

            newSection.classList.remove('hidden');
            this.state.currentSection = section;

            // Preload resources for the new section
            await this.preloadSectionResources(section);

            // Set up section event listeners
            await this.setupSectionEventListeners(section);

            // Update URL hash
            window.location.hash = `#${section}`;

            // Update progress if in progress section
            if (section === 'progress') {
                await this.modules.progress.updateProgress();
            }
        } catch (error) {
            BrowserUtils.getSafeConsole().error(`Error showing section ${section}:`, error);
            this.modules.ui?.showError('Section Error', `Failed to load section: ${section}`);
        }
    }

    async preloadSectionResources(section) {
        if (!this.modules.lazyLoader) return;

        try {
            switch (section) {
                case 'listening':
                    await this.modules.lazyLoader.preloadAudioFiles(
                        this.data.listening[this.state.currentLevel]
                    );
                    break;
                case 'kanji':
                    await this.modules.lazyLoader.preloadKanjiImages(
                        this.data.kanji[this.state.currentLevel]
                    );
                    break;
                // Add other section-specific resource preloading
            }
        } catch (error) {
            BrowserUtils.getSafeConsole().warn(`Resource preloading failed for ${section}:`, error);
        }
    }

    // Enhanced cleanup
    async cleanupSection(section) {
        const container = document.querySelector(`#${section} .${section}-container`);
        if (!container) return;

        try {
            // Remove event listeners
            const elements = container.querySelectorAll('button, select, input');
            elements.forEach(element => {
                const clone = element.cloneNode(true);
                element.parentNode.replaceChild(clone, element);
            });

            // Clear timers and intervals
            if (this.state.timers[section]) {
                clearTimeout(this.state.timers[section]);
                delete this.state.timers[section];
            }

            if (this.state.intervals[section]) {
                clearInterval(this.state.intervals[section]);
                delete this.state.intervals[section];
            }

            // Call module cleanup if available
            const module = this.modules[section];
            if (module && typeof module.cleanup === 'function') {
                await module.cleanup();
            }
        } catch (error) {
            BrowserUtils.getSafeConsole().error(`Error cleaning up section ${section}:`, error);
        }
    }

    setupEventListeners() {
        // Navigation - use event delegation for better performance
        BrowserUtils.getGlobal().document.querySelector('.main-content').addEventListener('click', (e) => {
            const target = e.target;
            const section = target.closest('.section');
            
            // Handle navigation tabs
            if (target.matches('.nav-tab')) {
                e.preventDefault();
                const sectionId = target.dataset.section;
                this.showSection(sectionId);
                BrowserUtils.getGlobal().location.hash = `#${sectionId}`;
                return;
            }

            // Handle quick start buttons
            if (target.matches('.start-btn')) {
                e.preventDefault();
                const sectionId = target.dataset.section;
                this.showSection(sectionId);
                return;
            }

            // Handle section-specific buttons
            if (section && target.matches('.start-quiz, .start-flashcards, .start-kanji, .start-srs, .start-grammar, .start-listening')) {
                e.preventDefault();
                const sectionId = section.id;
                this.handleSectionButton(target, sectionId);
                return;
            }

            // Handle select changes
            if (section && target.matches('select')) {
                const sectionId = section.id;
                this.handleSelectChange(target, sectionId);
                return;
            }
        });

        // Initialize section-specific event listeners
        this.initializeSectionEventListeners();

        // Add global event listeners
        BrowserUtils.getGlobal().addEventListener('hashchange', () => {
            const hash = BrowserUtils.getGlobal().location.hash.slice(1);
            if (hash) {
                this.showSection(hash);
            } else {
                this.showSection('welcome-page');
            }
        });

        // Handle initial hash if present
        if (BrowserUtils.getGlobal().location.hash) {
            const hash = BrowserUtils.getGlobal().location.hash.slice(1);
            if (hash) {
                this.showSection(hash);
            } else {
                this.showSection('welcome-page');
            }
        }
    }

    initializeSectionEventListeners() {
        // Set up event listeners for each section
        BrowserUtils.getGlobal().document.querySelectorAll('.section').forEach(section => {
            const sectionId = section.id;
            const module = this.modules[sectionId];
            if (module && module.setupEventListeners) {
                module.setupEventListeners();
            }
        });
    }

    setupSectionEventListeners(section) {
        const module = this.modules[section];
        if (!module) return;

        // Add resource preloading
        if (section === 'listening') {
            this.modules.lazyLoader.preloadAudioFiles(
                this.data.listening[this.state.currentLevel]
            );
        }

        module.initialize();
    }

    handleSectionButton(target, section = null) {
        const sectionName = section || target.closest('.section').dataset.section;
        const module = this.modules[sectionName];
        if (!module) return;

        switch(target.className) {
            case 'start-quiz':
                module.startQuiz(target.dataset.type);
                break;
            case 'start-flashcards':
                module.startPractice();
                break;
            case 'start-kanji':
                module.startPractice();
                break;
            case 'start-srs':
                module.startSession();
                break;
            case 'start-grammar':
                module.startPractice();
                break;
            case 'start-listening':
                module.startPractice();
                break;
        }
    }

    handleSelectChange(target, section) {
        const selectType = target.className;
        const value = target.value;

        const sectionModule = this.modules[section];
        if (!sectionModule) return;

        switch(selectType) {
            case 'category-select':
                sectionModule.setCategory(value);
                break;
            case 'difficulty-select':
                sectionModule.setDifficulty(value);
                break;
            case 'questions-select':
                sectionModule.setQuestionCount(value);
                break;
            case 'mode-select':
                sectionModule.setMode(value);
                break;
            case 'level-select':
                sectionModule.setLevel(value);
                break;
        }
    }

    // Validation methods for each data type
    validateVocabularyData(vocabulary) {
        if (!vocabulary) return false;
        
        const requiredLevels = ['beginner', 'intermediate', 'advanced'];
        const requiredCategories = ['numbers', 'animals', 'food', 'colors', 'phrases'];
        
        return requiredLevels.every(level => {
            if (!vocabulary[level]) return false;
            return requiredCategories.every(category => {
                if (!vocabulary[level][category]) return false;
                return vocabulary[level][category].every(item => {
                    return item.word || item.phrase;
                });
            });
        });
    }

    validateKanjiData(kanji) {
        if (!kanji) return false;
        
        const requiredLevels = ['beginner', 'intermediate', 'advanced'];
        const requiredFields = ['character', 'reading', 'meaning', 'strokeCount', 'grade', 'jlpt'];
        
        return requiredLevels.every(level => {
            if (!kanji[level]) return false;
            return kanji[level].every(item => {
                return requiredFields.every(field => item[field] !== undefined);
            });
        });
    }

    validateGrammarData(grammar) {
        if (!grammar) return false;
        
        const requiredLevels = ['beginner', 'intermediate', 'advanced'];
        const requiredFields = ['id', 'topic', 'difficulty', 'content'];
        
        return requiredLevels.every(level => {
            if (!grammar[level]) return false;
            return grammar[level].every(item => {
                return requiredFields.every(field => item[field] !== undefined);
            });
        });
    }

    validateListeningData(listening) {
        if (!listening) {
            BrowserUtils.getSafeConsole().error('No listening data provided');
            return false;
        }
        
        // Add partial data recovery
        const availableLevels = ['beginner', 'intermediate', 'advanced'].filter(
            level => Array.isArray(listening[level]) && listening[level].length > 0
        );
        
        if (availableLevels.length === 0) {
            BrowserUtils.getSafeConsole().error('No valid levels found in listening data');
            return false;
        }
        
        // Continue with available levels only
        return availableLevels.every(level => {
            const requiredFields = ['id', 'title', 'difficulty', 'audioFile', 'transcript', 'translation', 'questions'];
            const hasAllLevels = requiredLevels.every(l => {
                if (!Array.isArray(listening[l])) {
                    BrowserUtils.getSafeConsole().error(`Missing or invalid level: ${l}`);
                    return false;
                }
                return true;
            });

            if (!hasAllLevels) return false;

            const hasValidExercises = listening[level].every((item, index) => {
                const missingFields = requiredFields.filter(field => item[field] === undefined);
                if (missingFields.length > 0) {
                    BrowserUtils.getSafeConsole().error(`Exercise ${index} in ${level} is missing fields: ${missingFields.join(', ')}`);
                    return false;
                }
                return true;
            });

            if (!hasValidExercises) {
                BrowserUtils.getSafeConsole().error('Some exercises are missing required fields');
                return false;
            }

            BrowserUtils.getSafeConsole().log(`Listening data validation successful for level: ${level}`);
            return true;
        });
    }
}

// Initialize BrowserUtils first
if (!BrowserUtils.init()) {
    console.error('Failed to initialize BrowserUtils');
    throw new Error('Cannot initialize application without browser environment');
}

// Initialize app
JAPVOC.init();
