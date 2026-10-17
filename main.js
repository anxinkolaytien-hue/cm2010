/* ========= CHỈNH TẠI ĐÂY ========= */
const CFG = {
  password: '2106',   // mật khẩu: chỉ gồm chữ số (sinh nhật Hiển 21/06)
  hint: 'Gợi ý: ngày sinh nhật của người gửi (ngày/tháng)',
  lockPhoto: '01.jpg',   // ảnh bên trái ở màn hình khóa
  // Lời của robot Tim Tim (hiện trong bong bóng khi chạm vào robot hoặc tự nói thỉnh thoảng)
  botLines: ['Tớ là Tim Tim, robot trái tim đây ~ 💗', 'Hiển nhờ tớ gửi lời chúc nè!', 'Chúc {to} luôn xinh đẹp nha!', 'Ui, nhột quá à 😆', 'Chạm nữa đi, tớ thích lắm!', '20/10 vui vẻ nhé 🌸', '{from} thương {to} lắm đó!'],
  // Nội dung thư: mỗi phần tử là 1 trang ({to}, {from} tự thay tên). Sửa thoải mái.
  letter: [
    'Gửi Phương Anh,',
    'Nếu món quà nhỏ này có thể làm cậu mỉm cười dù chỉ một chút, thì tớ đã thấy vui rồi.',
    'Tớ không giỏi nói những lời thật hay, nên gửi vào đây vài điều giản dị mà chân thành.',
    'Cảm ơn cậu vì đã góp vào những ngày bình thường vài khoảnh khắc đáng nhớ.',
    'Mong cậu luôn giữ được nét hồn nhiên, sự ấm áp và những điều khiến cậu trở nên đặc biệt.',
    'Những hôm mệt, mong cậu vẫn nhớ nghỉ ngơi, ăn uống đầy đủ và dịu dàng với chính mình.',
    'Mong mỗi ngày của cậu có thêm một lý do để vui: một bài hát hay, một lời hỏi thăm, hay một điều nhỏ xinh bất ngờ.',
    'Dù tương lai có bận rộn đến đâu, mong cậu vẫn gặp được nhiều người tốt và có thật nhiều kỷ niệm đẹp.',
    'Cảm ơn cậu đã là chính mình. Cậu xứng đáng được tôn trọng, được lắng nghe và được yêu thương.',
    'Chúc Phương Anh ngày 20/10 thật vui, bình an và ngập tràn những điều dễ thương. 🌷',
    '— Hiển gửi cậu một chút dịu dàng 💗 —'
  ],
  // Sáu ảnh thật đã có trong thư mục assets/photos.
  puzzlePhoto: '01.jpg',
  cardPhoto:   '02.jpg',
  collageMs: 11500,
  photos: [
    { src: '01.jpg', cap: 'Một chiếc filter đáng yêu ♡' },
    { src: '02.jpg', cap: 'Một khoảnh khắc dịu dàng' },
    { src: '03.jpg', cap: 'Lưu lại chút đáng yêu ✨' },
    { src: '04.jpg', cap: 'Kỷ niệm nho nhỏ 🌷' },
    { src: '05.jpg', cap: 'Mong cậu luôn vui' },
    { src: '06.jpg', cap: 'Gửi Phương Anh 💗' }
  ],
  from: 'Hiển',
  to: 'Phương Anh',
  // [giây, cảnh, nội dung]  (bài nhạc dài ~60s)
  lines: [
    [0.6,  's1', () => `${CFG.from} có điều muốn nói với ${CFG.to}...`],
    [5.5,  's2', () => '20/10 sắp đến rồi nè 🌸'],
    [12.5, 's2', () => `${CFG.to} có biết không?`],
    [16,   's3', () => `${CFG.to} thật sự rất đáng yêu đó`],
    [25,   's4', () => 'chúc em mỗi ngày đều thật vui']
  ],
  end: 58
};
/* ================================== */

const $ = s => document.querySelector(s), sleep = ms => new Promise(r => setTimeout(r, ms));
const rnd = (a, b) => a + Math.random() * (b - a), B = document.body, AU = $('#au');
AU.volume = 0.65;
document.querySelectorAll('.to').forEach(e => e.textContent = CFG.to);
document.querySelectorAll('.from').forEach(e => e.textContent = CFG.from);
const PHP = Promise.all(CFG.photos.map(p => new Promise(r => { const i = new Image(); i.onload = () => r(true); i.onerror = () => r(false); i.src = p.src; }))).then(ok => CFG.photos.filter((p, i) => ok[i]));

