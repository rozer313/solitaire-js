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
        this.is_available = true;
        this.is_present = false;
        this.is_hidden = true;
        this.value = value;
        this.suite = suite;
        this.stash_number = -1;
        this.is_in_container = false;
        if (this.suite === 'hearts' || this.suite === 'diamonds')
            this.color = 'red';
        else
            this.color = 'black';

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
        this.card_name = this.value_name + "_of_" + suite;
    }
}
let cardsInContainerCount = 0;
numberOfMoves = 0;
function incrementNumberOfMoves() {
    document.getElementById("moves").innerHTML = "Moves: " + ++numberOfMoves;
}
function decrementNumberOfMoves() {
    document.getElementById("moves").innerHTML = "Moves: " + --numberOfMoves;
}
class Action {
    constructor(id) {
        this.id = id;
        this.source = document.getElementById(id).parentElement.getAttribute('id');
        this.wasPreviousSiblingHidden = document.getElementById(this.id).previousElementSibling !== null && document.getElementById(this.id).previousElementSibling.classList.contains("hidden");
        incrementNumberOfMoves();
        if (!wasTimerStarted)
            startTimer();
    }
    async revert() {
        return new Promise(async (resolve) => {
            let element = document.getElementById(this.id);
            let source_element = document.getElementById(this.source);
            let has_next_sibling = false;
            let sibling_id;

            if (element.nextElementSibling !== null) {
                has_next_sibling = true;
                sibling_id = element.nextElementSibling.getAttribute('id');
            }
            if (element.parentElement.id === source_element.id) {
                undoAvailable();
                recalculateOffset(this.source);
            } else {
                decrementScoreBoard(this.id, getProperParent(element).id, this.wasPreviousSiblingHidden);
                if (this.source === "available-container") {
                    cards[this.id].is_available = true;
                    cards[this.id].is_hidden = false;
                    cards[this.id].is_in_container = false;
                    cardsInContainerCount--;
                    available_count++;
                    current_index = this.id;
                    //if (source_element.childElementCount === 3)
                    await animation(element, source_element, false);
                    generateAvailableCard(false);
                    element.remove();

                } else {
                    if (element.parentElement.id.includes("container-") && !this.source.includes("container-")) {
                        cards[this.id].is_in_container = false;
                        cardsInContainerCount--;
                    }

                    //if (this.source.includes("column") && source_element.lastElementChild !== null && !element.parentElement.id.includes("container"))
                    if (this.wasPreviousSiblingHidden)
                        removeBackground(source_element.lastElementChild.getAttribute('id'));
                    await animation(element, source_element, false);
                    /*
                    source_element.append(element);
                    while (has_next_sibling) {
                        let temp = sibling_id;
                        sibling_id = null;
                        if (document.getElementById(temp).nextElementSibling !== null)
                            sibling_id = document.getElementById(temp).nextElementSibling.getAttribute('id');
                        else
                            has_next_sibling = false;
                        source_element.append(document.getElementById(temp));
                    }*/
                }

                recalculateOffset(this.source);
            }
            decrementNumberOfMoves();
            resolve();
        });

    }
}

let actions = [];

function shuffle(array) {
    for (let i=0; i<array.length; i++) {
        let temp = array[i];
        let random = Math.floor(Math.random() * array.length);
        array[i] = array[random];
        array[random] = temp;
    }
}

let cards = [];

function findLastAvailable() {
    let i = last_hidden_available - 1;
    while (i >= 0) {
        if (cards[i].is_available === true)
            return i;
        i--;
    }
    if (numberOfIndexReturn === 0)
        return -1;


    i = 51;
    while (i >= 0) {
        if (cards[i].is_available === true) {
            return i;
        }
        i--;
    }
    return -2;
}

