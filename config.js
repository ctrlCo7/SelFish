// Shopify is the source of truth. Edit here only.
window.SF_CONFIG = {
  storeUrl: "https://selfandfish.com",
  // Optional: Storefront API public access token (Shopify admin > Apps > Develop apps).
  // Leave empty to read the store's public /products.json feed instead.
  storefrontToken: "",
  storefrontApiVersion: "2025-01",
  // Handles of the products to feature, in order.
  featuredHandles: ["self-fish-journal", "digital-product", "self-fish-signature-keychain", "self-fish-accessories"],
  // Last-known data from selfandfish.com, used ONLY if the live fetch fails.
  fallbackProducts: [
    { handle: "self-fish-journal", title: "SELF+FISH Journal", price: "30.00", available: true,
      image: "https://selfandfish.com/cdn/shop/files/AF2ABCC3-BEC3-4A3E-AF01-26A5CBEC23AA.png" },
    { handle: "digital-product", title: "SELF+FISH: The Audio Journal", price: "19.99", available: true,
      image: "https://selfandfish.com/cdn/shop/files/2391968F-2911-4149-9BD7-2FB9F6707A1B.png" },
    { handle: "self-fish-signature-keychain", title: "SELF+FISH Signature Keychain", price: "10.00", available: false,
      image: "https://selfandfish.com/cdn/shop/files/0B89A827-7D6C-4CEA-8D1A-D34D16B7D9E7.png" },
    { handle: "self-fish-accessories", title: "SELF+FISH Tote", price: "15.00", available: false,
      image: "https://selfandfish.com/cdn/shop/files/4540CBF6-DF08-4D09-AB73-8FBBF9A5EA1F.png" }
  ],
  // Weekly video: paste a YouTube/Vimeo embed URL, or leave empty for the placeholder.
  videoEmbedUrl: "",
  // Local video file (Pexels, free to use). Used when videoEmbedUrl is empty.
  videoFile: "assets/videos/video-of-the-week.mp4",
  // No verified social links were found on the store. Add them here when confirmed.
  social: [] // e.g. [{ label: "Instagram", url: "https://..." }]
};
