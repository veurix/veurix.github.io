(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  const compactScene = window.matchMedia('(max-width: 600px), (pointer: coarse)');
  const menuButton = document.querySelector('.menu-button');
  menuButton?.addEventListener('click',()=>{
    const open=document.querySelector('header').classList.toggle('menu-open');
    menuButton.setAttribute('aria-expanded',String(open));
    menuButton.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');
  });
  const scene = document.querySelector('.cinematic');
  const stageLabel = document.querySelector('.cine-stage');
  const clamp = n => Math.max(0,Math.min(1,n));
  const ease = (n,a,b) => {const t=clamp((n-a)/(b-a));return t*t*(3-2*t);};
  const mix = (a,b,t) => a+(b-a)*t;
  let frame = 0;
  function updateScene() {
    frame = 0;
    if (!scene || reduce.matches) return;
    const max = scene.offsetHeight - innerHeight;
    const p = clamp(-scene.getBoundingClientRect().top/Math.max(1,max));
    document.body.classList.toggle('has-scrolled',p>.25);
    const set=(k,v)=>scene.style.setProperty('--'+k,v);
    if (compactScene.matches) {
      // Mobile: keep the narrative but avoid animating large image filters,
      // background scales and layout coordinates on every touch scroll frame.
      const detach=ease(p,.15,.43), split=ease(p,.49,.75), work=ease(p,.67,.88);
      const intro=1-ease(p,.18,.39), detail=ease(p,.30,.49)*(1-ease(p,.73,.87)), final=ease(p,.76,.91);
      set('cine-progress',(p*100).toFixed(1)+'%');
      set('car-open-opacity',ease(p,.13,.32).toFixed(2));
      set('workshop-opacity',work.toFixed(2));
      set('wheel-opacity',(ease(p,.17,.29)*(1-ease(p,.52,.67))).toFixed(2));
      set('wheel-scale',mix(.64,1.04,detach).toFixed(2));
      set('wheel-rotation',(detach*8).toFixed(1)+'deg');
      set('parts-opacity',(ease(p,.51,.65)*(1-ease(p,.79,.93))).toFixed(2));
      set('parts-scale',mix(.83,1.06,split).toFixed(2));
      set('tire-offset',mix(20,0,split).toFixed(1)+'%');
      set('rim-offset',mix(-20,0,split).toFixed(1)+'%');
      set('intro-opacity',intro.toFixed(2));set('intro-visibility',intro<.01?'hidden':'visible');
      set('detail-opacity',detail.toFixed(2));set('detail-visibility',detail<.01?'hidden':'visible');
      set('work-copy-opacity',final.toFixed(2));set('work-visibility',final<.01?'hidden':'visible');
      if(stageLabel) stageLabel.textContent=p<.25?'01 / Автомобиль':p<.5?'02 / Снятие колеса':p<.76?'03 / Шина и диск':'04 / Работа мастера';
      return;
    }
    const detach=ease(p,.16,.46);
    const split=ease(p,.52,.76);
    const work=ease(p,.65,.90);
    const exit=ease(p,.76,.94);
    set('cine-progress',(p*100).toFixed(2)+'%');
    // The original workshop stays beneath every stage; the next frame covers it
    // before the previous foreground layer leaves.
    set('car-complete-opacity','1');
    set('car-open-opacity',ease(p,.13,.30).toFixed(3));
    set('car-zoom',mix(1,1.065,ease(p,.25,.68)).toFixed(3));
    set('scene-dim',(.35*ease(p,.38,.67)*(1-work)).toFixed(3));
    set('workshop-opacity',work.toFixed(3));
    set('workshop-scale',mix(1.13,1.01,work).toFixed(3));
    set('wheel-opacity',(ease(p,.16,.29)*(1-ease(p,.52,.66))).toFixed(3));
    set('wheel-x',mix(58,61.5,detach).toFixed(2)+'%');
    set('wheel-y',mix(58,48,detach).toFixed(2)+'%');
    set('wheel-scale',mix(innerWidth<600?.62:.36,1.03,detach).toFixed(3));
    set('wheel-rotation',(detach*7).toFixed(2)+'deg');
    set('wheel-blur',(2*ease(p,.58,.68)).toFixed(2)+'px');
    set('parts-opacity',(ease(p,.51,.65)*(1-ease(p,.78,.93))).toFixed(3));
    set('parts-scale',mix(mix(.80,1.08,split),.78,exit).toFixed(3));
    set('parts-x',mix(58,66,exit).toFixed(2)+'%');
    set('parts-y',mix(51,48,exit).toFixed(2)+'%');
    set('parts-blur',(7*exit).toFixed(2)+'px');
    set('tire-offset',mix(24,0,split).toFixed(2)+'%');
    set('rim-offset',mix(-24,0,split).toFixed(2)+'%');
    set('tire-rotation',mix(0,-9,split).toFixed(2)+'deg');
    set('rim-rotation',mix(0,9,split).toFixed(2)+'deg');
    const intro=1-ease(p,.17,.39),detail=ease(p,.28,.49)*(1-ease(p,.77,.91)),workText=ease(p,.75,.90);
    set('intro-opacity',intro.toFixed(3));set('intro-visibility',intro<.01?'hidden':'visible');
    set('detail-opacity',detail.toFixed(3));set('detail-visibility',detail<.01?'hidden':'visible');
    set('work-copy-opacity',workText.toFixed(3));set('work-visibility',workText<.01?'hidden':'visible');
    if(stageLabel) stageLabel.textContent=p<.25?'01 / Автомобиль':p<.5?'02 / Снятие колеса':p<.76?'03 / Шина и диск':'04 / Работа мастера';
  }
  const requestScene=()=>{if(!frame)frame=requestAnimationFrame(updateScene);};
  addEventListener('scroll',requestScene,{passive:true});
  addEventListener('resize',requestScene);
  updateScene();

  // Desktop wheel input gets a short, decaying continuation; native touch and keyboard scrolling remain intact.
  if (fine.matches && !reduce.matches) {
    let target = window.scrollY, active = false, lastProgrammatic = false;
    const animate = () => {
      const delta = target - window.scrollY;
      if (Math.abs(delta) < .7) { window.scrollTo(0,target); active = false; return; }
      lastProgrammatic = true;
      window.scrollTo(0, window.scrollY + delta * .15);
      requestAnimationFrame(animate);
    };
    addEventListener('wheel', e => {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.defaultPrevented || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (e.target.closest('textarea, select, [contenteditable="true"]')) return;
      e.preventDefault();
      const scale = e.deltaMode === 1 ? 20 : e.deltaMode === 2 ? innerHeight : 1;
      target = Math.max(0, Math.min(document.documentElement.scrollHeight - innerHeight, target + e.deltaY * scale * .9));
      if (!active) { active = true; requestAnimationFrame(animate); }
    }, {passive:false});
    addEventListener('scroll', () => {
      if (lastProgrammatic) {lastProgrammatic = false; return;}
      if (!active) target = scrollY;
    }, {passive:true});
    document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{target=scrollY;active=false;}));

    const ring = document.createElement('div'), dot = document.createElement('div');
    ring.className = 'cursor-ring'; dot.className = 'cursor-dot';
    document.body.append(ring,dot); document.documentElement.classList.add('custom-cursor');
    let x=-100,y=-100,rx=-100,ry=-100,move=false;
    addEventListener('pointermove',e=>{x=e.clientX;y=e.clientY;dot.style.setProperty('--dx',x+'px');dot.style.setProperty('--dy',y+'px');document.documentElement.classList.add('cursor-visible');if(!move){move=true;requestAnimationFrame(tick);}}, {passive:true});
    addEventListener('pointerover',e=>document.documentElement.classList.toggle('cursor-hover',!!e.target.closest('a,button')));
    addEventListener('mouseout',e=>{if(!e.relatedTarget) document.documentElement.classList.remove('cursor-visible');});
    function tick(){rx+=(x-rx)*.2;ry+=(y-ry)*.2;ring.style.setProperty('--cx',rx+'px');ring.style.setProperty('--cy',ry+'px');requestAnimationFrame(tick);}
  }
})();
