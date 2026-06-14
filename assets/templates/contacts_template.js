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
                            <div class="profile-actions for-mobile-hide" id="profile">
                                <button type="button" class="profile-btn" onclick="editContact('${contact.id}')">
                                <img src="../assets/icons/edit_contacts.svg"alt="edit"> Edit
                                </button>
                                <button type="button" class="profile-btn" onclick="deleteContact('${contact.id}')">
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

                        <button type="button" class="btn-options-mobile" onclick="toggleMobileOptions(event)">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="5" r="2" fill="white"/>
                                <circle cx="12" cy="12" r="2" fill="white"/>
                                <circle cx="12" cy="19" r="2" fill="white"/>
                            </svg>
                        </button>

                        <div id="mobile-options-menu" class="mobile-options-popup" onclick="event.stopPropagation()">
                            <div class="menu-item" onclick="editContact('${contact.id}')">
                               <img src="../assets/icons/edit_contacts.svg" alt="Edit">
                               <span>Edit</span>
                           </div>
                            <div class="menu-item" onclick="deleteContact('${contact.id}')">
                                <img src="../assets/icons/delete.svg" alt="Delete">
                                <span>Delete</span>
                            </div>
                      </div>
                    </div>`;
}

function renderDialogContact(title, submitAction, buttonHtml) {
    return `<div class="modal-content" onclick="event.stopPropagation()">
            <div class="modal-left">
            <button type="button" class="close-dialog dp-show-mobile" onclick="closeDialog()">×</button>
                <div class="modal-logo for-mobile-hide"><img src="../assets/img/logo_white.svg" alt="join icon"></div>
                <h2>${title}</h2>
                ${title.includes('Edit') ? '' : `<p class="modal-tagline">Tasks are better with a team!</p>`}
                <div class="modal-divider"></div>
            </div>

            <form method="dialog" class="modal-right" onsubmit="${submitAction}">
                <button type="button" class="close-dialog dp-hidden-mobile" onclick="closeDialog()">×</button>

                <div class="profile-placeholder">
                    <i class="fa-solid fa-user"></i>
                </div>

                <div class="input-group">
                    <input type="text" name="name" placeholder="Name" required>
                    <i class="fa-solid fa-user"></i>
                </div>

                <div class="input-group">
                    <input type="email" name="email" placeholder="Email" required>
                    <i class="fa-solid fa-envelope"></i>
                </div>

                <div class="input-group">
                    <input type="tel" name="phone" placeholder="Phone">
                    <i class="fa-solid fa-phone"></i>
                </div>

                <div class="modal-footer">
                    ${buttonHtml}
                </div>
            </form>
        </div> `;
}


function renderDialogContactEditButton(contact) {
    return `<button type="button" class="btn-cancel" onclick="deleteContact('${contact.id}')"> Delete <i
                class="fa-solid fa-xmark"></i></button>
            <button type="submit" class="btn-submit"> Save <i class="fa-solid fa-check"></i></button>`;
}

function renderDialogCreateContactButton() {
    return `<button type="button" class="btn-cancel" onclick="closeDialog()"> Cancel <i
                class="fa-solid fa-xmark"></i></button>
            <button type="submit" class="btn-submit"> Create contact <i class="fa-solid fa-check"></i></button>`;
}