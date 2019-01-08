var vm1 = new Vue({
    el: '#app',
    data: {
        currentItem: { name: '', phone: '' },
        contactToEdit: { name: '', phone: '' },
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
            this.indexToEdit = index;
            this.contactToEdit.name = contact.name;
            this.contactToEdit.phone = contact.phone;
        },
        updateContact() {
            this.phoneBook.splice(this.indexToEdit, 1, this.contactToEdit);
        },
        removeContact() {
            this.phoneBook.splice(this.indexToEdit, 1);
        },
        isInputValid() {
            this.currentItem.name = this.currentItem.name.trim();
            this.currentItem.phone = this.currentItem.phone.trim();
            const phoneCopies = this.phoneBook.filter(contact => contact.phone === this.currentItem.phone);

            return this.currentItem.name.length > 0 && this.currentItem.phone.length > 0 && phoneCopies.length === 0;
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
