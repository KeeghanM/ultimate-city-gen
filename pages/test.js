import Person from "../components/towns/person"

export default function TestPage() {
  function genNew() {
    let person = new Person({})
    console.log(person.getDescription())
  }
  return (
    <div>
      <button
        onClick={genNew}
        className="bg-accent px-4 py-2 text-light hover:bg-dark"
      >
        New Person
      </button>
    </div>
  )
}
