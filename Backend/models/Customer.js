class Customer {
  constructor(name, contactInfo, purchaseHistory = []) {
    this.name = name;
    this.contactInfo = contactInfo;
    this.purchaseHistory = purchaseHistory;
  }
}

export default Customer;
