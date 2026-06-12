function guestLogin() {
    const guestUser = { id: 'guest', name: 'Gast', email: '', isGuest: true };
    sessionStorage.setItem('currentUser', JSON.stringify(guestUser));
    window.location.href = './html/summary.html';
}
const FIREBASE_BASE = 'https://remotestorage-c0469-default-rtdb.europe-west1.firebasedatabase.app';
const USERS_URL = `${FIREBASE_BASE}/users.json`;

function switchForm(currentForm, targetForm) {
    const cur = document.getElementById(currentForm);
    const tgt = document.getElementById(targetForm);
    if (cur) cur.classList.add('d-none');
    if (tgt) tgt.classList.remove('d-none');
    // If we are hiding the registration form, clear its fields
    if (currentForm === 'registration_section') clearRegistrationForm();
    // If we are hiding the login form, clear its fields
    if (currentForm === 'login_section') clearLoginForm();
    updateSignupButton(targetForm);
}

function clearRegFields() {
    const fields = ['reg_name', 'reg_email', 'reg_passwort', 'reg_password_confirm'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = '';
        if (el.tagName === 'INPUT') el.removeAttribute('data-touched');
        if (typeof el.setCustomValidity === 'function') el.setCustomValidity('');
    });
}

function clearRegHints() {
    const hints = ['pw_space_hint', 'pw_length_hint', 'email_format_hint', 'pw_match_hint'];
    hints.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function clearRegistrationForm() {
    clearRegFields();
    const checkbox = document.getElementById('reg_datenschutz');
    if (checkbox) checkbox.checked = false;
    clearRegHints();
    const submitBtn = document.getElementById('reg_submit_btn');
    if (submitBtn) submitBtn.disabled = true;
}

function clearLoginForm() {
    const fields = ['login_email', 'login_passwort'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = '';
        if (el.tagName === 'INPUT') el.removeAttribute('data-touched');
        if (typeof el.setCustomValidity === 'function') el.setCustomValidity('');
    });

    const loginError = document.getElementById('login_error');
    if (loginError) {
        loginError.textContent = '';
        loginError.style.display = 'none';
    }
}

function updateSignupButton(activeForm) {
    const signupBtn = document.getElementById('signup_btn');
    if (!signupBtn) return;
    if (activeForm === 'login_section') {
        signupBtn.classList.remove('d-none');
    } else {
        signupBtn.classList.add('d-none');
    }
}

function showNotification(message, isError = false) {
    const notif = document.getElementById('notification');
    if (!notif) return;
    notif.textContent = message;
    notif.style.backgroundColor = isError ? 'var(--primaryColor)' : 'var(--primaryColor)';
    notif.classList.remove('d-none');
    setTimeout(() => notif.classList.add('d-none'), 5000);
}

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

async function saveUserToFirebase(id, user) {
    await fetch(`${FIREBASE_BASE}/users/${id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
}

async function saveContactToFirebase(id, contact) {
    await fetch(`${FIREBASE_BASE}/contacts/${id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
    });
}

function showLoginError(loginErrorEl) {
    if (loginErrorEl) {
        loginErrorEl.textContent = 'Invalid email address or password.';
        loginErrorEl.style.display = 'block';
    } else {
        showNotification('Invalid email address or password.', true);
    }
}

function saveUserSession(user) {
    sessionStorage.setItem('currentUser', JSON.stringify({ id: user.id, name: user.name, email: user.email }));
}

async function login() {
    const email = document.getElementById('login_email').value.trim();
    const password = document.getElementById('login_passwort').value;
    const users = await loadUsers();
    const user = users.find(u => u.email === email && u.password === password);
    const loginErrorEl = document.getElementById('login_error');
    if (!user) { showLoginError(loginErrorEl); return; }
    saveUserSession(user);
    if (loginErrorEl) { loginErrorEl.textContent = ''; loginErrorEl.style.display = 'none'; }
    window.location.href = './html/summary.html';
}

function clearLoginError(){
    const el = document.getElementById('login_error');
    if(!el) return;
    el.textContent = '';
    el.style.display = 'none';
}

