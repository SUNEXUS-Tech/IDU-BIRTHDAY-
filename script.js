(() => {
  // ==========================================================================
  // 1. Sticky Navigation Bar Elevation
  // ==========================================================================
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

  // ==========================================================================
  // 2. Celebrant Interactive Tribute Panels & Circular Avatar Navigation
  // ==========================================================================
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

  // Wire up hero card buttons & card clicks
  heroCards.forEach((card) => {
    card.addEventListener('click', () => {
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
  // 3. Centralized Audio Controller Engine
  // ==========================================================================
  const sharedAudioElement = document.getElementById('tribute-audio');
  if (!sharedAudioElement) return;

  const audioController = {
    // Single shared reference to the HTML5 audio element
    audio: sharedAudioElement,
    isPlayPending: false,
    hasFallenBackToMp3: false,
    lastVolume: 1,
    isDraggingProgress: false,

    // Centralized UI elements cache
    elements: {
      audioSection: document.getElementById('tribute-audio-section'),
      audioStatus: document.getElementById('audio-status'),

      // 1. Homepage Play/Pause button
      homePlayBtn: document.getElementById('home-play-btn'),
      homePlaySvg: document.getElementById('home-play-svg'),
      homePauseSvg: document.getElementById('home-pause-svg'),
      homePlayText: document.getElementById('home-play-text'),

      // 2. Celebrate With Us button
      celebrateBtn: document.getElementById('celebrate-btn'),
      celebratePlaySvg: document.getElementById('celebrate-play-svg'),
      celebratePauseSvg: document.getElementById('celebrate-pause-svg'),

      // 3. Floating audio player ("IDU Nov Song")
      floatingShortcut: document.getElementById('floating-music-shortcut'),
      floatingPlayerToggle: document.getElementById('floating-player-toggle'),
      floatingPlaySvg: document.getElementById('floating-play-svg'),
      floatingPauseSvg: document.getElementById('floating-pause-svg'),

      // 4. Navigation Bar circular Play/Pause button
      navMusicBtn: document.getElementById('nav-music-btn'),
      navPlaySvg: document.getElementById('nav-play-svg'),
      navPauseSvg: document.getElementById('nav-pause-svg'),

      // 5. Dedicated in-section player
      sectionPlayBtn: document.getElementById('section-play-btn'),
      sectionPlayIcon: document.getElementById('section-play-icon'),
      sectionPauseIcon: document.getElementById('section-pause-icon'),

      // Scrubbing, timestamps & progress
      timeCurrent: document.getElementById('time-current'),
      timeTotal: document.getElementById('time-total'),
      progressContainer: document.getElementById('progress-container'),
      progressFill: document.getElementById('progress-fill'),
      progressScrubber: document.getElementById('progress-scrubber'),

      // Volume controls
      volumeBtn: document.getElementById('volume-btn'),
      volHighSvg: document.getElementById('vol-high-svg'),
      volMutedSvg: document.getElementById('vol-muted-svg'),
      volumeSlider: document.getElementById('volume-slider')
    },

    // Format seconds to mm:ss
    formatTime(secs) {
      if (isNaN(secs) || secs < 0) return '0:00';
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    },

    // Authoritative check if the audio is currently playing
    isPlaying() {
      return !this.audio.paused && !this.audio.ended && this.audio.currentTime > 0;
    },

    // Update all button icons, labels and classes based on audio state
    updateUI(forcePlayingState) {
      // Authoritatively derive active playing state directly from the HTML5 audio element
      const active = forcePlayingState !== undefined
        ? Boolean(forcePlayingState && !this.audio.paused && !this.audio.ended)
        : Boolean(!this.audio.paused && !this.audio.ended);

      const el = this.elements;

      // 1. Homepage Play/Pause button
      if (el.homePlayBtn) {
        el.homePlayBtn.classList.toggle('is-playing', active);
        el.homePlayBtn.setAttribute('aria-label', active ? 'Pause tribute song' : 'Play tribute song');
      }
      if (el.homePlaySvg && el.homePauseSvg) {
        el.homePlaySvg.style.display = active ? 'none' : 'block';
        el.homePauseSvg.style.display = active ? 'block' : 'none';
      }
      if (el.homePlayText) {
        el.homePlayText.textContent = active ? 'Pause Tribute Song' : 'Play Tribute Song';
      }

      // 2. Celebrate With Us button
      if (el.celebrateBtn) {
        el.celebrateBtn.classList.toggle('is-playing', active);
        el.celebrateBtn.setAttribute('aria-label', active ? 'Pause tribute song' : 'Play tribute song');
      }
      if (el.celebratePlaySvg && el.celebratePauseSvg) {
        el.celebratePlaySvg.style.display = active ? 'none' : 'block';
        el.celebratePauseSvg.style.display = active ? 'block' : 'none';
      }

      // 3. Floating audio player ("IDU Nov Song")
      if (el.floatingShortcut) {
        el.floatingShortcut.classList.toggle('is-playing', active);
      }
      if (el.floatingPlayerToggle) {
        el.floatingPlayerToggle.classList.toggle('is-playing', active);
        el.floatingPlayerToggle.setAttribute('aria-label', active ? 'Pause IDU Nov Song' : 'Play IDU Nov Song');
      }
      if (el.floatingPlaySvg && el.floatingPauseSvg) {
        el.floatingPlaySvg.style.display = active ? 'none' : 'block';
        el.floatingPauseSvg.style.display = active ? 'block' : 'none';
      }

      // 4. Navbar circular Play/Pause button
      if (el.navMusicBtn) {
        el.navMusicBtn.classList.toggle('is-playing', active);
        el.navMusicBtn.setAttribute('aria-label', active ? 'Pause tribute soundtrack' : 'Play tribute soundtrack');
      }
      if (el.navPlaySvg && el.navPauseSvg) {
        el.navPlaySvg.style.display = active ? 'none' : 'block';
        el.navPauseSvg.style.display = active ? 'block' : 'none';
      }

      // 5. Dedicated in-section player
      if (el.audioSection) {
        el.audioSection.classList.toggle('is-playing', active);
      }
      if (el.sectionPlayIcon && el.sectionPauseIcon) {
        el.sectionPlayIcon.style.display = active ? 'none' : 'block';
        el.sectionPauseIcon.style.display = active ? 'block' : 'none';
      }
      if (el.sectionPlayBtn) {
        el.sectionPlayBtn.classList.toggle('is-playing', active);
        el.sectionPlayBtn.setAttribute('aria-label', active ? 'Pause tribute audio' : 'Play tribute audio');
        const text = el.sectionPlayBtn.querySelector('.btn-text');
        if (text) {
          text.textContent = active ? 'Pause Tribute Music' : 'Play Tribute Music';
        }
      }

      // Status text readout
      if (el.audioStatus) {
        if (active) {
          el.audioStatus.textContent = 'Now Playing · Official Tribute Soundtrack (IDU DFW)';
        } else if (this.audio.ended) {
          el.audioStatus.textContent = 'Official Mastered Tribute Soundtrack · Tap Play to listen again';
        } else {
          el.audioStatus.textContent = 'Official Mastered Tribute Soundtrack · Tap Play to listen';
        }
      }
    },

    // Centralized Play/Pause toggle method
    togglePlay() {
      if (this.isPlayPending) return;

      if (this.audio.paused || this.audio.ended) {
        this.isPlayPending = true;

        // If audio track has ended or is at completion, rewind to 0:00
        if (this.audio.ended || (this.audio.duration && !isNaN(this.audio.duration) && this.audio.currentTime >= this.audio.duration)) {
          this.audio.currentTime = 0;
        }

        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.isPlayPending = false;
              this.updateUI(true);
            })
            .catch((err) => {
              this.isPlayPending = false;
              console.warn('Playback initiation error:', err);
              this.updateUI(false);
            });
        } else {
          this.isPlayPending = false;
          this.updateUI(true);
        }
      } else {
        this.audio.pause();
        this.updateUI(false);
      }
    },

    // Centralized reset to 'Play' icon state when track ends
    resetToPlay() {
      this.audio.currentTime = 0;
      this.updateUI(false);

      const el = this.elements;
      if (el.progressFill) el.progressFill.style.width = '0%';
      if (el.progressScrubber) el.progressScrubber.style.left = '0%';
      if (el.timeCurrent) el.timeCurrent.textContent = '0:00';
      if (el.progressContainer) {
        el.progressContainer.setAttribute('aria-valuenow', '0');
      }
      if (el.audioStatus) {
        el.audioStatus.textContent = 'Official Mastered Tribute Soundtrack · Tap Play to listen again';
      }
    },

    // Update volume UI
    updateVolumeUI() {
      const isMuted = this.audio.muted || this.audio.volume === 0;
      const el = this.elements;
      if (el.volHighSvg && el.volMutedSvg) {
        el.volHighSvg.style.display = isMuted ? 'none' : 'block';
        el.volMutedSvg.style.display = isMuted ? 'block' : 'none';
      }
      if (el.volumeSlider) {
        el.volumeSlider.value = isMuted ? 0 : this.audio.volume;
      }
    },

    // Handle M4A decoding fallback to MP3
    handleAudioError(e) {
      if (!this.hasFallenBackToMp3) {
        this.hasFallenBackToMp3 = true;
        console.warn('Audio issue with M4A; activating MP3 fallback...', e);
        this.audio.src = '/assets/IDUDFW-tribute.mp3';
        this.audio.load();
      } else {
        console.error('All soundtrack sources failed to load.');
        if (this.elements.audioStatus) {
          this.elements.audioStatus.textContent = 'Audio playback currently unavailable. Please verify network access.';
        }
        this.updateUI(false);
      }
    },

    // Seek helper for progress bar click / drag
    seekFromEvent(e) {
      const el = this.elements;
      if (!el.progressContainer) return;

      const duration = this.audio.duration && !isNaN(this.audio.duration) && isFinite(this.audio.duration)
        ? this.audio.duration
        : 109.36;

      const rect = el.progressContainer.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const targetPct = clickX / rect.width;

      this.audio.currentTime = targetPct * duration;
      if (el.timeCurrent) el.timeCurrent.textContent = this.formatTime(this.audio.currentTime);
      if (el.progressFill) el.progressFill.style.width = `${targetPct * 100}%`;
      if (el.progressScrubber) el.progressScrubber.style.left = `${targetPct * 100}%`;
    },

    // Initialize all event listeners centrally
    init() {
      const el = this.elements;

      // 1. Wire up click listeners to all 5 Play/Pause buttons
      const controlButtons = [
        el.homePlayBtn,
        el.celebrateBtn,
        el.floatingPlayerToggle,
        el.navMusicBtn,
        el.sectionPlayBtn
      ];

      controlButtons.forEach((btn) => {
        if (btn) {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.togglePlay();
          });
        }
      });

      // 2. Centralized HTML5 audio state listeners
      this.audio.addEventListener('play', () => this.updateUI(true));
      this.audio.addEventListener('playing', () => this.updateUI(true));
      this.audio.addEventListener('pause', () => this.updateUI(false));
      this.audio.addEventListener('waiting', () => {
        if (el.audioStatus && !this.audio.paused && !this.audio.ended) {
          el.audioStatus.textContent = 'Loading tribute audio...';
        }
      });

      // 3. Audio track completion: unconditionally reset all buttons to 'Play' icon state
      this.audio.addEventListener('ended', () => this.resetToPlay());
      this.audio.addEventListener('emptied', () => this.updateUI(false));
      this.audio.addEventListener('abort', () => this.updateUI(false));

      // 4. Source error handlers with fallback
      this.audio.addEventListener('error', (e) => this.handleAudioError(e), true);
      this.audio.querySelectorAll('source').forEach((s) => {
        s.addEventListener('error', () => {
          if (s.src.endsWith('.m4a') && !this.hasFallenBackToMp3) {
            this.handleAudioError();
          }
        });
      });

      // 5. Duration metadata
      const updateDuration = () => {
        if (el.timeTotal && this.audio.duration && !isNaN(this.audio.duration) && isFinite(this.audio.duration)) {
          el.timeTotal.textContent = this.formatTime(this.audio.duration);
        }
      };
      this.audio.addEventListener('loadedmetadata', updateDuration);
      this.audio.addEventListener('durationchange', updateDuration);

      // 6. Timeupdate listener
      this.audio.addEventListener('timeupdate', () => {
        // If track completed, ensure UI resets to 'Play'
        if (this.audio.ended) {
          this.resetToPlay();
          return;
        }

        const total = this.audio.duration && !isNaN(this.audio.duration) && isFinite(this.audio.duration)
          ? this.audio.duration
          : 109.36;
        const current = this.audio.currentTime;

        // Completion guard for edge cases
        if (total > 0 && current >= total - 0.05 && this.audio.paused) {
          this.resetToPlay();
          return;
        }

        const pct = Math.min((current / total) * 100, 100);

        if (el.timeCurrent) el.timeCurrent.textContent = this.formatTime(current);
        if (el.progressFill) el.progressFill.style.width = `${pct}%`;
        if (el.progressScrubber) el.progressScrubber.style.left = `${pct}%`;
        if (el.progressContainer) {
          el.progressContainer.setAttribute('aria-valuenow', Math.round(pct).toString());
        }
      });

      // 7. Interactive seeking on progress container
      if (el.progressContainer) {
        el.progressContainer.addEventListener('mousedown', (e) => {
          this.isDraggingProgress = true;
          this.seekFromEvent(e);
        });

        el.progressContainer.addEventListener('touchstart', (e) => {
          this.isDraggingProgress = true;
          this.seekFromEvent(e);
        }, { passive: true });

        window.addEventListener('mousemove', (e) => {
          if (this.isDraggingProgress) this.seekFromEvent(e);
        });

        window.addEventListener('touchmove', (e) => {
          if (this.isDraggingProgress) this.seekFromEvent(e);
        }, { passive: true });

        window.addEventListener('mouseup', () => {
          this.isDraggingProgress = false;
        });

        window.addEventListener('touchend', () => {
          this.isDraggingProgress = false;
        });

        el.progressContainer.addEventListener('keydown', (e) => {
          const duration = this.audio.duration && !isNaN(this.audio.duration) && isFinite(this.audio.duration)
            ? this.audio.duration
            : 109.36;
          if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            e.preventDefault();
            this.audio.currentTime = Math.min(this.audio.currentTime + 5, duration);
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            e.preventDefault();
            this.audio.currentTime = Math.max(this.audio.currentTime - 5, 0);
          }
        });
      }

      // 8. Volume Controls
      if (el.volumeBtn) {
        el.volumeBtn.addEventListener('click', () => {
          try {
            if (this.audio.muted || this.audio.volume === 0) {
              this.audio.muted = false;
              this.audio.volume = this.lastVolume > 0 ? this.lastVolume : 1;
            } else {
              this.lastVolume = this.audio.volume;
              this.audio.muted = true;
            }
          } catch (err) {
            console.warn('Volume setting error:', err);
          }
          this.updateVolumeUI();
        });
      }

      if (el.volumeSlider) {
        el.volumeSlider.addEventListener('input', (e) => {
          try {
            const val = parseFloat(e.target.value);
            this.audio.volume = val;
            this.audio.muted = val === 0;
            if (val > 0) this.lastVolume = val;
          } catch (err) {
            console.warn('Volume slider error:', err);
          }
          this.updateVolumeUI();
        });
      }

      // 9. Autoplay attempt on load with graceful browser policy handling
      const attemptAutoplay = () => {
        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.updateUI(true);
            })
            .catch((err) => {
              console.info('Autoplay postponed pending user gesture per browser policy:', err.name || err.message);
              this.updateUI(false);
            });
        }
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attemptAutoplay);
      } else {
        attemptAutoplay();
      }
    }
  };

  // Initialize centralized audio controller
  audioController.init();
})();
