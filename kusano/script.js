document.querySelectorAll('img[src$=".svg"]').forEach((image) => {
  image.src = image.src.replace(/\.svg(\?.*)?$/, '.jpg');
});

const revealTargets = document.querySelectorAll(
  ".section-heading, .feature-card, .meter, .timeline li, blockquote, .memo, .service-grid span, .poster-card, .danger-copy, .incident-grid article, .case-paper, .case-visual, .panic-tile, .disaster-grid article"
);

revealTargets.forEach((target) => target.classList.add("reveal"));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

revealTargets.forEach((target) => observer.observe(target));

const alarmStyle = document.createElement("style");
alarmStyle.textContent = `
  .alarm-button {
    min-height: 36px;
    padding: 6px 10px;
    border: 2px solid var(--yellow, #ffd42a);
    color: var(--black, #090909);
    background: var(--danger, #ff4d32);
    font: inherit;
    font-size: 12px;
    font-weight: 1000;
    cursor: pointer;
    box-shadow: 0 0 18px rgba(255, 95, 61, 0.45);
    animation: alarmButton 0.9s steps(2, end) infinite;
  }

  .alarm-button.is-on {
    color: var(--danger, #ff4d32);
    background: var(--yellow, #ffd42a);
  }

  @keyframes alarmButton {
    50% {
      transform: scale(1.05);
      filter: brightness(1.35);
    }
  }
`;
document.head.append(alarmStyle);

const fixedAlarm = document.querySelector(".fixed-alarm");
let alarmButton = document.querySelector(".alarm-button");

if (fixedAlarm && !alarmButton) {
  alarmButton = document.createElement("button");
  alarmButton.className = "alarm-button";
  alarmButton.type = "button";
  alarmButton.setAttribute("aria-pressed", "false");
  alarmButton.textContent = "警報ON";
  fixedAlarm.append(alarmButton);
}

let alarmContext;
let alarmTimer;

const playAlarmPulse = () => {
  if (!alarmContext) return;

  const now = alarmContext.currentTime;
  const oscillator = alarmContext.createOscillator();
  const gain = alarmContext.createGain();

  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(880, now);
  oscillator.frequency.setValueAtTime(660, now + 0.18);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.09, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);

  oscillator.connect(gain);
  gain.connect(alarmContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.36);
};

alarmButton?.addEventListener("click", async () => {
  alarmContext ||= new AudioContext();
  await alarmContext.resume();

  const isActive = alarmButton.classList.toggle("is-on");
  alarmButton.setAttribute("aria-pressed", String(isActive));
  alarmButton.textContent = isActive ? "警報OFF" : "警報ON";

  if (isActive) {
    playAlarmPulse();
    alarmTimer = window.setInterval(playAlarmPulse, 760);
  } else {
    window.clearInterval(alarmTimer);
  }
});
