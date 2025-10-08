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

document.addEventListener('click', (e) => {
  const opener = e.target.closest('[data-open-modal]');
  if (opener) { openModal(opener.getAttribute('data-open-modal')); return; }
  if (e.target.matches('[data-dismiss]') || e.target.closest('[data-dismiss]')) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modalRoot.hidden) closeModal();
});

// Попап №1
const root = document.body; // или другой контейнер, если шаблон вставляется динамически
const template = document.getElementById('tpl-upload-popup');
const popup = template.content.cloneNode(true);
root.appendChild(popup);

// Элементы
const form = root.querySelector('[data-upload-form]');
const fileInput = root.querySelector('#file-input');
const range = root.querySelector('.range');
const starsEl = root.querySelector('[data-stars]');
const secsEl = root.querySelector('[data-secs]');

// Обновление текста при движении слайдера
const plural = (n, one, many) => (n === 1 ? one : many);
if (range && starsEl && secsEl) {
  const update = () => {
    const v = parseInt(range.value, 10);
    starsEl.textContent = `${v} ${plural(v, 'PLAMc', 'PLAMc')}`;
    secsEl.textContent = `${v} сек`;
  };
  range.addEventListener('input', update);
  update();
}

// Обработчик отправки формы
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const file = fileInput.files[0];
  if (!file) {
    alert('Пожалуйста, выбери фото 📸');
    return;
  }

  const formData = new FormData();
  formData.append('photo', file);
  formData.append('social', form.social.value);
  formData.append('desc', form.desc.value);
  formData.append('secs', range.value);

  try {
    const response = await fetch('https://your-server.vercel.app/api/upload', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    alert(result.message || 'Фото успешно отправлено!');
  } catch (err) {
    console.error(err);
    alert('Ошибка при отправке 😢');
  }
});
console.log('App ready');
