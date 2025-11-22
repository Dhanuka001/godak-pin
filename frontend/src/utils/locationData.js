export const districts = [
  {
    name: 'Ampara',
    cities: ['Ampara', 'Kalmunai', 'Akkaraipattu', 'Sainthamaruthu', 'Sammanthurai'],
  },
  {
    name: 'Anuradhapura',
    cities: ['Anuradhapura', 'Kekirawa', 'Nochchiyagama', 'Medawachchiya', 'Galnewa'],
  },
  {
    name: 'Badulla',
    cities: ['Badulla', 'Bandarawela', 'Haputale', 'Welimada', 'Mahiyanganaya'],
  },
  {
    name: 'Batticaloa',
    cities: ['Batticaloa', 'Eravur', 'Kalkudah', 'Valachchenai', 'Kattankudy'],
  },
  {
    name: 'Colombo',
    cities: [
      'Colombo',
      'Dehiwala-Mount Lavinia',
      'Moratuwa',
      'Sri Jayawardenepura Kotte',
      'Battaramulla',
      'Maharagama',
      'Homagama',
      'Ratmalana',
    ],
  },
  {
    name: 'Galle',
    cities: ['Galle', 'Ambalangoda', 'Hikkaduwa', 'Elpitiya', 'Bentota'],
  },
  {
    name: 'Gampaha',
    cities: ['Gampaha', 'Negombo', 'Ja-Ela', 'Kelaniya', 'Kadawatha', 'Ragama', 'Wattala'],
  },
  {
    name: 'Hambantota',
    cities: ['Hambantota', 'Tangalle', 'Tissamaharama', 'Ambalantota', 'Beliatta'],
  },
  {
    name: 'Jaffna',
    cities: ['Jaffna', 'Chavakachcheri', 'Nallur', 'Point Pedro', 'Velanai'],
  },
  {
    name: 'Kalutara',
    cities: ['Kalutara', 'Panadura', 'Beruwala', 'Horana', 'Matugama'],
  },
  {
    name: 'Kandy',
    cities: ['Kandy', 'Katugastota', 'Peradeniya', 'Gampola', 'Akurana'],
  },
  {
    name: 'Kegalle',
    cities: ['Kegalle', 'Mawanella', 'Rambukkana', 'Warakapola', 'Galigamuwa'],
  },
  {
    name: 'Kilinochchi',
    cities: ['Kilinochchi', 'Pallai', 'Poonakary', 'Paranthan'],
  },
  {
    name: 'Kurunegala',
    cities: ['Kurunegala', 'Kuliyapitiya', 'Pannala', 'Mawathagama', 'Narammala'],
  },
  {
    name: 'Mannar',
    cities: ['Mannar', 'Pesalai', 'Madhu Road', 'Murunkan', 'Nanattan'],
  },
  {
    name: 'Matale',
    cities: ['Matale', 'Dambulla', 'Galewela', 'Sigiriya', 'Ukuwela'],
  },
  {
    name: 'Matara',
    cities: ['Matara', 'Weligama', 'Akuressa', 'Hakmana', 'Dikwella'],
  },
  {
    name: 'Monaragala',
    cities: ['Monaragala', 'Bibile', 'Wellawaya', 'Buttala', 'Kataragama'],
  },
  {
    name: 'Mullaitivu',
    cities: ['Mullaitivu', 'Puthukkudiyiruppu', 'Oddusuddan', 'Thunukkai', 'Mankulam'],
  },
  {
    name: 'Nuwara Eliya',
    cities: ['Nuwara Eliya', 'Hatton', 'Ginigathhena', 'Talawakele', 'Ragala'],
  },
  {
    name: 'Polonnaruwa',
    cities: ['Polonnaruwa', 'Kaduruwela', 'Hingurakgoda', 'Medirigiriya', 'Dimbulagala'],
  },
  {
    name: 'Puttalam',
    cities: ['Puttalam', 'Chilaw', 'Wennappuwa', 'Dankotuwa', 'Nattandiya'],
  },
  {
    name: 'Ratnapura',
    cities: ['Ratnapura', 'Balangoda', 'Eheliyagoda', 'Pelmadulla', 'Kuruwita'],
  },
  {
    name: 'Trincomalee',
    cities: ['Trincomalee', 'Kinniya', 'Kantale', 'Muttur', 'Nilaveli'],
  },
  {
    name: 'Vavuniya',
    cities: ['Vavuniya', 'Nedunkerny', 'Settikulam', 'Vavuniya South'],
  },
];

export const allCities = Array.from(new Set(districts.flatMap((d) => d.cities)));

export const districtNames = districts.map((d) => d.name);

export const getCitiesForDistrict = (district) => {
  if (!district) return allCities;
  const match = districts.find((d) => d.name === district);
  return match ? match.cities : allCities;
};
