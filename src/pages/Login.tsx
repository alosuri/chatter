import { Link, useNavigate } from "react-router-dom";
import { auth } from "../config/controller";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useEffect } from "react";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/");
      }
    });
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const target = e.currentTarget;

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        target.email.value,
        target.password.value
      );

      // Signed in
      const user = userCredential.user;
      if (user) {
        navigate("/");
      }
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
          onSubmit={handleLogin}
        >
          <p className="text-gray-200 font-semibold text-6xl mb-10">Login</p>
          <input
            placeholder="Email..."
            type="email"
            name="email"
            required
            className="md:w-96 w-80 p-2 rounded-md bg-[#363638] outline-none text-white"
          />
          <input
            placeholder="Password..."
            type="password"
            name="password"
            required
            className="md:w-96 w-80 p-2 rounded-md bg-[#363638] outline-none text-white"
          />
          <Link to={"/register"} className="text-[#00bd7e]">
            Don't have an account? Click here!
          </Link>
          <button
            type="submit"
            className="bg-[#588c65] px-20 py-2 rounded-md font-semibold text-white"
          >
            Login
          </button>
        </form>
      </div>
    </main>
  );
}

