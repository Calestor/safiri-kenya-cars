export interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  type: 'SUV' | 'Sedan' | 'Hatchback' | 'Minivan';
  image: string;
  images: string[];
  price: number;
  location: string;
  rating: number;
  reviewCount: number;
  seats: number;
  transmission: 'Automatic' | 'Manual';
  fuelType: 'Petrol' | 'Diesel' | 'Hybrid';
  mileage: number;
  fuelEfficiency: string;
  features: string[];
  description: string;
  ownerName: string;
  ownerRating: number;
  joinDate: string;
  responseTime: string;
}

export const mockCars: Car[] = [
  {
    id: '1',
    title: 'Toyota Prado',
    brand: 'Toyota',
    model: 'Prado TX',
    year: 2022,
    type: 'SUV',
    image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=500&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&h=600&fit=crop&crop=left',
      'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&h=600&fit=crop&crop=right'
    ],
    price: 5500,
    location: 'Nairobi',
    rating: 4.8,
    reviewCount: 42,
    seats: 7,
    transmission: 'Automatic',
    fuelType: 'Diesel',
    mileage: 35000,
    fuelEfficiency: '8.5 km/l',
    features: [
      'Air Conditioning',
      'Power Windows',
      'Parking Sensors',
      'Cruise Control',
      'AUX/USB Port',
      'Spacious Trunk',
      'Off-road Capable'
    ],
    description: 'Perfect for family safaris and long-distance trips. This Toyota Prado is well-maintained, comfortable, and ideal for exploring Kenya\'s diverse landscapes.',
    ownerName: 'John Kariuki',
    ownerRating: 4.9,
    joinDate: '2022-03-15',
    responseTime: '< 1 hour'
  },
  {
    id: '2',
    title: 'Suzuki Jimny',
    brand: 'Suzuki',
    model: 'Jimny SZ5',
    year: 2021,
    type: 'SUV',
    image: 'https://images.unsplash.com/photo-1534093607318-f025413f49cb?w=500&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1534093607318-f025413f49cb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1534093607318-f025413f49cb?w=800&h=600&fit=crop&crop=left',
      'https://images.unsplash.com/photo-1534093607318-f025413f49cb?w=800&h=600&fit=crop&crop=right'
    ],
    price: 3200,
    location: 'Mombasa',
    rating: 4.6,
    reviewCount: 28,
    seats: 5,
    transmission: 'Manual',
    fuelType: 'Petrol',
    mileage: 42000,
    fuelEfficiency: '12 km/l',
    features: [
      'Air Conditioning',
      'Power Steering',
      '4WD System',
      'Radio/Cassette',
      'Good Ground Clearance',
      'Compact Design'
    ],
    description: 'Compact and reliable SUV perfect for coastal exploration and city driving. Great fuel efficiency and easy to maneuver in tight spaces.',
    ownerName: 'Aisha Mohammed',
    ownerRating: 4.7,
    joinDate: '2021-06-22',
    responseTime: '< 2 hours'
  },
  {
    id: '3',
    title: 'Toyota Corolla',
    brand: 'Toyota',
    model: 'Corolla CVT',
    year: 2023,
    type: 'Sedan',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop'
    ],
    price: 2800,
    location: 'Kisumu',
    rating: 4.7,
    reviewCount: 35,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    mileage: 28000,
    fuelEfficiency: '14.5 km/l',
    features: [
      'Air Conditioning',
      'Power Windows & Locks',
      'ABS Brakes',
      'Airbags',
      'Touchscreen Radio',
      'Keyless Entry',
      'Central Locking'
    ],
    description: 'New Toyota Corolla with latest features. Excellent for business trips and city driving. Very fuel-efficient and reliable.',
    ownerName: 'David Kipchoge',
    ownerRating: 4.8,
    joinDate: '2022-11-05',
    responseTime: '< 30 mins'
  },
  {
    id: '4',
    title: 'Nissan X-Trail',
    brand: 'Nissan',
    model: 'X-Trail T31',
    year: 2020,
    type: 'SUV',
    image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502161254066-6c74afbf07aa?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=600&fit=crop'
    ],
    price: 4200,
    location: 'Nakuru',
    rating: 4.5,
    reviewCount: 19,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    mileage: 58000,
    fuelEfficiency: '10 km/l',
    features: [
      'Air Conditioning',
      'Panoramic Sunroof',
      'Rearview Camera',
      'Cruise Control',
      'Power Steering',
      'All-Terrain Tires'
    ],
    description: 'Spacious family SUV with great comfort. Perfect for group trips and comfortable highway driving.',
    ownerName: 'Patricia Nyambura',
    ownerRating: 4.6,
    joinDate: '2021-09-18',
    responseTime: '< 1 hour'
  },
  {
    id: '5',
    title: 'Honda Civic',
    brand: 'Honda',
    model: 'Civic EX',
    year: 2022,
    type: 'Sedan',
    image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=500&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=600&fit=crop'
    ],
    price: 3500,
    location: 'Eldoret',
    rating: 4.9,
    reviewCount: 51,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    mileage: 22000,
    fuelEfficiency: '13.5 km/l',
    features: [
      'Air Conditioning',
      'Power Windows & Locks',
      'ABS Brakes',
      'Climate Control',
      'Bluetooth Connectivity',
      'Lane Assist',
      'Smart Key'
    ],
    description: 'Sleek and modern Honda Civic with excellent safety features. Great for young professionals and couples.',
    ownerName: 'Samuel Kiplagat',
    ownerRating: 4.9,
    joinDate: '2023-01-10',
    responseTime: '< 45 mins'
  }
  ,
  {
    id: '6',
    title: 'Mercedes-Benz C-Class',
    brand: 'Mercedes-Benz',
    model: 'C 200 AMG Line',
    year: 2023,
    type: 'Sedan',
    image: 'https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?w=500&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?w=800&h=600&fit=crop&crop=left',
      'https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?w=800&h=600&fit=crop&crop=right'
    ],
    price: 12000,
    location: 'Nairobi',
    rating: 4.9,
    reviewCount: 38,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    mileage: 18000,
    fuelEfficiency: '11 km/l',
    features: [
      'Leather Seats',
      'Panoramic Sunroof',
      'Adaptive Cruise Control',
      'Ambient Lighting',
      'Wireless CarPlay',
      'MBUX Infotainment',
      'Lane Keep Assist',
      'Heated Seats'
    ],
    description: 'Experience ultimate luxury in this stunning Mercedes-Benz C 200. Perfect for executive travel, weddings, and special occasions in Nairobi.',
    ownerName: 'Grace Mwangi',
    ownerRating: 5.0,
    joinDate: '2023-03-01',
    responseTime: '< 30 mins'
  },
  {
    id: '7',
    title: 'Tesla Model 3',
    brand: 'Tesla',
    model: 'Model 3 Long Range',
    year: 2023,
    type: 'Sedan',
    image: 'https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?w=500&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?w=800&h=600&fit=crop&crop=left',
      'https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?w=800&h=600&fit=crop&crop=right'
    ],
    price: 15000,
    location: 'Nairobi',
    rating: 4.8,
    reviewCount: 24,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    mileage: 12000,
    fuelEfficiency: '0 km/l (Electric)',
    features: [
      'Full Electric Drive',
      'Autopilot',
      '15" Touchscreen',
      'Over-the-Air Updates',
      'Supercharger Access',
      'Premium Audio',
      'Glass Roof',
      'Sentry Mode'
    ],
    description: 'Drive the future with this cutting-edge Tesla Model 3. Zero emissions, instant torque, and the latest in autonomous driving tech — perfect for eco-conscious explorers.',
    ownerName: 'Brian Otieno',
    ownerRating: 4.9,
    joinDate: '2023-07-14',
    responseTime: '< 1 hour'
  },
  {
    id: '8',
    title: 'Nissan Juke',
    brand: 'Nissan',
    model: 'Juke Tekna',
    year: 2022,
    type: 'Hatchback',
    image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=500&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=600&fit=crop&crop=left',
      'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=600&fit=crop&crop=right'
    ],
    price: 4500,
    location: 'Mombasa',
    rating: 4.5,
    reviewCount: 17,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    mileage: 31000,
    fuelEfficiency: '13 km/l',
    features: [
      'Air Conditioning',
      'Apple CarPlay',
      'Android Auto',
      'Reversing Camera',
      'Keyless Start',
      'Alloy Wheels',
      'Sport Mode'
    ],
    description: 'Funky, stylish, and fun to drive — the Nissan Juke is perfect for coastal road trips and city cruising around Mombasa.',
    ownerName: 'Fatuma Hassan',
    ownerRating: 4.6,
    joinDate: '2022-05-20',
    responseTime: '< 2 hours'
  },
  {
    id: '9',
    title: 'Audi A4',
    brand: 'Audi',
    model: 'A4 S Line',
    year: 2022,
    type: 'Sedan',
    image: 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=500&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&h=600&fit=crop&crop=left',
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&h=600&fit=crop&crop=right'
    ],
    price: 10000,
    location: 'Nairobi',
    rating: 4.7,
    reviewCount: 31,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    mileage: 24000,
    fuelEfficiency: '12 km/l',
    features: [
      'Quattro AWD',
      'Virtual Cockpit',
      'Bang & Olufsen Sound',
      'Heated Seats',
      'Adaptive Headlights',
      'MMI Navigation',
      'S Line Body Kit',
      'Parking Assist'
    ],
    description: 'Refined German engineering meets Kenyan roads. The Audi A4 S Line blends sportiness with luxury, ideal for business executives and premium road trips.',
    ownerName: 'Kevin Ndung\'u',
    ownerRating: 4.8,
    joinDate: '2022-08-11',
    responseTime: '< 1 hour'
  },
  {
    id: '10',
    title: 'Bugatti Chiron',
    brand: 'Bugatti',
    model: 'Chiron Sport',
    year: 2022,
    type: 'Sedan',
    image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=500&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop&crop=left',
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop&crop=right'
    ],
    price: 150000,
    location: 'Nairobi',
    rating: 5.0,
    reviewCount: 7,
    seats: 2,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    mileage: 4000,
    fuelEfficiency: '3.5 km/l',
    features: [
      '1500HP W16 Engine',
      'Top Speed 420 km/h',
      'Carbon Fibre Body',
      'Active Aerodynamics',
      'Titanium Exhaust',
      'Custom Interior',
      'Track Mode',
      'GPS Tracking'
    ],
    description: 'The pinnacle of automotive engineering. An exclusive opportunity to experience a Bugatti Chiron in Kenya — reserved for those who demand only the extraordinary.',
    ownerName: 'Alex Waweru',
    ownerRating: 5.0,
    joinDate: '2023-01-01',
    responseTime: '< 30 mins'
  },
  {
    id: '11',
    title: 'Jaguar F-Type',
    brand: 'Jaguar',
    model: 'F-Type R Coupe',
    year: 2023,
    type: 'Sedan',
    image: 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=500&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=800&h=600&fit=crop&crop=left',
      'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=800&h=600&fit=crop&crop=right'
    ],
    price: 18000,
    location: 'Nairobi',
    rating: 4.9,
    reviewCount: 14,
    seats: 2,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    mileage: 9000,
    fuelEfficiency: '9 km/l',
    features: [
      'Supercharged V8 Engine',
      'Active Sport Exhaust',
      'Configurable Dynamics',
      'InControl Touch Pro',
      'Meridian Sound System',
      'Full Leather Interior',
      'Launch Control',
      'Head-Up Display'
    ],
    description: 'Raw British performance and unmistakable style. The Jaguar F-Type R is the ultimate weekend thrill machine — turn every Nairobi street into a race track.',
    ownerName: 'Diana Kamau',
    ownerRating: 5.0,
    joinDate: '2023-04-18',
    responseTime: '< 1 hour'
  }
];

export const getCarById = (id: string): Car | undefined => {
  return mockCars.find(car => car.id === id);
};
