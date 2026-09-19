/**
 * Per-query expectations for the 55 buyer-style queries (buyer-queries.ts).
 *
 * `anchors` are the substance tokens of each query — the terms whose presence
 * in a hit's matchedTerms makes the hit relevant (an ashwagandha query is
 * answered by a row naming ashwagandha, not by a row that happens to say
 * "organic" or carry the number 5). Anchors are hand-curated, reviewable,
 * and guarded by tests: every anchor must be a token of its query, and no
 * anchor may be a bare number.
 *
 * `coverageGap` is present exactly when no merged regional row can anchor
 * the query today: the empty state is then explicit and justified, per the
 * acceptance bar. The final integration pass (all 254 suppliers across the
 * six regional datasets) re-evaluates every entry — stale gaps are reported
 * by the suite as warnings for that pass to prune.
 */

const gap = (substance: string): string =>
  `No row in the merged regions (Southeast Asia only at this pass) names ${substance}; the substance is expected from a regional dossier still pending merge (research baseline: 254 suppliers across six regions). Re-evaluated at the final integration pass.`;

export interface QueryExpectation {
  query: string;
  anchors: readonly string[];
  /**
   * AND-mode: a hit must match every anchor to count as relevant — for
   * queries whose individual tokens are each too generic to anchor alone
   * ("soluble corn fiber": "corn" and "fiber" both match unrelated rows).
   */
  requireAllAnchors?: boolean;
  /**
   * Adjacent-token phrases (within a single record field) that anchor a hit
   * even when no single token is distinctive enough. Used with empty
   * `anchors` when every query token is generic ("corn", "fiber").
   */
  anchorPhrases?: readonly string[];
  coverageGap?: string;
}