function generateThreeAvailableCards() {
    let container = document.getElementById("available-container");
    //if (document.getElementById(current_index-1).parentElement.id === "available-container")
    cards[real_current_index].is_present = false;

    current_index = last_hidden_available;
    container.innerHTML = "";
    for (let i=0; i<3; i++) {
        let temp = numberOfIndexReturn;
        generateAvailableCard(false);
        numberOfIndexReturn = temp;
    }
    if (last_hidden_available <= current_index)
        last_hidden_available = findLastAvailable();
}

function animateSwingRight(card) {
    return new Promise((resolve) => {
        card.style.animationName = "slide-left";
        card.style.animationTimingFunction = "ease-in";
        card.style.animationDuration = "0.1s";
        console.log(card);
        setTimeout(() => {
            card.style.removeProperty("animation-name");
            card.style.removeProperty("animation-duration");
            card.style.removeProperty("animation-timing-function");
            card.style.opacity = "0";
            resolve();
        },90);

    });
}

async function undoAvailable() {
    let container = document.getElementById("available-container");
    let child_count = container.childElementCount;
    const reverse_card = document.getElementById("reverse");
    reverse_card.style.animationName = "swing-right";
    reverse_card.style.animationDuration = "0.1s";

    await animateSwingRight(container.lastElementChild);

    if (child_count === 3 && last_hidden_available > -1) {
        console.log(1);
        generateThreeAvailableCards();
    }
    else if (child_count === 2 && available_count === 2) {
        container.firstElementChild.before(container.lastElementChild);
        console.log(2);
    }
    else {
        console.log(3);
        current_index--;
        cards[real_current_index].is_present = false;
        container.removeChild(container.lastElementChild);
        if (last_hidden_available > -1 && child_count === 1) {
            numberOfIndexReturn--;

            for (let i=0; i<2; i++)
                last_hidden_available = findLastAvailable();
            generateThreeAvailableCards();

        }

    }
    setTimeout(() => {
        reverse_card.style.removeProperty("animation-name");
        reverse_card.style.removeProperty("animation-duration");
    },100);
}

function recalculateOffset(container_id) {
    let container = document.getElementById(container_id);
    let container_child;
    let children_count;
    if (container_id === "available-container") {
        container_child = container.firstElementChild;
        children_count = parseInt(container.childElementCount);
        while (children_count > 3) {
            let child_id = container.firstElementChild.id;
            cards[child_id].is_hidden = true;
            container.removeChild(container.firstElementChild);
            children_count--;
        }
        for (let i=0; i<children_count; i++) {
            let child_id = container_child.id;
            if(i === children_count-1)
                cards[child_id].is_hidden = false;
            else
                cards[child_id].is_hidden = true;
            container_child.style.left = i*30 + "px";
            container_child.style.top = "0px"
            container_child = container_child.nextElementSibling;
        }
    }

    else if (container_id.includes("container")) {
        container.lastElementChild.style.top = "0px";
        container.lastElementChild.style.left = "0px";
    }

    else {
        container_child = container.firstElementChild;
        children_count = parseInt(document.getElementById(container_id).childElementCount);
        for (let i=0; i<children_count; i++) {
            container_child.style.top = i*20 + "px";
            container_child.style.left = "0px";
            container_child = container_child.nextElementSibling;
        }
    }
}
let hiddenCount = 38;
function generateBackground(id) {
    document.getElementById(id).style.backgroundImage = "url(../img/png_cards/"+cards[id].card_name+".png)";

    document.getElementById(id).classList.remove("hidden");
    document.getElementById(id).style.animationName = "rotate-vert-center";
    document.getElementById(id).style.animationDuration = "0.3s";
    setTimeout(() => {
        document.getElementById(id).style.removeProperty("animation-name");
        document.getElementById(id).style.removeProperty("animation-duration");
    }, 300);
    cards[id].is_hidden = false;
    hiddenCount--;
}

function removeBackground(id) {
    if (id !== "") {
        document.getElementById(id).classList.add("hidden");
        cards[id].is_hidden = true;
        hiddenCount++;
    }

}

