// Building types is split into sections, each assigned a number. 
// This number represents the % chance that one of these buildings is picked at generation.
// ,{types:[],job_titles:[],name_options:[]}

let building_types = {
  10:[ // 10% chance
    {types:["gallery","shop"],job_titles:["Artist","Curator"],name_options:["Gallery","Art Supplies","Art Goods","Artist"]}
    ,{types:["service","trade"],job_titles:["Barber"],name_options:["Barbers","Hairdressers","Cutz","Trims","Styling"]}
    ,{types:["service","trade"],job_titles:["Potter"],name_options:["Pots","Potters","Clay Goods"]}
    ,{types:["service","trade"],job_titles:["Scribe"],name_options:["Letters","Writing Services","Notes & More","Quills Inks & Writing"]}
    ,{types:["service","trade"],job_titles:["Shoemaker"],name_options:["Shoes"]}
    ,{types:["service","trade"],job_titles:["Physician","Healer"],name_options:["Medicine","Healers","Physicians","Doctors","The Healer"]}

  ],
  25:[// 15% Chance
    {types:["service","trade"],job_titles:["Tailor"],name_options:["Clothes","Tailors","Tailor Made","Custom Threads","Clothier"]}

  ],
  50:[ // 25% Chance
    {types:["shop","service"],job_titles:["Apothecary","pharmacist"],name_options:["Ailments", "Ointments", "Potions", "Medicines", "Pharmacy"]},
    {types:["trade","service"],job_titles:["Carpenter","Wood Worker"],name_options:["Furniture","Buildings","Woodworking"]}
    ,{types:["trade","service"],job_titles:["Blacksmith"],name_options:["Metal working","Smith","Smithy","Blacksmiths","Clang & Bang"]}
    ,{types:["trade","service","shop"],job_titles:["Painter"],name_options:["Painting","Painters"]}
    ,{types:["trade","service"],job_titles:["Spinner"],name_options:["Custom Cloths","Fabrics","Spinner Services"]}
    ,{types:["trade","shop"],job_titles:["Candlemaker"],name_options:["Candles","Lanters","lighting goods","Lit Lamps"]}
    ,{types:["trade","service"],job_titles:["Cook"],name_options:["Meals","Cooking Services","Hot Food","Takeout"]}
    ,{types:["trade","service"],job_titles:["Gardener"],name_options:["Gardening Services","Gardening Supplies"]}
    ,{types:["trade","service"],job_titles:["Herbalist"],name_options:["Herbs & More","Herbalist"]}
    ,{types:["trade","service"],job_titles:["Messenger"],name_options:["Runners","Messenger Services","Mail & More"]}
    
  ],
  100:[ // 50% Chance
    {types:["shop","general store"],job_titles:["Shopkeeper"],name_options:["Bits and Bobs","General Store","Store","One Stop Shop"]}
    ,{types:["shop","service"],job_titles:["Baker"],name_options:["Baked Goods","Bread & Baking","Bakers","Bakery","Sweets"]}
    ,{types:["shop","service"],job_titles:["Butcher"],name_options:["Butchers","Butchery","Fresh Meat"]}
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