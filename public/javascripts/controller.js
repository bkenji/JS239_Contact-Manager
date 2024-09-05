/* eslint-disable max-len */

export class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.init();
    this.searchTimeout = null;
  }

  async loadContacts() {
    let contacts = await this.model.fetchContacts();
    contacts.forEach(contact => {
      contact.tags = this.view.tagsToArray(contact.tags);
    });
    this.view.renderContacts(this.view.templates.contactList({ contacts: contacts }));
    this.view.populateTags(this.model.collectTags());
    if (!this.model.contacts.length)  {
      this.view.renderNoContactBanner();
      this.addContactLinkBannerHandler();
    }
  }

  handleEvents() {
    this.addContactHandler();
    this.deleteContactHandler();
    this.editContactButtonHandler();
    this.addContactLinkNavHandler();
    this.addTagsfromMenuHandler();
    this.searchHandler();
    this.searchByTagHandler();
    this.invalidFormHandler();
    this.formInputValidationHandler();
    this.inputKeyDownHandler();
    this.inputKeyUpHandler();
  }

  deleteContactHandler() {
    this.view.contactList.addEventListener('click', event => {
      if (event.target.classList.contains('delete_contact')) {
        let id = event.target.closest('.contact_info').dataset.id;
        if (window.confirm('Do you want to delete the contact?')) {
          this.model.deleteContact(id).then(() => this.loadContacts());
        }
      }
    });
  }

  addContactHandler() {
    this.handleAddContactBound = this.handleAddContact.bind(this);
    this.view.contactForm.addEventListener('submit', this.handleAddContactBound);

    this.addContactCancelButtonBound = this.handleAddContactCancelButton.bind(this);
    this.view.contactForm.addEventListener('click', this.addContactCancelButtonBound);
  }

  handleAddContact(event) {
    event.preventDefault();
    let formData = new FormData(event.target);
    let data = Object.fromEntries(formData.entries());
    data.tags = this.view.formatTags(data.tags);

    this.model.addContact(data).then(info => {
      this.view.renderContact(this.view.templates.contactInfo(info));
      this.view.contactForm.reset();
      this.loadContacts();
    });
    this.view.hideContactForm();
  }

  removeAddContactHandler() {
    this.view.contactForm.removeEventListener('submit', this.handleAddContactBound);
  }

  removeAddContactCancelHandler() {
    this.view.contactForm.removeEventListener('click', this.addContactCancelButtonBound);
  }

  handleAddContactCancelButton(event) {
    if (event.target.classList.contains('cancel_add')) {
      event.preventDefault();
      this.view.contactForm.reset();
      this.view.hideContactForm();
      this.removeEditContactHandler();
    }
  }

  editContactButtonHandler() {
    this.view.contactList.addEventListener('click', event => {
      if (event.target.classList.contains('edit_contact')) {
        this.view.restoreEditContactForm();
        let contactInfo = this.view.buildContact(event.target.closest('.contact_info'));
        this.view.showContactForm();
        this.view.populateEditContactForm(contactInfo);
        this.removeAddContactCancelHandler();
        this.removeAddContactHandler();
        this.editContactFormHandler();
      }
    });
  }

  editContactFormHandler() {
    this.editContactBound = this.handleEditContact.bind(this);
    this.view.contactForm.addEventListener('submit', this.editContactBound);

    this.cancelEditContactBound = this.cancelEditContactHandler.bind(this);
    this.view.contactForm.addEventListener('click', this.cancelEditContactBound);
  }

  cancelEditContactHandler(event) {
    if (event.target.classList.contains('cancel_edit')) {
      event.preventDefault();
      this.view.restoreAddContactForm();
      this.view.hideContactForm();
      this.removeEditContactHandler();
      this.removeCancelEditContactHandler(); // here
      this.addContactHandler();
    }
  }

  removeEditContactHandler() {
    this.view.contactForm.removeEventListener('submit', this.editContactBound);
  }

  removeCancelEditContactHandler() {
    this.view.contactForm.removeEventListener('click', this.cancelEditContactBound);
  }

  handleEditContact(event) {
    event.preventDefault();
    console.log(`Event target ${event.target}; event type ${event.type}`);
    let formData = new FormData(event.target);
    let data = Object.fromEntries(formData.entries());
    data.tags = this.view.formatTags(data.tags);
    this.model.editContact(data).then(info => {
      this.view.renderContact(this.view.templates.contactInfo(info));
      this.loadContacts();
      this.view.restoreAddContactForm();
      this.addContactHandler();
      this.removeEditContactHandler();
      this.removeCancelEditContactHandler();
      this.view.hideContactForm();
    }).catch(error => {
      console.error(`Failed to update contact: ${error}`);
    });
  }

  addContactLinkNavHandler() {
    let addContactLinkNav = document.querySelector('.add_contact');

    addContactLinkNav.addEventListener('click', event => {
      event.preventDefault();
      this.view.showContactForm();
    });
  }

  addContactLinkBannerHandler() {
    let addContactLinkBanner = this.view.contactList.querySelector('.add_contact');

    addContactLinkBanner.addEventListener('click', event => {
      event.preventDefault();
      this.view.showContactForm();
    });
  }

  addTagsfromMenuHandler() {
    this.view.tagsMenu.addEventListener('change', event => {
      if (!this.view.tagsInputBox.value.includes(event.target.value)) {
        if (this.view.tagsInputBox.value.trim() && this.view.tagsInputBox.value.trim().slice(-1) !== ',') {
          this.view.tagsInputBox.value += `, ${event.target.value}, `;
        } else if (this.view.tagsInputBox.value.trim()) {
          this.view.tagsInputBox.value += `${event.target.value}, `;
        } else {
          this.view.tagsInputBox.value += `${event.target.value}, `;
        }
      }
    });
  }

  // --- Search handling:

  searchHandler() {
    this.view.searchBar.addEventListener('input', event => {
      clearTimeout(this.searchTimeout);

      this.searchTimeout = setTimeout(() => {
        let searchValue = event.target.value;
        let matches = this.model.searchContacts(searchValue);
        if (matches.length) {
          this.view.renderContacts(this.view.templates.contactList({contacts : matches}));
        } else {
          this.view.renderContacts(`<h2 class="no_matches">No contacts containing "<span>${searchValue}<span>"</h2>`);
        }
      }, 300);
    });
  }

  searchByTagHandler() {
    this.view.tagsMenuNav.addEventListener('change', event => {
      let matches = this.model.searchByTag(event.target.value);
      if (matches.length ) {
        this.view.renderContacts(this.view.templates.contactList({contacts: matches}));
      } else {
        this.view.renderContacts(this.view.templates.contactList({contacts: this.model.contacts}));
      }
    });
  }

  // --- Validation handling:

  validationMessages(event) {
    let elementName = event.target.parentElement.previousElementSibling.children[0].textContent;
    if (event.target.validity.valueMissing) {
      event.target.setCustomValidity(`${elementName} is required`);
    } else if (event.target.validity.patternMismatch && event.target.name === "full_name") {
      event.target.setCustomValidity(`${elementName} must consist of alphabetic characters`);
    } else if (event.target.validity.typeMismatch && event.target.name === 'email') {
      event.target.setCustomValidity(`Please include an '@' in the email address`);
    } else if (event.target.validity.patternMismatch && event.target.name === "phone_number") {
      event.target.setCustomValidity(`${elementName} must consist of 10 digits`);
    } else if (event.target.validity.tooShort) {
      event.target.setCustomValidity(`${elementName} must be at least ${event.target.getAttribute('minlength')} characters long.`);
    } else {
      event.target.setCustomValidity('');
    }
  }

  invalidFormHandler() {
    this.view.contactForm.addEventListener('invalid', event => {
      event.preventDefault();
      event.target.classList.add('error_message');
      this.validationMessages(event);
      event.target.parentElement.lastElementChild.textContent = event.target.validationMessage;
    }, true);
  }

  formInputValidationHandler() {
    this.view.contactForm.addEventListener('input', event => {
      if (event.target.tagName !== 'SELECT') {
        this.validationMessages(event);
        if (event.target.validity.valid) {
          event.target.classList.remove('error_message');
          event.target.parentElement.lastElementChild.textContent = '';
        } else if (!event.target.validity.valid) {
          event.target.classList.add('error_message');
          event.target.parentElement.lastElementChild.textContent = event.target.validationMessage;
        }
      }
    });
  }

  inputKeyDownHandler() {
    this.view.contactForm.addEventListener('keydown', event => {
      const pattern = /\s+/;
      if (event.target.id === 'phone_number') {
        if (pattern.test(event.key)) {
          event.preventDefault();
        }
      }
    });
  }

  inputKeyUpHandler() {
    this.view.contactForm.addEventListener('keyup', event => {
      if (event.target.id === 'tags') {
        if (event.key === event.key.toUpperCase()) {
          event.target.value = event.target.value.toLowerCase();
        }
      }
    });
  }

  init() {
    this.handleEvents();
    this.loadContacts();
  }
}
