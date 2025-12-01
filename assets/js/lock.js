const PASSWORD_HASHES = [
  '3142d2bd7fdad44583bb047ee63e40403171c3ba3582aed5d8b995ee94e0a96d', // output from `echo -n "MyPass" | shasum -a 256`
  '5ae05906a27120b7a6157dee71ad63956a4ddc631fcf18a79e4f682bd49c421a', // without symbol
  'e1be447d69eada044f6d2881a541886f4ded962a78baa707e9cb3b02b3147202', // all lowercase
  '290bb3aad7cda9d661d4e6cee83dfe24c3c2c5b5f1f8a5ed7719f8f39340469f', // all lowercase with symbol
  '0fa96c70cc78b01e6c5fb6c851f84a38a96979a4d540b8260efec05361a147ef', // all uppercase
  'a5deffd2224f41a647d4855f24652d607c562a6da09b535c97e8f5b04b9b0e49'  // all uppercase with symbol
];

const MAX_ATTEMPTS = 3;
const COOKIE_NAME = 'daxAccess';
const LOCK_ID = 'access-lock';
const LOCKOUT_REDIRECT = 'https://memory-alpha.fandom.com/wiki/Jadzia_Dax';

const template = `
  <div class="lock-overlay">
    <div class="lock-panel">
      <h2>Family and Friends Access</h2>
      <p>Enter the shared password to continue.</p>
      <form id="${LOCK_ID}-form">
        <input type="password" id="${LOCK_ID}-input" autocomplete="current-password" placeholder="Password" required />
        <button type="submit">Unlock</button>
      </form>
      <p class="lock-error" id="${LOCK_ID}-error"></p>
      <div class="lock-lockout" id="${LOCK_ID}-lockout" hidden>
        <p>
          Too many attempts. Please contact<br /><a href="mailto:arthur@deltawerx.com">Arthur Zey</a> or <a href="mailto:chasep0191@gmail.com">Chase Popp</a> for access.
        </p>
        <button type="button" id="${LOCK_ID}-lockout-btn">Okay</button>
      </div>
    </div>
  </div>
`;

function ensureVisibility() {
  document.documentElement.style.visibility = 'visible';
}

function getCookie() {
  return document.cookie.includes(`${COOKIE_NAME}=1`);
}

function setCookie() {
  document.cookie = `${COOKIE_NAME}=1; max-age=604800; path=/`;
}

async function hashString(value) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function renderLock() {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = template;
  document.body.appendChild(wrapper.firstElementChild);
  return document.querySelector('.lock-overlay');
}

function showError(message) {
  const errorEl = document.getElementById(`${LOCK_ID}-error`);
  if (errorEl) {
    errorEl.textContent = message;
  }
}

(function initLock() {
  if (getCookie()) {
    ensureVisibility();
    return;
  }

  document.documentElement.style.visibility = 'hidden';

  window.addEventListener('DOMContentLoaded', () => {
    const overlay = renderLock();
    document.body.classList.add('lock-active');
    const form = document.getElementById(`${LOCK_ID}-form`);
    const input = document.getElementById(`${LOCK_ID}-input`);
    const lockoutBlock = document.getElementById(`${LOCK_ID}-lockout`);
    const lockoutButton = document.getElementById(`${LOCK_ID}-lockout-btn`);
    if (lockoutBlock) {
      lockoutBlock.hidden = true;
    }
    let attempts = 0;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const pwd = input.value.trim();
      const hash = await hashString(pwd);

      if (PASSWORD_HASHES.includes(hash)) {
        setCookie();
        overlay.remove();
        ensureVisibility();
        document.body.classList.remove('lock-active');
      } else {
        attempts += 1;
        if (attempts >= MAX_ATTEMPTS) {
          showError('');
          form.hidden = true;
          if (lockoutBlock) {
            lockoutBlock.hidden = false;
            if (lockoutButton) {
              lockoutButton.addEventListener(
                'click',
                () => {
                  window.location.href = LOCKOUT_REDIRECT;
                },
                { once: true }
              );
              lockoutButton.focus();
            }
          }
        } else {
          showError('Incorrect password. Try again.');
          input.value = '';
          input.focus();
        }
      }
    });

    document.documentElement.style.visibility = 'visible';
    input.focus();
  });
})();
