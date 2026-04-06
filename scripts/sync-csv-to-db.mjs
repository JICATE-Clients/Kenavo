// Script: Compare CSV data vs DB and PATCH only null/missing fields
// Run: node scripts/sync-csv-to-db.mjs

const SUPABASE_URL = 'https://rihoufidmnqtffzqhplc.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpaG91ZmlkbW5xdGZmenFocGxjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTcyODA1MywiZXhwIjoyMDc3MzA0MDUzfQ.7gb1MOnDLE1XpJLnyGVZHum_JQMnY2DFCwNpT5eDaLo';

// All 72 profiles from the Slambook CSV
const CSV_PROFILES = [
  {name:'A Arjoon',nick:'Skele',loc:'104, Prima Hi Life, 86/2 Doddakannali, Off Sarjapur Main Road, Bangalore - 560035',job:'Finance, Associate Director',org:'DE Shaw, Hedge Fund',yr:'1993-2000',email:'Arjoon_a@yahoo.co.in',phone:'9843288766'},
  {name:'A S SYED AHAMED KHAN',nick:'Bhai!!',loc:'PUDHU MACHU VEEDU, 18.9, MUSLIM MIDDLE STREET, UTHAMAPALAYAM 625533, THENI DISTRICT, TAMIL NADU, INDIA',job:'AGRICULTURALIST, OWNER',org:'OWN AGRICULTURE FARMING BUSINESS',yr:'1992-2000',email:'A.S.AHAMEDKHAN@GMAIL.COM',phone:'919443257362'},
  {name:'Abishek Valluru',nick:'Daddy',loc:'Villa no 208 first leaf journalist colony Phase 3 Gachibowli Hyderabad 500032',job:'Business/ Managing Director',org:'BnB Infracon India out ltd',yr:'1995-2000',email:'abishekvalluru@gmail.com',phone:'9704870707'},
  {name:'Abraham Francis',nick:'Abe',loc:'68 Viridian Dr, Banksia Grove, WA, Australia 6031',job:'IT - Cloud Engineer',org:'MYOB',yr:'1992-2000',email:'abrahamkf@hotmail.com',phone:'+61 498 464 968'},
  {name:'Annadurai S.V',nick:'Don (Durai)',loc:'170B MK street, Sivathapuram, Salem',job:'Business man come Farmer',org:'Nil',yr:'1990-1998',email:'anna82durai@gmail',phone:'9626695839'},
  {name:'Annamalai Natarajan',nick:'Konai',loc:'727 Main road, Narayan Nagar, Viluppuram. Tamil Nadu 605 602',job:'Senior Research Scientist',org:'Philips Research North America',yr:'1998-2000',email:'annamalai.sbec@gmail.com',phone:'+1 970 980 6348'},
  {name:'Antony G Prakash',nick:'Kimmi',loc:'3100 Bluewood Dr, McKinney TX-75071',job:'Senior Manager, Engineering Lead for Cloud services',org:'Charles Schwab',yr:'1992-1999',email:'antony.prakash.100@gmail.com',phone:'+1 310-648-9283'},
  {name:'Antony J',nick:'Kaathu, Vella',loc:'Flat 111-S Ultima Skymax, Nilampathinjamughal Rd, Rajagiri Valley, 682039',job:'Doctor, Orthopedic surgeon',org:'Kolenchery Medical College Hospital',yr:'1994-2000',email:'drantonyak47@gmail.com',phone:'9447170853'},
  {name:'AROKIA ROCHE J',nick:'SECRET',loc:'RAMMIYAM JAMES CASTLE, FLAT NO S 1, SECOND FLOOR, RAJAMBAL STREET, DHANDEESWARAM NAGAR, VELACHERRY, CHENNAI - 600 042',job:'MANAGER',org:'',yr:'1992-2000',email:'arokiarochee_j@hotmail.com',phone:'96000 19595'},
  {name:'Arul Doss S P S',nick:'Blacky alias Karuvaya',loc:'2, Pookara Street, Thanjavur',job:'Secretary, Gnanam School of Business Thanjavur',org:'Hotel Gnanam',yr:'1991-2000',email:'Aruldoss1983@gmail.com',phone:'9443274600'},
  {name:'Arvind Chennu',nick:'Chennu, Body, AVC',loc:'Philadelphia, PA',job:'Cyber Security Engineering Manager',org:'Comcast NBC Universal',yr:'1990-2000',email:'arvindchennu@gmail.com',phone:''},
  {name:'Ashish Adyanthaya',nick:'Ashish',loc:'Ashish, opp. Naga Cottage, Near South Indian Bank ATM, Circular Road, Dimapur, Nagaland 797112',job:'Businessman',org:'Quality Medicines',yr:'1998-2000',email:'ashish.adyanthaya@gmail.com',phone:'9845179566'},
  {name:'Ashok kumar Rajendran',nick:'Ashok',loc:'Modern Rice Mill, Karapattu, Chengam Taluk 606705',job:'Marketing & Sales - Manager & Counselor',org:'Freight International LLC / Economic Group Holding / Freight Forwarding & Logistics',yr:'1992-2000',email:'write2ashok82@gmail.com',phone:'919176200090'},
  {name:'Ashok Kumar S',nick:'Madam',loc:'13/68, Velar Street, Sholavandan, Madurai',job:'Agriculture',org:'KSR Markettings',yr:'1992-2000',email:'Ashok.kumar247@gmail.com',phone:'919942320005'},
  {name:'Ashok Loganathan',nick:'Shokka',loc:'138 H/21, Kumaravel Complex, Aringar Annasalai. Rasipuram, Namakkal Dt 637408',job:'IT Business Architect',org:'Syneos Health',yr:'1990-2000',email:'ashok.loganathan@gmail.com',phone:'9840302975'},
  {name:'Balaji Srimurugan',nick:'Bhajji',loc:'2D, Magna Iatros, Opposite to Sri Parthasarathy temple, Ponnekkara, Edapally, Kochi-682024',job:'Paediatric cardiac surgeon / Assistant professor',org:'Amrita Institute of Medical sciences, Kochi',yr:'1992-2000',email:'balaji108@gmail.com',phone:'9961765069'},
  {name:'Bhargavan Jayanth Kumar',nick:'Baash',loc:'18 Marble Faun Lane, Windsor, CT - USA - 06095',job:'Business Analyst',org:'Reframe Solutions',yr:'1990-2000',email:'bhargavjayanth@gmail.com',phone:'19087236500'},
  {name:'Biswajith Nayak',nick:'Elvis',loc:'502, Housr Emilio, 1st Cross, Challaghatta Main Road, Varthur Hobli, Bangalore 560017',job:'Enterprise Technologist- Datacenters',org:'Dell',yr:'1998-2000',email:'biswajith@gmail.com',phone:'9742477733'},
  {name:'Cam Braganza',nick:'Cam, Vella Panni',loc:'Australia',job:'Partner',org:'Deloitte',yr:'1994-2000',email:'',phone:''},
  {name:'Charles Ernest',nick:'Charlie',loc:'A3, Raj Paris Ishwarya, 6a, Ranjith Road, Kotturpuram, Chennai 600085',job:'Co-Founder / Creative Director',org:'Smudge Design / Design, Marketing and Communication',yr:'1990-2000',email:'mail4charlie@gmail.com',phone:'9884163122'},
  {name:'Chenthil Aruun Mohan',nick:'Karuvaaya, Junior Amma',loc:'9-1-28, Double agraharam, Sholavandan, Madurai 625214',job:'Prothodontist / Associate Professor',org:'Ministry of health, Saudi Arabia',yr:'1990-1998',email:'chenthilaruun@gmail.com',phone:'919884728861'},
  {name:'Deepak Chakravarthy Munirathinam',nick:'Silk',loc:'Dr Munirathinam Medical Centre, salem main road, BOMMIDI -635301',job:'Doctor',org:'Dr Munirathinam Medical Centre',yr:'1991-2000',email:'drdeepaksrmc2000@gmail.com',phone:'9976550005'},
  {name:'Deepan MK',nick:'Mola - Poo',loc:'Lakshmi Villa, 4/24, Pallavi Nagar, Saravanpatti opp, Vilankurchi, Coimbatore North, 641035',job:'Entrepreneur in EV & IT Business consultant',org:'Atal Samraj Motors & Digital Chimps 360 Marketing firm IT',yr:'1991-2000',email:'deepanmk@gmail.com',phone:'9443140356'},
  {name:'Ghopal Krishnan',nick:'Govaluu',loc:'Lum Rumnong, Mawpat, Shillong. Meghalaya 793012',job:'Husband, Business partner',org:'DAKTI - Social Enterprise',yr:'1990-2000',email:'ghopal.krishnan@gmail.com',phone:'9870507022'},
  {name:'Gopinath Perumal',nick:'Kuruvi',loc:'Toronto, Canada',job:'Software Engineer',org:'IBM / Curam',yr:'1992-2000',email:'gopinath.perumal@gmail.com',phone:'16476296911'},
  {name:'Hariharan P',nick:'Hari',loc:'Platinum Gardenia, Flat No. B 415, 4th floor, Kembathalli main road, Anjanapura Town Ship, JP Nagar 9th Phase, Bangalore - 560108',job:'Director - Marketing Operations',org:'Indusface Pvt. Ltd.',yr:'1994-2000',email:'hapemfeo@gmail.com',phone:'9980896632'},
  {name:'Harinivas Rajasekaran',nick:'Hari',loc:'No 7, 8th Street, CHB Colony, Tiruchengode - 637 211, Tamilnadu',job:'Edupreneur & Correspondent.',org:'Vriksha Schools',yr:'1994-2000',email:'rharinivas@gmail.com',phone:''},
  {name:'Joe Abraham',nick:'Father Joe',loc:'5C Concert O Castle, Panampilly Nagar Main Avenue, Panampilly Nagar, Kochi 682036',job:'Services Industry / Operations Manager',org:'Integrated Communications / BPM',yr:'1994-2000',email:'vjoeabraham@gmail.com',phone:''},
  {name:'John Kennedy Francis',nick:'Kenny',loc:'30 Braeburn Crescent, Stanhope Gardens NSW 2768 Australia',job:'Business Owner',org:'Metal Roofing Australia',yr:'1993-2000',email:'john.francis@y7mail.com',phone:'405229795'},
  {name:'Jose Peter Cletus',nick:'',loc:'Koramangala, Bangalore 560034',job:'Quality Assurance Manager',org:'Oracle',yr:'1990-2000',email:'petercletus26@gmail.com',phone:'919880266188'},
  {name:'K Arun Chakkravarthy',nick:'Paruppu',loc:'270 Narasimman Road, Shevapet, Salem 636002',job:'Managing Director of Shri Nandhi Dhall Mills, Salem',org:'Shri Nandhi Dhall Mills India Pvt Ltd',yr:'1992-2000',email:'chakkravarthy6@gmail.com',phone:'9894122222'},
  {name:'K.C. Rameshkumar',nick:'KC, Mesu',loc:'Door no. 9A, Warners road, Cantonment, Trichy 1',job:'Business Owner',org:'Anantha, Textile and Garments Retail',yr:'1990-2000',email:'kcrameshkumar@gmail.com',phone:'9443127270'},
  {name:'Karthikeyan m',nick:'Thomz',loc:'113 chinnamuthu main Street, e.k.valasu, erode - 638011',job:'Business Owner',org:'--',yr:'1990-2000',email:'meetkarthionline@gmail.com',phone:'9884488344'},
  {name:'Krishnakumar Murugesan',nick:'Thambi',loc:'18/F2, Bye Pass Road, Pallipalayam 638006, Kumarapalayam Taluk, Namakkal District, Tamil Nadu, India.',job:'Textile Fabric Manufacturer - Proprietor',org:'Sri Pondevi Textiles',yr:'1998-2000',email:'pgdmkk@gmail.com',phone:'9443150400'},
  {name:'Kumaran Srinivasan',nick:'Kumaran',loc:'3B, sri nidhi apartments, 1st cross street, Sakthinagar, erode',job:'Sree RENGARAAJ steels and alloys (Steel manufacturing), Director',org:'Sree RENGARAAJ steels and alloys private limited',yr:'1993-1995',email:'kumaransmiley@gmail.com',phone:'9994544444'},
  {name:'Lalchhanhima',nick:'Hima',loc:'Aizawl, Mizoram',job:'Mizoram Civil Service; Dy Resident Commissioner, Shillong.',org:'Govt of Mizoram',yr:'1998-2000',email:'hima0507@gmail.com',phone:'9436159177'},
  {name:'Lalfak Zuala',nick:'Pinga',loc:'A2C7 Mual veng Chaltlang Aizawl Mizoram',job:'Self employed',org:'',yr:'1997-2000',email:'',phone:''},
  {name:'Lalhruaitluanga Khiangte',nick:'Marsh',loc:'Chaltlang Aizawl, Mizoram',job:'Business',org:'K.T.C. / Solomon Pharmacy',yr:'1992-1999',email:'marshkhiangte@gmail.com',phone:'9774019770'},
  {name:'MATHEW KODATH',nick:'Achoo',loc:'2803 COL MIRAMONTES TEGUCIGALPA HONDURAS CA',job:'CEO - GUACAMAYA FILMS / PRODUCER / DIRECTOR',org:'GUACAMAYA FILMS',yr:'1999-2000',email:'kodath@gmail.com',phone:''},
  {name:'Medo Lalzarliana',nick:'Jet Lee',loc:'Kohima',job:'Government servant',org:'Government of Mizoram',yr:'1998-2000',email:'Zisia1994@gmail.com',phone:'8729994300'},
  {name:'Mohamed Niaz',nick:'Kaaka, Mr. Brown',loc:'110, Masaken Al Warqa 1, Dubai',job:'Senior Engineer - Intelligence Expert',org:'Telecommunications',yr:'1998-2000',email:'mohamed.niaz@yahoo.com',phone:''},
  {name:'Naveen G',nick:'kedai',loc:'2010 El Camino Real, #1110, Santa Clara, CA 95050',job:'Consultant',org:'Game7',yr:'1994-2000',email:'naveen1001g@gmail.com',phone:'4087592134'},
  {name:'Nirmal Suresh Pattassery',nick:'Nimmy',loc:'Flat 3112, Sobha Rose Apartment, Whitefield Main Road, Whitefield, Bangalore',job:'Engineer, Technologist',org:'SanDisk',yr:'1994-2000',email:'nirmal_pattassery@yahoo.com',phone:'9986011556'},
  {name:'Ommsharravana',nick:'Omm',loc:'230, Salem Main Road, Kumarapalyam -638183',job:'Edupreneur, AI Solutions Architect, Angel Investor, Managing Director.',org:'JKKN Institutions.',yr:'1990-2000',email:'mailomm@gmail.com',phone:'9894116664'},
  {name:'Pranesh Mario Bhaskar',nick:'Dracula',loc:'Planter, Pattiveeranpatti',job:'Planter',org:'Sancta Maria Estate',yr:'1990-2000',email:'pranesh.bhaskar@gmail.com',phone:'9842410087'},
  {name:'Prasadhkanna Kanthruban Rathinavelu',nick:'Gandhi, Jokiyam',loc:'288B, Compassvale crescent, Sengkang, Singapore 542288',job:'Consultant',org:'Moodys',yr:'1993-2000',email:'kannamonty@gmail.com',phone:'6590921366'},
  {name:'Prasanna Venkidasamy Sathyanarayanan',nick:'Pras',loc:'4 dharapuram road, Tirupur 641604',job:'Petroleum dealer',org:'KALYANAM & CO',yr:'1993-2000',email:'prasanavenkys@gmail.com',phone:'9600633399'},
  {name:'PRAVIN KUMAR RAJU',nick:'NETTAI / PAPPA',loc:'OLD NO.12. NEW NO.15. THIRUMALAI STREET. RAMAKRISHNAPURAM. VELLORE. 632001. TAMIL NADU.',job:'Business Owner',org:'BHARATHI AND CO. AND RASVIN MOBILES PVT.LTD.',yr:'1991-2000',email:'COSMOPRAVIN@GMAIL.COM',phone:'9843392747'},
  {name:'Prem Kumar Soundarrajan',nick:'Monkey',loc:'198/1568 Vanavil nagar, Banu Nayinar complex, vengikkal, Tiruvannamalai 606 604',job:'Business - Rice Mill',org:'SP MODERN RICE MILL',yr:'1993-2000',email:'merp.raj@gmail.com',phone:'9840670426'},
  {name:'Prithivinath Ravindranath',nick:'Pilot or Balloon Bumb',loc:'Australia',job:'Senior Data Architect',org:'In transit',yr:'1992-2000',email:'pnrav1@gmail.com',phone:'61478511191'},
  {name:'Purushothaman Elango',nick:'Baby',loc:'117, Kalaimagal st. Kumarapalayam',job:'Textile, construction material business',org:'SSM Processing Mills / Tan India Earth ventures',yr:'1990-2000',email:'puru@ssmprocessing.com',phone:'9994700990'},
  {name:'R Praveen Kumar',nick:'Gundu Praveen',loc:'318, Rajarajan Nagar, New Arun Nagar, Alagapuram pudur, Salem - 16.',job:'Catering',org:'Shanthi Catering',yr:'',email:'prasan1214@gmail.com',phone:'9655121414'},
  {name:'R Ramesh Krishnan',nick:'Saint',loc:'Flat No 313, Sree Daksha Saharsh Apartments, Marudhamalai main road, Vadavalli Coimbatore, 641046',job:'IT - Senior Consultant',org:'First Apex insurance Systems / IT',yr:'1993-2000',email:'rrk1835@gmail.com',phone:'9600389440'},
  {name:'R.Rangaraj',nick:'Rowdy Ranga',loc:'Door no 10 A, No 2 Pillayar Kovil St, Gugai, Salem-636006',job:'Sailor - Captain',org:'Merchant Navy',yr:'1990-2000',email:'ranga2ranga@yahoo.co.in',phone:'9952814941'},
  {name:'Saran Kumar',nick:'Mutta kanna',loc:'170A Ellai St,Gudalur 625518, Theni District',job:'Agriculturalist',org:'Nil',yr:'1990-2000',email:'p.sarankumar@gmail.com',phone:'9944720002'},
  {name:'Shankkar Suyambulingam',nick:'Shanker the Wanker/ Shankaran Pillai',loc:'Brisbane, Australia',job:'Health Food Import and Distribution',org:'Coconut Story',yr:'1995-2000',email:'shankkarsuyambu@gmail.com',phone:'61431229329'},
  {name:'Shravan Kumar Avula',nick:'Several!',loc:'Villa 15, Bollineni Homes, Madhapur, Hyderabad 500081',job:'Managing Director / Industrialist',org:'CAPART INDUSTRIES',yr:'1994-1998',email:'shravo@gmail.com',phone:'9394011624'},
  {name:'Srinivasan N',nick:'Srini',loc:'Tower 18, H2-402 Shriram Shankari Apts, Thangappapuram, Guduvanchery, Chennai 603202',job:'Marketing Director - Zoho Corporation',org:'Zoho Corporation',yr:'1990-2000',email:'srinicheenu@gmail.com',phone:'+91 9962578958'},
  {name:'Subbu Shanmugam Sundaresan',nick:'Subbu',loc:'LRN Motors, 3/2, Ramakrishna Road, Salem - 636007, Tamil Nadu',job:'Managing Director',org:'LRN GROUP OF COMPANIES',yr:'1993-2000',email:'lrnsubbu@gmail.com',phone:'+91 99940 94466'},
  {name:'Suraj de Rozario',nick:'Babla',loc:'Rossition - Fairlawns, Yercaud 636601 Salem Dt, Tamil Nadu - INDIA',job:'Retired',org:'Emerson',yr:'1990-2000',email:'gunnrunner@gmail.com',phone:'+971 566955386'},
  {name:'Suresh Louis',nick:'Louie',loc:'No: 38 Bougan Villa Maruthi Nagar First Main Road Phase 3, Iyappanthangal, Chennai -600056',job:'IT / Senior Project Manager',org:'PayPal India Pvt Ltd',yr:'1994-2000',email:'sureshlouis81@gmail.com',phone:'9176679314'},
  {name:'Tarunesh Pasuparthy',nick:'Aamai/Aams',loc:'19/2L2 Rathinagiri Rd, Near Ammarun Foundries, Vilankurichi, Coimbatore -641035',job:'Derivatives Trader',org:'None',yr:'1994-2000',email:'taruneshpasuparthy@gmail.com',phone:'9980620010'},
  {name:'Thiagu R',nick:'Tiger, Thoks',loc:'7/4 Mutha Valli Ibrahim St,Shevapet,Salem 636002',job:'Salaried, State Head in TATA AIA Life - HDFC branch Banking',org:'TATA AIA Life Insurance',yr:'1990-2000',email:'thiagu1982@gmail.com',phone:'9841486656'},
  {name:'Tom Jogy',nick:'Tom',loc:'Pallath Nagar, South Janatha Road, Cochin 682025',job:'Principal Consultant',org:'Wipro Technologies',yr:'1992-2000',email:'tomjogy@gmail.com',phone:'9845225588'},
  {name:'Vairavan Subramanian',nick:'Vaira',loc:'Flat 3D, JD Yashica Apartments, 135/136, PV Rajamannar Salai, KK Nagar, Chennai 600078',job:'Agriculture | Construction',org:'Cranbourne Estate / Elridge',yr:'1994-2000',email:'vaira.subramanian@gmail.com',phone:'9611200772'},
  {name:'Varadharajulu Chandrasekaran',nick:'Sotta, Varadha, Raju, Julu',loc:'Flat no. 334, DS Max Saanjh, Yelenahalli Main Road. Akshayanagar. Bengaluru - 560076',job:'IT / Senior Manager',org:'Cisco Systems India Pvt. Ltd.',yr:'1992-2000',email:'rajuchan24@gmail.com',phone:'9972520432'},
  {name:'Vignesh M Ramamoorthy',nick:'Mari',loc:'120/1, Marshalls Enclave, Marshalls Road, Egmore, Chennai - 08',job:'Self Employed',org:'NA',yr:'1992-2000',email:'vikki_ramamurthy@gmail.com',phone:'9677070777'},
  {name:'Vinod Maliyekal',nick:'Jeppo',loc:'27 Seaton Place Drive, Stoney Creek, Ontario L8E 3E3, CANADA',job:'Senior Account Manager - Logistics',org:'UPS Canada',yr:'1995-2000',email:'maliyekal@gmail.com',phone:'16476129052'},
  {name:'Vishwanath Raj',nick:'Karadi',loc:'2006-77 Gerrard st w, Toronto, Ontario, Canada',job:'Whatever',org:'Watever',yr:'1996-2000',email:'vishwa0226@gmail.com',phone:'+91- 73975 84999'},
  {name:'Vongsatorn Lertsethtakarn',nick:'Vong',loc:'91/10 Soi 1 Perfect Place Chaengwattana 2, Horkankhathai Road, Bangtanai, Pakkret, Nonthaburi 11120 Thailand',job:'Military Contractor and work as a general manager in Family business',org:'Vongsatorn Imex Co.,Ltd.',yr:'1993-2000',email:'iballvong@gmail.com',phone:'+66 625566622'},
  {name:'VT Martin Vabeiduakhei',nick:'Martin',loc:'Siaha, Mizoram',job:'Sports Promotion Officer (Government)',org:'Mara Thyutlia Py',yr:'1998-2000',email:'Martinvtsakhu@gmail.com',phone:'7085699693'},
  {name:'Bharaneedharan V K',nick:'Kannadi',loc:'Sydney,Australia',job:'IT professional & Engineering Manager',org:'Commonwealth Bank of Australia',yr:'1991-1998',email:'bharaneedharan.vk@gmail.com',phone:'418360929'},
];

