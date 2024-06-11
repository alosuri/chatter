import SideBar from "../components/SideBar"
import { useEffect, useState } from "react";
import { auth } from "../config/controller";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom"
import ChatComponent from "../components/ChatComponent";

export default function Chat() {
  const navigate = useNavigate();
  const [chatUid, setChatUid] = useState<string>('')

  useEffect(() => {
    ChangeUid();
    console.log(chatUid)
  }, [chatUid])

  const ChangeUid = () => {
    if (chatUid) {
      return < ChatComponent friend={chatUid} chatUid={setChatUid} />
    }

    else {
      return (
        <div className="hidden md:flex w-full h-full bg-pattern justify-center items-center">
          <div className="flex justify-center items-center flex-col gap-5 bg-[#232327] h-fit m-10 p-16 rounded-xl border-[1px] border-[#4d4d4d] border-opacity-80">
            <h1 className="text-6xl text-white font-bold">Chatter</h1>
            <h2 className="text-xl text-gray-400">Welcome to chatter! Connect with your friends wherever you are.</h2>
          </div>
        </div>
      )
    }
  }

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      }
    })
  }, [])

  return (
    <main className="bg-[#232327] h-screen w-screen flex flex-row overflow-x-hidden">
      {!chatUid ? <div className="block"><SideBar chatUid={setChatUid} /></div> : <div className="hidden md:block" ><SideBar chatUid={setChatUid} /></div>}
      <ChangeUid></ChangeUid>
    </main>
  )
}
