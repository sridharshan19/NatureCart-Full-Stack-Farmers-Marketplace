import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import Loader from "../components/common/Loader";
import { useToast } from "../components/common/ToastProvider";
import { createFarmerByAdmin, getFarmers } from "../services/authService";
import {
  createProduct,
  deleteManagedProduct,
  getManagedProducts,
  updateManagedProduct,
} from "../services/productService";
import { getFarmerOrders } from "../services/orderService";
import { API_BASE_URL } from "../services/api";
import {
  formatCurrency,
  getErrorMessage,
  getStoredUser,
  validateRequiredFields,
} from "../utils/helpers";

const emptyFarmerForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  farmName: "",
  location: "",
};

const emptyProductForm = {
  productName: "",
  category: "",
  price: "",
  quantity: "",
  unit: "kg",
  image: null,
  imageUrl: "",
  farmerId: "",
};

const CATEGORY_PRESETS = [
  "Vegetables",
  "Fruits",
  "Dry Fruits",
  "Organic Dairy",
  "Grains & Cereals",
  "Honey & Preserves",
  "Spices & Herbs",
  "Leafy Greens",
  "Nuts & Seeds",
];

const UNIT_PRESETS = [
  { label: "kg (Kilogram)", value: "kg" },
  { label: "litre (Litre)", value: "litre" },
  { label: "500g (500 Grams)", value: "500g" },
  { label: "bunch (Bunch)", value: "bunch" },
  { label: "dozen (Dozen)", value: "dozen" },
  { label: "box (Box / Pack)", value: "box" },
  { label: "piece (Per Piece)", value: "piece" },
];

