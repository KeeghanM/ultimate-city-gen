import { useContext } from "react"
import { UserContext } from "../lib/context"
import Layout from "../components/Layout/Layout"
import LoginForm from "../components/Login/LoginForm"

export default function Profile() {
  const { user } = useContext(UserContext)

  return (
    <Layout name="Profile">
      {user ? (
        <p>Welcome to your profile {user.displayName || user.email}</p>
      ) : (
        <LoginForm />
      )}
    </Layout>
  )
}
