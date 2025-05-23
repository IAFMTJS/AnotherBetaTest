import { BrowserUtils } from './utils/browser.js';
import { BaseModule } from './base-module.js';
import { TextToSpeech } from './utils/tts.js';

export class Listening extends BaseModule {
    constructor(app) {
        super(app);
        this.state = {
            exercises: [],
            currentExercise: null,
            audio: null,
            level: 'all',
            initialized: false,
            levelSelect: null,
            playBtn: null,
            pauseBtn: null,
            volumeDown: null,
            volumeUp: null,
            tts: new TextToSpeech(),
            error: null,
            loading: false,
            resources: {
                audioFiles: new Map(),
                loaded: new Set(),
                failed: new Set()
            }
        };

        // Define available levels
        this.levels = {
            all: 'All Levels',
            beginner: 'Beginner',
            intermediate: 'Intermediate',
            advanced: 'Advanced'
        };
    }

    // Helper method to get selectors within the listening container
    getSelectors() {
        const container = BrowserUtils.getDOMElement('.listening-container');
        if (!container) return null;
        
        return {
            level: container.querySelector('.level-select'),
            playBtn: container.querySelector('.play-btn'),
            pauseBtn: container.querySelector('.pause-btn'),
            volumeDown: container.querySelector('.volume-down'),
            volumeUp: container.querySelector('.volume-up'),
            transcript: container.querySelector('.transcript'),
            questions: container.querySelector('.questions')
        };
    }

