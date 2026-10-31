document.addEventListener("DOMContentLoaded", () => {
    // --- Global State ---
    let gameState = {
        progress: {}, // { levelId: stars (1-3) }
        currentLevel: null,
        mistakes: 0,
        currentHintIndex: 0,
        hintPenaltyApplied: false
    };
    let clock;

    // --- DOM Elements ---
    
    const screens = {
        menu: document.getElementById('menu-screen'),
        map: document.getElementById('map-screen'),
        game: document.getElementById('game-screen'),
        rewards: document.getElementById('rewards-screen')
    };

    // Rewards
    const btnRewards = document.getElementById('btn-rewards');
    const btnBackMapFromRewards = document.getElementById('btn-back-map-from-rewards');
    const medalsContainer = document.getElementById('medals-container');

    // Map
    const btnBackMenu = document.getElementById('btn-back-menu');
    const mapStarsEl = document.getElementById('map-stars');
    const mapContainer = document.getElementById('map-container');

    // Dialog
    const dialogOverlay = document.getElementById('dialog-overlay');
    const dialogCharacter = document.getElementById('dialog-character');
    const dialogText = document.getElementById('dialog-text');
    const btnDialogNext = document.getElementById('btn-dialog-next');
    let dialogCallback = null;


    
    // Menu
    const btnStart = document.getElementById('btn-start');
    const btnReset = document.getElementById('btn-reset');
    const totalStarsEl = document.getElementById('total-stars');

    // Game
    const btnBackMap = document.getElementById('btn-back-map');
    const levelsContainer = document.getElementById('levels-container'); // mock if needed, map renders directly now
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

    window.addEventListener('resize', () => {
        if (clock) {
            const newSize = Math.min(window.innerWidth - 40, 300);
            clock.size = newSize;
            clock.render();
            if (gameState.currentLevel) {
               // Restore time
               if (gameState.currentLevel.type === 'read') {
                  clock.setTime(gameState.currentLevel.targetH, gameState.currentLevel.targetM);
               }
            }
        }
    });

        btnStart.addEventListener('click', () => showScreen('map'));
        btnReset.addEventListener('click', () => {
            if (confirm('Точно сбросить весь прогресс?')) {
                gameState.progress = {};
                saveProgress();
                updateMenu();
            }
        });
        btnBackMenu.addEventListener('click', () => showScreen('menu'));

        btnRewards.addEventListener('click', () => showScreen('rewards'));
        btnBackMapFromRewards.addEventListener('click', () => showScreen('map'));
        btnDialogNext.addEventListener('click', () => {
            dialogOverlay.classList.add('hidden');
            if (dialogCallback) dialogCallback();
        });

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
        } else if (screenName === 'rewards') {
            renderRewards();
        }
    }

    function updateMenu() {
        totalStarsEl.textContent = getTotalStars();
    }

    // --- Map Logic ---
    
    function renderMap() {
        mapStarsEl.textContent = getTotalStars();
        mapContainer.innerHTML = '';
        
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", "map-svg");
        svg.setAttribute("viewBox", "0 0 400 1000"); // arbitrary size
        
        // Define zones
        const zones = [
            { name: "Лес", levels: GAME_LEVELS.slice(0, 12), yStart: 100, character: '🦉', greetings: ['У-ху! Добро пожаловать в Лес!', 'Время учиться!'] },
            { name: "Город", levels: GAME_LEVELS.slice(12, 24), yStart: 450, character: '🐈', greetings: ['Мяу! Городские часы сложнее!', 'Не зевай!'] },
            { name: "Замок", levels: GAME_LEVELS.slice(24, 35), yStart: 800, character: '🦇', greetings: ['Добро пожаловать в Замок Времени!', 'Здесь всё точно до минуты!'] }
        ];

        let pathD = "M 200 50 ";
        let isLocked = false;
        
        // Generate path and nodes
        zones.forEach((zone, zIdx) => {
            // Zone title
            const title = document.createElementNS("http://www.w3.org/2000/svg", "text");
            title.setAttribute("x", 200);
            title.setAttribute("y", zone.yStart - 20);
            title.setAttribute("class", "map-zone-title");
            title.textContent = zone.name;
            svg.appendChild(title);

            zone.levels.forEach((level, lIdx) => {
                const totalIndex = GAME_LEVELS.indexOf(level);
                const y = zone.yStart + (lIdx * 25);
                const xOffset = Math.sin(lIdx) * 80;
                const x = 200 + xOffset;
                
                pathD += `L ${x} ${y} `;

                const nodeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
                nodeGroup.setAttribute("transform", `translate(${x},${y})`);
                
                // Unlock logic
                if (totalIndex > 0 && !gameState.progress[GAME_LEVELS[totalIndex-1].id]) {
                    isLocked = true;
                }

                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute("r", 15);
                circle.setAttribute("fill", isLocked ? "#d1d5db" : "#e0e7ff");
                circle.setAttribute("stroke", isLocked ? "#9ca3af" : "var(--primary)");
                circle.setAttribute("stroke-width", "3");
                if (!isLocked) {
                    circle.style.cursor = "pointer";
                    circle.addEventListener('click', () => {
                        showDialog(zone.character, zone.greetings[Math.floor(Math.random()*zone.greetings.length)], () => startLevel(level));
                    });
                    // scale animation
                    circle.addEventListener('mouseover', () => circle.setAttribute('r', 18));
                    circle.addEventListener('mouseout', () => circle.setAttribute('r', 15));
                }
                nodeGroup.appendChild(circle);

                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("dominant-baseline", "central");
                text.setAttribute("font-size", "12");
                text.setAttribute("font-weight", "bold");
                text.setAttribute("fill", isLocked ? "#9ca3af" : "var(--primary-dark)");
                text.textContent = level.id;
                // Pass clicks through text
                text.style.pointerEvents = "none";
                nodeGroup.appendChild(text);

                // Stars
                const starsEarned = gameState.progress[level.id] || 0;
                if (starsEarned > 0) {
                    const starText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    starText.setAttribute("y", 25);
                    starText.setAttribute("text-anchor", "middle");
                    starText.setAttribute("font-size", "10");
                    starText.textContent = '⭐'.repeat(starsEarned);
                    nodeGroup.appendChild(starText);
                }

                svg.appendChild(nodeGroup);
            });
        });

        // Path line behind nodes
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathD);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "#fbbf24");
        path.setAttribute("stroke-width", "8");
        path.setAttribute("stroke-dasharray", "10,5");
        svg.insertBefore(path, svg.firstChild);

        mapContainer.appendChild(svg);
    }
    
    function showDialog(character, text, callback) {
        dialogCharacter.textContent = character;
        dialogText.textContent = text;
        dialogCallback = callback;
        dialogOverlay.classList.remove('hidden');
    }

    
    function renderRewards() {
        medalsContainer.innerHTML = '';
        const zones = [
            { name: "Лес", levels: GAME_LEVELS.slice(0, 12) },
            { name: "Город", levels: GAME_LEVELS.slice(12, 24) },
            { name: "Замок", levels: GAME_LEVELS.slice(24, 35) }
        ];

        let gameTotalStars = 0;
        let gameMaxStars = GAME_LEVELS.length * 3;

        zones.forEach(zone => {
            let totalStars = 0;
            let maxStars = zone.levels.length * 3;
            zone.levels.forEach(l => {
                totalStars += gameState.progress[l.id] || 0;
            });
            gameTotalStars += totalStars;
            
            let medalType = null;
            let medalClass = 'medal-locked';
            let icon = '❓';

            if (totalStars > 0) {
                if (totalStars === maxStars) {
                    medalType = "Золото";
                    medalClass = 'medal-gold';
                    icon = '🥇';
                } else if (totalStars >= maxStars * 0.8) {
                    medalType = "Серебро";
                    medalClass = 'medal-silver';
                    icon = '🥈';
                } else if (totalStars >= maxStars * 0.5) {
                    medalType = "Бронза";
                    medalClass = 'medal-bronze';
                    icon = '🥉';
                }
            }

            const card = document.createElement('div');
            card.className = 'medal-card';
            card.innerHTML = `
                <div class="medal-icon ${medalClass}">${icon}</div>
                <h3>${zone.name}</h3>
                <p>${medalType ? medalType : 'Нет медали'}</p>
                <small>${totalStars} / ${maxStars} ⭐</small>
            `;
            medalsContainer.appendChild(card);
        });
        
        let gameMedalType = null;
        let gameMedalClass = 'medal-locked';
        let gameIcon = '🏆';
        if (gameTotalStars > 0) {
            if (gameTotalStars === gameMaxStars) {
                gameMedalType = "Абсолютный Чемпион (Золото)";
                gameMedalClass = 'medal-gold';
            } else if (gameTotalStars >= gameMaxStars * 0.8) {
                gameMedalType = "Мастер Времени (Серебро)";
                gameMedalClass = 'medal-silver';
            } else if (gameTotalStars >= gameMaxStars * 0.5) {
                gameMedalType = "Ученик (Бронза)";
                gameMedalClass = 'medal-bronze';
            }
        }
        
        const gameCard = document.createElement('div');
        gameCard.className = 'medal-card';
        gameCard.style.gridColumn = "1 / -1";
        gameCard.innerHTML = `
            <div class="medal-icon ${gameMedalClass}">${gameIcon}</div>
            <h3>Вся Игра</h3>
            <p>${gameMedalType ? gameMedalType : 'Нет медали'}</p>
            <small>${gameTotalStars} / ${gameMaxStars} ⭐</small>
        `;
        medalsContainer.appendChild(gameCard);
    }

    // --- Game Logic ---
    function startLevel(level) {
        gameState.currentLevel = level;
        gameState.mistakes = 0;
        gameState.currentHintIndex = 0;
        gameState.hintPenaltyApplied = false;
        
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
        clock.container.style.display = 'block';

        if (level.type === 'read') {
            clock.setInteractive(false);
            clock.setTime(level.targetH, level.targetM);
            readTimeOptionsEl.classList.remove('hidden');
            btnCheck.classList.add('hidden'); // Use options instead of check button
            generateOptions(level);
        } else if (level.type === 'compare') {
            clock.container.style.display = 'none'; // Hide clock for compare
            readTimeOptionsEl.classList.remove('hidden');
            btnCheck.classList.add('hidden');
            generateCompareOptions(level);
        } else if (level.type === 'set') {
            clock.setInteractive(true);
            let h = level.targetH;
            let m = level.targetM;
            // Randomize until it's not the correct answer
            while (h === level.targetH && m === level.targetM) {
                h = Math.floor(Math.random() * 12);
                m = Math.floor(Math.random() * 12) * 5;
            }
            clock.setTime(h, m);
            readTimeOptionsEl.classList.add('hidden');
        } else if (level.type === 'duration') {
            clock.setInteractive(true);
            let h = level.currentH;
            let m = level.currentM;
            clock.setTime(h, m);
            readTimeOptionsEl.classList.add('hidden');
        }
    }

    function generateCompareOptions(level) {
        level.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'btn secondary option-btn';
            btn.textContent = opt;
            btn.addEventListener('click', () => {
                if (opt === level.correctAnswer) {
                    handleCorrect();
                } else {
                    handleWrong();
                    // Don't show options again or wait? Just let handleWrong shake.
                }
            });
            readTimeOptionsEl.appendChild(btn);
        });
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
        const hints = gameState.currentLevel.hints;
        if (!hints || hints.length === 0) return;
        
        if (gameState.currentHintIndex < hints.length) {
            hintTextEl.textContent = hints[gameState.currentHintIndex];
            hintTextEl.classList.remove('hidden');
            gameState.currentHintIndex++;
            
            if (!gameState.hintPenaltyApplied) {
                gameState.mistakes++;
                gameState.hintPenaltyApplied = true;
            }
        }
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
        
        // Show completion dialog if moving to next zone or finishing
        let char = '🦉';
        if (currentIndex === 11) char = '🐈';
        if (currentIndex === 23) char = '🦇';

        if (currentIndex < GAME_LEVELS.length - 1) {
            // Optional: show dialog between zones
            if (currentIndex === 11 || currentIndex === 23) {
                showDialog(char, "Отличная работа! Ты переходишь в новую зону!", () => {
                    startLevel(GAME_LEVELS[currentIndex + 1]);
                });
            } else {
                startLevel(GAME_LEVELS[currentIndex + 1]);
            }
        } else {
            showDialog('👑', "Поздравляем! Ты прошёл все испытания!", () => {
                showScreen('rewards');
            });
        }
    }

});
