import { useContext, useState } from "react"
import { UserContext } from "../lib/context"
import Layout from "../components/layout/layout"
import LoginForm from "../components/login/loginForm"
import TownList from "../components/towns/TownList"
import AddTownButton from "../components/towns/addTownButton"

export default function Towns() {
  const { user } = useContext(UserContext)
  const [numberOfTowns, setnumberOfTowns] = useState(0)

  return (
    <Layout name="Towns">
      {user ? (
        <>
          <div className="flex flex-row items-center gap-2">
            <h1 className="text-xl">Your Towns {numberOfTowns}/3</h1>
            {numberOfTowns < 3 && <AddTownButton />}
          </div>
          <TownList updateSize={(n) => setnumberOfTowns(n)} />
        </>
      ) : (
        <LoginForm />
      )}
    </Layout>
  )
}
