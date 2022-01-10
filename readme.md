## Pour creer la data

⚠️Ne pas oublier de mettre le fichier de data nommé import.csv dans le dossier "/csvimport"

Execution de la commande:

- npm

```sh
 npm run createclub
```

## Pour ajouter les latitudes et longitudes via un fichier csv externet

⚠️Ré-integrer le fichier csv de la liste des clubs et coordonnées (clubAdres.csv) modifié par vos soins dans le dossier "/csvtoaddlatlong" et
bien vérifier que le fichier de data.json généré avec la commande précédante :

```sh
  npm run addlatlong
```

Execution de la commande:

- npm

```sh
 npm run addlatlong
```


Exemple de model de csv:
```csv
numClub,AdressePostale,Latitude,Longitude
504956,RUE JEAN MOULIN 18410 ARGENT SUR SAULDRE,47.559053,2.444936
504976,17 RUE DU VAL DE NERE 18700 AUBIGNY SUR NERE,47.468317,2.454935
547510,18520 AVORD,47.03267,2.657486
504923,1 rue du Chancelier 18800 BAUGY,47.081122,2.727922
544759,18320 BEFFES,47.09458,3.005649
546258,2 ROUTE DE FLAVIGNY 18520 BENGY SUR CRAON,46.998879,2.748815
581318,28 rue Gambon 18000 BOURGES,47.086646,2.390349
524968,ROUTE DE LA CHAPELLE ST.URSIN 18000 BOURGES,47.076015,2.370931
582461,157 avenue du Général de Gaulle 18000 BOURGES,47.103331,2.409283
560729,1 Bis rue Jules Bertaut 18000 BOURGES,47.102081,2.413074
525137,CHEMIN DE LA ROTTEE 18000 BOURGES,47.057869,2.414721
514340,RUE DE LA SENTE AUX LOUPS 18000 BOURGES,47.102721,2.401933
501541,3 RUE MARCEL PAUL 18000 BOURGES,47.065183,2.391899
505260,12 rue de l'ormée 18220 BRECY,47.119639,2.615053
517324,34 route de Marmagne 18570 LA CHAPELLE ST URSIN,47.06404,2.321156
526146,89 Rue nationale 18210 CHARENTON DU CHER,46.729448,2.644138
504925,18370 CHATEAUMEILLANT,46.556452,2.206287
549879,ARNON BOISCHAUT CHER 18190 CHATEAUNEUF SUR CHER,46.858233,2.316626
504892,18190 CHATEAUNEUF SUR CHER,46.855995,2.335002
529034,18 route de Vatan 18120 CHERY,47.121156,2.044545
542134,MAIRIE DE CIVRAY 18290 CIVRAY,47.000073,2.17998
537086,18200 COLOMBIERS,46.703543,2.541836
504867,18130 DUN SUR AURON,46.892488,2.554523
504909,21 RUE GASTON CORNAVIN 18500 FOECY,47.178486,2.159871
```

## Pour ajouter les LABEL

⚠️Integrer les fichier csv des label dans le dossier "/importcsvlabel" et modifier le fichier addLabel et bien vérifier que le fichier de data.json.

Exemple:
Si vous avez un fichier nommé "label-junior.csv

```js
//Update with you file
///////////////////////////////////////////////////
const label_junior = {
  path: `${__dirname}/../importcsvlabel/label-junior.csv`,
  name: "NOM DU LABEL",
};

let arrayCSV = [label_junior];
//////////////////////////////////////////////////
...
```

Execution de la commande:

- npm

```sh
 npm run createclub
```

Exemple de model de csv:
```csv
NumClub,CLUB
553611,BOURGES 18
535039,BOURGES FOOT
545810,F.C. REMOIS
582560,C' CHARTRES FOOTBALL
504897,AM. COURVILLE SUR EURE
544959,U.S. CLOYES DROUE
542198,FC DROUAIS
532177,FC TREMBLAY LES VILLAGES
528291,FC LUCE OUEST
581824,U.S. VALLEE DU LOIR
512690,ENT.S. NOGENT LE ROI
504885,SP.C. VATAN
500098,LA BERRICHONNE DE CHATEAUROUX
522503,ENT.G.C. TOUVENT CHATEAUROUX
504917,TOURS F.C.
563699,AV. FOOTBALL DU BOURGUEILLOIS
590283,SAINT GEORGES DESCARTES
581822,A. FOOTBALL BOUCHARDAIS
553511,LE RICHELAIS JEUNESSE SPORTIVE
582286,F.C. GATINE CHOISILLES
518549,C.S. TOURANGEAU VEIGNE
520472,F.A.S. ST-SYMPHORIEN TOURS
544106,R. LA RICHE TOURS
521070,ALERTE S. DE FONDETTES
```

## Auteur

Florian Bême
