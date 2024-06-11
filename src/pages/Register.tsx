import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import React, { useEffect, useState } from "react";
import { auth, storage } from "../config/controller";
import { db } from "../config/controller";
import { setDoc, doc } from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

export default function Login() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/");
      }
    });
  }, []);

  const createUserDoc = async (
    uid: string,
    username: string,
    email: string,
    photoURL: string
  ) => {
    try {
      const docRef = await setDoc(doc(db, "users", uid), {
        username: username,
        email: email,
        photoURL: photoURL
      });
      console.log("Document written with ID: ", docRef);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files && event.currentTarget.files.length > 0) {
      setFile(event.currentTarget.files[0]);
    }
  };

  const handleRegistration = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const target = event.currentTarget;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        target.email.value,
        target.password.value
      );
      const user = userCredential.user;

      if (file) {
        const storageRef = ref(storage, "images/" + user.uid + "/" + String(Date.now()) + file.name);
        const snapshot = await uploadBytes(storageRef, file);
        const photoURL = await getDownloadURL(snapshot.ref);

        await updateProfile(user, {
          displayName: target.username.value,
          photoURL: photoURL
        });

        await createUserDoc(user.uid, target.username.value, target.email.value, photoURL);
      }

      navigate("/");
    } catch (error) {
      alert(error);
    }
  };

  return (
    <main className="bg-[#232327] w-screen h-screen flex items-center justify-center">
      <div className="xl:w-1/2 w-full h-full bg-pattern"></div>
      <div className="xl:relative absolute flex flex-row xl:w-1/2 h-screen rounded-xl">
        <form
          className="flex flex-col w-full p-5 items-center justify-center gap-5"
          onSubmit={handleRegistration}
        >
          <p className="text-gray-200 font-semibold text-6xl mb-10">
            Register
          </p>
          <input
            placeholder="Username..."
            required
            type="text"
            name="username"
            className="md:w-96 w-80 p-2 rounded-md bg-[#363638] outline-none text-white"
          />
          <input
            placeholder="Email..."
            required
            type="email"
            name="email"
            className="md:w-96 w-80 p-2 rounded-md bg-[#363638] outline-none text-white"
          />
          <input
            placeholder="Password..."
            required
            type="password"
            name="password"
            className="md:w-96 w-80 p-2 rounded-md bg-[#363638] outline-none text-white"
          />
          <label className="rounded-md bg-[#363638] outline-none text-white h-12 p-5 gap-2 flex items-center justify-center"
          > <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-photo" width="30" height="30" viewBox="0 0 24 24" strokeWidth="1" stroke="#fff" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M15 8h.01" />
              <path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z" />
              <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5" />
              <path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3" />
            </svg>
            <p>Choose profile picture (required)</p>
            <input
              className="hidden"
              type="file"
              onChange={handleChange}
              name="file"
              required
            />
          </label>
          <Link to={"/login"} className="text-[#00bd7e]">
            Already have an account? Click here!
          </Link>
          <button
            type="submit"
            className="bg-[#588c65] px-20 py-2 rounded-md font-semibold text-white"
          >
            Register
          </button>
        </form>
      </div>
    </main>
  );
}