function generateCards() {
    for (const cardValueKey in CardValue) {
        for (const cardsSuiteKey in CardsSuite) {
            cards.push(new Card(CardValue[cardValueKey], CardsSuite[cardsSuiteKey]));
        }
    }
    shuffle(cards);


    let current_stack = 0;
    let max_in_stack = 1;
    let i=0;
    while (max_in_stack < 8) {
        const container = document.getElementById("column-"+max_in_stack);
        let new_card = document.createElement("div");

        new_card.setAttribute('id', i);
        new_card.setAttribute('class', 'card');
        new_card.setAttribute('draggable', 'false');
        cards[i].is_available = false;
        cards[i].is_present = true;
        cards[i].stash_number = max_in_stack;

        //new_card.style.backgroundImage = "url(../img/png_cards/card_reverse.png)";
        //new_card.style.backgroundSize = "120px 160px";

        container.append(new_card);

        current_stack++;
        if (current_stack === max_in_stack) {
            //new_card.setAttribute('draggable', 'true');
            generateBackground(i);
            recalculateOffset("column-"+max_in_stack);
            current_stack = 0;
            max_in_stack += 1;
        }
        else
            removeBackground(i);
        i++;
    }
}

generateCards();


///////////////////////---DRAG&DROP---///////////////////////




function getNextSiblingsAndSelf(element) {
    let siblings = [];
    siblings.push(element);
    while (element.nextElementSibling) {
        element = element.nextElementSibling;
        siblings.push(element);
    }
    return siblings;
}

//////////////////////////////////////
let available_count = 24;
let current_index = 27;
let last_hidden_available = -1;

let numberOfIndexReturn = 0;
let real_current_index = current_index;

function generateAvailableCard(animate) {
    const container = document.getElementById('available-container');
    let didIndexReturn = false;

    if (current_index === -1)
        return 0;

    if (current_index >= cards.length) {
        last_hidden_available = parseInt(container.lastElementChild.id);
        while (container.firstElementChild) {
            container.removeChild(container.lastElementChild);
        }
        current_index = 28;
        didIndexReturn = true;
    }

    while (!cards[current_index].is_available) {
        current_index++;
        if (current_index >= cards.length) {
            didIndexReturn = true
            current_index = 28;
            last_hidden_available = parseInt(container.lastElementChild.id);
            while (container.firstElementChild) {
                container.removeChild(container.lastElementChild);
            }
        }

    }
    if (didIndexReturn)
        numberOfIndexReturn++;

    for (let i=0; i<parseInt(container.childElementCount); i++) {
        container.childNodes[i].style.removeProperty("animation-name");
        container.childNodes[i].style.removeProperty("animation-duration");
    }

    let new_card = document.createElement("div");

    new_card.setAttribute('id', current_index);
    new_card.setAttribute('class', 'card');
    //new_card.setAttribute('draggable', 'true');
    new_card.style.backgroundImage = "url(../img/png_cards/"+cards[current_index].card_name+".png)";
    new_card.style.backgroundSize = "120px 160px";
    if (animate) {
        new_card.style.animationName = "swing-left";
        new_card.style.animationDuration = "0.2s";
    }


    if (parseInt(container.childElementCount) >= 3) {
        last_hidden_available = parseInt(container.firstElementChild.getAttribute('id'));
        cards[last_hidden_available].is_present = false;
        container.replaceChild(container.firstElementChild.nextElementSibling, container.firstElementChild);
        container.replaceChild(container.firstElementChild.nextElementSibling, container.lastElementChild);
        container.append(new_card);
        cards[current_index].is_present = true;
    }
    else {
        let child_count = parseInt(container.childElementCount);
        new_card.style.left = child_count * 30 +"px";
        container.append(new_card);
        cards[current_index].is_present = true;
    }
    real_current_index = current_index++;
    recalculateOffset("available-container");
    if (animate) {
        setTimeout(() => {
            new_card.style.removeProperty("animation-name");
            new_card.style.removeProperty("animation-duration");
        },100);
    }

}

