/**
 * The CPG Ingredient Taxonomy v1's 55 buyer-style search queries, verbatim
 * (doc: docs/cpg-ingredient-taxonomy-v1.md @ commit 99dcc46 on
 * task/research-complete-cpg-ingredient-taxonom-4nMRFxN7; artifact
 * art_5Ld7vheQ). Order is the document's numbering. Trailing " [C]"
 * provenance annotations are doc markers, not query text, and are omitted.
 *
 * The suite asserts every query returns ≥1 anchored result or an explicitly
 * registered empty state (query-empty-states.ts). Only merged regions exist
 * in the dataset when this suite runs — the final integration pass re-runs
 * it against all 254 rows.
 */
export const buyerQueries: readonly string[] = [
  "organic ashwagandha root extract 5% withanolides",
  "ashwagandha root extract 2.5% total withanolides by gravimetry",
  "rhodiola rosea extract 3% rosavins 1% salidroside organic",
  "bacopa monnieri extract 50% bacosides",
  "boswellia serrata extract 30% AKBA",
  "curcumin C3 Complex 95% curcuminoids",
  "black pepper extract 95% piperine (BioPerine)",
  "amla extract 10% beta-glucogallin GRAS",
  "organic moringa leaf extract 10:1",
  "centella asiatica powder bulk",
  "green tea extract 95% EGCG water-extracted",
  "organic lion's mane fruiting body extract 30% beta-glucans dual extract",
  "reishi extract standardised triterpenoids ganoderic acid",
  "cordyceps fruiting body extract powder",
  "bifidobacterium lactis BB-12 probiotic powder",
  "saccharomyces boulardii CNCM I-1079 20 billion CFU/g organic",
  "lactobacillus rhamnosus GG freeze-dried 350 billion CFU/g",
  "multi-strain probiotic 100B CFU/g microencapsulated",
  "stevia Reb A 97% powder FSSC 22000",
  "Reb M steviol glycosides high purity",
  "organic monk fruit extract mogroside V 25%",
  "monk fruit extract 50% mogroside V wholesale",
  "liquid allulose 70 DS",
  "crystalline allulose 95%+ purity",
  "thaumatin sweetener bitter blocking natural",
  "erythritol non-GMO bulk",
  "sucralose FCC food grade",
  "citric acid anhydrous FCC kosher halal",
  "malic acid DL FCC",
  "natamycin 50% in lactose",
  "potassium sorbate granular FCC",
  "sodium benzoate prill powder",
  "cultured sugar vinegar powder preservative clean label",
  "xanthan gum 40 mesh food grade",
  "gellan gum high acyl COSMOS vegan",
  "pectin citrus rapid set",
  "whey protein concentrate 80% instantized",
  "instant nonfat dry milk low heat",
  "vitamin D3 100,000 IU/g cold water dispersible kosher halal",
  "Quatrefolic 5-MTHF bulk",
  "magnesium bisglycinate chelate Albion TRAACS 10% elemental",
  "zinc picolinate 20% elemental food grade",
  "creatine monohydrate Creapure",
  "L-citrulline DL-malate 2:1",
  "MCT oil 60/40 coconut organic",
  "fish oil 3624 rTG EPA 36% DHA 24%",
  "algal DHA powder 20% TG microencapsulated",
  "sunflower lecithin non-GMO liquid",
  "turmeric oleoresin natural color",
  "paprika oleoresin E160c capsanthin",
  "menthol crystals natural peppermint",
  "organic spirulina powder phycocyanin",
  "schizochytrium powder organic 20%",
  "soluble corn fiber non-GMO",
  "vitamin premix immunity joint care claim",
];

export const BUYER_QUERY_COUNT = 55;
