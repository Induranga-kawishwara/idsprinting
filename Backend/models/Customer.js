class Customer {
  constructor(name, email, test, contactNumber, purchaseHistory = []) {
    this.name = name;
    this.email = email;
    this.contactNumber = contactNumber;
    this.purchaseHistory = purchaseHistory;
  }
}

export default Customer;
