const FIREBASE_BASE = 'https://remotestorage-c0469-default-rtdb.europe-west1.firebasedatabase.app';
const USERS_URL = `${FIREBASE_BASE}/users.json`;


// ── Guest ──────────────────────────────────────────────────────────────────────

function guestLogin() {
    const guestUser = { id: 'guest', name: 'Gast', email: '', isGuest: true };
    sessionStorage.setItem('currentUser', JSON.stringify(guestUser));
    window.location.href = './html/summary.html';
}


// ── Form Switch ────────────────────────────────────────────────────────────────

function switchForm(currentForm, targetForm) {
    hideForm(currentForm);
    showForm(targetForm);
    if (currentForm === 'registration_section') clearRegistrationForm();
    if (currentForm === 'login_section') clearLoginForm();
    updateSignupButton(targetForm);
}


function hideForm(formId) {
    const el = document.getElementById(formId);
    if (el) el.classList.add('d-none');
}


function showForm(formId) {
    const el = document.getElementById(formId);
    if (el) el.classList.remove('d-none');
}


function updateSignupButton(activeForm) {
    const signupBtn = document.getElementById('signup_btn');
    if (!signupBtn) return;
    signupBtn.classList.toggle('d-none', activeForm !== 'login_section');
}


// ── Hint helpers ───────────────────────────────────────────────────────────────
// Nutzt visibility statt display → kein Layout-Shift

function showHint(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('visible');
}

function hideHint(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('visible');
}


// ── Clear Forms ────────────────────────────────────────────────────────────────

function clearFieldValue(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = '';
    if (el.tagName === 'INPUT') el.removeAttribute('data-touched');
    if (typeof el.setCustomValidity === 'function') el.setCustomValidity('');
}


function clearRegFields() {
    ['reg_name', 'reg_email', 'reg_passwort', 'reg_password_confirm'].forEach(clearFieldValue);
}


function clearRegHints() {
    ['pw_hint', 'email_format_hint', 'pw_match_hint'].forEach(hideHint);
}


function clearRegistrationForm() {
    clearRegFields();
    clearRegHints();
    const checkbox = document.getElementById('reg_datenschutz');
    if (checkbox) checkbox.checked = false;
    const submitBtn = document.getElementById('reg_submit_btn');
    if (submitBtn) submitBtn.disabled = true;
}


function clearLoginFields() {
    ['login_email', 'login_passwort'].forEach(clearFieldValue);
}


function clearLoginError() {
    const el = document.getElementById('login_error');
    if (!el) return;
    el.textContent = '';
    hideHint('login_error');
}


function clearLoginForm() {
    clearLoginFields();
    clearLoginError();
}


// ── Notification ───────────────────────────────────────────────────────────────

function showNotification(message, isError = false) {
    const notif = document.getElementById('notification');
    if (!notif) return;
    notif.textContent = message;
    notif.classList.remove('d-none');
    setTimeout(() => notif.classList.add('d-none'), 5000);
}


// ── Firebase ───────────────────────────────────────────────────────────────────

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


function buildPutOptions(body) {
    return { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}


async function saveUserToFirebase(id, user) {
    await fetch(`${FIREBASE_BASE}/users/${id}.json`, buildPutOptions(user));
}


async function saveContactToFirebase(id, contact) {
    await fetch(`${FIREBASE_BASE}/contacts/${id}.json`, buildPutOptions(contact));
}


// ── Login ──────────────────────────────────────────────────────────────────────

function showLoginError(loginErrorEl) {
    if (loginErrorEl) {
        loginErrorEl.textContent = 'Invalid email address or password.';
        showHint('login_error');
    } else {
        showNotification('Invalid email address or password.', true);
    }
}


function saveUserSession(user) {
    sessionStorage.setItem('currentUser', JSON.stringify({ id: user.id, name: user.name, email: user.email }));
}


function getLoginCredentials() {
    return {
        email: document.getElementById('login_email').value.trim(),
        password: document.getElementById('login_passwort').value
    };
}


async function login() {
    const { email, password } = getLoginCredentials();
    const users = await loadUsers();
    const user = users.find(u => u.email === email && u.password === password);
    const loginErrorEl = document.getElementById('login_error');
    if (!user) { showLoginError(loginErrorEl); return; }
    saveUserSession(user);
    clearLoginError();
    window.location.href = './html/summary.html';
}


// ── Registration Validation ────────────────────────────────────────────────────

function validateEmailFormat(email) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email);
}


function markTouched(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.dataset.touched = 'true';
}


