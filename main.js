'use strict;'

let DOMContenu;


function ChargerPage(page){
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			let contenuPage = AnalyseMD(xhr.response);
			DOMContenu.innerHTML = contenuPage;
		}
	};
	xhr.open("GET", page, true);
	xhr.send();
}


let tableauFinal = [];
let etatUL1 = false;
let etatUL2 = false;
let etatOL1 = false;
let etatOL2 = false;
let debutCode = false;


// Pour repérer une liste OL
const regExOL = /^[0-9]*\. /gm;
// ^		au début de la ligne
// [0-9]	des nombres
// \.		un point
// 			un espace
// /gm 		global et multiligne

// Idem pour OL imbriquée
// 			deux espaces au début
const regExOL2 = /^   [0-9]*\. /gm


function AnalyseMD(texte)
{
	// enlever les \r et les lignes de string empty
	let texteSansRetours = texte.replace(/\r+/g,'');
	// console.log(texteSansRetours);
	// Non, on va avoir besoin des \r. Vraiment ? ^^

	// faire un tableau avec tel séparateur
	let texteTableau = texteSansRetours.split('\n');
	// console.log(texteTableau);

	tableauFinal = [];
	debutCode = false;
	etatUL1 = false;
	etatUL2 = false;
	

	for (let i = 0; i < texteTableau.length; i++) {
		let element = texteTableau[i];

		// Tester en amont si on a une UL, une OL, UL imbriquée, OL imbriquée
		// En amont car on va les utiliser plusieurs fois
		let isUL = element.substring(0,2) == '- ';
		let isOL = element.match(regExOL);
		let isULImbriquee = element.substring(0,5) == '   - ';
		let isOLImbriquee = element.match(regExOL2);

		// Si quelque chose de gênant, passer
		if (element === null || element == '' || element == '\r') 
		{
			continue;
		}
		// titre H1
		else if(element.substring(0,2) == '# ')
		{
			VerifierFinUL2(); // UL imbriquée en premier
			VerifierFinOL2(); // OL idem
			VerifierFinUL1(); // UL (parente ou principale) en second
			VerifierFinOL1(); // OL idem

			let justeLeTexte = element.substring(2,element.length);
			let ligne = `<h1>${justeLeTexte}</h1>`;
			tableauFinal.push(ligne);
		}
		// titre H2
		else if(element.substring(0,3) == '## ')
		{
			VerifierFinUL2();
			VerifierFinOL2();
			VerifierFinUL1();
			VerifierFinOL1();

			let justeLeTexte = element.substring(3,element.length);
			let ligne = `<h2>${justeLeTexte}</h2>`;
			tableauFinal.push(ligne);
		}
		// bloc de code ```
		else if(element == '```')
		{
			VerifierFinUL2();
			VerifierFinOL2();
			VerifierFinUL1();
			VerifierFinOL1();

			if(!debutCode)
			{
				debutCode = true;
				tableauFinal.push(`<pre><code>`);
			}
			else
			{
				debutCode = false;
				tableauFinal.push(`</code></pre>`);
			}
		}
		// liste UL ou OL
		else if(isUL || isOL)
		{
			VerifierFinUL2();
			VerifierFinOL2();
			
			let justeLeTexte;
			
			// Si c'est une UL
			if(isUL)
			{
				VerifierFinOL1();
				if(!etatUL1)
				{
					tableauFinal.push(`<ul>`);
					etatUL1 = true;
				}
				justeLeTexte = AnalyserTexte(element.substring(2,element.length));
			}
			// Ou si c'est une OL
			else
			{
				VerifierFinUL1();
				if(!etatOL1)
				{
					tableauFinal.push(`<ol>`);
					etatOL1 = true;
				}
				let debutChaine = element.match(regExOL)[0].length;
				justeLeTexte = AnalyserTexte(element.substring(debutChaine,element.length));
			}
			tableauFinal.push(`<li>${justeLeTexte}</li>`); 
		}
		// liste UL ou OL imbriquées
		else if(isULImbriquee || isOLImbriquee)
		{
			let elementAnalyse;

			// Si c'est une UL
			if(isULImbriquee)
			{
				if(!etatUL2)
				{
					TraiterUL2(`<ul>`);
					etatUL2 = true;
				}

				elementAnalyse = AnalyserTexte(element.substring(4,element.length));
			}
			// Ou si c'est une OL
			else
			{
				if(!etatOL2)
				{
					TraiterUL2(`<ol>`);
					etatOL2 = true;
				}

				let debutChaine = element.match(regExOL2)[0].length;
				elementAnalyse = AnalyserTexte(element.substring(debutChaine,element.length));
			}
			TraiterUL2(`<li>${elementAnalyse}</li>`);
		}
		// IMG
		else if(element.substring(0,2)=='![')
		{
			VerifierFinUL2();
			VerifierFinOL2();
			VerifierFinUL1();
			VerifierFinOL1();

			let crochetOuvrant = element.indexOf('[') + 1;
			let crochetFermant = element.indexOf(']');
				let titre = element.substring(crochetOuvrant,crochetFermant);
			let parentheseOuvrante = element.indexOf('(') +1;
			let parentheseFermante = element.indexOf(')');
				let url = element.substring(parentheseOuvrante,parentheseFermante);
			tableauFinal.push(`<img src="${url}" alt="${titre}">`);
		}
		// paragraphe P ou ligne de code...
		else /*if(element[0].match(/[A-Z]/g) || element.substring(0,2)=='\t')*/
		{
			VerifierFinUL2();
			VerifierFinOL2();
			VerifierFinUL1();
			VerifierFinOL1();

			if(!debutCode)
			{
				if(!etatUL1 && !etatOL1)
				{
					let elementAnalyse = AnalyserTexte(element);
					tableauFinal.push(`<p>${elementAnalyse}</p>`); 
				}
				// else if(etatUL1)
				// {
				// 	tableauFinal.push(`<li>${element}</li>`);
				// }
			}
			else 
			{
				tableauFinal.push(element);
			}
		}
	}

	// Exploration finie.

	// Reste-t-il des UL et OL ouverte ?
	VerifierFinUL2();
	VerifierFinOL2();
	VerifierFinUL1();
	VerifierFinOL1();

	for (let i = 0; i < tableauFinal.length; i++) {
		console.log(tableauFinal[i]);
	}
	// console.log(tableauFinal);


	// Renvoyer le contenu sous forme de string
	// Par défaut, l'array en string contient les séparateur ',' ; je remplace par des retours ligne
	return tableauFinal.join('\r');
}