/* đồng hồ theo nhạc */
let t0 = 0;
const now = () => (!AU.paused && AU.currentTime > 0) ? AU.currentTime : (performance.now() - t0) / 1000;
const until = async t => { while (now() < t) await sleep(60); };

/* canvas */
const sky = $('#sky'), sx = sky.getContext('2d'), fxc = $('#fx'), cx = fxc.getContext('2d');
let W, H;
function size() {
  const d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
  for (const c of [sky, fxc]) { c.width = W * d; c.height = H * d; c.getContext('2d').setTransform(d, 0, 0, d, 0, 0); }
}
addEventListener('resize', size); size();

const stars = Array.from({ length: W < 640 ? 110 : 160 }, () => ({ x: Math.random(), y: Math.random() * .85, r: rnd(.3, 1.5), p: rnd(0, 6.3), s: rnd(.01, .045) }));
let shoots = [], petals = [], flowers = [], heart = [], fw = [], spk = [], lastFw = 0, heartOn = false;

/* cánh hoa rơi */
const PC = ['#ff8fb5', '#ffb3cf', '#ffd0e3', '#c9a7ff'];
const addPetal = (x, y, burst) => petals.push({ x: x ?? rnd(0, W), y: y ?? -10, vx: burst ? rnd(-3, 3) : rnd(-.4, .7), vy: burst ? rnd(-4, -1) : rnd(.6, 1.5), r: rnd(3, 6.5), a: rnd(0, 6.3), va: rnd(-.05, .05), c: PC[(Math.random() * 4) | 0], l: burst ? 70 : 1e9 });

/* hoa nở */
function makeFlowers() {
  const n = W < 640 ? 7 : 12, t = performance.now();
  for (let i = 0; i < n; i++) flowers.push({ x: (i + .5) / n * W + rnd(-18, 18), h: rnd(.16, .4) * H, hue: rnd(300, 350), r: rnd(15, 28), d: i * 230, t, sw: rnd(-30, 30) });
}
function drawFlower(f, tt) {
  const g = Math.max(0, Math.min(1, (tt - f.t - f.d) / 2800)), e = 1 - Math.pow(1 - g, 3);
  if (e <= 0) return;
  const tx = f.x + f.sw * e + Math.sin(tt / 1200 + f.x) * 4, ty = H - f.h * e;
  cx.strokeStyle = '#4fd486'; cx.lineWidth = 2.5; cx.beginPath(); cx.moveTo(f.x, H);
  cx.quadraticCurveTo(f.x, H - f.h * e * .5, tx, ty); cx.stroke();
  const s = Math.max(0, (e - .55) / .45); if (s <= 0) return;
  cx.save(); cx.translate(tx, ty); cx.rotate(tt / 4000 + f.x);
  for (let k = 0; k < 7; k++) {
    cx.rotate(6.283 / 7); cx.fillStyle = `hsla(${f.hue},90%,${70 + (k % 2) * 8}%,.93)`;
    cx.beginPath(); cx.ellipse(0, -f.r * s * .9, f.r * s * .42, f.r * s * .9, 0, 0, 6.3); cx.fill();
  }
  cx.fillStyle = '#ffd966'; cx.beginPath(); cx.arc(0, 0, f.r * s * .32, 0, 6.3); cx.fill(); cx.restore();
}

/* trái tim bằng hạt sáng */
function makeHeart() {
  heart = [];
  for (let i = 0; i < 360; i++) {
    const t = rnd(0, 6.283), r = Math.random() < .35 ? rnd(.2, .95) : 1;
    heart.push({ x: rnd(0, W), y: Math.random() < .5 ? -20 : H + 20, tx: 16 * Math.sin(t) ** 3 * r,
      ty: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * r,
      c: Math.random() < .5 ? '255,90,140' : '255,160,200', s: rnd(1, 2.6), ph: rnd(0, 6.3) });
  }
}