export const queryExpectations: readonly QueryExpectation[] = [
  {
    query: "organic ashwagandha root extract 5% withanolides",
    anchors: ["ashwagandha", "withanolides"],
    coverageGap: gap("ashwagandha root extract or its withanolide standardizations"),
  },
  {
    query: "ashwagandha root extract 2.5% total withanolides by gravimetry",
    anchors: ["ashwagandha", "gravimetry"],
    coverageGap: gap("ashwagandha root extract (gravimetry assay)"),
  },
  {
    query: "rhodiola rosea extract 3% rosavins 1% salidroside organic",
    anchors: ["rhodiola", "rosavins", "salidroside"],
    coverageGap: gap("rhodiola rosea extract, rosavins, or salidroside"),
  },
  {
    query: "bacopa monnieri extract 50% bacosides",
    anchors: ["bacopa", "monnieri", "bacosides"],
    coverageGap: gap("bacopa monnieri extract or bacosides"),
  },
  {
    query: "boswellia serrata extract 30% AKBA",
    anchors: ["boswellia", "serrata", "akba"],
    coverageGap: gap("boswellia serrata extract or AKBA"),
  },
  {
    query: "curcumin C3 Complex 95% curcuminoids",
    anchors: ["curcumin", "curcuminoids"],
    coverageGap: gap("standardized curcuminoid extracts (turmeric rows are not C3-standardized products)"),
  },
  {
    query: "black pepper extract 95% piperine (BioPerine)",
    anchors: ["pepper", "piperine"],
  },
  {
    query: "amla extract 10% beta-glucogallin GRAS",
    anchors: ["amla", "glucogallin"],
    coverageGap: gap("amla extract or beta-glucogallin"),
  },
  {
    query: "organic moringa leaf extract 10:1",
    anchors: ["moringa"],
    coverageGap: gap("moringa leaf extract"),
  },
  {
    query: "centella asiatica powder bulk",
    anchors: ["centella", "asiatica"],
    coverageGap: gap("centella asiatica"),
  },
  {
    query: "green tea extract 95% EGCG water-extracted",
    anchors: ["tea", "egcg"],
    coverageGap: gap("green tea extract or EGCG"),
  },
  {
    query: "organic lion's mane fruiting body extract 30% beta-glucans dual extract",
    anchors: ["mane", "glucans"],
    coverageGap: gap("lion's mane or beta-glucan-standardized mushroom extracts"),
  },
  {
    query: "reishi extract standardised triterpenoids ganoderic acid",
    anchors: ["reishi", "ganoderic", "triterpenoids"],
    coverageGap: gap("reishi extract, triterpenoids, or ganoderic acid"),
  },
  {
    query: "cordyceps fruiting body extract powder",
    anchors: ["cordyceps"],
    coverageGap: gap("cordyceps extract"),
  },
  {
    query: "bifidobacterium lactis BB-12 probiotic powder",
    anchors: ["bifidobacterium", "lactis", "bb"],
    coverageGap: gap("bifidobacterium lactis cultures"),
  },
  {
    query: "saccharomyces boulardii CNCM I-1079 20 billion CFU/g organic",
    anchors: ["saccharomyces", "boulardii", "cncm"],
    coverageGap: gap("saccharomyces boulardii cultures"),
  },
  {
    query: "lactobacillus rhamnosus GG freeze-dried 350 billion CFU/g",
    anchors: ["lactobacillus", "rhamnosus"],
    coverageGap: gap("lactobacillus rhamnosus cultures"),
  },
  {
    query: "multi-strain probiotic 100B CFU/g microencapsulated",
    anchors: ["probiotic", "strain"],
    coverageGap: gap("probiotic blends or strain-designated cultures"),
  },
  {
    query: "stevia Reb A 97% powder FSSC 22000",
    anchors: ["stevia", "reb"],
    coverageGap: gap("stevia extracts or Reb-A grades"),
  },
  {
    query: "Reb M steviol glycosides high purity",
    anchors: ["steviol", "glycosides"],
    coverageGap: gap("steviol glycosides"),
  },
  {
    query: "organic monk fruit extract mogroside V 25%",
    anchors: ["monk", "mogroside"],
    coverageGap: gap("monk fruit extract or mogrosides"),
  },
  {
    query: "monk fruit extract 50% mogroside V wholesale",
    anchors: ["monk", "mogroside"],
    coverageGap: gap("monk fruit extract or mogrosides"),
  },
  {
    query: "liquid allulose 70 DS",
    anchors: ["allulose"],
    coverageGap: gap("allulose"),
  },
  {
    query: "crystalline allulose 95%+ purity",
    anchors: ["allulose"],
    coverageGap: gap("allulose"),
  },
  {
    query: "thaumatin sweetener bitter blocking natural",
    anchors: ["thaumatin"],
    coverageGap: gap("thaumatin"),
  },
  {
    query: "erythritol non-GMO bulk",
    anchors: ["erythritol"],
    coverageGap: gap("erythritol"),
  },
  {
    query: "sucralose FCC food grade",
    anchors: ["sucralose"],
    coverageGap: gap("sucralose"),
  },
  {
    query: "citric acid anhydrous FCC kosher halal",
    anchors: ["citric", "anhydrous"],
    coverageGap: gap("citric acid (anhydrous or otherwise)"),
  },
  {
    query: "malic acid DL FCC",
    anchors: ["malic"],
    coverageGap: gap("malic acid"),
  },
  {
    query: "natamycin 50% in lactose",
    anchors: ["natamycin", "lactose"],
    coverageGap: gap("natamycin or lactose-carried preservatives"),
  },
  {
    query: "potassium sorbate granular FCC",
    anchors: ["sorbate"],
    coverageGap: gap("potassium sorbate"),
  },
  {
    query: "sodium benzoate prill powder",
    anchors: ["benzoate"],
    coverageGap: gap("sodium benzoate"),
  },
  {
    query: "cultured sugar vinegar powder preservative clean label",
    anchors: ["vinegar", "cultured"],
    coverageGap: gap("cultured sugar/vinegar preservative systems"),
  },
  {
    query: "xanthan gum 40 mesh food grade",
    anchors: ["xanthan", "mesh"],
    coverageGap: gap("xanthan gum or mesh-graded gums"),
  },
  {
    query: "gellan gum high acyl COSMOS vegan",
    anchors: ["gellan", "acyl"],
    coverageGap: gap("gellan gum"),
  },
  {
    query: "pectin citrus rapid set",
    anchors: ["pectin", "citrus"],
    coverageGap: gap("pectin"),
  },
  {
    query: "whey protein concentrate 80% instantized",
    anchors: ["whey"],
    coverageGap: gap("whey protein"),
  },
  {
    query: "instant nonfat dry milk low heat",
    anchors: ["nonfat"],
    coverageGap: gap("nonfat dry milk"),
  },
  {
    query: "vitamin D3 100,000 IU/g cold water dispersible kosher halal",
    anchors: ["vitamin", "d3", "dispersible"],
    coverageGap: gap("vitamin D3 powders"),
  },
  {
    query: "Quatrefolic 5-MTHF bulk",
    anchors: ["quatrefolic", "mthf"],
    coverageGap: gap("5-MTHF folates"),
  },
  {
    query: "magnesium bisglycinate chelate Albion TRAACS 10% elemental",
    anchors: ["bisglycinate", "chelate", "albion", "traacs"],
    coverageGap: gap("mineral chelates"),
  },
  {
    query: "zinc picolinate 20% elemental food grade",
    anchors: ["picolinate", "zinc"],
    coverageGap: gap("zinc picolinate"),
  },
  {
    query: "creatine monohydrate Creapure",
    anchors: ["creatine", "creapure"],
    coverageGap: gap("creatine monohydrate"),
  },
  {
    query: "L-citrulline DL-malate 2:1",
    anchors: ["citrulline", "malate"],
    coverageGap: gap("citrulline malate"),
  },
  {
    query: "MCT oil 60/40 coconut organic",
    anchors: ["mct"],
    coverageGap: gap("MCT oil (coconut oil rows are not MCT products)"),
  },
  {
    query: "fish oil 3624 rTG EPA 36% DHA 24%",
    anchors: ["3624", "epa", "dha", "rtg", "fish"],
    coverageGap: gap("omega-3 fish oil concentrates"),
  },
  {
    query: "algal DHA powder 20% TG microencapsulated",
    anchors: ["algal", "dha"],
    coverageGap: gap("algal DHA"),
  },
  {
    query: "sunflower lecithin non-GMO liquid",
    anchors: ["lecithin"],
    coverageGap: gap("lecithins (sunflower oil rows are not lecithin products)"),
  },
  {
    query: "turmeric oleoresin natural color",
    anchors: ["turmeric", "oleoresin"],
  },
  {
    query: "paprika oleoresin E160c capsanthin",
    anchors: ["paprika", "capsanthin", "e160c"],
    coverageGap: gap("paprika oleoresin"),
  },
  {
    query: "menthol crystals natural peppermint",
    anchors: ["menthol", "peppermint"],
    coverageGap: gap("menthol or peppermint products"),
  },
  {
    query: "organic spirulina powder phycocyanin",
    anchors: ["spirulina", "phycocyanin"],
    coverageGap: gap("spirulina"),
  },
  {
    query: "schizochytrium powder organic 20%",
    anchors: ["schizochytrium"],
    coverageGap: gap("schizochytrium"),
  },
  {
    query: "soluble corn fiber non-GMO",
    anchors: [],
    anchorPhrases: ["corn fiber"],
    coverageGap: gap("soluble corn fiber"),
  },
  {
    query: "vitamin premix immunity joint care claim",
    anchors: ["premix"],
    coverageGap: gap("vitamin/mineral premixes"),
  },
];
