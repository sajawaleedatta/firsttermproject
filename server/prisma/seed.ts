import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const IMG = {
  laptop: "https://m.media-amazon.com/images/I/51wGgAfe7gL._AC_SR290,290_.jpg",
  macbookpro: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDNzSy9Bg3UqFK-48gMmfgZqOK2cKvWsPw1SLdw_JRur0wrJWCvx8jupE&s=10",
  macbookair: "https://ennap.com/cdn/shop/files/Apple-MacBook-Air-13-inch-with-M4-ChipStorage-Capacity-16GB-RAM-256GBColor-Sky-BlueKeyboard-Language-Arabic-English.jpg?v=1781530380&width=1946",
  dellxps15: "https://m.media-amazon.com/images/I/717Lo8oZaAL._AC_UF894,1000_QL80_.jpg",
  dellxps13: "https://assets.kenzz.com/products/594207/002_9310i71132512.jpeg",
  thinkpadx1: "https://m.media-amazon.com/images/I/61QKxtyUlEL.jpg",
  thinkpadt14: "https://m.media-amazon.com/images/I/614l2vb2KQL._AC_UF894,1000_QL80_.jpg",
  hpspectre: "https://eg.jumia.is/unsafe/fit-in/500x500/filters:fill(white)/product/17/7898421/1.jpg?2749",
  asusrog: "https://m.media-amazon.com/images/I/61PouaE9IaL.jpg",
  surfacelaptop: "https://m.media-amazon.com/images/I/71pDCy+VUiL._AC_UF894,1000_QL80_.jpg",
  acerswift: "https://m.media-amazon.com/images/I/71bJQNUjkzL.jpg",
  tablet: "https://image.made-in-china.com/365f3j00lwbIfYyEOgUh/Android-Tablet-PC-RAM-8GB-ROM-256GB-10-9-Inch-HD-Screen-Flat-Computer.webp",
  firemax11: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQW9V5yXTO3plyYB3dbOojSp1FInVU0lIuWWMJPrBC14Q&s=10",
  surfacego4: "https://m.media-amazon.com/images/I/516rcf+fIKL._AC_UF894,1000_QL80_.jpg",
  surfacepro10: "https://www.circuits.com.eg/wp-content/uploads/2026/04/19809_MSFT-Surface-Pro-10-for-Business-Video-hero-Tablet-2-scaled_1500sq.webp",
  taba9plus: "https://f.nooncdn.com/p/pzsku/Z9758D6962E5B09946B54Z/45/_/1772091404/98b61b33-8150-4d31-aaa7-ffcd6640c418.jpg?width=1200",
  tabs10plus: "https://images.samsung.com/is/image/samsung/p6pim/ae_ar/sm-x826bzaamea/gallery/ae-ar-galaxy-tab-s10-plus-sm-x820-523800-sm-x826bzaamea-543636689?$720_576_JPG$",
  iphone: "https://darlingretail.com/cdn/shop/files/iPhone_15_Blue_Pure_Back_iPhone_15_Blue_Pure_Front_2up_Screen__WWEN_800x.jpg?v=1695103868",
  iphone1: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3kP6tGvmyjivaSlQVEpY92mbpoIliHsw9cn8S7ezR5ZmRD939qNr_WlY&s=10",
  iphone2: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwXAOjpF_OKWi40RjrkXpqNMcTKGZlaO8gaNJsKvvTMg&s=10",
  iphone3: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc4e2aKehJFAzqnUP-gYQm_5pN2E8keuavYFLdBN4DYQ3MRehUh1CNoIBQ&s=10",
  mobile: "https://images-eu.ssl-images-amazon.com/images/I/61ABQGtBraL._AC_UL375_SR375,375_.jpg",
  oneplus: "https://smartkoshk.com/cdn/shop/files/OnePlus-13s-5G-Egypt-1.png?v=1779392758&width=1900",
  nothing: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3b1aAnmkY_VOUJyEg_g2zrJiAE3JaWikf3AvdNDUhvA&s=10",
  pixel10: "https://cdn.shortpixel.ai/spai/q_glossy+ret_img+to_webp/mobizil.com/wp-content/uploads/2025/08/Google-Pixel-10-1.jpg",
  pixel10pro: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzo9sClvjWM97LcIv6gSdTAM5oz8PVOahrfOD2vE9gNg&s=10",
  s25ultra: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwq1MgqAsaqM7qsvbNmlBu7EwYbqEpVq9rFM7X5pm_uZEZSVQlKtLJrqo&s=10",
  s25plus: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqb63AToX-qnPYjMmGv8ctCbXFGOsuqqpNF4h5NxwU94OeFWmjHIciQO1B&s=10",
  fitbit3: "https://m.media-amazon.com/images/I/41DGphQYrNL._AC_UF894,1000_QL80_.jpg",
  garminVenu4: "https://m.media-amazon.com/images/I/61qLetCsMkL.jpg",
  garminFenix8: "https://m.media-amazon.com/images/I/51xgC9xNqdL._AC_UF894,1000_QL80_.jpg",
  samsungWatchFE: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFpJpiBgqO9N43JooXgVYyL_oFjeIIOL4YAn5CSKWqWA&s=10",
  samsungWatch7: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjOR9Ll2Y63gJxg79p6e6fE_iKwftYw7KmNFPb77mzXVulxVmarPhnpPL3&s=10",
  samsungWatch7Ultra: "https://m.media-amazon.com/images/I/81i1Vn-KQuL.jpg",
  appleWatchSE3: "https://m.media-amazon.com/images/I/61xkvg-RStL._AC_UF894,1000_QL80_.jpg",
  appleWatchSeries10: "https://alsheikhstores.com/cdn/shop/files/Al_Sheikh_Stores_Apple_Watch_Series_10_Silver.webp?v=1782563794",
  appleWatchUltra3: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSC63QioZbsLIHgGEmj_0zxRNhrrKaZ0QPX2w609oC2Tw&s",
};

