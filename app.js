class ContactService {
  constructor() {
    this.contacts = [];
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
  addContact(contact) {
    // TODO: use validator
    this.contacts.push({id: this.contacts.length, ...contact});
    this.saveAll();
  }
  updateContact(id, editedContact) {
    // TODO: use validator
    // const result = validate(editedContact);
    this.contacts.splice(this.contacts.find(contact => contact.id === id), 1, editedContact);
    this.saveAll();
  }
  removeContact(id) {
    this.contacts.splice(this.contacts.find(contact => contact.id === id), 1);
    this.saveAll();
  }
}

const service = new ContactService();

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
    contactToEditIndex: null
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
