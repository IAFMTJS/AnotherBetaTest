/* global document */
import { BrowserUtils } from './utils/browser.js';

export class Kanji {
    constructor(app) {
        this.app = app;
        this.state = {
            kanji: [],
            currentKanji: null,
            strokeOrder: null,
            initialized: false,
            level: 'all',
            mode: 'writing'
        };
        this.elements = {
            kanjiList: null,
            kanjiDetails: null,
            levelSelect: null,
            modeSelect: null
        };
    }

    initialize() {
        const html = `
            <div class="kanji-container">
                ${this.generateKanjiControls()}
                <div id="kanjiList"></div>
                <div id="kanjiDetails"></div>
            </div>
        `;

        // Return HTML first
        return html;
    }

    afterInitialize() {
        // Cache DOM elements after HTML is inserted
        this.elements.kanjiList = document.getElementById('kanjiList');
        this.elements.kanjiDetails = document.getElementById('kanjiDetails');
        this.elements.levelSelect = document.querySelector('.level-select');
        this.elements.modeSelect = document.querySelector('.mode-select');

        // Load kanji data
        this.loadKanji();

        // Setup event listeners
        this.setupEventListeners();

        this.state.initialized = true;
    }

    generateKanjiControls() {
        return `
            <h2>Kanji Practice</h2>
            <div class="kanji-controls">
                <button class="start-kanji">
                    <span class="icon">漢</span>
                    Start Practice
                </button>
            </div>
            <div class="kanji-settings">
                <div class="level-selector">
                    <label>Level:</label>
                    <select class="level-select">
                        <option value="all">All Levels</option>
                        <option value="1">Level 1</option>
                        <option value="2">Level 2</option>
                        <option value="3">Level 3</option>
                    </select>
                </div>
                <div class="mode-selector">
                    <label>Mode:</label>
                    <select class="mode-select">
                        <option value="writing">Writing Practice</option>
                        <option value="reading">Reading Practice</option>
                        <option value="meaning">Meaning Practice</option>
                    </select>
                </div>
            </div>
        `;
    }

    loadKanji() {
        const data = this.app.data;
        if (!data) {
            BrowserUtils.getSafeConsole().error('Data not initialized');
            return;
        }

        // Map levels to data sources
        const levelMap = {
            'all': 'all',
            '1': 'level1',
            '2': 'level2',
            '3': 'level3'
        };

        // Get mapped level
        const mappedLevel = levelMap[this.state.level] || 'all';
        
        // Get kanji from data
        let kanjiData = mappedLevel === 'all' 
            ? Object.values(data.kanji).flat()
            : data.kanji[mappedLevel] || [];

        // Filter and process kanji data
        this.state.kanji = kanjiData.map(kanji => ({
            id: kanji.id,
            character: kanji.character,
            strokes: kanji.strokes,
            readings: kanji.readings,
            meaning: kanji.meaning,
            correctCount: kanji.correctCount || 0,
            wrongCount: kanji.wrongCount || 0,
            strokeOrder: kanji.strokeOrder || []
        }));

        this.renderKanjiList();
    }

    renderKanjiList() {
        if (!this.elements.kanjiList || !this.state.kanji) {
            BrowserUtils.getSafeConsole().error('Kanji list element or data not found');
            return;
        }

        const kanjiCards = this.state.kanji.map(kanji => {
            return `
                <div class="kanjiCard" data-id="${kanji.id}">
                    <div class="kanjiCharacter">${kanji.character}</div>
                    <div class="kanjiInfo">
                        <p>Strokes: ${kanji.strokes}</p>
                        <p>Reading: ${kanji.readings[0]}</p>
                        <p>Meaning: ${kanji.meaning}</p>
                    </div>
                    <div class="kanjiProgress">
                        <span>Correct: ${kanji.correctCount || 0}</span>
                        <span>Wrong: ${kanji.wrongCount || 0}</span>
                    </div>
                </div>
            `;
        }).join('');

        this.elements.kanjiList.innerHTML = kanjiCards;
    }

