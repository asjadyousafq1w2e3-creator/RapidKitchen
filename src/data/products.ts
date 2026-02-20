export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  shortDescription: string;
  images: string[];
  category: string;
  rating: number;
  reviewCount: number;
  badge?: string;
  colors?: string[];
  inStock: boolean;
  features: string[];
}

export const products: Product[] = [
  {
    id: "smart-chopper-pro",
    name: "Smart Chopper Pro",
    price: 4500,
    originalPrice: 6500,
    description: "The Smart Chopper Pro revolutionizes meal prep with its powerful 500W motor and precision-engineered blades. Chop, mince, and blend in seconds. Dishwasher-safe components make cleanup a breeze.",
    shortDescription: "Powerful 500W food chopper with precision blades",
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&h=600&fit=crop",
    ],
    category: "Choppers",
    rating: 4.8,
    reviewCount: 234,
    badge: "Best Seller",
    colors: ["Silver", "Black", "Rose Gold"],
    inStock: true,
    features: ["500W Motor", "BPA-Free", "Dishwasher Safe", "5 Speed Settings"],
  },
  {
    id: "precision-kitchen-scale",
    name: "Precision Kitchen Scale",
    price: 2200,
    originalPrice: 3000,
    description: "Measure ingredients with laboratory-grade accuracy. The sleek tempered glass platform and LCD display make this scale both beautiful and functional.",
    shortDescription: "Digital scale with 0.1g precision accuracy",
    images: [
      "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1495461199391-8c39ab674295?w=600&h=600&fit=crop",
    ],
    category: "Measurement",
    rating: 4.6,
    reviewCount: 189,
    badge: "New",
    inStock: true,
    features: ["0.1g Accuracy", "Tempered Glass", "Auto-Off", "Tare Function"],
  },
  {
    id: "thermal-smart-mug",
    name: "Thermal Smart Mug",
    price: 3800,
    description: "Keep your beverages at the perfect temperature for hours. Built-in temperature control and app connectivity let you customize your drinking experience.",
    shortDescription: "Temperature-controlled smart mug with app",
    images: [
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&h=600&fit=crop",
    ],
    category: "Drinkware",
    rating: 4.7,
    reviewCount: 156,
    colors: ["Matte Black", "White", "Navy"],
    inStock: true,
    features: ["App Control", "4hr Battery", "LED Display", "Wireless Charging"],
  },
  {
    id: "aero-blend-mixer",
    name: "AeroBlend Mixer",
    price: 7500,
    originalPrice: 9500,
    description: "Professional-grade blending power in a compact design. The AeroBlend features a vacuum blending system that preserves nutrients and reduces oxidation.",
    shortDescription: "Vacuum blending system for nutrient-rich smoothies",
    images: [
      "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1622480916113-9000ac49b79d?w=600&h=600&fit=crop",
    ],
    category: "Blenders",
    rating: 4.9,
    reviewCount: 312,
    badge: "Top Rated",
    colors: ["Silver", "Matte Black"],
    inStock: true,
    features: ["Vacuum Blend", "1200W Motor", "Self-Cleaning", "6 Programs"],
  },
  {
    id: "smart-herb-garden",
    name: "Smart Herb Garden",
    price: 5200,
    description: "Grow fresh herbs year-round with this intelligent indoor garden. Automated watering, LED grow lights, and app monitoring ensure perfect growth every time.",
    shortDescription: "Indoor smart garden with automated care",
    images: [
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&h=600&fit=crop",
    ],
    category: "Garden",
    rating: 4.5,
    reviewCount: 98,
    badge: "New",
    inStock: true,
    features: ["Auto-Watering", "LED Grow Lights", "App Monitor", "6 Pod Capacity"],
  },
  {
    id: "ceramic-knife-set",
    name: "Ceramic Knife Set",
    price: 6800,
    originalPrice: 8500,
    description: "Ultra-sharp ceramic blades that stay sharp 10x longer than steel. Lightweight, non-reactive, and perfectly balanced for effortless cutting.",
    shortDescription: "Premium 6-piece ceramic knife collection",
    images: [
      "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1566454825481-9c31bd88e0e8?w=600&h=600&fit=crop",
    ],
    category: "Knives",
    rating: 4.7,
    reviewCount: 267,
    badge: "Best Seller",
    colors: ["White", "Black"],
    inStock: true,
    features: ["6 Pieces", "Ceramic Blades", "Ergonomic Grip", "Knife Block"],
  },
];

export const categories = [
  "All",
  "Choppers",
  "Blenders",
  "Knives",
  "Drinkware",
  "Measurement",
  "Garden",
];

export const testimonials = [
  {
    id: 1,
    name: "Sarah Ahmed",
    role: "Home Chef",
    content: "RapidKitch products have completely transformed my kitchen. The Smart Chopper Pro saves me 30 minutes every day!",
    rating: 5,
    avatar: "SA",
  },
  {
    id: 2,
    name: "Ali Hassan",
    role: "Food Blogger",
    content: "I've tried dozens of kitchen brands, and RapidKitch stands out for quality and design. Every product feels premium.",
    rating: 5,
    avatar: "AH",
  },
  {
    id: 3,
    name: "Fatima Khan",
    role: "Restaurant Owner",
    content: "The AeroBlend Mixer is a game-changer. My smoothie bar customers can taste the difference in quality.",
    rating: 5,
    avatar: "FK",
  },
  {
    id: 4,
    name: "Usman Malik",
    role: "Tech Enthusiast",
    content: "The Smart Herb Garden is brilliant. Fresh basil and mint right on my countertop, with zero effort.",
    rating: 4,
    avatar: "UM",
  },
];

export const faqs = [
  {
    question: "What is your shipping policy?",
    answer: "We offer free shipping on all orders above PKR 3,000. Standard delivery takes 3-5 business days across Pakistan. Express delivery is available for PKR 300 with 1-2 day delivery.",
  },
  {
    question: "Do you offer Cash on Delivery?",
    answer: "Yes! We offer Cash on Delivery (COD) across Pakistan. You can also pay via credit/debit card, bank transfer, or JazzCash/EasyPaisa.",
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day hassle-free return policy. If you're not satisfied with your purchase, simply contact our support team and we'll arrange a pickup and full refund.",
  },
  {
    question: "Are your products covered by warranty?",
    answer: "All RapidKitch products come with a 1-year manufacturer warranty. Premium products include an extended 2-year warranty at no additional cost.",
  },
  {
    question: "How do I track my order?",
    answer: "Once your order is shipped, you'll receive a tracking number via SMS and email. You can also track your order in real-time through your account dashboard.",
  },
  {
    question: "Do you ship internationally?",
    answer: "Currently, we ship within Pakistan. International shipping to UAE, UK, and US is coming soon. Sign up for our newsletter to be notified!",
  },
];
