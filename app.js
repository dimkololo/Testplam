// === DEBUG переключатель ===
const DEBUG = true; // поставь false, когда всё ок
if (DEBUG) document.body.classList.add('__debug');

// Telegram WebApp (необязательно)
if (window.Telegram && window.Telegram.WebApp) {
  try { window.Telegram.WebApp.expand(); } catch(e) {}
}

// Модалка
const modalRoot = document.querySelector('[data-modal-root]');
const modalContent = document.querySelector('[data-modal-content]');

const ScrollLock = {
  lock(){ document.documentElement.style.overflow = 'hidden'; },
  unlock(){ document.documentElement.style.overflow = ''; }
};

function openModal(id){
  const tpl = document.getElementById(`tpl-${id}`);
  if(!tpl) { console.warn('[openModal] template not found:', id); return; }
  modalContent.innerHTML = '';
  modalContent.appendChild(tpl.content.cloneNode(true));
  modalRoot.hidden = false;
  modalRoot.setAttribute('aria-hidden','false');
  ScrollLock.lock();
  if(id === 'upload-popup') initUploadPopup();
  if(id === 'buy-stars') initBuyStars();
}
function closeModal(){
  modalRoot.hidden = true;
  modalRoot.setAttribute('aria-hidden','true');
  modalContent.innerHTML = '';
  ScrollLock.unlock();
}

// Делегирование (оставляем)
document.addEventListener('click', (e) => {
  const opener = e.target.closest('[data-open-modal]');
  if (opener) {
    const id = opener.getAttribute('data-open-modal');
    if (DEBUG) console.log('[delegate] open', id);
    openModal(id);
    return;
  }
  if (e.target.matches('[data-dismiss]') || e.target.closest('[data-dismiss]')) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modalRoot.hidden) closeModal();
});

// Прямые слушатели на хот-споты (важно для устройств/эмуляторов)
function bindHotspots() {
  const stump = document.querySelector('.hotspot--stump');
  const plus  = document.querySelector('.hotspot--plus');

  if (stump) {
    stump.addEventListener('click', (e) => {
      if (DEBUG) console.log('[click] stump hotspot');
      openModal('upload-popup');
    });
  } else if (DEBUG) { console.warn('[bindHotspots] .hotspot--stump not found'); }

  if (plus) {
    plus.addEventListener('click', (e) => {
      if (DEBUG) console.log('[click] plus hotspot');
      openModal('buy-stars');
    });
  } else if (DEBUG) { console.warn('[bindHotspots] .hotspot--plus not found'); }
}
bindHotspots();

// Попап №1
function initUploadPopup(){
  const root = modalRoot.querySelector('.upload-popup');
  if(!root) { if (DEBUG) console.warn('[initUploadPopup] root not found'); return; }

  const fileInput = root.querySelector('#file-input');
  const btnPick = root.querySelector('.btn-pick');
  if(btnPick && fileInput){
    btnPick.addEventListener('click', () => {
      if (DEBUG) console.log('[upload] pick photo');
      fileInput.click();
    });
  }

  const range = root.querySelector('.range');
  const starsEl = root.querySelector('[data-stars]');
  const secsEl  = root.querySelector('[data-secs]');
  const plural = (n, one, many) => (n === 1 ? one : many);
  if(range && starsEl && secsEl){
    const update = () => {
      const v = parseInt(range.value, 10);
      starsEl.textContent = `${v} ${plural(v, 'star', 'stars')}`;
      secsEl.textContent  = `${v} sec`;
    };
    range.addEventListener('input', update);
    update();
  }

  const form = root.querySelector('[data-upload-form]');
  if(form){
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      if (DEBUG) console.log('[upload] submit', data);
      if (window.Telegram?.WebApp) {
        try { window.Telegram.WebApp.sendData(JSON.stringify({type:'upload', ...data})); } catch(_) {}
      }
      closeModal();
    });
  }
}

// Попап №2 (звёзды)
function initBuyStars(){
  const root = modalRoot.querySelector('.shop-popup');
  if(!root) { if (DEBUG) console.warn('[initBuyStars] root not found'); return; }

  root.querySelectorAll('.shop-item').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const amount = btn.dataset.amount;
      if (DEBUG) console.log('[buyStars] amount', amount);
      if (window.Telegram?.WebApp) {
        try { window.Telegram.WebApp.sendData(JSON.stringify({type:'buyStars', amount})); } catch(_) {}
      }
      closeModal();
    });
  });
}

// Подстраховка выбора фона (оставляем)
(function ensureCorrectBackground() {
  const img = document.querySelector('.stage__img');
  if (!img) return;
  const w = window.innerWidth, h = window.innerHeight;
  if (h >= 1024 || w >= 768) {
    img.src = './bgicons/bg-large.png';
    img.srcset = './bgicons/bg-large.png 1x, ./bgicons/bg-large@2x.png 2x';
  } else if (w <= 360 || h <= 640) {
    img.src = './bgicons/bg-small.png';
    img.srcset = './bgicons/bg-small.png 1x, ./bgicons/bg-small@2x.png 2x';
  } else {
    img.src = './bgicons/bg-medium.png';
    img.srcset = './bgicons/bg-medium.png 1x, ./bgicons/bg-medium@2x.png 2x';
  }
})();