function img(category: string, name: string): string[] {
  const n = name.toLowerCase();
  if (n.includes("iphone")) {
    if (n.includes("pro max")) return [IMG.iphone1];
    if (n.includes("pro")) return [IMG.iphone2];
    if (n.includes("plus")) return [IMG.iphone3];
    return [IMG.iphone];
  }
  if (n.includes("oneplus")) return [IMG.oneplus];
  if (n.includes("nothing")) return [IMG.nothing];
  if (n.includes("pixel") && n.includes("pro")) return [IMG.pixel10pro];
  if (n.includes("pixel")) return [IMG.pixel10];
  if (n.includes("samsung") && n.includes("ultra") && !n.includes("watch")) return [IMG.s25ultra];
  if (n.includes("samsung") && n.includes("s25+")) return [IMG.s25plus];
  const cat = category.toLowerCase();
  if (cat === "laptops") {
    if (n.includes("macbook") && n.includes("pro")) return [IMG.macbookpro];
    if (n.includes("macbook") && n.includes("air")) return [IMG.macbookair];
    if (n.includes("xps") && n.includes("15")) return [IMG.dellxps15];
    if (n.includes("xps") && n.includes("13")) return [IMG.dellxps13];
    if (n.includes("thinkpad") && n.includes("x1")) return [IMG.thinkpadx1];
    if (n.includes("thinkpad") && n.includes("t14")) return [IMG.thinkpadt14];
    if (n.includes("hp") && n.includes("spectre")) return [IMG.hpspectre];
    if (n.includes("asus") && n.includes("rog")) return [IMG.asusrog];
    if (n.includes("surface") && n.includes("laptop")) return [IMG.surfacelaptop];
    if (n.includes("acer")) return [IMG.acerswift];
    return [IMG.laptop];
  }
  if (cat === "tablets") {
    if (n.includes("fire")) return [IMG.firemax11];
    if (n.includes("surface") && n.includes("go")) return [IMG.surfacego4];
    if (n.includes("surface") && n.includes("pro")) return [IMG.surfacepro10];
    if (n.includes("tab a9")) return [IMG.taba9plus];
    if (n.includes("tab s10+")) return [IMG.tabs10plus];
    return [IMG.tablet];
  }
  if (cat === "smart watches") {
    if (n.includes("ultra 3")) return [IMG.appleWatchUltra3];
    if (n.includes("series 10")) return [IMG.appleWatchSeries10];
    if (n.includes("se 3")) return [IMG.appleWatchSE3];
    if (n.includes("watch 7 ultra")) return [IMG.samsungWatch7Ultra];
    if (n.includes("watch 7")) return [IMG.samsungWatch7];
    if (n.includes("watch fe")) return [IMG.samsungWatchFE];
    if (n.includes("fenix 8")) return [IMG.garminFenix8];
    if (n.includes("venu 4")) return [IMG.garminVenu4];
    if (n.includes("fitbit")) return [IMG.fitbit3];
    if (n.includes("apple")) return [IMG.appleWatchSE3];
    if (n.includes("samsung")) return [IMG.samsungWatch7];
    if (n.includes("garmin")) return [IMG.garminVenu4];
    return [IMG.fitbit3];
  }
  return [IMG.mobile];
}

