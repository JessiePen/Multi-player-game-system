const moment = require("moment");
const card = [
  "add4",
  "colour-change",
  "add4",
  "colour-change",
  "add4",
  "colour-change",
  "add4",
  "colour-change",
  "blue-0",
  "blue-1",
  "blue-2",
  "blue-3",
  "blue-4",
  "blue-5",
  "blue-6",
  "blue-7",
  "blue-8",
  "blue-9",
  "blue-add2",
  "blue-inverse",
  "blue-ban",
  "blue-1",
  "blue-2",
  "blue-3",
  "blue-4",
  "blue-5",
  "blue-6",
  "blue-7",
  "blue-8",
  "blue-9",
  "blue-add2",
  "blue-inverse",
  "blue-ban",
  "green-0",
  "green-1",
  "green-2",
  "green-3",
  "green-4",
  "green-5",
  "green-6",
  "green-7",
  "green-8",
  "green-9",
  "green-add2",
  "green-inverse",
  "green-ban",
  "green-1",
  "green-2",
  "green-3",
  "green-4",
  "green-5",
  "green-6",
  "green-7",
  "green-8",
  "green-9",
  "green-add2",
  "green-inverse",
  "green-ban",
  "yellow-0",
  "yellow-1",
  "yellow-2",
  "yellow-3",
  "yellow-4",
  "yellow-5",
  "yellow-6",
  "yellow-7",
  "yellow-8",
  "yellow-9",
  "yellow-add2",
  "yellow-inverse",
  "yellow-ban",
  "yellow-1",
  "yellow-2",
  "yellow-3",
  "yellow-4",
  "yellow-5",
  "yellow-6",
  "yellow-7",
  "yellow-8",
  "yellow-9",
  "yellow-add2",
  "yellow-inverse",
  "yellow-ban",
  "red-0",
  "red-1",
  "red-2",
  "red-3",
  "red-4",
  "red-5",
  "red-6",
  "red-7",
  "red-8",
  "red-9",
  "red-inverse",
  "red-add2",
  "red-ban",
  "red-1",
  "red-2",
  "red-3",
  "red-4",
  "red-5",
  "red-6",
  "red-7",
  "red-8",
  "red-9",
  "red-inverse",
  "red-add2",
  "red-ban",
];

const greenCard = [
  "green-0",
  "green-1",
  "green-2",
  "green-3",
  "green-4",
  "green-5",
  "green-6",
  "green-7",
  "green-8",
  "green-9",
  "green-add2",
  "green-inverse",
  "green-ban",
];


const redCard = [
  "red-0",
  "red-1",
  "red-2",
  "red-3",
  "red-4",
  "red-5",
  "red-6",
  "red-7",
  "red-8",
  "red-9",
  "red-inverse",
  "red-add2",
  "red-ban",
];
const yellowCard = [
  "yellow-0",
  "yellow-1",
  "yellow-2",
  "yellow-3",
  "yellow-4",
  "yellow-5",
  "yellow-6",
  "yellow-7",
  "yellow-8",
  "yellow-9",
  "yellow-add2",
  "yellow-inverse",
  "yellow-ban",

];
const blueCard = [
  "blue-0",
  "blue-1",
  "blue-2",
  "blue-3",
  "blue-4",
  "blue-5",
  "blue-6",
  "blue-7",
  "blue-8",
  "blue-9",
  "blue-add2",
  "blue-inverse",
  "blue-ban",
];

const card0 = ["blue-0", "green-0", "yellow-0", "red-0"];
const card1 = ["blue-1", "green-1", "yellow-1", "red-1"];
const card2 = ["blue-2", "green-2", "yellow-2", "red-2"];
const card3 = ["blue-3", "green-3", "yellow-3", "red-3"];
const card4 = ["blue-4", "green-4", "yellow-4", "red-4"];
const card5 = ["blue-5", "green-5", "yellow-5", "red-5"];
const card6 = ["blue-6", "green-6", "yellow-6", "red-6"];
const card7 = ["blue-7", "green-7", "yellow-7", "red-7"];
const card8 = ["blue-8", "green-8", "yellow-8", "red-8"];
const card9 = ["blue-9", "green-9", "yellow-9", "red-9"];

const blackCard = ["add4", "colour-change"];
var cardSet = card

function formatCard(username) {
  const random = Math.floor(Math.random() * cardSet.length);
  const attribute = card[random];
  cardSet.splice(random,1)


  const id = Math.random().toFixed(5);
  if(cardSet.length==0){
    cardSet = card
  }

  return {
    id,
    username,
    attribute,
    time: moment().format("h:mm a"),
  };
}

var lastCategory = [];
var lastNumber = [];

const cardCategory = [greenCard, redCard, yellowCard, blueCard, blackCard];
const cardNum = [
  card0,
  card1,
  card2,
  card3,
  card4,
  card5,
  card6,
  card7,
  card8,
  card9,
];

function inspectCard(card) {
  var category = [];
  var number = [];

  cardCategory.forEach((element) => {
    if (element.indexOf(card.attribute) > -1) {
      category = element;
    }
  });

  cardNum.forEach((element) => {
    if (element.indexOf(card.attribute) > -1) {
      number = element;
    }
  });

  // console.log(category)
  // console.log(number)

  return [category, number];
}

function checkCard(card) {
  var category = inspectCard(card)[0];
  var number = inspectCard(card)[1];

  if (lastCategory.length == 0) {
    lastCategory = category;
    lastNumber = number;
    return true;
  } else {
    if (card.attribute == "add4" || card.attribute == "colour-change") {
      return true;
    } else {
      if (
        lastCategory.indexOf(card.attribute) > -1 ||
        lastNumber.indexOf(card.attribute) > -1
      ) {
        lastCategory = category;
        lastNumber = number;

        return true;
      } else {
        return false;
      }
    }
  }
}

function setLastColour(colour) {
  if (colour == "red") {
    lastCategory = redCard;
  }

  if (colour == "green") {
    lastCategory = greenCard;
  }

  if (colour == "blue") {
    lastCategory = blueCard;
  }

  if (colour == "yellow") {
    lastCategory = yellowCard;
  }
}


module.exports = {
  formatCard,
  checkCard,
  setLastColour,
};
