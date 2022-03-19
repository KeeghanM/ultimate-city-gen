import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, firestore } from "../../lib/firebase"
import { handleError } from "../../lib/utils"
import { useRouter } from "next/router"
import Image from "next/image"

export default function GoogleSignInButton(props) {
  const router = useRouter()
  const provider = new GoogleAuthProvider()

  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const userRef = doc(firestore, "users", result.user.uid)
        setDoc(
          userRef,
          { email: result.user.email, displayName: result.user.displayName },
          { merge: true }
        )
        router.push("/profile")
      })
      .catch((error) => handleError(error))
  }

  return (
    <button onClick={signInWithGoogle}>
      <div className="flex flex-row items-center space-x-2 bg-white p-2 pr-6 text-dark">
        <Image
          src="/g-logo.png"
          width="50px"
          height="50px"
          alt="Google 'G' Logo"
        />
        <p>Sign in with Google</p>
      </div>
    </button>
  )
}
