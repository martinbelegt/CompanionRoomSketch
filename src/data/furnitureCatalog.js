export const furnitureCategories = [
  {
    id: "living",
    title: "Woonkamer",
    icon: "🛋",
    items: [
      "sofa-2",
      "sofa-3",
      "corner-sofa-left",
      "corner-sofa-right",
      "armchair",
      "coffee-table",
      "tv-stand",
      "sideboard",
    ],
  },
  {
    id: "dining",
    title: "Eethoek",
    icon: "🍽",
    items: ["dining-table-rect", "dining-table-round", "chair", "bar-stool"],
  },
  {
    id: "bedroom",
    title: "Slaapkamer",
    icon: "🛏",
    items: ["double-bed", "single-bed", "nightstand", "wardrobe"],
  },
  {
    id: "bathroom",
    title: "Badkamer",
    icon: "🚿",
    items: ["toilet", "sink", "shower", "bathtub"],
  },
];

const furnitureCatalog = {
  "sofa-2": {
    name: "2-zits bank",
    widthMm: 1800,
    depthMm: 900,
    shape: "sofa",
    seats: 2,
  },
  "sofa-3": {
    name: "3-zits bank",
    widthMm: 2200,
    depthMm: 950,
    shape: "sofa",
    seats: 3,
  },
  "corner-sofa-left": {
    name: "Hoekbank links",
    widthMm: 2600,
    depthMm: 1800,
    shape: "cornerSofaLeft",
  },
  "corner-sofa-right": {
    name: "Hoekbank rechts",
    widthMm: 2600,
    depthMm: 1800,
    shape: "cornerSofaRight",
  },
  armchair: {
    name: "Fauteuil",
    widthMm: 900,
    depthMm: 900,
    shape: "armchair",
  },
  "coffee-table": {
    name: "Salontafel",
    widthMm: 1100,
    depthMm: 600,
    shape: "tableRect",
  },
  "tv-stand": {
    name: "TV-meubel",
    widthMm: 1600,
    depthMm: 450,
    shape: "mediaUnit",
  },
  sideboard: {
    name: "Dressoir",
    widthMm: 1800,
    depthMm: 500,
    shape: "cabinet",
  },
  "dining-table-rect": {
    name: "Rechthoekige eettafel",
    widthMm: 2000,
    depthMm: 950,
    shape: "diningTableRect",
  },
  "dining-table-round": {
    name: "Ronde eettafel",
    widthMm: 1200,
    depthMm: 1200,
    shape: "diningTableRound",
  },
  chair: {
    name: "Stoel",
    widthMm: 500,
    depthMm: 550,
    shape: "chair",
  },
  "bar-stool": {
    name: "Barkruk",
    widthMm: 420,
    depthMm: 420,
    shape: "stool",
  },
  "double-bed": {
    name: "Tweepersoonsbed",
    widthMm: 1800,
    depthMm: 2100,
    shape: "bedDouble",
  },
  "single-bed": {
    name: "Eenpersoonsbed",
    widthMm: 900,
    depthMm: 2100,
    shape: "bedSingle",
  },
  nightstand: {
    name: "Nachtkastje",
    widthMm: 450,
    depthMm: 450,
    shape: "nightstand",
  },
  wardrobe: {
    name: "Kledingkast",
    widthMm: 1800,
    depthMm: 600,
    shape: "wardrobe",
  },
  toilet: {
    name: "Toilet",
    widthMm: 420,
    depthMm: 700,
    shape: "toilet",
  },
  sink: {
    name: "Wastafel",
    widthMm: 700,
    depthMm: 500,
    shape: "sink",
  },
  shower: {
    name: "Douche",
    widthMm: 900,
    depthMm: 900,
    shape: "shower",
  },
  bathtub: {
    name: "Ligbad",
    widthMm: 1700,
    depthMm: 750,
    shape: "bathtub",
  },
};

export default furnitureCatalog;
