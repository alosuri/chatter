import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "./pages/Login"
import Register from "./pages/Register"
import NoPage from "./pages/NoPage"
import Chat from "./pages/Chat"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index path="/chatter" element={<Chat />} />
        <Route path="/chatter/login" element={<Login />} />
        <Route path="/chatter/register" element={<Register />} />
        <Route path="/chatter/chat" element={<Chat />} />
        <Route path="*" element={<NoPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
