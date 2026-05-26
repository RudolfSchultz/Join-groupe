const avatarContainer = document.getElementById('user-avatar');

function getCurrentUser() {
    try {
        const user = JSON.parse(sessionStorage.getItem('currentUser'));
        
        if (user && user.name) {
            if (avatarContainer) {
                avatarContainer.innerText = getInitials(user.name);
            }
        }
        return user;
    } catch (error) { 
        console.error(error); 
        return null; 
    }
}

function getInitials(name) {
    if (!name) return 'no Name';

    const nameParts = name.split(' ');

    const firstNameChar = nameParts[0].charAt(0).toUpperCase();
    const lastNameChar = nameParts[1].charAt(0).toUpperCase();

    return firstNameChar + lastNameChar;
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}