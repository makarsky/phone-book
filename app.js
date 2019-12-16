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
  saveContact(contact) {
    if (contact.id) {
      this.updateContact(contact);
    } else {
      this.addContact(contact);
    }
    this.saveAll();
  }
  addContact(contact) {
    this.contacts.push({ id: this.contacts.length, ...contact });
  }
  updateContact(editedContact) {
    this.contacts.splice(this.contacts.find(contact => contact.id === editedContact.id), 1, editedContact);
  }
  removeContact(contact) {
    this.contacts.splice(this.contacts.indexOf(contact), 1);
    this.saveAll();
  }
}

class Validator {
  constructor(service) {
    this.service = service;
  }
  validate(model) {
    const validation = {
      isValid: true,
      messages: [],
    };

    for (const p in model) {
      if (p === 'id') continue;

      const constraints = this.service.getFieldConstraints(p);

      if (!constraints.empty && this.isEmpty(model[p])) {
        validation.isValid = false;
        validation.messages.push({ field: p, message: 'This field must be filled' });
      }
      if (constraints.unique && !this.isUnique(p, model.id, model[p])) {
        validation.isValid = false;
        validation.messages.push({ field: p, message: 'This field must be unique' });
      }
    }

    return validation;
  }
  isEmpty(value) {
    return !(value && value.length > 0);
  }
  isUnique(field, id, value) {
    return !this.service.getList().find(contact => contact[field] === value && contact.id !== id);
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
    isDangerous: Boolean,
    canBeClosed: Boolean
  },
  methods: {
    closeModal() {
      $('.modal').modal('hide');
      this.$emit('close');
    },
    doConfirm() {
      if (this.canBeClosed) {
        this.closeModal();
      }
      this.$emit('confirm');
    }
  }
});

Vue.component('contactRemovalModal', {
  template: '#contact-removal-modal-template',
  props: {
    contactName: String,
    canBeClosed: Boolean
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
  data: () => {
    return {
      editedContact: {},
      validation: { isValid: false, messages: [] },
      canBeClosed: true,
      errors: {}
    }
  },
  methods: {
    saveContact() {
      this.clearErrors();

      if (this.validation.isValid) {
        service.saveContact(this.editedContact);
        this.$emit('confirm');
      } else {
        this.showErrors();
      }
    },
    close() {
      this.clearErrors();
      this.$emit('close');
    },
    clearErrors() {
      for (const p in this.errors) {
        this.$set(this.errors, p, null);
      }
    },
    showErrors() {
      this.validation.messages.forEach(m => {
        this.$set(this.errors, m.field, m.message);
      });
    }
  },
  watch: {
    contact(contact) {
      this.editedContact = Vue.util.extend({}, contact);
    },
    editedContact: {
      handler(editedContact) {
        this.validation = validator.validate(editedContact);
        this.canBeClosed = this.validation.isValid;
      },
      deep: true
    }
  }
});

new Vue({
  el: '#app',
  data: {
    contactToEdit: {},
    phoneBook: [],
    contactValidation: {},
    sortInAscendingOrder: true
  },
  methods: {
    openContactAddingModal() {
      this.contactToEdit = {};
      $('#contact-adding-modal').modal('show');
    },
    setContactToEdit(contact) {
      this.contactToEdit = contact;
      $('#contact-editing-modal').modal('show');
    },
    unsetEditedContact() {
      this.contactToEdit = {};
    },
    setContactToRemove(contact) {
      this.contactToEdit = contact;
      $('#contact-removal-modal').modal('show');
    },
    removeContact() {
      service.removeContact(this.contactToEdit);
      // this.phoneBook.splice(this.phoneBook.indexOf(this.contactToEdit), 1);
    },
    toggleSortingOrder() {
      this.sortInAscendingOrder = !this.sortInAscendingOrder;
    }
  },
  computed: {
    sortedNames() {
      return this.phoneBook.sort((a, b) => {
        return a.name.localeCompare(b.name) * (this.sortInAscendingOrder ? 1 : -1);
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
