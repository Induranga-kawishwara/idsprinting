import { db } from "../db.js";
import User from "../Models/Users.js";
import { broadcastCustomerChanges } from "../SocketIO/socketIO.js";

const UsersCollection = db.collection("Users");

// Create a new User
export const createUser = async (req, res) => {
  try {
    // Destructure values from req.body
    const {
      uid,
      name,
      surName,
      birthDay,
      email,
      nicNumber,
      nicFront,
      nicBack,
      houseNo,
      street,
      city,
      zipCode,
      employeePic,
      contactNum,
      referenceConNum,
      epfNumber,
      etfNUmber,
      sex,
      isAdmin,
      isEmployee,
      dateAndTime,
    } = req.body;

    const user = new User(
      uid,
      name,
      surName,
      birthDay,
      email,
      nicNumber,
      nicFront,
      nicBack,
      houseNo,
      street,
      city,
      zipCode,
      employeePic,
      contactNum,
      referenceConNum,
      epfNumber,
      etfNUmber,
      sex,
      isAdmin,
      isEmployee,
      dateAndTime
    );

    const docRef = await UsersCollection.add({ ...user });

    // Remove tesid from the new user object before broadcasting
    // const { tesid: unused, ...userWithouttesid } = user;
    // const newUser = { id: docRef.id, ...userWithouttesid };

    const newUser = { id: docRef.id, ...user };

    broadcastCustomerChanges("UserAdded", newUser);

    return res
      .status(201)
      .send({ message: "User created successfully", id: docRef.id });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ error: error.message });
  }
};

// Get all Users
export const getAllUsers = async (req, res) => {
  try {
    const snapshot = await UsersCollection.get();
    const User = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const sortedUser = User.map((user) => ({
      ...user,
      dateAndTime: new Date(user.dateAndTime),
    })).sort((a, b) => b.dateAndTime - a.dateAndTime);
    return res.status(200).send(sortedUser);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Get a User by ID
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await UsersCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).send({ message: "User not found" });
    }
    return res.status(200).send({ id: doc.id, ...doc.data() });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Update a User
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    // Check if the customer exists
    const doc = await UsersCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    await UsersCollection.doc(id).update(updatedData);

    const updatedUsers = { id, ...updatedData };
    broadcastCustomerChanges("UsersUpdated", updatedUsers);

    return res.status(200).send({ message: "User updated successfully" });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

export const updateUserAccessibility = async (req, res) => {
  const { id } = req.params;
  const accessibility = req.body;

  try {
    // Check if the customer exists
    const doc = await UsersCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).send({ message: "User not found" });
    }

    await UsersCollection.doc(id).update(accessibility);
    const updatedUsers = { id, ...accessibility };
    broadcastCustomerChanges("updateUserAccessibility", updatedUsers);

    return res.status(200).send({ message: "User updated successfully" });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

// Delete a User
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  console.log(id);

  try {
    const doc = await UsersCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    await UsersCollection.doc(id).delete();

    broadcastCustomerChanges("UserDeleted", { id });

    return res.status(200).send({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};