function getRegValues() {
    return {
        name: document.getElementById('reg_name').value.trim(),
        email: document.getElementById('reg_email').value.trim(),
        pw: document.getElementById('reg_passwort').value,
        pwConfirm: document.getElementById('reg_password_confirm').value,
        privacy: document.getElementById('reg_datenschutz').checked
    };
}


function isFieldTouched(id) {
    const el = document.getElementById(id);
    return el && el.dataset && el.dataset.touched === 'true';
}


function updatePasswordHint(hint, pw, pwConfirm) {
    if (!hint) return;
    const mismatch = pwConfirm.length > 0 && pw !== pwConfirm && isFieldTouched('reg_password_confirm');
    hint.textContent = mismatch ? "Passwords don't match" : hint.textContent;
    if (mismatch) {
        showHint('pw_match_hint');
    } else {
        hideHint('pw_match_hint');
    }
}


function setPasswordValidity(pw) {
    const hint = document.getElementById('pw_hint');
    const hasSpaces = /\s/.test(pw);
    const tooShort = pw.length > 0 && pw.length < 8 && isFieldTouched('reg_passwort');

    if (pw && hasSpaces) {
        hint.textContent = 'Passwords must not contain spaces.';
        showHint('pw_hint');
    } else if (tooShort) {
        hint.textContent = 'Password must be at least 8 characters.';
        showHint('pw_hint');
    } else {
        hideHint('pw_hint');
    }

    return hasSpaces || tooShort;
}




function setEmailValidity(email, emailValid) {
    const showError = email && !emailValid && isFieldTouched('reg_email');
    if (showError) {
        showHint('email_format_hint');
    } else {
        hideHint('email_format_hint');
    }
}


function updateSubmitState(isValid) {
    document.getElementById('reg_submit_btn').disabled = !isValid;
}


function validateRegistrationForm() {
    const { name, email, pw, pwConfirm, privacy } = getRegValues();
    updatePasswordHint(document.getElementById('pw_match_hint'), pw, pwConfirm);
    const emailValid = validateEmailFormat(email);
    const pwHasSpaces = setPasswordValidity(pw);
    setEmailValidity(email, emailValid);
    const isValid = name && email && emailValid && pw && pw.length >= 8 && pw === pwConfirm && privacy && !pwHasSpaces;
    updateSubmitState(isValid);
}


// ── Register ───────────────────────────────────────────────────────────────────

function validatePasswordFormat(password) {
    if (/\s/.test(password)) { showNotification('Passwords must not contain spaces.', true); return false; }
    if (password.length < 8) { showNotification('Password must be at least 8 characters.', true); return false; }
    return true;
}


function validateRegisterInput(password, email) {
    if (!validatePasswordFormat(password)) return false;
    if (!validateEmailFormat(email)) {
        showNotification('Please enter a valid email address (e.g. name@domain.de)', true);
        return false;
    }
    return true;
}


async function getNextUserId(email) {
    const users = await loadUsers();
    if (users.some(u => u.email === email)) return null;
    return users.reduce((max, u) => Math.max(max, Number(u.id) || 0), 0) + 1;
}


function buildNewUserAndContact(id, name, email, password) {
    return {
        newUser: { id, name, email, password },
        newContact: { id, name, email, phone: 'no phone number provided', color: getRandomColor(), avatar: getInitials(name) }
    };
}


async function saveRegistration(newId, newUser, newContact) {
    try {
        await saveUserToFirebase(newId, newUser);
        await saveContactToFirebase(newId, newContact);
        showNotification('Registration successful!');
        setTimeout(() => switchForm('registration_section', 'login_section'), 2000);
    } catch (e) {
        console.error('Registration error:', e);
        showNotification('Registration failed.', true);
    }
}


function getRegFormValues() {
    return {
        name: document.getElementById('reg_name').value.trim(),
        email: document.getElementById('reg_email').value.trim(),
        password: document.getElementById('reg_passwort').value
    };
}


async function register() {
    const { name, email, password } = getRegFormValues();
    if (!validateRegisterInput(password, email)) return;
    const newId = await getNextUserId(email);
    if (!newId) { showNotification('This email address is already registered.', true); return; }
    const { newUser, newContact } = buildNewUserAndContact(newId, name, email, password);
    await saveRegistration(newId, newUser, newContact);
}


// ── Page Lifecycle ─────────────────────────────────────────────────────────────

function clearAllForms() {
    try { clearRegistrationForm(); clearLoginForm(); } catch (e) { /* ignore */ }
}


window.addEventListener('beforeunload', clearAllForms);
window.addEventListener('popstate', clearAllForms);
window.addEventListener('pageshow', e => { if (e && e.persisted) clearAllForms(); });