(() => {
  // Sticky nav elevation shadow on scroll
  const headerBar = document.querySelector('.site-header-bar');
  if (headerBar) {
    const onScroll = () => {
      if (window.scrollY > 12) {
        headerBar.classList.add('is-scrolled');
      } else {
        headerBar.classList.remove('is-scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Celebrant Interactive Tribute Panels & Circular Avatar Nav
  const celebrantNavItems = Array.from(document.querySelectorAll('.celebrant-nav-item'));
  const tributePanels = Array.from(document.querySelectorAll('.tribute-panel'));
  const heroCards = Array.from(document.querySelectorAll('.hero-card'));
  const viewTributeBtns = Array.from(document.querySelectorAll('.view-tribute-btn'));

  const activateCelebrant = (targetId, shouldScroll = false) => {
    if (!targetId) return;

    // 1. Update circular navigation tabs
    celebrantNavItems.forEach((tab) => {
      const isMatch = tab.dataset.target === targetId;
      tab.classList.toggle('is-active', isMatch);
      tab.setAttribute('aria-selected', isMatch ? 'true' : 'false');
      tab.setAttribute('tabindex', isMatch ? '0' : '-1');
    });

    // 2. Update hero card buttons
    viewTributeBtns.forEach((btn) => {
      const isMatch = btn.dataset.target === targetId;
      btn.setAttribute('aria-expanded', isMatch ? 'true' : 'false');
    });

    // 3. Update tribute panels
    let targetPanel = null;
    tributePanels.forEach((panel) => {
      const isMatch = panel.id === targetId;
      if (isMatch) {
        targetPanel = panel;
        panel.removeAttribute('hidden');
        panel.classList.add('is-active');
        panel.setAttribute('aria-hidden', 'false');
      } else {
        panel.setAttribute('hidden', '');
        panel.classList.remove('is-active');
        panel.setAttribute('aria-hidden', 'true');
      }
    });

    // 4. Smooth scroll to tribute section with sticky header offset if triggered by user
    if (shouldScroll && targetPanel) {
      const celebrantsSection = document.getElementById('celebrants');
      if (celebrantsSection) {
        const headerHeight = headerBar ? headerBar.getBoundingClientRect().height : 70;
        const targetTop = celebrantsSection.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
        window.scrollTo({
          top: targetTop,
          behavior: 'smooth'
        });
      }
    }
  };

  // Wire up circular navigation buttons
  celebrantNavItems.forEach((btn, index) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      activateCelebrant(btn.dataset.target, false);
      btn.focus();
    });

    // Keyboard support for WAI-ARIA tabs (ArrowLeft, ArrowRight, Home, End)
    btn.addEventListener('keydown', (e) => {
      let targetIndex = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        targetIndex = (index + 1) % celebrantNavItems.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        targetIndex = (index - 1 + celebrantNavItems.length) % celebrantNavItems.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        targetIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        targetIndex = celebrantNavItems.length - 1;
      }

      if (targetIndex >= 0) {
        const targetBtn = celebrantNavItems[targetIndex];
        targetBtn.focus();
        activateCelebrant(targetBtn.dataset.target, false);
      }
    });
  });

  // Wire up hero card buttons & card click
  heroCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      // Don't duplicate if button itself was clicked directly
      const targetId = card.dataset.target;
      activateCelebrant(targetId, true);
    });
  });

  viewTributeBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetId = btn.dataset.target;
      activateCelebrant(targetId, true);
    });
  });

  // Wire up "Return to Honourees" links with smooth offset scrolling
  const returnLinks = Array.from(document.querySelectorAll('.return-link'));
  returnLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const selectionRegion = document.getElementById('celebrants-select') || document.getElementById('top');
      if (selectionRegion) {
        const headerHeight = headerBar ? headerBar.getBoundingClientRect().height : 70;
        const targetTop = selectionRegion.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
        window.scrollTo({
          top: targetTop,
          behavior: 'smooth'
        });
        selectionRegion.focus?.();
      }
    });
  });

  // Check URL hash on initial load (e.g. #celebrant-akintayo)
  const initialHash = window.location.hash.replace('#', '');
  if (['celebrant-akinwale', 'celebrant-akintayo', 'celebrant-adedeji'].includes(initialHash)) {
    activateCelebrant(initialHash, false);
  }

  // ==========================================================================
  // Official Mastered Tribute Audio Player Engine
  // ==========================================================================
  const audio = document.getElementById('tribute-audio');
  const audioStatus = document.getElementById('audio-status');
  const floatingPlayer = document.getElementById('floating-player');
  const floatingPlayBtn = document.getElementById('floating-play-btn');
  const playIconSvg = document.getElementById('play-icon-svg');
  const pauseIconSvg = document.getElementById('pause-icon-svg');
  const sectionPlayBtn = document.getElementById('section-play-btn');

  const timeCurrent = document.getElementById('time-current');
  const timeTotal = document.getElementById('time-total');
  const progressContainer = document.getElementById('progress-container');
  const progressFill = document.getElementById('progress-fill');
  const progressScrubber = document.getElementById('progress-scrubber');

  const volumeBtn = document.getElementById('volume-btn');
  const volHighSvg = document.getElementById('vol-high-svg');
  const volMutedSvg = document.getElementById('vol-muted-svg');
  const volumeSlider = document.getElementById('volume-slider');

  const collapseBtn = document.getElementById('collapse-btn');
  const collapsedPill = document.getElementById('collapsed-pill');
  const pillPlayState = document.getElementById('pill-play-state');

  if (!audio) return;

  // Track fallback state
  let hasFallenBackToMp3 = false;

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Sync UI to playback state
  const updatePlayStateUI = (isPlaying) => {
    if (floatingPlayer) {
      floatingPlayer.classList.toggle('is-playing', isPlaying);
    }

    if (playIconSvg && pauseIconSvg) {
      playIconSvg.style.display = isPlaying ? 'none' : 'block';
      pauseIconSvg.style.display = isPlaying ? 'block' : 'none';
    }

    if (sectionPlayBtn) {
      sectionPlayBtn.classList.toggle('is-playing', isPlaying);
      const icon = sectionPlayBtn.querySelector('.play-icon');
      const text = sectionPlayBtn.querySelector('.btn-text');
      if (icon) icon.textContent = isPlaying ? '❚❚' : '▶';
      if (text) text.textContent = isPlaying ? 'Pause Tribute Music' : 'Play Tribute Music';
    }

    if (pillPlayState) {
      pillPlayState.textContent = isPlaying ? '❚❚' : '▶';
    }

    if (audioStatus) {
      audioStatus.textContent = isPlaying
        ? 'Now Playing · Official Tribute Soundtrack (IDU DFW)'
        : 'Official Mastered Tribute Soundtrack · Tap Play to listen';
    }
  };

  // Fallback handler: switch to MP3 if M4A/AAC decoding fails
  const handleAudioError = (e) => {
    if (!hasFallenBackToMp3) {
      hasFallenBackToMp3 = true;
      console.warn('Audio decoding/source issue encountered with M4A. Activating MP3 fallback...', e);
      audio.src = '/assets/IDUDFW-tribute.mp3';
      audio.load();
    } else {
      console.error('All soundtrack sources failed to load.');
      if (audioStatus) {
        audioStatus.textContent = 'Audio playback currently unavailable. Please verify network access.';
      }
      updatePlayStateUI(false);
    }
  };

  audio.addEventListener('error', handleAudioError, true);
  audio.querySelectorAll('source').forEach((s) => {
    s.addEventListener('error', () => {
      if (s.src.endsWith('.m4a') && !hasFallenBackToMp3) {
        handleAudioError();
      }
    });
  });

  // Toggle Play / Pause
  const togglePlay = () => {
    if (audio.paused) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Playback was not initiated:', err);
          updatePlayStateUI(false);
        });
      }
    } else {
      audio.pause();
    }
  };

  if (floatingPlayBtn) {
    floatingPlayBtn.addEventListener('click', togglePlay);
  }

  if (sectionPlayBtn) {
    sectionPlayBtn.addEventListener('click', togglePlay);
  }

  audio.addEventListener('play', () => updatePlayStateUI(true));
  audio.addEventListener('playing', () => updatePlayStateUI(true));
  audio.addEventListener('pause', () => updatePlayStateUI(false));
  audio.addEventListener('waiting', () => {
    if (audioStatus && !audio.paused) {
      audioStatus.textContent = 'Loading tribute audio...';
    }
  });

  audio.addEventListener('ended', () => {
    updatePlayStateUI(false);
    audio.currentTime = 0;
    if (progressFill) progressFill.style.width = '0%';
    if (progressScrubber) progressScrubber.style.left = '0%';
    if (timeCurrent) timeCurrent.textContent = '0:00';
  });

  // Time & Progress Updates
  const updateDuration = () => {
    if (timeTotal && audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
      timeTotal.textContent = formatTime(audio.duration);
    }
  };

  audio.addEventListener('loadedmetadata', updateDuration);
  audio.addEventListener('durationchange', updateDuration);

  audio.addEventListener('timeupdate', () => {
    const total = audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)
      ? audio.duration
      : 109.36; // fallback to 1:49 known length
    const current = audio.currentTime;
    const pct = Math.min((current / total) * 100, 100);

    if (timeCurrent) timeCurrent.textContent = formatTime(current);
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (progressScrubber) progressScrubber.style.left = `${pct}%`;
    if (progressContainer) {
      progressContainer.setAttribute('aria-valuenow', Math.round(pct).toString());
    }
  });

  // Progress Bar Scrubbing
  let isDraggingProgress = false;

  const seekFromEvent = (e) => {
    if (!progressContainer) return;
    const duration = audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)
      ? audio.duration
      : 109.36;
    const rect = progressContainer.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const targetPct = clickX / rect.width;
    audio.currentTime = targetPct * duration;
    if (timeCurrent) timeCurrent.textContent = formatTime(audio.currentTime);
    if (progressFill) progressFill.style.width = `${targetPct * 100}%`;
    if (progressScrubber) progressScrubber.style.left = `${targetPct * 100}%`;
  };

  if (progressContainer) {
    progressContainer.addEventListener('mousedown', (e) => {
      isDraggingProgress = true;
      seekFromEvent(e);
    });

    progressContainer.addEventListener('touchstart', (e) => {
      isDraggingProgress = true;
      seekFromEvent(e);
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
      if (isDraggingProgress) seekFromEvent(e);
    });

    window.addEventListener('touchmove', (e) => {
      if (isDraggingProgress) seekFromEvent(e);
    }, { passive: true });

    window.addEventListener('mouseup', () => {
      isDraggingProgress = false;
    });

    window.addEventListener('touchend', () => {
      isDraggingProgress = false;
    });

    // Keyboard support for slider
    progressContainer.addEventListener('keydown', (e) => {
      const duration = audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)
        ? audio.duration
        : 109.36;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        audio.currentTime = Math.min(audio.currentTime + 5, duration);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        audio.currentTime = Math.max(audio.currentTime - 5, 0);
      }
    });
  }

  // Volume Controls
  let lastVolume = 1;

  const updateVolumeUI = () => {
    const isMuted = audio.muted || audio.volume === 0;
    if (volHighSvg && volMutedSvg) {
      volHighSvg.style.display = isMuted ? 'none' : 'block';
      volMutedSvg.style.display = isMuted ? 'block' : 'none';
    }
    if (volumeSlider) {
      volumeSlider.value = isMuted ? 0 : audio.volume;
    }
  };

  if (volumeBtn) {
    volumeBtn.addEventListener('click', () => {
      try {
        if (audio.muted || audio.volume === 0) {
          audio.muted = false;
          audio.volume = lastVolume > 0 ? lastVolume : 1;
        } else {
          lastVolume = audio.volume;
          audio.muted = true;
        }
      } catch (err) {
        console.warn('Volume setting error:', err);
      }
      updateVolumeUI();
    });
  }

  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      try {
        const val = parseFloat(e.target.value);
        audio.volume = val;
        audio.muted = val === 0;
        if (val > 0) lastVolume = val;
      } catch (err) {
        console.warn('Volume slider error:', err);
      }
      updateVolumeUI();
    });
  }

  // Collapse / Minimize Player
  if (collapseBtn && collapsedPill) {
    const playerInner = document.querySelector('.floating-player-inner');

    collapseBtn.addEventListener('click', () => {
      if (playerInner) playerInner.style.display = 'none';
      collapsedPill.style.display = 'flex';
    });

    collapsedPill.addEventListener('click', () => {
      collapsedPill.style.display = 'none';
      if (playerInner) playerInner.style.display = 'flex';
    });
  }

  // Autoplay:
  // Attempt autoplay only where the browser permits it.
  // Do not attempt to circumvent browser autoplay restrictions with listeners.
  // If permitted, playback starts; if blocked, the attractive play button remains ready for one tap.
  const attemptAutoplay = () => {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          updatePlayStateUI(true);
        })
        .catch((err) => {
          // Autoplay blocked by browser policy (e.g., NotAllowedError); expected on modern browsers.
          console.info('Autoplay permitted only upon user gesture:', err.name || err.message);
          updatePlayStateUI(false);
        });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attemptAutoplay);
  } else {
    attemptAutoplay();
  }
})();