    // Method to get HTML content
    getHtmlContent() {
        return `
            <div class="listening-container">
                <h2>Listening Practice</h2>
                <div class="listening-controls">
                    <div class="level-selector">
                        <label>Level:</label>
                        <select class="level-select">
                            ${Object.entries(this.levels).map(([key, value]) => 
                                `<option value="${key}" ${key === this.state.level ? 'selected' : ''}>${value}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                <div class="audio-controls">
                    <button class="play-btn" ${this.state.loading ? 'disabled' : ''}>
                        <span class="icon">▶️</span>
                        Play
                    </button>
                    <button class="pause-btn" ${this.state.loading ? 'disabled' : ''}>
                        <span class="icon">⏸️</span>
                        Pause
                    </button>
                    <div class="volume-controls">
                        <button class="volume-down" ${this.state.loading ? 'disabled' : ''}>
                            <span class="icon">🔉</span>
                        </button>
                        <button class="volume-up" ${this.state.loading ? 'disabled' : ''}>
                            <span class="icon">🔊</span>
                        </button>
                    </div>
                </div>
                <div class="exercise-container">
                    <div class="transcript"></div>
                    <div class="questions"></div>
                </div>
                <div class="error-message" style="display: none;"></div>
                <div class="loading-indicator" style="display: none;">
                    <div class="spinner"></div>
                    <p>Loading exercises...</p>
                </div>
            </div>
        `;
    }

    // Main initialization method
    async initialize() {
        try {
            this.state.initialized = false;
            this.state.error = null;
            
            // Validate app and data
            if (!this.app || !this.app.data || !this.app.data.listening) {
                throw new Error('App or listening data not properly initialized');
            }

            // Initialize TTS with API key
            const apiKey = process.env.GOOGLE_TTS_API_KEY;
            if (apiKey) {
                await this.state.tts.initialize(apiKey);
            } else {
                BrowserUtils.getSafeConsole().warn('No TTS API key provided, audio generation will be disabled');
            }
        
            // Cache DOM elements
            const selectors = this.getSelectors();
            if (!selectors) {
                throw new Error('Listening container not found');
            }

            Object.assign(this.state, selectors);
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load initial exercises
            await this.loadExercises();

            // Mark as initialized
            this.state.initialized = true;
            BrowserUtils.getSafeConsole().log('Listening module initialized successfully');

            return true;
        } catch (error) {
            this.handleError(error);
            return false;
        }
    }

    async loadExercises() {
        try {
            this.setLoading(true);
            this.clearError();

            const data = this.app.data;
            if (!data || !data.listening) {
                throw new Error('Listening data not found');
            }

            // Get selected level
            const selectedLevel = this.state.level;
            
            // Get exercises based on level
            let exercises = [];
            
            // Log the available data structure for debugging
            BrowserUtils.getSafeConsole().log('Available listening data:', {
                levels: Object.keys(data.listening),
                selectedLevel
            });

            if (selectedLevel === 'all') {
                // Combine exercises from all levels
                Object.values(data.listening).forEach(levelExercises => {
                    if (Array.isArray(levelExercises)) {
                        exercises = exercises.concat(levelExercises);
                    }
                });
            } else {
                // Get exercises for specific level
                const levelExercises = data.listening[selectedLevel];
                if (Array.isArray(levelExercises)) {
                    exercises = levelExercises;
                } else {
                    BrowserUtils.getSafeConsole().warn(`No exercises array found for level: ${selectedLevel}`);
                }
            }

            // Log the number of exercises found
            BrowserUtils.getSafeConsole().log(`Found ${exercises.length} exercises for level: ${selectedLevel}`);

            if (exercises.length === 0) {
                throw new Error(`No exercises found for level: ${selectedLevel}`);
            }

            // Generate audio files for exercises if TTS is initialized
            const exercisesWithAudio = await Promise.all(exercises.map(async exercise => {
                try {
                    if (!exercise.id || !exercise.difficulty) {
                        BrowserUtils.getSafeConsole().warn('Exercise missing required fields:', exercise);
                        return null;
                    }

                    const audioFile = `audio/${exercise.difficulty}/${exercise.id}.mp3`;
                    const audioExists = await this.checkAudioFileExists(audioFile);
                    
                    if (!audioExists && this.state.tts.isInitialized) {
                        const audioContent = await this.state.tts.convertToSpeech(exercise.transcript);
                        await this.state.tts.saveAudioFile(audioContent, audioFile);
                    }
                    
                    return {
                        ...exercise,
                        audio: audioFile
                    };
                } catch (error) {
                    BrowserUtils.getSafeConsole().error(`Failed to generate audio for exercise ${exercise.id}:`, error);
                    return null;
                }
            }));

            // Filter out any null exercises
            const validExercises = exercisesWithAudio.filter(ex => ex !== null);

            if (validExercises.length === 0) {
                throw new Error('No valid exercises found after processing');
            }

            // Shuffle the exercises
            const shuffledExercises = this.shuffleArray(validExercises);
            
            // Update state with exercises
            this.state.exercises = shuffledExercises;
            
            // Preload audio files
            await this.preloadAudioFiles(shuffledExercises);
            
            // Display the exercises
            this.displayExercises();

            BrowserUtils.getSafeConsole().log(`Successfully loaded ${shuffledExercises.length} exercises for level: ${selectedLevel}`);
        } catch (error) {
            this.handleError(error);
        } finally {
            this.setLoading(false);
        }
    }

    async preloadAudioFiles(exercises) {
        const audioFiles = exercises.map(ex => ex.audio).filter(Boolean);
        
        for (const audioFile of audioFiles) {
            try {
                const audio = new Audio();
                audio.preload = 'metadata';
                
                await new Promise((resolve, reject) => {
                    audio.oncanplaythrough = resolve;
                    audio.onerror = reject;
                    audio.src = audioFile;
                });
                
                this.state.resources.audioFiles.set(audioFile, audio);
                this.state.resources.loaded.add(audioFile);
            } catch (error) {
                this.state.resources.failed.add(audioFile);
                BrowserUtils.getSafeConsole().warn(`Failed to preload audio file: ${audioFile}`);
            }
        }
    }

    // Helper method to check if audio file exists
    async checkAudioFileExists(audioFile) {
        try {
            const response = await fetch(audioFile, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    // Method to start practice
    async startPractice() {
        try {
            if (!this.state.initialized) {
                throw new Error('Listening module not initialized');
            }

            const levelSelect = this.state.levelSelect;
            if (!levelSelect) {
                throw new Error('Level selector not found');
            }

            const level = levelSelect.value;
            this.state.level = level;
            
            await this.loadExercises();

            // Start with the first exercise
            this.state.currentExercise = this.state.exercises[0];
            this.setupAudio();
            this.updateDisplay();
        } catch (error) {
            this.handleError(error);
        }
    }

    // Audio control methods
    playAudio() {
        if (!this.state.audio || !this.state.currentExercise) return;
        
        const audioFile = this.state.currentExercise.audio;
        const preloadedAudio = this.state.resources.audioFiles.get(audioFile);
        
        if (preloadedAudio) {
            this.state.audio = preloadedAudio;
        } else {
            this.state.audio.src = audioFile;
        }
        
        this.state.audio.play().catch(error => {
            this.handleError(new Error('Failed to play audio: ' + error.message));
        });
    }

    pauseAudio() {
        if (!this.state.audio) return;
        this.state.audio.pause();
    }

    adjustVolume(delta) {
        if (!this.state.audio) return;
        const currentVolume = this.state.audio.volume;
        const newVolume = Math.max(0, Math.min(1, currentVolume + delta / 100));
        this.state.audio.volume = newVolume;
    }

    // Utility method to shuffle array
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Setup event listeners
    setupEventListeners() {
        if (this.state.levelSelect) {
            this.state.levelSelect.addEventListener('change', (e) => {
                this.setLevel(e.target.value);
            });
        }

        if (this.state.playBtn) {
            this.state.playBtn.addEventListener('click', () => this.playAudio());
        }

        if (this.state.pauseBtn) {
            this.state.pauseBtn.addEventListener('click', () => this.pauseAudio());
        }

        if (this.state.volumeDown) {
            this.state.volumeDown.addEventListener('click', () => this.adjustVolume(-0.1));
        }

        if (this.state.volumeUp) {
            this.state.volumeUp.addEventListener('click', () => this.adjustVolume(0.1));
        }
    }

    // Display exercises in the UI
    displayExercises() {
        const container = document.querySelector('.exercise-container');
        if (!container) {
            this.handleError(new Error('Exercise container not found'));
            return;
        }

        const transcript = container.querySelector('.transcript');
        const questions = container.querySelector('.questions');

        if (!transcript || !questions) {
            this.handleError(new Error('Transcript or questions elements not found'));
            return;
        }

        if (!this.state.exercises || this.state.exercises.length === 0) {
            transcript.innerHTML = `
                <div class="no-exercises">
                    <p>No exercises available for the selected level: ${this.state.level}</p>
                    <p>Please try selecting a different level.</p>
                </div>
            `;
            questions.innerHTML = '';
            return;
        }

        const currentExercise = this.state.exercises[0];
        if (!currentExercise) {
            this.handleError(new Error('No current exercise available'));
            return;
        }

        // Display transcript
        transcript.innerHTML = `
            <div class="transcript-content">
                <h3>${currentExercise.title}</h3>
                <p class="japanese">${currentExercise.transcript}</p>
                <p class="translation">${currentExercise.translation}</p>
            </div>
        `;

        // Display questions
        if (currentExercise.questions && currentExercise.questions.length > 0) {
            questions.innerHTML = currentExercise.questions.map((question, index) => `
                <div class="question" data-question-id="${question.id}">
                    <h4>Question ${index + 1}</h4>
                    <p>${question.question}</p>
                    <div class="options">
                        ${question.options.map(option => `
                            <button class="option-btn" 
                                    data-answer="${option}" 
                                    data-correct="${option === question.correctAnswer}">
                                ${option}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `).join('');

            // Add click handlers for answer buttons
            questions.querySelectorAll('.option-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    const isCorrect = button.dataset.correct === 'true';
                    button.classList.add(isCorrect ? 'correct' : 'incorrect');
                    
                    // Disable all options after selection
                    const questionDiv = button.closest('.question');
                    questionDiv.querySelectorAll('.option-btn').forEach(btn => {
                        btn.disabled = true;
                        if (btn.dataset.correct === 'true') {
                            btn.classList.add('correct-answer');
                        }
                    });

                    // Show feedback
                    const feedback = document.createElement('div');
                    feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
                    feedback.textContent = isCorrect ? 'Correct!' : 'Incorrect. The correct answer is highlighted.';
                    questionDiv.appendChild(feedback);
                });
            });
        } else {
            questions.innerHTML = '<p>No questions available for this exercise.</p>';
        }

        // Setup audio for the current exercise
        this.setupAudio();
    }

    // Update display based on current state
    updateDisplay() {
        this.displayExercises();
    }

    // Setup audio player
    setupAudio() {
        if (this.state.audio) {
            this.state.audio.remove();
        }

        const audio = new Audio();
        audio.preload = 'metadata';
        this.state.audio = audio;
    }

    setLevel(level) {
        if (this.levels[level]) {
            this.state.level = level;
            this.loadExercises();
        }
    }

    // Error handling methods
    handleError(error) {
        this.state.error = error;
        BrowserUtils.getSafeConsole().error('Listening module error:', error);
        
        const errorElement = document.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = error.message;
            errorElement.style.display = 'block';
        }
    }

    clearError() {
        this.state.error = null;
        const errorElement = document.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    // Loading state management
    setLoading(loading) {
        this.state.loading = loading;
        const loadingElement = document.querySelector('.loading-indicator');
        if (loadingElement) {
            loadingElement.style.display = loading ? 'block' : 'none';
        }
        
        // Update button states
        const buttons = document.querySelectorAll('.play-btn, .pause-btn, .volume-down, .volume-up');
        buttons.forEach(button => {
            button.disabled = loading;
        });
    }

    // Cleanup method
    async cleanup() {
        if (this.state.audio) {
            this.state.audio.pause();
            this.state.audio.remove();
        }
        
        this.state.resources.audioFiles.forEach(audio => {
            audio.pause();
            audio.remove();
        });
        
        this.state.resources.audioFiles.clear();
        this.state.resources.loaded.clear();
        this.state.resources.failed.clear();
        
        this.state.exercises = [];
        this.state.currentExercise = null;
    }
}