function TraiterUL2(texteAAjouter)
{
	let dernierEntree = tableauFinal[tableauFinal.length-1]; 
	let chaineSansTagFin = dernierEntree.substring(0,dernierEntree.length-5);
	let index = chaineSansTagFin.length;
	let resultat = dernierEntree.slice(0,index) + texteAAjouter + dernierEntree.slice(index);
	
	tableauFinal[tableauFinal.length-1] = resultat;
}


function VerifierFinUL1()
{
	if(etatUL1) 
	{
		tableauFinal.push(`</ul>`);
		etatUL1 = false;
	}
}


function VerifierFinUL2()
{
	if(etatUL2)
	{
		TraiterUL2(`</ul>`);
		etatUL2 = false;
	}
}

function VerifierFinOL1()
{
	if(etatOL1) 
	{
		tableauFinal.push(`</ol>`);
		etatOL1 = false;
	}
}

function VerifierFinOL2()
{
	if(etatOL2)
	{
		TraiterUL2(`</ol>`);
		etatOL2 = false;
	}
}


// RegEx pour les liens 
const regExLien = /\[.*?\)/g;
// \[ 	obtenir le [ de début 
// .* 	tout caractère, peu importe le nombre d'occurences
// ? 	pour que la recherche soit paresseuse
// \) 	obtenir la ) de fin

// RegEx pour le tag <code> inline
const regExCode = /`.*?`/g;

// RegEx pour les <strong><i>
const regExStrongI = /\*{3}.*?\*{3}/g;
// \*{n}	le nombre d'étoiles au début
// .*		tout caractère, peu importe le nombre
// ?		recherche paresseuse
// \*{n}	le nombre d'étoiles à la fin

// RegEx pour les <strong>
const regExStrong = /\*{2}.*?\*{2}/g;

// RegEx pour les <i>
const regExI = /\*{1}.*?\*{1}/g;


