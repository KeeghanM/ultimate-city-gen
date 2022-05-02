import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { useState } from "react"
import { auth, firestore } from "../../lib/firebase"
import GoogleSignInButton from "./googleSigninButton"
import { useRouter } from "next/router"

export default function LoginForm() {
  const router = useRouter()

  const [loginError, setloginError] = useState(null)
  const [showPasswordRequirements, setshowPasswordRequirements] =
    useState(false)

  function emailPasswordLogin(e) {
    e.preventDefault()

    const formData = Object.fromEntries(new FormData(e.target))
    const email = formData["login-email"]
    const password = formData["login-password"]

    if (password.match("(?=.*[a-z])(?=.*[A-Z]).{8,}")) {
      signInWithEmailAndPassword(auth, email, password)
        .then(() => router.push("/profile"))
        .catch((error) => {
          if (error.code == "auth/user-not-found") {
            createUserWithEmailAndPassword(auth, email, password)
              .then((userCredential) => {
                let user = userCredential.user
                setDoc(doc(firestore, "users", user.uid), {
                  email: user.email,
                })
                  .then(() => router.push("/profile"))
                  .catch((error) => setloginError(error.message))
              })
              .catch((error) => setloginError(error.message))
          } else if (error.code == "auth/wrong-password") {
            setloginError("Incorrect Password")
          } else {
            setloginError(error.message)
          }
        })
    } else {
      setshowPasswordRequirements(true)
    }
  }

  return (
    <div className="flex max-w-sm flex-col gap-2">
      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => emailPasswordLogin(e)}
      >
        <label htmlFor="login-email">Email Address:</label>
        <input
          className="p-4 text-dark"
          type="email"
          name="login-email"
          id="login-email"
        />
        <label htmlFor="login-password">Password:</label>
        <input
          className="p-4 text-dark"
          type="password"
          name="login-password"
          id="login-password"
        />
        <button
          type="submit"
          className="bg-accent px-6 py-2 text-dark hover:bg-secondary"
        >
          Login / Signup
        </button>
      </form>
      <GoogleSignInButton />
      <div className="pt-12 text-red-500">{loginError}</div>
    </div>
  )
}
