// Building types is split into sections, each assigned a number. 
// This number represents the % chance that one of these buildings is picked at generation.
// ,{types:[],job_titles:[],name_options:[]}

let building_types = {
  10:[ // 10% chance
    {types:["gallery"],job_titles:["Artist","Curator"],name_options:["Gallery","Art Supplies","Art Goods","Artist"]}
    ,{types:[],job_titles:["Barber"],name_options:[]}
    ,{types:[],job_titles:["Potter"],name_options:[]}
    ,{types:[],job_titles:["Scribe"],name_options:[]}
    ,{types:[],job_titles:["Shoemaker"],name_options:[]}
    ,{types:[],job_titles:["Physician"],name_options:[]}

  ],
  25:[// 15% Chance
    {types:[],job_titles:["Tailor"],name_options:[]}

  ],
  50:[ // 25% Chance
    {types:["shop"],job_titles:["Apothecary","pharmacist"],name_options:["Ailments", "Ointments", "Potions", "Medicines", "Pharmacy"]},
    {types:["trade","worker"],job_titles:["Carpenter","Wood Worker"],name_options:["Furniture","Buildings","Woodworking"]}
    ,{types:[],job_titles:["Blacksmith"],name_options:[]}
    ,{types:[],job_titles:["Painter"],name_options:[]}
    ,{types:[],job_titles:["Spinner"],name_options:[]}
    ,{types:[],job_titles:["Candlemaker"],name_options:[]}
    ,{types:[],job_titles:["Cook"],name_options:[]}
    ,{types:[],job_titles:["Gardener"],name_options:[]}
    ,{types:[],job_titles:["Herbalist"],name_options:[]}
    ,{types:[],job_titles:["Messenger"],name_options:[]}
    
  ],
  100:[ // 50% Chance
    {types:["shop","general store"],job_titles:["Shopkeeper"],name_options:["Bits and Bobs","General Store","Store","One Stop Shop"]}
    ,{types:[],job_titles:["Baker"],name_options:[]}
    ,{types:[],job_titles:["Butcher"],name_options:[]}
  ]
}

// How to access a specific building type
function getBuildingType(){
  let random_bracket = Math.floor(Math.random() * 100)
  for(let bracket of Object.keys(building_types)){
    if(random_bracket <= bracket) {
      let types = building_types[bracket]
      return types[Math.floor(Math.random() * types.length)]
    }
  }
}