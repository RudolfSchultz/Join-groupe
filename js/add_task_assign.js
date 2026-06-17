/**
 * Loads and normalizes all contacts used in the assignment dropdown.
 * @returns {Promise<Object[]>} Normalized contacts (empty if unreachable).
 */
async function loadAssignContacts() {
    try {
        if (typeof checkIsGuest === 'function' && checkIsGuest()) {
            const response = await fetch('../db.json');
            const raw = await response.json();
            const contactsObj = raw.contacts || {};
            const contacts = Object.entries(contactsObj).map(([key, c]) => ({ ...c, id: key }));
            return normalizeContacts(contacts);
        }
        const response = await fetch(ADDTASK_CONTACTS_URL);
        const raw = await response.json();
        if (!raw) return [];
        return normalizeContacts(Array.isArray(raw) ? raw : Object.values(raw));
    } catch (error) {
        console.error('Error loading contacts:', error);
        return [];
    }
}


/**
 * Maps raw contact entries into a consistent shape with id, name, color, avatar.
 * @param {Object[]} raw - Raw contacts from Firebase.
 * @returns {Object[]} Normalized, name-sorted contacts.
 */
function normalizeContacts(raw) {
    return raw
        .filter(Boolean)
        .map(contact => ({
            id: String(contact.id),
            name: contact.name,
            color: contact.color || getRandomColor(),
            avatar: contact.avatar || initialsFromName(contact.name)
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
}


/**
 * Opens or closes the "Assigned to" dropdown and renders its options.
 * @returns {void}
 */
function toggleAssignDropdown() {
    const options = document.getElementById('assign-options');
    closeCategoryDropdown();
    renderAssignOptions();
    options.classList.toggle('d-none');
}


/**
 * Renders all contact options into the assignment dropdown.
 * @returns {void}
 */
function renderAssignOptions() {
    const options = document.getElementById('assign-options');
    options.innerHTML = addTaskContacts
        .map(contact => assignOptionTemplate(contact, assignedIds.includes(contact.id)))
        .join('');
}


/**
 * Toggles a contact's assignment state and refreshes options and avatars.
 * @param {string} id - Contact id.
 * @returns {void}
 */
function togglePerson(id) {
    if (assignedIds.includes(id)) {
        assignedIds = assignedIds.filter(assignedId => assignedId !== id);
    } else {
        if (!canAssignMorePersons()) return;
        assignedIds.push(id);
    }
    renderAssignOptions();
    renderAssignedAvatars();
}


/**
 * Enforces a maximum of 6 assigned persons and shows a notification.
 * @returns {boolean} True when another person can be assigned.
 */
function canAssignMorePersons() {
    if (assignedIds.length >= 10) {
        notify('Maximal 10 Personen können zugewiesen werden.', true);
        return false;
    }
    return true;
}


/**
 * Renders avatar chips for all currently assigned contacts.
 * @returns {void}
 */
function renderAssignedAvatars() {
    const container = document.getElementById('assigned-avatars');
    const selected = addTaskContacts.filter(contact => assignedIds.includes(contact.id));
    const max = 6;
    const visible = selected.slice(0, max);
    let html = visible.map(contact => `<span class="avatar-chip" style="background-color:${contact.color}">${contact.avatar}</span>`).join('');
    if (selected.length > max) {
        const more = selected.length - max;
        html += `<span class="avatar-chip avatar-chip-more">+${more}</span>`;
    }
    container.innerHTML = html;
}



/**
 * Closes the assignment dropdown.
 * @returns {void}
 */
function closeAssignDropdown() {
    document.getElementById('assign-options').classList.add('d-none');
}


/**
 * Returns the assigned contacts as compact objects for the board.
 * @returns {Object[]} Assigned contacts with id, name, color, initials.
 */
function getAssignedContacts() {
    return addTaskContacts
        .filter(contact => assignedIds.includes(contact.id))
        .map(contact => ({ id: contact.id, name: contact.name, color: contact.color, initials: contact.avatar }));
}
