/** @type {Object} Centralized validation configuration for contact fields */
const CONTACT_VALIDATION = {
    name: { id: 'modal-name', errorId: 'name-error', type: 'name' },
    email: { id: 'modal-email', errorId: 'email-error', type: 'regex', rule: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ },
    phone: { id: 'modal-phone', errorId: 'phone-error', type: 'regex', rule: /^[0-9]+$/ }
};

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

/**
 * Checks an input field's value against a regular expression and toggles
 * the visibility of the corresponding error message box.
 * @param {string} inputId - The HTML ID of the input field to validate.
 * @param {string} errorId - The HTML ID of the error message container.
 * @param {RegExp} regex - The regular expression to test the input value against.
 * @returns {boolean} True if the input value matches the regex, otherwise false.
 */
function checkFieldRegex(inputId, errorId, regex) {
    const input = document.getElementById(inputId);
    const errorBox = document.getElementById(errorId);
    if (!input || !errorBox) return false;
    
    const isValid = regex.test(input.value.trim());
    if (isValid) {
        errorBox.classList.remove('visible');
    } else {
        errorBox.classList.add('visible');
    }
    return isValid;
}

/**
 * Final check upon form submission. Re-validates all fields using the central config.
 * @param {SubmitEvent} event - The native submit event of the form.
 * @param {Function} originalSubmitAction - The actual save or update function.
 * @returns {void}
 */
function handleContactSubmit(event, originalSubmitAction) {
    event.preventDefault();
    const isNameValid = validateField('name');
    const isEmailValid = validateField('email');
    const isPhoneValid = validateField('phone');
    
    if (isNameValid && isEmailValid && isPhoneValid && typeof originalSubmitAction === 'function') {
        originalSubmitAction(); 
    }
}

/**
 * Checks an input field's value against a regular expression if it is not empty.
 * Toggles the visibility of the corresponding error message box.
 * @param {string} inputId - The HTML ID of the input field to validate.
 * @param {string} errorId - The HTML ID of the error message container.
 * @param {RegExp} regex - The regular expression to test the input value against.
 * @returns {boolean} True if the input is empty or matches the regex, otherwise false.
 */
function checkFieldRegex(inputId, errorId, regex) {
    const input = document.getElementById(inputId);
    const errorBox = document.getElementById(errorId);
    if (!input || !errorBox) return false;
    
    const value = input.value.trim();
    const isValid = value === '' || regex.test(value);
    
    errorBox.classList.toggle('visible', !isValid);
    return isValid;
}

/**
 * Validates that the input contains at least a first name and a last name.
 * Toggles the visibility of the corresponding error message box.
 * @param {string} inputId - The HTML ID of the name input field.
 * @param {string} errorId - The HTML ID of the error message container.
 * @returns {boolean} True if both first and last name are present, otherwise false.
 */
function checkNameField(inputId, errorId) {
    const input = document.getElementById(inputId);
    const errorBox = document.getElementById(errorId);
    if (!input || !errorBox) return false;
    
    const names = input.value.trim().split(/\s+/);
    const isValid = names.length >= 2 && names[0] !== '' && names[1] !== '';
    
    errorBox.classList.toggle('visible', !isValid);
    return isValid;
}

/**
 * Sanitizes the input field in real-time by removing any non-numeric characters.
 * * @param {HTMLInputElement} input - The input element triggering the event.
 * @returns {void}
 */
function allowOnlyNumbers(input) {
    input.value = input.value.replace(/[^0-9]/g, '');
}

/**
 * Validates a single field by its configuration name (used for onblur).
 * @param {string} fieldName - The key of the field in CONTACT_VALIDATION ('name', 'email', 'phone').
 * @returns {boolean} True if the field is valid, otherwise false.
 */
function validateField(fieldName) {
    const config = CONTACT_VALIDATION[fieldName];
    if (!config) return false;
    
    if (config.type === 'name') {
        return checkNameField(config.id, config.errorId);
    }
    return checkFieldRegex(config.id, config.errorId, config.rule);
}