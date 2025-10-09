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

  // выбрать фото
  const fileInput = root.querySelector('#file-input');
  root.querySelector('.btn-pick')?.addEventListener('click', () => fileInput?.click());

  // слайдер 0..20 → отображаем "X PLAMc" слева и "X сек" справа
  const range = root.querySelector('.range');
  const starsEl = root.querySelector('[data-stars]');
  const secsEl  = root.querySelector('[data-secs]');
  if(range && starsEl && secsEl){
    const update = () => {
      const v = parseInt(range.value, 10);
      starsEl.textContent = `${v} PLAMc`;
      secsEl.textContent  = `${v} сек`;
    };
    range.addEventListener('input', update);
    update();
  }

  // отправка формы: проверки баланса
  const form = root.querySelector('[data-upload-form]');
  if(form){
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const need = parseInt(range?.value || '0', 10) || 0;

      if (need > 0 && STATE.coins <= 0) {
        alert('Недостаточно PLAMc');
        return;
      }
      if (need > STATE.coins) {
        alert('Недостаточно PLAMc');
        return;
      }

      // хватает: резервируем/списываем
      STATE.coins -= need;

      // TODO: сюда твоя фактическая отправка
      // fetch(...)

      closeModal();
    });
  }
}


// ===== Попап #2 (звёзды)
function initBuyStars(){
  const root = modalRoot.querySelector('.shop-popup');
  if(!root) return;

  // поле баланса
  const $balance = root.querySelector('[data-balance-input]');
  const renderBalance = () => { if ($balance) $balance.value = String(STATE.coins); };
  renderBalance();

  // выбор пакета — считаем, что 1 PLAMc = 1 звезда
  root.querySelectorAll('.shop-item').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const amount = Number(btn.dataset.amount || 0);
      // пополняем баланс
      STATE.coins += amount;
      renderPlusBalance();


      // можно послать событие в TG, если нужно
      if (window.Telegram?.WebApp) {
        try { window.Telegram.WebApp.sendData(JSON.stringify({type:'buyStars', amount})); } catch(_) {}
      }
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
function renderPlusBalance(){
  const el = document.querySelector('[data-plus-balance]');
  if (el) el.textContent = String(STATE.coins);
}


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

renderPlusBalance();


// DEBUG контуры хот-спотов (оставь пока удобно)
document.body.classList.add('__debug');