const ONLINE_PRODUCE_GALLERY = [
  // Dry Fruits
  { id: "dates", name: "Medjool Dates", category: "Dry Fruits", url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80" },
  { id: "raisins", name: "Golden Raisins (Kishmish)", category: "Dry Fruits", url: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80" },
  { id: "black-raisins", name: "Black Seedless Raisins", category: "Dry Fruits", url: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=600&q=80" },
  { id: "figs", name: "Dried Figs (Anjeer)", category: "Dry Fruits", url: "https://images.unsplash.com/photo-1608797178974-15b35a64057b?auto=format&fit=crop&w=600&q=80" },
  { id: "apricots", name: "Dried Apricots", category: "Dry Fruits", url: "https://images.unsplash.com/photo-1595123550441-d377e017de6a?auto=format&fit=crop&w=600&q=80" },
  { id: "cranberries", name: "Dried Cranberries", category: "Dry Fruits", url: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=600&q=80" },
  { id: "prunes", name: "Dried Prunes (Plums)", category: "Dry Fruits", url: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=600&q=80" },

  // Fresh Fruits
  { id: "apple", name: "Red Apples", category: "Fruits", url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80" },
  { id: "green-apple", name: "Green Apples", category: "Fruits", url: "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&w=600&q=80" },
  { id: "banana", name: "Yellow Bananas", category: "Fruits", url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80" },
  { id: "orange", name: "Juicy Oranges", category: "Fruits", url: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=600&q=80" },
  { id: "strawberry", name: "Fresh Strawberries", category: "Fruits", url: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80" },
  { id: "grapes", name: "Red Grapes", category: "Fruits", url: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=600&q=80" },
  { id: "green-grapes", name: "Green Seedless Grapes", category: "Fruits", url: "https://images.unsplash.com/photo-1596368708356-6e1e1025ee72?auto=format&fit=crop&w=600&q=80" },
  { id: "mango", name: "Sweet Mangoes", category: "Fruits", url: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80" },
  { id: "watermelon", name: "Fresh Watermelon", category: "Fruits", url: "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=600&q=80" },
  { id: "muskmelon", name: "Muskmelon / Cantaloupe", category: "Fruits", url: "https://images.unsplash.com/photo-1591784918731-0df8549646b9?auto=format&fit=crop&w=600&q=80" },
  { id: "lemon", name: "Fresh Lemons", category: "Fruits", url: "https://images.unsplash.com/photo-1534531141161-e4928950fb85?auto=format&fit=crop&w=600&q=80" },
  { id: "lime", name: "Green Limes", category: "Fruits", url: "https://images.unsplash.com/photo-1590502593163-e8437651de3c?auto=format&fit=crop&w=600&q=80" },
  { id: "peach", name: "Juicy Peaches", category: "Fruits", url: "https://images.unsplash.com/photo-1595123550441-d377e017de6a?auto=format&fit=crop&w=600&q=80" },
  { id: "pineapple", name: "Ripe Pineapple", category: "Fruits", url: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80" },
  { id: "papaya", name: "Fresh Papaya", category: "Fruits", url: "https://images.unsplash.com/photo-1517260739337-6799d239ce83?auto=format&fit=crop&w=600&q=80" },
  { id: "guava", name: "Organic Green Guava", category: "Fruits", url: "https://images.unsplash.com/photo-1536511135882-7efc9006fa10?auto=format&fit=crop&w=600&q=80" },
  { id: "avocado", name: "Fresh Avocados", category: "Fruits", url: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80" },
  { id: "kiwi", name: "Organic Kiwis", category: "Fruits", url: "https://images.unsplash.com/photo-1585059819682-f11c86a34d71?auto=format&fit=crop&w=600&q=80" },
  { id: "blueberry", name: "Fresh Blueberries", category: "Fruits", url: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=600&q=80" },
  { id: "raspberry", name: "Red Raspberries", category: "Fruits", url: "https://images.unsplash.com/photo-1577069861033-55d04ace4ef0?auto=format&fit=crop&w=600&q=80" },
  { id: "blackberry", name: "Fresh Blackberries", category: "Fruits", url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80" },
  { id: "pomegranate", name: "Pomegranates", category: "Fruits", url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80" },
  { id: "dragonfruit", name: "Pink Dragonfruit", category: "Fruits", url: "https://images.unsplash.com/photo-1527325678964-549216468488?auto=format&fit=crop&w=600&q=80" },
  { id: "coconut", name: "Fresh Tender Coconut", category: "Fruits", url: "https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&w=600&q=80" },

  // Vegetables
  { id: "tomato", name: "Organic Tomatoes", category: "Vegetables", url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80" },
  { id: "cherry-tomato", name: "Cherry Tomatoes", category: "Vegetables", url: "https://images.unsplash.com/photo-1561136594-7f68413baa99?auto=format&fit=crop&w=600&q=80" },
  { id: "carrot", name: "Crisp Carrots", category: "Vegetables", url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80" },
  { id: "potato", name: "Farm Potatoes", category: "Vegetables", url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80" },
  { id: "sweet-potato", name: "Sweet Potatoes", category: "Vegetables", url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80" },
  { id: "broccoli", name: "Fresh Broccoli", category: "Vegetables", url: "https://images.unsplash.com/photo-1459411621453-7b03166349b9?auto=format&fit=crop&w=600&q=80" },
  { id: "onion", name: "Red Onions", category: "Vegetables", url: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?auto=format&fit=crop&w=600&q=80" },
  { id: "white-onion", name: "White Onions", category: "Vegetables", url: "https://images.unsplash.com/photo-1580148485250-0c5f516a8d67?auto=format&fit=crop&w=600&q=80" },
  { id: "bell-pepper", name: "Red Bell Peppers", category: "Vegetables", url: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80" },
  { id: "green-pepper", name: "Green Bell Peppers", category: "Vegetables", url: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=600&q=80" },
  { id: "yellow-pepper", name: "Yellow Bell Peppers", category: "Vegetables", url: "https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=600&q=80" },
  { id: "cucumber", name: "Crisp Cucumbers", category: "Vegetables", url: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=600&q=80" },
  { id: "cauliflower", name: "White Cauliflower", category: "Vegetables", url: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=600&q=80" },
  { id: "pumpkin", name: "Organic Pumpkins", category: "Vegetables", url: "https://images.unsplash.com/photo-1506917728037-b6af01a7d403?auto=format&fit=crop&w=600&q=80" },
  { id: "eggplant", name: "Fresh Eggplants / Brinjal", category: "Vegetables", url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80" },
  { id: "ginger", name: "Fresh Ginger Root", category: "Vegetables", url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80" },
  { id: "peas", name: "Green Garden Peas", category: "Vegetables", url: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=600&q=80" },
  { id: "mushroom", name: "Button Mushrooms", category: "Vegetables", url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80" },
  { id: "beetroot", name: "Fresh Beetroots", category: "Vegetables", url: "https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?auto=format&fit=crop&w=600&q=80" },
  { id: "radish", name: "Fresh White Radish", category: "Vegetables", url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80" },
  { id: "chili", name: "Red Chili Peppers", category: "Vegetables", url: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80" },
  { id: "green-chili", name: "Spicy Green Chilies", category: "Vegetables", url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80" },

  // Leafy Greens
  { id: "spinach", name: "Garden Spinach (Palak)", category: "Leafy Greens", url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80" },
  { id: "lettuce", name: "Green Crisp Lettuce", category: "Leafy Greens", url: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=600&q=80" },
  { id: "cabbage", name: "Green Cabbage", category: "Leafy Greens", url: "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=600&q=80" },
  { id: "coriander", name: "Fresh Cilantro/Coriander", category: "Leafy Greens", url: "https://images.unsplash.com/photo-1608797178974-15b35a64057b?auto=format&fit=crop&w=600&q=80" },
  { id: "mint", name: "Fresh Mint Leaves (Pudina)", category: "Leafy Greens", url: "https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=600&q=80" },
  { id: "methi", name: "Methi Leaves (Fenugreek)", category: "Leafy Greens", url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80" },
  { id: "curry-leaves", name: "Fresh Curry Leaves", category: "Leafy Greens", url: "https://images.unsplash.com/photo-1608797178974-15b35a64057b?auto=format&fit=crop&w=600&q=80" },
  { id: "spring-onion", name: "Spring Onions", category: "Leafy Greens", url: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?auto=format&fit=crop&w=600&q=80" },
  { id: "kale", name: "Organic Green Kale", category: "Leafy Greens", url: "https://images.unsplash.com/photo-1524179091875-bf98a9a6ae67?auto=format&fit=crop&w=600&q=80" },

  // Dairy & Honey
  { id: "milk", name: "Farm Whole Milk", category: "Organic Dairy", url: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80" },
  { id: "butter", name: "Organic Farm Butter", category: "Organic Dairy", url: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80" },
  { id: "ghee", name: "Pure Desi Ghee", category: "Organic Dairy", url: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80" },
  { id: "cheese", name: "Artisanal Cheese", category: "Organic Dairy", url: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=600&q=80" },
  { id: "paneer", name: "Fresh Cottage Cheese (Paneer)", category: "Organic Dairy", url: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80" },
  { id: "yogurt", name: "Fresh Farm Yogurt", category: "Organic Dairy", url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80" },
  { id: "honey", name: "Pure Raw Honey", category: "Honey & Preserves", url: "https://images.unsplash.com/photo-1587049352847-81a56d773cae?auto=format&fit=crop&w=600&q=80" },
  { id: "jam", name: "Fruit Preserves & Jam", category: "Honey & Preserves", url: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80" },

  // Grains & Cereals
  { id: "corn", name: "Sweet Corn Cob", category: "Grains & Cereals", url: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80" },
  { id: "wheat", name: "Whole Wheat Grains", category: "Grains & Cereals", url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80" },
  { id: "atta", name: "Whole Wheat Flour (Atta)", category: "Grains & Cereals", url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80" },
  { id: "rice", name: "White Basmati Rice", category: "Grains & Cereals", url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80" },
  { id: "brown-rice", name: "Whole Grain Brown Rice", category: "Grains & Cereals", url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80" },
  { id: "bajra", name: "Pearl Millet (Bajra)", category: "Grains & Cereals", url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80" },
  { id: "ragi", name: "Finger Millet (Ragi)", category: "Grains & Cereals", url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80" },
  { id: "oats", name: "Organic Rolled Oats", category: "Grains & Cereals", url: "https://images.unsplash.com/photo-1517093747-380236a2d9a3?auto=format&fit=crop&w=600&q=80" },
  { id: "quinoa", name: "White Quinoa Seeds", category: "Grains & Cereals", url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80" },
  { id: "barley", name: "Organic Barley Grains", category: "Grains & Cereals", url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80" },

  // Spices & Herbs
  { id: "garlic", name: "Organic Garlic Bulbs", category: "Spices & Herbs", url: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=600&q=80" },
  { id: "basil", name: "Fresh Sweet Basil", category: "Spices & Herbs", url: "https://images.unsplash.com/photo-1608797178974-15b35a64057b?auto=format&fit=crop&w=600&q=80" },
  { id: "turmeric", name: "Turmeric Powder", category: "Spices & Herbs", url: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80" },
  { id: "cinnamon", name: "Cinnamon Sticks", category: "Spices & Herbs", url: "https://images.unsplash.com/photo-1509358271058-acd05cc93898?auto=format&fit=crop&w=600&q=80" },
  { id: "cumin", name: "Cumin Seeds (Jeera)", category: "Spices & Herbs", url: "https://images.unsplash.com/photo-1509358271058-acd05cc93898?auto=format&fit=crop&w=600&q=80" },
  { id: "mustard-seeds", name: "Black Mustard Seeds (Rai)", category: "Spices & Herbs", url: "https://images.unsplash.com/photo-1509358271058-acd05cc93898?auto=format&fit=crop&w=600&q=80" },
  { id: "black-pepper", name: "Whole Peppercorns", category: "Spices & Herbs", url: "https://images.unsplash.com/photo-1509358271058-acd05cc93898?auto=format&fit=crop&w=600&q=80" },
  { id: "cardamom", name: "Green Cardamom Pods", category: "Spices & Herbs", url: "https://images.unsplash.com/photo-1509358271058-acd05cc93898?auto=format&fit=crop&w=600&q=80" },
  { id: "cloves", name: "Whole Cloves (Laung)", category: "Spices & Herbs", url: "https://images.unsplash.com/photo-1509358271058-acd05cc93898?auto=format&fit=crop&w=600&q=80" },
  { id: "coriander-seeds", name: "Coriander Seeds (Dhania)", category: "Spices & Herbs", url: "https://images.unsplash.com/photo-1509358271058-acd05cc93898?auto=format&fit=crop&w=600&q=80" },

  // Nuts & Seeds
  { id: "almonds", name: "Raw Organic Almonds", category: "Nuts & Seeds", url: "https://images.unsplash.com/photo-1508061252966-dfd30f67ea55?auto=format&fit=crop&w=600&q=80" },
  { id: "walnut", name: "Shelled Walnuts", category: "Nuts & Seeds", url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80" },
  { id: "cashew", name: "Raw Cashew Nuts", category: "Nuts & Seeds", url: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=600&q=80" },
  { id: "pista", name: "Pistachio Nuts (Pista)", category: "Nuts & Seeds", url: "https://images.unsplash.com/photo-1508061252966-dfd30f67ea55?auto=format&fit=crop&w=600&q=80" },
  { id: "sunflower-seed", name: "Sunflower Seeds", category: "Nuts & Seeds", url: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=600&q=80" },
  { id: "pumpkin-seed", name: "Raw Pumpkin Seeds", category: "Nuts & Seeds", url: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=600&q=80" },
  { id: "chia-seeds", name: "Organic Chia Seeds", category: "Nuts & Seeds", url: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=600&q=80" },
  { id: "flax-seeds", name: "Flax Seeds (Alsi)", category: "Nuts & Seeds", url: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=600&q=80" },
  { id: "sesame-seeds", name: "White Sesame Seeds (Til)", category: "Nuts & Seeds", url: "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=600&q=80" },
];

export default function Dashboard() {
  const user = getStoredUser();
  const userId = user?._id || user?.id || "";
  const userRole = user?.role || "";
  const isAdmin = userRole === "admin";
  const isFarmer = userRole === "farmer";
  const isConsumer = userRole === "consumer";

  const [farmers, setFarmers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [farmerForm, setFarmerForm] = useState(emptyFarmerForm);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [imageMode, setImageMode] = useState("upload");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [editingProductId, setEditingProductId] = useState("");
  const [imageSearchQuery, setImageSearchQuery] = useState("");
  const [inventorySearch, setInventorySearch] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { showError, showInfo, showSuccess } = useToast();

  const filteredGalleryImages = useMemo(() => {
    if (!imageSearchQuery.trim()) return ONLINE_PRODUCE_GALLERY;
    const q = imageSearchQuery.toLowerCase().trim();
    return ONLINE_PRODUCE_GALLERY.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [imageSearchQuery]);

  const inventorySummary = useMemo(() => {
    let totalValuation = 0;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    products.forEach((p) => {
      const qty = Number(p.quantity || 0);
      const price = Number(p.price || 0);
      totalValuation += qty * price;

      if (qty <= 0) outOfStock += 1;
      else if (qty < 5) lowStock += 1;
      else inStock += 1;
    });

    return {
      total: products.length,
      inStock,
      lowStock,
      outOfStock,
      valuation: totalValuation,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = inventorySearch.toLowerCase().trim();
      const nameMatch =
        !q ||
        p.productName?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q);

      const catMatch = categoryFilter === "all" || p.category === categoryFilter;

      const qty = Number(p.quantity || 0);
      let stockMatch = true;
      if (stockStatusFilter === "instock") stockMatch = qty > 0;
      else if (stockStatusFilter === "lowstock") stockMatch = qty > 0 && qty < 5;
      else if (stockStatusFilter === "outofstock") stockMatch = qty <= 0;

      return nameMatch && catMatch && stockMatch;
    });
  }, [products, inventorySearch, stockStatusFilter, categoryFilter]);

  const loadDashboard = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      if (isAdmin) {
        const [farmerData, productData, orderData] = await Promise.all([
          getFarmers(),
          getManagedProducts(),
          getFarmerOrders(),
        ]);
        setFarmers(Array.isArray(farmerData) ? farmerData : []);
        setProducts(productData);
        setOrders(orderData);
      } else if (isFarmer) {
        const [productData, orderData] = await Promise.all([
          getManagedProducts(),
          getFarmerOrders(),
        ]);
        setFarmers([]);
        setProducts(productData);
        setOrders(orderData);
      } else {
        setFarmers([]);
        setProducts([]);
        setOrders([]);
      }
    } catch (error) {
      showError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [userId, isAdmin, isFarmer, showError]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const orderSummary = useMemo(() => {
    return orders.reduce(
      (accumulator, order) => {
        accumulator.total += 1;
        accumulator[order.status] += 1;
        return accumulator;
      },
      { total: 0, pending: 0, confirmed: 0, completed: 0 }
    );
  }, [orders]);

  const handleImageFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showError("Please upload an image file (JPG, PNG, WEBP).");
      return;
    }
    setProductForm((current) => ({ ...current, image: file }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleFarmerSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateRequiredFields([
      { label: "Farmer name", value: farmerForm.name },
      { label: "Farmer email", value: farmerForm.email },
      { label: "Farmer password", value: farmerForm.password },
      { label: "Phone", value: farmerForm.phone },
      { label: "Farm name", value: farmerForm.farmName },
      { label: "Location", value: farmerForm.location },
    ]);

    if (validationMessage) {
      showError(validationMessage);
      return;
    }

    try {
      await createFarmerByAdmin(farmerForm);
      showSuccess("New farmer account created successfully.");
      setFarmerForm(emptyFarmerForm);
      await loadDashboard();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();

    const hasImage = Boolean(productForm.image || productForm.imageUrl || editingProductId);
    if (!hasImage) {
      showError("Please upload a produce image or select a photo from the gallery.");
      return;
    }

    const validationFields = [
      { label: "Product name", value: productForm.productName },
      { label: "Category", value: productForm.category },
      { label: "Price", value: productForm.price },
      { label: "Quantity", value: productForm.quantity },
    ];

    if (isAdmin) {
      validationFields.unshift({ label: "Farmer", value: productForm.farmerId });
    }

    const validationMessage = validateRequiredFields(validationFields);

    if (validationMessage) {
      showError(validationMessage);
      return;
    }

    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        quantity: Number(productForm.quantity),
      };

      if (!isAdmin) {
        delete payload.farmerId;
      }

      if (editingProductId) {
        const updatedProduct = await updateManagedProduct(editingProductId, payload);
        showSuccess(
          `${updatedProduct.productName} stock details were updated in MongoDB successfully.`
        );
      } else {
        const createdProduct = await createProduct(payload);
        showSuccess(`${createdProduct.productName} was created successfully.`);
      }

      setProductForm((current) => ({
        ...emptyProductForm,
        farmerId: isAdmin ? current.farmerId : "",
      }));
      setIsCustomCategory(false);
      setImagePreview(null);
      setEditingProductId("");
      await loadDashboard();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteManagedProduct(productId);
      showSuccess("Product deleted successfully.");
      await loadDashboard();
    } catch (error) {
      showError(getErrorMessage(error));
    }
  };

  const handleEditProduct = (product) => {
    setEditingProductId(product._id);
    const existingCat = product.category || "";
    const isPreset = CATEGORY_PRESETS.includes(existingCat);

    setIsCustomCategory(!isPreset && Boolean(existingCat));
    setProductForm({
      productName: product.productName || "",
      category: existingCat,
      price: String(product.price ?? ""),
      quantity: String(product.quantity ?? ""),
      unit: product.unit || "kg",
      image: null,
      imageUrl: typeof product.image === "string" && product.image.startsWith("http") ? product.image : "",
      farmerId:
        typeof product.farmerId === "object" ? product.farmerId?._id || "" : product.farmerId || "",
    });
    setImagePreview(null);
    showInfo(`Editing ${product.productName}. Update fields and save changes.`);
  };

  const handleCancelEdit = () => {
    setEditingProductId("");
    setIsCustomCategory(false);
    setImagePreview(null);
    setProductForm(emptyProductForm);
  };

  if (!user) {
    return (
      <div className="rounded-[2rem] bg-white/85 p-8 shadow-xl backdrop-blur">
        <h1 className="text-3xl font-bold text-slate-900">Welcome to NatureCart</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Login to open your role dashboard. Admin can create farmers and manage
          products and orders, farmers can manage their catalog, and consumers can
          shop and checkout.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            to="/login"
            className="rounded-full bg-[#0f766e] px-5 py-3 font-semibold text-white"
          >
            Login
          </Link>
          <Link
            to="/products"
            className="rounded-full border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700"
          >
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  const heroThemeClass = isFarmer
    ? "hero-farmer"
    : isAdmin
    ? "hero-admin"
    : "hero-consumer";

  return (
    <div className="space-y-6">
      <section className={`${heroThemeClass} p-8`}>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur">
            {isFarmer ? "🌾 Farmer Portal" : isAdmin ? "🛡️ Admin Operations" : "🛒 Consumer Hub"}
          </span>
        </div>
        <h1 className="mt-3 text-4xl font-bold font-serif">
          {isConsumer
            ? "Your NatureCart Dashboard"
            : isFarmer
              ? "Farmer Harvest & Inventory Center"
              : "Marketplace Operations Console"}
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-white/90 leading-6">
          {isConsumer
            ? "Manage your active shopping baskets, coordinate collection dates, and track live order progress directly with farmers."
            : isFarmer
              ? "List your fresh crops, set unit pricing, manage inventory stock, and track customer pickup orders."
              : "Oversee verified farm partners, maintain marketplace produce directory, and review analytics."}
        </p>
      </section>

      {loading ? <Loader label="Loading workspace..." /> : null}

      {!loading && isConsumer ? (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 shadow border border-emerald-100">
              <p className="text-xs uppercase tracking-wider font-semibold text-emerald-700">Browse</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">Available Products</p>
              <p className="mt-2 text-sm text-slate-600">
                Explore fresh produce added by verified farmers.
              </p>
              <Link
                to="/products"
                className="mt-4 inline-block rounded-full bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white"
              >
                View Products
              </Link>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow border border-amber-100">
              <p className="text-xs uppercase tracking-wider font-semibold text-amber-700">Cart</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">Ready to Order</p>
              <p className="mt-2 text-sm text-slate-600">
                Review selected items before placing your pickup order.
              </p>
              <Link
                to="/cart"
                className="mt-4 inline-block rounded-full bg-[#b45309] px-4 py-2 text-sm font-semibold text-white"
              >
                Open Cart
              </Link>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow border border-slate-200">
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Track</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">Order Status</p>
              <p className="mt-2 text-sm text-slate-600">
                Follow pending, confirmed, and completed pickup updates.
              </p>
              <Link
                to="/orders"
                className="mt-4 inline-block rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800"
              >
                Track Orders
              </Link>
            </div>
          </section>
        </>
      ) : null}

      {!loading && !isConsumer ? (
        <>
          <section
            className={`grid gap-4 ${
              isFarmer ? "md:grid-cols-3 xl:grid-cols-5" : "md:grid-cols-4"
            }`}
          >
            <div className="rounded-2xl bg-white p-5 shadow border border-slate-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Orders</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{orderSummary.total}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow border border-amber-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Pending</p>
              <p className="mt-2 text-3xl font-bold text-amber-600">{orderSummary.pending}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow border border-sky-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-600">Confirmed</p>
              <p className="mt-2 text-3xl font-bold text-sky-600">{orderSummary.confirmed}</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow border border-emerald-100">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Completed</p>
              <p className="mt-2 text-3xl font-bold text-emerald-600">{orderSummary.completed}</p>
            </div>
            {isFarmer ? (
              <div className="rounded-2xl bg-white p-5 shadow border border-amber-100">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Earnings</p>
                <p className="mt-1 text-lg font-bold text-amber-800">Income Ledger</p>
                <Link
                  to="/income"
                  className="mt-2 inline-block rounded-full bg-amber-700 hover:bg-amber-800 px-3.5 py-1.5 text-xs font-bold text-white shadow"
                >
                  View Earnings →
                </Link>
              </div>
            ) : null}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">
            {isAdmin ? (
              <div className="rounded-[1.75rem] bg-white p-6 shadow-xl border border-slate-100">
                <div className="mb-5">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-teal-700">
                    Admin control
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900 font-serif">
                    Add a new farmer
                  </h2>
                </div>

                <form onSubmit={handleFarmerSubmit} className="grid gap-3 md:grid-cols-2">
                  <Input
                    placeholder="Name"
                    value={farmerForm.name}
                    onChange={(event) =>
                      setFarmerForm((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={farmerForm.email}
                    onChange={(event) =>
                      setFarmerForm((current) => ({ ...current, email: event.target.value }))
                    }
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={farmerForm.password}
                    onChange={(event) =>
                      setFarmerForm((current) => ({ ...current, password: event.target.value }))
                    }
                  />
                  <Input
                    placeholder="Phone"
                    value={farmerForm.phone}
                    onChange={(event) =>
                      setFarmerForm((current) => ({ ...current, phone: event.target.value }))
                    }
                  />
                  <Input
                    placeholder="Farm Name"
                    value={farmerForm.farmName}
                    onChange={(event) =>
                      setFarmerForm((current) => ({ ...current, farmName: event.target.value }))
                    }
                  />
                  <Input
                    placeholder="Location"
                    value={farmerForm.location}
                    onChange={(event) =>
                      setFarmerForm((current) => ({ ...current, location: event.target.value }))
                    }
                  />
                  <Button className="md:col-span-2 bg-[#0f766e]" type="submit">
                    Create Farmer Account
                  </Button>
                </form>
              </div>
            ) : null}

            {/* Produce Inventory Manager Section */}
            <div className="surface-panel p-6 border border-white/80">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-700">
                    Inventory Manager
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950 font-serif">
                    {editingProductId
                      ? "Update produce listing"
                      : isAdmin
                        ? "Add product for any farmer"
                        : "List New Produce Harvest"}
                  </h2>
                </div>
                <Link
                  to="/orders"
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                >
                  View Orders
                </Link>
              </div>

              <form onSubmit={handleProductSubmit} className="grid gap-4 md:grid-cols-2">
                {isAdmin ? (
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Select Target Farmer
                    </label>
                    <select
                      value={productForm.farmerId}
                      onChange={(event) =>
                        setProductForm((current) => ({ ...current, farmerId: event.target.value }))
                      }
                      className="select-field"
                      required
                    >
                      <option value="">Choose farm account...</option>
                      {farmers.map((farmer) => (
                        <option key={farmer._id} value={farmer._id}>
                          🌾 {farmer.farmName || farmer.name} ({farmer.email})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                {/* Product Name */}
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Product Name
                  </label>
                  <Input
                    placeholder="e.g. Organic Carrots, Fresh Tomatoes"
                    value={productForm.productName}
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        productName: event.target.value,
                      }))
                    }
                    required
                  />
                </div>

                {/* Category Dragbox / Dropdown */}
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Category (Dragbox Dropdown)
                  </label>
                  <select
                    value={isCustomCategory ? "custom" : productForm.category}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "custom") {
                        setIsCustomCategory(true);
                        setProductForm((curr) => ({ ...curr, category: "" }));
                      } else {
                        setIsCustomCategory(false);
                        setProductForm((curr) => ({ ...curr, category: val }));
                      }
                    }}
                    className="select-field font-semibold"
                    required={!isCustomCategory}
                  >
                    <option value="">Select produce category...</option>
                    {CATEGORY_PRESETS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="custom">✏️ Custom Category...</option>
                  </select>
                </div>

                {/* Custom Category Input if selected */}
                {isCustomCategory && (
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-amber-800">
                      Specify Custom Category
                    </label>
                    <Input
                      placeholder="Enter custom category name..."
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm((curr) => ({ ...curr, category: e.target.value }))
                      }
                      required
                    />
                  </div>
                )}

                {/* Price */}
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Unit Price (Rs.)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 45"
                    value={productForm.price}
                    onChange={(event) =>
                      setProductForm((current) => ({ ...current, price: event.target.value }))
                    }
                    required
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Available Stock
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g. 100"
                    value={productForm.quantity}
                    onChange={(event) =>
                      setProductForm((current) => ({ ...current, quantity: event.target.value }))
                    }
                    required
                  />
                </div>

                {/* Measurement Unit */}
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Pricing Unit (e.g. kg, litre)
                  </label>
                  <select
                    value={productForm.unit}
                    onChange={(e) =>
                      setProductForm((curr) => ({ ...curr, unit: e.target.value }))
                    }
                    className="select-field font-semibold"
                    required
                  >
                    {UNIT_PRESETS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Produce Image Section with Upload / Online URL Mode Switcher */}
                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Product Image
                    </label>
                    <div className="flex rounded-full bg-slate-100 p-0.5 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setImageMode("upload")}
                        className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                          imageMode === "upload"
                            ? "bg-amber-700 text-white shadow"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        📁 File Upload / Drag & Drop
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageMode("url")}
                        className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                          imageMode === "url"
                            ? "bg-amber-700 text-white shadow"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        🖼️ Online Photo Gallery
                      </button>
                    </div>
                  </div>

                  {imageMode === "upload" ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`drag-drop-zone ${isDragOver ? "active" : ""}`}
                    >
                      <input
                        type="file"
                        id="image-file-input"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFileSelect(e.target.files?.[0])}
                      />

                      {imagePreview ? (
                        <div className="flex items-center gap-4 text-left w-full">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-20 w-20 rounded-xl object-cover border border-slate-200 shadow"
                          />
                          <div className="flex-1">
                            <p className="text-xs font-bold text-emerald-800">✓ Image Loaded Successfully</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">
                              {productForm.image?.name || "Selected product image"}
                            </p>
                            <label
                              htmlFor="image-file-input"
                              className="mt-2 inline-block rounded-full bg-slate-200 hover:bg-slate-300 px-3 py-1 text-[10px] font-bold text-slate-800 cursor-pointer transition"
                            >
                              Change Image
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label htmlFor="image-file-input" className="w-full cursor-pointer">
                          <span className="text-3xl">📸</span>
                          <p className="mt-2 text-sm font-bold text-slate-800">
                            Drag & Drop Produce Image Here
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            or <span className="text-amber-700 underline font-semibold">browse computer files</span> (JPG, PNG, WEBP up to 5MB)
                          </p>
                        </label>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-[#fffaf4] p-4">
                      {/* Search Bar */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            🔍 Search Produce Photo Gallery
                          </label>
                          <span className="text-[11px] font-bold text-amber-700">
                            {filteredGalleryImages.length} Produce Photos Available
                          </span>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                            🔍
                          </span>
                          <Input
                            type="text"
                            placeholder="Type to search photo (e.g. Tomato, Carrot, Milk, Honey, Apple, Green)..."
                            value={imageSearchQuery}
                            onChange={(e) => setImageSearchQuery(e.target.value)}
                            className="pl-9 pr-8 bg-white border-slate-300 font-medium text-xs"
                          />
                          {imageSearchQuery ? (
                            <button
                              type="button"
                              onClick={() => setImageSearchQuery("")}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700"
                            >
                              ✕
                            </button>
                          ) : null}
                        </div>
                      </div>

                      {/* Produce Thumbnail Gallery Grid */}
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                          Click a photo to select & auto-fill URL:
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
                          {filteredGalleryImages.map((img) => {
                            const isSelected = productForm.imageUrl === img.url;
                            return (
                              <button
                                key={img.id}
                                type="button"
                                onClick={() =>
                                  setProductForm((curr) => ({ ...curr, imageUrl: img.url }))
                                }
                                className={`group relative flex flex-col items-center overflow-hidden rounded-xl border p-1.5 transition text-left ${
                                  isSelected
                                    ? "border-emerald-600 bg-emerald-50 ring-2 ring-emerald-400 shadow-md"
                                    : "border-slate-200 bg-white hover:border-amber-500 hover:bg-amber-50/60"
                                }`}
                              >
                                <img
                                  src={img.url}
                                  alt={img.name}
                                  className="h-16 w-full object-cover rounded-lg transition duration-300 group-hover:scale-105"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80";
                                  }}
                                />
                                <div className="mt-1 w-full flex items-center justify-between text-[11px]">
                                  <span className="font-bold text-slate-800 truncate">{img.name}</span>
                                  {isSelected ? (
                                    <span className="text-[10px] font-black text-emerald-700 shrink-0">✓</span>
                                  ) : null}
                                </div>
                              </button>
                            );
                          })}

                          {!filteredGalleryImages.length ? (
                            <div className="col-span-full py-4 text-center text-xs text-slate-500">
                              No produce photos match &quot;{imageSearchQuery}&quot;. Clear search to view all farm photos.
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* Selected Produce Photo Live Preview */}
                      {productForm.imageUrl ? (
                        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200">
                          <div className="flex items-center gap-3">
                            <img
                              src={productForm.imageUrl}
                              alt="Online Preview"
                              className="h-16 w-16 rounded-xl object-cover border-2 border-emerald-500 shadow-md"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80";
                              }}
                            />
                            <div>
                              <p className="text-xs font-bold text-emerald-800">✓ Selected Produce Photo</p>
                              <p className="text-[11px] text-slate-500 font-medium">
                                Ready to publish with listing
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setProductForm((curr) => ({ ...curr, imageUrl: "" }))}
                            className="rounded-full bg-slate-200 hover:bg-rose-100 hover:text-rose-700 px-3 py-1 text-xs font-bold text-slate-700 transition"
                          >
                            Unselect
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
                  <Button className="bg-[#b45309] hover:bg-[#92400e]" type="submit">
                    {editingProductId ? "Save Updated Product" : "Publish Product Listing"}
                  </Button>
                  {editingProductId ? (
                    <Button
                      type="button"
                      onClick={handleCancelEdit}
                      className="bg-slate-200 text-slate-800 hover:bg-slate-300"
                    >
                      Cancel Edit
                    </Button>
                  ) : null}
                </div>
              </form>
            </div>
          </section>

          {/* Executive Inventory Metrics Overview */}
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl bg-white p-5 shadow border border-slate-100">
              <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">Catalog Produce</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{inventorySummary.total}</p>
              <p className="text-[11px] text-slate-400 mt-1">Total listed produce items</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow border border-emerald-100">
              <p className="text-xs uppercase tracking-wider font-semibold text-emerald-700">In-Stock Produce</p>
              <p className="mt-2 text-3xl font-bold text-emerald-700">{inventorySummary.inStock}</p>
              <p className="text-[11px] text-emerald-600 mt-1">Ready for pickup ordering</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow border border-amber-100">
              <p className="text-xs uppercase tracking-wider font-semibold text-amber-700">Low Stock Alert</p>
              <p className="mt-2 text-3xl font-bold text-amber-700">{inventorySummary.lowStock}</p>
              <p className="text-[11px] text-amber-600 mt-1">&lt; 5 units remaining</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow border border-rose-100">
              <p className="text-xs uppercase tracking-wider font-semibold text-rose-700">Out of Stock</p>
              <p className="mt-2 text-3xl font-bold text-rose-700">{inventorySummary.outOfStock}</p>
              <p className="text-[11px] text-rose-600 mt-1">Restock recommended</p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow border border-teal-100">
              <p className="text-xs uppercase tracking-wider font-semibold text-teal-800">Inventory Valuation</p>
              <p className="mt-2 text-2xl font-black text-teal-800">{formatCurrency(inventorySummary.valuation)}</p>
              <p className="text-[11px] text-teal-600 mt-1">Total active stock worth</p>
            </div>
          </section>

          {/* Managed Products List */}
          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="surface-panel p-6 border border-white/80 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                    Product Catalog Manager
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900 font-serif">
                    Live Farm Inventory ({filteredProducts.length})
                  </h2>
                </div>
                <Button onClick={loadDashboard} className="bg-slate-100 text-slate-800 hover:bg-slate-200 text-xs">
                  Refresh List
                </Button>
              </div>

              {/* Inventory Search & Filters Toolbar */}
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
                <div className="flex flex-col gap-2.5 sm:flex-row">
                  {/* Search input */}
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                      🔍
                    </span>
                    <Input
                      type="text"
                      placeholder="Search produce by name, category, or farm..."
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                      className="pl-8 text-xs bg-white border-slate-300"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none"
                  >
                    <option value="all">All Categories ({CATEGORY_PRESETS.length})</option>
                    {CATEGORY_PRESETS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stock Status Filter Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1">
                    Filter Stock:
                  </span>
                  <button
                    type="button"
                    onClick={() => setStockStatusFilter("all")}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold transition ${
                      stockStatusFilter === "all"
                        ? "bg-slate-800 text-white"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    All ({products.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockStatusFilter("instock")}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold transition ${
                      stockStatusFilter === "instock"
                        ? "bg-emerald-700 text-white"
                        : "bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50"
                    }`}
                  >
                    In Stock ({inventorySummary.inStock})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockStatusFilter("lowstock")}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold transition ${
                      stockStatusFilter === "lowstock"
                        ? "bg-amber-600 text-white"
                        : "bg-white text-amber-800 border border-amber-200 hover:bg-amber-50"
                    }`}
                  >
                    Low Stock ({inventorySummary.lowStock})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStockStatusFilter("outofstock")}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold transition ${
                      stockStatusFilter === "outofstock"
                        ? "bg-rose-700 text-white"
                        : "bg-white text-rose-800 border border-rose-200 hover:bg-rose-50"
                    }`}
                  >
                    Out of Stock ({inventorySummary.outOfStock})
                  </button>
                </div>
              </div>

              {/* Product Cards List */}
              <div className="space-y-3">
                {filteredProducts.map((product) => {
                  const qty = Number(product.quantity || 0);
                  const isOut = qty <= 0;
                  const isLow = qty > 0 && qty < 5;

                  return (
                    <div
                      key={product._id}
                      className={`flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between transition ${
                        editingProductId === product._id
                          ? "border-amber-400 bg-amber-50/90 ring-2 ring-amber-300"
                          : "border-slate-100 bg-slate-50/70 hover:bg-slate-100/90"
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        {product.image ? (
                          <img
                            src={
                              product.image.startsWith("http")
                                ? product.image
                                : `${API_BASE_URL}${product.image}`
                            }
                            alt={product.productName}
                            className="h-14 w-14 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80";
                            }}
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-xl bg-amber-100 flex items-center justify-center text-xl shrink-0">
                            🌾
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-base">{product.productName}</h3>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                isOut
                                  ? "bg-rose-100 text-rose-800"
                                  : isLow
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {isOut ? "Out of Stock" : isLow ? `Only ${qty} left` : "In Stock"}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 mt-1">
                            <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                              {product.category || "Produce"}
                            </span>{" "}
                            • <strong className="text-slate-900 font-extrabold">{formatCurrency(product.price)}</strong> / {product.unit || "kg"}{" "}
                            • <span className="font-bold text-slate-800">{qty} {product.unit || "kg"} in stock</span>
                          </p>

                          {product.farmerId ? (
                            <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700 mt-1">
                              🌾 Farm: {typeof product.farmerId === "object" ? product.farmerId.farmName || product.farmerId.name : "Local Farm"}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <Button
                          onClick={() => handleEditProduct(product)}
                          className={`${
                            editingProductId === product._id
                              ? "bg-amber-700 hover:bg-amber-800 text-xs"
                              : "bg-teal-700 hover:bg-teal-800 text-xs"
                          }`}
                        >
                          {editingProductId === product._id ? "Editing..." : "✏️ Edit"}
                        </Button>
                        <Button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="bg-rose-600 hover:bg-rose-700 text-xs"
                        >
                          🗑️ Delete
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {!filteredProducts.length ? (
                  <div className="rounded-2xl bg-slate-50 p-8 text-center space-y-2">
                    <p className="text-base font-bold text-slate-800">No matching produce items found</p>
                    <p className="text-xs text-slate-500">
                      Try clearing search keywords or switching stock status filters.
                    </p>
                    <Button
                      onClick={() => {
                        setInventorySearch("");
                        setCategoryFilter("all");
                        setStockStatusFilter("all");
                      }}
                      className="bg-slate-200 text-slate-800 hover:bg-slate-300 text-xs"
                    >
                      Clear Search Filters
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>

            {isAdmin ? (
              <div className="surface-panel p-6 border border-white/80">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                  Registered Farmers
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900 font-serif">
                  Active Farm Accounts
                </h2>
                <div className="mt-5 space-y-3">
                  {farmers.map((farmer) => (
                    <div key={farmer._id} className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                      <p className="font-bold text-slate-900">
                        🌾 {farmer.farmName || farmer.name}
                      </p>
                      <p className="text-sm text-slate-500">{farmer.email}</p>
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mt-1">
                        📍 {farmer.location || "Location pending"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </>
      ) : null}
    </div>
  );
}

