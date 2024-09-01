import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../../../config/firebaseConfig.js";

initializeApp(firebaseConfig);

const storage = getStorage();

export const ImageUploder = async (name, date, collectinName, file) => {
  if (!file) return null;

  const storageRef = ref(storage, `${collectinName}/${name + "+" + date}`);

  try {
    await uploadBytes(storageRef, file);
    console.log("Image uploaded successfully!");
    const downloadURL = await getDownloadURL(storageRef);
    console.log("Download URL:", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