function putAvailableCard() {
    generateAvailableCard(true);
    actions.push(new Action(real_current_index));
}

document.getElementById("reverse").onclick = () => {
    if(available_count >= 3)
        putAvailableCard();
    else if (available_count === 2) { //temporarily, for switching 2 remaining available cards
        let container = document.getElementById("available-container");
        container.firstElementChild.before(container.lastElementChild);
        actions.push(new Action(real_current_index));
        recalculateOffset("available-container");
    }
};
let undoing_finished = true;
async function undo() {
    if (actions.length > 0 && undoing_finished) {
        undoing_finished = false;
        await actions[actions.length - 1].revert();
        actions.pop();
        undoing_finished = true;

        if (available_count > 0)
            document.getElementById("reverse").style.removeProperty("opacity");
    }

}

///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

let mouseDown = false;
let isDragged = false;
let draggedElement;
let draggedX, draggedY;
let draggingInProgress = false;

function dragstart(event) {
    if(animationInProgress)
        hintSignalStop = true;

    mouseDown = true;

    if (!event.target.hasAttribute('id'))
        return;

    let id = parseInt(event.target.id);

    if (id < 0 || id >= cards.length || isNaN(id))
        return;
    console.log(id);

    if (cards[id].is_hidden)
        return;

    isDragged = true;
    draggedElement = event.target;
    let rect = draggedElement.getBoundingClientRect();
    draggedX = event.pageX - rect.left;
    draggedY = event.pageY - rect.top;
    calculateXY(draggedElement, event.pageX, event.pageY);
}

function calculateXY(element, cursX, cursY) {
    let i = 0;
    let siblings = getNextSiblingsAndSelf(element);

    siblings.forEach((sibling) => {
        sibling.classList.add("dragging");
        sibling.style.position = "fixed";
        sibling.style.zIndex = "99";
        sibling.style.left = (cursX - draggedX) + 'px';
        sibling.style.top = (cursY - draggedY + 20 * i++) + 'px';
    });
}

function mouseMove(event) {
    event.preventDefault();
    if (mouseDown && isDragged) {
        draggingInProgress = true;
        if(animationInProgress)
            hintSignalStop = true;

        calculateXY(draggedElement, event.pageX, event.pageY);
    }

}

function removeDraggingState(siblings) {
    //recalculateOffset(parent_id);

    siblings.forEach((sibling) => {
        sibling.style.removeProperty("position");
        sibling.style.removeProperty("z-index");
        sibling.classList.remove("dragging");
        //sibling.classList.add("stop-dragging");
        //sibling.classList.remove("stop-dragging");
    });
}

function appendMechanism(target, element) {
    console.log("appendMechanism");
    let siblings = getNextSiblingsAndSelf(element);

    if (target === null) {
        removeDraggingState(siblings);
        return;
    }
    const id = parseInt(element.id);
    const card = cards[id];
    let movable = canBeMoved(target, card);
    let parent = getProperParent(target);
    let revertMovement = false;

    if (actions.length > 0) {
        console.log(element.id);
        console.log(target.id);
        console.log(actions[actions.length-1].id);
        console.log(actions[actions.length-1].source);
        if (actions[actions.length-1].id === parseInt(element.id) && actions[actions.length-1].source === target.id) {
            revertMovement = true;
        }
    }


    if ((movable || revertMovement) && element.parentElement.id !== parent.id) {
        let parent_id = parent.id;
        if(parent_id.includes("container") && parent_id !== "available-container") {
            card.is_in_container = true;
            cardsInContainerCount++;
        }
        if(!revertMovement)
            actions.push(new Action(id));
        cards[id].is_available = false;
        cards[id].is_hidden = false;
        if (element.parentElement.id === "available-container") {
            if (element.parentElement.childElementCount === 3 && last_hidden_available !== -1 && available_count > 3) {
                generateThreeAvailableCards();
                cards[id].is_present = true;
            }
            available_count--;
        }

        if (element.previousElementSibling) {
            generateBackground(element.previousElementSibling.id);
        }

        siblings.forEach((sibling) => {
            parent.append(sibling);
        });

        //recalculateOffset(parent_id);
        if(!revertMovement)
            updateScoreBoard(actions[actions.length-1].source, element.parentElement.id, actions[actions.length-1].wasPreviousSiblingHidden);
    }
    removeDraggingState(siblings);
    recalculateOffset(parent.id);

    if (available_count === 0)
        document.getElementById("reverse").style.opacity = "0";
}

