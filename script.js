// Small site script used for the static footer year
(function(){
  const yearEl = document.getElementById('site-year');
  if(yearEl){ yearEl.textContent = new Date().getFullYear(); }
})();

// Accordion behavior for `.card` sections: create toggle buttons,
// wrap content in `.card-body`, persist state in localStorage.
document.addEventListener('DOMContentLoaded', function(){
  const cards = document.querySelectorAll('.card');
  cards.forEach((card, idx) => {
    const heading = card.querySelector('h2,h3,h4');
    if(!heading) return;

    // Move the heading into a top-level header container and
    // wrap all remaining top-level card children into .card-body
    const headerEl = document.createElement('div');
    headerEl.className = 'card-header';
    // move the heading element into headerEl (this extracts it from any nested container)
    headerEl.appendChild(heading);
    // ensure headerEl is the first child of the card
    card.insertBefore(headerEl, card.firstChild);

    const body = document.createElement('div');
    body.className = 'card-body';
    // move everything after headerEl into the body (this will include sidebars like .skills)
    while(headerEl.nextSibling){
      body.appendChild(headerEl.nextSibling);
    }
    card.appendChild(body);

    // Create toggle button and append into heading
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'card-toggle';
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Toggle section');
    toggle.innerHTML = '<span class="chev" aria-hidden="true">▾</span>';
    // ensure heading is a flex container (CSS will handle visuals)
    // make heading focusable for keyboard users
    heading.tabIndex = 0;
    heading.appendChild(toggle);

    // localStorage key
    const key = 'card-collapsed-' + (card.id || idx);
    const saved = localStorage.getItem(key);
    const isCollapsed = saved === 'true';

    // Prepare body for CSS-driven max-height transitions
    body.style.overflow = 'hidden';
    body.style.transition = 'max-height 280ms cubic-bezier(.2,0,.2,1)';

    // If expanded, set max-height to content height then remove to allow natural growth.
    if(isCollapsed){
      body.style.maxHeight = '0px';
    } else {
      const h = body.scrollHeight;
      body.style.maxHeight = h + 'px';
      // once the transition completes, clear the explicit maxHeight
      const tidy = () => { body.style.maxHeight = ''; body.removeEventListener('transitionend', tidy); };
      // small timeout to ensure layout settled
      setTimeout(() => body.addEventListener('transitionend', tidy), 300);
    }

    // ResizeObserver variable must be declared before we may call setCollapsed
    let ro = null;

    setCollapsed(isCollapsed);

    // Toggle handler
    toggle.addEventListener('click', () => setCollapsed(!isCollapsedState()));
    heading.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        toggle.click();
      }
    });

    // Keep size in sync if contents change while expanded
    function observeIfNeeded(){
      if(!ro){
        ro = new ResizeObserver(() => {
          if(!isCollapsedState()){
            body.style.maxHeight = body.scrollHeight + 'px';
          }
        });
        ro.observe(body);
      }
    }

    function isCollapsedState(){
      return card.getAttribute('data-collapsed') === 'true';
    }

    function setCollapsed(collapsed){
      if(collapsed){
        // animate closed: set current height then to 0
        const start = body.scrollHeight;
        body.style.maxHeight = start + 'px';
        // allow paint
        requestAnimationFrame(() => requestAnimationFrame(() => { body.style.maxHeight = '0px'; }));
        card.setAttribute('data-collapsed','true');
        toggle.setAttribute('aria-expanded','false');
        localStorage.setItem(key, 'true');
      } else {
        // expand: set to measured height, then clear after transition so it can grow naturally
        const target = body.scrollHeight;
        body.style.maxHeight = target + 'px';
        const onEnd = () => { body.style.maxHeight = ''; body.removeEventListener('transitionend', onEnd); };
        body.addEventListener('transitionend', onEnd);
        card.removeAttribute('data-collapsed');
        toggle.setAttribute('aria-expanded','true');
        localStorage.removeItem(key);
        observeIfNeeded();
      }
    }
  });
});
