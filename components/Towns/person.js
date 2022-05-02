import GenerateHumanName from "../../lib/nameGenerators/humanNames"
import GenerateDwarfName from "../../lib/nameGenerators/dwarfNames"
import GenerateElfName from "../../lib/nameGenerators/elfNames"
import {
  VoiceTypes,
  JobTypes,
  HairColours,
  EyeColours,
  KeyFeatures,
} from "../../lib/nameGenerators/typeLists"
import { toFeet, weightedRandom } from "../../lib/utils"

export default class Person {
  constructor(props) {
    this.parents = props.parents || []
    this.age = props.age || generateAge(this.parents)
    this.gender = props.gender || generateGender()
    this.race = props.race || generateRace(this.parents)
    this.name = props.name || generateName(this.gender, this.race)
    this.job = props.job || generateJob(this.age, this.parents)
    this.voice = props.voice || generateVoice(this.age, this.gender)
    this.hairColour = undefined
    this.height = undefined
    this.eyeColour = undefined
    this.keyFeature = undefined
    this.description = props.description || this.generateDescription()
  }

  getDescription() {
    return this.description
  }

  getName() {
    return this.name
  }

  getJob() {
    return this.job
  }

  generateDescription() {
    if (this.parents.length > 0) {
      let r = Math.random()
      this.hairColour =
        r > 0.5 || this.parents.length == 1
          ? this.parents[0].hairColour
          : this.parents[1].hairColour
      this.eyeColour =
        r > 0.5 || this.parents.length == 1
          ? this.parents[0].eyeColour
          : this.parents[1].eyeColour
    } else {
      this.hairColour =
        HairColours[Math.floor(Math.random() * HairColours.length)]
      this.eyeColour = EyeColours[Math.floor(Math.random() * EyeColours.length)]
    }
    this.height =
      this.race == "Dwarf"
        ? toFeet(Math.round(Math.random() * 45) + 110)
        : this.race == "Elf"
        ? toFeet(Math.round(Math.random() * 45) + 160)
        : toFeet(Math.round(Math.random() * 45) + 150)
    if (this.age < 15) {
      this.height = this.height / 2
    }

    let r = Math.random()
    if (r > 0.5) {
      this.keyFeature =
        KeyFeatures[Math.floor(Math.random() * KeyFeatures.length)]
    }
    let description =
      this.name +
      " is a " +
      this.age +
      " year old " +
      this.gender +
      " " +
      this.race +
      " who stands " +
      this.height +
      " tall. They have " +
      this.hairColour +
      " hair and " +
      this.eyeColour +
      " eyes."

    if (this.keyFeature) {
      description += " They also have a " + this.keyFeature + "."
    }

    return description
  }
}

// Generators
function generateRace(parents) {
  if (parents.length > 0) {
    return parents[0].race
  }
  let r = Math.random()
  return r > 0.95 ? "Dwarf" : r > 0.9 ? "Elf" : "Human"
}
function generateGender() {
  let r = Math.random()
  return r > 0.95 ? "Non-Binary" : r > 0.4 ? "Male" : "Female"
}
function generateName(gender, race) {
  let type
  if (race == "Elf") {
    type = gender == "Male" ? 1 : gender == "Non-Binary" ? 2 : 3
  } else {
    type =
      gender == "Female"
        ? 1
        : gender == "Male"
        ? 2
        : Math.round(Math.random() * 2)
  }

  let name =
    race == "Elf"
      ? GenerateElfName(type)
      : race == "Dwarf"
      ? GenerateDwarfName(type)
      : GenerateHumanName(type)

  return name
}
function generateAge(parents) {
  if (parents.length > 0) {
    return Math.round(Math.random() * 15) + 3
  }
  let r = Math.random()
  return r > 0.8
    ? Math.round(Math.random() * 20) + 50
    : Math.round(Math.random() * 30) + 20
}
function generateJob(age, parents) {
  if (age < 14) return undefined

  if (parents.length > 0 && Math.random() > 0.2) {
    // 80% Of the time use a parents job
    let r = Math.random()
    return r > 0.5 || parents.length == 1 ? parents[0].job : parents[1].job
  }
  return JobTypes[Math.floor(Math.random() * JobTypes.length)]
}
function generateVoice(age, gender) {
  return VoiceTypes[Math.floor(Math.random() * VoiceTypes.length)]
}
