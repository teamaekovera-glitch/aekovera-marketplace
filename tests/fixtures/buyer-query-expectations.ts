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
 * Baseline: the final six-region catalog (268 dataset rows, 258 exported).
 * Each anchor was verified against the records that actually carry the
 * substance token in an indexed field. Queries no row can answer are
 * explicitly registered as empty states with a coverage-gap justification —
 * including queries whose only apparent "hits" are incidental token
 * collisions (company names like "Joint Stock" or "MANE", or generic
 * qualifiers like "organic") rather than the queried substance.
 */

const gap = (substance: string): string =>
  `No row in the merged six-region catalog (268 dataset rows, 258 exported) names ${substance}; registered as an explicit empty state for marketplace v1.`;

export interface QueryExpectation {
  query: string;
  anchors: readonly string[];
  /**
   * AND-mode: a hit must match every anchor to count as relevant — for
   * queries whose individual tokens are each too generic to anchor alone
   * ("green tea": "green" matches green coffee, "tea" matches black tea).
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
    anchors: ["ashwagandha"],
  },
  {
    query: "ashwagandha root extract 2.5% total withanolides by gravimetry",
    anchors: ["ashwagandha"],
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
    anchors: ["curcumin"],
  },
  {
    query: "black pepper extract 95% piperine (BioPerine)",
    anchors: ["pepper"],
  },
  {
    query: "amla extract 10% beta-glucogallin GRAS",
    anchors: ["amla", "glucogallin"],
    coverageGap: gap("amla extract or beta-glucogallin"),
  },
  {
    query: "organic moringa leaf extract 10:1",
    anchors: ["moringa"],
  },
  {
    query: "centella asiatica powder bulk",
    anchors: ["centella", "asiatica"],
    coverageGap: gap("centella asiatica"),
  },
  {
    query: "green tea extract 95% EGCG water-extracted",
    anchors: ["green", "tea"],
    requireAllAnchors: true,
  },
  {
    query: "organic lion's mane fruiting body extract 30% beta-glucans dual extract",
    anchors: ["mane", "glucans"],
    coverageGap:
      "No row names lion's mane or beta-glucan-standardized mushroom extracts; the only \"mane\" matches are company-name collisions (Mane Kancor, MANE), not the mushroom.",
  },
  {
    query: "reishi extract standardised triterpenoids ganoderic acid",
    anchors: ["reishi"],
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
    coverageGap:
      "No strain-designated probiotic culture row exists. One US/Canada supplier is typed \"probiotics\", but supplier type is not an indexed search field (the index covers name, ingredients, categories, certifications, country, region per the v1 spec), and no row names specific strains or CFU counts.",
  },
  {
    query: "stevia Reb A 97% powder FSSC 22000",
    anchors: ["stevia"],
  },
  {
    query: "Reb M steviol glycosides high purity",
    anchors: ["steviol"],
  },
  {
    query: "organic monk fruit extract mogroside V 25%",
    anchors: ["monk"],
  },
  {
    query: "monk fruit extract 50% mogroside V wholesale",
    anchors: ["monk"],
  },
  {
    query: "liquid allulose 70 DS",
    anchors: ["allulose"],
  },
  {
    query: "crystalline allulose 95%+ purity",
    anchors: ["allulose"],
  },
  {
    query: "thaumatin sweetener bitter blocking natural",
    anchors: ["thaumatin"],
    coverageGap: gap("thaumatin"),
  },
  {
    query: "erythritol non-GMO bulk",
    anchors: ["erythritol"],
  },
  {
    query: "sucralose FCC food grade",
    anchors: ["sucralose"],
  },
  {
    query: "citric acid anhydrous FCC kosher halal",
    anchors: ["citric"],
  },
  {
    query: "malic acid DL FCC",
    anchors: ["malic"],
  },
  {
    query: "natamycin 50% in lactose",
    anchors: ["natamycin", "lactose"],
    coverageGap:
      "No row names natamycin; the lactose-bearing rows that match this query are dairy protein suppliers, not natamycin carriers.",
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
    anchors: ["vinegar"],
  },
  {
    query: "xanthan gum 40 mesh food grade",
    anchors: ["xanthan"],
  },
  {
    query: "gellan gum high acyl COSMOS vegan",
    anchors: ["gellan"],
  },
  {
    query: "pectin citrus rapid set",
    anchors: ["pectin"],
  },
  {
    query: "whey protein concentrate 80% instantized",
    anchors: ["whey"],
  },
  {
    query: "instant nonfat dry milk low heat",
    anchors: ["nonfat"],
    coverageGap:
      "No row specifies nonfat dry milk; the milk-protein rows that match (e.g. \"low heat\" skim-milk-powder language) do not name the nonfat spec.",
  },
  {
    query: "vitamin D3 100,000 IU/g cold water dispersible kosher halal",
    anchors: ["d3"],
  },
  {
    query: "Quatrefolic 5-MTHF bulk",
    anchors: ["quatrefolic", "mthf"],
    coverageGap: gap("5-MTHF folates"),
  },
  {
    query: "magnesium bisglycinate chelate Albion TRAACS 10% elemental",
    anchors: ["bisglycinate"],
  },
  {
    query: "zinc picolinate 20% elemental food grade",
    anchors: ["zinc"],
  },
  {
    query: "creatine monohydrate Creapure",
    anchors: ["creatine", "creapure"],
    coverageGap: gap("creatine monohydrate"),
  },
  {
    query: "L-citrulline DL-malate 2:1",
    anchors: ["citrulline", "malate"],
    coverageGap:
      "No row names citrulline or citrulline malate; the DL-malate rows that match are malic acid suppliers, not citrulline carriers.",
  },
  {
    query: "MCT oil 60/40 coconut organic",
    anchors: ["mct"],
  },
  {
    query: "fish oil 3624 rTG EPA 36% DHA 24%",
    anchors: ["fish"],
  },
  {
    query: "algal DHA powder 20% TG microencapsulated",
    anchors: ["algal", "dha"],
    coverageGap: gap("algal DHA"),
  },
  {
    query: "sunflower lecithin non-GMO liquid",
    anchors: ["sunflower"],
  },
  {
    query: "turmeric oleoresin natural color",
    anchors: ["turmeric"],
  },
  {
    query: "paprika oleoresin E160c capsanthin",
    anchors: ["paprika"],
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
    coverageGap:
      "No row carries the phrase \"corn fiber\" in any indexed field; corn-oil and citrus-fiber rows that match the loose tokens are different products.",
  },
  {
    query: "vitamin premix immunity joint care claim",
    anchors: ["premix"],
  },
];
