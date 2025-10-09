// Telegram WebApp (не обязательно)
if (window.Telegram && window.Telegram.WebApp) {
  try { window.Telegram.WebApp.expand(); } catch (e) {}
}

const modalRoot = document.querySelector('[data-modal-root]');
const modalContent = document.querySelector('[data-modal-content]');

const ScrollLock = {
  lock(){ document.documentElement.style.overflow = 'hidden'; },
  unlock(){ document.documentElement.style.overflow = ''; }
};

function openModal(id){
  const tpl = document.getElementById(`tpl-${id}`);
  if(!tpl) return;
  modalContent.innerHTML = '';
  modalContent.appendChild(tpl.content.cloneNode(true));
  modalRoot.hidden = false;
  modalRoot.setAttribute('aria-hidden','false');
  ScrollLock.lock();

  if(id === 'upload-popup') initUploadPopup();
  if(id === 'buy-stars')    initBuyStars();
  if(id === 'prizes')       initPrizesPopup();
  if(id === 'profile')      initProfilePopup();
  if(id === 'confirm-premium') initConfirmPremium();
}

function closeModal(){
  modalRoot.hidden = true;
  modalRoot.setAttribute('aria-hidden','true');
  modalContent.innerHTML = '';
  ScrollLock.unlock();
}

document.addEventListener('click', (e) => {
  const opener = e.target.closest('[data-open-modal]');
  if (opener) { openModal(opener.getAttribute('data-open-modal')); return; }
  if (e.target.matches('[data-dismiss]') || e.target.closest('[data-dismiss]')) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modalRoot.hidden) closeModal();
});

// ===== Попап #1 (загрузить фото)
function initUploadPopup(){
  const root = modalRoot.querySelector('.upload-popup');
  if(!root) return;

  const fileInput = root.querySelector('#file-input');
  root.querySelector('.btn-pick')?.addEventListener('click', () => fileInput?.click());

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

  root.querySelector('[data-upload-form]')?.addEventListener('submit', (e) => {
    e.preventDefault();
    closeModal();
  });
}

// ===== Попап #2 (звёзды)
function initBuyStars(){
  const root = modalRoot.querySelector('.shop-popup');
  if(!root) return;
  root.querySelectorAll('.shop-item').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      // TODO: покупка
      closeModal();
    });
  });
}

// ===== Попап #3 (призы)
function initPrizesPopup(){
  const root = modalRoot.querySelector('.prizes-popup');
  if(!root) return;
  const checks = [...root.querySelectorAll('.check-input')];
  const btn = root.querySelector('.btn-pay');

  const sync = ()=> btn.disabled = !checks.some(c=>c.checked);
  checks.forEach(c=>c.addEventListener('change', sync));
  sync();

  btn?.addEventListener('click', ()=> closeModal());
}

// ===== Попап #4 (профиль + подтверждение)
const STATE = { coins: 0, pricePremium: 500, hasPremium: false, totalPhotos: 0 };

function computeShowTimeSec(total){ return 20 + Math.floor(Number(total||0)/100); }

function initProfilePopup(){
  const root = modalRoot.querySelector('.profile-popup');
  if(!root) return;

  // TG user
  try{
    const u = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (u) {
      root.querySelector('[data-username]').textContent = u.username ? '@'+u.username : (u.first_name || 'User');
      if (u.photo_url) root.querySelector('[data-avatar]').style.backgroundImage = `url('${u.photo_url}')`;
    }
  }catch(_){}

  const btn = root.querySelector('[data-btn-premium]');
  const pillPhotos = root.querySelector('[data-photo-count]');
  const showSec = root.querySelector('[data-show-seconds]');

  function render(){
    pillPhotos.textContent = String(STATE.totalPhotos);
    showSec.textContent = computeShowTimeSec(STATE.totalPhotos) + ' сек';
    if (STATE.hasPremium){
      btn.classList.add('is-owned'); btn.textContent = 'Премиум'; btn.disabled = true;
    } else {
      btn.classList.remove('is-owned'); btn.textContent = 'Получить премиум'; btn.disabled = false;
    }
  }
  render();

  btn.addEventListener('click', ()=>{
    if (STATE.hasPremium) return;
    if (STATE.coins < STATE.pricePremium) { closeModal(); openModal('buy-stars'); return; }
    openModal('confirm-premium');
  });
}

function initConfirmPremium(){
  const root = modalRoot.querySelector('.confirm-popup');
  if(!root) return;
  root.querySelector('[data-confirm-yes]')?.addEventListener('click', ()=>{
    if (STATE.coins < STATE.pricePremium) { closeModal(); openModal('buy-stars'); return; }
    STATE.coins -= STATE.pricePremium; STATE.hasPremium = true;
    closeModal(); openModal('profile');
  });
}

// DEBUG контуры хот-спотов (оставь пока удобно)
document.body.classList.add('__debug');
