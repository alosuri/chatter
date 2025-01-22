import { collection, doc, getDoc, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { auth, db } from "../config/controller";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

export default function FriendsList({ chatUid }: { chatUid: any }) {
  const [uid, setUid] = useState<string>();
  const [friends, setFriends] = useState<{ uid: string, username: string, email: string, photo: string }[]>([]);
  type Message = {
    message: string;
    sender: string;
  };
  const [lastMessages, setLastMessages] = useState<{ [key: string]: Message }>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid || '');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (uid) {
      const unsubscribe = onSnapshot(
        collection(db, "users", uid, "friends"),
        async (snapshot) => {
          const friendUids = snapshot.docs.map(doc => doc.id);
          const friendDataArray = await fetchFriends(friendUids);
          setFriends(friendDataArray);
        },
        (error) => {
          console.log(error);
        }
      );

      return () => unsubscribe();
    }
  }, [uid]);

  useEffect(() => {
    friends.forEach((friend) => {
      getLastMessage(friend.uid);
    });
  }, [friends]);

  const fetchFriends = async (friendUids: any) => {
    const friendsData = await Promise.all(
      friendUids.map(async (friendUid: string) => {
        const docRef = doc(db, "users", friendUid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { uid: docSnap.id, username: docSnap.data().username, email: docSnap.data().email, photo: docSnap.data().photoURL };
        } else {
          console.log("No such document!");
          return null;
        }
      })
    );
    return friendsData.filter(friend => friend !== null);
  };

  const openChat = (uid: string) => {
    chatUid(uid);
  }

  const getLastMessage = (friend_uid: string) => {
    const q = query(
      collection(db, "users", String(uid), "friends", friend_uid, "messages"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    onSnapshot(q, (snapshot) => {
      snapshot.forEach((doc) => {
        if (!doc.data().image) {
          const message = doc.data().message;
          const sender = doc.data().from;
          setLastMessages((prevmessages) => ({
            ...prevmessages,
            [friend_uid]: { message, sender }
          }));
        }
        else if (doc.data().image) {
          const message = "Image"
          const sender = doc.data().from;
          setLastMessages((prevmessages) => ({
            ...prevmessages,
            [friend_uid]: { message, sender }
          }));
        }
      });
    });
  };
  const renderFriends = friends.map((element, index) => (
    <li key={index} className="flex flex-row pb-10 gap-5" onClick={() => openChat(element.uid)}>
      {element.photo ? <img src={element.photo} alt="" className="w-16 aspect-square object-cover rounded-lg" /> : <div className="loader"></div>}
      <div>
        <p className="text-white font-semibold text-xl w-60 truncate">{element.username}</p>
        {lastMessages[element.uid] ? (
          lastMessages[element.uid].sender === String(uid) ? (
            <p className="text-gray-300 truncate w-60"><span className="text-yellow-500 font-bold">You: </span>{lastMessages[element.uid].message}</p>
          ) : (
            <p className="text-gray-300 truncate w-60"><span className="text-green-500 font-bold">{element.username}: </span>{lastMessages[element.uid].message}</p>
          )
        ) : (
          <p className="text-gray-400">Start a new conversation...</p>
        )}
      </div>
    </li>
  ));

  return (
    <div className="pt-5">
      <ul className="overflow-auto md:max-h-[75vh] max-h-[70vh] flex justify-center">
        {(friends.length != 0) ? <div className="w-full">{renderFriends}</div> : <p className="text-gray-300 text-md max-w-80 text-center">Try searching for friends using their email addresses.</p>}
      </ul>
    </div>
  );
}

