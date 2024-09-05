/* eslint-disable camelcase */

export class View {
  constructor() {
    this.contactForm = document.querySelector('#contact_form');
    this.contactFormContainer = document.querySelector('#contact_form_container');
    this.contactList = document.querySelector('#contact_list');
    this.tagsMenu = document.querySelector('#tags_menu');
    this.tagsMenuNav = document.querySelector('#tags_menu_nav');
    this.tagsInputBox = document.querySelector('#tags');
    this.searchBar = document.querySelector('#search');
    this.noContactsBanner = document.querySelector('.no_contacts');
    this.templates = {};
    this.loadTemplates();
  }

  loadTemplates() {
    Handlebars.registerPartial('contact', document.querySelector('#contact_partial_template').innerHTML);
    this.templates.contactInfo = Handlebars.compile(document.querySelector('#contact_partial_template').innerHTML);
    this.templates.contactList = Handlebars.compile(document.querySelector('#contacts_template').innerHTML);
    this.templates.tags = Handlebars.compile(document.querySelector('#tags_partial_template').innerHTML);
    this.templates.noContactsBanner = Handlebars.compile(document.querySelector('#no_contacts_template').innerHTML);
  }


  // ---  Contacts view methods:

  buildContact(contactInfo) {
    let contact = {
      id: contactInfo.dataset.id,
      full_name: contactInfo.querySelector('h3').textContent.trim(),
      phone_number: contactInfo.querySelector('dd').textContent.trim(),
      email: contactInfo.querySelector('dl').children[3].textContent.trim(),
      tags: contactInfo.querySelector('dl').lastElementChild.textContent,
    };

    return contact;
  }

  renderContact(contact) {
    this.contactList.insertAdjacentHTML('beforeend', contact);
  }

  renderContacts(contacts) {
    this.contactList.innerHTML = contacts;
  }

  renderNoContactBanner() {
    this.contactList.innerHTML = this.templates.noContactsBanner();
  }


  // --- Contact Form view methods:

  populateEditContactForm(contact) {
    let fullName = this.contactForm.querySelector('#full_name');
    let email = this.contactForm.querySelector('#email');
    let phoneNumber = this.contactForm.querySelector('#phone_number');
    let id = this.contactForm.querySelector('.id');
    let tags = this.contactForm.querySelector('#tags');

    fullName.value = contact.full_name;
    email.value = contact.email;
    phoneNumber.value = contact.phone_number;
    id.value = contact.id;
    tags.value = contact.tags;
  }

  hideContactForm() {
    this.contactFormContainer.classList.replace('show', 'hide');
    this.contactForm.classList.replace('show', 'hide');
  }

  showContactForm() {
    this.contactFormContainer.classList.replace('hide', 'show');
    this.contactForm.classList.replace('hide', 'show');
  }

  restoreAddContactForm() {
    this.contactForm.querySelector('h2').textContent = 'Create Contact';
    this.contactForm.reset();
    this.contactForm.classList.remove('edit_contact');
    this.contactForm.classList.add('create_contact');
    this.contactForm.lastElementChild.classList.replace('cancel_edit', 'cancel_add');
  }

  restoreEditContactForm() {
    this.contactForm.classList.remove('create_contact');
    this.contactForm.classList.add('edit_contact');
    this.contactForm.querySelectorAll('button')[1].classList.add('cancel_edit');
    this.contactForm.querySelector('h2').textContent = 'Edit Contact';
  }

  // --- Tags View methods:

  tagsToArray(tags) {
    return tags.trim().split(',');
  }

  renderTags(tags) {
    this.tagsMenu.innerHTML = tags;
    this.tagsMenuNav.innerHTML = tags;
  }

  formatTags(tags) {
    tags = tags.split(',');
    tags = tags.map(tag => tag.trim()).filter(tag => tag);
    return [...new Set(tags)].join(', ');
  }

  populateTags(tags) {
    this.renderTags(this.templates.tags({tags: tags}));
  }
}