// Minecraft-style splash text shown below the logo on the Home page.
// Picks a weighted-random entry from SPLASH_TEXTS on mount.
// Fades out when the logo is dragged far (body.logo-drag-far) or when
// the screensaver activates (body.screensaver-active) — both signalled
// via CSS class on document.body so no prop threading is needed.
import "./SplashText.css";

// ---------------------------------------------------------------------------
// Weighted splash text pool.
// Higher weight = more likely to appear. Weights are relative, not percent.
// ---------------------------------------------------------------------------

/*

*/

const SPLASH_TEXTS = [

  // --- Common ---
  { text: "Better on PC !", weight: 6 },
  { text: "Heavily Into Birds !", weight: 6 },
  { text: "Buy 100 Commissions Get Your 1001st Free !", weight: 5 },
  { text: "Worm on a string ! 🪱", weight: 6 },
  { text: "Made by a Devteam of Learned Doctors", weight: 5 },
  { text: "Wait for it ...", weight: 5 },
  { text: "8)", weight: 5 },
  { text: "As Seen on YouTube !", weight: 5 },
  { text: "Rate 5 Stars !", weight: 5 },
  { text: "God Knows When ...", weight: 5 },
  { text: "Go Read Yotsuba&!", weight: 4 },
  { text: "Keep it Real", weight: 4 },
  { text: "Cool It , Mister ...", weight: 4 },
  { text: "Music by Neveraom !", weight: 4 },
  { text: "Coded by evbg !", weight: 4 },
  { text: "It’s Got Some Chew To It !", weight: 4 },
  { text: "Click the Logo !", weight: 4 },
  { text: "GET BACK HERE SHOCKER !!", weight: 3 },
  { text: "I Can't Let You Get Close ...", weight: 3 },
  { text: "See You , Space Cowboy ! ", weight: 3 },
  { text: "Stay Curious", weight: 3 },
  { text: "Heavily Versed in Esoteric Wisdom and Lore", weight: 3 },
  { text: "First rule of Chinese autumn is 无缘无故地友善", weight: 3 },
  { text: "The Myriad Species & Mixed Fortunes of Man", weight: 3 },
  { text: "A Real Man Jogs with his Pony", weight: 3 },
  { text: "THIS SHIT TOO NUANCED !!!", weight: 3 },
  { text: "You Must be Odd to be #1 !", weight: 3 },
  { text: "Oh My Lucky Stars !", weight: 3 },
  { text: "Chinese Mode : ON", weight: 3 },
  { text: "You Die on Jallomoth.com You Die in Real Life", weight: 3 },
  { text: "Wipe Your Feet at the Door !", weight: 3 },
  { text: "& Friends !", weight: 3 },
  { text: "^ Known by Akinator !", weight: 3 },
  { text: "Made with Apples !", weight: 3 },
  { text: "Rated E for Everypony", weight: 3 },
  // --- Uncommon ---
  { text: "SHUT UP !!!", weight: 2 },
  { text: "Get Smart", weight: 2 },
  { text: "The Light is Your Guide", weight: 2 },
  { text: "Mmm ... Hamburger !", weight: 2 },
  { text: "No Refunds !", weight: 2 },
  { text: "There's Layers to This Shit .", weight: 2 },
  { text: "U MIRIN BRAH ?", weight: 2 },
  { text: "Touch Me ... Midas !!", weight: 2 },
  { text: "You Startled the Witch !", weight: 2 },
  { text: "Grandparents Night @6:30 !", weight: 2 },
  { text: "Food … Water … Nuance !", weight: 2 },
  { text: "Written & Directed by Rod Serling", weight: 2 },
  { text: "KRAK !!", weight: 2 },
  { text: "Ew , you like [Popular Thing ?]", weight: 2 },
  { text: "The Future of Awesome !", weight: 1 },
  { text: "Domo Domo Domo", weight: 1 },
  { text: "Jallomoth.com ?", weight: 1 },
  { text: "Probably @ the Movies", weight: 1 },
  { text: "Mysterious Handy Tool for Unusual Home Adventures With a Twist", weight: 1 },
  // --- Rare ---
  { text: "?????????????????", weight: 0.5 },
  { text: "...Naughty !", weight: 0.5 },
];

function pickWeighted(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item.text;
  }
  return items[items.length - 1].text;
}

// Stable selection for the session — pick once at module load time.
const sessionText = pickWeighted(SPLASH_TEXTS);

export default function SplashText() {
  return (
    <span className="splash-text" aria-hidden="true">
      {sessionText}
    </span>
  );
}