function putCardInPlace(src) {
    console.log("put");
    let card = cards[parseInt(src.id)];
    for (let j = 1; j < 5; j++) {
        if (card.is_in_container)
            break;
        let target;
        let target_child_count = parseInt(document.getElementById('container-' + j).childElementCount);
        if (target_child_count === 0)
            target = document.getElementById('container-' + j);
        else
            target = document.getElementById('container-' + j).lastElementChild;
        if (canBeMoved(target, card)) {
            console.log(src);
            animation(src, target, false);
            //appendMechanism(target);
            return;
        }
    }

    for (let j = 1; j < 8; j++) {
        let target;
        let target_child_count = parseInt(document.getElementById('column-' + j).childElementCount);
        if (target_child_count === 0) {
            target = document.getElementById('column-' + j);
            if (card.value === 13 && src.previousElementSibling === null)
                return;
        } else
            target = document.getElementById('column-' + j).lastElementChild;
        if (canBeMoved(target, card)) {
            animation(src, target, false);
            //appendMechanism(target);
            return;
        }
    }
    removeDraggingState(getNextSiblingsAndSelf(src));
    recalculateOffset(src.parentElement.id);
}

function handleMouseUp(event) {
    isDragged = false;
    mouseDown = false;
    if (draggedElement !== undefined) {
        //let siblings = getNextSiblingsAndSelf(draggedElement);
        //removeDraggingState(getNextSiblingsAndSelf(draggedElement));
        //recalculateOffset(draggedElement.parentElement.id);

        if (!draggingInProgress) {
            putCardInPlace(draggedElement);
        }
        else {
            draggedElement.style.removeProperty("position");
            draggedElement.style.removeProperty("z-index");
            let target = document.elementFromPoint(event.clientX, event.clientY);
            //if (event.clientX > 0 && event.clientY > 0) {
                if (canBeMoved(target, cards[parseInt(draggedElement.id)])) {
                    console.log("anim");
                    animation(draggedElement, target, false);
                }

                else {
                    console.log("nanim");
                    //removeDraggingState(getNextSiblingsAndSelf(draggedElement));
                    //recalculateOffset(draggedElement.parentElement.id);
                    let previousElement = draggedElement.parentElement;
                    if (draggedElement.previousElementSibling !== null)
                        previousElement = draggedElement.previousElementSibling;
                    animation(draggedElement, previousElement, false);
                }

                //appendMechanism(target, draggedElement);
            //}
        }
    }
    draggedElement = undefined;
    draggingInProgress = false;
}

addEventListeners();
function addEventListeners() {
    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mousedown", dragstart);
    document.addEventListener("mouseup", handleMouseUp);
}

function removeEventListeners() {
    document.removeEventListener("mousemove", mouseMove);
    document.removeEventListener("mousedown", dragstart);
    document.removeEventListener("mouseup", handleMouseUp);
}



