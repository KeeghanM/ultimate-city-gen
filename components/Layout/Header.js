import Link from "next/link"
import { useRouter } from "next/router"
import { useContext } from "react"
import { UserContext } from "../../lib/context"
import { auth } from "../../lib/firebase"

export default function Header(props) {
  const { user } = useContext(UserContext)
  const router = useRouter()

  function signOutNow() {
    auth.signOut()
    router.push("/")
  }

  return (
    <div className="flex w-full flex-row items-center justify-center bg-medium p-12">
      <div className="flex w-[50vw] flex-row items-center justify-between">
        <ul className="flex flex-row gap-4">
          <Link href="/" passHref>
            <li className="hover:cursor-pointer hover:text-accent">Home</li>
          </Link>
          <Link href="/about" passHref>
            <li className="hover:cursor-pointer hover:text-accent">About</li>
          </Link>
          <Link href="/contact" passHref>
            <li className="hover:cursor-pointer hover:text-accent">Contact</li>
          </Link>
          <li className="hover:cursor-pointer hover:text-accent">
            <a
              href="https://www.buymeacoffee.com/KeeghanM"
              target="_blank"
              rel="noreferrer"
            >
              Donate
            </a>
          </li>
        </ul>
        <h2 className="text-2xl text-secondary">
          Ultimate City Gen | {props.name}
        </h2>
        <ul className="flex flex-row gap-4">
          {user ? (
            <>
              <Link href="/towns" passHref>
                <li className="hover:cursor-pointer hover:text-accent">
                  My Towns
                </li>
              </Link>
              <Link href="/profile" passHref>
                <li className="hover:cursor-pointer hover:text-accent">
                  My Profile
                </li>
              </Link>
              <li className="hover:cursor-pointer hover:text-accent">
                <button onClick={signOutNow}>Sign Out</button>
              </li>
            </>
          ) : (
            <>
              <Link href="/login" passHref>
                <li className="hover:cursor-pointer hover:text-accent">
                  Log In / Sign Up
                </li>
              </Link>
            </>
          )}
        </ul>
      </div>
    </div>
  )
}
