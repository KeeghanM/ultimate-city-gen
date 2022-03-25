import { collection, getDocs } from "firebase/firestore"
import { useContext, useState, useEffect } from "react"
import { firestore } from "../../lib/firebase"
import { UserContext } from "../../lib/context"

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
        townList.push(<div key={doc.id}>{data.name}</div>)
      })
      setTownList(townList)
      props.updateSize(townList.length)
    })
  }
  return <div>{townList}</div>
}
