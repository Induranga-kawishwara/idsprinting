import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../../../config/firebaseConfig.js";

initializeApp(firebaseConfig);

const storage = getStorage();

function isFirebaseURL(url) {
  return url.startsWith("https://firebasestorage.googleapis.com/");
}

export const ImageUploader = async (name, date, collectionName, file) => {
  if (!file) return null;

  if (typeof file === "string" && isFirebaseURL(file)) {
    console.log("File is already a Firebase URL:", file);
    return file;
  }

  const storageRef = ref(storage, `${collectionName}/${name + "+" + date}`);

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
