let countdown;
let timeLeft = 1500; // 25 minutes default for Pomodoro
let isRunning = false;

// Web Audio API beep
function playAlarmSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Play 3 times
    for (let i = 0; i < 3; i++) {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime + i * 0.3); // 800Hz beep

        gainNode.gain.setValueAtTime(1, audioCtx.currentTime + i * 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.3 + 0.2);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start(audioCtx.currentTime + i * 0.3);
        osc.stop(audioCtx.currentTime + i * 0.3 + 0.2);
    }
}

// DOM Elements
const timeDisplay = document.getElementById('time-left');
const startBtn = document.getElementById('start-btn');
const modeBtns = document.querySelectorAll('.mode-btn');

/**
 * Format and display the number of seconds as MM:SS
 */
function displayTimeLeft(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainderSeconds = seconds % 60;

    // Ensure seconds are always 2 digits (e.g., 09 instead of 9)
    const display = `${minutes}:${remainderSeconds < 10 ? '0' : ''}${remainderSeconds}`;
    timeDisplay.textContent = display;

    // Update the browser tab title as well
    document.title = `${display} - Pomodoro`;
}

/**
 * Toggle the timer between Running and Paused state
 */
function toggleTimer() {
    if (isRunning) {
        // Pause logic
        clearInterval(countdown);
        startBtn.textContent = 'START';
        isRunning = false;
        return;
    }

    // Start logic
    isRunning = true;
    startBtn.textContent = 'PAUSE';

    countdown = setInterval(() => {
        timeLeft--;
        displayTimeLeft(timeLeft);

        // When timer hits 0
        if (timeLeft <= 0) {
            clearInterval(countdown);
            isRunning = false;
            startBtn.textContent = 'START';

            // Play the alarm sound using Web Audio API
            playAlarmSound();

            // Wait a bit to finish rendering 00:00 and allow sound to start, then alert
            setTimeout(() => {
                alert("Time's up!");
            }, 500);
        }
    }, 1000); // Trigger every 1 second (1000 ms)
}

/**
 * Switch between Pomodoro, Short Break, and Long Break
 */
function setMode(event) {
    // If a timer was running, pause it when switching modes
    clearInterval(countdown);
    isRunning = false;
    startBtn.textContent = 'START';

    // Remove 'active' class from all buttons, then add to the clicked one
    modeBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Retrieve the target mode time (in seconds) from the data-time attribute
    const seconds = parseInt(event.target.dataset.time, 10);
    timeLeft = seconds;

    // Immediately update the visual clock to match the new mode
    displayTimeLeft(timeLeft);
}

// Attach Event Listeners
startBtn.addEventListener('click', toggleTimer);

modeBtns.forEach(btn => {
    btn.addEventListener('click', setMode);
});

// Initialize display immediately on page load
displayTimeLeft(timeLeft);

// Background illustration mouse follow effect
const illustration = document.querySelector('.bg-illustration');
document.addEventListener('mousemove', (e) => {
    // Subtle parallax: move icon based on mouse position
    const moveX = (e.clientX - window.innerWidth / 2) / 40;
    const moveY = (e.clientY - window.innerHeight / 2) / 40;
    illustration.style.transform = `translate(${moveX}px, ${moveY}px)`;
});