function updatePasswordHint(hint, pw, pwConfirm) {
    if (!hint) return;
    const pwConfirmInput = document.getElementById('reg_password_confirm');
    const touched = pwConfirmInput && pwConfirmInput.dataset && pwConfirmInput.dataset.touched === 'true';
    const mismatch = pwConfirm.length > 0 && pw !== pwConfirm && touched;
    hint.textContent = mismatch ? 'Passwords don\'t match' : '';
    hint.style.display = mismatch ? 'block' : 'none';
}

function markTouched(id){
    const el = document.getElementById(id);
    if(!el) return;
    el.dataset.touched = 'true';
}

function getRegValues(){
    return {
        name:document.getElementById('reg_name').value.trim(),
        email:document.getElementById('reg_email').value.trim(),
        pw:document.getElementById('reg_passwort').value,
        pwConfirm:document.getElementById('reg_password_confirm').value,
        privacy:document.getElementById('reg_datenschutz').checked
    };
}

function showPasswordLengthHint(pw) {
    const hint = document.getElementById('pw_length_hint');
    const pwInput = document.getElementById('reg_passwort');
    const touched = pwInput && pwInput.dataset && pwInput.dataset.touched === 'true';
    const tooShort = pw.length > 0 && pw.length < 8 && touched;
    if (hint) hint.style.display = tooShort ? 'block' : 'none';
    return pw.length > 0 && pw.length < 8;
}

function setPasswordValidity(pw){
    const pwInput = document.getElementById('reg_passwort');
    const hasSpaces = /\s/.test(pw);
    const tooShort = showPasswordLengthHint(pw);
    const hint = document.getElementById('pw_space_hint');
    const invalid = hasSpaces ? 'Passwords must not contain spaces.' : tooShort ? 'Password must be at least 8 characters.' : '';
    pwInput.setCustomValidity(invalid);
    if(hint) hint.style.display = (pw && hasSpaces)? 'block' : 'none';
    return hasSpaces || tooShort;
}

function setEmailValidity(email,emailValid){
    const emailInput=document.getElementById('reg_email'),hint=document.getElementById('email_format_hint');
    const touched = emailInput && emailInput.dataset && emailInput.dataset.touched === 'true';
    emailInput.setCustomValidity(email && !emailValid? 'Please enter a valid email address (e.g. name@domain.de)' : '');
    if(hint) hint.style.display = (email && !emailValid && touched)? 'block':'none';
}

function updateSubmitState(isValid){
    document.getElementById('reg_submit_btn').disabled = !isValid;
}

function validateRegistrationForm(){
    const {name,email,pw,pwConfirm,privacy} = getRegValues();
    updatePasswordHint(document.getElementById('pw_match_hint'),pw,pwConfirm);
    const emailValid = validateEmailFormat(email);
    const pwHasSpaces = setPasswordValidity(pw);
    setEmailValidity(email,emailValid);
    const isValid = name && email && emailValid && pw && pw.length >= 8 && pw===pwConfirm && privacy && !pwHasSpaces;
    updateSubmitState(isValid);
}

function validateEmailFormat(email) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email);
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

function validateRegisterInput(password, email) {
    if (/\s/.test(password)) {
        showNotification('Passwords must not contain spaces.', true);
        return false;
    }
    if (password.length < 8) {
        showNotification('Password must be at least 8 characters.', true);
        return false;
    }
    if (!validateEmailFormat(email)) {
        showNotification('Please enter a valid email address (e.g. name@domain.de)', true);
        return false;
    }
    return true;
}

async function register() {
    const name = document.getElementById('reg_name').value.trim();
    const email = document.getElementById('reg_email').value.trim();
    const password = document.getElementById('reg_passwort').value;
    if (!validateRegisterInput(password, email)) return;
    const newId = await getNextUserId(email);
    if (!newId) { showNotification('This email address is already registered.', true); return; }
    const { newUser, newContact } = buildNewUserAndContact(newId, name, email, password);
    await saveRegistration(newId, newUser, newContact);
}

// Clear registration fields when navigating away or when page is restored from bfcache
window.addEventListener('beforeunload', function () {
    try { clearRegistrationForm(); clearLoginForm(); } catch (e) { }
});

// Browser Back / history navigation
window.addEventListener('popstate', function () {
    try { clearRegistrationForm(); clearLoginForm(); } catch (e) { }
});

// When page is restored from bfcache (e.persisted === true) clear inputs
window.addEventListener('pageshow', function (e) {
    if (e && e.persisted) {
        try { clearRegistrationForm(); clearLoginForm(); } catch (err) { }
    }
});