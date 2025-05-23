import { BrowserUtils } from './browser.js';

export class TextToSpeech {
    constructor() {
        this.apiKey = null;
        this.voices = {
            ja: {
                female: 'ja-JP-Standard-A',
                male: 'ja-JP-Standard-B'
            }
        };
    }

    async initialize(apiKey) {
        this.apiKey = apiKey;
        if (!this.apiKey) {
            BrowserUtils.getSafeConsole().error('TTS API key not provided');
            return false;
        }
        return true;
    }

    async convertToSpeech(text, options = {}) {
        if (!this.apiKey) {
            throw new Error('TTS not initialized. Please provide an API key.');
        }

        const defaultOptions = {
            language: 'ja-JP',
            voice: this.voices.ja.female,
            pitch: 0,
            speakingRate: 1
        };

        const settings = { ...defaultOptions, ...options };

        try {
            const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    input: { text },
                    voice: {
                        languageCode: settings.language,
                        name: settings.voice
                    },
                    audioConfig: {
                        audioEncoding: 'MP3',
                        pitch: settings.pitch,
                        speakingRate: settings.speakingRate
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`TTS API error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.audioContent;
        } catch (error) {
            BrowserUtils.getSafeConsole().error('TTS conversion failed:', error);
            throw error;
        }
    }

    async saveAudioFile(audioContent, filename) {
        try {
            // Convert base64 to blob
            const byteCharacters = atob(audioContent);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'audio/mp3' });

            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            BrowserUtils.getSafeConsole().error('Failed to save audio file:', error);
            return false;
        }
    }
} 