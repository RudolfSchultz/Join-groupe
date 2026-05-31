
document.addEventListener('DOMContentLoaded', function () {
    initMain();
    document.addEventListener('click', function (e) {
        if (!e.target.closest('#user-avatar-wrapper')) {
            document.getElementById('avatar-menu')?.classList.add('d-none');
        }
    });
});

function initMain() {

    setHeaderAvatar();
    loadNavigation();
}

function getInitials(name) {
    if (!name) return 'G';
    const nameParts = name.trim().split(' ');
    const firstNameChar = nameParts[0]?.charAt(0).toUpperCase() || '';
    const lastNameChar = nameParts[1]?.charAt(0).toUpperCase() || '';

    return (firstNameChar + lastNameChar) || 'G';
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
    let user = null;
    try { user = JSON.parse(sessionStorage.getItem('currentUser')); } catch (e) {}
    avatar.textContent = user ? getInitials(user.name) : 'G';
}

function toggleAvatarMenu() {
    document.getElementById('avatar-menu')?.classList.toggle('d-none');
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = '../index.html';
}

function setActiveNavLink() {
  const page = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-link, .nav-bottom-link').forEach(link => {
    if (link.getAttribute('href')?.endsWith(page)) link.classList.add('nav-item--active');
  });
  const mobilMap = {
    'summary.html': 0,
    'add_task.html': 1,
    'board.html': 2,
    'contacts.html': 3,
    'privacy_policy.html': 0,
    'legal_notice.html': 1,
    'help.html': 2,
  };
  const i = mobilMap[page];
  if (i !== undefined) document.querySelectorAll('.mobil-nav-link')[i]?.classList.add('aktiv');
}

async function loadNavigation() {
    const includeElements = document.querySelectorAll('[data-import]');
    for (let element of includeElements) {
        const filePath = element.getAttribute("data-import");
        try {
            const answer = await fetch(filePath);
            if (answer.ok) {
                element.innerHTML = await answer.text();
                setHeaderAvatar();
            } else {
                element.innerHTML = '<p>Navigation could not be loaded</p>';
            }
        } catch (error) {
            console.error("Error loading navigation:", error);
        }
    }
    setActiveNavLink();
}