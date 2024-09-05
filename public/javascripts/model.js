export class Model {
  constructor() {
    this.contacts = [];
  }

  async fetchContacts() {
    try {
      const response = await fetch('/api/contacts');
      this.contacts = await response.json();
      return this.contacts;
    } catch (error) {
      console.error(`Failed to fetch contacts: ${error}`);
      return null;
    }
  }

  async fetchContact(id) {
    try {
      const response = await fetch(`api/contacts/${id}`);
      const contact = await response.json();
      return contact;
    } catch (error) {
      console.error(`Failed to fetch contact: ${error}`);
      return null;
    }
  }

  async addContact(data) {
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error(`Error: ${error}`);
      return null;
    }
  }

  deleteContact(id) {
    return fetch(`api/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  async editContact(data) {
    try {
      const response = await fetch(`/api/contacts/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error(`Error: ${error}`);
      return null;
    }
  }

  // --- Tag extraction from Contacts:

  collectTags() {
    let tags = [];
    this.contacts.forEach(contact => {
      if (contact.tags) {
        tags.push(contact.tags);
      }
    });

    tags = tags.flat().filter(tag => tag !== '');
    tags = tags.map(tag => tag.trim()).sort();
    return [...new Set(tags)];
  }

  // --- Search logic:

  searchContacts(searchTerm) {
    return this.contacts.filter(contact => {
      return contact.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }

  searchByTag(tag) {

    if (tag.trim()) {
      return this.contacts.filter(contact => {
        return contact.tags.map(tag => tag.trim()).includes(tag);
      });
    } else {
      return '';
    }
  }
}