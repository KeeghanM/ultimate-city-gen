import { useContext } from "react"
import { UserContext } from "../lib/context"
import Layout from "../components/Layout/Layout"

export default function Profile() {
  const { user } = useContext(UserContext)

  return (
    <Layout name="Profile">
      {user && <p>Welcome to your profile {user.displayName || user.email}</p>}
    </Layout>
  )
}
