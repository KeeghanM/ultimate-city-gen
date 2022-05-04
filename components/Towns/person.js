import GenerateHumanName from "../../lib/nameGenerators/humanNames"
import GenerateDwarfName from "../../lib/nameGenerators/dwarfNames"
import GenerateElfName from "../../lib/nameGenerators/elfNames"
import {
  JobTypes,
  HairColours,
  EyeColours,
  SkinColours,
  HairDescriptors,
  FaceDescriptors,
  MouthDescriptors,
  EyeDescriptors,
  EyebrowDescriptors,
  NoseDescriptors,
  FacialHairDescriptors,
  BodyDescriptors,
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
    this.height = props.height || generateHeight(this.age, this.race)
    this.hairColour = props.hairColour || generateHairColour(this.parents)
    this.eyeColour = props.eyeColour || generateEyeColour(this.parents)
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

  getRace() {
    return this.race
  }
  getHeight() {
    return this.height
  }
  getAge() {
    return this.age
  }
  getGender() {
    return this.gender
  }

  generateDescription() {
    let description = ""

    // Setup useful terms
    let plural = !(this.gender == "Non-Binary")
    let pronoun =
      this.gender == "Male"
        ? "He"
        : this.gender == "Non-Binary"
        ? "They"
        : "She"
    let possesive =
      this.gender == "Male"
        ? "His"
        : this.gender == "Non-Binary"
        ? "Their"
        : "Her"

    // Set description values
    let height = Math.random() > 0.5
    let skinColour = SkinColours[Math.floor(Math.random() * SkinColours.length)]
    let hairColour = HairColours[Math.floor(Math.random() * HairColours.length)]
    let eyeColour = EyeColours[Math.floor(Math.random() * EyeColours.length)]

    let faceDescription =
      Math.random() > 0.5
        ? FaceDescriptors[Math.floor(Math.random() * FaceDescriptors.length)]
        : undefined
    let eyeDescription =
      Math.random() > 0.5
        ? EyeDescriptors[Math.floor(Math.random() * EyeDescriptors.length)]
        : undefined
    let hairDescription =
      Math.random() > 0.5
        ? HairDescriptors[Math.floor(Math.random() * HairDescriptors.length)]
        : undefined
    let eyeBrowDescription =
      Math.random() > 0.9
        ? EyebrowDescriptors[
            Math.floor(Math.random() * EyebrowDescriptors.length)
          ]
        : undefined
    let mouthDescription =
      Math.random() > 0.9
        ? MouthDescriptors[Math.floor(Math.random() * MouthDescriptors.length)]
        : undefined
    let noseDescription =
      Math.random() > 0.9
        ? NoseDescriptors[Math.floor(Math.random() * NoseDescriptors.length)]
        : undefined
    let facialHairDescription =
      this.gender == "Female"
        ? undefined
        : Math.random() > 0.9
        ? FacialHairDescriptors[
            Math.floor(Math.random() * FacialHairDescriptors.length)
          ]
        : undefined
    let bodyDescription =
      Math.random() > 0.9
        ? BodyDescriptors[Math.floor(Math.random() * BodyDescriptors.length)]
        : undefined

    // BUILD THE DESCRIPTION TEXT
    if (height) {
      let r = Math.random()
      description += pronoun + " "
      description +=
        r > 0.6
          ? plural
            ? " stands about "
            : " stand about "
          : r > 0.3
          ? plural
            ? " looks about "
            : " look about "
          : plural
          ? " is around "
          : " are around "
      description += this.height + " tall. "
    }

    description +=
      pronoun + (plural ? " has " : " have ") + skinColour + " skin and "

    if (hairDescription) {
      description += hairDescription + " "
    }
    description += hairColour + " hair, with "

    if (eyeDescription) description += eyeDescription + " "
    description += eyeColour + " "
    description += "eyes"
    if (eyeBrowDescription) {
      let r = Math.random()
      let segway =
        r > 0.6
          ? " which are framed by "
          : r > 0.3
          ? " which sit below "
          : " which are paired with "
      description += segway + eyeBrowDescription + " brows, "
    }

    if (faceDescription) {
      let r = Math.random()
      let segway =
        r > 0.5
          ? (eyeBrowDescription ? " and " : " ") + " which sit in a"
          : " which feature on a"

      description += segway + " " + faceDescription + "."

      if (noseDescription || mouthDescription || facialHairDescription) {
        description += " " + pronoun + (plural ? " has a " : " have a ")

        if (noseDescription) description += noseDescription
        if (mouthDescription)
          description += (noseDescription ? " and " : "") + mouthDescription
        if (facialHairDescription)
          description +=
            (noseDescription || mouthDescription ? " and " : "") +
            facialHairDescription
      }
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

function generateEyeColour(parents) {
  if (parents.length > 0) {
    let r = Math.random()
    return r > 0.5 || parents.length == 1
      ? parents[0].eyeColour
      : parents[1].eyeColour
  }
  return EyeColours[Math.floor(Math.random() * EyeColours.length)]
}
function generateHairColour(parents) {
  if (parents.length > 0) {
    let r = Math.random()
    return r > 0.5 || parents.length == 1
      ? parents[0].hairColour
      : parents[1].hairColour
  }
  return HairColours[Math.floor(Math.random() * HairColours.length)]
}

function generateHeight(age, race) {
  let height =
    race == "Dwarf"
      ? toFeet(Math.round(Math.random() * 45) + 110)
      : race == "Elf"
      ? toFeet(Math.round(Math.random() * 45) + 160)
      : toFeet(Math.round(Math.random() * 45) + 150)
  if (age < 15) {
    height = height / 2
  }
  return height
}
