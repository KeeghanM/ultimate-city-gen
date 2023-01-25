function GenerateTownName() {
  let nm1 = [
    "b",
    "c",
    "d",
    "f",
    "g",
    "h",
    "l",
    "m",
    "n",
    "p",
    "r",
    "s",
    "t",
    "w",
    "y",
    "b",
    "c",
    "d",
    "f",
    "g",
    "h",
    "j",
    "k",
    "l",
    "m",
    "n",
    "p",
    "q",
    "r",
    "s",
    "t",
    "v",
    "w",
    "x",
    "y",
    "z",
    "bl",
    "br",
    "ch",
    "cl",
    "cr",
    "dr",
    "fl",
    "fr",
    "gl",
    "gr",
    "pl",
    "pr",
    "sc",
    "sh",
    "sk",
    "sl",
    "sm",
    "sn",
    "sp",
    "st",
    "sw",
    "tr",
    "tw",
    "wh",
    "wr",
    "sch",
    "scr",
    "sph",
    "shr",
    "spl",
    "spr",
    "str",
    "thr",
  ]
  let nm2 = [
    "a",
    "e",
    "i",
    "o",
    "u",
    "a",
    "e",
    "i",
    "o",
    "u",
    "a",
    "e",
    "i",
    "o",
    "u",
    "a",
    "e",
    "i",
    "o",
    "u",
    "a",
    "e",
    "i",
    "o",
    "u",
    "ai",
    "eo",
    "ea",
    "ee",
    "oo",
    "oa",
    "ia",
    "io",
  ]
  let nm3 = [
    "br",
    "bl",
    "c",
    "ch",
    "cl",
    "ct",
    "ck",
    "cc",
    "d",
    "dg",
    "dw",
    "dr",
    "dl",
    "f",
    "g",
    "gg",
    "gl",
    "gw",
    "gr",
    "h",
    "k",
    "kr",
    "kw",
    "l",
    "ll",
    "lb",
    "ld",
    "lg",
    "lm",
    "ln",
    "lr",
    "lw",
    "lz",
    "m",
    "mr",
    "ml",
    "nw",
    "n",
    "nn",
    "ng",
    "nl",
    "p",
    "ph",
    "r",
    "rb",
    "rc",
    "rd",
    "rg",
    "rl",
    "rm",
    "rn",
    "rr",
    "rs",
    "rst",
    "rt",
    "rth",
    "rtr",
    "rw",
    "rv",
    "s",
    "ss",
    "sh",
    "st",
    "sth",
    "str",
    "sl",
    "sw",
    "t",
    "tb",
    "tl",
    "tg",
    "tm",
    "tn",
    "tw",
    "th",
    "tt",
    "v",
    "w",
    "wl",
    "wn",
    "x",
    "z",
  ]
  let nm4 = [
    "c",
    "d",
    "f",
    "ff",
    "g",
    "gg",
    "h",
    "l",
    "ll",
    "m",
    "mm",
    "n",
    "nn",
    "p",
    "pp",
    "r",
    "rr",
    "s",
    "ss",
    "t",
    "tt",
    "w",
  ]
  let nm5 = [
    "st",
    "sk",
    "sp",
    "nd",
    "nt",
    "nk",
    "mp",
    "rd",
    "ld",
    "lp",
    "rk",
    "lt",
    "lf",
    "pt",
    "ft",
    "ct",
    "t",
    "d",
    "k",
    "n",
    "p",
    "l",
    "g",
    "m",
    "s",
    "b",
    "c",
    "t",
    "d",
    "k",
    "n",
    "p",
    "l",
    "g",
    "m",
    "s",
    "b",
    "c",
  ]
  let br = ""

  let names
  for (let i = 0; i < 10; i++) {
    let rnd = Math.floor(Math.random() * nm1.length)
    let rnd2 = Math.floor(Math.random() * nm2.length)
    let rnd5 = Math.floor(Math.random() * nm5.length)
    if (i < 2) {
      names = nm1[rnd] + nm2[rnd2] + nm5[rnd5]
    } else if (i < 4) {
      let rnd3 = Math.floor(Math.random() * nm3.length)
      let rnd4 = Math.floor(Math.random() * nm2.length)
      names = nm1[rnd] +
        nm2[rnd2] +
        nm3[rnd3] +
        nm2[rnd4] +
        nm5[rnd5]
    } else if (i < 8) {
      let rnd3 = Math.floor(Math.random() * nm4.length)
      let rnd4 = Math.floor(Math.random() * nm2.length)
      names = nm1[rnd] +
        nm2[rnd2] +
        nm4[rnd3] +
        nm2[rnd4] +
        nm5[rnd5]
    } else {
      let rnd3 = Math.floor(Math.random() * nm3.length)
      let rnd4 = Math.floor(Math.random() * nm2.length)
      rnd6 = Math.floor(Math.random() * nm4.length)
      rnd7 = Math.floor(Math.random() * nm2.length)
      if (i < 8) {
        names =nm1[rnd] +
          nm2[rnd2] +
          nm3[rnd3] +
          nm2[rnd4] +
          nm4[rnd6] +
          nm2[rnd7] +
          nm5[rnd5]
      } else {
        names =nm1[rnd] +
          nm2[rnd2] +
          nm4[rnd6] +
          nm2[rnd4] +
          nm3[rnd3] +
          nm2[rnd7] +
          nm5[rnd5]
      }
    }
  }
  return toTitleCase(names.trim())
}

function toTitleCase(str) {
  let string = str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
  return string.replace("  ", " ")
}
