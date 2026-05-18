function renderContactlist(contact) {
    return `<div class="contact-item" id="${contact.id}" onclick="showContactDetails('${contact.id}')">
        <div class="avatar" style="background-color: ${contact.color};">${contact.avatar}</div>
        <div class="contact-info">
            <span class="name">${contact.name}</span>
            <span class="email">${contact.email}</span>
        </div>
    </div>`;
}

function renderLetterGroupTemplate(letter, itemsHtml) {
    return `
        <div class="letter-group">
            <h2 class="letter-group-title">${letter}</h2>
            ${itemsHtml}
        </div>
    `;
}

function renderContactDetails(contact) {
    return `<div class="profile-header">
                        <div class="profile-avatar" style="background-color: ${contact.color};">${contact.avatar}</div>
                        <div class="profile-meta">
                            <h2 class="profile-name">${contact.name}</h2>
                            <div class="profile-actions">
                                <button type="button" class="profile-btn" onclick="editContact('${contact.id}')">
                                <img src="../assets/icons/edit_contacts.svg"alt="edit"> Edit
                                </button>
                                <button type="button" class="profile-btn">
                                <img src="../assets/icons/delete.svg"alt="delete"> Delete
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="profile-body">
                        <h3 class="section-title">Contact Information</h3>

                        <div class="info-group">
                            <label class="info-label">E-mail</label>
                            <span class="info-value email-link">${contact.email}</span>
                        </div>

                        <div class="info-group">
                            <label class="info-label">Phone</label>
                            <span class="info-value">${contact.phone}</span>
                        </div>
                    </div>`;
}