import { PlusCircleIcon, XCircleIcon } from "@heroicons/react/outline"
import { useState, useContext } from "react"
import { UserContext } from "../../lib/context"
import { Dialog } from "@headlessui/react"
import { firestore } from "../../lib/firebase"
import { addDoc, collection, doc, setDoc } from "firebase/firestore"

export default function AddTownButton(props) {
  const { user } = useContext(UserContext)
  const [dialogOpen, setdialogOpen] = useState(false)

  function addTown(e) {
    e.preventDefault()

    const formData = Object.fromEntries(new FormData(e.target))
    const name = formData["town-name"]
    const pop = formData["town-pop"]

    addDoc(collection(firestore, "users", user.uid, "towns"), {
      name,
    }).then((ref) => {
      setDoc(doc(firestore, "towns", ref.id), {
        name,
        pop,
      }).then(() => {
        //   props.updateSize()
        setdialogOpen(false)
      })
    })
  }

  return (
    <>
      <button
        onClick={() => {
          setdialogOpen(true)
        }}
      >
        <PlusCircleIcon className="h-10 w-10 hover:text-accent" />
      </button>

      <Dialog
        open={dialogOpen}
        onClose={() => {
          //   setdisable(false)
          //   setErrorMessage(false)
          setdialogOpen(false)
        }}
        className="fixed inset-0 z-10 overflow-y-auto text-light"
      >
        <div className="flex min-h-screen items-center justify-center">
          <Dialog.Overlay className="fixed inset-0 bg-white opacity-20" />
          <div className="relative mx-auto bg-dark px-24 py-12">
            <div className="absolute left-[-50px] top-[5px] flex w-full flex-row justify-end md:left-[-5px]">
              <button
                onClick={() => {
                  //   setdisable(false)
                  //   setErrorMessage(false)
                  setdialogOpen(false)
                }}
              >
                <XCircleIcon className="h-10 w-10 hover:text-accent" />
              </button>
            </div>
            <h3 className="text-2xl font-bold">Create Town</h3>
            <hr />
            <form
              onSubmit={(e) => addTown(e)}
              className="flex flex-col gap-2 pt-3"
            >
              <label htmlFor="town-name">Name</label>
              <input
                type="text"
                name="town-name"
                id="town-name"
                className="px-4 py-2 text-dark"
              />
              <label htmlFor="town-name">Population</label>
              <input
                className="px-4 py-2 text-dark"
                type="number"
                min="500"
                max="5000"
                name="town-pop"
                id="town-pop"
                defaultValue="1500"
              />
              <button
                type="submit"
                className="bg-accent px-6 py-2 text-dark hover:bg-secondary"
              >
                Create!
              </button>
            </form>
          </div>
        </div>
      </Dialog>
    </>
  )
}
