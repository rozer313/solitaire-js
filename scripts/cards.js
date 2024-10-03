const CardValue = {
    Ace: 1,
    Two: 2,
    Three: 3,
    Four: 4,
    Five: 5,
    Six: 6,
    Seven: 7,
    Eight: 8,
    Nine: 9,
    Ten: 10,
    Jack: 11,
    Queen: 12,
    King: 13
}

const CardsSuite = {
    Hearts: 'hearts',
    Spades: 'spades',
    Clubs: 'clubs',
    Diamonds: 'diamonds'
}

class Card {
    constructor(value, suite) {
        this.value = value;
        this.suite = suite;
        switch (value) {
            case 1 :
                this.value_name = 'ace';
                break;
            case 11:
                this.value_name = 'jack';
                break;
            case 12:
                this.value_name = 'queen';
                break;
            case 13:
                this.value_name = 'king';
                break;
            default:
                this.value_name = value.toString();
        }
        this.card_name = value + "_of_" + suite;
    }
}

function generateCards() {
    for (const cardValueKey in CardValue) {
        for (const cardsSuiteKey in CardsSuite) {
            var temp = new Card(CardValue[cardValueKey], CardsSuite[cardsSuiteKey]);
            console.log(temp);
        }
    }
}
