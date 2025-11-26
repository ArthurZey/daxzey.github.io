const DUE_DATE = '2026-01-07';

function getDaysUntil(dateString) {
  const today = new Date();
  const targetDate = new Date(dateString);
  const diff = targetDate.getTime() - today.getTime();
  return Math.max(Math.round(diff / (1000 * 60 * 60 * 24)), 0);
}

const daysUntilLaunch = getDaysUntil(DUE_DATE);

const milestoneList = document.querySelector('.timeline');
if (milestoneList) {
  const countdownItem = document.createElement('li');
  countdownItem.innerHTML = `<span>Countdown</span><div>${daysUntilLaunch} days until we meet Baby Dax!</div>`;
  milestoneList.appendChild(countdownItem);
}

const launchCounter = document.querySelector('[data-launch-count]');
if (launchCounter) {
  launchCounter.textContent = `T-minus ${daysUntilLaunch} days to launch!`;
}

const galleryFiltersWrap = document.querySelector('[data-gallery-filters]');
const galleryGrid = document.querySelector('[data-gallery-grid]');
const galleryStatus = document.querySelector('[data-gallery-status]');
let photoData = [];
let lightboxElements = null;
let activeCategoryPhotos = [];
let activeIndex = 0;

if (galleryFiltersWrap && galleryGrid) {
  fetch('/assets/data/photos.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((photos) => initializeGallery(photos))
    .catch(() => {
      if (galleryStatus) {
        galleryStatus.textContent = 'Unable to load the gallery right now. Try again soon!';
      }
    });
}

function initializeGallery(photos) {
  photoData = photos;
  lightboxElements = createLightbox();
  if (!Array.isArray(photos) || !photos.length) {
    if (galleryStatus) {
      galleryStatus.textContent = 'No photos logged yet—but the mission log will update soon!';
    }
    return;
  }

  const categories = Array.from(new Set(photos.map((photo) => photo.category))).sort();
  const filterButtons = [];

  const allButton = createFilterButton('All', 'all', true);
  filterButtons.push(allButton);
  galleryFiltersWrap.appendChild(allButton);

  categories.forEach((cat) => {
    const button = createFilterButton(toTitleCase(cat), cat, false);
    filterButtons.push(button);
    galleryFiltersWrap.appendChild(button);
  });

  renderGallery(photos, 'all');

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('active'));
      button.classList.add('active');
      renderGallery(photos, button.dataset.filter);
    });
  });
}

function createFilterButton(label, value, isActive) {
  const button = document.createElement('button');
  button.className = 'button-link' + (isActive ? ' active' : '');
  button.dataset.filter = value;
  button.type = 'button';
  button.textContent = label;
  return button;
}

function renderGallery(photos, filter) {
  galleryGrid.innerHTML = '';
  const filtered = photos.filter((photo) => filter === 'all' || photo.category === filter);

  if (!filtered.length) {
    if (galleryStatus) {
      galleryStatus.textContent = 'No photos in this category yet—check back soon!';
    }
    return;
  }

  const fragment = document.createDocumentFragment();
  filtered.forEach((photo) => {
    const card = document.createElement('article');
    card.className = 'photo-card';
    card.dataset.category = photo.category;

    const img = document.createElement('img');
    img.src = photo.url;
    img.alt = photo.title;
    img.loading = 'lazy';

    const content = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = photo.title;

    const time = document.createElement('time');
    time.dateTime = photo.date;
    time.textContent = formatDate(photo.date);

    const desc = document.createElement('p');
    desc.textContent = photo.description;

    content.appendChild(title);
    content.appendChild(time);
    content.appendChild(desc);

    card.appendChild(img);
    card.appendChild(content);
    card.addEventListener('click', () => openLightbox(photo));
    fragment.appendChild(card);
  });

  galleryGrid.appendChild(fragment);
  if (galleryStatus) {
    galleryStatus.textContent = '';
  }
}

