const FIREBASE_BASE = 'https://remotestorage-c0469-default-rtdb.europe-west1.firebasedatabase.app';
const USERS_URL = `${FIREBASE_BASE}/users.json`;


// ── Guest ──────────────────────────────────────────────────────────────────────


/** Logs in as a guest user and redirects to the summary page. */
function guestLogin() {
    const guestUser = { id: 'guest', name: 'Gast', email: '', isGuest: true };
    sessionStorage.setItem('currentUser', JSON.stringify(guestUser));
    window.location.href = './html/summary.html';
}


// ── Form Switch ────────────────────────────────────────────────────────────────


/**
 * Switches visibility between two form sections and resets the hidden one.
 * @param {string} currentForm - Id of the form to hide.
 * @param {string} targetForm - Id of the form to show.
 */
function switchForm(currentForm, targetForm) {
    hideForm(currentForm);
    showForm(targetForm);
    if (currentForm === 'registration_section') clearRegistrationForm();
    if (currentForm === 'login_section') clearLoginForm();
    updateSignupButton(targetForm);
}


/**
 * Hides a form section.
 * @param {string} formId - Element id to hide.
 */
function hideForm(formId) {
    const el = document.getElementById(formId);
    if (el) el.classList.add('d-none');
}


/**
 * Shows a form section.
 * @param {string} formId - Element id to show.
 */
function showForm(formId) {
    const el = document.getElementById(formId);
    if (el) el.classList.remove('d-none');
}


/**
 * Shows the sign-up button only when the login section is active.
 * @param {string} activeForm - Id of the currently visible form.
 */
function updateSignupButton(activeForm) {
    const signupBtn = document.getElementById('signup_btn');
    if (!signupBtn) return;
    signupBtn.classList.toggle('d-none', activeForm !== 'login_section');
}


// ── Hint Helpers ───────────────────────────────────────────────────────────────


/**
 * Makes a hint element visible (uses visibility, no layout shift).
 * @param {string} id - Element id.
 */
function showHint(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('visible');
}


/**
 * Hides a hint element (uses visibility, no layout shift).
 * @param {string} id - Element id.
 */
function hideHint(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('visible');
}


// ── Clear Forms ────────────────────────────────────────────────────────────────


/**
 * Clears an input field value and removes its validation state attributes.
 * @param {string} id - Element id of the input to clear.
 */
function clearFieldValue(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = '';
    if (el.tagName === 'INPUT') el.removeAttribute('data-touched');
    if (typeof el.setCustomValidity === 'function') el.setCustomValidity('');
}


/** Clears all registration input fields. */
function clearRegFields() {
    ['reg_name', 'reg_email', 'reg_passwort', 'reg_password_confirm'].forEach(clearFieldValue);
}


/** Hides all registration hint and error messages. */
function clearRegHints() {
    ['pw_hint', 'email_format_hint', 'pw_match_hint'].forEach(hideHint);
}


/** Resets the registration form including checkbox and submit button state. */
function clearRegistrationForm() {
    clearRegFields();
    clearRegHints();
    const checkbox = document.getElementById('reg_datenschutz');
    if (checkbox) checkbox.checked = false;
    const submitBtn = document.getElementById('reg_submit_btn');
    if (submitBtn) submitBtn.disabled = true;
}


/** Clears all login input fields. */
function clearLoginFields() {
    ['login_email', 'login_passwort'].forEach(clearFieldValue);
}


/** Clears the login error message and hides its hint. */
function clearLoginError() {
    const el = document.getElementById('login_error');
    if (!el) return;
    el.textContent = '';
    hideHint('login_error');
}


/** Resets the full login form including error state. */
function clearLoginForm() {
    clearLoginFields();
    clearLoginError();
}


// ── Notification ───────────────────────────────────────────────────────────────


/**
 * Displays a notification banner and auto-hides it after 5 seconds.
 * @param {string} message - Text to display.
 * @param {boolean} [isError=false] - Whether this is an error notification.
 */
function showNotification(message, isError = false) {
    const notif = document.getElementById('notification');
    if (!notif) return;
    notif.textContent = message;
    notif.classList.remove('d-none');
    setTimeout(() => notif.classList.add('d-none'), 5000);
}


// ── Firebase ───────────────────────────────────────────────────────────────────


/**
 * Loads all users from Firebase.
 * @returns {Promise<Array>} Array of user objects or empty array on error.
 */
async function loadUsers() {
    try {
        const response = await fetch(USERS_URL);
        const data = await response.json();
        if (!data) return [];
        return Array.isArray(data) ? data.filter(Boolean) : Object.values(data).filter(Boolean);
    } catch (e) {
        console.error('Error loading users:', e);
        return [];
    }
}


/**
 * Builds a PUT fetch options object for Firebase writes.
 * @param {Object} body - Data to serialize as JSON body.
 * @returns {Object} Fetch options with method, headers, and body.
 */
function buildPutOptions(body) {
    return { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}


/**
 * Saves a user object to Firebase under /users/{id}.
 * @param {string|number} id - Firebase key.
 * @param {Object} user - User data.
 */
async function saveUserToFirebase(id, user) {
    await fetch(`${FIREBASE_BASE}/users/${id}.json`, buildPutOptions(user));
}


/**
 * Saves a contact object to Firebase under /contacts/{id}.
 * @param {string|number} id - Firebase key.
 * @param {Object} contact - Contact data.
 */
async function saveContactToFirebase(id, contact) {
    await fetch(`${FIREBASE_BASE}/contacts/${id}.json`, buildPutOptions(contact));
}


// ── Page Lifecycle ─────────────────────────────────────────────────────────────


/** Silently clears all forms on page unload or back-navigation. */
function clearAllForms() {
    try { clearRegistrationForm(); clearLoginForm(); } catch (e) { /* ignore */ }
}


window.addEventListener('beforeunload', clearAllForms);
window.addEventListener('popstate', clearAllForms);
window.addEventListener('pageshow', e => { if (e && e.persisted) clearAllForms(); });
