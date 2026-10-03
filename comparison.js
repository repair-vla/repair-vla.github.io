(() => {
  function mountComparison({ root, prefix, tasks, videoIds, sideLabels, playerLabel, phaseNames = true, renderCaptions = true }) {
    const section = document.querySelector(root);
    const find = suffix => section.querySelector(`#${prefix}${suffix}`);
    const media = find('Media');
    const videos = videoIds.map(id => section.querySelector(`#${id}`));
    const taskButtons = find('Tasks');
    const phaseButtons = find('Phases');
    const playButton = find('Play');
    const seek = find('Seek');
    const time = find('Time');
    const status = find('Status');
    const fullscreen = find('Fullscreen');
    seek.setAttribute('aria-label', `${playerLabel} playback position`);
    find('Restart').setAttribute('aria-label', `Restart both ${playerLabel} videos`);
    fullscreen.setAttribute('aria-label', `Show ${playerLabel} full screen`);
    let current = tasks[0];
    let requested = false, loaded = false, nearby = false, starting = false;
    let generation = 0, animation = 0, pendingSeek = 0, shownPhase = -1;

    const formatTime = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
    const setStatus = message => { if (status.textContent !== message) status.textContent = message; };

    function updateButton() {
      playButton.innerHTML = requested ? 'Ⅱ <span>Pause both</span>' : '▶ <span>Play both</span>';
      playButton.setAttribute('aria-label', `${requested ? 'Pause' : 'Play'} both ${playerLabel} videos`);
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
        video.src = current.sources?.[index] ?? `assets/comparison/${current.id}-${index ? 'success' : 'failure'}.mp4`;
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
      document.dispatchEvent(new CustomEvent('repair-comparison-play', { detail: prefix }));
      updateButton();
      if (!animation) animation = requestAnimationFrame(tick);
    }

    function renderCaption(phase, index, side) {
      if (!phase[side]) return '';
      return `<div class="comparison-caption" data-phase="${index}"><h6>Phase ${index + 1} · ${phase.title}</h6><p>${phase[side]}</p>${phase.available ? '' : '<small>Caption only · Video not yet available</small>'}</div>`;
    }

    function selectTask(index) {
      pausePair();
      generation++;
      starting = false;
      loaded = false;
      pendingSeek = 0;
      shownPhase = -1;
      current = tasks[index];
      setStatus('');
      find('TaskTitle').textContent = current.title;
      const count = current.phases.filter(phase => phase.available).length;
      find('PhaseCount').textContent = phaseNames ? (count === current.phases.length ? `${count} ${count === 1 ? 'phase' : 'phases'}` : `${count} / ${current.phases.length} phases shown`) : 'Successful rollouts';
      taskButtons?.querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(index === i)));
      phaseButtons.innerHTML = current.phases.map((phase, i) => `<button type="button" ${phase.available ? '' : 'disabled'}>${phaseNames ? `Phase ${i + 1} · ` : ''}${phase.title}${phase.available ? '' : '<small>Caption only</small>'}</button>`).join('');
      phaseButtons.querySelectorAll('button').forEach((button, i) => button.addEventListener('click', () => { seekPair(current.phases[i].start); playPair(); }));
      const availability = find('Availability');
      if (availability) {
        availability.hidden = count === current.phases.length;
        availability.textContent = count === current.phases.length ? '' : 'Only Phase 1 is shown for Grocery Bagging. Failure descriptions for Phases 2 and 3 are included below; their videos are not yet available.';
      }
      if (renderCaptions) {
        find('FailureCaption').innerHTML = current.phases.map((phase, i) => renderCaption(phase, i, 'failure')).join('');
        find('SuccessCaption').innerHTML = current.phases.map((phase, i) => renderCaption(phase, i, 'success')).join('');
      }
      videos.forEach((video, i) => {
        video.removeAttribute('src');
        video.preload = 'none';
        video.poster = current.posters?.[i] ?? `assets/comparison/${current.id}-${i ? 'success' : 'failure'}.jpg`;
        video.setAttribute('aria-label', `${current.title}: ${sideLabels[i]}`);
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
    if (taskButtons) tasks.forEach((task, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.innerHTML = `<span>${String(i + 1).padStart(2, '0')}</span>${task.title}`;
      button.addEventListener('click', () => selectTask(i));
      taskButtons.append(button);
    });
    playButton.addEventListener('click', () => requested ? pausePair() : playPair());
    find('Restart').addEventListener('click', () => { seekPair(0); playPair(); });
    seek.addEventListener('input', () => seekPair(Number(seek.value)));
    fullscreen.hidden = !media.requestFullscreen;
    fullscreen.addEventListener('click', async () => {
      try { if (document.fullscreenElement === media) await document.exitFullscreen(); else await media.requestFullscreen(); }
      catch { setStatus('Full screen is unavailable in this browser.'); }
    });
    document.addEventListener('fullscreenchange', () => {
      const active = document.fullscreenElement === media;
      fullscreen.innerHTML = `⛶ <span>${active ? 'Exit full screen' : 'Full screen'}</span>`;
      fullscreen.setAttribute('aria-label', `${active ? 'Exit' : 'Show'} ${playerLabel} full screen`);
    });
    document.addEventListener('repair-comparison-play', event => { if (event.detail !== prefix) pausePair(); });
    document.addEventListener('visibilitychange', () => { if (document.hidden) pausePair(); });
    document.querySelector('#overviewVideo').addEventListener('play', pausePair);
    const demoViewer = document.querySelector('#viewer');
    new MutationObserver(() => { if (demoViewer.open) pausePair(); }).observe(demoViewer, { attributes: true, attributeFilter: ['open'] });
    new IntersectionObserver(entries => {
      nearby = entries[0].isIntersecting;
      if (nearby) ensureLoaded(); else pausePair();
    }, { rootMargin: '200px' }).observe(media);
    selectTask(0);
  }

  mountComparison({ root: '#sft-comparison', prefix: 'comparison', tasks: comparisonTasks,
    videoIds: ['comparisonFailure', 'comparisonSuccess'], sideLabels: ['SFT failure case', 'successful REPAIR execution'], playerLabel: 'SFT comparison' });
  mountComparison({ root: '#rlt-comparison', prefix: 'rlt', tasks: rltComparisonTasks,
    videoIds: ['rltVideo', 'rltRepairVideo'], sideLabels: ['successful RLT execution', 'successful REPAIR execution'], playerLabel: 'RLT comparison', phaseNames: false, renderCaptions: false });
})();
