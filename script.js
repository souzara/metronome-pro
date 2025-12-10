class Metronome {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.currentBeatInBar = 0;
        this.beatsPerBar = 4;
        this.tempo = 120;
        this.lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)
        this.scheduleAheadTime = 0.1; // Back to standard 0.1s
        this.nextNoteTime = 0.0; // when the next note is due.
        this.timerID = null;
        this.notesInQueue = []; // the notes that have been put into the web audio, and may or may not have played yet. {note, time}
        this.soundType = 'digital'; // digital, click, woodblock

        // UI Elements
        this.bpmDisplay = document.getElementById('bpm-value');
        this.bpmSlider = document.getElementById('bpm-slider');
        this.decreaseBpmBtn = document.getElementById('decrease-bpm');
        this.increaseBpmBtn = document.getElementById('increase-bpm');
        this.beatsDisplay = document.getElementById('beats-display');
        this.decreaseBeatsBtn = document.getElementById('decrease-beats');
        this.increaseBeatsBtn = document.getElementById('increase-beats');
        this.startStopBtn = document.getElementById('start-stop-btn');
        this.visualizerContainer = document.querySelector('.visualizer');

        this.tapBtn = document.getElementById('tap-btn');
        this.soundSelect = document.getElementById('sound-type');
        this.accentToggle = document.getElementById('accent-toggle');
        this.metronomeInterface = document.querySelector('.metronome-interface');

        this.tapTimes = [];
        this.isAccentEnabled = true;

        // Training Mode
        this.trainingPanel = document.getElementById('training-panel');
        this.collapseTrainingBtn = document.getElementById('collapse-training');
        this.trainingToggleBtn = document.getElementById('training-toggle-btn');
        this.sessionTimerToggle = document.getElementById('session-timer-toggle');
        this.sessionDurationInput = document.getElementById('session-duration');
        this.timerDisplay = document.getElementById('timer-display');
        this.bpmProgressionToggle = document.getElementById('bpm-progression-toggle');
        this.startBpmInput = document.getElementById('start-bpm');
        this.endBpmInput = document.getElementById('end-bpm');
        this.intervalTimeInput = document.getElementById('interval-time');
        this.bpmIncrementInput = document.getElementById('bpm-increment');
        this.bpmProgressBar = document.getElementById('bpm-progress');
        this.bpmProgressText = document.getElementById('bpm-progress-text');
        this.barCountDisplay = document.getElementById('bar-count');
        this.elapsedTimeDisplay = document.getElementById('elapsed-time');

        this.trainingMode = {
            sessionEnabled: false,
            sessionDuration: 5,
            sessionRemaining: 0,
            sessionInterval: null,
            bpmProgressionEnabled: false,
            startBpm: 60,
            endBpm: 120,
            intervalSeconds: 60,
            bpmIncrement: 5,
            lastBpmIncrease: 0,
            barCount: 0,
            startTime: 0
        };

        this.initEventListeners();
        this.updateVisualizerDots();


    }

    initEventListeners() {


        this.startStopBtn.addEventListener('click', () => this.startStop());

        this.tapBtn.addEventListener('click', () => this.handleTap());

        this.soundSelect.addEventListener('change', (e) => {
            this.soundType = e.target.value;
        });

        this.accentToggle.addEventListener('change', (e) => {
            this.isAccentEnabled = e.target.checked;
        });

        this.bpmSlider.addEventListener('input', (e) => {
            this.tempo = parseInt(e.target.value);
            this.updateBpmDisplay();
        });

        this.decreaseBpmBtn.addEventListener('click', () => {
            if (this.tempo > 40) {
                this.tempo--;
                this.updateBpmDisplay();
                this.bpmSlider.value = this.tempo;
            }
        });

        this.increaseBpmBtn.addEventListener('click', () => {
            if (this.tempo < 300) {
                this.tempo++;
                this.updateBpmDisplay();
                this.bpmSlider.value = this.tempo;
            }
        });

        this.decreaseBeatsBtn.addEventListener('click', () => {
            if (this.beatsPerBar > 1) {
                this.beatsPerBar--;
                this.beatsDisplay.textContent = this.beatsPerBar;
                this.updateVisualizerDots();
            }
        });

        this.increaseBeatsBtn.addEventListener('click', () => {
            if (this.beatsPerBar < 12) {
                this.beatsPerBar++;
                this.beatsDisplay.textContent = this.beatsPerBar;
                this.updateVisualizerDots();
            }
        });

        // Training Mode Event Listeners
        this.collapseTrainingBtn.addEventListener('click', () => this.toggleTrainingPanel());
        this.trainingToggleBtn.addEventListener('click', () => this.toggleTrainingPanel());

        this.sessionTimerToggle.addEventListener('change', (e) => {
            this.trainingMode.sessionEnabled = e.target.checked;
        });

        this.sessionDurationInput.addEventListener('change', (e) => {
            this.trainingMode.sessionDuration = parseInt(e.target.value);
        });

        this.bpmProgressionToggle.addEventListener('change', (e) => {
            this.trainingMode.bpmProgressionEnabled = e.target.checked;
        });

        this.startBpmInput.addEventListener('change', (e) => {
            this.trainingMode.startBpm = parseInt(e.target.value);
        });

        this.endBpmInput.addEventListener('change', (e) => {
            this.trainingMode.endBpm = parseInt(e.target.value);
        });

        this.intervalTimeInput.addEventListener('change', (e) => {
            this.trainingMode.intervalSeconds = parseInt(e.target.value);
        });

        this.bpmIncrementInput.addEventListener('change', (e) => {
            this.trainingMode.bpmIncrement = parseInt(e.target.value);
        });
    }

    handleTap() {
        const now = Date.now();

        // Reset if it's been too long since the last tap (e.g., 2 seconds)
        if (this.tapTimes.length > 0 && now - this.tapTimes[this.tapTimes.length - 1] > 2000) {
            this.tapTimes = [];
        }

        this.tapTimes.push(now);

        // Keep only the last 4 taps for better accuracy
        if (this.tapTimes.length > 4) {
            this.tapTimes.shift();
        }

        if (this.tapTimes.length > 1) {
            // Calculate intervals between taps
            let intervals = [];
            for (let i = 1; i < this.tapTimes.length; i++) {
                intervals.push(this.tapTimes[i] - this.tapTimes[i - 1]);
            }

            // Average interval
            const averageInterval = intervals.reduce((a, b) => a + b) / intervals.length;

            // Calculate BPM
            let newBpm = Math.round(60000 / averageInterval);

            // Clamp BPM to limits
            if (newBpm < 40) newBpm = 40;
            if (newBpm > 300) newBpm = 300;

            this.tempo = newBpm;
            this.updateBpmDisplay();
            this.bpmSlider.value = this.tempo;
        }

        // Visual feedback
        this.tapBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.tapBtn.style.transform = 'scale(1)';
        }, 100);
    }

    updateBpmDisplay() {
        this.bpmDisplay.textContent = this.tempo;
    }



    updateVisualizerDots() {
        this.visualizerContainer.innerHTML = '';
        for (let i = 0; i < this.beatsPerBar; i++) {
            const dot = document.createElement('div');
            dot.className = 'beat-indicator';
            dot.id = `beat-${i}`;
            this.visualizerContainer.appendChild(dot);
        }
    }

    nextNote() {
        // Advance current note and time by a 16th note...
        const secondsPerBeat = 60.0 / this.tempo;
        this.nextNoteTime += secondsPerBeat; // Add beat length to last beat time

        this.currentBeatInBar++;
        if (this.currentBeatInBar >= this.beatsPerBar) {
            this.currentBeatInBar = 0;
        }
    }

    scheduleNote(beatNumber, time) {
        // push the note on the queue, even if we're not playing.
        this.notesInQueue.push({ note: beatNumber, time: time });

        const osc = this.audioContext.createOscillator();
        const envelope = this.audioContext.createGain();
        const isStrong = this.isAccentEnabled && (beatNumber % this.beatsPerBar === 0);

        if (this.soundType === 'click') {
            // Mechanical Click
            osc.type = 'square';
            osc.frequency.value = isStrong ? 1500 : 1000;

            envelope.gain.value = 1;
            envelope.gain.setValueAtTime(1, time);
            envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.01);

            osc.connect(envelope);
            envelope.connect(this.audioContext.destination);
            osc.start(time);
            osc.stop(time + 0.01);

        } else if (this.soundType === 'woodblock') {
            // Woodblock (Resonant Sine with Pitch Drop)
            osc.type = 'sine';
            // Start high and drop fast to simulate the "thock"
            const startFreq = isStrong ? 1000 : 800;
            const endFreq = isStrong ? 800 : 600;

            osc.frequency.setValueAtTime(startFreq, time);
            osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.05);

            envelope.gain.value = 1;
            envelope.gain.setValueAtTime(1, time);
            envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

            osc.connect(envelope);
            envelope.connect(this.audioContext.destination);
            osc.start(time);
            osc.stop(time + 0.1);

        } else {
            // Digital (Square Beep - Gamey/Electronic)
            osc.type = 'square';
            osc.frequency.value = isStrong ? 880 : 440; // A5 and A4

            envelope.gain.value = 0.1; // Lower volume for square wave as it's loud
            envelope.gain.setValueAtTime(0.1, time);
            envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

            osc.connect(envelope);
            envelope.connect(this.audioContext.destination);
            osc.start(time);
            osc.stop(time + 0.05);
        }
    }

    scheduler() {
        // while there are notes that will need to play before the next interval, 
        // schedule them and advance the pointer.
        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
            this.scheduleNote(this.currentBeatInBar, this.nextNoteTime);

            // Update bar count when we hit the first beat
            if (this.currentBeatInBar === 0) {
                this.trainingMode.barCount++;
            }

            this.nextNote();
        }

        // Update BPM progression
        this.updateBpmProgression();

        this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
    }

    startStop() {
        if (this.isPlaying) {
            // Stop
            this.isPlaying = false;
            window.clearTimeout(this.timerID);
            this.startStopBtn.textContent = 'Iniciar';
            this.startStopBtn.classList.remove('active');
            this.resetVisuals();

            // Stop training session
            if (this.trainingMode.sessionInterval) {
                clearInterval(this.trainingMode.sessionInterval);
                this.trainingMode.sessionInterval = null;
            }
        } else {
            // Start
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            // Resume context if suspended (browser policy)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            this.isPlaying = true;
            this.currentBeatInBar = 0;
            this.nextNoteTime = this.audioContext.currentTime + 0.05;
            this.startStopBtn.textContent = 'Parar';
            this.startStopBtn.classList.add('active');

            // Start training session
            this.startTrainingSession();

            this.scheduler();
            requestAnimationFrame(() => this.draw());
        }
    }

    resetVisuals() {
        const dots = document.querySelectorAll('.beat-indicator');
        dots.forEach(dot => {
            dot.classList.remove('active');
            dot.classList.remove('strong');
        });
    }

    draw() {
        let currentNote = this.notesInQueue[0];
        const currentTime = this.audioContext.currentTime;

        while (this.notesInQueue.length && currentNote.time < currentTime) {
            currentNote = this.notesInQueue[0];

            // We only want to draw if the note is within a reasonable window of "now"
            // Since we remove notes from the queue, we just check the first one
            if (currentTime >= currentNote.time) {
                const beat = currentNote.note;

                // Visual update
                const dots = document.querySelectorAll('.beat-indicator');
                dots.forEach(d => {
                    d.classList.remove('active');
                    d.classList.remove('strong');
                });

                if (dots[beat]) {
                    if (beat === 0) {
                        dots[beat].classList.add('strong');

                        // Add pulse effect to the main interface
                        this.metronomeInterface.classList.add('pulse-glow');
                        setTimeout(() => {
                            this.metronomeInterface.classList.remove('pulse-glow');
                        }, 100);
                    } else {
                        dots[beat].classList.add('active');
                    }
                }

                this.notesInQueue.splice(0, 1); // remove note from queue
            } else {
                break; // Not time yet
            }
        }

        if (this.isPlaying) {
            requestAnimationFrame(() => this.draw());
        }
    }

    // ========== TRAINING MODE METHODS ==========
    toggleTrainingPanel() {
        this.trainingPanel.classList.toggle('collapsed');
    }

    startTrainingSession() {
        // Initialize session timer
        if (this.trainingMode.sessionEnabled) {
            this.trainingMode.sessionRemaining = this.trainingMode.sessionDuration * 60; // Convert to seconds
            this.updateSessionTimer();
            this.trainingMode.sessionInterval = setInterval(() => {
                this.trainingMode.sessionRemaining--;
                this.updateSessionTimer();

                if (this.trainingMode.sessionRemaining <= 0) {
                    this.endTrainingSession();
                }
            }, 1000);
        }

        // Initialize BPM progression
        if (this.trainingMode.bpmProgressionEnabled) {
            this.tempo = this.trainingMode.startBpm;
            this.bpmSlider.value = this.tempo;
            this.updateBpmDisplay();
            this.trainingMode.lastBpmIncrease = Date.now();
            this.updateBpmProgress();
        }

        // Initialize statistics
        this.trainingMode.barCount = 0;
        this.trainingMode.startTime = Date.now();
        this.updateStatistics();
    }

    endTrainingSession() {
        if (this.trainingMode.sessionInterval) {
            clearInterval(this.trainingMode.sessionInterval);
            this.trainingMode.sessionInterval = null;
        }

        this.startStop(); // Stop the metronome

        // Play a notification sound or alert
        alert('Sessão de treino finalizada!');
    }

    updateSessionTimer() {
        const minutes = Math.floor(this.trainingMode.sessionRemaining / 60);
        const seconds = this.trainingMode.sessionRemaining % 60;
        this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateBpmProgression() {
        if (!this.trainingMode.bpmProgressionEnabled || !this.isPlaying) return;

        const now = Date.now();
        const elapsedSeconds = (now - this.trainingMode.lastBpmIncrease) / 1000;

        if (elapsedSeconds >= this.trainingMode.intervalSeconds) {
            // Increase BPM
            const newBpm = this.tempo + this.trainingMode.bpmIncrement;

            if (newBpm <= this.trainingMode.endBpm) {
                this.tempo = newBpm;
                this.bpmSlider.value = this.tempo;
                this.updateBpmDisplay();
                this.trainingMode.lastBpmIncrease = now;
            }
        }

        this.updateBpmProgress();
    }

    updateBpmProgress() {
        const currentBpm = this.tempo;
        const startBpm = this.trainingMode.startBpm;
        const endBpm = this.trainingMode.endBpm;

        const progress = ((currentBpm - startBpm) / (endBpm - startBpm)) * 100;
        this.bpmProgressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        this.bpmProgressText.textContent = `BPM: ${currentBpm}`;
    }

    updateStatistics() {
        if (!this.isPlaying) return;

        // Update bar count
        this.barCountDisplay.textContent = this.trainingMode.barCount;

        // Update elapsed time
        const elapsed = Math.floor((Date.now() - this.trainingMode.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        this.elapsedTimeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (this.isPlaying) {
            setTimeout(() => this.updateStatistics(), 1000);
        }
    }
}

const metronome = new Metronome();
