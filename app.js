// Telegram WebApp
if (window.Telegram && window.Telegram.WebApp) {
  try { window.Telegram.WebApp.expand(); } catch(e) {}
}

// ===== Глобальное состояние
const STATE = {
  coins: 0,           // баланс PLAMc
  hasPremium: false,
  pricePremium: 500,  // заглушка
  totalPhotos: 0
};

// ===== Модалка
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

  // инициализации
  if(id === 'upload-popup') initUploadPopup();
  if(id === 'buy-stars')    initBuyStars();
  if(id === 'prizes')       initPrizes();
  if(id === 'profile')      initProfile();
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

// ===== Индикатор баланса на плюс-облаке
function renderPlusBalance(){
  const el = document.querySelector('.hotspot--plus [data-plus-balance]');
  if (el) el.textContent = String(STATE.coins);
}
renderPlusBalance();

// ====== Попап №1 — загрузка фото
function initUploadPopup(){
  const root = modalRoot.querySelector('.upload-popup');
  if(!root) return;

  const fileInput = root.querySelector('#file-input');
  root.querySelector('.btn-pick')?.addEventListener('click', ()=>fileInput?.click());

  const range = root.querySelector('.range');
  const starsEl = root.querySelector('[data-stars]');
  const secsEl  = root.querySelector('[data-secs]');
  if(range && starsEl && secsEl){
    const update = () => {
      const v = parseInt(range.value, 10) || 0;
      starsEl.textContent = `${v} PLAMc`;
      secsEl.textContent  = `${v} сек`;
    };
    range.addEventListener('input', update);
    update();
  }

  const form = root.querySelector('[data-upload-form]');
  if(form){
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const need = parseInt(range?.value || '0', 10) || 0;

      if (need > 0 && STATE.coins <= 0) { alert('Недостаточно PLAMc'); return; }
      if (need > STATE.coins) { alert('Недостаточно PLAMc'); return; }

      // списываем
      STATE.coins -= need;
      renderPlusBalance();

      // TODO: отправка на сервер/в TG
      closeModal();
    });
  }
}

// ====== Попап №2 — покупка
function initBuyStars(){
  const root = modalRoot.querySelector('.shop-popup');
  if(!root) return;

  root.querySelectorAll('.shop-item').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const amount = Number(btn.dataset.amount || 0);
      STATE.coins += amount;
      renderPlusBalance();

      if (window.Telegram?.WebApp) {
        try { window.Telegram.WebApp.sendData(JSON.stringify({type:'buyStars', amount})); } catch(_) {}
      }
    });
  });
}

// ====== Попап №3 — призы
function initPrizes(){
  const root = modalRoot.querySelector('.prizes-popup');
  if(!root) return;

  const payBtn = root.querySelector('.btn-pay');
  const sync = () => {
    const anyChecked = root.querySelector('.check-input:checked');
    payBtn.disabled = !anyChecked;
  };
  root.addEventListener('change', (e)=>{
    if(e.target.matches('.check-input')) sync();
  });
  sync();

  payBtn.addEventListener('click', ()=>{
    // TODO: здесь будет вызов выплаты
    closeModal();
  });
}

// ====== Попап №4 — профиль/премиум
function initProfile(){
  const root = modalRoot.querySelector('.profile-popup');
  if(!root) return;

  // Заглушки аватар/ник
  root.querySelector('[data-username]').textContent = '@tg profile';
  // root.querySelector('[data-avatar]').style.backgroundImage = `url(...)`;

  // Премиум
  const btn = root.querySelector('[data-btn-premium]');
  const updateBtn = () => {
    if (STATE.hasPremium){
      btn.textContent = 'Премиум';
      btn.classList.add('is-owned');
      btn.disabled = true;
    } else {
      btn.textContent = 'Получить премиум';
      btn.classList.remove('is-owned');
      btn.disabled = false;
    }
  };
  updateBtn();

  btn.addEventListener('click', ()=>{
    if (STATE.hasPremium) return;
    openModal('confirm-premium');
  });

  // Фотостатистика (заглушка)
  root.querySelector('[data-photo-count]').textContent = String(STATE.totalPhotos);
  const seconds = 20 + Math.floor(STATE.totalPhotos / 100);
  root.querySelector('[data-show-seconds]').textContent = `${seconds} сек`;
}

// Мини-подтверждение премиума
function initConfirmPremium(){
  const root = modalRoot.querySelector('.confirm-popup');
  if(!root) return;

  root.querySelector('[data-confirm-yes]')?.addEventListener('click', ()=>{
    // проверим баланс (условно стоимость премиума)
    if (STATE.coins < STATE.pricePremium){
      closeModal();
      // денег мало — отправляем в покупку
      openModal('buy-stars');
      return;
    }
    STATE.coins -= STATE.pricePremium;
    STATE.hasPremium = true;
    renderPlusBalance();
    closeModal();
  });
}
