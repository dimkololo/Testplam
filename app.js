// Telegram WebApp (опционально)
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
  if(!tpl) return;
  modalContent.innerHTML = '';
  modalContent.appendChild(tpl.content.cloneNode(true));
  modalRoot.hidden = false;
  modalRoot.setAttribute('aria-hidden','false');
  ScrollLock.lock();
  if(id === 'upload-popup') initUploadPopup();
}

function closeModal(){
  modalRoot.hidden = true;
  modalRoot.setAttribute('aria-hidden','true');
  modalContent.innerHTML = '';
  ScrollLock.unlock();
}

// Клики по хит-зонам и закрытие
document.addEventListener('click', (e) => {
  const opener = e.target.closest('[data-open-modal]');
  if (opener) { openModal(opener.getAttribute('data-open-modal')); return; }
  if (e.target.matches('[data-dismiss]') || e.target.closest('[data-dismiss]')) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modalRoot.hidden) closeModal();
});

// Попап №1
function initUploadPopup(){
  const root = modalRoot.querySelector('.upload-popup');
  if(!root) return;

  // выбрать фото
  const fileInput = root.querySelector('#file-input');
  const btnPick = root.querySelector('.btn-pick');
  if(btnPick && fileInput){
    btnPick.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      if(fileInput.files?.length){
        console.log('Выбрано фото:', fileInput.files[0].name);
      }
    });
  }

  // слайдер 1..20
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

  // отправка формы (позже добавим реальную отправку/preview)
  const form = root.querySelector('[data-upload-form]');
  if(form){
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      console.log('Submit:', data);
      if (window.Telegram && window.Telegram.WebApp) {
        try { window.Telegram.WebApp.sendData(JSON.stringify(data)); } catch(_) {}
      }
      closeModal();
    });
  }
}

console.log('App ready');
