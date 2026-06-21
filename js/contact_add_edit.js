/**
 * Opens the dialog pre-filled with an existing contact's data for editing.
 *
 * @param {string|number} id - The id of the contact to edit.
 * @returns {void}
 */
function editContact(id) {
    if (!dialog) return;

    const contact = loadedContacts.find(c => String(c.id) === String(id));
    if (contact) {
        dialog.innerHTML = renderEditContactTemplate(contact);
        fillEditForm(contact);
        openDialog();
    }
}

/**
 * Fills the edit-contact form fields (avatar, name, email, phone)
 * with the given contact's current values.
 *
 * @param {Object} contact - The contact whose data should populate the form.
 * @returns {void}
 */
function fillEditForm(contact) {
    const avatarBox = dialog.querySelector('.profile-placeholder');
    if (avatarBox) {
        avatarBox.innerHTML = `<div class="big-avatar" style="background-color: ${contact.color};">${contact.avatar}</div>`;
    }
    dialog.querySelector('input[type="text"]').value = contact.name;
    dialog.querySelector('input[type="email"]').value = contact.email;
    dialog.querySelector('input[type="tel"]').value = contact.phone || '';
}

/**
 * Builds the HTML markup for the "Edit contact" dialog.
 *
 * @param {Object} contact - The contact being edited, used to wire the update handler.
 * @returns {string} HTML markup for the edit-contact dialog.
 */
function renderEditContactTemplate(contact) {
    const buttons = renderDialogContactEditButton(contact);
    return renderDialogContact('Edit contact', `updateContact(event, '${contact.id}')`, buttons);
}

/**
 * Handles submission of the "Add contact" form: reads form data,
 * builds a new contact object, and persists it.
 *
 * @param {SubmitEvent} event - The form submit event.
 * @returns {void}
 */
function createNewContact(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newContact = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone') || 'no phone number provided'
    };
    saveContactToDB(newContact);
    showToastFeedback('Contact successfully created');
}

/**
 * Saves a new contact locally for guest users (no backend persistence),
 * closes the dialog and re-renders the contact list.
 *
 * @param {Object} newContact - The contact to add to the local list.
 * @returns {void}
 */
function saveGuestContact(newContact) {
    loadedContacts.push(newContact);
    dialog.close();
    renderContacts();
}

/**
 * Common cleanup after a contact update: closes the dialog,
 * re-renders the contact list, and re-opens the detail view
 * for the updated contact.
 *
 * @param {string|number} id - The id of the updated contact.
 * @returns {void}
 */
async function deleteContact(id) {
    if (!id) return;
    try {
        if (!checkIsGuest()) {
            await fetch(`${CONTACTS_URL.replace('.json', '')}/${id}.json`, { method: 'DELETE' });
            await init();
        } else {
            loadedContacts = loadedContacts.filter(c => String(c.id) !== String(id));
            if (dialog?.open) dialog.close();
            renderContacts();
            showToastFeedback('Contact successfully deleted');
        }
        if (contactDetailsContainer) contactDetailsContainer.innerHTML = '';
    } catch (error) { console.error("Fehler beim Löschen:", error); }
}