class Hint {
    constructor(src, target) {
        this.src = src;
        this.target = target;
    }
}
let hints = [];
let hintLastAction;
function generateHints() {
    let found = false;
    hints = [];
    for (let i=0; i<cards.length; i++) {
        let card = cards[i];
        let src = document.getElementById(i);
        if(!card.is_hidden && !card.is_in_container && card.is_present) {
            if (src.previousElementSibling !== null && !cards[src.previousElementSibling.id].is_hidden)
                continue;

            for(let j=1; j<5; j++) {
                if(card.is_in_container)
                    break;

                let target;
                let target_child_count = parseInt(document.getElementById('container-'+j).childElementCount);
                if (target_child_count === 0)
                    target = document.getElementById('container-'+j);
                else
                    target = document.getElementById('container-'+j).lastElementChild;

                let src = document.getElementById(i);
                if(canBeMoved(target, card)) {

                    hints.push(new Hint(src, target));
                    break;
                }
            }

            for(let j=1; j<8; j++) {
                let target;
                let target_child_count = parseInt(document.getElementById('column-'+j).childElementCount);

                if (target_child_count === 0) {
                    target = document.getElementById('column-'+j);
                    if(card.value === 13 && src.previousElementSibling === null)
                        break;
                }
                else
                    target = document.getElementById('column-'+j).lastElementChild;

                if(canBeMoved(target, card)) {
                    hints.push(new Hint(src, target))
                }
            }
        }
    }
}
let lastHintIndex = 0;
let wasHintGenerated = false;
function animation (src, target, stop) {
    return new Promise((resolve, reject) => {    //if(animationInProgress)
        //    return;
        animationInProgress = true;
        //removeEventListeners();
        let target_rect = target.getBoundingClientRect();
        let src_rect = src.getBoundingClientRect();
        //src.style.transition = "all .5s ease";
        let src_left = src.style.left;
        let src_top = src.style.top;

        let src_rect_left = src_rect.left;
        let src_rect_top = src_rect.top;

        let dest_left = target_rect.left;
        let dest_top = target_rect.top;
        let properParent = getProperParent(target);
        if (!properParent.id.includes("container-") && properParent.childElementCount > 0)
            dest_top += 20;
        if (properParent.id === "available-container")
            dest_left += parseInt(document.getElementById("available-container").childElementCount) * 30;
        //src.style.position = "fixed";
        //src.style.top = rect.top + "px";
        //src.style.left = rect.left + "px";

        let interval;
        let pos = 0;
        clearInterval(interval);
        let siblings = getNextSiblingsAndSelf(src);
        let i = 0;
        if (draggingInProgress) {
            console.log(src.style.top);
            console.log(src_rect_top);
            src_rect_top = parseInt(src.style.top);
            src_rect_left = parseInt(src.style.left);
        }
        siblings.forEach((sibling) => {
            console.log(src_rect_top);
            sibling.classList.add("dragging");
            sibling.style.zIndex = "99";
            sibling.style.position = "fixed";
            sibling.style.top = (src_rect_top + 20 * i++) + "px";
            sibling.style.left = src_rect_left + "px";
        });

        let pos_y = src_rect_top;
        let pos_x = src_rect_left;
        //src.style.zIndex = "99";
        //src.style.position = "fixed";
        //src.style.top = src_rect_top + "px";
        //src.style.left = src_rect_left + "px";

        let dx;
        let dy;
        let a = ((dest_top - pos_y) / (dest_left - pos_x));
        let b = pos_y - a * pos_x;
        let v = 70;
        if (stop)
            v = 20;

        if (Math.abs(src_rect_left - dest_left) > 0) {
            dx = v / Math.sqrt(1 + a ** 2);
            if (dest_left < src_rect_left)
                dx *= -1;
            dy = a * dx;
        } else {
            dx = 0;
            dy = v;
            if (dest_top < src_rect_top)
                dy *= -1
        }

        interval = setInterval(frame, 10);
        let breakAnimation = false;

        async function frame() {
            if (hintSignalStop || breakAnimation) {
                console.log("done");
                if (stop)
                    await stopAnimation(siblings);
                else {
                    if (target.id !== "available-container")
                        appendMechanism(target, src);
                    console.log(target);
                    console.log(src);
                }
                clearInterval(interval);
                hintSignalStop = false;
                animationInProgress = false;
                removeDraggingState(siblings);
                /*stopAnimation(siblings).then(() => {
                    clearInterval(interval);
                    hintSignalStop = false;
                    animationInProgress = false;
                });*/
                resolve(src.parentElement);
            } else if (distanceBetweenPoints(pos_x, pos_y, dest_left, dest_top) <= v) {
                //src.style.top = dest_top + "px";
                //src.style.left = dest_left + "px";
                let i = 0;
                siblings.forEach((sibling) => {
                    sibling.style.position = "fixed";
                    sibling.style.zIndex = "99";
                    sibling.style.left = dest_left + 'px';
                    sibling.style.top = (dest_top + 20 * i++) + 'px';
                });
                if (stop)
                    setTimeout(() => breakAnimation = true, 300);
                else
                    breakAnimation = true;
            } else {
                let i = 0;
                pos_x += dx;
                pos_y += dy;

                siblings.forEach((sibling) => {
                    sibling.style.position = "fixed";
                    sibling.style.zIndex = "99";
                    sibling.style.left = pos_x + 'px';
                    sibling.style.top = (pos_y + 20 * i++) + 'px';
                });

            }
        }
    });
}


function distanceBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
}
function stopAnimation (siblings) {
    return new Promise((resolve, reject) => {
        let i = 0;
        siblings.forEach((sibling) => {
            sibling.style.removeProperty("position");
            sibling.style.removeProperty("z-index");
        });
        recalculateOffset(siblings[0].parentElement.id);
        resolve();
    });
}

let hintSignalStop = false;
let animationInProgress = false;
function hint() {
    if ((actions.length === 0 && !wasHintGenerated) || actions[actions.length-1] !== hintLastAction) {
        generateHints();
        lastHintIndex = 0;
        //if (actions.length === 0)
        wasHintGenerated = true;
        //else
        hintLastAction = actions[actions.length-1];
    }

    if (hints.length > 0) {
        if (animationInProgress) {
            hintSignalStop = true;
            return;
        }

        let hintForReversed = false;
        if(lastHintIndex > hints.length-1) {
            flashReverseCard();
            lastHintIndex = 0;
            hintForReversed = true;
        }

        if(!hintSignalStop && !hintForReversed){
            document.getElementById("reverse").classList.remove("dragging");
            animation(hints[lastHintIndex].src, hints[lastHintIndex].target, true);
            lastHintIndex++;
        }

    }
    else {
        flashReverseCard();
    }

}

function flashReverseCard() {
    document.getElementById("reverse").classList.add("dragging");
    setTimeout(() => {
        document.getElementById("reverse").classList.remove("dragging");
    },400);
}

function getProperParent(target) {
    if(target.hasAttribute('id')) {
        if (target.id.includes("container") || target.id.includes("column"))
            return target;
        return target.parentElement;
    }
    return target;
}
function isIdInScope(id) {
    if (id >= 0 && id < cards.length) {
        return true;
    }
}


