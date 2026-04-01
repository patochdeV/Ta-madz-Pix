const fs = require('fs');
const path = require('path');

// Liste des personnages principaux
const characters = [
  'Mametchi', 'Kuchipatchi', 'Himetchi', 'KuroMametchi', 'Mimitchi',
  'Kikitchi', 'Awamokotchi', 'Gozarutchi', 'Ninjanyatchi', 'Weeptchi',
  'Neliatchi', 'Shimagurutchi', 'Memetchi', 'Paintotchi', 'Coffretchi',
  'Murachakitchi', 'Ginjirotchi', 'Lovelitchi', 'Charatchi', 'Chamametchi',
  'Momotchi', 'Orenetchi', 'Sebiretchi', 'Milktchi', 'Wawatchi'
];

// Mapping des personnages avec leurs données de soin depuis le Fandom wiki
const careData = {
  'Mametchi': { careMistakes: 1, specialCondition: 'Play with Science Project item 3+ times', eggGroup: 'Smart' },
  'Himetchi': { careMistakes: 1, specialCondition: 'Eat Gummies snack 3+ times', eggGroup: 'Smart' },
  'KuroMametchi': { careMistakes: 3, specialCondition: 'Eat Black Burger meal 3+ times', eggGroup: 'Smart' },
  'Mimitchi': { careMistakes: 1, specialCondition: 'Eat Cupcake snack 3+ times', eggGroup: 'Smart' },
  'Kikitchi': { careMistakes: 5, specialCondition: 'Play with Skateboard item 5+ times', eggGroup: 'Smart' },
  'Chamametchi': { careMistakes: 3, specialCondition: 'Eat Strawberry Crepe snack 3+ times', eggGroup: 'Smart' },
  'Gozarutchi': { careMistakes: 6, specialCondition: null, eggGroup: 'Smart' },
  'Ninjanyatchi': { careMistakes: 1, specialCondition: null, eggGroup: 'Smart' },
  'Weeptchi': { careMistakes: 1, specialCondition: 'Eat Flower Bread meal 3+ times', eggGroup: 'Creative' },
  'Neliatchi': { careMistakes: 1, specialCondition: 'Eat Floral Cake snack 3+ times', eggGroup: 'Creative' },
  'Shimagurutchi': { careMistakes: 3, specialCondition: 'Eat Spiral Lollipop snack 3+ times', eggGroup: 'Creative' },
  'Memetchi': { careMistakes: 1, specialCondition: 'Eat Donuts snack 3+ times', eggGroup: 'Creative' },
  'Paintotchi': { careMistakes: 5, specialCondition: 'Play with Sketchbook item 5+ times', eggGroup: 'Creative' },
  'Coffretchi': { careMistakes: 3, specialCondition: 'Eat Sponge Cake snack 3+ times', eggGroup: 'Creative' },
  'Murachakitchi': { careMistakes: 6, specialCondition: null, eggGroup: 'Creative' },
  'Violetchi': { careMistakes: 1, specialCondition: null, eggGroup: 'Creative' },
  'Ginjirotchi': { careMistakes: 1, specialCondition: 'Eat Ramen Noodles meal 3+ times', eggGroup: 'Charming' },
  'Lovelitchi': { careMistakes: 1, specialCondition: 'Eat Dessert Platter snack 3+ times', eggGroup: 'Charming' },
  'Charatchi': { careMistakes: 3, specialCondition: 'Play with Badminton Set item 5+ times', eggGroup: 'Charming' },
  'Milktchi': { careMistakes: 3, specialCondition: 'Eat Dreamy Cotton Candy snack 3+ times', eggGroup: 'Charming' },
  'Kuchipatchi': { careMistakes: 5, specialCondition: 'Eat Tower Burger meal 3+ times', eggGroup: 'Charming' },
  'Momotchi': { careMistakes: 3, specialCondition: 'Eat Peach snack 3+ times', eggGroup: 'Charming' },
  'Orenetchi': { careMistakes: 6, specialCondition: null, eggGroup: 'Charming' },
  'Sebiretchi': { careMistakes: 1, specialCondition: null, eggGroup: 'Charming' },
  'Wawatchi': { careMistakes: 5, specialCondition: 'Eat Donuts snack 3+ times', eggGroup: 'Creative' },
  'Awamokotchi': { careMistakes: 1, specialCondition: 'Play with Fluffy Cloud item 3+ times', eggGroup: 'Creative' }
};

console.log('Script pour mettre à jour les préférences des personnages Tamagotchi Pix');
console.log('Utilisez les données de pixfavourites.tiddlyhost.com');
console.log('');
console.log('Personnages à traiter:', characters.length);
console.log('Données de soin disponibles pour:', Object.keys(careData).length, 'personnages');
console.log('');
console.log('Pour mettre à jour manuellement un personnage:');
console.log('1. Visitez https://pixfavourites.tiddlyhost.com/?page=[nomdupersonnage]');
console.log('2. Copiez les aliments et items préférés');
console.log('3. Ajoutez les données de soin depuis le Fandom wiki');
console.log('4. Mettez à jour le fichier JSON');