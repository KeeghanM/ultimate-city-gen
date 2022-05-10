import { useState } from "react"
import Person from "../components/towns/person"
import p5Min from "p5"

export default function TestPage() {
  const [people, setpeople] = useState([])

  function genNew() {
    let list = []
    for (let i = 0; i < 12; i++) {
      let person = new Person({})
      list.push(person)
    }
    setpeople(list)
  }
  return (
    <div className="p-20">
      {/* <button
        onClick={genNew}
        className="mb-2 bg-accent px-4 py-2 text-light hover:bg-dark"
      >
        Create 20
      </button>
      <div className="grid grid-cols-4 gap-4">
        {people?.map((person) => {
          return (
            <p className="mb-1 flex max-w-md flex-col border p-4">
              <span className="font-bold">
                {person.getName()} - {person.getRace()}
              </span>
              <ul className="my-2 border-b pb-2">
                <li>Age: {person.getAge()}</li>
                <li>Height: {person.getHeight()}</li>
                <li>Job: {person.getJob()}</li>
                <li>Gender: {person.getGender()}</li>
              </ul>
              {person.getDescription()}
            </p>
          )
        })}
      </div> */}
      <div id="canvas"></div>
    </div>
  )
}

function setuo() {
  var myCanvas = createCanvas(800, 400)
  myCanvas.parent("canvas")
}

function draw() {
  background(220)
}
