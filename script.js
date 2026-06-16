document.addEventListener('DOMContentLoaded', function () {
    initMain();
    document.addEventListener('click', closeAvatarMenuOnOutsideClick);
});


function initMain() {
    setHeaderAvatar();
    loadNavigation();
}


function closeAvatarMenuOnOutsideClick(e) {
    if (!e.target.closest('#user-avatar-wrapper')) {
        document.getElementById('avatar-menu')?.classList.add('d-none');
    }
}


function getCurrentUser() {
    try {
        return JSON.parse(sessionStorage.getItem('currentUser')) || null;
    } catch (e) {
        return null;
    }
}


function checkIsGuest() {
    const user = getCurrentUser();
    return user?.isGuest === true;
}


function getInitials(name) {
    if (!name) return 'G';
    const nameParts = name.trim().split(' ');
    const first = nameParts[0]?.charAt(0).toUpperCase() || '';
    const last = nameParts[1]?.charAt(0).toUpperCase() || '';
    return (first + last) || 'G';
}


function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


function setHeaderAvatar() {
    const avatar = document.getElementById('user-avatar');
    if (!avatar) return;
    const user = getCurrentUser();
    avatar.textContent = user ? getInitials(user.name) : 'G';
}


function toggleAvatarMenu() {
    document.getElementById('avatar-menu')?.classList.toggle('d-none');
}


function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = '../index.html';
}


function getCurrentPage() {
    return window.location.pathname.split('/').pop();
}


function activateDesktopNavLinks(page) {
    document.querySelectorAll('.nav-link, .nav-bottom-link').forEach(link => {
        if (link.getAttribute('href')?.endsWith(page)) link.classList.add('nav-item--active');
    });
}


function activateMobileNavLinks(page) {
    document.querySelectorAll('.mobil-nav-link').forEach(link => link.classList.remove('aktiv'));
    const selector = `.mobil-nav-link[href$="${page}"]`;
    document.querySelectorAll(selector).forEach(link => link.classList.add('aktiv'));
}


function setActiveNavLink() {
    const page = getCurrentPage();
    activateDesktopNavLinks(page);
    activateMobileNavLinks(page);
}


function getGuestDesktopNavHTML() {
    return `<a href="../index.html" class="nav-link" id="nav_login"><img src="../assets/icons/login.svg" alt="" class="nav-icon"><span>Log In</span></a>`;
}


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


function setGuestDesktopNav() {
    const navGroup = document.querySelector('.navigation-links-group');
    if (navGroup) navGroup.innerHTML = getGuestDesktopNavHTML();
}


function setGuestMobileNav() {
    const mobilNav = document.querySelector('.mobil-navigation');
    if (mobilNav) mobilNav.innerHTML = getGuestMobileNavHTML(getCurrentPage());
}


function updateNavigationForUser(user) {
    if (user) return;
    setGuestDesktopNav();
    setGuestMobileNav();
}


function updateHeaderForUser(user) {
    if (user) return;
    const helpIcon = document.querySelector('.help-icon-link');
    if (helpIcon) helpIcon.style.display = 'none';
    const avatarWrapper = document.getElementById('user-avatar-wrapper');
    if (avatarWrapper) avatarWrapper.style.display = 'none';
}


async function loadIncludeElement(element) {
    const filePath = element.getAttribute('data-import');
    try {
        const answer = await fetch(filePath);
        element.innerHTML = answer.ok ? await answer.text() : '<p>Navigation could not be loaded</p>';
        if (answer.ok) setHeaderAvatar();
    } catch (error) {
        console.error('Error loading navigation:', error);
    }
}

function notify(message, isError) {
    // Ziel-Container ermitteln: wenn Add-Task-Dialog offen ist, Notification dorthin verschieben
    const dialog = document.getElementById('add-task-overlay');
    const dialogIsOpen = dialog && dialog.open;

    const notifEl = document.getElementById('notification');
    if (notifEl) {
        // In den offenen Dialog verschieben, sonst zurück ans Body
        if (dialogIsOpen) {
            dialog.appendChild(notifEl);
        } else {
            document.body.appendChild(notifEl);
        }
        notifEl.textContent = message;
        notifEl.classList.remove('d-none');
        setTimeout(() => notifEl.classList.add('d-none'), 5000);
        return;
    }

    // Fallback: showNotification falls vorhanden
    if (typeof showNotification === 'function') {
        showNotification(message, isError);
    }
}


async function loadNavigation() {
    const includeElements = document.querySelectorAll('[data-import]');
    for (let element of includeElements) {
        await loadIncludeElement(element);
    }
    const user = getCurrentUser();
    updateNavigationForUser(user);
    updateHeaderForUser(user);
    setActiveNavLink();
}


function redirectIfUnauthorized() {
    const protectedPages = ['summary.html', 'add_task.html', 'board.html', 'contacts.html', 'help.html'];
    if (protectedPages.includes(getCurrentPage()) && !sessionStorage.getItem('currentUser')) {
        window.location.href = '../index.html';
    }
}

redirectIfUnauthorized();