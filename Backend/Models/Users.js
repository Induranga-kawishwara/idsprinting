class Users {
  constructor(
    uID,
    name,
    surName,
    birthDay,
    email,
    nicFront,
    nicBack,
    houseNo,
    street,
    zipCode,
    employeePic,
    contactNum,
    referenceConNum,
    epfNumber,
    etfNUmber,
    sex,
    acessbility = [],
    dateAndTime
  ) {
    this.uID = uID;
    this.name = name;
    this.surName = surName;
    this.birthDay = birthDay;
    this.email = email;
    this.nicFront = nicFront;
    this.nicBack = nicBack;
    this.houseNo = houseNo;
    this.street = street;
    this.zipCode = zipCode;
    this.employeePic = employeePic;
    this.contactNum = contactNum;
    this.referenceConNum = referenceConNum;
    this.epfNumber = epfNumber;
    this.etfNUmber = etfNUmber;
    this.sex = sex;
    this.acessbility = acessbility;
    this.dateAndTime = dateAndTime;
  }
}

export default Users;
