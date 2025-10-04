
// Init Telegram WebApp API (safe in browser without Telegram)
const tg = window.Telegram?.WebApp;
try{
  if (tg) {
    tg.expand();
    tg.ready();
    // Optional theme sync
    document.documentElement.style.setProperty('--bg', tg.themeParams?.bg_color || getComputedStyle(document.documentElement).getPropertyValue('--bg'));
  }
}catch(e){ console.warn('TG init error', e); }

const manifestUrl = window.__ASSETS_MANIFEST_PATH__;
const el = {
  brandIcon: document.getElementById('brandIcon'),
  iconsGrid: document.getElementById('iconsGrid'),
  screensGrid: document.getElementById('screensGrid'),
  popup: document.getElementById('popup'),
  popupImg: document.getElementById('popupImage'),
  openPopupBtn: document.getElementById('openPopupBtn'),
  closePopupBtn: document.getElementById('closePopupBtn'),
  cancelBtn: document.getElementById('cancelBtn'),
  okBtn: document.getElementById('okBtn'),
  popupBackdrop: document.getElementById('popupBackdrop'),
};

function openPopup(){ el.popup.classList.remove('hidden'); }
function closePopup(){ el.popup.classList.add('hidden'); }

el.openPopupBtn.addEventListener('click', openPopup);
el.closePopupBtn.addEventListener('click', closePopup);
el.cancelBtn.addEventListener('click', closePopup);
el.okBtn.addEventListener('click', closePopup);
el.popupBackdrop.addEventListener('click', closePopup);

// Fill popup image srcset
if (window.__SAMPLE_POPUP_1x__){
  const src1x = window.__SAMPLE_POPUP_1x__.replace(/^/,'./');
  const src2x = (window.__SAMPLE_POPUP_2x__ || window.__SAMPLE_POPUP_1x__).replace(/^/,'./');
  el.popupImg.setAttribute('src', src1x);
  el.popupImg.setAttribute('srcset', `${src1x} 1x, ${src2x} 2x`);
}

// Icon for header
if (window.__SAMPLE_ICON__){
  el.brandIcon.src = './' + window.__SAMPLE_ICON__;
}

// Load manifest and render some assets
fetch(manifestUrl)
  .then(r => r.json())
  .then(list => {
    const icons = list.filter(x => x.category === 'icons').slice(0, 12);
    const screens = list.filter(x => x.category === 'screens').slice(0, 6);

    // Render icons grid
    icons.forEach(x => {
      const out32 = x.outputs.find(p => /@1x-32\.png$/.test(p)) || x.outputs[0];
      const out64 = x.outputs.find(p => /@2x-64\.png$/.test(p)) || out32;
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.alt = x.original.split('/').pop();
      img.src = './' + out32;
      img.srcset = `./${out32} 1x, ./${out64} 2x`;
      const card = document.createElement('div');
      card.className = 'card';
      card.appendChild(img);
      el.iconsGrid.appendChild(card);
    });

    // Render screens grid
    screens.forEach(x => {
      const out = x.outputs[0];
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.alt = x.original.split('/').pop();
      img.src = './' + out;
      const card = document.createElement('div');
      card.className = 'card';
      card.appendChild(img);
      el.screensGrid.appendChild(card);
    });
  })
  .catch(err => {
    console.error('Manifest load error', err);
  });