    getStrokeOrderHtml(kanji) {
        if (!kanji.strokeOrder) return '';
        return `
            <div class="stroke-order-container">
                ${kanji.strokeOrder.map((stroke, index) => `
                    <div class="stroke-step">
                        <span class="stroke-number">${index + 1}</span>
                        <div class="stroke-line">${stroke}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    setupEventListeners() {
        if (this.elements.kanjiList) {
            this.elements.kanjiList.addEventListener('click', (e) => {
                const kanjiCard = e.target.closest('.kanjiCard');
                if (kanjiCard) {
                    const kanjiId = parseInt(kanjiCard.dataset.id);
                    const kanji = this.state.kanji.find(k => k.id === kanjiId);
                    if (kanji) {
                        this.showKanjiDetails(kanji);
                    }
                }
            });
        }
    }

    startPractice() {
        const levelSelect = document.querySelector('.level-select');
        const modeSelect = document.querySelector('.mode-select');
        const level = levelSelect ? levelSelect.value : 'all';
        const mode = modeSelect ? modeSelect.value : 'writing';

        // Filter kanji based on level
        let filteredKanji = this.state.kanji;
        if (level !== 'all') {
            filteredKanji = filteredKanji.filter(k => k.level === parseInt(level));
        }

        // Shuffle kanji
        filteredKanji = this.shuffleArray(filteredKanji);

        // Start practice session
        this.state.currentKanji = filteredKanji[0];
        this.updateDisplay(mode);
    }

    updateDisplay(mode) {
        const kanjiDetails = document.getElementById('kanjiDetails');
        if (!kanjiDetails) return;

        const currentKanji = this.state.currentKanji;
        if (!currentKanji) return;

        let displayContent;
        switch(mode) {
            case 'writing':
                displayContent = `
                    <div class="kanji-practice">
                        <div class="kanji-stroke">${currentKanji.character}</div>
                        <div class="stroke-order">
                            ${this.getStrokeOrderHtml(currentKanji)}
                        </div>
                        <div class="kanji-info">
                            <p>Reading: ${currentKanji.readings[0]}</p>
                            <p>Meaning: ${currentKanji.meaning}</p>
                        </div>
                    </div>
                `;
                break;
            case 'reading':
                displayContent = `
                    <div class="kanji-practice">
                        <div class="kanji-stroke">${currentKanji.character}</div>
                        <div class="kanji-info">
                            <p>Reading: ${currentKanji.readings[0]}</p>
                            <p>Meaning: ${currentKanji.meaning}</p>
                        </div>
                    </div>
                `;
                break;
            case 'meaning':
                displayContent = `
                    <div class="kanji-practice">
                        <div class="kanji-stroke">${currentKanji.character}</div>
                        <div class="kanji-info">
                            <p>Meaning: ${currentKanji.meaning}</p>
                            <p>Reading: ${currentKanji.readings[0]}</p>
                        </div>
                    </div>
                `;
                break;
            default:
                displayContent = `
                    <div class="kanji-practice">
                        <div class="kanji-stroke">${currentKanji.character}</div>
                        <div class="kanji-info">
                            <p>Reading: ${currentKanji.readings[0]}</p>
                            <p>Meaning: ${currentKanji.meaning}</p>
                        </div>
                    </div>
                `;
        }

        kanjiDetails.innerHTML = displayContent;
    }

    setLevel(level) {
        this.state.level = level;
        this.startPractice();
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    showStrokeOrder() {
        // Implementation for stroke order animation
    }

    getHTML() {
        return `
            <div class="kanji-container">
                <div class="kanji-controls">
                    <div class="mode-selector">
                        <label>Mode:</label>
                        <select class="mode-select">
                            <option value="writing">Writing Practice</option>
                            <option value="reading">Reading Practice</option>
                            <option value="meaning">Meaning Practice</option>
                        </select>
                    </div>
                </div>
                <div id="kanjiList"></div>
                <div id="kanjiDetails"></div>
            </div>
        `;
    }

    showKanjiDetails(kanji) {
        this.state.currentKanji = kanji;
        
        if (!this.elements.kanjiDetails || !this.state.currentKanji) return;

        const { character, strokes, readings, meaning } = this.state.currentKanji;
        
        this.elements.kanjiDetails.innerHTML = `
            <div class="kanjiDetail">
                <h2>${character}</h2>
                <div class="kanjiInfo">
                    <p>Strokes: ${strokes}</p>
                    <p>Reading: ${readings.join(', ')}</p>
                    <p>Meaning: ${meaning}</p>
                </div>
                <div class="strokeOrder">
                    <canvas id="strokeCanvas"></canvas>
                </div>
            </div>
        `;
    }
}

export default Kanji;