function norm(s) {
  return s.trim().toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ').trim();
}

async function fetchDB() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?select=id,name,year_graduated,location,current_job,designation_organisation,nicknames,email,phone&limit=200`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
  );
  return res.json();
}

async function patchProfile(id, fields) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${id}`,
    {
      method: 'PATCH',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(fields),
    }
  );
  return res.status;
}

async function main() {
  console.log('Fetching profiles from DB...');
  const dbProfiles = await fetchDB();
  console.log(`Loaded ${dbProfiles.length} profiles from DB`);

  const dbMap = new Map(dbProfiles.map(p => [norm(p.name), p]));

  const updates = [];
  const notFound = [];

  for (const c of CSV_PROFILES) {
    const key = norm(c.name);
    let dbp = dbMap.get(key);

    // Fallback: first + last name match
    if (!dbp) {
      const cw = key.split(' ').filter(Boolean);
      if (cw.length >= 2) {
        const fl = `${cw[0]} ${cw[cw.length - 1]}`;
        for (const [k, v] of dbMap) {
          const kw = k.split(' ').filter(Boolean);
          if (kw.length >= 2 && `${kw[0]} ${kw[kw.length - 1]}` === fl) {
            dbp = v; break;
          }
        }
      }
    }

    if (!dbp) { notFound.push(c.name); continue; }

    const upd = {};
    if (c.yr   && !dbp.year_graduated)           upd.year_graduated = c.yr;
    if (c.loc  && !dbp.location)                 upd.location = c.loc;
    if (c.job  && !dbp.current_job)              upd.current_job = c.job;
    if (c.org  && !dbp.designation_organisation) upd.designation_organisation = c.org;
    if (c.nick && !dbp.nicknames)                upd.nicknames = c.nick;
    // email/phone: only add if DB is null and CSV is not empty/NA/#ERROR!
    const badPhone = ['', 'na', '#error!', '-1976'];
    const badEmail = ['', 'na'];
    if (c.email && !badEmail.includes(c.email.toLowerCase()) && !dbp.email) upd.email = c.email;
    if (c.phone && !badPhone.includes(c.phone.toLowerCase()) && !dbp.phone) upd.phone = c.phone;

    if (Object.keys(upd).length > 0) {
      updates.push({ id: dbp.id, name: dbp.name, fields: upd });
    }
  }

  console.log(`\n=== ANALYSIS ===`);
  console.log(`Profiles needing updates: ${updates.length}`);
  console.log(`Not found in DB: ${notFound.length}`, notFound);

  if (updates.length === 0) {
    console.log('All profiles are up to date!');
    return;
  }

  console.log('\n=== UPDATES TO APPLY ===');
  for (const u of updates) {
    console.log(`\nID ${u.id}: ${u.name}`);
    for (const [k, v] of Object.entries(u.fields)) {
      console.log(`  ${k}: ${JSON.stringify(v)}`);
    }
  }

  console.log('\n=== APPLYING PATCHES ===');
  let ok = 0, fail = 0;
  for (const u of updates) {
    const status = await patchProfile(u.id, u.fields);
    if (status === 204) {
      console.log(`✅ ID ${u.id} (${u.name}) updated`);
      ok++;
    } else {
      console.log(`❌ ID ${u.id} (${u.name}) failed — HTTP ${status}`);
      fail++;
    }
  }

  console.log(`\n=== DONE ===`);
  console.log(`✅ Updated: ${ok}`);
  console.log(`❌ Failed:  ${fail}`);
}

main().catch(console.error);
