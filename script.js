// ═══════════════════════════════
//  MUSIC
// ═══════════════════════════════
const music = document.getElementById('bg-music');
const musicBtn = document.getElementById('music-btn');
let musicOn = false;
let userStartedMusic = false;

function startMusic(){
  if(!musicOn){
    music.volume = 0.4;
    music.play().catch(()=>{});
    musicOn = true;
    musicBtn.textContent = '🎵';
    userStartedMusic = true;
  }
}
function pauseMusic(){
  music.pause();
  musicOn = false;
  musicBtn.textContent = '🔇';
}
function resumeMusic(){
  // Always play music when leaving video page — no condition needed
  music.volume = 0.4;
  music.play().catch(()=>{});
  musicOn = true;
  musicBtn.textContent = '🎵';
  userStartedMusic = true;
}
musicBtn.onclick = () => musicOn ? pauseMusic() : startMusic();

// ═══════════════════════════════
//  PAGE NAVIGATION
// ═══════════════════════════════
const trans = document.getElementById('transition');
function goTo(id){
  trans.classList.add('in');
  setTimeout(()=>{
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    trans.classList.remove('in');

    // Music: pause on video, resume everywhere else
    if(id === 'page-video'){
      pauseMusic();
    } else {
      resumeMusic();
    }

    if(id === 'page-candles')   initCake3D();
    if(id === 'page-fireworks') initFireworks();
    if(id === 'page-finale')    initFinale();
    if(id === 'page-landing')   initLanding3D();

    window.scrollTo(0, 0);
  }, 400);
}

// ═══════════════════════════════
//  STAR CARD FLIP & RATING
// ═══════════════════════════════
function flipCard(idx){
  const card = document.getElementById('card-' + idx);
  card.classList.toggle('flipped');
  if(card.classList.contains('flipped')) burstSparkles(idx);
}
function rate(cardIdx, val){
  const container = document.getElementById('rating-' + cardIdx);
  container.querySelectorAll('.heart-btn').forEach((b, i) => {
    b.classList.toggle('active', i < val);
    b.textContent = i < val ? '💖' : '💗';
  });
  burstSparkles(cardIdx);
}
function burstSparkles(idx){
  const container = document.getElementById('sparkles-' + idx);
  container.innerHTML = '';
  for(let i = 0; i < 12; i++){
    const s = document.createElement('div');
    s.style.cssText = `position:absolute;font-size:${0.8+Math.random()*0.8}rem;left:${Math.random()*100}%;top:${Math.random()*100}%;animation:sparkOut 0.8s ease forwards;pointer-events:none;`;
    s.textContent = ['✨','💫','⭐','🌟'][Math.floor(Math.random()*4)];
    container.appendChild(s);
  }
}

// ═══════════════════════════════
//  LANDING THREE.JS
// ═══════════════════════════════
let landingRenderer, landingScene, landingCamera, landingAnimId;
function initLanding3D(){
  const canvas = document.getElementById('three-canvas');
  if(landingAnimId) cancelAnimationFrame(landingAnimId);
  if(landingRenderer) landingRenderer.dispose();

  landingScene = new THREE.Scene();
  landingCamera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
  landingCamera.position.set(0, 0, 18);
  landingRenderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
  landingRenderer.setSize(window.innerWidth, window.innerHeight);
  landingRenderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(200*3);
  for(let i=0;i<600;i++) pos[i]=(Math.random()-0.5)*50;
  geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  const points = new THREE.Points(geo, new THREE.PointsMaterial({color:0xd4a853,size:0.12,transparent:true,opacity:0.6}));
  landingScene.add(points);

  const balloonColors=[0xc9637a,0xd4a853,0xf2a0b4,0x8b2a42];
  for(let i=0;i<8;i++){
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.4+Math.random()*0.3,16,16),
      new THREE.MeshPhongMaterial({color:balloonColors[i%4],shininess:80,transparent:true,opacity:0.75})
    );
    mesh.position.set((Math.random()-0.5)*20,(Math.random()-0.5)*12,(Math.random()-0.5)*6-5);
    mesh.userData = {speed:0.003+Math.random()*0.005, offset:Math.random()*Math.PI*2};
    landingScene.add(mesh);
  }
  landingScene.add(new THREE.AmbientLight(0xffeedd,0.6));
  const pL = new THREE.PointLight(0xd4a853,1.5,30);
  pL.position.set(0,5,10);
  landingScene.add(pL);

  function anim(){
    landingAnimId = requestAnimationFrame(anim);
    const t = Date.now()*0.001;
    points.rotation.y = t*0.04;
    landingScene.children.forEach(o=>{
      if(o.userData.speed){ o.position.y+=Math.sin(t+o.userData.offset)*0.01; o.rotation.y+=o.userData.speed; }
    });
    landingRenderer.render(landingScene, landingCamera);
  }
  anim();
}

