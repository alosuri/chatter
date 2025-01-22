import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc, query, onSnapshot, serverTimestamp, orderBy, doc, getDoc } from "firebase/firestore";
import { auth, db, storage } from "../config/controller";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { firebaseConfig } from "../config/firebase";
import ImagePreview from "./ImagePreview";

interface Message {
  message: string;
  from: string;
  createdAt: any;
  image: boolean;
}

function ChatComponent({ friend, chatUid }: { friend: string, chatUid: any }) {
  const [uid, setUid] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});
  const messageText = useRef<HTMLInputElement>(null);
  const messagesList = useRef<HTMLDivElement>(null);
  const [username, setUsername] = useState<string>();
  const [profile, setProfile] = useState<string>();
  const [ImagePreviewSrc, setImagePreviewSrc] = useState<string>();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (uid) {
      const q = query(
        collection(db, "users", uid, "friends", friend, "messages"),
        orderBy("createdAt", "desc")
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messagesArray: Message[] = [];
        snapshot.forEach((doc) => {
          messagesArray.push(doc.data() as Message);
        });
        setMessages(messagesArray.reverse());
      });

      return () => unsubscribe();
    }
  }, [uid, friend]);

  useEffect(() => {
    fetchImages();
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchProfile();
  }, [friend]);

  const fetchProfile = async () => {
    const docRef = doc(db, "users", String(friend));
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setUsername(docSnap.data()?.username);
      setProfile(docSnap.data().photoURL);
    } else {
      console.log("No such document!");
      return null;
    }
  };

  const scrollToBottom = () => {
    messagesList.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchImages = async () => {
    const storage = getStorage();
    const newImageUrls = { ...imageUrls };

    await Promise.all(
      messages.map(async (message) => {
        if (message.image && !newImageUrls[message.message]) {
          const url = await getDownloadURL(ref(storage, message.message));
          newImageUrls[message.message] = url;
        }
      })
    );

    setImageUrls(newImageUrls);
  };

  const sendMessage = async () => {
    if (messageText.current && uid && messageText.current.value != "") {
      const newMessage = {
        message: messageText.current.value,
        from: uid,
        createdAt: serverTimestamp(),
        image: false
      };
      messageText.current.value = "";
      try {
        await addDoc(collection(db, "users", uid, "friends", friend, "messages"), newMessage);
        await addDoc(collection(db, "users", friend, "friends", uid, "messages"), newMessage);
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
  };

  const renderMessages = messages.map((element, index) => {
    if (!element.image) {
      if (element.from === uid) {
        return (
          <li key={index} className="flex flex-row flex-wrap w-full justify-end py-2">
            <a className="py-2 px-5 gap-5 bg-[#a3a3a3] w-fit rounded-xl md:max-w-[40vw] max-w-[60vw] hyphens-auto break-words">{element.message}</a>
          </li>
        );
      } else {
        return (
          <li key={index} className="flex flex-row flex-wrap py-2">
            <a className="py-2 px-5 gap-5 bg-[#588c65] w-fit rounded-xl md:max-w-[40vw] max-w-[60vw] hyphens-auto break-all">{element.message}</a>
          </li>
        );
      }
    }
    else if (element.image) {
      if (element.from === uid) {
        if (isImgUrl(element.message) == "photo") {
          return (
            <li key={index} className="flex flex-row flex-wrap w-full justify-end py-2">
              {imageUrls[element.message] ? (
                <img src={imageUrls[element.message]} alt="Message Image" className="max-w-[60vw] md:max-w-[30vw] max-h-[40vh] rounded-xl" onClick={() => showImage(element.message)} />
              ) : (
                <div className="flex justify-center items-center w-[60vw] md:w-[30vw] h-80 border-[5px] border-[#a3a3a3] bg-[#a3a3a3] rounded-xl"><div className="loader"></div></div>
              )}
            </li>
          );
        }
        else if (isImgUrl(element.message) == "video") {
          return (
            <li key={index} className="flex flex-row flex-wrap w-full justify-end py-2">
              {imageUrls[element.message] ? (
                <video className="max-w-[60vw] md:max-w-[30vw] max-h-80 rounded-xl" controls>
                  <source src={imageUrls[element.message]} />
                </video>
              ) : (
                <div className="flex justify-center items-center w-[60vw] md:w-[30vw] h-80 border-[5px] border-[#a3a3a3] bg-[#a3a3a3] rounded-xl"><div className="loader"></div></div>
              )}
            </li>
          );
        }
        else if (isImgUrl(element.message) == "audio") {
          return (
            <li key={index} className="flex flex-row flex-wrap w-full justify-end py-2">
              {imageUrls[element.message] ? (
                <video className="max-w-[60vw] max-h-40 rounded-xl" controls>
                  <source src={imageUrls[element.message]} />
                </video>
              ) : (
                <div className="flex justify-center items-center w-[30vw] h-20 border-[5px] border-[#a3a3a3] bg-[#a3a3a3] rounded-xl"><div className="loader"></div></div>
              )}
            </li>
          );
        }
      }
      else {
        if (isImgUrl(element.message) == "photo") {
          return (
            <li key={index} className="flex flex-row flex-wrap w-full py-2">
              {imageUrls[element.message] ? (
                <img src={imageUrls[element.message]} alt="Message Image" className="max-w-[60vw] md:max-w-[30vw] max-h-[40vh] rounded-xl" onClick={() => showImage(element.message)} />
              ) : (
                <div className="flex justify-center items-center w-[60vw] md:w-[30vw] h-80 border-[5px] border-[#588c65] bg-[#588c65] rounded-xl"><div className="loader"></div></div>
              )}
            </li>
          );
        }
        else if (isImgUrl(element.message) == "video") {
          return (
            <li key={index} className="flex flex-row flex-wrap w-full py-2">
              {imageUrls[element.message] ? (
                <video className="max-w-[60vw] md:max-w-[30vw] max-h-[40vh] rounded-xl" controls>
                  <source src={imageUrls[element.message]} />
                </video>
              ) : (
                <div className="flex justify-center items-center w-[60vw] md:w-[30vw] h-80 border-[5px] border-[#588c65] bg-[#588c65] rounded-xl"><div className="loader"></div></div>
              )}
            </li>
          );
        }
        else if (isImgUrl(element.message) == "audio") {
          return (
            <li key={index} className="flex flex-row flex-wrap w-full justify-end py-2">
              {imageUrls[element.message] ? (
                <audio controls>
                  <source src={imageUrls[element.message]} />
                </audio>
              ) : (
                <div className="flex justify-center items-center w-[30vw] h-20 border-[5px] border-[#588c65] bg-[#588c65] rounded-xl"><div className="loader"></div></div>
              )}
            </li>
          );
        }
      }
    }
  });
  function isImgUrl(url: string) {
    if (/\.(jpg|jpeg|png|webp|avif|gif)$/.test(url)) {
      return "photo";
    }

    else if (/\.(mp4|webm|ogg)$/.test(url)) {
      return "video";
    }

    else if (/\.(mp3|wav)$/.test(url)) {
      return "audio";
    }
  }

  const showImage = (image: string) => {
    { (image != "undefined") ? setImagePreviewSrc(imageUrls[image]) : "undefined" }
  }

  const sendImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files && event.currentTarget.files.length > 0) {
      const storageRef = ref(storage, "images/" + uid + "/" + String(Date.now()) + event.currentTarget.files[0].name);
      const snapshot = await uploadBytes(storageRef, event.currentTarget.files[0]);
      const photoURL = "gs://" + firebaseConfig.storageBucket + "/" + snapshot.metadata.fullPath;
      const newMessage = {
        message: photoURL,
        from: uid,
        createdAt: serverTimestamp(),
        image: true
      };

      try {
        await addDoc(collection(db, "users", String(uid), "friends", friend, "messages"), newMessage);
        await addDoc(collection(db, "users", friend, "friends", String(uid), "messages"), newMessage);
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
  };

  const back = () => {
    chatUid('');
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div onClick={() => setImagePreviewSrc("undefined")}>
        <ImagePreview image={String(ImagePreviewSrc)}></ImagePreview>
      </div>
      <div className="h-20 w-full flex items-center justify-between border-b-[1px] border-[#4f4f58] border-opacity-60 p-5">
        <div className="flex flex-row justify-center items-center gap-5">
          <img src={profile} className="w-12 h-12 object-cover rounded-md" />
          <a className="text-white text-xl w-40 truncate">{username}</a>
        </div>
        <button onClick={back} className="md:hidden bg-[#588c65] p-2 px-5 rounded-md">
          Back
        </button>
      </div>

      <div className="h-full w-full overflow-x-hidden px-5">
        <ul className="flex flex-col w-full h-full">
          {messages.length != 0 ? renderMessages : <div className="w-full h-full flex justify-center items-center text-center text-xl md:text-2xl"><h1 className="text-gray-400">Start the conversation with a friendly <b>hello</b>!</h1>
          </div>}
          <div ref={messagesList} />
        </ul>
      </div>

      <div className="h-20 w-full flex items-center justify-center border-t-[1px] border-[#4f4f58] border-opacity-60 gap-5 bg-[#232327] px-5">
        <label className="rounded-md bg-[#1c1c1f] border-[1px] border-[#4f4f58] border-opacity-60 outline-none text-white h-12 w-16 flex items-center justify-center"
        > <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-photo" width="30" height="30" viewBox="0 0 24 24" strokeWidth="1" stroke="#aaa" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M15 8h.01" />
            <path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z" />
            <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5" />
            <path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3" />
          </svg>
          <input
            className="hidden"
            type="file"
            onInput={sendImage}
            id="file"
          />
        </label>

        <input
          type="text"
          ref={messageText}
          className="px-5 h-12 w-[80%] rounded-md bg-[#1c1c1f] border-[1px] border-[#4f4f58] border-opacity-60 outline-none text-white"
          placeholder="Enter your message..."
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              sendMessage();
            }
          }}
        ></input>
        <button
          className="rounded-md bg-[#1c1c1f] border-[1px] border-[#4f4f58] border-opacity-60 outline-none text-white h-12 w-16 flex justify-center items-center"
          onClick={sendMessage}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-send" width="30" height="30" viewBox="0 0 24 24" strokeWidth="1" stroke="#aaa" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M10 14l11 -11" />
            <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />
          </svg>
        </button>
      </div>
    </div >
  );
}

export default ChatComponent;
