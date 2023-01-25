let JobTypes  =  ["Apothecary","Artist","Baker","Barber","Blacksmith","Butcher","Farmer","Librarian","Cleric","Carpenter","Candlemaker","Cook","Gardener","Herbalist","Messenger","Guard","Painter","Physician","Potter","Scribe","Shoemaker","Spinster",]

let VoiceDescriptors = ["abrasive","acidic","adenoidal","airy","animated","anxious","authoritative","barbed","barely audible","baritone","barking","bass","big","blasé","bombastic","bored","boyish","bitter","bland","bleak","blunt","booming","brash","braying","breathy","breezy","bright","brisk","brittle","broken","bubbly","burbling","calm","caustic","casual","cheerful","childish","chirping","choked","clear","clipped","cloying","coarse","cold","cool","complacent","contented","contralto","cracking","creaky","croaking","crisp","crooning","curt","cultured","cynical","deep","devoid of emotion","discordant","dispirited","drawling","dreamy","dry","dulcet","dull","earnest","easy","falsetto","faint","feathery","feeble","firm","flat","fierce","forceful","fretful","gentle","girlish","glum","goofy","grating","grave","gravelly","grim","growling","gruff","guttural","hard","harsh","hateful","hearty","hesitant","high-pitched","hissing","hoarse","honeyed","hushed","husky","immense","indifferent","insinuating","intense","ironic","jubilant","lazy","lifeless","light","lilting","lively","loud","loving","low","matter-of-fact","mellifluous","melodious","mild","mocking","monotonous","muffled","musical","muted","nasal","nasty","neutral","nonchalant","obsequious","oily","piercing","piping","polished","quavering","querulous","quiet","ragged","rasping","raucous","raw","reedy","refined","resonant","ringing","roaring","robust","rough","rumbling","saccharine","sarcastic","savage","scornful","scratchy","screeching","serene","severe","shaky","sharp","shrill","sibilant","silken","silly","silvery","sincere","singsong","sleek","sluggish","slurring","sly","small","smarmy","smoky","smooth","snide","soft","solid","somber","sonorous","soothing","soprano","sour","spacey","stark","steely","stiff","stout","strained","strident","stony","suave","suggestive","surly","squeaky","squealing","sugary","sweet","sympathetic","tart","teasing","thick","thin","throaty","thunderous","tight","tender","tense","trembling","tremulous","trilling","uncertain","unctuous","unsteady","vague","velvety","warm","wavering","weak","weary","wheezy","whiny","wistful"]
let EyeDescriptors = ["large","small","narrow","sharp","squinty","round","wide-set","close-set","deep-set","sunken","bulging","protruding","wide","hooded","heavy-lidded","bedroom","bright","sparkling","glittering","flecked","dull","bleary","rheumy","cloudy","red-rimmed","beady","birdlike","cat-like","jewel-like","steely","hard",]
let EyebrowDescriptors = ["arched","straight","plucked","sparse","trim","dark","faint","thin","thick","unruly","bushy","heavy",]
let SkinDescriptors = ["lined","wrinkled","seamed","leathery","sagging","drooping","loose","clear","smooth","silken","satiny","dry","flaky","scaly","delicate","thin","translucent","luminescent","baby-soft","flawless","poreless","with large pores","glowing","dewy","dull","velvety","fuzzy","rough","uneven","mottled","dimpled","doughy","firm","freckled","pimply","pockmarked","blemished","pitted","scarred","bruised","veined","scratched","sunburned","weather-beaten","raw","tattooed",]
let FaceDescriptors = ["square","round","oblong","oval","elongated","narrow","heart-shaped","catlike","wolfish","high forehead","broad forehead","prominent brow ridge","protruding brow bone","sharp cheekbones","high cheekbones","angular cheekbones","hollow cheeks","square jaw","chiseled","sculpted","craggy","soft","jowly","jutting chin","pointed chin","weak chin","receding chin","double chin","cleft chin","dimple in chin","visible Adam’s apple",]
let NoseDescriptors = ["snub","dainty","button","turned-up","long","broad","thin","straight","pointed","crooked","aquiline","Roman","bulbous","flared","hawk","strong",]
let MouthDescriptors = ["thin","narrow","full","lush","Cupid’s bow","rosebud","dry","cracked","chapped","moist","glossy","straight teeth","gap between teeth","gleaming white teeth","overbite","underbite",]
let FacialHairDescriptors = ["clean-shaven","smooth-shaven","beard","neckbeard","goatee","moustache","sideburns","mutton-chop sideburns","stubble","a few days’ growth of beard","five o’ clock shadow",]
let HairDescriptors = ["long","short","shoulder-length","loose","limp","dull","shiny","glossy","sleek","smooth","luminous","lustrous","spiky","stringy","shaggy","tangled","messy","tousled","windblown","unkempt","bedhead","straggly","neatly combed","parted","slicked down","cropped","clipped","buzz cut","crewcut","bob","mullet","curly","bushy","frizzy","wavy","straight","lanky","dry","oily","greasy","layers","corkscrews","spirals","ringlets","braids","widow’s peak","bald","shaved","comb-over","afro","thick","luxuriant","voluminous","full","wild","untamed","bouncy","wispy","fine","thinning",]
let BodyDescriptors = ["tall","average height","short","petite","tiny","compact","big","large","burly","beefy","bulky","brawny","barrel-chested","heavy-set","fat","overweight","obese","flabby","chunky","chubby","pudgy","pot-bellied","portly","thick","stout","lush","plush","full-figured","ample","rounded","generous","voluptuous","curvy","hourglass","plump","long-legged","gangling","lanky","coltish","lissome","willowy","lithe","lean","slim","slender","trim","thin","skinny","emaciated","gaunt","bony","spare","solid","stocky","wiry","rangy","sinewy","stringy","ropy","sturdy","strapping","powerful","hulking","fit","athletic","toned","built","muscular","chiseled","taut","ripped","Herculean","broad-shouldered","sloping shoulders","bowlegged",]
let HandDescriptors = ["delicate","small","large","square","sturdy","strong","smooth","rough","calloused","elegant","plump","manicured","stubby fingers","long fingers","ragged nails","grimy fingernails","ink-stained",]

let SkinColours = ["amber","bronze","cinnamon","copper","dark brown","deep brown","ebony","honey","golden","pale","pallid","pasty","fair","light","creamy","alabaster","ivory","bisque","milk","porcelain","chalky","sallow","olive","peach","rosy","ruddy","florid","russet","tawny","fawn",]
let EyeColours = ["chestnut","chocolate brown","cocoa brown","coffee brown","mocha","mahogany","sepia","sienna brown","mink brown","copper","amber","cognac","whiskey","brandy","honey","tawny","topaz","hazel","obsidian","onyx","coal","raven","midnight","sky blue","sunny blue","cornflower blue","steel blue","ice blue","Arctic blue","glacial blue","crystal blue","cerulean","electric blue","azure","lake blue","aquamarine","turquoise","denim blue","slate","storm blue","silver","chrome","platinum","pewter","smoky gray","ash gray","concrete gray","dove gray","shark gray","fog gray","gunmetal gray","olive","emerald","leaf green","moss green",]
let HairColours = ["black","blue-black","jet black","raven","ebony","inky black","midnight","sable","salt and pepper","silver gray","charcoal gray","steel gray","white","snow-white","brown","brunette","chocolate brown","coffee brown","ash brown","brown sugar","nut brown","caramel","tawny brown","toffee brown","red","ginger","auburn","Titian-haired","copper","strawberry blonde","butterscotch","honey","wheat","blonde","golden","sandy blond","flaxen","fair-haired","bleached","platinum",]