import React, { useEffect, useRef, useState } from "react";
import { auth, db } from "../config/controller";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { usersCollection } from "../config/controller";
import { where, query, getDocs, setDoc, doc, onSnapshot } from "firebase/firestore";
import FriendsList from "./FriendsList";

function SideBar({ chatUid }: { chatUid: any }) {
  const [email, setEmail] = useState<string>();
  const [username, setUsername] = useState<string>();
  const [uid, setUid] = useState<string>();
  const [photo, setPhoto] = useState<string>('');
  const search = useRef<HTMLInputElement>(null);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchResultUid, setSearchResultUid] = useState<string>('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user?.uid || '');
        setEmail(user?.email || '');
        setUsername(user?.displayName || '');
        setPhoto(user?.photoURL || '');

        const userDocRef = doc(db, "users", user.uid);
        onSnapshot(userDocRef, (doc) => {
          const userData = doc.data();
          if (userData) {
            setUsername(userData.username);
            setEmail(userData.email);
            setPhoto(userData.photoURL);
          }
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const navigate = useNavigate();

  const signOutUser = () => {
    signOut(auth).then(() => {
      console.log("success!");
      navigate("/login");
    }).catch((error) => {
      console.error("Sign out error:", error);
    });
  }

  const searchEmail = async () => {
    setSearchResult(null);
    const q = query(usersCollection, where("email", "==", search.current?.value));

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      if (doc.data().email !== email) {
        setSearchResult(doc.data());
        setSearchResultUid(doc.id);
      }
    });
  }

  const SearchItem: React.FC = () => {
    if (searchResult) {
      return (
        <div className="flex flex-row py-5 gap-5 items-center justify-between">
          <div className="flex flex-row gap-5">
            {searchResult ? <img src={searchResult.photoURL} alt="" className="w-14 aspect-square object-cover rounded-lg" /> : <div className="loader"> </div>}
            <div className="w-32" >
              <p className="text-white truncate">{searchResult.username}</p>
              <p className="text-white truncate">{searchResult.email}</p>
            </div>
          </div>
          <button className="bg-[#588c65] p-2 rounded-md" onClick={addFriend}>
            Add friend
          </button>
        </div>
      );
    }
    return null;
  }

  const addFriend = async () => {
    if (search.current && search.current.value != "") {
      search.current.value = "";
      setSearchResult(null);
    }
    await setDoc(doc(db, "users", String(uid), "friends", String(searchResultUid)), {
      friend: true,
    });

    await setDoc(doc(db, "users", String(searchResultUid), "friends", String(uid)), {
      friend: true,
    });
  }

  return (
    <div className="w-screen md:w-[400px] h-screen bg-[#232327] p-3 border-r-[1px] border-[#4d4d4d] border-opacity-80">
      <div className="flex flex-row items-center justify-between py-5">
        <div className="flex flex-row items-center">
          {photo ? <img src={photo} className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-md aspect-square" alt="User profile" /> : <div className="loader"></div>}
          <div className="p-5 w-40">
            <p className="text-white font-semibold text-2xl truncate">{username}</p>
            <p className="text-gray-300 font-normal text-md truncate">{email}</p>
          </div>
        </div>
        <button onClick={signOutUser} className="bg-[#588c65] px-5 py-2 rounded-md font-semibold text-white">Logout</button>
      </div>
      <div className="w-full px-5 py-3 rounded-md bg-[#1c1c1f] border-[1px] border-[#4f4f58] border-opacity-60 text-white">
        <input
          type="text"
          ref={search}
          onChange={searchEmail}
          className="w-full bg-transparent outline-none"
          placeholder="Enter email to find user..."
        />
        <SearchItem />
      </div>
      <FriendsList chatUid={chatUid} />
    </div>
  );
}

export default SideBar;
