// Mock DOM for simple testing or run in browser
function runTests() {
    let passed = 0;
    let failed = 0;

    function assertEqual(actual, expected, testName) {
        if (actual === expected) {
            console.log(`✅ [PASS] ${testName}`);
            passed++;
        } else {
            console.error(`❌ [FAIL] ${testName} | Expected ${expected}, got ${actual}`);
            failed++;
        }
    }

    console.log("--- Running Tests ---");

    // Test Levels definition
    assertEqual(typeof GAME_LEVELS, 'object', "GAME_LEVELS is defined");
    assertEqual(GAME_LEVELS.length, 32, "GAME_LEVELS has 32 levels");
    
    // Test Clock Instantiation and time setting
    const testContainer = document.getElementById('test-clock') || document.createElement('div');
    const clock = new Clock(testContainer, { interactive: false });
    
    // Initial state
    assertEqual(clock.getTime().hours, 0, "Initial hours is 0 (12)");
    assertEqual(clock.getTime().minutes, 0, "Initial minutes is 0");

    // Test setTime and getTime logic
    clock.setTime(3, 30);
    let time = clock.getTime();
    assertEqual(time.hours, 3, "Hours correctly set to 3");
    assertEqual(time.minutes, 30, "Minutes correctly set to 30");

    clock.setTime(14, 45); // Testing normalize
    time = clock.getTime();
    assertEqual(time.hours, 2, "14 hours normalized to 2");
    assertEqual(time.minutes, 45, "Minutes set to 45");

    clock.setTime(12, 0); // Testing 12
    time = clock.getTime();
    assertEqual(time.hours, 0, "12 hours normalized to 0");
    assertEqual(time.minutes, 0, "Minutes set to 0");

    // Test interaction setting
    clock.setInteractive(true);
    assertEqual(clock.interactive, true, "Clock is interactive");

    console.log(`--- Test Summary: ${passed} passed, ${failed} failed ---`);
    if (failed > 0) {
        throw new Error("Tests failed!");
    }
}

// Run if in browser
if (typeof window !== 'undefined') {
    window.onload = runTests;
}