// ═══════════════════════════════
//  3D CAKE
// ═══════════════════════════════
let cakeRenderer, cakeScene, cakeCamera, cakeAnimId;
let candlesLeft = 5;
let flameMeshes = [];

function initCake3D(){
  candlesLeft = 5;
  flameMeshes = [];
  document.getElementById('candles-left').textContent = '🕯️ 5 candles remaining';
  document.getElementById('blow-btn').disabled = false;
  document.getElementById('blow-btn').textContent = '💨 Blow!';

  if(cakeAnimId) cancelAnimationFrame(cakeAnimId);
  if(cakeRenderer) cakeRenderer.dispose();

  const canvas = document.getElementById('cake-canvas-el');
  cakeScene = new THREE.Scene();
  cakeCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  cakeCamera.position.set(0, 3, 7);
  cakeCamera.lookAt(0, 0.5, 0);
  cakeRenderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
  cakeRenderer.setSize(300, 300);

  cakeScene.add(new THREE.AmbientLight(0xffeedd, 0.5));
  const pl = new THREE.PointLight(0xffd700, 2, 20);
  pl.position.set(0,5,5);
  cakeScene.add(pl);

  [{r:2.2,h:0.9,y:0,c:0xf7c5d5},{r:1.6,h:0.9,y:0.9,c:0xf9d0e0},{r:1.1,h:0.9,y:1.8,c:0xfce0ea}].forEach(t=>{
    const m = new THREE.Mesh(new THREE.CylinderGeometry(t.r,t.r*1.05,t.h,32), new THREE.MeshPhongMaterial({color:t.c,shininess:40}));
    m.position.y = t.y; cakeScene.add(m);
    const r = new THREE.Mesh(new THREE.TorusGeometry(t.r,0.08,8,32), new THREE.MeshPhongMaterial({color:0xffffff,shininess:80}));
    r.position.y = t.y+t.h/2; r.rotation.x = Math.PI/2; cakeScene.add(r);
  });

  [0,72,144,216,288].map(a=>a*Math.PI/180).forEach((a,i)=>{
    const cx=Math.cos(a)*0.55, cz=Math.sin(a)*0.55;
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,0.55,10), new THREE.MeshPhongMaterial({color:i%2===0?0xffe0b2:0xf48fb1}));
    c.position.set(cx,2.97,cz); cakeScene.add(c);
    const fg = new THREE.Group();
    fg.position.set(cx,3.35,cz);
    const fs = new THREE.SphereGeometry(0.09,8,8); fs.scale(1,1.6,1);
    fg.add(new THREE.Mesh(fs, new THREE.MeshPhongMaterial({color:0xffaa00,emissive:0xff6600,emissiveIntensity:1,transparent:true,opacity:0.95})));
    fg.add(new THREE.PointLight(0xff8800,0.8,2));
    cakeScene.add(fg); flameMeshes.push(fg);
  });

  function anim(){
    cakeAnimId = requestAnimationFrame(anim);
    const t = Date.now()*0.003;
    cakeScene.rotation.y = t*0.3;
    flameMeshes.forEach((fg,i)=>{
      if(fg.visible){ fg.scale.y=0.85+Math.sin(t*8+i)*0.2; fg.scale.x=0.9+Math.sin(t*6+i*1.3)*0.1; }
    });
    cakeRenderer.render(cakeScene, cakeCamera);
  }
  anim();
}

function blowCandle(){
  if(candlesLeft <= 0) return;
  const idx = 5 - candlesLeft;
  candlesLeft--;
  if(flameMeshes[idx]) flameMeshes[idx].visible = false;
  const label = document.getElementById('candles-left');
  const btn   = document.getElementById('blow-btn');
  if(candlesLeft > 0){
    label.textContent = `🕯️ ${candlesLeft} candle${candlesLeft>1?'s':''} remaining`;
  } else {
    label.textContent = '🎉 All blown out!';
    btn.disabled = true;
    btn.textContent = '✨ Wish made!';
    launchConfetti();
    setTimeout(() => goTo('page-message'), 2800);
  }
}

