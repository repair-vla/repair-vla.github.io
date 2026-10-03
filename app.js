const demos = [
  { id: 'dual-peg', title: 'Dual-Arm Peg Insertion', clips: ['dual-peg.mp4', 'dual-peg-02.mp4'], heroStart: 0 },
  { id: 'single-peg', title: 'Single-Arm Peg Insertion', clips: ['single-peg-01.mp4', 'single-peg-02.mp4'], heroStart: 45.6 },
  { id: 'bagging', title: 'Grocery Bagging', clips: ['bagging.mp4'], heroStart: 57.4 },
  { id: 'clean-desk', title: 'Bimanual Table Clearing', clips: ['table-clearing-session.mp4'], heroStart: 115.4 },
  { id: 'pick-place', title: 'Stick Pick-and-Place', clips: ['pick-place-session.mp4'], heroStart: 193.2 },
  { id: 'drawer', title: 'Toy Stowing in a Drawer', clips: ['drawer.mp4'], heroStart: 217.2 }
];
const track = document.querySelector('#track');
const rail = document.querySelector('#marquee');
const viewer = document.querySelector('#viewer');
const full = document.querySelector('#fullVideo');
const motion = document.querySelector('#motion');
const hero = document.querySelector('#heroVideo');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const cards = [];
let paused = reduced.matches, hover = false, dragging = false, last = 0, holdUntil = 0;
let activeDemo = null, activeClip = 0, resumeHero = false;

function safePlay(video) { video.play().catch(() => {}); }
function canPlayCard(state) { return state.visible && !paused && !viewer.open && !document.hidden; }
function loadCard(state) {
  state.video.src = `assets/${state.demo.clips[state.index]}`;
  state.video.dataset.clipIndex = state.index;
  state.counter.textContent = `Recording ${state.index + 1} / ${state.demo.clips.length}`;
  if (canPlayCard(state)) safePlay(state.video);
}

for (let round = 0; round < 2; round++) {
  demos.forEach(demo => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `<button class="video-open" aria-label="Watch ${demo.title}" ${round ? 'tabindex="-1"' : ''}><video muted playsinline preload="none" poster="assets/${demo.id}.jpg" aria-hidden="true"></video><span class="play-icon" aria-hidden="true">▶</span></button><div class="caption"><h3>${demo.title}</h3><span class="recording-position">Recording 1 / ${demo.clips.length}</span></div>`;
    if (round) card.setAttribute('aria-hidden', 'true');
    const state = { demo, video: card.querySelector('video'), counter: card.querySelector('.recording-position'), index: 0, visible: false };
    state.video.muted = true;
    // Advance only when the entire recording has ended; never use a time-based cut.
    state.video.addEventListener('ended', () => {
      state.index = (state.index + 1) % demo.clips.length;
      loadCard(state);
    });
    card.querySelector('button').addEventListener('click', () => openViewer(demo, state.index));
    cards.push(state);
    track.append(card);
  });
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(({ target, isIntersecting }) => {
    const state = cards.find(card => card.video === target);
    state.visible = isIntersecting;
    if (isIntersecting && !target.getAttribute('src')) loadCard(state);
    if (canPlayCard(state)) safePlay(target); else target.pause();
  });
}, { threshold: .15 });
cards.forEach(state => observer.observe(state.video));

function syncMotion() {
  motion.textContent = paused ? '▶' : 'Ⅱ';
  motion.setAttribute('aria-label', paused ? 'Play carousel' : 'Pause carousel');
  motion.setAttribute('aria-pressed', String(paused));
  cards.forEach(state => { if (canPlayCard(state)) safePlay(state.video); else state.video.pause(); });
}
syncMotion();
motion.onclick = () => { paused = !paused; syncMotion(); };
rail.addEventListener('mouseenter', () => { hover = true; });
rail.addEventListener('mouseleave', () => { hover = false; });
rail.addEventListener('focusin', () => { hover = true; });
rail.addEventListener('focusout', () => { hover = false; });
rail.addEventListener('pointerdown', () => { dragging = true; });
window.addEventListener('pointerup', () => { dragging = false; holdUntil = performance.now() + 1800; });
rail.addEventListener('wheel', () => { holdUntil = performance.now() + 2000; }, { passive: true });
function move(direction) {
  holdUntil = performance.now() + 3500;
  const step = track.firstElementChild.getBoundingClientRect().width + 22;
  if (direction < 0 && rail.scrollLeft < 1) rail.scrollLeft = step * demos.length;
  rail.scrollBy({ left: direction * step, behavior: reduced.matches ? 'instant' : 'smooth' });
}
document.querySelector('#prev').onclick = () => move(-1);
document.querySelector('#next').onclick = () => move(1);
function animate(time) {
  if (last && !paused && !hover && !dragging && !viewer.open && !document.hidden && time > holdUntil) {
    rail.scrollLeft += Math.min(time - last, 50) * .026;
    const loop = (track.firstElementChild.getBoundingClientRect().width + 22) * demos.length;
    if (rail.scrollLeft >= loop) rail.scrollLeft -= loop;
  }
  last = time;
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

function playViewerClip(index) {
  activeClip = (index + activeDemo.clips.length) % activeDemo.clips.length;
  full.src = `assets/${activeDemo.clips[activeClip]}`;
  document.querySelector('#clipPosition').textContent = `Recording ${activeClip + 1} / ${activeDemo.clips.length} · Auto-loop`;
  document.querySelector('#clipPrev').disabled = activeDemo.clips.length === 1;
  document.querySelector('#clipNext').disabled = activeDemo.clips.length === 1;
  safePlay(full);
}
function openViewer(demo, index) {
  activeDemo = demo;
  document.querySelector('#videoTitle').textContent = demo.title;
  resumeHero = !hero.paused;
  hero.pause();
  document.querySelector('#overviewVideo').pause();
  viewer.showModal();
  syncMotion();
  playViewerClip(index);
}
full.addEventListener('ended', () => { if (viewer.open) playViewerClip(activeClip + 1); });
document.querySelector('#clipPrev').onclick = () => playViewerClip(activeClip - 1);
document.querySelector('#clipNext').onclick = () => playViewerClip(activeClip + 1);
document.querySelector('#close').onclick = () => viewer.close();
viewer.addEventListener('click', event => {
  if (event.target !== viewer) return;
  const rect = viewer.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) viewer.close();
});
viewer.addEventListener('close', () => {
  full.pause(); full.removeAttribute('src'); full.load(); activeDemo = null;
  syncMotion();
  if (resumeHero) safePlay(hero);
});

const heroPause = document.querySelector('#heroPause');
function heroState() {
  heroPause.innerHTML = hero.paused ? '▶ <span>Play video</span>' : 'Ⅱ <span>Pause video</span>';
  heroPause.setAttribute('aria-label', hero.paused ? 'Play background video' : 'Pause background video');
}
heroPause.onclick = () => { if (hero.paused) safePlay(hero); else hero.pause(); };
hero.addEventListener('play', heroState);
hero.addEventListener('pause', heroState);
hero.addEventListener('timeupdate', () => {
  const index = demos.findLastIndex(demo => hero.currentTime >= demo.heroStart);
  const current = demos[Math.max(index, 0)];
  document.querySelector('#heroTask').textContent = `${current.title} · ${Math.max(index, 0) + 1} / ${demos.length}`;
});
if (reduced.matches) { hero.autoplay = false; hero.pause(); heroState(); }
document.addEventListener('visibilitychange', syncMotion);
