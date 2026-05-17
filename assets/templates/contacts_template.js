function renderContactlist(contact) {
    return `<div class="contact-item" id="${contact.id}">
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