// ═══════════════════════════════
//  CONFETTI
// ═══════════════════════════════
function launchConfetti(){
  const canvas = document.getElementById('confetti-canvas');
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const colors = ['#c9637a','#d4a853','#f2a0b4','#f7e7ce','#8b2a42','#f0d080'];
  const particles = Array.from({length:140}, ()=>({
    x:Math.random()*canvas.width, y:-20, r:4+Math.random()*6,
    color:colors[Math.floor(Math.random()*colors.length)],
    vx:(Math.random()-0.5)*4, vy:2+Math.random()*4,
    rot:Math.random()*360, vrot:(Math.random()-0.5)*8,
    shape:Math.random()>0.5?'rect':'circle'
  }));
  let frame = 0;
  function draw(){
    if(frame++>120){ ctx.clearRect(0,0,canvas.width,canvas.height); return; }
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.05; p.rot+=p.vrot;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180);
      ctx.fillStyle=p.color; ctx.globalAlpha=Math.max(0,1-frame/120);
      if(p.shape==='rect') ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r/2);
      else{ ctx.beginPath(); ctx.arc(0,0,p.r/2,0,Math.PI*2); ctx.fill(); }
      ctx.restore();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ═══════════════════════════════
//  FIREWORKS
// ═══════════════════════════════
let fwRenderer, fwScene, fwCamera, fwAnimId, fwInterval;
let fireworks = [];

function initFireworks(){
  const canvas = document.getElementById('fw-canvas');
  if(fwAnimId) cancelAnimationFrame(fwAnimId);
  if(fwInterval) clearInterval(fwInterval);
  if(fwRenderer) fwRenderer.dispose();
  fireworks = [];

  fwScene  = new THREE.Scene();
  fwCamera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
  fwCamera.position.z = 20;
  fwRenderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
  fwRenderer.setSize(window.innerWidth, window.innerHeight);

  fwInterval = setInterval(()=>{
    if(document.getElementById('page-fireworks').classList.contains('active'))
      spawnFirework((Math.random()-0.5)*16,(Math.random()-0.5)*8,0);
  }, 900);

  function animFW(){
    fwAnimId = requestAnimationFrame(animFW);
    fireworks.forEach((fw,fi)=>{
      fw.age++;
      const p = fw.geo.attributes.position.array;
      for(let i=0;i<fw.particles;i++){ p[i*3]+=fw.vx[i]*0.95; p[i*3+1]+=fw.vy[i]*0.95; fw.vy[i]-=0.01; }
      fw.geo.attributes.position.needsUpdate = true;
      fw.mat.opacity = Math.max(0, 1-fw.age/80);
      if(fw.age>80){ fwScene.remove(fw.points); fireworks.splice(fi,1); }
    });
    fwRenderer.render(fwScene, fwCamera);
  }
  animFW();
  setTimeout(()=>spawnFirework(0,2,0),200);
  setTimeout(()=>spawnFirework(-5,-1,0),700);
  setTimeout(()=>spawnFirework(5,3,0),1200);
}

