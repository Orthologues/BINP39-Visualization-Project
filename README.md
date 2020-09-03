<h1 align="center">Thesis-Data Collection</h1>
<p align="left">A repository for the data collection stage of my master's degree project in <em>protein truncation</em> at Lund University.</p>
<p>Project tutor: <em>Mauno Vihinen</em></p><br>

[*Relevant Databases*](#RDB)
+ [**N- & C-Terminal variants**](#VariantNC)
+ [**Variants in the middle of sequences originating from exon skipping**](#VariantM)
+ [**Disease related (and not) variants**](#Disease)
+ [**Length-variant Protein domains**](#lenvar)
+ [**Gene sequence variation associated with human phenotypes**](#humangenevar)
+ [**Human gene mutation**](#humangenemutation)
+ [**Proteolytic events**](#proteolytic)
+ [**Annotation of splice isoforms in protein-coding genes**](#spliceIsoform)
+ [**Intein, unseen in human**](#intein)
+ [**Variation benchmark datasets for variation interpretation**](#varibench)

[*Existing papers of relevant analysis*](#papers)
+ [**A meta-analysis of nonsense mutations causing human genetic disease <em>(read)</em>**](#MetaAnalysis)
+ [**The Characteristics of Heterozygous Protein Truncating Variants in the Human Genome**](#HumanTruncation)
+ [**PON-P2: Prediction Method for Fast and Reliable Identification of Harmful Variants.**](#ponp2)
+ [**The Functional Human C-Terminome**](#HumanCTerminome)
+ [**Genome-scale CRISPR-Cas9 knockout screening in human cells**](#crispr9-knockout)
+ [**Genetic screens in human cells using the CRISPR-Cas9 system**](#crispr9-screen)
+ [**The carboxy-terminus, a key regulator of protein function**](#carboxy-terminus)
+ [**ProteinCCD: enabling the design of protein truncation constructs for expression and crystallization experiments**](#protein-ccd)
+ [**PPM1D-truncating mutations confer resistance to chemotherapy and sensitivity to PPM1D inhibition in hematopoietic cells**](#PPM1D-truncating)
+ [**Deletion mutation analysis of the mutS gene in Escherichia coli**](#del-ecoli)
+ [**Gene deletions causing human genetic disease: mechanisms of mutagenesis and the role of the local DNA sequence environment**](#gene-del-disease)
+ [**Random single amino acid deletion sampling unveils structural tolerance and the benefits of helical registry shift on GFP folding and structure**](#random-aa-del)

[*Existing methods for the prediction of the outcome of variants*](#MethodPred)
+ [**MutPred-Indel**](#mutpred-indel)
+ [**SIFT-Indel**](#sift-indel)

[*Tutorials of potentially useful tools for data collection*](#tutorial)
+ [**Jupyter Notebook**](#jupyter)
+ [**Scrapy**](#scrapy)
+ [**Pandas**](#pandas)

<br><a name="RDB"></a>
<h2 align="center">Relevant DataBases</h2>

<a name="VariantNC"></a>
## N- & C-Terminal variants
###
[**TopFind**](https://topfind.clip.msl.ubc.ca/)
+ [Lange PF, Huesgen PF, Overall CM. TopFIND 2.0--linking protein termini with proteolytic processing and modifications altering protein function. Nucleic Acids Res. 2012;40(Database issue):D351-D361](https://www.researchgate.net/publication/51552726_TopFIND_a_knowledgebase_linking_protein_termini_with_function)

<a name="VariantM"></a>
## Variants in the middle of sequences originating from exon skipping
###
[**ExonSkipDB**](https://ccsm.uth.edu/ExonSkipDB/)
+ [Pora Kim, Mengyuan Yang, Ke Yiya, Weiling Zhao, Xiaobo Zhou, ExonSkipDB: functional annotation of exon skipping event in human, Nucleic Acids Research, Volume 48, Issue D1, 08 January 2020, Pages D896–D907](https://academic.oup.com/nar/article/48/D1/D896/5603217#190995057)

[**ASpedia**](http://combio.snu.ac.kr/aspedia/index.html)
+ [Daejin Hyung, Jihyun Kim, Soo Young Cho, Charny Park, ASpedia: a comprehensive encyclopedia of human alternative splicing, Nucleic Acids Research, Volume 46, Issue D1, 4 January 2018, Pages D58–D63](https://academic.oup.com/nar/article/46/D1/D58/4584641)

<a name="Disease"></a>
## Disease related (and not) variants
###
[**ClinVar**](https://www.ncbi.nlm.nih.gov/clinvar/)
+ [Eduardo Pérez-Palma, Marie Gramm, Peter Nürnberg, Patrick May, Dennis Lal, Simple ClinVar: an interactive web server to explore and retrieve gene and disease variants aggregated in ClinVar database, Nucleic Acids Research, Volume 47, Issue W1, 02 July 2019, Pages W99–W105](https://academic.oup.com/nar/article/47/W1/W99/5494761)
+ [Landrum MJ, Lee JM, Riley GR, et al. ClinVar: public archive of relationships among sequence variation and human phenotype. Nucleic Acids Res. 2014;42(Database issue):D980-D985](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3965032/)
+ [Pagel KA, Antaki D, Lian A, et al. Pathogenicity and functional impact of non-frameshifting insertion/deletion variation in the human genome. PLoS Comput Biol. 2019;15(6):e1007112. Published 2019 Jun 14](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6594643/)

<a name="lenvar"></a>
## Length-variant Protein domains
###
[**LenVarDB**](http://caps.ncbs.res.in/lenvardb/)
+ [Mutt E, Mathew OK, Sowdhamini R. LenVarDB: database of length-variant protein domains. Nucleic Acids Res. 2014;42(Database issue):D246-D250](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3964994/)

<a name="humangenevar"></a>
## Gene sequence variation associated with human phenotypes
###
[**LOVD**](https://www.lovd.nl/)
+ [Fokkema IF, Taschner PE, Schaafsma GC, Celli J, Laros JF, den Dunnen JT. LOVD v.2.0: the next generation in gene variant databases. Hum Mutat. 2011;32(5):557-563](https://pubmed.ncbi.nlm.nih.gov/21520333/)
+ [LOVD 3.0 User Manual](http://www.lovd.nl/3.0/docs/LOVD_manual_3.0.pdf)

<a name="humangenemutation"></a>
## Human Gene Mutation 
###
[**HGMD**](http://www.hgmd.cf.ac.uk/ac/introduction.php?lang=english)
+ [Stenson PD, Mort M, Ball EV, et al. The Human Gene Mutation Database: towards a comprehensive repository of inherited mutation data for medical research, genetic diagnosis and next-generation sequencing studies. Hum Genet. 2017;136(6):665-677](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5429360/)

<a name="proteolytic"></a>
## Proteolytic events
###
[**General guide**](http://www.uwm.edu.pl/biochemia/index.php/en/biopep/42-proteolysis)
[**CutDB**](http://cutdb.burnham.org)
+ [Stenson PD, Mort M, Ball EV, et al. The Human Gene Mutation Database: towards a comprehensive repository of inherited mutation data for medical research, genetic diagnosis and next-generation sequencing studies. Hum Genet. 2017;136(6):665-677](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5429360/)

[**MEROPS**](http://merops.sanger.ac.uk/)
+ [Rawlings ND, Barrett AJ, Thomas PD, Huang X, Bateman A, Finn RD. The MEROPS database of proteolytic enzymes, their substrates and inhibitors in 2017 and a comparison with peptidases in the PANTHER database. Nucleic Acids Res. 2018;46(D1):D624-D632](https://pubmed.ncbi.nlm.nih.gov/29145643/)

<a name="spliceIsoform"></a>
## Annotation of splice isoforms in protein-coding genes
###
[**APPRIS**](http://appris-tools.org)
+ [Github Link](https://github.com/appris/appris)
+ [Jose Manuel Rodriguez, Juan Rodriguez-Rivas, Tomás Di Domenico, Jesús Vázquez, Alfonso Valencia, Michael L Tress, APPRIS 2017: principal isoforms for multiple gene sets, Nucleic Acids Research, Volume 46, Issue D1, 4 January 2018, Pages D213–D217](https://academic.oup.com/nar/article/46/D1/D213/4561658)

<a name="intein"></a>
## Intein, unseen in human
###
[**InBase, requires registration**](https://inteins-19.biocenter.helsinki.fi/index.php)
+ [Perler FB. InBase, the New England Biolabs Intein Database. Nucleic Acids Res. 1999;27(1):346-347](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC148179/)

<a name="varibench"></a>
## Variation benchmark datasets for variation interpretation
###
[**VariBench**](http://structure.bmc.lu.se/VariBench/)
+ [Sarkar A, Yang Y, Vihinen M. Variation benchmark datasets: update, criteria, quality and applications. Database (Oxford). 2020;2020:baz117](https://pubmed.ncbi.nlm.nih.gov/32016318/)

<a name="MethodPred"></a>
<br><h2 align="center">Existing methods for the prediction of the outcome of variants</h2>

###
<a name="mutpred-indel"></a>
[**MutPred-Indel**](http://mutpredindel.cs.indiana.edu/)
+ [Mort, M., Sterne-Weiler, T., Li, B. et al. MutPred Splice: machine learning-based prediction of exonic variants that disrupt splicing. Genome Biol 15, R19 (2014)](https://genomebiology.biomedcentral.com/articles/10.1186/gb-2014-15-1-r19#citeas)

<a name="sift-indel"></a>
[**SIFT-Indel**](https://sift.bii.a-star.edu.sg/www/SIFT_indels2.html)
+ [Hu J, Ng PC. SIFT Indel: predictions for the functional effects of amino acid insertions/deletions in proteins. PLoS One. 2013;8(10):e77940. Published 2013 Oct 23](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3806772/)

<a name="papers"></a>
<br><h2 align="center">Existing papers of relevant analysis</h2>

### 
<a name="MetaAnalysis"></a>
[**Mort M, Ivanov D, Cooper DN, Chuzhanova NA. A meta-analysis of nonsense mutations causing human genetic disease. Hum Mutat. 2008;29(8):1037-1047.**](https://pubmed.ncbi.nlm.nih.gov/18454449/)

<a name="HumanTruncation"></a>
[**Bartha I, Rausell A, McLaren PJ, et al. The Characteristics of Heterozygous Protein Truncating Variants in the Human Genome. PLoS Comput Biol. 2015;11(12):e1004647. Published 2015 Dec 7**](https://pubmed.ncbi.nlm.nih.gov/26642228/)

<a name="ponp2"></a>
[**Niroula A, Urolagin S, Vihinen M. PON-P2: prediction method for fast and reliable identification of harmful variants. PLoS One. 2015;10(2):e0117380. Published 2015 Feb 3.**](https://pubmed.ncbi.nlm.nih.gov/25647319/)

<a name="HumanCTerminome"></a>
[**Sharma S, Toledo O, Hedden M, et al. The Functional Human C-Terminome. PLoS One. 2016;11(4):e0152731. Published 2016 Apr 6**](https://pubmed.ncbi.nlm.nih.gov/27050421/)

<a name="crispr9-knockout"></a>
[**Shalem O, Sanjana NE, Hartenian E, et al. Genome-scale CRISPR-Cas9 knockout screening in human cells. Science. 2014**](https://pubmed.ncbi.nlm.nih.gov/24336571/)

<a name="crispr9-screen"></a>
[**Wang T, Wei JJ, Sabatini DM, Lander ES. Genetic screens in human cells using the CRISPR-Cas9 system. Science. 2014**](https://pubmed.ncbi.nlm.nih.gov/24336569/)

<a name="carboxy-terminus"></a>
[**Sharma S, Schiller MR. The carboxy-terminus, a key regulator of protein function. Crit Rev Biochem Mol Biol. 2019**](https://pubmed.ncbi.nlm.nih.gov/31106589/)

<a name="protein-ccd"></a>
[**Mooij WT, Mitsiki E, Perrakis A. ProteinCCD: enabling the design of protein truncation constructs for expression and crystallization experiments. Nucleic Acids Res. 2009;37(Web Server issue):W402-W405**](https://pubmed.ncbi.nlm.nih.gov/19395596/)

<a name="PPM1D-truncating"></a>
[**Kahn JD, Miller PG, Silver AJ, et al. PPM1D-truncating mutations confer resistance to chemotherapy and sensitivity to PPM1D inhibition in hematopoietic cells. Blood. 2018;132(11):1095-1105**](https://pubmed.ncbi.nlm.nih.gov/29954749/)

<a name="del-ecoli"></a>
[**Wu TH, Marinus MG. Deletion mutation analysis of the mutS gene in Escherichia coli. J Biol Chem. 1999;274(9):5948-5952**](https://pubmed.ncbi.nlm.nih.gov/10026220/)

<a name="gene-del-disease"></a>
[**Krawczak M, Cooper DN. Gene deletions causing human genetic disease: mechanisms of mutagenesis and the role of the local DNA sequence environment. Hum Genet. 1991;86(5):425-441**](https://pubmed.ncbi.nlm.nih.gov/2016084/)

<a name="random-aa-del"></a>
[**Arpino JA, Reddington SC, Halliwell LM, Rizkallah PJ, Jones DD. Random single amino acid deletion sampling unveils structural tolerance and the benefits of helical registry shift on GFP folding and structure. Structure. 2014;22(6):889-898.**](https://pubmed.ncbi.nlm.nih.gov/24856363/)


<a name="tutorial"></a>
<br><h2 align="center">Tutorials of potentially useful tools for data collection</h2>

###
<a name="jupyter"></a>
[**Jupyter Notebook**](https://jupyter.org/)
+ [Jupyter Notebook Tutorial: The Definitive Guide](https://www.datacamp.com/community/tutorials/tutorial-jupyter-notebook)
+ [Jupyter Notebook for Beginners: A Tutorial towards .ipynb](https://www.dataquest.io/blog/jupyter-notebook-tutorial/)

<a name="scrapy"></a>
[**Scrapy**](https://docs.scrapy.org/en/latest/intro/tutorial.html)
+ [Python Scrapy tutorial for beginners – 01 – Creating your first spider](https://letslearnabout.net/tutorial/scrapy-tutorial/python-scrapy-tutorial-for-beginners-01-creating-your-first-spider/)
+ [Python Scrapy tutorial for beginners – 02 – Extract all the data!](https://letslearnabout.net/tutorial/python-scrapy-tutorial-for-beginners-02-extract-all-the-data/)

<a name="pandas"></a>
[**Pandas**](https://pandas.pydata.org/docs/)
+ [Selecting Subsets of Data in Pandas: Part 1](https://medium.com/dunder-data/selecting-subsets-of-data-in-pandas-6fcd0170be9c)
+ [How to select rows from a DataFrame based on column values?](https://stackoverflow.com/questions/17071871/how-to-select-rows-from-a-dataframe-based-on-column-values)
