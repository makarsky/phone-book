class ContactService {
  constructor() {
    this.contacts = [];
    this.constraints = {
      name: {
        unique: false,
        empty: false
      },
      phone: {
        unique: true,
        empty: false
      }
    };
  }
  getFieldConstraints(field) {
    return this.constraints[field];
  }
  loadAll() {
    if (localStorage.getItem('contacts')) {
      this.contacts = JSON.parse(localStorage.getItem('contacts'));
    }
  }
  saveAll() {
    const parsed = JSON.stringify(this.contacts);
    localStorage.setItem('contacts', parsed);
  }
  getList() {
    return this.contacts;
  }
  getOneById(id) {
    return this.contacts.find(contact => contact.id === id);
  }
  saveContact(contact) {
    if (contact.id) {
      this.updateContact(contact);
    } else {
      this.addContact(contact);
    }
    this.saveAll();
  }
  addContact(contact) {
    this.contacts.push({id: this.contacts.length, ...contact});
  }
  updateContact(editedContact) {
    this.contacts.splice(this.contacts.find(contact => contact.id === editedContact.id), 1, editedContact);
  }
  removeContact(id) {
    this.contacts.splice(this.contacts.find(contact => contact.id === id), 1);
    this.saveAll();
  }
}

class Validator {
  constructor(service) {
    this.service = service;
  }
  validate(model) {
    const validation = {
      isValid: false,
      messages: [],
    };

    for (const p in model) {
      if (p === 'id') continue;

      const constraints = this.service.getFieldConstraints(p);

      if (!constraints.empty && this.isEmpty(model[p])) {
        validation.isValid = false;
        validation.messages.push({field: p, message: 'This field must be filled'});
      }
      if (constraints.unique && this.isEmptyUnique(model[p])) {
        validation.isValid = false;
        validation.messages.push({field: p, message: 'This field must be unique'});
      }
    }

    return validation;
  }
  isEmpty(value) {
    return !(value && value.length > 0);
  }
  isUnique(field, value) {
    return !this.service.getList().find(contact => contact[field] === value);
  }
}

const service = new ContactService();
const validator = new Validator(service);

Vue.component('confirmButton', {
  template:
    `<button class="btn" :class="{ 'btn-danger': isDangerous, 'btn-success': !isDangerous }" @click="$emit('confirm')">
      <slot>Confirm</slot>
    </button>`,
  props: {
    isDangerous: Boolean
  },
});

Vue.component('contactModal', {
  template: '#contact-modal',
  props: {
    confirmButtonLabel: String,
    isDangerous: Boolean
  },
  methods: {
    closeModal() {
      $('.modal').modal('hide');
    },
    doConfirm() {
      this.$emit('confirm');
      this.closeModal();
    }
  }
});

Vue.component('contactRemovalModal', {
  template: '#contact-removal-modal-template',
  props: {
    contactName: String
  },
  methods: {
    doConfirm() {
      this.$emit('confirm');
    }
  }
});

Vue.component('contactEditingModal', {
  template: '#contact-editing-modal-template',
  props: {
    contact: Object
  },
  methods: {
    updateContact() {
      
      this.$emit('confirm');
    }
  }
});

new Vue({
  el: '#app',
  data: {
    currentItem: { name: '', phone: '' },
    contactToEdit: {},
    phoneBook: [],
    contactToEditIndex: null,
    contactValidation: {}
  },
  methods: {
    addContact() {
      if (this.isInputValid()) {
        this.phoneBook.push(this.currentItem);
        this.currentItem = { name: '', phone: '' };
      }
      // this.contactValidation = service.addContact(contact);
    },
    setContactToEdit(contact, index) {
      this.contactToEditIndex = index;
      this.contactToEdit = Vue.util.extend({}, contact);
      $('#contact-editing-modal').modal('show');
    },
    updateContact() {
      this.phoneBook.splice(this.contactToEditIndex, 1, this.contactToEdit);
      // this.contactValidation = service.updateContact(contact);
    },
    setContactToRemove(contact) {
      this.contactToEdit = contact;
      $('#contact-removal-modal').modal('show');
    },
    removeContact() {
      this.phoneBook.splice(this.phoneBook.indexOf(this.contactToEdit), 1);
    },
    isInputValid() {
      this.currentItem.name = this.currentItem.name.trim();
      this.currentItem.phone = this.currentItem.phone.trim();
      const contact = this.phoneBook.find(contact => contact.phone === this.currentItem.phone);

      if (this.currentItem.name.length <= 0 || this.currentItem.phone.length <= 0) {
        alert('All inputs must be filled');
      } else if (contact) {
        alert('This number is already on the list');
      }

      return this.currentItem.name.length > 0 && this.currentItem.phone.length > 0 && !contact;
    }
  },
  computed: {
    sortNames() {
      return this.phoneBook.sort((a, b) => {
        if (a.name > b.name) {
          return 1;
        }
        if (a.name < b.name) {
          return -1;
        }
        return 0;
      });
    }
  },
  watch: {
    phoneBook() {
      service.saveAll();
    }
  },
  mounted() {
    service.loadAll();
    this.phoneBook = service.getList();
  },
});