async function main() {
  const password = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@ecommence.com" },
    update: {},
    create: {
      email: "admin@ecommence.com",
      name: "Admin User",
      password,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: "customer@ecommence.com" },
    update: {},
    create: {
      email: "customer@ecommence.com",
      name: "Jane Customer",
      password,
      role: Role.CUSTOMER,
    },
  });

  const productsData = [
    // Laptops
    { name: "MacBook Pro 16", description: "Apple M3 Pro chip with 12-core CPU and 18-core GPU, 18GB unified memory, 512GB SSD, 16.2-inch Liquid Retina XDR display with 1600 nits peak, HDMI 2.1, SDXC slot, Thunderbolt 4, MagSafe 3, up to 22hr battery, Space Black finish.", price: 2499.99, category: "Laptops", stock: 15, tags: ["macbook","laptop"] },
    { name: "MacBook Air 15", description: "Apple M3 chip with 8-core CPU and 10-core GPU, 16GB unified memory, 256GB SSD, 15.3-inch Liquid Retina display with 500 nits, 1080p FaceTime HD camera, MagSafe charging, two Thunderbolt 4 ports, up to 18hr battery, fanless design in Midnight, Starlight, Space Gray, Silver.", price: 1499.99, category: "Laptops", stock: 22, tags: ["macbook","laptop"] },
    { name: "Dell XPS 15", description: "Intel Core i7-13700H (14-core), 16GB DDR5 RAM, 512GB SSD, 15.6-inch 3.5K OLED InfiniteEdge touch display, NVIDIA GeForce RTX 4060, Thunderbolt 4, SD card reader, slim aluminum chassis with CNC machined palm rest, Wi-Fi 6E, 86Wh battery.", price: 1899.99, category: "Laptops", stock: 20, tags: ["dell","xps","laptop"] },
    { name: "Dell XPS 13", description: "Intel Core i5-1340P (12-core), 8GB LPDDR5 RAM, 256GB SSD, 13.4-inch FHD+ InfinityEdge display, Intel Iris Xe graphics, Thunderbolt 4, Wi-Fi 6E, ultra-portable 2.6lb design, 51Wh battery, precision touchpad, backlit keyboard.", price: 1299.99, category: "Laptops", stock: 18, tags: ["dell","xps","laptop"] },
    { name: "ThinkPad X1 Carbon Gen 12", description: "Intel Core Ultra 7 155H, 16GB LPDDR5x RAM, 512GB PCIe Gen 4 SSD, 14-inch 2.8K OLED 120Hz display with 100% DCI-P3, MIL-STD-810H durability, 4G LTE + 5G ready, Thunderbolt 4, HDMI 2.1, 57Wh battery, 2.42lb carbon fiber body, TrackPoint + haptic touchpad.", price: 1699.99, category: "Laptops", stock: 10, tags: ["thinkpad","laptop"] },
    { name: "ThinkPad T14s", description: "AMD Ryzen 7 PRO 7840U, 16GB LPDDR5x RAM, 512GB PCIe Gen 4 SSD, 14-inch FHD 400-nit display, MIL-STD-810H certified, Thunderbolt 4, HDMI 2.1, Wi-Fi 6E, 57Wh battery, fingerprint reader, IR camera, premium business laptop with TPM 2.0 security.", price: 1399.99, category: "Laptops", stock: 12, tags: ["thinkpad","laptop"] },
    { name: "HP Spectre x360 16", description: "Intel Core i7-13700H, 16GB LPDDR4x RAM, 1TB PCIe SSD, 16-inch 3K+ OLED touch 2-in-1 display with 100% DCI-P3, Intel Iris Xe, Thunderbolt 4, HP Pen included, 83Wh battery, 4-cell long life, premium gem-cut design in Nightfall Black, 1080p IR camera, Wi-Fi 6E.", price: 1699.99, category: "Laptops", stock: 8, tags: ["hp","spectre","laptop"] },
    { name: "ASUS ROG Zephyrus G14", description: "AMD Ryzen 9 7940HS, 32GB DDR5 RAM, 1TB PCIe 4.0 SSD, 14-inch QHD 165Hz Nebula display, NVIDIA GeForce RTX 4070 8GB, ROG Intelligent Cooling with liquid metal, 76Wh battery, Dolby Atmos speakers, AniMe Matrix LED on lid, 3.3lb light yet powerful gaming machine.", price: 1999.99, category: "Laptops", stock: 6, tags: ["asus","rog","laptop"] },
    { name: "Microsoft Surface Laptop 6", description: "Intel Core Ultra 7 165H, 16GB LPDDR5x RAM, 512GB SSD, 15-inch PixelSense Flow 120Hz touchscreen with 2496x1664 resolution, Windows 11, Thunderbolt 4, 1080p webcam with Windows Studio Effects, 58Wh battery, Alcantara palm rest, 3.68lb premium ultrabook.", price: 1599.99, category: "Laptops", stock: 14, tags: ["microsoft","surface","laptop"] },
    { name: "Acer Swift Go 14", description: "Intel Core i5-13500H, 16GB LPDDR5 RAM, 512GB PCIe 4.0 SSD, 14-inch 2.8K OLED 120Hz display with 100% DCI-P3, Intel Iris Xe graphics, Thunderbolt 4, HDMI 2.1, Wi-Fi 6E, 1440p QHD webcam with AI noise reduction, 65Wh battery, 2.76lb lightweight aluminum design.", price: 899.99, category: "Laptops", stock: 25, tags: ["acer","swift","laptop"] },

    // Tablets
    { name: "iPad Pro 12.9 M4", description: "Apple M4 chip with 10-core CPU, 256GB storage, 12.9-inch Liquid Retina XDR display with 1600 nits peak, Thunderbolt 4, Face ID, 12MP rear + 12MP ultrawide front camera, Wi-Fi 6E + Cellular 5G, all-day battery, Apple Pencil Pro support.", price: 1299.99, category: "Tablets", stock: 25, tags: ["ipad","pro","tablet"] },
    { name: "iPad Pro 11 M4", description: "Apple M4 chip with 10-core CPU, 128GB storage, 11-inch Ultra Retina XDR display with tandem OLED, Thunderbolt 4, Face ID, 12MP rear camera with LiDAR, Wi-Fi 6E, ultra-thin 5.3mm design, Apple Pencil Pro and Magic Keyboard compatible.", price: 999.99, category: "Tablets", stock: 30, tags: ["ipad","pro","tablet"] },
    { name: "iPad Air 13 M3", description: "Apple M3 chip with 8-core CPU, 128GB storage, 13-inch Liquid Retina display with P3 wide color, Touch ID, 12MP wide camera, landscape 12MP FaceTime HD camera, USB-C with Thunderbolt, Wi-Fi 6E, Apple Pencil Pro and Magic Keyboard support.", price: 799.99, category: "Tablets", stock: 20, tags: ["ipad","air","tablet"] },
    { name: "iPad 10th Gen", description: "A14 Bionic chip, 64GB storage, 10.9-inch Liquid Retina display, Touch ID in top button, 12MP wide camera, 12MP landscape ultrawide front camera, USB-C, Wi-Fi 6, Bluetooth 5.3, available in blue, pink, yellow, and silver.", price: 449.99, category: "Tablets", stock: 35, tags: ["ipad","tablet"] },
    { name: "Samsung Galaxy Tab S10 Ultra", description: "Snapdragon 8 Gen 3 for Galaxy, 256GB storage, 14.6-inch Dynamic AMOLED 2X 120Hz display, 11200mAh battery, IP68 water resistance, AKG-tuned quad speakers, S Pen included, 13MP + 8MP dual rear cameras, 12MP + 12MP dual front, DeX mode, 5G + Wi-Fi 7.", price: 1199.99, category: "Tablets", stock: 18, tags: ["samsung","galaxy","tab","tablet"] },
    { name: "Samsung Galaxy Tab S10+", description: "Snapdragon 8 Gen 3 for Galaxy, 256GB storage, 12.4-inch Dynamic AMOLED 2X 120Hz display, 10090mAh battery with 45W fast charging, IP68, AKG quad speakers with Dolby Atmos, S Pen included, 13MP + 6MP rear cameras, 12MP ultrawide front, Samsung DeX, Wi-Fi 7.", price: 999.99, category: "Tablets", stock: 22, tags: ["samsung","galaxy","tab","tablet"] },
    { name: "Samsung Galaxy Tab A9+", description: "Snapdragon 695 processor, 64GB storage (expandable up to 1TB via microSD), 11-inch TFT LCD 90Hz display, 7040mAh battery, quad speakers with Dolby Atmos, 8MP rear + 5MP front camera, slim metal design, multitasking with split screen, ideal budget tablet for entertainment.", price: 299.99, category: "Tablets", stock: 40, tags: ["samsung","galaxy","tab","tablet"] },
    { name: "Microsoft Surface Pro 10", description: "Intel Core Ultra 7 processor, 16GB RAM, 512GB SSD, 13-inch PixelSense Flow 120Hz touchscreen with 2880x1920 resolution, Windows 11 Pro, Thunderbolt 4 ports, 10MP rear + 5MP front camera with Windows Hello, removable SSD, 14hr battery life, compatible with Surface Slim Pen 2.", price: 1499.99, category: "Tablets", stock: 12, tags: ["microsoft","surface","pro","tablet"] },
    { name: "Microsoft Surface Go 4", description: "Intel N200 processor, 8GB RAM, 128GB SSD, 10.5-inch PixelSense 1920x1280 touchscreen, Windows 11, USB-C, 8MP rear camera with autofocus, 5MP front camera with Windows Hello, 1.2lb light design, microSD card reader, perfect for students and on-the-go productivity.", price: 599.99, category: "Tablets", stock: 16, tags: ["microsoft","surface","go","tablet"] },
    { name: "Amazon Fire Max 11", description: "MediaTek MT8188J octa-core processor, 64GB storage (expandable up to 1TB), 11-inch FHD 2000x1200 display, 4GB RAM, 13MP rear + 8MP front camera, dual speakers with Dolby Atmos, Alexa hands-free, USB-C, up to 14 hours battery, includes 6 months of Amazon Kids+ and 1 year of Microsoft 365 Personal.", price: 249.99, category: "Tablets", stock: 50, tags: ["amazon","fire","tablet"] },

    // Mobile
    { name: "iPhone 16 Pro Max", description: "A18 Pro chip with 6-core GPU, 256GB storage, 6.9-inch Super Retina XDR OLED with 120Hz ProMotion, titanium design, 48MP Fusion camera system with 5x telephoto, USB-C 3.0, 33hr video playback, Apple Intelligence ready.", price: 1199.99, category: "Mobile", stock: 30, tags: ["iphone","16","pro","max"] },
    { name: "iPhone 16 Pro", description: "A18 Pro chip with 6-core GPU, 128GB storage, 6.3-inch Super Retina XDR OLED with 120Hz ProMotion, lightweight titanium frame, 48MP main + 12MP telephoto 3x, Action Button, Camera Control, USB-C, 27hr video playback.", price: 999.99, category: "Mobile", stock: 35, tags: ["iphone","16","pro"] },
    { name: "iPhone 16 Plus", description: "A18 chip with 5-core GPU, 128GB storage, 6.7-inch Super Retina XDR OLED, durable aluminum design, 48MP dual-camera system with advanced computational photography, USB-C, 27hr video playback, vibrant colors in pink, teal, and ultramarine.", price: 899.99, category: "Mobile", stock: 28, tags: ["iphone","16","plus"] },
    { name: "iPhone 16", description: "A18 chip with 5-core GPU, 128GB storage, 6.1-inch Super Retina XDR OLED, colorful aluminum design, 48MP dual-camera system, Camera Control button, USB-C, Action Button, 22hr video playback, perfect everyday flagship.", price: 799.99, category: "Mobile", stock: 40, tags: ["iphone","16"] },
    { name: "Samsung Galaxy S25 Ultra", description: "Snapdragon 8 Elite for Galaxy, 256GB storage, 6.9-inch Dynamic AMOLED 2X 120Hz, 200MP main camera with AI zoom, S Pen built-in, 5000mAh battery, titanium frame, 7 years of OS updates, Galaxy AI features.", price: 1299.99, category: "Mobile", stock: 22, tags: ["samsung","galaxy","s25","ultra"] },
    { name: "Samsung Galaxy S25+", description: "Snapdragon 8 Elite for Galaxy, 256GB storage, 6.7-inch Dynamic AMOLED 2X 120Hz display, 50MP triple camera, 4900mAh battery with 45W fast charging, aluminum frame, Galaxy AI, Wi-Fi 7, UWB support.", price: 999.99, category: "Mobile", stock: 25, tags: ["samsung","galaxy","s25","plus"] },
    { name: "Google Pixel 10 Pro", description: "Google Tensor G5 chip, 256GB storage, 6.7-inch LTPO OLED 120Hz, 50MP main + 48MP telephoto + 48MP ultrawide, 7 years of OS updates, AI-powered photo editing, 5050mAh battery, VPN by Google One included.", price: 999.99, category: "Mobile", stock: 14, tags: ["google","pixel","10","pro"] },
    { name: "Google Pixel 10", description: "Google Tensor G5 chip, 128GB storage, 6.3-inch OLED 120Hz Actua display, 50MP main + 13MP ultrawide, AI Magic Editor and Best Take, 4700mAh battery, 7 years of feature drops, IP68 water resistance.", price: 699.99, category: "Mobile", stock: 20, tags: ["google","pixel","10"] },
    { name: "OnePlus 13", description: "Snapdragon 8 Elite, 256GB storage, 6.8-inch LTPO AMOLED 120Hz with 4500 nits peak, Hasselblad-tuned triple 50MP cameras, 6000mAh battery with 100W SUPERVOOC, IP69 certification, Aqua Touch display, alert slider returns.", price: 899.99, category: "Mobile", stock: 18, tags: ["oneplus","13"] },
    { name: "Nothing Phone 3", description: "Snapdragon 8s Gen 3, 256GB storage, 6.7-inch LTPO AMOLED 120Hz, Glyph Interface with 33 customizable LED zones, 50MP dual camera, 5000mAh battery, Nothing OS 3 with 3 years of updates, transparent glass design with recycled aluminum frame.", price: 599.99, category: "Mobile", stock: 16, tags: ["nothing","phone","3"] },

    // Smart Watches
    { name: "Apple Watch Ultra 3", description: "49mm titanium case with flat sapphire crystal, dual-frequency GPS, 86dB siren, action button, dive computer, 36hr battery life, precision dual-frequency GPS, works from -20C to 55C.", price: 799.99, category: "Smart Watches", stock: 8, tags: ["apple","watch","ultra"] },
    { name: "Apple Watch Series 10", description: "46mm aluminum case with Ion-X glass, S10 SiP with 64-bit dual-core processor, LTPO OLED always-on display, blood oxygen and ECG sensors, temperature sensing, crash detection, fast charging.", price: 429.99, category: "Smart Watches", stock: 20, tags: ["apple","watch","series"] },
    { name: "Apple Watch SE 3", description: "44mm aluminum case with S9 SiP chip, fitness tracking with enhanced workout metrics, fall and crash detection, sleep stages tracking, Family Setup support, 18hr battery, retina display.", price: 279.99, category: "Smart Watches", stock: 25, tags: ["apple","watch","se"] },
    { name: "Samsung Galaxy Watch 7 Ultra", description: "47mm titanium case with sapphire crystal, 3nm Exynos W1000 chip, 590mAh battery, dual-frequency GPS, 10ATM+IP68, BioActive sensor, sleep apnea detection, Wear OS 5 with One UI 6.", price: 649.99, category: "Smart Watches", stock: 10, tags: ["samsung","galaxy","watch","ultra"] },
    { name: "Samsung Galaxy Watch 7", description: "44mm aluminum case, 3nm Exynos W1000 processor, BioActive sensor (heart rate, ECG, BIA), Wear OS 5, 425mAh battery, sapphire crystal, sleep coaching, stress tracking, IP68.", price: 349.99, category: "Smart Watches", stock: 16, tags: ["samsung","galaxy","watch"] },
    { name: "Samsung Galaxy Watch FE", description: "40mm aluminum compact design, Exynos W920 chip, BioActive sensor for heart rate and sleep tracking, Wear OS 4, 247mAh battery, 5ATM + IP68, lightweight at just 26g, ideal daily companion.", price: 199.99, category: "Smart Watches", stock: 30, tags: ["samsung","galaxy","watch","fe"] },
    { name: "Garmin Fenix 8 Solar", description: "47mm titanium bezel with Power Sapphire solar lens, multiband GPS, preloaded topo maps, LED flashlight, solar charging for unlimited battery, dive rating 10ATM, rugged outdoors adventure watch.", price: 999.99, category: "Smart Watches", stock: 5, tags: ["garmin","fenix","watch"] },
    { name: "Garmin Venu 4", description: "45mm AMOLED always-on display, GPS with multi-band GNSS, Body Battery energy monitoring, advanced sleep tracking, health snapshot, 200+ workout modes, music storage, 14-day battery, smart notifications.", price: 449.99, category: "Smart Watches", stock: 12, tags: ["garmin","venu","watch"] },
    { name: "Fitbit Sense 3", description: "Advanced health smartwatch with ECG app, EDA stress sensor, SpO2 tracking, skin temperature sensor, built-in GPS, 6+ days battery life, Google apps integration, sleep score, and stress management tools.", price: 329.99, category: "Smart Watches", stock: 15, tags: ["fitbit","sense","watch"] },
    { name: "Google Pixel Watch 4", description: "45mm circular design with 3D Corning Gorilla Glass, Wear OS 5 with Pixel Integration, Fitbit deep health tracking, ECG and SpO2, 420mAh battery, 30% faster charging, seamless Google Assistant and Home control.", price: 399.99, category: "Smart Watches", stock: 14, tags: ["google","pixel","watch"] },
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { id: p.name.replace(/\s+/g, "-").toLowerCase() },
      update: {
        description: p.description,
        price: p.price,
        category: p.category,
        stock: p.stock,
        images: img(p.category, p.name),
        rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
        reviewCount: Math.floor(Math.random() * 80) + 5,
      },
      create: {
        id: p.name.replace(/\s+/g, "-").toLowerCase(),
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        stock: p.stock,
        images: img(p.category, p.name),
        userId: admin.id,
        rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
        reviewCount: Math.floor(Math.random() * 80) + 5,
      },
    });
  }

  console.log("Seed data created successfully");
  console.log(`Admin: admin@ecommence.com / password123`);
  console.log(`Customer: customer@ecommence.com / password123`);
  console.log(`Total products: ${productsData.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
