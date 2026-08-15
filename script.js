/* Interactive features: pulse animation, hero parallax, certificate gallery and modal, responsive/touch interactions */
(function(){
  // Certificate list discovered from workspace (do not invent names)
  const certificates = [
    {file:'arduino.jpg' },
    {file:'azure.jpg' },
    {file:'bajaj.jpg' },
    {file:'gnsss.jpg' },
    {file:'networking.jpg' },
    {file:'nptel 3.jpg' },
    {file:'nptel1.jpg' },
    {file:'nptel2.jpg' },
    {file:'pcbdesign.jpg' },
    {file:'pp.jpg' },
    {file:'sastra.jpg' },
    {file:'sensor.jpg' },
    {file:'satra2.jpg' }
  ];

  // conservative filename-based category mapping (only when keyword is clear)
  function categorize(name){
    const n = name.toLowerCase();
    // QC/Quality related keywords (priority)
    if(/inspection|aoi|qc|quality|test|pp|satra|sastra|bajaj|gnsss|satrap|satrap2/.test(n)) return 'quality';
    // Electronics / hardware
    if(/arduino|sensor|pcb|pcbdesign|smc|smd/.test(n)) return 'electronics';
    // AI / ML hints
    if(/ml|model|tensor|opencv|vision|gnss/.test(n)) return 'ai';
    // Software / cloud / networking
    if(/azure|network|networking|pp|pp1|python|sql/.test(n)) return 'software';
    return 'other';
  }

  const certGrid = document.getElementById('certGrid');
  const certCountEl = document.getElementById('certCount');
  // deduplicate by filename to avoid accidental duplicates and create a working list
  const seenFiles = new Set();
  const fileList = [];
  certificates.forEach(c=>{ if(!seenFiles.has(c.file)){ seenFiles.add(c.file); fileList.push(c); } });
  certCountEl.textContent = fileList.length;

  // build cards (premium framed design)
  fileList.forEach((c,i)=>{
    c.index = i+1;
    c.category = categorize(c.file);

    const card = document.createElement('div');
    card.className = 'cert-card';
    card.setAttribute('tabindex','0');

    // media wrap (preserve aspect ratio of original image)
    const media = document.createElement('div'); media.className = 'cert-media';
    const img = document.createElement('img');
    img.src = encodeURI(c.file);
    img.alt = `Certificate ${String(i+1).padStart(2,'0')}`;
    img.loading = 'lazy'; img.decoding = 'async';
    media.appendChild(img);

    // frame accents
    const border = document.createElement('div'); border.className='cert-border';
    const tl = document.createElement('div'); tl.className='cert-corner tl';
    const tr = document.createElement('div'); tr.className='cert-corner tr';
    const bl = document.createElement('div'); bl.className='cert-corner bl';
    const br = document.createElement('div'); br.className='cert-corner br';

    // overlay and scanline (single view CTA)
    const overlay = document.createElement('div'); overlay.className='cert-overlay';
    const viewBtn = document.createElement('button'); viewBtn.className='btn view-cert'; viewBtn.textContent='VIEW CERTIFICATE →';
    overlay.appendChild(viewBtn);
    const scan = document.createElement('div'); scan.className='scanline';

    // assemble (image-focused; no footer metadata)
    card.appendChild(media);
    card.appendChild(border);
    card.appendChild(tl); card.appendChild(tr); card.appendChild(bl); card.appendChild(br);
    card.appendChild(overlay);
    card.appendChild(scan);

    // accessibility
    card.setAttribute('aria-label', `Certificate ${String(i+1).padStart(2,'0')}`);

    // click behavior: on small/touch screens, first tap reveals overlay (preview), second tap opens modal
    function handleCardClick(e){
      const isSmall = window.innerWidth < 700 || ('ontouchstart' in window && window.innerWidth < 1000);
      if(isSmall && !card.classList.contains('preview-active')){
        // reveal preview overlay; do not open modal
        card.classList.add('preview-active');
        card.setAttribute('aria-expanded','true');
        // auto-clear preview after 6s to avoid stuck state
        setTimeout(()=>{ if(card.classList.contains('preview-active')){ card.classList.remove('preview-active'); card.setAttribute('aria-expanded','false'); } },6000);
        return;
      }
      // otherwise open modal immediately
      openModal(i);
    }

    // keyboard activation should open modal directly
    card.addEventListener('keydown', (ev)=>{ if(ev.key==='Enter' || ev.key===' ') { ev.preventDefault(); openModal(i); } });

    // view button ALWAYS opens modal
    viewBtn.addEventListener('click', (ev)=>{ ev.stopPropagation(); openModal(i); });

    // card click handler
    card.addEventListener('click', handleCardClick);

    certGrid.appendChild(card);
  });


  // Modal implementation
  const modal = document.getElementById('certModal');
  const modalImg = document.getElementById('modalImg');
  const modalLabel = document.getElementById('modalLabel');
  const modalIndex = document.getElementById('modalIndex');
  const closeBtn = modal.querySelector('.modal-close');
  const nextBtn = modal.querySelector('.modal-next');
  const prevBtn = modal.querySelector('.modal-prev');

  let current = 0;
  function openModal(i){
    current = i; showModal();
  }
  function showModal(){
    const c = fileList[current];
    modalImg.src = encodeURI(c.file);
    modalImg.alt = decodeURIComponent(c.file).replace(/\.[^/.]+$/, '').replace(/[-_]/g,' ');
    // reset any manual zoom applied
    modalImg.style.maxWidth = '';
    // update modal header and index
    const header = document.getElementById('modalCertHeader');
    if(header){ header.textContent = `CERTIFICATE ${current+1} / ${fileList.length}`; }
    if(modalLabel) modalLabel.textContent = 'DOCUMENT · VERIFIED VIEW';
    if(modalIndex) modalIndex.textContent = `${current+1} / ${fileList.length}`;
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
  }
  function closeModal(){ modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
  function next(){ current = (current+1) % fileList.length; showModal(); }
  function prev(){ current = (current-1 + fileList.length) % fileList.length; showModal(); }

  closeBtn.addEventListener('click', closeModal);
  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  document.addEventListener('keydown', (e)=>{
    if(modal.getAttribute('aria-hidden')==='false'){
      if(e.key==='ArrowRight') next();
      if(e.key==='ArrowLeft') prev();
      if(e.key==='Escape') closeModal();
    }
  });

  // touch swipe for modal
  let touchStartX=0;
  modal.addEventListener('touchstart', (e)=>{ touchStartX = e.changedTouches[0].clientX; }, {passive:true});
  modal.addEventListener('touchend', (e)=>{ const dx = e.changedTouches[0].clientX - touchStartX; if(dx>40) prev(); if(dx<-40) next(); }, {passive:true});

  // double-click / double-tap to toggle image zoom (modal supports pinch-to-zoom natively on many devices)
  modalImg.addEventListener('dblclick', ()=>{
    if(modalImg.style.maxWidth === 'none'){
      modalImg.style.maxWidth = '';
    } else {
      modalImg.style.maxWidth = 'none';
    }
  });
  // also support double-tap on touch devices
  let lastTap = 0; modalImg.addEventListener('touchend', (ev)=>{ const now = Date.now(); if(now - lastTap < 300){ // double-tap
    if(modalImg.style.maxWidth === 'none') modalImg.style.maxWidth = ''; else modalImg.style.maxWidth = 'none';
  } lastTap = now; });

  // hero interactivity: move pulse along path
  const pulse = document.querySelector('.pulse');
  const traces = document.querySelectorAll('.trace');
  // only start pulse animation when both pulse and at least one trace are present
  if(pulse && traces.length){
    let pulsePos = 0; // 0..1
    function pulseStep(){
      pulsePos += 0.006;
      if(pulsePos>1) pulsePos=0;
      // approximate moving along first path
      const path = traces[0];
      if(path && typeof path.getTotalLength === 'function'){
        try{
          const len = path.getTotalLength();
          const pt = path.getPointAtLength(len * pulsePos);
          if(pt && typeof pt.x !== 'undefined'){
            pulse.setAttribute('cx', pt.x);
            pulse.setAttribute('cy', pt.y);
          }
        }catch(e){ /* ignore geometry errors */ }
      }
      requestAnimationFrame(pulseStep);
    }
    requestAnimationFrame(pulseStep);
  }

  // trace draw animation
  traces.forEach((p)=>{
    p.style.strokeDashoffset = '400';
    p.style.animation = 'trace 3s linear forwards';
  });

  // parallax for hero (guarded — only active when PCB viz exists)
  (function(){
    const pcbViz = document.getElementById('pcbViz');
    const heroRight = document.querySelector('.hero-right');
    if(!heroRight) return;
    if(!pcbViz){
      // no PCB viz (portrait mode) — apply subtle hover lighting to portrait instead
      heroRight.addEventListener('mousemove', (e)=>{
        const img = heroRight.querySelector('.portrait-img');
        if(!img) return;
        const r = heroRight.getBoundingClientRect();
        const rx = (e.clientX - r.left)/r.width - 0.5;
        img.style.transform = `translate(${rx*6}px, ${-Math.abs(rx)*2}px)`;
      });
      heroRight.addEventListener('mouseleave', ()=>{ const img = heroRight.querySelector('.portrait-img'); if(img) img.style.transform=''; });
      return;
    }
    heroRight.addEventListener('mousemove', (e)=>{
      const r = e.currentTarget.getBoundingClientRect();
      const rx = (e.clientX - r.left)/r.width - 0.5;
      const ry = (e.clientY - r.top)/r.height - 0.5;
      pcbViz.style.transform = `translate(${rx*6}px, ${ry*6}px) `;
      // subtle rotation
      pcbViz.style.rotate = `${rx*2}deg`;
    });
  })();

  // Pipeline (FROM CIRCUIT TO PRODUCT) interactive behavior
  (function(){
    const nodes = Array.from(document.querySelectorAll('.pipeline-node'));
    const infoTitle = document.getElementById('pipelineInfoTitle');
    const infoDesc = document.getElementById('pipelineInfoDesc');
    const signal = document.getElementById('pipelineSignal');
    const trackSvg = document.querySelector('#pipeline .pipeline-line');
    if(!nodes.length || !infoTitle || !infoDesc) return;

    const data = [
      {key:'IDEA', title:'IDEA', desc:'Initial product concept.'},
      {key:'SCHEMATIC', title:'SCHEMATIC', desc:'Electrical circuit design.'},
      {key:'PCB', title:'PCB', desc:'PCB design and circuit implementation.'},
      {key:'SMT', title:'SMT', desc:'Surface-mount component placement/manufacturing.'},
      {key:'ASSEMBLY', title:'ASSEMBLY', desc:'Electronic product/board assembly.'},
      {key:'INSPECTION', title:'INSPECTION', desc:'Checking the product or assembly for defects and conformity.'},
      {key:'TESTING', title:'TESTING', desc:'Verifying functionality and performance.'},
      {key:'QUALITY', title:'QUALITY', desc:'Quality verification through inspection, testing and validation.'},
      {key:'PRODUCT', title:'PRODUCT', desc:'Final engineered product.'}
    ];

    let active = 0; // default IDEA selected

    function setActive(i, opts){
      if(i<0 || i>=nodes.length) return; active = i;
      nodes.forEach((n,idx)=>{
        n.classList.toggle('active', idx===i);
        n.setAttribute('aria-pressed', idx===i ? 'true' : 'false');
      });
      const item = data[i];
      infoTitle.textContent = item.title;
      infoDesc.textContent = item.desc;
      // move signal along the svg path if present
      try{
        if(signal && trackSvg){
          const lineRect = trackSvg.getBoundingClientRect();
          const pct = (i)/(nodes.length - 1 || 1);
          const x = 10 + pct * (lineRect.width - 20); // match original padding from viewBox
          signal.setAttribute('transform', `translate(${x},30)`);
        }
      }catch(e){ /* ignore measurement issues */ }
    }

    // click and keyboard
    nodes.forEach((n, idx)=>{
      n.addEventListener('click', ()=>{ setActive(idx); n.focus(); });
      n.addEventListener('keydown', (ev)=>{
        if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); setActive(idx); }
        if(ev.key === 'ArrowRight'){ ev.preventDefault(); const ni = Math.min(nodes.length-1, idx+1); nodes[ni].focus(); setActive(ni); }
        if(ev.key === 'ArrowLeft'){ ev.preventDefault(); const ni = Math.max(0, idx-1); nodes[ni].focus(); setActive(ni); }
        if(ev.key === 'Home'){ ev.preventDefault(); nodes[0].focus(); setActive(0); }
        if(ev.key === 'End'){ ev.preventDefault(); nodes[nodes.length-1].focus(); setActive(nodes.length-1); }
      });
    });

    // initialize default
    setActive(0);

    // keep signal positioned on resize
    window.addEventListener('resize', ()=>{ setActive(active); });
  })();

  // QA panel: interactive Quality mindset and process visualization
  (function(){
    const stages = Array.from(document.querySelectorAll('.qa-stage'));
    const infoTitle = document.getElementById('qaInfoTitle');
    const infoDesc = document.getElementById('qaInfoDesc');
    const qaSignal = document.getElementById('qaSignal');
    const trackSvg = document.querySelector('#quality .process-line');
    if(stages.length && infoTitle && infoDesc){
      const data = [
        {key:'REQUIREMENTS', title:'REQUIREMENTS', desc:'Understand requirements and acceptance criteria.'},
        {key:'INSPECTION', title:'INSPECTION', desc:'Identify deviations and potential issues.'},
        {key:'TESTING', title:'TESTING', desc:'Verify functionality systematically.'},
        {key:'ANALYSIS', title:'ANALYSIS', desc:'Investigate causes rather than only symptoms.'},
        {key:'VALIDATION', title:'VALIDATION', desc:'Confirm that the solution works as intended.'},
        {key:'QUALITY', title:'QUALITY', desc:'Quality verification through inspection, testing and validation.'}
      ];

      let active = 0; // default REQUIREMENTS
      function setActive(i){
        if(i<0 || i>=stages.length) return; active = i;
        stages.forEach((s,idx)=>{ s.classList.toggle('active', idx===i); s.setAttribute('aria-pressed', idx===i ? 'true' : 'false'); });
        const item = data[i];
        infoTitle.textContent = item.title;
        infoDesc.textContent = item.desc;
        // update demonstration area with a short non-claiming example
        try{
          const demoTitle = document.getElementById('qaDemoTitle');
          const demoDesc = document.getElementById('qaDemoDesc');
          const demoMap = {
            REQUIREMENTS: {t: 'Requirements Demonstration', d: 'Review acceptance criteria and a hypothetical checklist. Demonstration only.'},
            INSPECTION: {t: 'Inspection Demonstration', d: 'Review a hypothetical component against defined inspection criteria. Demonstration only.'},
            TESTING: {t: 'Testing Demonstration', d: 'Review a hypothetical test scenario and expected result. Demonstration only.'},
            ANALYSIS: {t: 'Analysis Demonstration', d: 'Show a short investigation example focused on root-cause reasoning. Demonstration only.'},
            VALIDATION: {t: 'Validation Demonstration', d: 'Confirm that verification steps meet acceptance criteria. Demonstration only.'},
            QUALITY: {t: 'Quality Demonstration', d: 'Review whether defined requirements and verification criteria are satisfied. Demonstration only.'}
          };
          const key = item.key || item.title;
          const content = demoMap[key] || {t: item.title + ' Demo', d: item.desc};
          const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if(demoTitle && demoDesc){
            if(!prefersReduced){ demoTitle.style.opacity = '0'; demoDesc.style.opacity = '0'; }
            setTimeout(()=>{ if(demoTitle) demoTitle.textContent = content.t; if(demoDesc) demoDesc.textContent = content.d; if(!prefersReduced){ if(demoTitle) demoTitle.style.opacity='1'; if(demoDesc) demoDesc.style.opacity='1'; } }, prefersReduced ? 0 : 120);
          }
        }catch(e){ /* ignore demo update errors */ }
        // move the signal along path if available
        try{
          if(qaSignal && trackSvg){
            const rect = trackSvg.getBoundingClientRect();
            const pct = i / (stages.length - 1 || 1);
            const x = 10 + pct * (rect.width - 20);
            qaSignal.setAttribute('transform', `translate(${x},30)`);
          }
        }catch(e){ /* ignore */ }
      }

      stages.forEach((s,idx)=>{
        s.addEventListener('click', ()=>{ setActive(idx); s.focus(); });
        s.addEventListener('keydown', (ev)=>{
          if(ev.key==='Enter' || ev.key===' '){ ev.preventDefault(); setActive(idx); }
          if(ev.key==='ArrowRight' || ev.key==='ArrowDown'){ ev.preventDefault(); const ni=Math.min(stages.length-1, idx+1); stages[ni].focus(); setActive(ni); }
          if(ev.key==='ArrowLeft' || ev.key==='ArrowUp'){ ev.preventDefault(); const ni=Math.max(0, idx-1); stages[ni].focus(); setActive(ni); }
          if(ev.key==='Home'){ ev.preventDefault(); stages[0].focus(); setActive(0); }
          if(ev.key==='End'){ ev.preventDefault(); stages[stages.length-1].focus(); setActive(stages.length-1); }
        });
      });

      // initialize
      setActive(0);
      window.addEventListener('resize', ()=>{ setActive(active); });
    }
  })();

  // Hero CTAs: View Experience, View Projects, Download Resume
  const viewExperienceBtn = document.getElementById('viewExperienceBtn');
  const viewProjectsBtn = document.getElementById('viewProjectsBtn');
  const downloadResumeBtn = document.getElementById('downloadResumeBtn');
  if(viewExperienceBtn) viewExperienceBtn.addEventListener('click', ()=>{ document.getElementById('experience').scrollIntoView({behavior:'smooth'}); });
  if(viewProjectsBtn) viewProjectsBtn.addEventListener('click', ()=>{ document.getElementById('projects').scrollIntoView({behavior:'smooth'}); });
  // downloadResumeBtn is an anchor with href to resume; no JS required, but keep safe guard
  if(downloadResumeBtn) downloadResumeBtn.addEventListener('click', (e)=>{ /* default anchor download will handle it */ });

  // Publication buttons and modal
  const pubModal = document.getElementById('pubModal');
  const modalPubTitle = document.getElementById('modalPubTitle');
  const modalPubMeta = document.getElementById('modalPubMeta');
  const modalPubDesc = document.getElementById('modalPubDesc');
  const modalPubLink = document.getElementById('modalPubLink');

  document.querySelectorAll('.pub-view').forEach(btn=>{
    btn.addEventListener('click', (e)=>{ const url = btn.dataset.url; window.open(url, '_blank', 'noopener'); });
  });
  document.querySelectorAll('.pub-details').forEach(btn=>{
    btn.addEventListener('click',(e)=>{
      const id = btn.dataset.pub;
      if(id==='1'){
        modalPubTitle.textContent = 'Ionospheric TEC prediction using SVM during fifteen X-class solar flares occurred in the 25th solar cycle and comparison with LSTM and IRI-Plas 2020';
        modalPubMeta.textContent = 'S. Kishore Kumar et al. — Acta Geodaetica et Geophysica — 2026';
        modalPubDesc.textContent = 'Verified publication discussing TEC prediction using machine learning (SVM, compared with LSTM) and ionospheric modelling; view the publisher page for full article and DOI.';
        modalPubLink.href = 'https://link.springer.com/article/10.1007/s40328-026-00482-9';
      } else if(id==='2'){
        modalPubTitle.textContent = 'Publication details available on publisher page';
        modalPubMeta.textContent = 'Source: ScienceDirect';
        modalPubDesc.textContent = 'Open the publisher page to view verified title, authors, and publication metadata.';
        modalPubLink.href = 'https://www.sciencedirect.com/science/article/abs/pii/S1364682625001907?via%3Dihub';
      }
      pubModal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
    });
  });
  // publication modal close
  pubModal.querySelector('.modal-close').addEventListener('click', ()=>{ pubModal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; });
  // close pub modal on Escape
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && pubModal.getAttribute('aria-hidden')==='false'){ pubModal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; } });

  // mobile menu
  const menuBtn = document.querySelector('.mobile-menu-btn');

  // Contact action buttons
  const emailBtn = document.getElementById('emailBtn');
  const callBtn = document.getElementById('callBtn');
  const liBtn = document.getElementById('liBtn');

  // form validation and mailto fallback
  const contactForm = document.getElementById('contactForm');
  if(contactForm){
    const nameEl = document.getElementById('visitorName');
    const emailEl = document.getElementById('visitorEmail');
    const msgEl = document.getElementById('visitorMessage');
    const errName = document.getElementById('errName');
    const errEmail = document.getElementById('errEmail');
    const errMessage = document.getElementById('errMessage');
    const sendBtn = document.getElementById('sendBtn');
    const formStatus = document.getElementById('formStatus');

    function validateEmail(email){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

    contactForm.addEventListener('submit', function(e){
      e.preventDefault();
      let valid = true; errName.textContent=''; errEmail.textContent=''; errMessage.textContent=''; formStatus.textContent='';
      if(!nameEl.value.trim()){ errName.textContent = 'Please enter your name.'; valid = false; }
      if(!emailEl.value.trim()){ errEmail.textContent = 'Please enter your email address.'; valid = false; }
      else if(!validateEmail(emailEl.value.trim())){ errEmail.textContent = 'Please enter a valid email address.'; valid = false; }
      if(!msgEl.value.trim()){ errMessage.textContent = 'Please enter a message.'; valid = false; }

      if(!valid){ return; }

      // prepare mailto
      const to = 'kishorekumarsenthil2004@gmail.com';
      const subject = 'Portfolio Contact — ' + nameEl.value.trim();
      const body = 'Name: ' + nameEl.value.trim() + '\nEmail: ' + emailEl.value.trim() + '\n\nMessage:\n' + msgEl.value.trim();
      const mailto = 'mailto:' + to + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

      // show opening status
      formStatus.textContent = 'OPENING YOUR EMAIL CLIENT...';
      // open mail client
      try{
        window.location.href = mailto;
        // show confirmation briefly
        setTimeout(()=>{ formStatus.textContent = 'YOUR EMAIL CLIENT HAS BEEN OPENED.'; },800);
      }catch(err){ formStatus.textContent = 'Unable to open email client. Please email ' + to; }

    });
  }


  // Contact quick actions: open mail client or dialer
  if(emailBtn){ emailBtn.addEventListener('click',(e)=>{ const href = emailBtn.getAttribute('data-href'); if(href){ window.location.href = href; } }); }
  if(callBtn){ callBtn.addEventListener('click',(e)=>{ const href = callBtn.getAttribute('data-href'); if(href){ window.location.href = href; } }); }

  menuBtn.addEventListener('click', ()=>{
    const nav = document.querySelector('.nav-links');
    if(nav.style.display==='flex'){ nav.style.display='none'; menuBtn.setAttribute('aria-expanded','false'); } else { nav.style.display='flex'; menuBtn.setAttribute('aria-expanded','true'); }
  });
  // close mobile menu when a navigation link is selected
  document.querySelectorAll('.nav-links a').forEach(a=>{ a.addEventListener('click', ()=>{ const nav = document.querySelector('.nav-links'); if(window.innerWidth < 700) nav.style.display='none'; menuBtn.setAttribute('aria-expanded','false'); }); });


  // keyboard focus for hands-off users: reveal focus states
  document.addEventListener('keydown', (ev)=>{ if(ev.key==='Tab') document.body.classList.add('keyboard-nav'); });

  // scrollspy: update active nav link and compact navbar on scroll
  const sections = document.querySelectorAll('main section[id]');
  function updateActive(){
    let currentId = null;
    sections.forEach(s=>{ const r = s.getBoundingClientRect(); if(r.top <= 120 && r.bottom > 120) currentId = s.id; });
    document.querySelectorAll('.nav-links a').forEach(a=>{ if(a.getAttribute('href') === `#${currentId}`) a.classList.add('active'); else a.classList.remove('active'); });
  }
  window.addEventListener('scroll', ()=>{ updateActive(); document.querySelector('.nav-root').classList.toggle('nav-scrolled', window.scrollY>60); }, {passive:true});
  updateActive();

  // helper: ensure images exist; if image 404 will still be shown but user can replace
  // Reduced motion preference
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  function applyReduced(){ if(mq.matches){ document.body.classList.remove('reduced-motion-off'); document.body.classList.add('reduced-motion-on'); } }
  applyReduced(); mq.addEventListener('change', applyReduced);

  // Experience interactions removed — layout is CSS-driven and uses simple focus/hover states for accessibility
  // Current role emphasis and hover interactions are handled by CSS. If additional JS-driven interactions are required, request them.

  /* ENGINEERING MILESTONES INTERACTIONS */
  (function(){
    const msSection = document.getElementById('achievements');
    if(!msSection) return;
    const nodes = Array.from(msSection.querySelectorAll('.milestone'));
    const segs = Array.from(msSection.querySelectorAll('.trace-seg'));
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function clearActive(){ nodes.forEach(n=>n.classList.remove('active')); segs.forEach(s=>s.classList.remove('ill')); }
    function setActive(index){
      clearActive();
      const node = nodes[index]; if(!node) return;
      node.classList.add('active');
      // illuminate segments up to index
      segs.forEach((s,i)=>{ if(i<=index) s.classList.add('ill'); else s.classList.remove('ill'); });
    }

    nodes.forEach((node, idx)=>{
      // mouse interactions
      node.addEventListener('mouseenter', ()=>{ if(!prefersReduced) setActive(idx); });
      node.addEventListener('mouseleave', ()=>{ if(!prefersReduced) clearActive(); });
      // focus for keyboard
      node.addEventListener('focus', ()=> setActive(idx));
      node.addEventListener('blur', ()=> clearActive());
      // click / tap toggles expanded card (mobile support)
      node.addEventListener('click', (e)=>{
        const expanded = node.getAttribute('aria-expanded') === 'true';
        node.setAttribute('aria-expanded', String(!expanded));
        node.classList.toggle('expanded', !expanded);
      });
      // keyboard activation
      node.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); node.click(); } });
    });

    // arrow-key navigation across milestones for accessibility
    msSection.addEventListener('keydown', (e)=>{
      const active = document.activeElement;
      const idx = nodes.indexOf(active);
      if(idx === -1) return;
      if(e.key === 'ArrowRight'){
        const ni = Math.min(nodes.length-1, idx+1); nodes[ni].focus();
      }else if(e.key === 'ArrowLeft'){
        const ni = Math.max(0, idx-1); nodes[ni].focus();
      }
    });

  })();

})();

/* small CSS-in-JS keyframes fallback for trace animation (if not defined in CSS file) */
(function(){
  const style = document.createElement('style');
  style.textContent = '@keyframes trace{to{stroke-dashoffset:0}}';
  document.head.appendChild(style);
})();

