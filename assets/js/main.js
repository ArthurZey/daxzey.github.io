const milestoneList = document.querySelector('.timeline');
if (milestoneList) {
  const today = new Date();
  const dueDate = new Date('2026-01-07');
  const diff = dueDate.getTime() - today.getTime();
  const days = Math.max(Math.round(diff / (1000 * 60 * 60 * 24)), 0);

  const countdownItem = document.createElement('li');
  countdownItem.innerHTML = `<span>Countdown</span><div>${days} days until we meet Baby Dax!</div>`;
  milestoneList.appendChild(countdownItem);
}

const galleryFilters = document.querySelectorAll('[data-gallery-filter]');
const galleryCards = document.querySelectorAll('.photo-card');

galleryFilters.forEach((btn) => {
  btn.addEventListener('click', () => {
    galleryFilters.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.getAttribute('data-gallery-filter');

    galleryCards.forEach((card) => {
      const category = card.getAttribute('data-category');
      card.style.display = filter === 'all' || filter === category ? 'flex' : 'none';
    });
  });
});
