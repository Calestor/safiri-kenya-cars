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
    image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=500&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1533473359331-35acde7260cd?w=800&h=600&fit=crop'
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
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1527524330037-278a77dc0d4d?w=800&h=600&fit=crop'
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
    image: 'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=500&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1566023967268-70fec53f79ca?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1507950547674-2b27b501a556?w=800&h=600&fit=crop'
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
    image: 'https://images.unsplash.com/photo-1464219414199-26ecb847e675?w=500&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1464219414199-26ecb847e675?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=600&fit=crop'
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
    image: 'https://images.unsplash.com/photo-1513521399740-48416e8a0ffd?w=500&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1513521399740-48416e8a0ffd?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552662712-d4cb814b2d4b?w=800&h=600&fit=crop'
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
];

export const getCarById = (id: string): Car | undefined => {
  return mockCars.find(car => car.id === id);
};
