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

  // Audio player status handling
  const audio = document.getElementById('tribute-audio');
  const status = document.getElementById('audio-status');
  if (!audio || !status) return;

  const markMissing = () => {
    status.textContent = 'Audio file not added yet. Replace assets/idu-tribute-audio.mp3 with the final mastered MP3.';
    document.querySelector('.audio-section')?.classList.add('audio-missing');
  };

  const markReady = () => {
    status.textContent = 'Audio ready. Press play to listen to the tribute.';
    document.querySelector('.audio-section')?.classList.remove('audio-missing');
  };

  audio.addEventListener('error', markMissing, true);
  const source = audio.querySelector('source');
  if (source) {
    source.addEventListener('error', markMissing);
  }

  audio.addEventListener('canplay', markReady);

  if (audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
    markMissing();
  }
})();
