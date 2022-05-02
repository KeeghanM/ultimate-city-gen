import { collection, getDocs } from "firebase/firestore"
import { useContext, useState, useEffect } from "react"
import { firestore } from "../../lib/firebase"
import { UserContext } from "../../lib/context"
import { TrashIcon } from "@heroicons/react/outline"

export default function TownList(props) {
  const { user } = useContext(UserContext)
  const [townList, setTownList] = useState([])
  useEffect(() => {
    getTownList()
  }, [])
  function getTownList() {
    let townList = []
    getDocs(collection(firestore, "users", user.uid, "towns")).then((docs) => {
      docs.forEach((doc) => {
        let data = doc.data()
        townList.push(
          <div className="flex flex-row items-center">
            <button
              key={doc.id}
              className="bg-accent py-2 px-4 text-dark hover:bg-medium hover:text-light"
            >
              {data.name}
            </button>
            <button
              key={doc.id + "del"}
              className="bg-red-700 px-2 py-2 text-dark hover:text-accent"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        )
      })
      setTownList(townList)
      props.updateSize(townList.length)
    })
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="flex max-w-sm flex-col gap-2">{townList}</div>
      <button onClick={getTownList} className="bg-accent px-4 py-2">
        Fetch
      </button>
    </div>
  )
}