function spawnFirework(x,y,z){
  const count=120, geo=new THREE.BufferGeometry();
  const pos=new Float32Array(count*3), vx=[], vy=[];
  const col=[0xd4a853,0xc9637a,0xf2a0b4,0xf0d080,0xffffff,0xff6eb4][Math.floor(Math.random()*6)];
  for(let i=0;i<count;i++){
    pos[i*3]=x; pos[i*3+1]=y; pos[i*3+2]=z;
    const a=Math.random()*Math.PI*2, s=0.08+Math.random()*0.18;
    vx.push(Math.cos(a)*s); vy.push(Math.sin(a)*s+0.04);
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  const mat = new THREE.PointsMaterial({color:col,size:0.22,transparent:true,opacity:1});
  const points = new THREE.Points(geo,mat);
  fwScene.add(points);
  fireworks.push({points,geo,mat,vx,vy,particles:count,age:0});
}

function launchFirework(e){
  if(!fwRenderer) return;
  const rect = document.getElementById('fw-canvas').getBoundingClientRect();
  spawnFirework(((e.clientX-rect.left)/rect.width*2-1)*16,(-(e.clientY-rect.top)/rect.height*2+1)*8,0);
}

// ═══════════════════════════════
//  FINALE
// ═══════════════════════════════
function initFinale(){
  const rain = document.getElementById('emoji-rain');
  rain.innerHTML = '';
  const emojis=['💖','🌹','✨','🎂','💫','🎉','🌸','💕','⭐','🎊'];
  for(let i=0;i<40;i++){
    const el=document.createElement('div');
    el.className='rain-item';
    el.textContent=emojis[Math.floor(Math.random()*emojis.length)];
    el.style.left=Math.random()*100+'%';
    el.style.animationDuration=(3+Math.random()*5)+'s';
    el.style.animationDelay=(Math.random()*4)+'s';
    el.style.fontSize=(0.9+Math.random()*1.2)+'rem';
    rain.appendChild(el);
  }
  const canvas=document.getElementById('finale-canvas');
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,0.1,100);
  camera.position.z=18;
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
  renderer.setSize(window.innerWidth,window.innerHeight);
  const pos=new Float32Array(900);
  for(let i=0;i<900;i++) pos[i]=(Math.random()-0.5)*50;
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  scene.add(new THREE.Points(geo,new THREE.PointsMaterial({color:0xd4a853,size:0.15,transparent:true,opacity:0.7})));
  function anim(){ requestAnimationFrame(anim); scene.rotation.y+=0.002; scene.rotation.x+=0.001; renderer.render(scene,camera); }
  anim();
}

// ═══════════════════════════════
//  PETALS
// ═══════════════════════════════
function spawnPetals(){
  const container=document.getElementById('petals-landing');
  const emojis=['🌸','🌹','✨','💗','🌺','💫'];
  for(let i=0;i<18;i++){
    const el=document.createElement('div');
    el.className='petal';
    el.textContent=emojis[Math.floor(Math.random()*emojis.length)];
    el.style.left=Math.random()*100+'%';
    el.style.animationDuration=(6+Math.random()*10)+'s';
    el.style.animationDelay=(Math.random()*8)+'s';
    el.style.fontSize=(0.8+Math.random()*0.8)+'rem';
    container.appendChild(el);
  }
}
function spawnMsgPetals(){
  const c=document.getElementById('msg-petals');
  for(let i=0;i<8;i++){
    const el=document.createElement('div');
    el.style.cssText=`position:absolute;font-size:${0.7+Math.random()*0.5}rem;left:${Math.random()*100}%;top:${Math.random()*100}%;animation:petalDrift ${5+Math.random()*6}s linear infinite;animation-delay:${Math.random()*4}s;opacity:0.3;pointer-events:none;`;
    el.textContent=['🌸','✨','💗'][Math.floor(Math.random()*3)];
    c.appendChild(el);
  }
}

// ═══════════════════════════════
//  INIT — NO auto music!
// ═══════════════════════════════
window.addEventListener('load', ()=>{
  initLanding3D();
  spawnPetals();
  spawnMsgPetals();
  // ✅ Music does NOT auto start — user clicks 🎵 button
});

window.addEventListener('resize', ()=>{
  if(landingRenderer){ landingCamera.aspect=window.innerWidth/window.innerHeight; landingCamera.updateProjectionMatrix(); landingRenderer.setSize(window.innerWidth,window.innerHeight); }
  if(fwRenderer){ fwCamera.aspect=window.innerWidth/window.innerHeight; fwCamera.updateProjectionMatrix(); fwRenderer.setSize(window.innerWidth,window.innerHeight); }
});

// Inject keyframes
const st=document.createElement('style');
st.textContent=`
@keyframes sparkOut{0%{transform:translate(0,0) scale(0);opacity:1;}100%{transform:translate(${(Math.random()-0.5)*60}px,${-30-Math.random()*40}px) scale(1.5);opacity:0;}}
@keyframes petalDrift{0%{transform:translateY(-50px) rotate(0deg);opacity:0;}5%{opacity:0.6;}95%{opacity:0.3;}100%{transform:translateY(105vh) rotate(540deg);opacity:0;}}
`;
document.head.appendChild(st);