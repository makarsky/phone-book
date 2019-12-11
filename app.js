Vue.component('confirmButton', {
  template:
    `<button type="button" @click="$emit('confirm')">
      <slot>Confirm</slot>
    </button>`
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

Vue.component('contactDeletionModal', {
  template: '#contact-deletion-modal-template',
  props: {
    contactName: String
  },
  methods: {
    doConfirm() {
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
    indexToEdit: null
  },
  methods: {
    addContact() {
      if (this.isInputValid()) {
        this.phoneBook.push(this.currentItem);
        this.currentItem = { name: '', phone: '' };
      }
    },
    setContactToEdit(contact, index) {
      console.log(contact.name, index);
      this.indexToEdit = index;
      this.contactToEdit = contact;
      // this.contactToEdit.name = contact.name;
      // this.contactToEdit.phone = contact.phone;
      console.log(this.contactToEdit.name, index);
    },
    updateContact() {
      this.phoneBook.splice(this.indexToEdit, 1, this.contactToEdit);
      this.contactToEdit = { name: '', phone: '' };
    },
    setContactToRemove(contact) {
      this.contactToEdit = contact;
      $('#contact-deletion-modal').modal('show');
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
    phoneBook(phoneBook) {
      if (phoneBook) {
        const parsed = JSON.stringify(phoneBook);
        localStorage.setItem('phoneBook', parsed);
      }
    }
  },
  mounted() {
    if (localStorage.getItem('phoneBook')) {
      this.phoneBook = JSON.parse(localStorage.getItem('phoneBook'));
    }
  },
});
