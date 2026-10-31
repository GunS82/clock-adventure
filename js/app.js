document.addEventListener("DOMContentLoaded", () => {
    // --- Global State ---
    let gameState = {
        progress: {}, // { levelId: stars (1-3) }
        currentLevel: null,
        mistakes: 0
    };
    let clock;

    // --- DOM Elements ---
    const screens = {
        menu: document.getElementById('menu-screen'),
        map: document.getElementById('map-screen'),
        game: document.getElementById('game-screen')
    };

    // Menu
    const btnStart = document.getElementById('btn-start');
    const btnReset = document.getElementById('btn-reset');
    const totalStarsEl = document.getElementById('total-stars');

    // Map
    const btnBackMenu = document.getElementById('btn-back-menu');
    const mapStarsEl = document.getElementById('map-stars');
    const levelsContainer = document.getElementById('levels-container');

    // Game
    const btnBackMap = document.getElementById('btn-back-map');
    const currentLevelNumEl = document.getElementById('current-level-num');
    const questionTextEl = document.getElementById('question-text');
    const hintTextEl = document.getElementById('hint-text');
    const readTimeOptionsEl = document.getElementById('read-time-options');
    const btnCheck = document.getElementById('btn-check');
    const btnHint = document.getElementById('btn-hint');
    
    // Feedback
    const feedbackOverlay = document.getElementById('feedback-overlay');
    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackStars = document.getElementById('feedback-stars');
    const btnNext = document.getElementById('btn-next');
    const feedbackBox = feedbackOverlay.querySelector('.feedback-box');

    // --- Initialization ---
    init();

    function init() {
        loadProgress();
        setupClock();
        bindEvents();
        updateMenu();
    }

    function loadProgress() {
        const saved = localStorage.getItem('clockAdventureProgress');
        if (saved) {
            try {
                gameState.progress = JSON.parse(saved);
            } catch (e) {
                gameState.progress = {};
            }
        }
    }

    function saveProgress() {
        localStorage.setItem('clockAdventureProgress', JSON.stringify(gameState.progress));
    }

    function getTotalStars() {
        let total = 0;
        for (const stars of Object.values(gameState.progress)) {
            total += stars;
        }
        return total;
    }

    function setupClock() {
        clock = new Clock('clock-container', { size: Math.min(window.innerWidth - 40, 300) });
    }

    function bindEvents() {
        btnStart.addEventListener('click', () => showScreen('map'));
        btnReset.addEventListener('click', () => {
            if (confirm('Точно сбросить весь прогресс?')) {
                gameState.progress = {};
                saveProgress();
                updateMenu();
            }
        });
        btnBackMenu.addEventListener('click', () => showScreen('menu'));
        btnBackMap.addEventListener('click', () => showScreen('map'));
        btnHint.addEventListener('click', showHint);
        btnCheck.addEventListener('click', checkAnswer);
        btnNext.addEventListener('click', handleNextLevel);
    }

    // --- Screen Management ---
    function showScreen(screenName) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        screens[screenName].classList.add('active');

        if (screenName === 'menu') {
            updateMenu();
        } else if (screenName === 'map') {
            renderMap();
        }
    }

    function updateMenu() {
        totalStarsEl.textContent = getTotalStars();
    }

    // --- Map Logic ---
    function renderMap() {
        mapStarsEl.textContent = getTotalStars();
        levelsContainer.innerHTML = '';
        
        // Group by 10s or just flat list, flat list is fine for 32 levels.
        let isLocked = false;
        
        GAME_LEVELS.forEach((level, index) => {
            const btn = document.createElement('div');
            btn.classList.add('level-btn');
            
            // Logic for unlocking: Level 1 is always unlocked. 
            // Level N is unlocked if Level N-1 has at least 1 star.
            if (index > 0 && !gameState.progress[GAME_LEVELS[index-1].id]) {
                isLocked = true;
            }

            if (isLocked) {
                btn.classList.add('locked');
            } else {
                btn.addEventListener('click', () => startLevel(level));
            }

            btn.textContent = level.id;

            const starsEarned = gameState.progress[level.id] || 0;
            if (starsEarned > 0) {
                const starsEl = document.createElement('div');
                starsEl.classList.add('level-stars');
                starsEl.textContent = '⭐'.repeat(starsEarned);
                btn.appendChild(starsEl);
            }

            levelsContainer.appendChild(btn);
        });
    }

    // --- Game Logic ---
    function startLevel(level) {
        gameState.currentLevel = level;
        gameState.mistakes = 0;
        
        currentLevelNumEl.textContent = level.id;
        questionTextEl.textContent = level.question;
        hintTextEl.classList.add('hidden');
        feedbackOverlay.classList.add('hidden');
        feedbackBox.className = 'feedback-box'; // reset classes

        setupLevelUI(level);
        showScreen('game');
    }

    function setupLevelUI(level) {
        readTimeOptionsEl.innerHTML = '';
        btnCheck.classList.remove('hidden');

        if (level.type === 'read') {
            clock.setInteractive(false);
            clock.setTime(level.targetH, level.targetM);
            readTimeOptionsEl.classList.remove('hidden');
            btnCheck.classList.add('hidden'); // Use options instead of check button
            generateOptions(level);
        } else if (level.type === 'set') {
            clock.setInteractive(true);
            // Randomize starting time
            clock.setTime(Math.floor(Math.random() * 12), Math.floor(Math.random() * 12) * 5);
            readTimeOptionsEl.classList.add('hidden');
        } else if (level.type === 'duration') {
            clock.setInteractive(true);
            // Setup current time and let user change it to target
            clock.setTime(level.currentH, level.currentM);
            readTimeOptionsEl.classList.add('hidden');
        }
    }

    function generateOptions(level) {
        // Create 4 options including correct one
        let options = [level.textTime];
        while (options.length < 4) {
            let h = Math.floor(Math.random() * 12) || 12;
            let mVals = [0, 15, 30, 45];
            let m = mVals[Math.floor(Math.random() * mVals.length)];
            let timeStr = `${h}:${m === 0 ? '00' : m}`;
            if (!options.includes(timeStr)) {
                options.push(timeStr);
            }
        }
        
        // Shuffle
        options.sort(() => Math.random() - 0.5);

        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'btn secondary option-btn';
            btn.textContent = opt;
            btn.addEventListener('click', () => {
                if (opt === level.textTime) {
                    handleCorrect();
                } else {
                    handleWrong();
                }
            });
            readTimeOptionsEl.appendChild(btn);
        });
    }

    function showHint() {
        hintTextEl.textContent = gameState.currentLevel.hint;
        hintTextEl.classList.remove('hidden');
        gameState.mistakes++; // Penalize stars for using hint
    }

    function checkAnswer() {
        const level = gameState.currentLevel;
        const current = clock.getTime();

        let isCorrect = false;
        
        // Convert to absolute minutes for easier comparison
        const currentTotal = (current.hours % 12) * 60 + current.minutes;
        const targetTotal = (level.targetH % 12) * 60 + level.targetM;

        if (currentTotal === targetTotal) {
            isCorrect = true;
        }

        if (isCorrect) {
            handleCorrect();
        } else {
            handleWrong();
        }
    }

    function handleCorrect() {
        const stars = Math.max(1, 3 - gameState.mistakes);
        
        // Save progress if better
        const currentRecord = gameState.progress[gameState.currentLevel.id] || 0;
        if (stars > currentRecord) {
            gameState.progress[gameState.currentLevel.id] = stars;
            saveProgress();
        }

        feedbackBox.classList.add('success');
        feedbackBox.classList.remove('error');
        feedbackTitle.textContent = "Отлично!";
        feedbackStars.textContent = '⭐'.repeat(stars);
        btnNext.textContent = "Дальше";
        feedbackOverlay.classList.remove('hidden');
    }

    function handleWrong() {
        gameState.mistakes++;
        
        const gameArea = document.querySelector('.clock-area');
        gameArea.classList.remove('shake');
        void gameArea.offsetWidth; // trigger reflow
        gameArea.classList.add('shake');

        if (gameState.mistakes >= 2 && gameState.currentLevel.type !== 'read') {
             // Encourage to use hint
             btnHint.classList.add('shake');
             setTimeout(() => btnHint.classList.remove('shake'), 500);
        }
    }

    function handleNextLevel() {
        feedbackOverlay.classList.add('hidden');
        
        const currentIndex = GAME_LEVELS.findIndex(l => l.id === gameState.currentLevel.id);
        if (currentIndex < GAME_LEVELS.length - 1) {
            startLevel(GAME_LEVELS[currentIndex + 1]);
        } else {
            showScreen('map');
            alert('Поздравляем! Вы прошли все уровни!');
        }
    }
});
