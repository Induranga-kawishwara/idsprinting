class Expenses {
  constructor(
    expensesname,
    expensesType,
    supplier,
    other,
    description,
    amount,
    paymentMethod,
    bankTranferNum,
    chequeNum,
    invoiceNumber,
    dateAndTime,
    image
  ) {
    this.expensesname = expensesname;
    this.expensesType = expensesType;
    this.supplier = supplier;
    this.other = other;
    this.description = description;
    this.amount = amount;
    this.paymentMethod = paymentMethod;
    this.bankTranferNum = bankTranferNum;
    this.chequeNum = chequeNum;
    this.invoiceNumber = invoiceNumber;
    this.dateAndTime = dateAndTime;
    this.image = image;
  }
}

export default Expenses;
