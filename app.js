// ============================
//  PLAM WEBAPP CORE LOGIC
// ============================

// Telegram WebApp SDK инициализация (если открыт внутри Telegram)
if (window.Telegram && window.Telegram.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.expand(); // делает webapp на всю высоту
  console.log("Telegram WebApp инициализирован");
}

// ============================
//  Управление модалками
// ============================
const modalRoot = document.querySelector('[data-modal-root]');
const modalContent = document.querySelector('[data-modal-content]');

const ScrollLock = {
  lock() { document.documentElement.style.overflow = 'hidden'; },
  unlock() { document.documentElement.style.overflow = ''; }
};

function openModal(id) {
  const tpl = document.getElementById(`tpl-${id}`);
  if (!tpl) {
    console.warn("Шаблон попапа не найден:", id);
    return;
  }

  modalContent.innerHTML = "";
  modalContent.appendChild(tpl.content.cloneNode(true));

  modalRoot.hidden = false;
  modalRoot.setAttribute("aria-hidden", "false");
  ScrollLock.lock();

  // Инициализация конкретного попапа
  if (id === "upload-popup") initUploadPopup();
}

function closeModal() {
  modalRoot.hidden = true;
  modalRoot.setAttribute("aria-hidden", "true");
  modalContent.innerHTML = "";
  ScrollLock.unlock();
}

// Слушатели на открытие/закрытие
document.addEventListener("click", (e) => {
  const opener = e.target.closest("[data-open-modal]");
  if (opener) {
    const id = opener.getAttribute("data-open-modal");
    openModal(id);
    return;
  }

  if (e.target.matches("[data-dismiss]") || e.target.closest("[data-dismiss]")) {
    closeModal();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalRoot.hidden) closeModal();
});

// ============================
//  Логика попапа загрузки фото
// ============================
function initUploadPopup() {
  const root = modalRoot.querySelector(".upload-popup");
  if (!root) return;

  // 1️⃣ Выбрать фото
  const fileInput = root.querySelector("#file-input");
  const labelBtn = root.querySelector(".div2");
  if (labelBtn && fileInput) {
    labelBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
      if (fileInput.files.length > 0) {
        console.log("Выбрано фото:", fileInput.files[0].name);
      }
    });
  }

  // 2️⃣ Слайдер stars/sec
  const range = root.querySelector(".range");
  const starsEl = root.querySelector("[data-stars]");
  const secsEl = root.querySelector("[data-secs]");
  const plural = (n, one, many) => (n === 1 ? one : many);

  if (range && starsEl && secsEl) {
    const update = () => {
      const v = parseInt(range.value, 10);
      starsEl.textContent = `${v} ${plural(v, "star", "stars")}`;
      secsEl.textContent = `${v} sec`;
    };
    range.addEventListener("input", update);
    update();
  }

  // 3️⃣ Плейсхолдеры исчезают при фокусе, возвращаются при blur
  const phFields = root.querySelectorAll("[data-ph]");
  phFields.forEach((el) => {
    const original = el.getAttribute("data-ph") || "";
    el.addEventListener("focus", () => {
      el.setAttribute("data-ph", el.placeholder);
      el.placeholder = "";
    });
    el.addEventListener("blur", () => {
      if (!el.value.trim()) el.placeholder = original;
    });
  });

  // 4️⃣ Отправка формы
  const form = root.querySelector("[data-upload-form]");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const social = formData.get("social");
      const desc = formData.get("desc");

      console.log("Форма отправлена:", { social, desc });

      // Если приложение запущено в Telegram
      if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.sendData(JSON.stringify({ social, desc }));
        tg.close(); // можно закрыть webapp после отправки
      }

      closeModal();
    });
  }
}

// ============================
//  Готово!
// ============================
console.log("app.js подключен и работает 👍");