function AnalyserTexte(texte)
{
	// Les liens
	let liens = [...texte.matchAll(regExLien)];

	if(liens.length != 0)
	{
		for (let i = 0; i < liens.length; i++) {
			const e = liens[i][0];
			let crochetOuvrant = e.indexOf('[') + 1;
			let crochetFermant = e.indexOf(']');
				let titre = e.substring(crochetOuvrant,crochetFermant);
			let parentheseOuvrante = e.indexOf('(') +1;
			let parentheseFermante = e.indexOf(')');
			let infos = e.substring(parentheseOuvrante,parentheseFermante);
			let premierEspace = infos.indexOf(' ');
				let url = infos.substring(0,premierEspace);
				let bulle = infos.substring(premierEspace+2,infos.length-1);
			let lien = `<a href="${url}" title="${bulle}" target="_blank" rel="noopener noreferrer">${titre}</a>`;
			// console.log(texte.indexOf(e), e.length);
			texte = texte.replace(e,lien)
		}
	}

	// Les tags code, strong i, strong, i font l'objet du même traitement avec des variations :
	// - tags utilisés ouvrants/fermants,
	// - index dans la chaîne pour effectuer le substring.
	// Exemple : '*' pour l'italique, c'est l'index 1, la longueur totale du texte -1

	// les tag <code>
	texte = VerifierTexteTags(texte, regExCode, 1, '<code>', '</code>');

	// let codes = [...texte.matchAll(regExCode)];
	// if(codes.length != 0)
	// {
	// 	for (let i = 0; i < codes.length; i++) {
	// 		const e = codes[i][0];
	// 		let justeLeTexte = e.substring(1,e.length-1);
	// 		let mot = `<code>${justeLeTexte}</code>`;
	// 		texte = texte.replace(e,mot);
	// 	}
	// }
	
	// Pour les textes en gras, italique, gras-italique, l'ordre est important
	
	// D'ABORD les strong i 
	texte = VerifierTexteTags(texte, regExStrongI, 3, '<b><i>', '</i></b>');
	// let strongItalics = [...texte.matchAll(regExStrongI)];
	// if(strongItalics.length != 0)
	// {
	// 	for (let i = 0; i < strongItalics.length; i++) {
	// 		const e = strongItalics[i][0];
	// 		let justeLeTexte = e.substring(3,e.length-3);
	// 		let chaine = `<b><i>${justeLeTexte}</i></b>`;
	// 		texte = texte.replace(e,chaine);
	// 	}
	// }

	// PUIS les Strong
	texte = VerifierTexteTags(texte, regExStrong, 2, '<b>', '</b>');
	// let strongs = [...texte.matchAll(regExStrong)];
	// if(strongs.length != 0)
	// {
	// 	for (let i = 0; i < strongs.length; i++) {
	// 		const e = strongs[i][0];
	// 		let justeLeTexte = e.substring(2,e.length-2);
	// 		let chaine = `<b>${justeLeTexte}</b>`;
	// 		texte = texte.replace(e,chaine);
	// 	}
	// }

	// ENFIN les i
	texte = VerifierTexteTags(texte, regExI, 1, '<i>', '</i>');
	// let italics = [...texte.matchAll(regExI)];
	// if(italics.length != 0)
	// {
	// 	for (let i = 0; i < italics.length; i++) {
	// 		const e = italics[i][0];
	// 		let justeLeTexte = e.substring(1,e.length-1);
	// 		let chaine = `<i>${justeLeTexte}</i>`;
	// 		texte = texte.replace(e,chaine);
	// 	}
	// }

	return texte;
}


function VerifierTexteTags(texte, regex, index, tagDebut, tagFin)
{
	let instances = [...texte.matchAll(regex)];
	if(instances.length != 0)
	{
		for (let i = 0; i < instances.length; i++) {
			const e = instances[i][0];
			let justeLeTexte = e.substring(index, e.length-index);
			let texteEtTags = `${tagDebut}${justeLeTexte}${tagFin}`;
			texte = texte.replace(e, texteEtTags);
		}
	}

	return texte;
}


document.addEventListener('DOMContentLoaded', ()=>{

	DOMContenu = document.getElementById('contenu');
	
	ChargerPage('page.md');

});