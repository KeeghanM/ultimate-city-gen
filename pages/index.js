import Layout from "../components/layout/layout"
import { useContext } from "react"
import { UserContext } from "../lib/context"

export default function Home() {
  const { user } = useContext(UserContext)
  return (
    <Layout name="Home">
      <div>Hello</div>
    </Layout>
  )
}
