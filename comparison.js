(() => {
  const section = document.querySelector('#comparison');
  const media = document.querySelector('#comparisonMedia');
  const videos = [document.querySelector('#comparisonFailure'), document.querySelector('#comparisonSuccess')];
  const taskButtons = document.querySelector('#comparisonTasks');
  const phaseButtons = document.querySelector('#comparisonPhases');
  const playButton = document.querySelector('#comparisonPlay');
  const seek = document.querySelector('#comparisonSeek');
  const time = document.querySelector('#comparisonTime');
  const status = document.querySelector('#comparisonStatus');
  const fullscreen = document.querySelector('#comparisonFullscreen');
  let current = comparisonTasks[0];
  let requested = false, loaded = false, nearby = false, starting = false;
  let generation = 0, animation = 0, pendingSeek = 0, shownPhase = -1;

  const formatTime = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  const setStatus = message => { if (status.textContent !== message) status.textContent = message; };

  function updateButton() {
    playButton.innerHTML = requested ? 'Ⅱ <span>Pause both</span>' : '▶ <span>Play both</span>';
    playButton.setAttribute('aria-label', requested ? 'Pause both comparison videos' : 'Play both comparison videos');
  }

  function refresh() {
    const position = pendingSeek ?? videos[0].currentTime;
    seek.value = position;
    seek.setAttribute('aria-valuetext', `${formatTime(position)} of ${formatTime(current.duration)}`);
    time.textContent = `${formatTime(position)} / ${formatTime(current.duration)}`;
    const index = current.phases.findLastIndex(phase => phase.available && position >= phase.start - .04);
    if (index !== shownPhase) {
      shownPhase = index;
      phaseButtons.querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-current', String(i === index)));
      section.querySelectorAll('.comparison-caption').forEach(caption => caption.classList.toggle('is-current', Number(caption.dataset.phase) === index));
    }
  }

  function pausePair() {
    requested = false;
    videos.forEach(video => video.pause());
    cancelAnimationFrame(animation);
    animation = 0;
    updateButton();
  }

  function ensureLoaded() {
    if (loaded) return;
    loaded = true;
    videos.forEach((video, index) => {
      video.src = `assets/comparison/${current.id}-${index ? 'success' : 'failure'}.mp4`;
      video.preload = 'auto';
      video.load();
    });
  }

  function settleSeek() {
    if (pendingSeek !== null && videos.every(video => video.readyState >= 2 && !video.seeking && Math.abs(video.currentTime - pendingSeek) < .12)) pendingSeek = null;
    refresh();
  }

  function seekPair(position) {
    pendingSeek = Math.max(0, Math.min(position, current.duration - .04));
    ensureLoaded();
    videos.forEach(video => {
      video.pause();
      if (video.readyState >= 1) video.currentTime = pendingSeek;
    });
    refresh();
  }

  function tick() {
    animation = 0;
    if (!requested) return;
    settleSeek();
    if (videos.some(video => video.error)) {
      pausePair();
      setStatus('The video could not be loaded. Choose the task again to retry.');
      return;
    }
    const ready = videos.every(video => video.readyState >= 3 && !video.seeking);
    if (!ready) {
      videos.forEach(video => video.pause());
      setStatus('Loading both videos…');
    } else if (!starting && videos.some(video => video.paused)) {
      starting = true;
      const version = generation;
      Promise.all(videos.map(video => video.play())).then(() => {
        if (generation === version) setStatus('');
      }).catch(error => {
        if (generation === version && requested && error.name !== 'AbortError') {
          pausePair();
          setStatus('Press Play both to start the comparison.');
        }
      }).finally(() => { if (generation === version) starting = false; });
    } else if (!starting && Math.abs(videos[0].currentTime - videos[1].currentTime) > .16) {
      videos[1].currentTime = videos[0].currentTime;
    }
    refresh();
    animation = requestAnimationFrame(tick);
  }

  function playPair() {
    ensureLoaded();
    requested = true;
    document.querySelector('#overviewVideo').pause();
    updateButton();
    if (!animation) animation = requestAnimationFrame(tick);
  }

  function renderCaption(phase, index, side) {
    if (!phase[side]) return '';
    return `<div class="comparison-caption" data-phase="${index}"><h5>Phase ${index + 1} · ${phase.title}</h5><p>${phase[side]}</p>${phase.available ? '' : '<small>Caption only · Video not yet available</small>'}</div>`;
  }

  function selectTask(index) {
    pausePair();
    generation++;
    starting = false;
    loaded = false;
    pendingSeek = 0;
    shownPhase = -1;
    current = comparisonTasks[index];
    setStatus('');
    document.querySelector('#comparisonTaskTitle').textContent = current.title;
    const count = current.phases.filter(phase => phase.available).length;
    document.querySelector('#comparisonPhaseCount').textContent = count === current.phases.length ? `${count} ${count === 1 ? 'phase' : 'phases'}` : `${count} / ${current.phases.length} phases shown`;
    taskButtons.querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(index === i)));
    phaseButtons.innerHTML = current.phases.map((phase, i) => `<button type="button" ${phase.available ? '' : 'disabled'}>Phase ${i + 1} · ${phase.title}${phase.available ? '' : '<small>Caption only</small>'}</button>`).join('');
    phaseButtons.querySelectorAll('button').forEach((button, i) => button.addEventListener('click', () => { seekPair(current.phases[i].start); playPair(); }));
    const availability = document.querySelector('#comparisonAvailability');
    availability.hidden = count === current.phases.length;
    availability.textContent = count === current.phases.length ? '' : 'Only Phase 1 is shown for Grocery Bagging. Failure descriptions for Phases 2 and 3 are included below; their videos are not yet available.';
    document.querySelector('#comparisonFailureCaption').innerHTML = current.phases.map((phase, i) => renderCaption(phase, i, 'failure')).join('');
    document.querySelector('#comparisonSuccessCaption').innerHTML = current.phases.map((phase, i) => renderCaption(phase, i, 'success')).join('');
    videos.forEach((video, i) => {
      video.removeAttribute('src');
      video.preload = 'none';
      video.poster = `assets/comparison/${current.id}-${i ? 'success' : 'failure'}.jpg`;
      video.setAttribute('aria-label', `${current.title}: ${i ? 'successful REPAIR execution' : 'failure case'}`);
      video.load();
    });
    seek.max = current.duration;
    refresh();
    if (nearby) ensureLoaded();
  }

  videos.forEach(video => {
    video.muted = true;
    video.addEventListener('loadedmetadata', () => { if (pendingSeek !== null) video.currentTime = pendingSeek; });
    video.addEventListener('seeked', settleSeek);
    video.addEventListener('canplay', settleSeek);
    video.addEventListener('ended', () => {
      if (requested && video.currentTime >= current.duration - .1) seekPair(0);
    });
  });
  comparisonTasks.forEach((task, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerHTML = `<span>${String(i + 1).padStart(2, '0')}</span>${task.title}`;
    button.addEventListener('click', () => selectTask(i));
    taskButtons.append(button);
  });
  playButton.addEventListener('click', () => requested ? pausePair() : playPair());
  document.querySelector('#comparisonRestart').addEventListener('click', () => { seekPair(0); playPair(); });
  seek.addEventListener('input', () => seekPair(Number(seek.value)));
  fullscreen.hidden = !media.requestFullscreen;
  fullscreen.addEventListener('click', async () => {
    try { if (document.fullscreenElement === media) await document.exitFullscreen(); else await media.requestFullscreen(); }
    catch { setStatus('Full screen is unavailable in this browser.'); }
  });
  document.addEventListener('fullscreenchange', () => {
    const active = document.fullscreenElement === media;
    fullscreen.innerHTML = `⛶ <span>${active ? 'Exit full screen' : 'Full screen'}</span>`;
    fullscreen.setAttribute('aria-label', active ? 'Exit comparison full screen' : 'Show comparison full screen');
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pausePair(); });
  document.querySelector('#overviewVideo').addEventListener('play', pausePair);
  const demoViewer = document.querySelector('#viewer');
  new MutationObserver(() => { if (demoViewer.open) pausePair(); }).observe(demoViewer, { attributes: true, attributeFilter: ['open'] });
  new IntersectionObserver(entries => {
    nearby = entries[0].isIntersecting;
    if (nearby) ensureLoaded(); else pausePair();
  }, { rootMargin: '200px' }).observe(media);
  selectTask(0);
})();