/* pháo hoa & lấp lánh */
function burst(x, y) {
  const h = rnd(300, 360), n = 60;
  for (let i = 0; i < n; i++) { const a = i / n * 6.283, v = rnd(1.5, 4.4); fw.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 72, h: h + rnd(-30, 30) }); }
}
addEventListener('pointermove', e => { if (spk.length > 120) return; for (let i = 0; i < 2; i++) spk.push({ x: e.clientX, y: e.clientY, vx: rnd(-.8, .8), vy: rnd(-1.2, .2), r: rnd(1.5, 3.5), l: 32, c: Math.random() < .5 ? '255,200,230' : '210,180,255' }); });
addEventListener('pointerdown', e => { if (e.target.closest && e.target.closest('.piece,#lock,#ltr,#env')) return; for (let i = 0; i < 16; i++) addPetal(e.clientX, e.clientY, true); });

/* vòng lặp vẽ */
function tick(tt) {
  requestAnimationFrame(tick);
  sx.clearRect(0, 0, W, H); cx.clearRect(0, 0, W, H);
  for (const s of stars) { s.p += s.s; sx.globalAlpha = .3 + .7 * Math.abs(Math.sin(s.p)); sx.fillStyle = '#fff'; sx.beginPath(); sx.arc(s.x * W, s.y * H, s.r, 0, 6.3); sx.fill(); }
  sx.globalAlpha = 1;
  if (Math.random() < .01) shoots.push({ x: rnd(.1, .9) * W, y: rnd(0, .35) * H, vx: rnd(6, 10), vy: rnd(1.5, 3), l: 1 });
  for (const s of shoots) {
    s.x += s.vx; s.y += s.vy; s.l -= .02;
    const g = sx.createLinearGradient(s.x, s.y, s.x - s.vx * 10, s.y - s.vy * 10);
    g.addColorStop(0, `rgba(255,255,255,${s.l})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    sx.strokeStyle = g; sx.lineWidth = 1.6; sx.beginPath(); sx.moveTo(s.x, s.y); sx.lineTo(s.x - s.vx * 10, s.y - s.vy * 10); sx.stroke();
  }
  shoots = shoots.filter(s => s.l > 0);

  const cls = B.className;
  if ((/s[2-6]/.test(cls) || cls.includes('alb'))) {
    if (!flowers.length) makeFlowers();
    if (petals.length < 60 && Math.random() < .3) addPetal();
  }
  if (!/env|ltr/.test(cls)) for (const f of flowers) drawFlower(f, performance.now());
  for (const p of petals) {
    p.x += p.vx + Math.sin(p.a) * .4; p.y += p.vy; p.a += p.va; p.l--; if (p.l < 1e8) p.vy += .12;
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a); cx.fillStyle = p.c; cx.globalAlpha = Math.min(1, p.l / 30);
    cx.beginPath(); cx.ellipse(0, 0, p.r, p.r * .55, 0, 0, 6.3); cx.fill(); cx.restore();
  }
  petals = petals.filter(p => p.y < H + 20 && p.l > 0);

  cx.save(); cx.globalCompositeOperation = 'lighter';
  if (heart.length) {
    const m = W < 640, hx = W / 2, hy = H * (m ? .5 : .52), sc = Math.min(W, H) * (m ? .017 : .021), beat = 1 + .07 * Math.pow(Math.abs(Math.sin(tt / 380)), 6);
    for (const p of heart) {
      if (heartOn) { p.x += (hx + p.tx * sc * beat - p.x) * .05 + Math.sin(tt / 400 + p.ph) * .4; p.y += (hy + p.ty * sc * beat - p.y) * .05 + Math.cos(tt / 430 + p.ph) * .4; }
      else { p.y -= 1.2; p.x += Math.sin(p.ph + tt / 500) * .6; p.s *= .985; }
      cx.fillStyle = `rgba(${p.c},.18)`; cx.beginPath(); cx.arc(p.x, p.y, p.s * 4, 0, 6.3); cx.fill();
      cx.fillStyle = `rgba(${p.c},.95)`; cx.beginPath(); cx.arc(p.x, p.y, p.s, 0, 6.3); cx.fill();
    }
    if (!heartOn) heart = heart.filter(p => p.s > .15);
  }
  if (/s[456]/.test(cls) && tt - lastFw > 900) { burst(rnd(.15, .85) * W, rnd(.1, .45) * H); lastFw = tt; }
  for (const p of fw) { p.x += p.vx; p.y += p.vy; p.vy += .04; p.vx *= .99; p.l--; cx.fillStyle = `hsla(${p.h},100%,70%,${p.l / 72})`; cx.beginPath(); cx.arc(p.x, p.y, 2, 0, 6.3); cx.fill(); }
  fw = fw.filter(p => p.l > 0);
  for (const s of spk) { s.x += s.vx; s.y += s.vy; s.l--; cx.fillStyle = `rgba(${s.c},${s.l / 32})`; cx.beginPath(); cx.arc(s.x, s.y, s.r * (s.l / 32) + .4, 0, 6.3); cx.fill(); }
  spk = spk.filter(s => s.l > 0);
  cx.restore();
}
requestAnimationFrame(tick);

/* chữ gõ + chuyển cảnh */
async function say(t) {
  const m = $('#msg'); m.classList.remove('done'); m.textContent = '';
  for (const c of t) { m.textContent += c; await sleep(c === ' ' ? 40 : 70); }
  m.classList.add('done');
}
const FL = $('#flash');
function scene(sc) {
  B.className = 'on ' + sc; FL.classList.remove('go'); void FL.offsetWidth; FL.classList.add('go');
  if (sc === 's3') { heartOn = true; makeHeart(); } else heartOn = false;
  setMood(sc === 's3' ? 'love' : sc === 's6' ? 'happy' : sc === 's4' ? 'wink' : '');
  const SAY = { s1: 'Chào {to}! Tớ là Tim Tim 💗', s3: 'Trái tim này gửi {to} nè!', s6: 'Chúc mừng 20/10 💗' };
  if (SAY[sc]) setTimeout(() => botSay(SAY[sc], 3200), 900);
}
/* ảnh dùng cho ghép hình & thẻ thư: assets/photo.jpg (chưa có thì tự vẽ ảnh tạm) */
const PUZ_SRC = CFG.puzzlePhoto, N = 3;
function makeArt() {
  const c = document.createElement('canvas'); c.width = c.height = 800; const g = c.getContext('2d');
  const r = g.createRadialGradient(400, 360, 40, 400, 400, 620); r.addColorStop(0, '#6a2a9a'); r.addColorStop(1, '#1a0830');
  g.fillStyle = r; g.fillRect(0, 0, 800, 800);
  for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * .8})`; g.beginPath(); g.arc(Math.random() * 800, Math.random() * 800, Math.random() * 2 + .5, 0, 6.3); g.fill(); }
  g.shadowColor = '#ff5c9a'; g.shadowBlur = 60; g.fillStyle = '#ff6fa6'; g.beginPath();
  for (let i = 0; i <= 100; i++) { const t = i / 100 * 6.283, x = 400 + 16 * Math.sin(t) ** 3 * 15, y = 330 - (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 15; i ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.fill(); g.shadowBlur = 20; g.fillStyle = '#fff'; g.textAlign = 'center';
  g.font = '700 92px "Dancing Script",cursive'; g.fillText(CFG.to, 400, 670);
  g.font = '600 50px "Be Vietnam Pro",sans-serif'; g.fillText('20/10', 400, 740);
  return c.toDataURL('image/jpeg', .92);
}
async function randomPuzzleImage() {
  const available = await PHP;
  const chosen = available.length ? available[Math.floor(Math.random() * available.length)] : null;
  if (!chosen) return { src: makeArt(), w: 800, h: 800 };
  return await new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve({ src: chosen.src, w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ src: makeArt(), w: 800, h: 800 });
    img.src = chosen.src;
  });
}
{ const im = $('#card img'); im.onerror = () => { im.onerror = null; im.src = makeArt(); }; im.src = CFG.cardPhoto; }

/* trò ghép hình: kéo mảnh vào đúng ô */
function puzzle() {
  return new Promise(async res => {
    const info = await randomPuzzleImage(), P = $('#puz'), bd = $('#board');
    const S = Math.min(W * .84, H * .44, 420) | 0, c = S / N, bx = (W - S) / 2, by = Math.max(H * .2, 104);
    Object.assign(bd.style, { left: bx + 'px', top: by + 'px', width: S + 'px', height: S + 'px' });
    const sc = Math.max(S / info.w, S / info.h), bw = info.w * sc, bh = info.h * sc, ox = (S - bw) / 2, oy = (S - bh) / 2;
    bd.innerHTML = `<div class="ghost" style="background:url('${info.src}') ${ox}px ${oy}px/${bw}px ${bh}px no-repeat"></div>`;
    const ty0 = by + S + 16, ty1 = Math.max(ty0, H - c - 14); let z = 10, done = 0, fin = false;
    const finish = () => {
      if (fin) return; fin = true; bd.classList.add('solved');
      for (let i = 0; i < 4; i++) setTimeout(() => burst(rnd(.2, .8) * W, rnd(.1, .4) * H), i * 300);
      setTimeout(() => { P.querySelectorAll('.piece').forEach(p => p.remove()); res(); }, 1800);
    };
    for (let r = 0; r < N; r++) for (let k = 0; k < N; k++) {
      const p = document.createElement('div'); p.className = 'piece'; p.r = r; p.k = k;
      p.style.cssText = `width:${c}px;height:${c}px;left:${rnd(8, W - c - 8)}px;top:${rnd(ty0, ty1)}px;background:url('${info.src}') ${ox - k * c}px ${oy - r * c}px/${bw}px ${bh}px no-repeat`;
      p.onpointerdown = e => {
        p.setPointerCapture(e.pointerId); p.classList.add('drag'); p.style.zIndex = ++z;
        const dx = e.clientX - p.offsetLeft, dy = e.clientY - p.offsetTop;
        p.onpointermove = m => { p.style.left = m.clientX - dx + 'px'; p.style.top = m.clientY - dy + 'px'; };
        p.onpointerup = p.onpointercancel = () => {
          p.classList.remove('drag'); p.onpointermove = null;
          const tx = bx + p.k * c, ty = by + p.r * c;
          if (Math.hypot(p.offsetLeft - tx, p.offsetTop - ty) < c * .4) {
            p.style.left = tx + 'px'; p.style.top = ty + 'px'; p.style.zIndex = 1; p.classList.add('ok');
            if (++done === N * N) finish();
          }
        };
      };
      P.appendChild(p);
    }
    $('#skip').onclick = () => { P.querySelectorAll('.piece').forEach(p => { p.style.left = bx + p.k * c + 'px'; p.style.top = by + p.r * c + 'px'; p.classList.add('ok'); }); finish(); };
  });
}

/* album: cả 10 ảnh polaroid bay vào cùng lúc, xếp thành bức tranh ghép */
async function album() {
  const list = await PHP; if (!list.length) return;
  const polas = $('#polas'); polas.innerHTML = '';
  const n = list.length, cols = W < 640 ? 2 : 3, rows = Math.ceil(n / cols);
  const top0 = 104, cw = W * .94 / cols, ch = (H - top0 - 60) / rows;
  const w = Math.min(cw * 1.05, (ch * 1.2 - 42) / 1.25, 230), h = w * 1.25 + 42;
  const els = list.map((p, i) => {
    const r = Math.floor(i / cols), c = i % cols, inRow = Math.min(cols, n - r * cols);
    const x = (W - inRow * cw) / 2 + c * cw + cw / 2 + rnd(-cw * .05, cw * .05), y = top0 + r * ch + ch / 2 + rnd(-ch * .04, ch * .04);
    const f = document.createElement('figure'), im = document.createElement('img'), cp = document.createElement('figcaption');
    f.className = 'pola'; im.src = p.src; im.alt = ''; cp.textContent = p.cap || ''; f.append(im, cp);
    f.style.cssText = `width:${w}px;left:${x - w / 2}px;top:${y - h / 2}px;animation-delay:${i * 110}ms;--r:${rnd(-7, 7).toFixed(1)}deg;--fx:${rnd(-30, 30).toFixed(0)}vw;--tx:${rnd(-40, 40).toFixed(0)}vw`;
    polas.appendChild(f); void f.offsetWidth; f.classList.add('pop');
    setTimeout(() => { f.classList.add('idle'); for (let k = 0; k < 4; k++) addPetal(x + rnd(-20, 20), y, true); }, i * 110 + 700);
    return f;
  });
  let skip = false; $('#next').onclick = () => { skip = true; };
  const t = performance.now(); while (!skip && performance.now() - t < CFG.collageMs) await sleep(80);
  els.forEach((f, i) => { f.style.animation = 'none'; void f.offsetWidth; f.style.animation = `pout .7s ease-in ${i * 60}ms forwards`; setTimeout(() => f.remove(), 1500); });
  await sleep(1300);
}

/* phong bì + thư nhiều trang + ảnh nhỏ bay quanh */
const STK = '<svg class="stk" viewBox="0 0 40 42" aria-hidden="true"><path d="M20 38 C8 30 3 22 3 15 C3 9 8 5 13 5 C16 5 19 7 20 10 C21 7 24 5 27 5 C32 5 37 9 37 15 C37 22 32 30 20 38Z" fill="#ff5fa2" stroke="#ffd6e7" stroke-width="1.5"/><rect x="9" y="12" width="22" height="12" rx="6" fill="#2a0f3d"/><ellipse cx="15" cy="18" rx="2.2" ry="3" fill="#a8f5ff"/><ellipse cx="25" cy="18" rx="2.2" ry="3" fill="#a8f5ff"/><line x1="20" y1="10" x2="20" y2="3" stroke="#ffd6e7" stroke-width="1.5"/><circle cx="20" cy="2.5" r="2" fill="#fff"/></svg>';
function floatPhoto(list) {
  const p = list[(Math.random() * list.length) | 0], d = document.createElement('div'), im = new Image();
  im.src = p.src; im.alt = ''; d.className = 'floater'; d.appendChild(im);
  d.style.cssText = `width:${rnd(54, 92)}px;left:${rnd(2, 90)}vw;top:${rnd(4, 80)}vh;--r:${rnd(-14, 14).toFixed(0)}deg;--dx:${rnd(-30, 30).toFixed(0)}px;--dy:${rnd(-44, 10).toFixed(0)}px`;
  $('#floatL').appendChild(d); setTimeout(() => d.remove(), 7200);
}
async function envelope() {
  scene('env'); await sleep(900);
  await new Promise(r => $('#env').addEventListener('click', r, { once: true }));
  $('#envelope').classList.add('open'); $('.envhint').style.opacity = 0;
  for (let i = 0; i < 18; i++) addPetal(W / 2, H * .5, true);
  await sleep(2300);
}
async function letters() {
  scene('ltr');
  const pages = $('#pages'), cap = $('#lcap'), stage = $('#ltr'), photos = await PHP;
  const fl = photos.length ? setInterval(() => floatPhoto(photos), W < 640 ? 1900 : 1300) : 0;
  const L = CFG.letter.map(t => t.replace(/\{to\}/g, CFG.to).replace(/\{from\}/g, CFG.from));
  let fast = false, typed = false, nextFn = null, sx0 = 0, dir = 1;
  const onKey = e => { if ((e.key === 'Enter' || e.key === ' ') && nextFn) { e.preventDefault(); nextFn(); } }; // Enter/Space cũng lật trang được
  addEventListener('keydown', onKey);
  stage.onpointerdown = e => { sx0 = e.clientX; };
  stage.onpointerup = e => {
    const dx = e.clientX - sx0;
    if (Math.abs(dx) > 40) dir = dx < 0 ? -1 : 1; else if (Math.abs(dx) < 12) dir = Math.random() < .5 ? -1 : 1; else return;
    if (!typed) { fast = true; return; }
    if (nextFn) nextFn();
  };
  for (let i = 0; i < L.length; i++) {
    const pg = document.createElement('div'); pg.className = 'page in';
    pg.innerHTML = `<div class="pt"></div>${STK}<span class="cnt">${i + 1}/${L.length}</span>`; pages.appendChild(pg);
    const pt = pg.querySelector('.pt'); cap.textContent = 'Đợi lời nhắn viết xong nhé...'; typed = false; fast = false;
    await sleep(450);
    for (const ch of L[i]) { pt.textContent += ch; if (!fast) await sleep(ch === ' ' ? 30 : 55); }
    typed = true; cap.textContent = i < L.length - 1 ? 'Vuốt ngang hoặc chạm để đọc tiếp' : 'Chạm để tiếp tục ♥';
    await new Promise(r => { nextFn = r; }); nextFn = null;
    pg.style.setProperty('--dir', dir); pg.classList.remove('in'); pg.classList.add('out'); setTimeout(() => pg.remove(), 800);
    await sleep(350);
  }
  clearInterval(fl); removeEventListener('keydown', onKey); cap.textContent = ''; await sleep(500);
}

async function run() {
  for (const [t, sc, tx] of CFG.lines) {
    await until(t);
    if (!B.classList.contains(sc)) scene(sc);
    if (tx) await say(tx());
  }
  await envelope();
  await letters();
  scene('s5');
  await puzzle();
  scene('alb');
  await album();
  scene('s6');
  for (let i = 0; i < 5; i++) setTimeout(() => burst(rnd(.15, .85) * W, rnd(.1, .5) * H), i * 350);
  await sleep(9000);
  $('#again').classList.add('show');
}

/* tương tác */
const card = $('#card');
addEventListener('pointermove', e => {
  card.style.setProperty('--ry', ((e.clientX / W - .5) * 10).toFixed(1) + 'deg');
  card.style.setProperty('--rx', ((.5 - e.clientY / H) * 8).toFixed(1) + 'deg');
});
/* robot Tim Tim: có cảm xúc, nhìn theo con trỏ, nói chuyện, nhảy khi chạm */
const BOT = $('#bot'), BUB = $('#bubble');
let lastMove = 0, bubT = 0;
const pickLine = () => CFG.botLines[(Math.random() * CFG.botLines.length) | 0];
function setMood(m) { for (const c of ['happy', 'love', 'wink']) BOT.classList.toggle(c, c === m); }
function botSay(t, ms = 2800) {
  BUB.textContent = t.replace(/\{to\}/g, CFG.to).replace(/\{from\}/g, CFG.from); BUB.classList.add('show');
  clearTimeout(bubT); bubT = setTimeout(() => BUB.classList.remove('show'), ms);
}
BOT.addEventListener('click', () => {
  BOT.classList.remove('hop'); void BOT.offsetWidth; BOT.classList.add('hop');
  const prev = ['happy', 'love', 'wink'].find(c => BOT.classList.contains(c)) || '';
  setMood('love'); setTimeout(() => setMood(prev), 1600);
  const r = BOT.getBoundingClientRect(); for (let i = 0; i < 14; i++) addPetal(r.left + r.width / 2, r.top + r.height * .3, true);
  botSay(pickLine());
});
addEventListener('pointermove', e => {
  lastMove = performance.now();
  const r = BOT.getBoundingClientRect(), dx = (e.clientX - (r.left + r.width / 2)) / W, dy = (e.clientY - (r.top + r.height / 2)) / H;
  BOT.style.setProperty('--dx', (Math.max(-1, Math.min(1, dx * 3)) * 5).toFixed(1) + 'px');
  BOT.style.setProperty('--dy', (Math.max(-1, Math.min(1, dy * 3)) * 4).toFixed(1) + 'px');
});
setInterval(() => { if (performance.now() - lastMove > 2500) { BOT.style.setProperty('--dx', rnd(-4, 4).toFixed(1) + 'px'); BOT.style.setProperty('--dy', rnd(-2, 3).toFixed(1) + 'px'); } }, 1800);
setInterval(() => { if (B.classList.contains('on') && !/env|ltr|alb|s5/.test(B.className) && !BUB.classList.contains('show')) botSay(pickLine()); }, 12000);
/* Bộ điều khiển nhạc: phát/tạm dừng, tắt tiếng, tua và âm lượng */
const playPause = $('#playPause'), musicProgress = $('#musicProgress'), musicVolume = $('#musicVolume');
const songSelect = $('#songSelect'), musicTitle = $('#musicTitle');
const fmtTime = s => { if (!Number.isFinite(s) || s < 0) s = 0; return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`; };
function paintMusic() {
  playPause.textContent = AU.paused ? '▶' : 'Ⅱ';
  playPause.setAttribute('aria-label', AU.paused ? 'Phát nhạc' : 'Tạm dừng nhạc');
  $('#musicCurrent').textContent = fmtTime(AU.currentTime);
  $('#musicDuration').textContent = fmtTime(AU.duration);
  if (!musicProgress.matches(':active') && Number.isFinite(AU.duration) && AU.duration > 0) musicProgress.value = String(Math.round(AU.currentTime / AU.duration * 1000));
  $('#mute').textContent = AU.muted ? '♪̸' : '♫';
  $('#mute').setAttribute('aria-pressed', String(AU.muted));
  musicTitle.textContent = songSelect.options[songSelect.selectedIndex].text.replace(/^\d+\.\s*/, '') + ' ♡';
}
async function selectSong(index, autoplay = true) {
  const count = songSelect.options.length;
  songSelect.selectedIndex = (index + count) % count;
  AU.src = songSelect.value;
  AU.load();
  musicProgress.value = '0';
  paintMusic();
  if (autoplay) {
    try { await AU.play(); }
    catch (_) { botSay('Nếu nhạc chưa phát, hãy chạm nút phát nhé ♫'); }
  }
}
playPause.addEventListener('click', async () => {
  if (AU.paused) { try { await AU.play(); } catch (_) { botSay('Chạm lần nữa để bật nhạc nhé ♫'); } }
  else AU.pause();
  paintMusic();
});
$('#mute').addEventListener('click', () => { AU.muted = !AU.muted; paintMusic(); });
musicVolume.addEventListener('input', () => { AU.volume = Number(musicVolume.value); if (AU.volume > 0 && AU.muted) AU.muted = false; paintMusic(); });
musicProgress.addEventListener('input', () => { if (Number.isFinite(AU.duration) && AU.duration > 0) { AU.currentTime = Number(musicProgress.value) / 1000 * AU.duration; paintMusic(); } });
songSelect.addEventListener('change', () => selectSong(songSelect.selectedIndex, true));
$('#prevSong').addEventListener('click', () => selectSong(songSelect.selectedIndex - 1, true));
$('#nextSong').addEventListener('click', () => selectSong(songSelect.selectedIndex + 1, true));
AU.addEventListener('ended', () => selectSong(songSelect.selectedIndex + 1, true));
['timeupdate','loadedmetadata','durationchange','play','pause','volumechange','ended'].forEach(ev => AU.addEventListener(ev, paintMusic));
$('#again').addEventListener('click', () => location.reload());
paintMusic();
/* khóa tình yêu: bàn phím số */
const norm = s => String(s).replace(/\D/g, '');
const LEN = norm(CFG.password).length;
const lockEl = $('#lock'), pl = $('#padlock'), err = $('#err'), dotsEl = $('#pdots'), lp = $('#lockPhoto'), lcard = $('.lockcard');
$('#hint').textContent = CFG.hint;
lp.onerror = () => { lp.onerror = null; lp.src = makeArt(); }; lp.src = CFG.lockPhoto;
dotsEl.innerHTML = '<i></i>'.repeat(LEN);
const relationship = $('#relationship'), friendResult = $('#friendResult'), passwordPanel = $('#passwordPanel');
$('#relationshipChoices').addEventListener('click', e => {
  const button = e.target.closest('button[data-relation]');
  if (!button) return;
  if (button.dataset.relation === 'love') {
    relationship.hidden = true;
    friendResult.hidden = true;
    passwordPanel.hidden = false;
    err.textContent = '';
  } else {
    relationship.hidden = true;
    passwordPanel.hidden = true;
    friendResult.hidden = false;
    const broken = $('.broken-heart');
    broken.classList.remove('break-pop');
    void broken.offsetWidth;
    broken.classList.add('break-pop');
    navigator.vibrate && navigator.vibrate([90, 60, 160]);
  }
});
$('#tryLove').addEventListener('click', () => {
  friendResult.hidden = true;
  relationship.hidden = false;
});
let pin = '', opened = false;
const paint = () => [...dotsEl.children].forEach((d, i) => d.classList.toggle('on', i < pin.length));
function press(d) { if (opened) return; err.textContent = ''; navigator.vibrate && navigator.vibrate(10); if (pin.length < LEN) pin += d; paint(); if (pin.length === LEN) setTimeout(check, 180); }
function check() {
  if (opened) return;
  if (pin === norm(CFG.password)) {
    opened = true; err.textContent = '';
    document.title = '💗 Chúc mừng 20/10';
    navigator.vibrate && navigator.vibrate([40, 40, 40, 40, 40]);
    AU.loop = true; t0 = performance.now(); AU.volume = 0;
    const pr = AU.play(); if (pr) pr.catch(() => {});
    let vol = 0; const targetVolume = Number($('#musicVolume').value || .65);
    const fade = setInterval(() => { vol = Math.min(targetVolume, vol + .04); AU.volume = vol; if (vol >= targetVolume) clearInterval(fade); }, 120);
    pl.classList.add('open'); FL.classList.remove('go'); void FL.offsetWidth; FL.classList.add('go');
    for (let i = 0; i < 24; i++) addPetal(W / 2, H * .4, true);
    setTimeout(() => { lockEl.classList.add('gone'); run(); }, 1600);
  } else {
    err.textContent = 'Chưa đúng rồi, thử lại nha 🥺'; pin = ''; paint();
    navigator.vibrate && navigator.vibrate([80, 40, 80]);
    lcard.classList.remove('bad'); void lcard.offsetWidth; lcard.classList.add('bad');
  }
}
$('#keys').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.k === 'del') { pin = pin.slice(0, -1); paint(); } else press(b.dataset.k);
});
addEventListener('keydown', e => {
  if (opened || lockEl.classList.contains('gone') || passwordPanel.hidden) return;
  if (/^\d$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') { pin = pin.slice(0, -1); paint(); }
});
