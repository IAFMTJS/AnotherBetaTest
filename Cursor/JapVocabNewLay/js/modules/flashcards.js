/* global document */
import { BaseModule } from './base-module.js';
import { BrowserUtils } from './utils/browser.js';

export class Flashcards extends BaseModule {
    constructor(app) {
        super(app);
        this.state = {
            cards: [],
            currentCard: null,
            isFlipped: false,
            initialized: false,
            category: 'numbers',
            mode: 'reading'
        };
    }

    initialize() {
        this.state.initialized = true;
        
        // Load cards from wordbank
        this.loadCards();
        
        // Return HTML content for the flashcards section
        return `
            <div class="flashcards-container">
                <h2>Flashcards</h2>
                <div class="flashcards-controls">
                    <button class="start-flashcards">
                        <span class="icon">🎴</span>
                        Start Practice
                    </button>
                </div>
                <div class="flashcards-settings">
                    <div class="category-selector">
                        <label>Category:</label>
                        <select class="category-select">
                            <option value="all">All Categories</option>
                            <option value="numbers">Numbers</option>
                            <option value="animals">Animals</option>
                            <option value="food">Food</option>
                            <option value="colors">Colors</option>
                            <option value="phrases">Phrases</option>
                        </select>
                    </div>
                    <div class="mode-selector">
                        <label>Mode:</label>
                        <select class="mode-select">
                            <option value="kanji">Kanji → Reading</option>
                            <option value="reading">Reading → Kanji</option>
                            <option value="meaning">Kanji → Meaning</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Add event listeners for flashcard interactions
        document.querySelector('.start-flashcards')?.addEventListener('click', () => {
            this.startPractice();
        });

        document.querySelector('.deck-select')?.addEventListener('change', (e) => {
            this.setDeck(e.target.value);
        });
    }

    startPractice() {
        // Get current category and mode from UI
        const categorySelect = document.querySelector('.category-select');
        const modeSelect = document.querySelector('.mode-select');
        
        if (!categorySelect || !modeSelect) {
            BrowserUtils.getSafeConsole().error('Category or mode selector not found');
            return;
        }

        const category = categorySelect.value;
        const mode = modeSelect.value;

        // Load cards for the selected category
        this.state.category = category;
        this.loadCards();

        // Start practice session
        if (this.state.cards.length === 0) {
            BrowserUtils.getSafeConsole().error('No cards available for selected category');
            return;
        }

        // Shuffle cards
        const shuffledCards = this.shuffleArray(this.state.cards);
        
        // Start practice session
        this.state.currentCard = shuffledCards[0];
        this.state.isFlipped = false;
        this.state.mode = mode;
        this.updateDisplay();
    }

    updateDisplay() {
        const flashcardDisplay = document.querySelector('.flashcard');
        if (!flashcardDisplay) {
            BrowserUtils.getSafeConsole().error('Flashcard display element not found');
            return;
        }

        const currentCard = this.state.currentCard;
        if (!currentCard) {
            BrowserUtils.getSafeConsole().error('No current card available');
            return;
        }

        let content;
        switch(this.state.mode) {
            case 'reading':
                content = `
                    <div class="flashcard-front">
                        <div class="kanji-character">${currentCard.word}</div>
                    </div>
                    <div class="flashcard-back">
                        <div class="kanji-reading">${currentCard.reading}</div>
                        <div class="kanji-meaning">${currentCard.meaning}</div>
                    </div>
                `;
                break;
        }

        flashcardDisplay.innerHTML = content;
    }

    getInitialDisplay(mode) {
        switch(mode) {
            case 'kanji':
                return '<div class="flashcard-content">Show Kanji</div>';
            case 'reading':
                return '<div class="flashcard-content">Show Reading</div>';
            case 'meaning':
                return '<div class="flashcard-content">Show Meaning</div>';
            default:
                return '<div class="flashcard-content">Show Card</div>';
        }
    }

    getDisplayContent(card, mode) {
        switch(mode) {
            case 'kanji':
                return `<div class="flashcard-content">${card.kanji}</div>`;
            case 'reading':
                return `<div class="flashcard-content">${card.reading}</div>`;
            case 'meaning':
                return `<div class="flashcard-content">${card.meaning}</div>`;
            default:
                return `<div class="flashcard-content">${card.kanji}</div>`;
        }
    }

    flipCard() {
        if (!this.state.currentCard) return;

        this.state.isFlipped = !this.state.isFlipped;
        this.updateDisplay();
    }

    loadCards() {
        const data = this.app.data;
        if (!data) {
            BrowserUtils.getSafeConsole().error('Data not initialized');
            return;
        }

        // Map categories to data sources
        const categoryMap = {
            'all': 'all',
            'numbers': 'numbers',
            'animals': 'animals',
            'food': 'food',
            'colors': 'colors',
            'phrases': 'phrases'
        };

        // Get mapped category
        const mappedCategory = categoryMap[this.state.category] || 'all';
        
        // Get cards from vocabulary data
        let cards = mappedCategory === 'all' 
            ? Object.values(data.vocabulary).flat()
            : data.vocabulary[mappedCategory] || [];

        // Filter out cards that don't have required fields
        this.state.cards = cards.filter(card => 
            card.word && card.reading && card.meaning
        );
    }

    showCard() {
        // Display the flashcard
    }
}
