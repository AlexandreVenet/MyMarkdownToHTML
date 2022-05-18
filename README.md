# MyMarkdownToHTML

Essai de convertisseur très simple, en JS côté *client*, de certaines caractéristiques Markdown en HTML. 

La convention syntaxique suivie est celle de Visual Studio Code.

## Eléments pris en charge

Actuellement, le script convertit :
- le titre `h1`, 
- le titre `h2`,
- le paragraphe `p`,
- dans le paragraphe, le gras `strong`, l'italique `i`, le gras-italique, l'italique-gras, le lien `a`, le code `code`,
- le bloc multiligne de code avec indentation,
- la liste non ordonnée `ul` et ordonnée `ol`, et l'entrée `li`,
- un seul niveau de liste imbriquée.

## Limitations

Le programme est limité :
- pas de récursivité,
- une boucle imbriquée pour le traitement des paragraphes,
- passes successives,
- une ligne de liste imbriquée doit présenter trois espaces à son début.