function toTitleCase(text) {
  return text
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatDate(dateString) {
  // Parse YYYY-MM-DD manually so time zones don't shift the date.
  const parts = dateString.split('-').map(Number);
  if (parts.length === 3 && parts.every((num) => !Number.isNaN(num))) {
    const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
  }
  return dateString;
}

function createLightbox() {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox';

  const content = document.createElement('div');
  content.className = 'lightbox__content';

  const img = document.createElement('img');
  img.className = 'lightbox__image';
  img.alt = '';
  img.addEventListener('load', adjustLightboxSize);

  const meta = document.createElement('div');
  meta.className = 'lightbox__meta';
  const title = document.createElement('h3');
  const time = document.createElement('time');
  const desc = document.createElement('p');
  meta.appendChild(title);
  meta.appendChild(time);
  meta.appendChild(desc);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'lightbox__close';
  closeBtn.setAttribute('aria-label', 'Close photo');
  closeBtn.innerHTML = '&times;';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'lightbox__nav lightbox__nav--prev';
  prevBtn.setAttribute('aria-label', 'Previous photo');
  const prevIcon = document.createElement('span');
  prevIcon.className = 'lightbox__chevron';
  prevIcon.innerHTML = '&#10094;';
  prevBtn.appendChild(prevIcon);

  const nextBtn = document.createElement('button');
  nextBtn.className = 'lightbox__nav lightbox__nav--next';
  nextBtn.setAttribute('aria-label', 'Next photo');
  const nextIcon = document.createElement('span');
  nextIcon.className = 'lightbox__chevron';
  nextIcon.innerHTML = '&#10095;';
  nextBtn.appendChild(nextIcon);

  closeBtn.addEventListener('click', () => closeLightbox());
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeLightbox();
    }
  });

  prevBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    showPrevPhoto();
  });

  nextBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    showNextPhoto();
  });

  content.appendChild(prevBtn);
  content.appendChild(nextBtn);
  content.appendChild(img);
  content.appendChild(meta);
  content.appendChild(closeBtn);
  overlay.appendChild(content);
  document.body.appendChild(overlay);
  document.addEventListener('keydown', handleLightboxKeydown);

  return {
    overlay,
    content,
    img,
    title,
    time,
    desc,
    prevBtn,
    nextBtn,
  };
}

function openLightbox(photo) {
  if (!lightboxElements) return;
  activeCategoryPhotos = photoData.filter((p) => p.category === photo.category);
  activeIndex = activeCategoryPhotos.indexOf(photo);
  updateLightbox();
  lightboxElements.overlay.classList.add('is-open');
}

function closeLightbox() {
  if (lightboxElements) {
    lightboxElements.overlay.classList.remove('is-open');
  }
}

function updateLightbox() {
  const photo = activeCategoryPhotos[activeIndex];
  if (!photo || !lightboxElements) return;
  lightboxElements.img.src = photo.url;
  lightboxElements.img.alt = photo.title;
  lightboxElements.title.textContent = photo.title;
  lightboxElements.time.dateTime = photo.date;
  lightboxElements.time.textContent = formatDate(photo.date);
  lightboxElements.desc.textContent = photo.description;
  if (lightboxElements.img.complete) {
    adjustLightboxSize();
  }

  if (activeCategoryPhotos.length <= 1) {
    lightboxElements.prevBtn.classList.add('is-hidden');
    lightboxElements.nextBtn.classList.add('is-hidden');
  } else {
    lightboxElements.prevBtn.classList.toggle('is-hidden', activeIndex === 0);
    lightboxElements.nextBtn.classList.toggle(
      'is-hidden',
      activeIndex === activeCategoryPhotos.length - 1
    );
  }
}

function showPrevPhoto() {
  if (activeIndex > 0) {
    activeIndex -= 1;
    updateLightbox();
  }
}

function showNextPhoto() {
  if (activeIndex < activeCategoryPhotos.length - 1) {
    activeIndex += 1;
    updateLightbox();
  }
}

function adjustLightboxSize() {
  if (!lightboxElements) return;
  const imgEl = lightboxElements.img;
  const naturalWidth = imgEl.naturalWidth || imgEl.clientWidth;
  const naturalHeight = imgEl.naturalHeight || imgEl.clientHeight;
  if (!naturalWidth || !naturalHeight) {
    return;
  }
  const maxWidth = window.innerWidth - 16;
  const maxHeight = window.innerHeight - 200; // leave room for text + padding
  const scale = Math.min(1, maxWidth / naturalWidth, maxHeight / naturalHeight);
  const displayWidth = Math.max(280, Math.floor(naturalWidth * scale));
  const displayHeight = Math.floor(naturalHeight * scale);
  lightboxElements.content.style.width = `${displayWidth}px`;
  imgEl.style.width = `${displayWidth}px`;
  imgEl.style.height = `${displayHeight}px`;
}

function handleLightboxKeydown(event) {
  if (!lightboxElements || !lightboxElements.overlay.classList.contains('is-open')) {
    return;
  }
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    showPrevPhoto();
  } else if (event.key === 'ArrowRight') {
    event.preventDefault();
    showNextPhoto();
  } else if (event.key === 'Escape') {
    closeLightbox();
  }
}

const sections = document.querySelectorAll('.section');
if (sections.length) {
  sections.forEach((section) => {
    if (section.querySelector('.back-to-top')) return;
    const link = document.createElement('a');
    link.href = '#page-top';
    link.className = 'back-to-top';
    link.setAttribute('aria-label', 'Back to top');
    link.textContent = '↑ Top';
    section.appendChild(link);
  });
}
