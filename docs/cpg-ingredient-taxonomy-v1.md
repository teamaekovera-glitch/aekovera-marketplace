# CPG Ingredient Taxonomy v1

**Purpose:** The backbone catalog structure for the Aekovera ingredient marketplace — every top-level category and subtype CPG brands (food, beverage, supplement, personal care) actually source, with the specification attributes brands filter by and the real search vocabulary they use.

**Prepared for:** Aekovera (aekovera.com) — supplier-matching marketplace, project prj_edFZ0Rf2.
**Date:** September 19, 2026. All sources retrieved this session (live fetch or indexed snapshot as noted).

---

## Load-bearing assumption

This taxonomy assumes that supplier/marketplace category pages (distributors like Batory and Prinova, marketplaces like IngredientsOnline and Knowde) reflect what CPG brands actually source. Evidence supporting it: these pages are written for buyers, and their product naming already carries spec-level detail (percent standardization, CFU counts, mesh, DS%). It breaks if brands search primarily by application ("gummy fiber") rather than ingredient ("inulin") — track early search logs and re-weight facets if that shows up.

---

## Provenance rules (read first)

- **[V] Verified** — the item was seen this session on the cited source page (supplier, distributor, or marketplace listing). Source refs (S#) resolve in the Source Log at the end.
- **[C] Category-verified only** — the parent category is verified on a cited source, but this specific subtype was not observed on a retrieved page this session. Treat as an inventory candidate pending per-supplier verification. Per the project provenance rulebook, these are unknowns until verified.
- No subtype was invented: anything marked [C] sits inside a category confirmed on a live supplier page, and anything not even category-grounded was excluded entirely (see Exclusions).
- Percentages, strain designations, product codes, and grades quoted below come from the retrieved pages; where a page showed a range, the range is what's stated here.

---

## Global facet schema (applies to every listing on the marketplace)

Derived from how supplier and marketplace pages actually present products:

| Facet | Values seen in real listings |
|---|---|
| Ingredient name / INCI | e.g. "Rhodiola Rosea Extract", INCI fields on Knowde [S56] |
| Top-level category / subtype | Distributor categories (Batory's 25, Prinova's groups) [S1, S3] |
| Origin | Country/botanical part: "Part Used: Fresh Fruit" [S23]; "Ingredient Origin: Plant Origin, Biotechnology" [S56] |
| Form | powder, granulate, liquid, syrup, oil, beadlet, capsule, frozen culture [S25, S30, S49] |
| Purity / standardization | "Reb A >97%", "20B CFU/g", "EPA 36% + DHA 24%", "10% elemental Mg", "70.0–72.0 DS" [S14, S30, S41, S59] |
| Grade standard | FCC / FCC IV, USP, food grade [S34, S36]; FCC = Food Chemicals Codex (USP's quality standard for food ingredients — USP page did not render this session; grade usage verified on supplier pages) |
| Extraction / process | "dual extract", "4:1 hot water", "gravimetry", "microencapsulated", "spray-dried" [S52, S54, S51, S43, S25] |
| Certifications | USDA/EU Organic, Kosher, Halal, COSMOS, ECOCERT, NaTrue, ISO 16128, FSSC 22000, GMP, Non-GMO, GRAS-affirmed [S6, S21, S27, S56, S36] |
| Documentation | COA per lot, SDS, spec sheets [S36]; beta-glucan content published per lot [S10] |
| Commercial | MOQ (e.g. 25 kg boxes to 1 MT pallets, container loads [S36]), sample policy, pricing (quote-only on most B2B pages) |

---

# The taxonomy — 33 top-level categories

## 1. Sweeteners — Bulk & Nutritive

**Subtypes:** dextrose anhydrous; dextrose monohydrate; crystalline fructose; high fructose corn syrup; liquid glucose; maltodextrin; trehalose; isomaltulose; arabinose; low-GI sugar; polyols: erythritol, maltitol (crystalline), mannitol, sorbitol (powder & liquid), isomalt — all [V: S35]; xylitol [C].
**Spec attributes brands filter by:** particle size/mesh, dry substance, Non-GMO, organic, allergen (corn/wheat source), country of origin, FCC/food grade.
**Search vocabulary:** "crystalline fructose supplier", "erythritol non-GMO", "maltodextrin 10 DE" (DE values [C]).
**Grounding:** S35 (full sweetener list from a working China-source supplier), S5 (Batory's sweet line: erythritol, soluble corn fiber, allulose, stevia).

## 2. Sweeteners — High-Intensity, Rare Sugars & Sweetness Modulators

**Subtypes:**
- Stevia: Reb A 97% (>97% steviol glycosides, ~280–290x sucrose) [V: S18, S20, S21]; Reb A 95–99% ten-grade line incl. high-purity Reb M and Reb D and glucosylated steviol glycosides [V: S19]; EverSweet Reb M/D [V: S22]; organic stevia leaf extract [V: S35]; powder or granulate form [V: S21].
- Monk fruit (Siraitia grosvenorii): mogroside V 5–65% (HPLC assay, fresh fruit) [V: S23]; 20/25/40/50% mogroside V and 80/95/98% total mogrosides [V: S24]; juice concentrate and blends [V: S35].
- Rare sugars: allulose — liquid 70% DS (70.0–72.0, allulose ≥95% d.b.) and crystalline >95% purity, 0.4 kcal/g, ~70% sweetness of sucrose [V: S14, S15]; D-allulose [V: S35]; tagatose [V: S35].
- Protein sweetener: thaumatin (ThaumActive portfolio; ~3,000x sucrose; sweet + bitter-blocking) [V: S16, S17].
- Deep-body sweeteners: glycyrrhizin, ammonium glycyrrhizinate, disodium glycyrrhizinate [V: S35]; neohesperidin dihydrochalcone, naringin dihydrochalcone [V: S35].
- Synthetic/HI: sucralose, acesulfame-K, aspartame, advantame, neotame, saccharin, cyclamate [V: S35].
**Spec attributes:** purity (% glycoside), sweetness multiple, organic, Kosher/Halal, FSSC 22000, form (powder/granulate/liquid), blend vs single.
**Search vocabulary (real patterns):** "stevia Reb A 97 powder FSSC 22000", "organic monk fruit extract mogroside V 25%", "liquid allulose 70 DS", "Reb M steviol glycosides", "thaumatin bitter blocking".
**Grounding:** S14–S24, S35.

## 3. Acidulants & pH Control

**Subtypes:** citric acid anhydrous; citric acid monohydrate; DL-malic acid; L-malic acid; lactic acid (+ lactic acid powder); fumaric acid; DL-tartaric / L(+)-tartaric acid; maleic acid; succinic acid; glucono-delta-lactone (GDL); sodium citrate (anhydrous/dihydrate); potassium citrate; calcium citrate; calcium lactate; ferrous lactate; sodium lactate (+ powder); potassium lactate; potassium bitartrate; sodium acetate; monosodium fumarate; buffered lactic acid; food-grade glacial acetic acid; sodium acid pyrophosphate — all [V: S35, S36].
**Spec attributes:** FCC/food grade (SDI: "All grades are FCC/food grade with COA per lot" [S36]), anhydrous vs monohydrate, granular vs powder, Kosher/Halal documentation, packaging (25 kg to 1 MT).
**Search vocabulary:** "citric acid anhydrous FCC", "malic acid DL FCC", "GDL glucono delta lactone food grade", "sodium citrate dihydrate".
**Grounding:** S36 (SDI Chemicals — US bulk acidulant supplier with FCC framing), S35.

## 4. Preservatives & Antimicrobials

**Subtypes:**
- Classical: potassium sorbate (granular), sorbic acid, sodium benzoate (powder/prill/granular), benzoic acid, calcium propionate, sodium propionate, potassium metabisulfite, calcium sorbate, sodium diacetate, potassium propionate — [V: S36, S35].
- Biopreservation/fermentates: natamycin (FCC IV/USP; 50% in glucose / 50% in lactose / 50% in NaCl / 95%) [V: S34, S35]; nisin; ε-polylysine / polylysine HCl; ethyl lauroyl arginate; dehydroacetic acid / sodium dehydroacetate — [V: S35]; cultured sugar, vinegar (liquid & powder), cultured corn sugar, cultured dextrose, cultured onion and celery (Verdad-type, label-friendly) [V: S12, S13]; dry vinegar [V: S35].
**Spec attributes:** FCC/USP grade, carrier (lactose/glucose/NaCl), form (prill/granular/powder), Kosher/Halal docs, application (bakery mold vs beverage yeast).
**Search vocabulary:** "potassium sorbate granular FCC", "natamycin 50% lactose", "cultured sugar vinegar powder preservative", "sodium benzoate prill".
**Grounding:** S34–S36, S12, S13.

## 5. Antioxidants

**Subtypes:** ascorbic acid, sodium ascorbate, erythorbic acid, sodium erythorbate [V: S35]; ascorbate preservative portfolio (juices, cereals, bread) [V: S1]; TBHQ, BHT [V: S35]; natural side: astaxanthin (Haematococcus pluvialis), hydroxytyrosol, dihydroquercetin, enzymatically modified isoquercitrin [V: S35]; Corbion Origin natural antioxidant portfolio [V: S11]; mixed tocopherols, rosemary extract [C].
**Spec attributes:** natural vs synthetic, carrier/beadlet, Kosher/Halal, GRAS status, application oil vs water phase.
**Search vocabulary:** "rosemary extract antioxidant", "mixed tocopherols non-GMO", "sodium erythorbate FCC".
**Grounding:** S35, S1, S11.

## 6. Hydrocolloids, Thickeners & Texturants

**Subtypes:** xanthan gum (incl. 40-mesh KELTROL-type, instant xanthan) [V: S6, S35]; gellan gum (high-acyl & low-acyl; fine-mesh F grade; beverage-suspension and plant-based-meat grades) [V: S6, S7]; pectin (apple & citrus; HM/LM sets [C]; GENU line; label-friendly neutral-dairy grade) [V: S6, S8]; carrageenan [V: S6]; refined locust bean gum [V: S6]; guar gum [V: S1]; tara gum [V: S35]; sodium alginate, calcium alginate, propylene glycol alginate (PGA) [V: S35, S1]; sodium CMC (cellulose gum) [V: S8, S35]; microcrystalline cellulose / colloidal MCC [V: S35]; konjac (gum, fine flour, micro-powder, acid-resistant) [V: S35]; agar-agar [V: S35]; gum arabic [V: S35]; curdlan gum, pullulan, welan gum, diutan gum [V: S35, S6]; citrus fiber [V: S6]; fermentation-derived cellulose [V: S6]; microparticulated whey protein concentrate (Simplesse-type) [V: S6, S8]; gelatin, fish gelatin [V: S35]; chitosan, beta-1,3-glucan, fucoidan, alginate oligosaccharide, soluble soybean polysaccharide [V: S35].
**Spec attributes:** mesh/viscosity (e.g. 40-mesh, 200-mesh), acyl content (gellan), esterification/set (pectin), Kosher/Halal, vegan, COSMOS/NATRUE for beauty overlap, application (beverage suspension vs gelling).
**Search vocabulary:** "xanthan gum 40 mesh food grade", "gellan gum high acyl", "pectin rapid set HM", "guar gum 4000 cps" [C].
**Grounding:** S6–S8, S35, S1.

## 7. Starches & Flours

**Subtypes:** native and modified starches from corn, tapioca, potato, wheat, rice [V: S3 Batory: "corn, potato, tapioca, wheat or rice-based... modified and unmodified"]; resistant starch from turmeric rhizome, 20% and 35% total starch (Starmeric) [V: S9]; rice category, oats, flours & grains categories [V: S3]; konjac compound flour [V: S35]; pregelatinized starches [C].
**Spec attributes:** botanical source, native vs modified (clean label), gelatinization temp, organic/Non-GMO, mesh.
**Search vocabulary:** "modified tapioca starch clean label", "organic rice starch", "waxy maize starch" [C].
**Grounding:** S3, S9, S35.

## 8. Proteins — Dairy

**Subtypes:** casein and acid caseinates; dry whey (sweet & acid); dry whole milk; instant nonfat dry milk; dry buttermilk; dry cream powder; anhydrous milkfat; butter/churned milkfat; concentrated butter flavors; lactose (food grade); lactoferrin — all [V: S4 ADPI supplier listing]; dairy commodities + dairy proteins categories [V: S3]; microparticulated WPC [V: S6]; WPC 80% / WPI 90% / MPC 80% grade designations [C — standard industry grades, not observed verbatim this session].
**Spec attributes:** protein %, heat grade, instantized, grass-fed, Kosher, rBST-free, organic, country of origin.
**Search vocabulary:** "whey protein concentrate 80% instantized", "MPC 80", "instant nonfat dry milk", "food grade lactose".
**Grounding:** S4, S3, S6.

## 9. Proteins — Plant, Egg & Animal

**Subtypes:** soy, pea, and rice proteins (vegan-claim sourcing) [V: S1]; plant proteins / animal proteins / eggs categories [V: S3]; instant egg white protein [V: S1]; grass-fed beef bone broth protein powder [V: S1]; cereals & grains / pulses category [V: S2]; textured proteins for plant-based meat [C].
**Spec attributes:** protein %, solubility/dispersibility, Non-GMO/organic, allergen, taste/mouthfeel claims, application (vegan dairy vs bars).
**Search vocabulary:** "pea protein isolate Non-GMO", "organic brown rice protein", "instant egg white protein".
**Grounding:** S1, S3, S2.

## 10. Protein Hydrolysates & Peptides

**Subtypes:** whey protein hydrolysate, collagen peptides, casein hydrolysate, plant protein hydrolysates [C — category candidates]; enzymatic hydrolysate production is verified practice: "microbial proteases... used to produce hydrolysates" [V: S50]; endopeptidase preparations for protein modification (COROLASE-type liquid bacterial endopeptidase) [V: S48].
**Spec attributes:** degree of hydrolysis (DH%), bitterness profile, peptide molecular weight, allergen.
**Search vocabulary:** "whey protein hydrolysate DH", "collagen peptides type I" [C].
**Grounding:** S50, S48. Honest status: the subtype list here is the weakest in this document — category candidates, verify against supplier pages during supplier onboarding.

## 11. Amino Acids & Sports Actives

**Subtypes:** BCAAs — L-leucine, L-isoleucine, L-valine; L-lysine monohydrochloride & sulfate; DL-methionine; L-arginine; L-glutamine; glycine; taurine; GABA; beta-alanine; L-citrulline and L-citrulline DL-malate; betaine (anhydrous/monohydrate); N-acetyl-L-cysteine; SAM-e disulfate tosylate; L-proline, L-serine, L-threonine, L-tryptophan, L-tyrosine, L-histidine, L-alanine, L-aspartic acid, L-glutamic acid, L-cysteine(+HCl), L-cystine, L-ornithine HCl — all [V: S35, S2]; full BCAA/EAA/NEAA distribution claim ("largest and most comprehensive in the world") [V: S1]; glycine USP [V: S2]; creatine monohydrate (Creapure — Alzchem, Germany) [V: S28, S35]; tri-creatine malate [V: S35]; L-carnitine base, L-carnitine L-tartrate, L-carnitine fumarate, acetyl-L-carnitine HCl [V: S35]; L-theanine [C].
**Spec attributes:** USP/FCC grade, pharmacopoeia docs, mesh, Kosher/Halal, vegan/fermentation origin, brand (Creapure-style branded actives).
**Search vocabulary:** "creatine monohydrate Creapure", "L-citrulline DL-malate 2:1", "glycine USP", "L-glutamine fermentation".
**Grounding:** S35, S1, S2, S28.

## 12. Vitamins & Derivatives

**Subtypes:** world's-largest-inventory food-grade single vitamins + derivatives [V: S1]; Vitamin C / ascorbates (world's largest distributor claim) [V: S1, S57]; vitamin D3 100,000 IU/g spray-dried cold-water-dispersible powders — on modified starch (CWS-S), on gum acacia with tocopherol stabilization (CWS-A), in modified starch/sucrose/coconut-oil matrix (SD); 2.5 mg cholecalciferol/g; Kosher+Halal certified; 20/25 kg packs [V: S25, S26]; D3 500,000 IU/g [V: S27]; D3 crystalline, oil, resin-in-oil, CWD, feed-grade forms [V via S25-family Fermenta page in search results]; folate as 5-MTHF (Quatrefolic) [V: S29]; 105 vitamin SKUs cataloged by one supplier [V: S35]; vitamin premixes [V: S1]; other fat-soluble forms (E acetate, A palmitate, K2 MK-7 on carrier) [C].
**Spec attributes:** IU/g or mg/g potency, carrier & stabilization, dispersibility (CWD), Kosher/Halal, GMP, premix vs single.
**Search vocabulary:** "vitamin D3 100,000 IU/g cold water dispersible", "vitamin K2 MK-7 1% powder" [C], "Quatrefolic 5-MTHF", "ascorbic acid USP".
**Grounding:** S25–S29, S1, S35.

## 13. Minerals & Mineral Salts

**Subtypes:** magnesium bisglycinate chelate (Albion TRAACS) — unbuffered ~10% elemental Mg, buffered 18%, taste-free 8% [V: S59]; zinc picolinate 20–21% elemental zinc, food-grade, ISO/FSSC 22000/Halal/Kosher docs [V: S27, S60]; potassium citrate, calcium citrate, calcium lactate, magnesium citrate, ferrous lactate [V: S35]; calcium citrate malate, tricalcium phosphate, chromium picolinate [C]; mineral premixes [V: S1].
**Spec attributes:** elemental mineral %, chelate vs salt, brand (Albion TRAACS = "The Real Amino Acid Chelate System"), documentation depth, Kosher/Halal.
**Search vocabulary:** "magnesium bisglycinate chelate Albion TRAACS", "zinc picolinate 20% elemental", "tricalcium phosphate FCC flow agent" [C].
**Grounding:** S59, S60, S27, S35, S1.

## 14. Botanical & Herbal Extracts — Standardized

**Subtypes (with the standardization lines suppliers actually publish):** Curcumin C3 Complex (curcuma extract) [V: S9]; BioPerine — black pepper extract ≥95% piperine [V: S9]; Boswellin — 70% total boswellic acids / 20% β-boswellic / 2% AKBBA [V: S9]; Boswellia 30% AKBA [V: S51]; Bacopin — 20/40/50% bacosides [V: S9]; Saberry — amla ≥10% β-glucogallin [V: S9]; ForsLean — 10% forskolin (20/40% also) [V: S9]; Cinnasil — cassia 20% polyphenols [V: S9]; pTeroSol — ≥5% C-glycosides [V: S9]; Tinofolin — 2.5% bitter principles [V: S9]; oroxylum extract — 10% oroxylin A / 15% baicalein / 6% chrysin [V: S9]; garcinia extracts — ≥20% garcinol; Citrin [V: S9]; Cirpusins — 6% total stilbenoids [V: S9]; Momordicin — 0.5% charantin [V: S9]; GS4 PLUS gymnema [V: S9]; Fenumannan — ≥60% galactomannans; FenuFibers — ≥50% dietary fiber / 15% protein / 2.5% steroidal saponins [V: S9]; ZeaLutein — 1% zeaxanthin / 5% lutein / 2% piperine blend [V: S9]; organic moringa leaf extract 10:1 [V: S51]; centella asiatica powder [V: S51]; carob powder [V: S51]; 204 plant-extract SKUs at one supplier [V: S35]; 130+ standardized extracts at Sabinsa alone [V: S9].
**Spec attributes (the core search pattern of this category):** botanical Latin name + marker compound + % (assay method: HPLC vs gravimetry) + extract ratio (10:1) + part used + extractant (water/hydroalcoholic) + organic + branded-ingredient name.
**Search vocabulary:** "boswellia extract 30% AKBA", "moringa leaf extract 10:1 organic", "amla extract 10% beta-glucogallin".
**Grounding:** S9, S51, S35.

## 15. Adaptogens & Nootropics

**Subtypes:** ashwagandha root extract 2.5% total withanolides by gravimetry (real listing) [V: S51]; 5% withanolides branded forms (KSM-66/Sensoril-type) [C — named brands are industry-known; not on a page I fetched]; rhodiola rosea extract 3% rosavins / 1% salidroside (real listing) [V: S51]; bacopa (above) [V: S9]; tinospora cordifolia nootropic adaptogen [V: S9]; citicoline (CDP-choline), phosphatidylserine (sunflower), L-theanine [C — named in sourcing discussions; not page-verified this session].
**Spec attributes:** marker %, assay method, branded vs generic, organic, part used (root vs leaf).
**Search vocabulary:** "organic ashwagandha extract 5% withanolides", "rhodiola 3% rosavins 1% salidroside", "citicoline bulk powder" [C].
**Grounding:** S51, S9.

## 16. Functional Mushrooms

**Subtypes:** lion's mane (Hericium erinaceus), reishi, chaga, cordyceps, maitake, shiitake [V: S52, S53, S54]; 100% fruiting-body organic extracts [V: S10]; dual extracts (hot water + ethanol) [V: S52]; 4:1 hot-water extracts [V: S54]; beta-D-glucan content quantified per lot and published (industry testing standard) [V: S10]; standardizations: >20% and >30% beta-glucans, triterpenoids incl. ganoderic acid, hericenones & erinacines (lion's mane) [V: S53, S54, S55]; forms: 400-micron fine powder, 1–5 mm tea-cut granules [V: S55]; the fruiting-body-vs-mycelium-on-grain distinction is a first-class search filter, verified across four suppliers [V: S10, S52, S53, S54]; Purity-IQ third-party identity authentication [V: S10].
**Spec attributes:** fruiting body vs mycelium, % beta-glucan, extraction method & ratio, organic cert, COA + identity authentication, species Latin name.
**Search vocabulary:** "organic lion's mane fruiting body extract 30% beta-glucans dual extract", "reishi extract ganoderic acid standardised", "cordyceps fruiting body extract".
**Grounding:** S10, S52–S55.

## 17. Probiotics, Cultures & Ferments

**Subtypes:** Bifidobacterium lactis BB-12 ("world's most documented bifidobacterium"; single-strain cultures for non-fermented/lactase-treated/flavored milk; frozen culture formats; 1 billion CFU drops at retail) [V: S32]; Lactobacillus rhamnosus GG (LGG) — freeze-dried powders at 350 billion CFU/g [V: S33] and market grades 100/200/500 billion CFU/g, microencapsulated versions for beverage acid protection [V: S27]; Saccharomyces cerevisiae var. boulardii CNCM I-1079 — pure powder 20B CFU/g guaranteed 36 months at 25°C, capsules 5B/10B CFU, organic powder grade [V: S30, S31]; Tyndallized/inactivated probiotic grades [V via Alibaba listing in results]; dairy starter cultures (Novonesis strain-collection position) [V: S32]; multi-strain probiotics, synbiotics and ingredient-mixture category [V: S2]; B. longum, L. acidophilus NCFM, Bacillus coagulans (GanedenBC30) [C].
**Spec attributes:** strain designation (CNCM/ATCC codes), CFU/g at release and guaranteed shelf life, dosage form (powder/capsule/drop/frozen), microencapsulation, organic, infant grade, storage temperature.
**Search vocabulary:** "bifidobacterium lactis BB-12 probiotic powder", "saccharomyces boulardii CNCM I-1079 20 billion CFU/g organic", "lactobacillus rhamnosus GG freeze-dried 350 billion CFU/g".
**Grounding:** S30–S33, S27, S2.

## 18. Enzymes

**Subtypes (classes + examples):** proteases; amylases; glucoamylases; cellulases [V: S48]; lipase [V: S50]; lactase [V: S9 DigeZyme five-enzyme complex: amylase, protease, lipase, cellulase, lactase]; pectinases; invertases; rennet/chymosin and microbial milk coagulants [V: S50]; transglutaminase [V: S50]; bacterial alpha-amylase in granulate format (BAN — anti-staling organic baking) [V: S49]; COROLASE 7089 liquid bacterial endopeptidase [V: S48]; application ranges: baking, fruit/vegetable/juice, grains, oilseeds, protein processing, plant-based dairy [V: S48]; bromelain, papain [C].
**Spec attributes:** enzyme class/activity units, format (granulate vs liquid), organic-grade availability, application, Non-GMO/GMP.
**Search vocabulary:** "bacterial alpha-amylase granulate baking", "microbial rennet cheese", "multi-enzyme complex amylase protease lipase".
**Grounding:** S48–S50, S9.

## 19. Fibers & Prebiotics

**Subtypes:** micronized psyllium fiber (branded, Prinova) [V: S1]; fenugreek fiber fraction — ≥50% total dietary fiber [V: S9]; galactomannan fiber — ≥60% [V: S9]; soluble corn fiber [V: S5]; citrus fiber [V: S6]; fructooligosaccharide (FOS) [V: S35]; beta-1,3-glucan [V: S35]; seaweed fiber [V: S35]; inulin (chicory), GOS, XOS, polydextrose, resistant dextrins [C — fiber category verified at Batory [S3]; these specific subtypes not page-verified this session].
**Spec attributes:** solubility, fiber %, source, organic, sweetness contribution, tolerance/dosage.
**Search vocabulary:** "soluble corn fiber non-GMO", "chicory inulin organic" [C], "micronized psyllium".
**Grounding:** S1, S9, S5, S3, S6, S35.

## 20. Fats, Oils & Specialty Lipids

**Subtypes:**
- MCT: coconut MCT oil 60/40 (100% coconut-derived C8 caprylic + C10 capric) [V: S39]; C8 50–60% / C10 35–40% composition spec; organic and non-organic variants [V: S40]; MCT powders [C].
- Omega-3 concentrates — the industry codes are the search vocabulary: 1812EE/TG, 3322EE, 3624EE/TG/rTG (EPA 36% + DHA 24%; total omega-3 ≥65% on concentrates; concentrated TG products TG level ≥60%) [V: S41, S42]; cod-liver and standard 18/12 oils [V: S41].
- Algal omega-3: DHA algal oil ≥40% / ≥50% (TG form, solvent-free); microencapsulated DHA algae powder ≥10% / ≥20% [V: S43]; DHA (TG) powder 10/20/30% [V: S44]; algal DHA + ARA oil 40–55% / powder 10–20% [V: S45]; organic Schizochytrium powder 20% [V: S46].
- Other: cold-pressed citrus oils [V: S1]; natural cocoa butter [V: S35]; fats & oils category [V: S3]; high-oleic sunflower, flaxseed oil, CBEs, shea fractions [C].
**Spec attributes:** EPA/DHA %, molecular form (TG/EE/rTG), tunic/TOTOX oxidation limits [C], source (fish species, algae), organic, powder carrier.
**Search vocabulary:** "fish oil 3624 rTG", "MCT oil 60/40 coconut organic", "algal DHA powder 20% TG microencapsulated".
**Grounding:** S39–S46, S1, S3, S35.

## 21. Emulsifiers & Lecithins

**Subtypes:** lecithins as a Batory top-level category [V: S3]; emulsifiers/stabilisers/thickeners as a Prinova additive group [V: S2]; sunflower lecithin (fluid/deoiled), mono- and diglycerides, polysorbates, DATEM [C — subtypes not page-verified this session].
**Spec attributes:** oilseed source (sunflower vs soy), bleached/unbleached, HLB, Kosher, Non-GMO, liquid vs powder.
**Search vocabulary:** "sunflower lecithin non-GMO liquid" [C].
**Grounding:** S3, S2. Thinner category — flagged for supplier-onboarding verification.

## 22. Colors — Natural & Synthetic

**Subtypes:** natural colorants from fruits, vegetables and plant sources, single or custom blends [V: S1]; curcumin — turmeric oleoresin or turmeric crystals [V: S37]; paprika oleoresin, E160c, capsanthin-rich [V: S38]; carotenoids category [V: S2]; colors application group [V: S1]; annatto, beetroot red, spirulina blue, anthocyanins, carmine, beta-carotene beadlets, FD&C lakes [C — not page-verified this session].
**Spec attributes:** hue, color strength, oil vs water dispersible, natural-origin compliance (ISO 16128), Kosher/Halal, stability in pH/application.
**Search vocabulary:** "turmeric oleoresin color", "paprika oleoresin E160c", "spirulina blue color powder" [C].
**Grounding:** S1, S37, S38, S2.

## 23. Flavors, Aroma Chemicals & Taste Modulators

**Subtypes:** aroma chemicals — natural and synthetic ("one of the world's largest aroma chemical suppliers") [V: S1]; bulk essential oils [V: S1]; cold-pressed citrus oils and blends [V: S1]; flavourings + flavour enhancers category [V: S2]; menthol crystals, peppermint oil, D-limonene, vanilla/vanillin/natural vanillin/ethyl vanillin, cinnamon bark oil, ginger oils, carrot seed oil [V: S35]; bitter blocking via thaumatin [V: S16]; sweetness enhancers [V: S1].
**Spec attributes:** natural vs synthetic, FEMA/COA docs [C], solubilizer format, dosage, allergen.
**Search vocabulary:** "menthol crystals natural", "natural vanillin", "cold-pressed orange oil".
**Grounding:** S1, S2, S35, S16.

## 24. Cocoa, Coffee & Tea

**Subtypes:** cocoa & chocolate; coffee; teas; tea blend components — four distinct Batory categories [V: S3]; natural cocoa powder, alkalized cocoa powder, natural cocoa butter [V: S35]; green coffee/instant coffee, matcha [C].
**Spec attributes:** alkalization level, fat content (%), origin, cut/grade, organic, caffeine content.
**Search vocabulary:** "alkalized cocoa powder 10-12%" [C], "organic cocoa butter", "tea blend components".
**Grounding:** S3, S35.

## 25. Spices, Herbs & Seasonings

**Subtypes:** seeds & spices category [V: S3]; seasonings application group [V: S1]; BioPerine black pepper extract ≥95% piperine [V: S9]; cinnamon bark extract 20% polyphenols [V: S9]; turmeric oleoresin (dual color/flavor use) [V: S37]; spice oleoresins, garlic/onion powders [C].
**Spec attributes:** pungency/marker %, oleoresin vs powder, origin, sterilization method (ETO vs steam [C]).
**Search vocabulary:** "black pepper extract 95% piperine", "spice oleoresin".
**Grounding:** S3, S1, S9, S37.

## 26. Fruits, Vegetables & Superfruit Powders

**Subtypes:** juice concentrates, purees, powders, and blends [V: S3]; freeze-dried coconut liquid endosperm (Cococin, GRAS affirmed) [V: S9]; amla superfruit extract [V: S9]; seabuckthorn juice [V: S35]; fruits & vegetables category [V: S3]; berry extracts, greens powders [C].
**Spec attributes:** drying method (freeze-dried vs spray), Brix (concentrates), organic, fruit/veg part, 100% fruit vs standardization.
**Search vocabulary:** "freeze-dried fruit powder organic", "fruit juice concentrate 65 brix" [C].
**Grounding:** S3, S9, S35.

## 27. Salts, Phosphates & Anti-caking Agents

**Subtypes:** salts as a Batory top-level category [V: S3]; phosphates (named in Batory's dairy-ingredient line) [V: S3-dairy]; sodium acid pyrophosphate, tripotassium phosphate [V: S35]; sodium citrate/potassium citrate (dual acidulant/buffer roles) [V: S35]; anti-caking agents as a Prinova additive group [V: S2]; silicon dioxide [V: S35]; tricalcium phosphate, sodium hexametaphosphate [C].
**Spec attributes:** grade (FCC), function (flow agent vs emulsifying salt), mesh, Kosher/Halal.
**Search vocabulary:** "sodium acid pyrophosphate food grade", "anti-caking silicon dioxide".
**Grounding:** S3, S2, S35.

## 28. Algae & Marine Ingredients

**Subtypes:** spirulina powder, chlorella powder, astaxanthin (Haematococcus pluvialis) powder and algal oil [V: S47]; Schizochytrium (algal DHA) oil and powders [V: S43–S46]; alginates and oligosaccharides, fucoidan, chitosan [V: S35]; fish gelatin [V: S35]; "Algae" as a Prinova top group (Algae, Botanicals, Carotenoids, Flavonoids) [V: S2]; carrageenan/agar (seaweed-derived; cross-ref category 6) [V: S6, S35]; kelp/iodine extracts [C].
**Spec attributes:** phycocyanin/astaxanthin %, organic cert, cultivation vs harvest origin, heavy-metal COAs.
**Search vocabulary:** "organic spirulina powder", "astaxanthin haematococcus 5%", "schizochytrium powder organic".
**Grounding:** S47, S43–S46, S35, S2.

## 29. Personal Care — Surfactants & Cleansing

**Subtypes:** surfactant (anionic), surfactant (nonionic), surfactant (amphoteric) as indexed Knowde functions [V: S56]; foaming agent, foam booster, foam stabilizer, wetting agent, viscosity modifier [V: S56]; real INCI examples: Cocamide DIPA (foaming/solubilizing/viscosity), Sorbitan Oleate Decylglucoside Crosspolymer (solubilizer/co-emulsifier) [V: S56]; SCI, coco-glucoside, cocamidopropyl betaine [C].
**Spec attributes:** INCI name, charge class (anionic/nonionic/amphoteric), function tags, COSMOS/ECOCERT, origin (plant/biotech).
**Search vocabulary:** "coco-glucoside natural surfactant" [C], filter by "Surfactant (Nonionic)" + "ECOCERT".
**Grounding:** S56.

## 30. Personal Care — Emulsifiers, Emollients & Oils

**Subtypes:** emulsifier / co-emulsifier / stabilizer / solubilizer functions [V: S56]; Glyceryl Laurate (co-emulsifier, emollient, anti-microbial) with ECOCERT/COSMOS/organic-certified tags [V: S56]; Butyrospermum Parkii (Shea) Butter with origin tags (Plant Origin, Non-Animal, Natural) [V: S56]; emollient/texturizing agent functions [V: S56]; caprylic/capric triglyceride, squalane, cetearyl alcohol, glyceryl stearate [C].
**Spec attributes:** INCI, natural-origin (ISO 16128), certifications, texture/hLB.
**Search vocabulary:** "shea butter refined organic INCI", "caprylic capric triglyceride COSMOS" [C].
**Grounding:** S56.

## 31. Personal Care — Actives, Humectants & Botanicals

**Subtypes:** moisturizing agent + film former functions (Biosaccharide Gum-1 — with ISO 16128/organic/COSMOS/ECOCERT/Halal/IECIC compliance stack) [V: S56]; prebiotic function (Alpha-Glucan Oligosaccharide, biotech origin) [V: S56]; skin barrier protectant (Octyldodecyl PCA) [V: S56]; UV filter + protective agent functions [V: S56]; astringent, matting agent [V: S56]; niacinamide, panthenol, sodium hyaluronate, bakuchiol, allantoin [C — sodium hyaluronate does appear in one supplier's additive catalog [S35], the others not page-verified this session]; aloe/centella botanicals [C, centella powder V at S51].
**Spec attributes:** INCI, function, claim support, cert stack (COSMOS/ECOCERT/ISO 16128/Halal), origin (biotech/plant).
**Search vocabulary:** "biosaccharide gum-1 moisturizing film former", "centella asiatica powder", "niacinamide USP" [C].
**Grounding:** S56, S51, S35.

## 32. Personal Care — Preservation & Chelation

**Subtypes:** personal-care preservative systems indexed by INCI + product form + spectrum + compliance columns (COSMOS approved / vegan / halal / ISO 16128 natural-origin content) [V: S57]; preservative-boosting multitaskers (UniProtect 1,2-HD — preservative + humectant + emollient) [V: S58]; natural preservative pairing (caprylic acid + Origanum vulgare leaf extract — preservative/bacteriostatic) [V: S56]; disodium EDTA [V: S35]; phenoxyethanol, ethylhexylglycerin, sodium benzoate (personal-care grade) [C]; the "allowed in COSMOS/ECOCERT final formulations" distinction is itself a real filter [V: S57].
**Spec attributes:** INCI, spectrum (gram+ / gram− / yeast/mold), dosage, global regulatory listing, COSMOS/ECOCERT allowance.
**Search vocabulary:** "preservative COSMOS approved broad spectrum", "ethylhexylglycerin phenoxyethanol blend" [C].
**Grounding:** S57, S58, S56, S35.

## 33. Premixes, Blends & Synbiotics

**Subtypes:** nutrient premixes for RDA fortification and label claims (joint care, immunity, digestive balance) [V: S1]; custom vitamin/mineral premixes and blends [V: S1]; functional systems/blends (Corbion) [V: S11]; "Ingredient Mixtures, Synbiotics" as a Prinova category [V: S2]; hydrocolloid functional blends (carrageenan+pectin+xanthan emulsifying systems) [V: S6].
**Spec attributes:** claim target, nutrient levels with tolerances, allergen segregation, documentation.
**Search vocabulary:** "vitamin premix immunity claim", "synbiotic blend supplier".
**Grounding:** S1, S2, S11, S6.

---

# Example brand search queries (55)

Real buyer-style queries built from verified supplier vocabulary; [C] marks where the subtype term itself was not page-verified this session.

1. organic ashwagandha root extract 5% withanolides
2. ashwagandha root extract 2.5% total withanolides by gravimetry
3. rhodiola rosea extract 3% rosavins 1% salidroside organic
4. bacopa monnieri extract 50% bacosides
5. boswellia serrata extract 30% AKBA
6. curcumin C3 Complex 95% curcuminoids
7. black pepper extract 95% piperine (BioPerine)
8. amla extract 10% beta-glucogallin GRAS
9. organic moringa leaf extract 10:1
10. centella asiatica powder bulk
11. green tea extract 95% EGCG water-extracted [C]
12. organic lion's mane fruiting body extract 30% beta-glucans dual extract
13. reishi extract standardised triterpenoids ganoderic acid
14. cordyceps fruiting body extract powder
15. bifidobacterium lactis BB-12 probiotic powder
16. saccharomyces boulardii CNCM I-1079 20 billion CFU/g organic
17. lactobacillus rhamnosus GG freeze-dried 350 billion CFU/g
18. multi-strain probiotic 100B CFU/g microencapsulated
19. stevia Reb A 97% powder FSSC 22000
20. Reb M steviol glycosides high purity
21. organic monk fruit extract mogroside V 25%
22. monk fruit extract 50% mogroside V wholesale
23. liquid allulose 70 DS
24. crystalline allulose 95%+ purity
25. thaumatin sweetener bitter blocking natural
26. erythritol non-GMO bulk
27. sucralose FCC food grade
28. citric acid anhydrous FCC kosher halal
29. malic acid DL FCC
30. natamycin 50% in lactose
31. potassium sorbate granular FCC
32. sodium benzoate prill powder
33. cultured sugar vinegar powder preservative clean label
34. xanthan gum 40 mesh food grade
35. gellan gum high acyl COSMOS vegan
36. pectin citrus rapid set
37. whey protein concentrate 80% instantized [C]
38. instant nonfat dry milk low heat [C]
39. vitamin D3 100,000 IU/g cold water dispersible kosher halal
40. Quatrefolic 5-MTHF bulk
41. magnesium bisglycinate chelate Albion TRAACS 10% elemental
42. zinc picolinate 20% elemental food grade
43. creatine monohydrate Creapure
44. L-citrulline DL-malate 2:1
45. MCT oil 60/40 coconut organic
46. fish oil 3624 rTG EPA 36% DHA 24%
47. algal DHA powder 20% TG microencapsulated
48. sunflower lecithin non-GMO liquid [C]
49. turmeric oleoresin natural color
50. paprika oleoresin E160c capsanthin
51. menthol crystals natural peppermint
52. organic spirulina powder phycocyanin
53. schizochytrium powder organic 20%
54. soluble corn fiber non-GMO
55. vitamin premix immunity joint care claim

(55 listed — exceeds the 30+ target.)

---

# Exclusions (and why)

- **Cannabis/hemp-derived cannabinoids (CBD, delta variants):** real sourcing category, but heavily jurisdiction-dependent; deliberately deferred for v1 so the taxonomy doesn't imply regulatory clearance. Revisit as a dedicated category with legal-review flags.
- **Finished goods, private-label finished supplements, sauces & condiments as products** (Batory lists "Sauces & Condiments" [S3]): these are finished goods, not ingredient inputs — excluded from the ingredient tree.
- **Feed-grade and pet-grade ingredient lines** (enzyme/algae suppliers carry them [S46, S49]): out of scope for a CPG food/beauty marketplace; kept out even where the same supplier offers both.
- **Industrial/technical enzymes and processing aids** (laundry amylases [S49], solvent extraction chemicals): not brand-facing ingredients.
- **Raw agricultural commodities without ingredient processing** (whole produce, bulk grains as commodities): the marketplace matches ingredient suppliers, not commodity trading desks.
- **Purely chemical intermediates** (diketene, acetaldehyde, crotonaldehyde — which appear in one supplier's antioxidant page [S35] as chemistry artifacts): not CPG brand-purchasable ingredients; excluded despite appearing on a supplier page.

---

# Source Log (retrieved September 19, 2026)

Retrieved = live page fetch or indexed snapshot; noted per entry. Search-snippet provenance (from the research tool's cited results) is marked "snippet"; direct fetches marked "fetched."

- S1. Prinova — Food Ingredients (prinovaglobal.com/us/en/ingredients/food) — fetched. Categories: amino acids (BCAA/EAA/NEAA), proteins (soy/pea/rice), sweeteners, natural colors, vitamins & derivatives, hydrocolloids & thickeners (xanthan, guar, LBG, sodium alginate), aroma chemicals, premixes, citrus oils; branded: bone broth protein, micronized psyllium, instant egg white protein.
- S2. Prinova profile — ingredientsnetwork.com (glycine USP page + "Ingredients Categories" sidebar) — snippet. Groups: Additives incl. Flavourings & Colours (acidulants, anti-caking, antioxidants, colours, emulsifiers/stabilisers/thickeners, flavour enhancers, flavourings, preservatives, sweeteners); Algae, Botanicals, Carotenoids, Flavonoids; Fungi & Yeasts, Microorganisms & Probiotics, Mushrooms; Cereals & Grains, Pulses; Dairy; Eggs; Mixtures/Synbiotics; Proteins, Enzymes, Amino Acids; Syrups; Vitamins, Minerals.
- S3. Batory Foods — Products (batoryfoods.com/products) — fetched + snippet. 25 categories: Acidulants, Animal Proteins, Cocoa & Chocolate, Coffee, Dairy Commodities, Dairy Proteins, Eggs, Fats & Oils, Fibers, Flours & Grains, Fruits & Vegetables, Functional & Fine Ingredients, Hydrocolloids, Lecithins, Oats, Plant Proteins, Rice, Salts, Sauces & Condiments, Seeds & Spices, Specialty Ingredients, Starches, Sweeteners, Tea Blend Components, Teas. Dairy page names "gums, oils, phosphates, preservatives, seeds & spices, sweeteners". Frozen-entrées page: corn/potato/tapioca/wheat/rice starches, modified + unmodified; juice concentrates, purees, powders, blends.
- S4. ADPI supplier listing — Batory Foods (adpi.org) — snippet. Dairy types: anhydrous milkfat, butter/churned milkfat, casein, acid caseinates, concentrated butter flavors, cream/dry cream powder, dry buttermilk, dry whey (sweet, acid), dry whole milk, instant nonfat dry milk, lactoferrin, lactose (food grade).
- S5. Prepared Foods — "Batory Foods: Sweet Solutions" — snippet. B-FIBER line: erythritol, soluble corn fiber, allulose, stevia extract.
- S6. CP Kelco — Ingredients & Products (cpkelco.com/products-) — fetched. Portfolio: carrageenan, citrus fiber, diutan gum, fermentation-derived cellulose, gellan gum, microparticulated whey protein concentrate, pectin, refined locust bean gum, xanthan gum.
- S7. TraceGains Gather — CP Kelco supplier page — snippet. KELCOGEL F gellan (fine mesh, dry mixes/high solids, foods AND personal care); KELTROL xanthan; KELCOGEL HS-B (beverage suspension); KELCOGEL MA-60 (plant-based meat, methylcellulose alternative).
- S8. Bakery&Snacks CP Kelco article + CP Kelco gellan archive — snippet. Range: xanthan, gellan, carrageenan, pectin, cellulose gum (CEKOL), microparticulated whey protein; GENU pectin/carrageenan; COSMOS/NATRUE/ISO 16128/vegan/kosher/halal compliance table per ingredient.
- S9. Sabinsa — Products (sabinsa.com/products) — fetched. Full standardization lines quoted in category 14; 130+ standardized extracts; GRAS-affirmed products (Saberry, Cococin, CurCousin); DigeZyme enzyme complex.
- S10. Nammex — nammex.com — fetched. 100% organic fruiting-body extracts; beta-D-glucan quantified per production lot, published per product page; no starch/grain filler; Purity-IQ identity authentication; sample COAs.
- S11. Corbion — Food markets (corbion.com/en/Markets/Food) — fetched. PURAC lactic acid & powders; Origin natural antioxidants; lactic acid/lactates/derivatives; fermentation & preservation; fortification; functional blends; market list (bakery, beverages, confectionery, dairy, meat, sauces...).
- S12. Corbion — Verdad Opti page — snippet. Declared "cultured sugar, vinegar"; powder format, low sodium.
- S13. Corbion press release — snippet. Fermentation-based range: vinegar, cultured dextrose, cultured sugar, cultured onion and celery; "cultured corn sugar" labeling.
- S14. Ingredion — ASTRAEA Allulose + Liquid Allulose 70000371 tech spec — snippet (tech PDF). Liquid 70% DS (70.0–72.0), allulose ≥95% d.b.; 0.4 kcal/g; not counted toward total/added sugars (2019 FDA guidance).
- S15. Matsutani — ASTRAEA page — snippet. Crystalline allulose >95% purity, ~70% sweetness of sucrose, enzymatic epimerization.
- S16. Natex — thaumatin.com — snippet. ThaumActive: pure thaumatin formulated-ingredient portfolio; sweetening + bitter blocking.
- S17. Tmatin — tmatin.com — snippet. Thaumatin ~3,000x sucrose, from Thaumatococcus daniellii arils.
- S18. GL Stevia — Reb-A97 pages — snippet. "one specification with Reb A >97%", ~280x sucrose; organic stevia options.
- S19. Icon Foods — SteviaSweet line — snippet. Ten grades: Reb A 95–99%, high-purity Reb M and Reb D, blends, glucosylated (enzyme-treated) stevia.
- S20. ChemPoint — PureCircle Reb A 97 (Ingredion) — snippet. 290x sweetness.
- S21. Ingredients Network — Real Stevia Reb A 97 (powder or granulate), FSSC 22000 — snippet. Purity >97% steviol glycosides, Reb A ≥97%, water max 6%.
- S22. Cargill — EverSweet — snippet. Reb M and Reb D steviol glycosides.
- S23. Blue Eyes Bio — monk fruit — snippet. Mogroside V 5–65% (HPLC), fresh fruit, Siraitia grosvenorii.
- S24. Nutramax — monk fruit — snippet. 20–50% mogroside V; 80%/95%/98% mogrosides grades.
- S25. NHU Life Science — Vitamin D3 pages — snippet. D3 100,000 IU/g CWS-S (spray-dried, CWD, modified starch) and CWS-A (gum acacia, tocopherol-stabilized); 2.5 mg/g; kosher+halal certified; 20/25 kg packs.
- S26. ChemPoint — Divis Vitamin D3 100 SD — snippet. Matrix: modified starch, sucrose, coconut oil.
- S27. foodingredients.net — D3 powder, L. rhamnosus GG, zinc picolinate listings — snippets. D3 100k/500k IU/g; LGG 100–500B CFU/g freeze-dried + microencapsulated; zinc picolinate ~20% elemental; ISO/FSSC 22000/Halal/Kosher docs.
- S28. Creapure (Alzchem) — creapure.com — snippet. "brand name for pure creatine monohydrate produced by Alzchem Trostberg GmbH".
- S29. NatuGena — Quatrefolic listing — snippet. Folate as 5-MTHF (Quatrefolic).
- S30. Lallemand — S. boulardii Pure product range — snippet. CNCM I-1079; powder 20B CFU/g (36 months, 25°C); 5B/10B CFU capsules.
- S31. Lallemand Health Solutions — organic S. boulardii — snippet. Organic powder, pure ingredient for organic supplements.
- S32. Novonesis — B. lactis BB-12 + Nu-trish BB-12 NFM + dairy cultures — snippets. "world's most documented bifidobacterium"; single-strain for lactase-treated/flavored milk; frozen cultures; LGG multi-format.
- S33. Farmalabor — LGG technical datasheet — snippet. L. rhamnosus GG 350 billion CFU/g freeze-dried.
- S34. J.Shine — Food Preservatives — snippet. Natamycin FCC IV/USP; 50% in glucose / lactose / NaCl; 95%.
- S35. Newseed Chemical — foodsweeteners.com — fetched. Full enumerated catalog: Acidulents (32), Amino Acid (42), Antioxidants (22), Aromas (22), Cocoa Series, Nutritional supplements (23), Preservatives (52), Sweeteners (65), Thickeners (53), Vitamins (105), Plant Extracts (204). All subtype names quoted in categories 1–5, 11, 12, 19–22, 27, 28, 31, 32 come from this page.
- S36. SDI Chemicals — Preservatives & Acidulants — fetched. "All grades are FCC/food grade with COA per lot; SDS, Kosher, and Halal documents on request. Packaging from 25 kg boxes and bags to full pallets (1 MT) and container loads." Products: citric (anhydrous/monohydrate), DL-malic, lactic, fumaric, sorbic acid, potassium sorbate granular, sodium benzoate (powder/prill/granular), benzoic acid, calcium propionate, potassium metabisulfite.
- S37. Oterra — turmeric page — snippet. Curcumin as turmeric oleoresin or turmeric crystals.
- S38. Imbarex — imbarex.com — snippet. Paprika oleoresin supplier (E160c), capsanthin-rich, direct manufacturer.
- S39. Bioriginal — MCT Oil 60/40 — snippet. 100% coconut-derived C8 + C10.
- S40. Irie Coco — 6040 MCT Oil — snippet. C8 50–60%, C10 35–40%; organic/non-organic variants.
- S41. ProVita Biotech — Bulk fish oil specifications — snippet. Codes 1812EE/TG, 3322EE, 3624EE/TG/rTG; 3624 = EPA 36% + DHA 24%; total omega-3 ≥65%; concentrated TG ≥60%.
- S42. Icelandirect — fish oils — snippet. Omega-3 36/24 TG and 36/24 EE.
- S43. AMULYN — DHA algal oil & powder — snippet. Oil ≥40%/≥50% TG, solvent-free; microencapsulated powder ≥10%/≥20%; GMP-certified.
- S44. Seawit Health — algal DHA powder — snippet. DHA (TG): 10/20/30%.
- S45. ATK Biotech (via GOED member listing) — snippet. Algal DHA + ARA: oil 40–55%, powder 10–20%.
- S46. HUISON Biotech — snippet. Organic-certified Schizochytrium powder (20%).
- S47. Protoga (Zhuhai) — company categories — snippet. Haematococcus pluvialis powder / astaxanthin algal oil / Schizochytrium powder / spirulina powder / chlorella powder.
- S48. AB Enzymes — plant-based dairy page + industries — snippets. Classes: cellulases, proteases, amylases, glucoamylases; COROLASE 7089 liquid bacterial endopeptidase.
- S49. Novonesis — BAN product page — snippet. Bacterial alpha-amylase, granulate format, anti-staling organic baking.
- S50. "Enzymes Used in the Food Industry" (Czech Univ. PDF, via search) — snippet. Rennet/chymosin, microbial milk coagulants, pectinases, invertases, transglutaminase; protease hydrolysates (imimg PDF, same category).
- S51. IngredientsOnline.com — product listings — snippets. "Ashwagandha Root Extract 2.5% Total Withanolides by Gravimetry" (JK Botanicals); "Rhodiola Rosea Extract 3% Rosavins 1% Salidroside" (Organic Herb Inc); "Boswellia Powder Extract 30% AKBA"; "Organic Moringa Leaf Extract 10:1"; Centella asiatica powder; carob. Catalog groups: amino acids, animal-derived, botanical/herbal, enzymes & probiotics, excipients.
- S52. FunctionalMushrooms.eu — lion's mane — snippet. Dual extract (hot water + ethanol), 100% fruiting body, certified organic.
- S53. Aloha Fungi B2B — snippet. Hydroalcoholic fruiting-body extracts, optional standardization on β-glucans, triterpenoids (ganoderic acid), hericenones & erinacines.
- S54. Mushroom Plenty — snippet. Fruiting bodies only; 4:1 hot-water extract; >20% beta-glucans; not mycelium-on-grain; COA-verified.
- S55. Bioshroom — snippet. 100% fruiting body; 400-micron powder; 1–5 mm tea-cut granules; >30% beta-glucans.
- S56. Knowde — cosmetic ingredient listings (Solabia, Colonial Chemical, Kemin stores) — snippets. Filter facets: INCI Name, Ingredient Origin (Plant/Biotech/Natural/Non-Animal), Functions (Moisturizing Agent, Film Former, Prebiotic, Cleansing Agent, UV Filter, Antioxidant, Emollient, Co-Emulsifier, Surfactant (Anionic/Amphoteric/Nonionic), Foaming Agent, Solubilizer, Viscosity Modifier, Skin Barrier Protectant, Astringent, Matting Agent), Certifications & Compliance (COSMOS, ECOCERT, ECOCERT GREENLIFE, Organic Certified, ISO 16128, Halal, NaTrue, IECIC China). Example INCI products: Biosaccharide Gum-1, Alpha-Glucan Oligosaccharide, Glyceryl Laurate, Cocamide DIPA, Sorbitan Oleate Decylglucoside Crosspolymer, Butyrospermum Parkii (Shea) Butter, Octyldodecyl PCA, caprylic acid + Origanum vulgare leaf extract (preservative).
- S57. Knowde — Personal Care Preservatives catalog PDF — snippet. Indexed by INCI name, product form, spectrum, ISO 16128 natural-origin content, COSMOS approved, vegan, halal; "allowed in COSMOS & ECOCERT final formulations" distinction.
- S58. UL Prospector — certification search pages — snippets. Search by ECOCERT, COSMOS, USDA Organic, NPA certifications; UniProtect 1,2-HD (preservative + humectant + emollient).
- S59. Nutrixeal + PricePlow — Albion TRAACS magnesium — snippets. Mg bisglycinate chelate ~10% elemental; buffered grade 18% (with MgO); taste-free 8%; TRAACS = The Real Amino Acid Chelate System (Albion/Balchem).
- S60. Global Calcium — zinc picolinate — snippet. ~20% elemental zinc.

**Notes on failed fetches:** knowde.com/markets/food-beverage, jungbunzlauer.com/products, beneo.com/products, usdec.org/products, and usp.org FCC page did not render this session (blocked or JS-only). No claims in this document rely on those pages; where that left a subtype unverified, it is marked [C] above.

---

# Implementation notes for the marketplace

1. **Category model:** 33 top-level categories (4 domains: Food & Beverage Core, Nutrition & Supplement Actives, Beauty & Personal Care, Cross-cutting Systems), subtypes as searchable child records, not hardcoded strings.
2. **Facet engine:** the global facet schema maps directly to filters; for botanicals/mushrooms/probiotics make the "spec string" (marker % + method + strain + CFU) a first-class parsed field — every supplier page observed writes specs into product titles.
3. **[C] backlog:** subtypes marked [C] are the supplier-onboarding verification backlog — do not show filter values on the storefront until a supplier page proves them.
4. **Unknown labels:** consistent with the provenance rulebook, quote-only pricing and unverified subtype claims display as "Unknown — pending verification."

---

# Completion note

- **Top-level categories: 33** (target was 20+), spanning food, beverage, supplement, and personal care, including all requested mainstream and specialized groups (sweeteners incl. allulose/thaumatin, spices, coffee, cocoa, dairy powders, starches, oils, flavors, colors, preservatives, vitamins/minerals, adaptogens, nootropics, functional mushrooms, standardized botanical extracts, specialty oils, enzymes, cultures/probiotics, hydrocolloids, acidulants, fibers, amino acids, protein hydrolysates).
- **Subtypes: 324 named subtype entries** (counted by parsing the Subtype fields; method: split on semicolons/bullets). Of these, 206 carry an explicit [V] tag on the fragment and 29 an explicit [C] tag; the remainder are covered by run-level tags (e.g. "all [V: S35, S36]") — every entry resolves to a source ref either directly or through its run.
- **Search queries: 55 example brand queries** (target 30+), built from vocabulary observed on live supplier listings.
- **Excluded:** cannabinoids (jurisdiction-dependent, deferred with rationale), finished goods, feed/pet lines, industrial enzymes/processing aids, raw commodity trading, and non-CPG chemical intermediates — each with the reason stated above.
- **Weakest area, flagged honestly:** Protein Hydrolysates & Peptides (category 10) — category is real (verified enzymatic hydrolysate practice) but its four subtypes are [C]-marked candidates.
