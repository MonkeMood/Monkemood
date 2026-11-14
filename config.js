/* ------------------------------------------------------------------
   SARU site config. Edit this file, commit, done.
   ------------------------------------------------------------------ */
window.SARU_CONFIG = {
  ticker: "$SARU",
  chain: "Solana",

  // Contract address. Leave "" until launch. As soon as you paste it:
  //  - the CA box shows it + the copy button works
  //  - every "Buy" button turns on and points at pump.fun
  ca: "",

  // Optional: override the buy link (otherwise https://pump.fun/coin/<ca> is used)
  buyUrl: "",

  // Socials
  x: "https://x.com/SaruHQ",
  telegram: "",       // e.g. "https://t.me/yourgroup"  (leave "" to hide)

  // GitHub repo that holds this site + the sticker vault, "owner/repo".
  // Used for the "Add your sticker" section and for the optional live
  // auto-listing of the stickers/ folder (see README).
  github: "",         // e.g. "saruhq/saru"

  // Tokenomics numbers shown on the site (edit to match your launch)
  supply: "1,000,000,000",
  tax: "0%"
};