function canBeMoved(target, card) {
    if (target === null)
        return false;
    parent = getProperParent(target);

    if (!parent.hasAttribute('id') || !target.hasAttribute('id'))
        return false;

    let target_id = target.id;
    let parent_id = parent.id;
    let targetIdInScope = isIdInScope(target_id);

    if (!target.hasAttribute('id'))
        return false;
    else {
        target_id = target.getAttribute('id');

        if (!targetIdInScope && !(target_id.includes("container") || target_id.includes("column")))
            return false;

    }

    if (parent_id.includes("container")) {
        let src_element = document.getElementById(cards.indexOf(card));
        if (getNextSiblingsAndSelf(src_element).length > 1)
            return false;


        if (parent.childElementCount === 0 && card.value === 1) { //no cards in container and pretender is ace
            return true;
        }

        else if (targetIdInScope && parent !== target && cards[target_id].value - card.value === -1 && cards[target_id].suite === card.suite) //same suite and value more by one
            return true;//return !(card.value === 2 && cards[target_id].value === 1);
    }
    else if (parent_id.includes("column")) {
        if (parent.childElementCount === 0 && card.value === 13) //no cards and pretender is king
            return true;
        else if (targetIdInScope && cards[target_id].value - card.value === 1 && cards[target_id].color !== card.color) //different color and value less by one
            return !(card.value === 1 && cards[target_id].value === 2);
    }
    return false;
}
let wasTimerStarted = false;
let timerInterval;
function startTimer(){
    wasTimerStarted = true;
    let timer = document.getElementById("timer");
    let time = 1;
     timerInterval = setInterval(() => {
        let minutes = parseInt(time/60);
        if(minutes < 10)
            minutes = "0" + minutes;
        let seconds = time % 60;
        if (seconds < 10)
            seconds = "0" + seconds;
        timer.innerHTML = minutes + ":" + seconds;
        time++;
        if(countHidden() === 0) {
            document.getElementById("solve-button").classList.remove("not-available");
        }
        else
            document.getElementById("solve-button").classList.add("not-available");

    },1000)
}
function countHidden() {
    let count = 0;
    for(let i=0; i<cards.length; i++) {
        if (cards[i].is_hidden)
            count++;
    }
    return count;
}
let score = 0;
function updateScoreBoard(src, target, wasPreviousSiblingHidden) {
    console.log("//////////////");
    console.log(target);
    console.log(document.getElementById(src).childElementCount);
    if (target.includes("container-")) {
        score+=20;
    }
    else if(wasPreviousSiblingHidden || parseInt(document.getElementById(src).childElementCount) === 0 || target === "available-container" || (target.includes("column-") && src === "available-container"))
        score+=5;

    document.getElementById("score").innerHTML = "Score: " + score;
}

function decrementScoreBoard(src, target, wasPreviousSiblingHidden) {
    console.log("!!!!!!");
    console.log(target);
    if (target.includes("container-")) {
        score-=20;
    }
    else if(wasPreviousSiblingHidden || parseInt(document.getElementById(src).childElementCount) === 0 || target === "available-container" || (target.includes("column-") && src === "available-container"))
        score-=5;

    document.getElementById("score").innerHTML = "Score: " + score;
}

async function solve() {
    if(countHidden() > 0) {
        console.log("nie");
        return;
    }
    let i=0;
    let hasChanged = false;
    while (cardsInContainerCount < 52) {
        let card = cards[i];
        let src = document.getElementById(i);
        if(!card.is_hidden && !card.is_in_container && card.is_present) {
            for(let j=1; j<5; j++) {
                if(card.is_in_container)
                    break;
                let target;
                let target_child_count = parseInt(document.getElementById('container-'+j).childElementCount);
                if (target_child_count === 0)
                    target = document.getElementById('container-'+j);
                else
                    target = document.getElementById('container-'+j).lastElementChild;
                //target = document.getElementById('container-'+j);
                let src = document.getElementById(i);
                if(canBeMoved(target, card)) {
                    //console.log(src.id + " " + target.id);
                    await animation(src, target, false);
                    hasChanged = true;
                    //target.append(src);
                    break;
                }
            }
        }


        if(++i>=52) {
            i=0;
            if(!hasChanged)
                break;
            hasChanged = false;
        }


    }
    generateLock();
}
function generateLock() {
    clearInterval(timerInterval);
    removeEventListeners();
    let lock = document.createElement("div");

    lock.setAttribute('id', "lock");

    lock.style.background = "rgba(0,0,0,0.7)";
    lock.style.height = "100vh";
    lock.style.width = "100vw";
    lock.style.position = "fixed";
    lock.style.top = "0";
    lock.style.zIndex = "1111";
    document.body.append(lock);
}