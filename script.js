document.addEventListener('DOMContentLoaded', function () {
    initMain();
    document.addEventListener('click', closeAvatarMenuOnOutsideClick);
});


// ── Init ───────────────────────────────────────────────────────────────────────


/** Initialises the shared page header. */
function initMain() {
    setHeaderAvatar();
}


// ── Avatar Menu ────────────────────────────────────────────────────────────────


/**
 * Closes the avatar dropdown when a click occurs outside the avatar wrapper.
 * @param {MouseEvent} e - The document click event.
 */
function closeAvatarMenuOnOutsideClick(e) {
    if (!e.target.closest('#user-avatar-wrapper')) {
        document.getElementById('avatar-menu')?.classList.add('d-none');
    }
}


/** Toggles the avatar dropdown menu visibility. */
function toggleAvatarMenu() {
    document.getElementById('avatar-menu')?.classList.toggle('d-none');
}


// ── Session ────────────────────────────────────────────────────────────────────


/**
 * Reads and parses the current user from sessionStorage.
 * @returns {Object|null} The current user object, or null if not logged in.
 */
function getCurrentUser() {
    try {
        return JSON.parse(sessionStorage.getItem('currentUser')) || null;
    } catch (e) {
        return null;
    }
}


/**
 * Returns whether the current session belongs to a guest user.
 * @returns {boolean}
 */
function checkIsGuest() {
    const user = getCurrentUser();
    return user?.isGuest === true;
}


/** Removes the current user session and redirects to the login page. */
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = '../index.html';
}


// ── Utilities ──────────────────────────────────────────────────────────────────


/**
 * Extracts up to two initials from a full name string.
 * @param {string} name - Full name to derive initials from.
 * @returns {string} One or two uppercase initials, or 'G' as fallback.
 */
function getInitials(name) {
    if (!name) return 'G';
    const nameParts = name.trim().split(' ');
    const first = nameParts[0]?.charAt(0).toUpperCase() || '';
    const last = nameParts[1]?.charAt(0).toUpperCase() || '';
    return (first + last) || 'G';
}


/**
 * Generates a random hexadecimal color string.
 * @returns {string} Color in the format '#RRGGBB'.
 */
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


/**
 * Returns the filename of the current page.
 * @returns {string} E.g. 'board.html'.
 */
function getCurrentPage() {
    return window.location.pathname.split('/').pop();
}


// ── Header ─────────────────────────────────────────────────────────────────────


/** Sets the header avatar initials from the current user's name. */
function setHeaderAvatar() {
    const avatar = document.getElementById('user-avatar');
    if (!avatar) return;
    const user = getCurrentUser();
    avatar.textContent = user ? getInitials(user.name) : 'G';
}


/**
 * Hides the help icon and avatar wrapper for non-logged-in users.
 * @param {Object|null} user - Current user object, or null if not logged in.
 */
function updateHeaderForUser(user) {
    if (user) return;
    const helpIcon = document.querySelector('.help-icon-link');
    if (helpIcon) helpIcon.style.display = 'none';
    const avatarWrapper = document.getElementById('user-avatar-wrapper');
    if (avatarWrapper) avatarWrapper.style.display = 'none';
}


// ── Navigation ─────────────────────────────────────────────────────────────────


/**
 * Adds the active class to desktop nav links matching the current page.
 * @param {string} page - Current page filename.
 */
function activateDesktopNavLinks(page) {
    document.querySelectorAll('.nav-link, .nav-bottom-link').forEach(link => {
        if (link.getAttribute('href')?.endsWith(page)) link.classList.add('nav-item--active');
    });
}


/**
 * Sets the active class on the matching mobile nav link for the current page.
 * @param {string} page - Current page filename.
 */
function activateMobileNavLinks(page) {
    document.querySelectorAll('.mobil-nav-link').forEach(link => link.classList.remove('aktiv'));
    document.querySelectorAll(`.mobil-nav-link[href$="${page}"]`).forEach(link => link.classList.add('aktiv'));
}


/** Activates the correct nav links for the current page on desktop and mobile. */
function setActiveNavLink() {
    const page = getCurrentPage();
    activateDesktopNavLinks(page);
    activateMobileNavLinks(page);
}


/**
 * Returns the HTML for the guest desktop navigation login link.
 * @returns {string} HTML string.
 */
function getGuestDesktopNavHTML() {
    return `<a href="../index.html" class="nav-link" id="nav_login"><img src="../assets/icons/login.svg" alt="" class="nav-icon"><span>Log In</span></a>`;
}


/**
 * Returns the HTML for the guest mobile navigation including active page states.
 * @param {string} page - Current page filename.
 * @returns {string} HTML string.
 */
function getGuestMobileNavHTML(page) {
    const isPrivacy = page === 'privacy_policy.html';
    const isLegal = page === 'legal_notice.html';
    return `
        <a href="../index.html" class="mobil-nav-link">
            <img src="../assets/icons/login.svg" alt="" class="mobil-nav-icon">
            <span>Log In</span>
        </a>
        <a href="privacy_policy.html" class="mobil-nav-link${isPrivacy ? ' aktiv' : ''}">Privacy Policy</a>
        <a href="legal_notice.html" class="mobil-nav-link${isLegal ? ' aktiv' : ''}">Legal Notice</a>
    `;
}


/** Replaces the desktop navigation with the guest login link. */
function setGuestDesktopNav() {
    const navGroup = document.querySelector('.navigation-links-group');
    if (navGroup) navGroup.innerHTML = getGuestDesktopNavHTML();
}


/** Replaces the mobile navigation with guest-appropriate links. */
function setGuestMobileNav() {
    const mobilNav = document.querySelector('.mobil-navigation');
    if (mobilNav) mobilNav.innerHTML = getGuestMobileNavHTML(getCurrentPage());
}


/**
 * Switches navigation to guest mode when no user is logged in.
 * @param {Object|null} user - Current user object, or null if not logged in.
 */
function updateNavigationForUser(user) {
    if (user) return;
    setGuestDesktopNav();
    setGuestMobileNav();
}


// ── Notification ───────────────────────────────────────────────────────────────


/**
 * Displays a notification message, moving it into the add-task dialog if open.
 * Falls back to showNotification() if the notification element is missing.
 * @param {string} message - Text to display.
 * @param {boolean} [isError] - Whether this is an error notification.
 */
function notify(message, isError) {
    const dialog = document.getElementById('add-task-overlay');
    const dialogIsOpen = dialog && dialog.open;
    const notifEl = document.getElementById('notification');
    if (notifEl) {
        if (dialogIsOpen) { dialog.appendChild(notifEl); } else { document.body.appendChild(notifEl); }
        notifEl.textContent = message;
        notifEl.classList.remove('d-none');
        setTimeout(() => notifEl.classList.add('d-none'), 5000);
        return;
    }
    if (typeof showNotification === 'function') showNotification(message, isError);
}


// ── Auth Guard ─────────────────────────────────────────────────────────────────


/** Redirects unauthenticated users away from protected pages to the login page. */
function redirectIfUnauthorized() {
    const protectedPages = ['summary.html', 'add_task.html', 'board.html', 'contacts.html', 'help.html'];
    if (protectedPages.includes(getCurrentPage()) && !sessionStorage.getItem('currentUser')) {
        window.location.href = '../index.html';
    }
}


redirectIfUnauthorized();