class Expenses {
  constructor(
    expensesname,
    expensesType,
    description,
    amount,
    paymentMethod,
    invoiceNumber,
    dateAndTime,
    image
  ) {
    this.expensesname = expensesname;
    this.expensesType = expensesType;
    this.description = description;
    this.amount = amount;
    this.paymentMethod = paymentMethod;
    this.invoiceNumber = invoiceNumber;
    this.dateAndTime = dateAndTime;
    this.image = image;
  }
}

export default Expenses;
