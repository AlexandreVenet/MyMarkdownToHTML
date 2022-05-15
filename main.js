'use strict;'

function ChargerPage(page){
	let xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			AnalyseMD(xhr.response);
		}
	};
	xhr.open("GET", page, true);
	xhr.send();
}


function AnalyseMD(texte)
{
	// enlever les \r et les lignes de string empty
	// let texteSansLignesVides = texte.replace(/(\r)/g,'');
	// console.log(texteSansLignesVides);
	// Non, on va avoir ebsoin des \r.

	// faire un tableau avec tel séparateur
	let split = texte.split('\n');
	console.log(split);

	let splitFinal = [];

	let debutCode = false;
	// let debutUL = false;
	let etatUL = false;

	for (let i = 0; i < split.length; i++) {
		let element = split[i];
		// Si quelque chose de gênant, supprimer
		if (element === null || element == '' || element == '\r') 
		{
			continue;
		}
		// titre H1
		else if(element.substring(0,2) == '# ')
		{
			if(etatUL) 
			{
				splitFinal.push(`</ul>`);
				etatUL = false;
			}
			let justeLeTexte = element.substring(2,element.length);
			let ligne = `<h1>${justeLeTexte}</h1>`;
			splitFinal.push(ligne);
		}
		// titre H2
		else if(element.substring(0,3) == '## ')
		{
			if(etatUL) 
			{
				splitFinal.push(`</ul>`);
				etatUL = false;
			}
			let justeLeTexte = element.substring(3,element.length);
			let ligne = `<h2>${justeLeTexte}</h2>`;
			splitFinal.push(ligne);
		}
		// début de code avec ```
		else if(element == '```\r')
		{
			if(etatUL) 
			{
				splitFinal.push(`</ul>`);
				etatUL = false;
			}
			if(!debutCode)
			{
				debutCode = true;
				splitFinal.push(`<pre><code>`);
			}
			else
			{
				debutCode = false;
				splitFinal.push(`</code></pre>`);
			}
		}
		// liste UL 
		else if(element.substring(0,2) == '- ')
		{
			if(!etatUL)
			{
				splitFinal.push(`<ul>`);
				etatUL = true;
			}
			let justeLeTexte = AnalyserTexte(element.substring(2,element.length));
			splitFinal.push(`<li><p>${justeLeTexte}</p></li>`); 
		}
		// IMG
		else if(element.substring(0,2)=='![')
		{
			if(etatUL) 
			{
				splitFinal.push(`</ul>`);
				etatUL = false;
			}

			let crochetOuvrant = element.indexOf('[') + 1;
			let crochetFermant = element.indexOf(']');
				let titre = element.substring(crochetOuvrant,crochetFermant);
			let parentheseOuvrante = element.indexOf('(') +1;
			let parentheseFermante = element.indexOf(')');
				let url = element.substring(parentheseOuvrante,parentheseFermante);
			splitFinal.push(`<img src="${url}" alt="${titre}">`);
		}
		// paragraphe P ou ligne de code...
		else /*if(element[0].match(/[A-Z]/g) || element.substring(0,2)=='\t')*/
		{
			if(etatUL) 
			{
				splitFinal.push(`</ul>`);
				etatUL = false;
			}
			if(!debutCode)
			{
				if(!etatUL)
				{
					let elementAnalyse = AnalyserTexte(element);
					splitFinal.push(`<p>${elementAnalyse}</p>`); 
				}
				// else if(etatUL)
				// {
				// 	splitFinal.push(`<li>${element}</li>`);
				// }
			}
			else 
			{
				splitFinal.push(element);
			}
		}
	}

	for (let i = 0; i < splitFinal.length; i++) {
		console.log(splitFinal[i]);
		
	}
}


function AnalyserTexte(texte)
{
	// RegEx pour les liens 
	const regExLien = /\[.*?\)/g;
	// \[ 	obtenir le [ de début 
	// .* 	tout caractère, peu importe le nombre d'occurences
	// ? 	pour que la recherche soit paresseuse
	// \) 	obtenir la ) de fin
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

	// RegEx pour le tag <code> inline
	const regExCode = /`.*?`/g;

	let codes = [...texte.matchAll(regExCode)];
	if(codes.length != 0)
	{
		for (let i = 0; i < codes.length; i++) {
			const e = codes[i][0];
			let justeLeTexte = e.substring(1,e.length-1);
			let mot = `<code>${justeLeTexte}</code>`;
			texte = texte.replace(e,mot);
		}
	}

	// Pour les textes en gras, italique, gras-italique, l'ordre est important

	// D'ABORD les strong i 
	const regExStrongI = /\*{3}.*?\*{3}/g;
	// \*{n}	le nombre d'étoiles au début
	// .*		tout caractère, peu importe le nombre
	// ?		recherche paresseuse
	// \*{n}	le nombre d'étoiles à la fin
	let strongItalics = [...texte.matchAll(regExStrongI)];
	if(strongItalics.length != 0)
	{
		for (let i = 0; i < strongItalics.length; i++) {
			const e = strongItalics[i][0];
			let justeLeTexte = e.substring(3,e.length-3);
			let chaine = `<b><i>${justeLeTexte}</i></b>`;
			texte = texte.replace(e,chaine);
		}
	}

	// PUIS les Strong
	const regExStrong = /\*{2}.*?\*{2}/g;
	let strongs = [...texte.matchAll(regExStrong)];
	if(strongs.length != 0)
	{
		for (let i = 0; i < strongs.length; i++) {
			const e = strongs[i][0];
			let justeLeTexte = e.substring(2,e.length-2);
			let chaine = `<b>${justeLeTexte}</b>`;
			texte = texte.replace(e,chaine);
		}
	}

	// ENFIN les i
	const regExI = /\*{1}.*?\*{1}/g;
	let italics = [...texte.matchAll(regExI)];
	if(italics.length != 0)
	{
		for (let i = 0; i < italics.length; i++) {
			const e = italics[i][0];
			let justeLeTexte = e.substring(1,e.length-1);
			let chaine = `<i>${justeLeTexte}</i>`;
			texte = texte.replace(e,chaine);
		}
	}

	return texte;
}

document.addEventListener('DOMContentLoaded', ()=>{

	ChargerPage('page.md');

});