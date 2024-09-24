class Customer {
  constructor(
    name,
    surName,
    email,
    contactNumber,
    houseNo,
    street,
    city,
    postalCode,
    customerType,
    addedDateAndTime,
    payments = []
  ) {
    this.name = name;
    this.surName = surName;
    this.email = email;
    this.contactNumber = contactNumber;
    this.houseNo = houseNo;
    this.street = street;
    this.city = city;
    this.postalCode = postalCode;
    this.customerType = customerType;
    this.addedDateAndTime = addedDateAndTime;
    this.payments = payments;
  }
}

export default Customer;
