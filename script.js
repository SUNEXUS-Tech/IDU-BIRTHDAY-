/**
 * IDU Dallas–Fort Worth November Birthday Tribute
 * Unified Client Application Engine & Persistent Audio Architecture
 */
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
  // 2. Dynamic Copyright Year Initializer
  // ==========================================================================
  const initDynamicYear = () => {
    const currentYear = new Date().getFullYear();
    document.querySelectorAll('.current-year').forEach((el) => {
      el.textContent = currentYear;
    });
  };

  // ==========================================================================
  // 3. Persistent Authoritative Audio Controller
  // ==========================================================================
  const sharedAudioElement = document.getElementById('tribute-audio');
  if (!sharedAudioElement) return;

  const audioController = {
    // Single shared reference to the persistent HTML5 audio element
    audio: sharedAudioElement,
    isPlayPending: false,
    hasFallenBackToMp3: false,
    lastVolume: 1,
    isDraggingProgress: false,
    elements: {},

    // Format seconds to mm:ss
    formatTime(secs) {
      if (isNaN(secs) || secs < 0) return '0:00';
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    },

    // Authoritative check if the audio is currently actively playing
    isPlaying() {
      return !this.audio.paused && !this.audio.ended && this.audio.currentTime > 0;
    },

    // Cache current DOM elements across route changes
    cacheElements() {
      this.elements = {
        audioSection: document.getElementById('tribute-audio-section'),
        audioStatus: document.getElementById('audio-status'),

        // 1. Celebrate With Us button
        celebrateBtn: document.getElementById('celebrate-btn'),
        celebratePlaySvg: document.getElementById('celebrate-play-svg'),
        celebratePauseSvg: document.getElementById('celebrate-pause-svg'),

        // 2. Floating audio player ("IDU Nov Song")
        floatingShortcut: document.getElementById('floating-music-shortcut'),
        floatingPlayerToggle: document.getElementById('floating-player-toggle'),
        floatingPlaySvg: document.getElementById('floating-play-svg'),
        floatingPauseSvg: document.getElementById('floating-pause-svg'),

        // 3. Navigation Bar circular Play/Pause button
        navMusicBtn: document.getElementById('nav-music-btn'),
        navPlaySvg: document.getElementById('nav-play-svg'),
        navPauseSvg: document.getElementById('nav-pause-svg'),

        // 4. Dedicated in-section player
        sectionPlayBtn: document.getElementById('section-play-btn'),
        sectionPlayIcon: document.getElementById('section-play-icon'),
        sectionPauseIcon: document.getElementById('section-pause-icon'),

        // Scrubbing, timestamps & progress
        timeCurrent: document.getElementById('time-current'),
        timeTotal: document.getElementById('time-total'),
        progressContainer: document.getElementById('progress-container'),
        progressFill: document.getElementById('progress-fill'),
        progressScrubber: document.getElementById('progress-scrubber'),

        // Equalizer
        sectionEqualizer: document.getElementById('section-equalizer'),

        // Volume controls
        volumeBtn: document.getElementById('volume-btn'),
        volHighSvg: document.getElementById('vol-high-svg'),
        volMutedSvg: document.getElementById('vol-muted-svg'),
        volumeSlider: document.getElementById('volume-slider')
      };
    },

    // Update all button icons, labels and classes based on actual audio element state
    updateUI(forcePlayingState) {
      const active = forcePlayingState !== undefined
        ? Boolean(forcePlayingState && !this.audio.paused && !this.audio.ended)
        : Boolean(!this.audio.paused && !this.audio.ended);

      const el = this.elements;

      // 1. Celebrate With Us button
      if (el.celebrateBtn) {
        el.celebrateBtn.classList.toggle('is-playing', active);
        el.celebrateBtn.setAttribute('aria-label', active ? 'Pause tribute song' : 'Play tribute song');
      }
      if (el.celebratePlaySvg && el.celebratePauseSvg) {
        el.celebratePlaySvg.style.display = active ? 'none' : 'block';
        el.celebratePauseSvg.style.display = active ? 'block' : 'none';
      }

      // 2. Floating audio player ("IDU Nov Song")
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

      // 3. Navbar circular Play/Pause button
      if (el.navMusicBtn) {
        el.navMusicBtn.classList.toggle('is-playing', active);
        el.navMusicBtn.setAttribute('aria-label', active ? 'Pause tribute soundtrack' : 'Play tribute soundtrack');
      }
      if (el.navPlaySvg && el.navPauseSvg) {
        el.navPlaySvg.style.display = active ? 'none' : 'block';
        el.navPauseSvg.style.display = active ? 'block' : 'none';
      }

      // 4. Dedicated in-section player
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
          text.textContent = active ? 'Pause' : 'Play';
        }
      }

      // Equalizer bars
      if (el.sectionEqualizer) {
        el.sectionEqualizer.classList.toggle('is-active', active);
      }

      this.updateProgressUI();
      this.updateVolumeUI();
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
              console.warn('Playback request prevented:', err.name, err.message);

              // Auto-fallback to MP3 source if format decoding error occurred
              if (!this.hasFallenBackToMp3) {
                this.hasFallenBackToMp3 = true;
                this.audio.src = '/assets/IDUDFW-tribute.mp3';
                this.audio.load();
                this.audio.play().catch((e) => {
                  console.warn('MP3 fallback playback attempt:', e.message);
                });
              }
              this.updateUI(false);
            });
        }
      } else {
        this.audio.pause();
        this.updateUI(false);
      }
    },

    // Update progress bar and time readouts
    updateProgressUI() {
      const el = this.elements;
      const current = this.audio.currentTime || 0;
      const duration = this.audio.duration && !isNaN(this.audio.duration) && this.audio.duration > 0
        ? this.audio.duration
        : 109.36; // 1:49 default known track duration

      if (el.timeCurrent) {
        el.timeCurrent.textContent = this.formatTime(current);
      }
      if (el.timeTotal) {
        el.timeTotal.textContent = this.formatTime(duration);
      }

      if (!this.isDraggingProgress && el.progressFill && el.progressContainer) {
        const pct = Math.min(Math.max((current / duration) * 100, 0), 100);
        el.progressFill.style.width = `${pct}%`;
        if (el.progressScrubber) {
          el.progressScrubber.style.left = `${pct}%`;
        }
        el.progressContainer.setAttribute('aria-valuenow', Math.round(pct).toString());
      }
    },

    // Update volume icon and slider state
    updateVolumeUI() {
      const el = this.elements;
      const isMuted = this.audio.muted || this.audio.volume === 0;

      if (el.volHighSvg && el.volMutedSvg) {
        el.volHighSvg.style.display = isMuted ? 'none' : 'block';
        el.volMutedSvg.style.display = isMuted ? 'block' : 'none';
      }

      if (el.volumeSlider) {
        el.volumeSlider.value = isMuted ? '0' : this.audio.volume.toString();
      }
    },

    // Reset all controls cleanly to the Play state upon track completion
    resetToPlay() {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
      } catch (err) {
        console.warn('Reset rewind error:', err);
      }

      const el = this.elements;

      if (el.progressFill) el.progressFill.style.width = '0%';
      if (el.progressScrubber) el.progressScrubber.style.left = '0%';
      if (el.timeCurrent) el.timeCurrent.textContent = '0:00';
      if (el.progressContainer) el.progressContainer.setAttribute('aria-valuenow', '0');

      this.updateUI(false);
    },

    // Bind event listeners to current page controls
    bindControls() {
      const el = this.elements;

      // 1. Celebrate button
      if (el.celebrateBtn && !el.celebrateBtn.dataset.audioBound) {
        el.celebrateBtn.dataset.audioBound = 'true';
        el.celebrateBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.togglePlay();
        });
      }

      // 2. Floating pill player
      if (el.floatingPlayerToggle && !el.floatingPlayerToggle.dataset.audioBound) {
        el.floatingPlayerToggle.dataset.audioBound = 'true';
        el.floatingPlayerToggle.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.togglePlay();
        });
      }

      // 3. Navbar circular button
      if (el.navMusicBtn && !el.navMusicBtn.dataset.audioBound) {
        el.navMusicBtn.dataset.audioBound = 'true';
        el.navMusicBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.togglePlay();
        });
      }

      // 4. Section Play button
      if (el.sectionPlayBtn && !el.sectionPlayBtn.dataset.audioBound) {
        el.sectionPlayBtn.dataset.audioBound = 'true';
        el.sectionPlayBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.togglePlay();
        });
      }

      // 5. Scrubber & Seek
      if (el.progressContainer && !el.progressContainer.dataset.audioBound) {
        el.progressContainer.dataset.audioBound = 'true';

        const seekFromEvent = (clientX) => {
          const rect = el.progressContainer.getBoundingClientRect();
          const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
          const pct = rect.width > 0 ? offsetX / rect.width : 0;
          const duration = this.audio.duration && !isNaN(this.audio.duration) && this.audio.duration > 0
            ? this.audio.duration
            : 109.36;
          this.audio.currentTime = pct * duration;
          this.updateProgressUI();
        };

        el.progressContainer.addEventListener('mousedown', (e) => {
          this.isDraggingProgress = true;
          seekFromEvent(e.clientX);
          const onMouseMove = (moveEvent) => {
            if (this.isDraggingProgress) seekFromEvent(moveEvent.clientX);
          };
          const onMouseUp = () => {
            this.isDraggingProgress = false;
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
          };
          window.addEventListener('mousemove', onMouseMove);
          window.addEventListener('mouseup', onMouseUp);
        });

        el.progressContainer.addEventListener('touchstart', (e) => {
          if (!e.touches || !e.touches[0]) return;
          this.isDraggingProgress = true;
          seekFromEvent(e.touches[0].clientX);
        }, { passive: true });

        el.progressContainer.addEventListener('touchmove', (e) => {
          if (!this.isDraggingProgress || !e.touches || !e.touches[0]) return;
          seekFromEvent(e.touches[0].clientX);
        }, { passive: true });

        el.progressContainer.addEventListener('touchend', () => {
          this.isDraggingProgress = false;
        }, { passive: true });

        el.progressContainer.addEventListener('keydown', (e) => {
          const duration = this.audio.duration && !isNaN(this.audio.duration) && this.audio.duration > 0
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

      // 6. Volume button & slider
      if (el.volumeBtn && !el.volumeBtn.dataset.audioBound) {
        el.volumeBtn.dataset.audioBound = 'true';
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

      if (el.volumeSlider && !el.volumeSlider.dataset.audioBound) {
        el.volumeSlider.dataset.audioBound = 'true';
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
    },

    // One-time master initialization of persistent audio listeners
    init() {
      this.cacheElements();
      this.bindControls();

      // Audio media element authoritative events (bound once to persistent audio)
      this.audio.addEventListener('play', () => this.updateUI(true));
      this.audio.addEventListener('playing', () => this.updateUI(true));
      this.audio.addEventListener('pause', () => this.updateUI(false));
      this.audio.addEventListener('timeupdate', () => this.updateProgressUI());
      this.audio.addEventListener('ended', () => this.resetToPlay());
      this.audio.addEventListener('emptied', () => this.updateUI(false));
      this.audio.addEventListener('abort', () => this.updateUI(false));
      this.audio.addEventListener('loadedmetadata', () => this.updateProgressUI());

      // Attempt gentle autoplay on initial page load per browser policy
      const attemptAutoplay = () => {
        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.updateUI(true);
            })
            .catch((err) => {
              console.info('Autoplay deferred pending user gesture per browser policy:', err.name || err.message);
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

  // ==========================================================================
  // 4. Photo Gallery Lightbox Modal with Full Carousel & Touch Navigation
  // ==========================================================================
  const bindGalleryLightbox = () => {
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
    const lightboxPrevBtn = document.getElementById('lightbox-prev-btn');
    const lightboxNextBtn = document.getElementById('lightbox-next-btn');

    if (!lightboxModal || !lightboxImg || !lightboxCloseBtn) return;

    let galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
    if (!galleryItems.length) return;

    let currentIndex = 0;
    let lastActiveElement = null;

    const showIndex = (index) => {
      galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
      if (!galleryItems.length) return;

      if (index < 0) {
        currentIndex = galleryItems.length - 1;
      } else if (index >= galleryItems.length) {
        currentIndex = 0;
      } else {
        currentIndex = index;
      }

      const item = galleryItems[currentIndex];
      const img = item.querySelector('img');
      if (!img) return;

      const title = item.getAttribute('data-title') || item.querySelector('.gallery-card-title')?.textContent || '';
      const caption = item.getAttribute('data-caption') || item.querySelector('.gallery-card-desc')?.textContent || img.alt || '';

      lightboxImg.style.opacity = '0.4';
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || title || caption || 'Celebration photograph';

      lightboxImg.onload = () => {
        lightboxImg.style.opacity = '1';
      };

      if (lightboxTitle) {
        if (title) {
          lightboxTitle.textContent = title;
          lightboxTitle.style.display = 'block';
        } else {
          lightboxTitle.textContent = '';
          lightboxTitle.style.display = 'none';
        }
      }

      if (lightboxCaption) {
        lightboxCaption.textContent = caption;
      }

      if (lightboxCounter) {
        lightboxCounter.textContent = `Photo ${currentIndex + 1} of ${galleryItems.length}`;
      }

      if (lightboxPrevBtn && lightboxNextBtn) {
        const hasMultiple = galleryItems.length > 1;
        lightboxPrevBtn.style.display = hasMultiple ? 'flex' : 'none';
        lightboxNextBtn.style.display = hasMultiple ? 'flex' : 'none';
      }
    };

    const openLightbox = (index, triggerEl) => {
      lastActiveElement = triggerEl || document.activeElement;
      showIndex(index);
      lightboxModal.classList.add('is-open');
      lightboxModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lightboxCloseBtn.focus();
    };

    const closeLightbox = () => {
      lightboxModal.classList.remove('is-open');
      lightboxModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
        lastActiveElement.focus();
      }
    };

    galleryItems.forEach((item, idx) => {
      if (item.dataset.lightboxBound) return;
      item.dataset.lightboxBound = 'true';

      const handleTrigger = (e) => {
        e.preventDefault();
        galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
        const realIdx = galleryItems.indexOf(item);
        openLightbox(realIdx !== -1 ? realIdx : idx, item);
      };

      item.addEventListener('click', handleTrigger);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleTrigger(e);
        }
      });
    });

    if (lightboxCloseBtn && !lightboxCloseBtn.dataset.lightboxBound) {
      lightboxCloseBtn.dataset.lightboxBound = 'true';
      lightboxCloseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeLightbox();
      });
    }

    if (lightboxPrevBtn && !lightboxPrevBtn.dataset.lightboxBound) {
      lightboxPrevBtn.dataset.lightboxBound = 'true';
      lightboxPrevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showIndex(currentIndex - 1);
      });
    }

    if (lightboxNextBtn && !lightboxNextBtn.dataset.lightboxBound) {
      lightboxNextBtn.dataset.lightboxBound = 'true';
      lightboxNextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showIndex(currentIndex + 1);
      });
    }

    if (!lightboxModal.dataset.lightboxModalBound) {
      lightboxModal.dataset.lightboxModalBound = 'true';

      lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) {
          closeLightbox();
        }
      });

      // Keyboard navigation (Escape, ArrowLeft, ArrowRight)
      document.addEventListener('keydown', (e) => {
        if (!lightboxModal.classList.contains('is-open')) return;
        if (e.key === 'Escape') {
          e.preventDefault();
          closeLightbox();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          showIndex(currentIndex - 1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          showIndex(currentIndex + 1);
        }
      });

      // Mobile touch swipe gestures
      let touchStartX = 0;
      let touchStartY = 0;

      lightboxModal.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length > 0) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      lightboxModal.addEventListener('touchend', (e) => {
        if (!e.changedTouches || e.changedTouches.length === 0) return;
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
          if (diffX < 0) {
            showIndex(currentIndex + 1); // Swipe left -> Next
          } else {
            showIndex(currentIndex - 1); // Swipe right -> Prev
          }
        }
      }, { passive: true });
    }
  };

  // ==========================================================================
  // 5. Celebrant Feature Card Smooth Navigation & Highlight
  // ==========================================================================
  const checkGalleryEmptyState = () => {
    const gallerySection = document.getElementById('gallery') || document.querySelector('.tribute-gallery-section');
    if (!gallerySection) return;
    const items = gallerySection.querySelectorAll('.gallery-item');
    let emptyState = gallerySection.querySelector('.gallery-empty-state');
    if (items.length === 0) {
      if (!emptyState) {
        emptyState = document.createElement('div');
        emptyState.className = 'gallery-empty-state';
        emptyState.textContent = 'No photographs have been added to this gallery yet. Please check back soon.';
        const grid = gallerySection.querySelector('.gallery-grid, .tribute-personal-gallery-grid');
        if (grid) {
          grid.appendChild(emptyState);
        } else {
          gallerySection.appendChild(emptyState);
        }
      }
      emptyState.style.display = 'block';
    } else if (emptyState) {
      emptyState.style.display = 'none';
    }
  };

  const bindFeatureCardNav = () => {
    const featureCardLinks = Array.from(document.querySelectorAll('a[href*="#celebrant-card-"]'));
    featureCardLinks.forEach((link) => {
      if (link.dataset.navBound) return;
      link.dataset.navBound = 'true';

      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        const hashIdx = href.indexOf('#');
        if (hashIdx !== -1) {
          const hash = href.slice(hashIdx);
          const targetCard = document.querySelector(hash);
          if (targetCard) {
            e.preventDefault();
            targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            try {
              history.pushState(null, '', hash);
            } catch (_) {}
            targetCard.classList.add('is-highlighted');
            setTimeout(() => {
              targetCard.classList.remove('is-highlighted');
            }, 2400);
          }
        }
      });
    });
  };

  // ==========================================================================
  // 6. Persistent Seamless Router for Music Continuity Across Pages
  // ==========================================================================
  const rebindPageContent = () => {
    audioController.cacheElements();
    audioController.bindControls();
    audioController.updateUI();
    audioController.updateProgressUI();
    bindGalleryLightbox();
    checkGalleryEmptyState();
    initDynamicYear();
    bindFeatureCardNav();
    bindThemeToggle();
  };

  const navigatePage = async (urlStr, targetHash, pushHistory = true) => {
    const currentMain = document.querySelector('main');
    if (currentMain) {
      currentMain.classList.add('is-page-transitioning');
    }

    try {
      const res = await fetch(urlStr);
      if (!res.ok) {
        window.location.href = urlStr;
        return;
      }
      const htmlText = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');

      const newMain = doc.querySelector('main');
      if (!newMain || !currentMain) {
        window.location.href = urlStr;
        return;
      }

      // Seamlessly swap only the <main> container; persistent <audio> and <header> are untouched
      currentMain.innerHTML = newMain.innerHTML;
      currentMain.className = newMain.className;
      currentMain.id = newMain.id;

      // Update page metadata and document title
      document.title = doc.title;
      document.body.className = doc.body.className;

      if (pushHistory) {
        window.history.pushState({ url: urlStr }, '', urlStr);
      }

      // Re-bind all page-specific UI components to the persistent audio engine
      rebindPageContent();

      // Handle scrolling to anchor or top of the page
      if (targetHash) {
        setTimeout(() => {
          const targetEl = document.querySelector(targetHash);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            if (targetHash.startsWith('#celebrant-card-')) {
              targetEl.classList.add('is-highlighted');
              setTimeout(() => {
                targetEl.classList.remove('is-highlighted');
              }, 2400);
            } else if (targetHash === '#gallery') {
              targetEl.classList.add('is-highlighted');
              setTimeout(() => {
                targetEl.classList.remove('is-highlighted');
              }, 2400);
            }
          }
        }, 50);
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    } catch (err) {
      console.warn('Seamless navigation error, using standard page load:', err);
      window.location.href = urlStr;
    } finally {
      if (currentMain) {
        currentMain.classList.remove('is-page-transitioning');
      }
    }
  };

  const initPageRouter = () => {
    document.addEventListener('click', (e) => {
      // Allow new tab open with middle click or modifier keys
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Ignore protocols, mailto, tel, whatsapp or external links
      if (
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('https://wa.me/') ||
        link.target === '_blank'
      ) {
        return;
      }

      const targetUrl = new URL(href, window.location.href);

      // Ignore external origin domains
      if (targetUrl.origin !== window.location.origin) return;

      // In-page hash jumps
      if (targetUrl.pathname === window.location.pathname) {
        if (targetUrl.hash) {
          const targetEl = document.querySelector(targetUrl.hash);
          if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            try {
              history.pushState(null, '', targetUrl.hash);
            } catch (_) {}
            if (targetUrl.hash.startsWith('#celebrant-card-')) {
              targetEl.classList.add('is-highlighted');
              setTimeout(() => {
                targetEl.classList.remove('is-highlighted');
              }, 2400);
            } else if (targetUrl.hash === '#gallery') {
              targetEl.classList.add('is-highlighted');
              setTimeout(() => {
                targetEl.classList.remove('is-highlighted');
              }, 2400);
              const firstItem = targetEl.querySelector('.gallery-item');
              if (firstItem) {
                firstItem.focus({ preventScroll: true });
              }
            }
            return;
          }
        }
      }

      // Internal HTML page transitions (index.html, tribute-*.html)
      if (
        targetUrl.pathname.endsWith('.html') ||
        targetUrl.pathname === '/' ||
        targetUrl.pathname === ''
      ) {
        e.preventDefault();
        navigatePage(targetUrl.href, targetUrl.hash);
      }
    });

    // Handle browser Back / Forward buttons without audio interruption
    window.addEventListener('popstate', () => {
      navigatePage(window.location.href, window.location.hash, false);
    });
  };

  // ==========================================================================
  // 7. Dark / Light Theme Controller & Toggle Engine
  // ==========================================================================
  const getPreferredTheme = () => {
    try {
      const saved = localStorage.getItem('idu-theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (_) {}
    return 'light';
  };

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('idu-theme', theme);
    } catch (_) {}

    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    toggleBtns.forEach((btn) => {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      btn.setAttribute('title', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    });
  };

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  };

  const bindThemeToggle = () => {
    const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
    toggleBtns.forEach((btn) => {
      if (btn.dataset.themeBound) return;
      btn.dataset.themeBound = 'true';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        toggleTheme();
      });
    });
  };

  if (window.matchMedia) {
    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('idu-theme')) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    } catch (_) {}
  }

  // ==========================================================================
  // 8. Initial Startup Execution
  // ==========================================================================
  applyTheme(getPreferredTheme());
  bindThemeToggle();
  audioController.init();
  bindGalleryLightbox();
  checkGalleryEmptyState();
  initDynamicYear();
  bindFeatureCardNav();
  initPageRouter();

  // Check initial incoming URL hash (e.g. index.html#celebrant-card-adeniji or #gallery)
  if (window.location.hash) {
    if (window.location.hash.startsWith('#celebrant-card-')) {
      setTimeout(() => {
        const targetCard = document.querySelector(window.location.hash);
        if (targetCard) {
          targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
          targetCard.classList.add('is-highlighted');
          setTimeout(() => {
            targetCard.classList.remove('is-highlighted');
          }, 2400);
        }
      }, 150);
    } else if (window.location.hash === '#gallery') {
      setTimeout(() => {
        const targetGallery = document.getElementById('gallery') || document.querySelector('.tribute-gallery-section');
        if (targetGallery) {
          targetGallery.scrollIntoView({ behavior: 'smooth', block: 'start' });
          targetGallery.classList.add('is-highlighted');
          setTimeout(() => {
            targetGallery.classList.remove('is-highlighted');
          }, 2400);
        }
      }, 150);
    }
  }
})();
