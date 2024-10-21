// Globals
const CARD_TYPES = {
  DECK: 'deck-card',
  WORKING: 'working-area-card'
};

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;

// Data
class Card {
  constructor(id, name, question) {
    this.id = id;
    this.name = name;
    this.question = question;
  }
}

class Deck {
  constructor(cards) {
    this.cards = cards.map(card => new Card(card.cardNumber, card.name, card.question));
    this.currentIndex = 0;
  }

  shuffle() {
    console.log('Shuffling deck...');
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
    this.currentIndex = 0;
    console.log('Deck after shuffle:', this.cards.map(card => card.name));
  }

  getCurrentCard() {
    if (this.cards.length === 0) {
      console.log('No cards left in the deck.');
      return null;
    }
    console.log('Current card:', this.cards[this.currentIndex].name);
    return this.cards[this.currentIndex];
  }

  moveToNextCard() {
    if (this.cards.length === 0) {
      this.currentIndex = 0;
    } else {
      this.currentIndex %= this.cards.length;
    }
    console.log('Moved to next card. Current index:', this.currentIndex);
  }

  removeCardById(cardId) {
    const index = this.cards.findIndex(card => card.id === cardId);
    if (index !== -1) {
      console.log(`Removing card: ${this.cards[index].name}`);
      this.cards.splice(index, 1);
      if (index <= this.currentIndex && this.currentIndex > 0) {
        this.currentIndex--;
      }
    } else {
      console.log(`Card with ID ${cardId} not found in deck.`);
    }
  }
}

// UI Elements
const Elements = {
  deckContainer: document.getElementById('deck-container'),
  essentialPile: document.getElementById('essential-pile'),
  significantPile: document.getElementById('significant-pile'),
  relevantPile: document.getElementById('relevant-pile'),
  modal: null,
  modalContent: null,
  closeButton: null,
  flipButton: null,
  shuffleButton: null,
  resetButton: null
};

// UI/UX
class UI {
  static currentCardElement = null;

  static createModal() {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
      <div class="modal-content">
        <button class="close-button">
          <img src="assets/close-icon.svg" alt="Close">
        </button>
        <div id="modal-card-content"></div>
        <button id="flip-button">Flip</button>
      </div>`;
    document.body.appendChild(modal);

    Elements.modal = modal;
    Elements.modalContent = modal.querySelector('.modal-content');
    Elements.closeButton = modal.querySelector('.close-button');
    Elements.flipButton = modal.querySelector('#flip-button');
    console.log('Modal created.');
  }


  static showModal(content) {
    document.getElementById('modal-card-content').textContent = content;
    Elements.modal.style.display = 'block';
    Elements.modal.style.opacity = '1';
    Elements.modal.style.transform = 'scale(1.1)';
    document.body.classList.add('modal-open');
    console.log('Modal shown with content:', content);
  }

  static closeModal() {
    Elements.modal.style.display = 'none';
    document.body.classList.remove('modal-open');
    Elements.modal.style.opacity = '0';
    console.log('Modal closed.');
  }

  static flipCard() {
    if (Elements.modalContent.style.transform === 'rotateY(180deg)') {
      Elements.modalContent.style.transform = 'rotateY(0deg)';
      console.log('Card flipped to front.');
    } else {
      Elements.modalContent.style.transform = 'rotateY(180deg)';
      console.log('Card flipped to back.');
    }
  }

  static highlightDropAreas(highlight) {
    [Elements.essentialPile, Elements.significantPile, Elements.relevantPile].forEach(container => {
      container.classList.toggle('drop-highlight', highlight);
    });
    console.log('Drop areas', highlight ? 'highlighted' : 'unhighlighted');
  }

  static showMoveMenu(cardElement, x, y) {
    const moveMenu = document.getElementById('move-menu');
    moveMenu.style.display = 'block';
    moveMenu.style.position = 'absolute';
    moveMenu.style.left = `${x}px`;
    moveMenu.style.top = `${y}px`;
    UI.currentCardElement = cardElement;
  }

  static createCardElement(card, type = CARD_TYPES.DECK) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card', type);
    cardElement.dataset.id = card.id;

    const nameElement = document.createElement('div');
    nameElement.classList.add('cardTitle');
    nameElement.textContent = card.name;

    cardElement.appendChild(nameElement);

    if (isTouchDevice) {
      let touchStartTime = 0;
      let touchTimeout;

      cardElement.addEventListener('touchstart', (e) => {
        touchStartTime = Date.now();
        touchTimeout = setTimeout(() => {
          // Long press detected
          e.preventDefault();
          UI.showMoveMenu(cardElement, e.touches[0].clientX, e.touches[0].clientY);
        }, 600);
      });

      cardElement.addEventListener('touchend', (e) => {
        clearTimeout(touchTimeout);
        const touchDuration = Date.now() - touchStartTime;
        if (touchDuration < 600) {
          // Consider it a tap
          UI.showModal(`${card.name}\n\n${card.question}`);
        }
        e.preventDefault();
      });

      cardElement.addEventListener('touchmove', (e) => {
        clearTimeout(touchTimeout);
      });
    } else {
      cardElement.draggable = true;

      cardElement.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', card.id);
        cardElement.classList.add('dragging');
        UI.highlightDropAreas(true);
        console.log(`Started dragging card: ${card.name}`);
      });

      cardElement.addEventListener('dragend', () => {
        cardElement.classList.remove('dragging');
        UI.highlightDropAreas(false);
        console.log(`Finished dragging card: ${card.name}`);
      });

      cardElement.addEventListener('click', () => {
        UI.showModal(`${card.name}\n\n${card.question}`);
      });
    }

    return cardElement;
  }
}

// Rendering
class Renderer {
  constructor(deck) {
    this.deck = deck;
  }

  renderDeck() {
    Elements.deckContainer.innerHTML = `
      <h2 class="DeckTag">Deck</h2>
      <button id="shuffle-button">Shuffle</button>
      <button id="reset-button">Reset</button>`;
    Elements.shuffleButton = document.getElementById('shuffle-button');
    Elements.resetButton = document.getElementById('reset-button');

    const currentCard = this.deck.getCurrentCard();
    if (currentCard) {
      Elements.deckContainer.appendChild(UI.createCardElement(currentCard));
      console.log('Rendered current card:', currentCard.name);
    } else {
      const noCardsMessage = document.createElement('p');
      noCardsMessage.textContent = 'No more cards in the deck.';
      Elements.deckContainer.appendChild(noCardsMessage);
      console.log('No more cards to display in the deck.');
    }

    // Reattach event listeners to buttons
    EventHandlers.setupButtons();
  }
}

// Event Handlers
class EventHandlers {
  static setupDragAndDrop() {
    if (!isTouchDevice) {
      [Elements.essentialPile, Elements.significantPile, Elements.relevantPile].forEach(pile => {
        pile.addEventListener('dragover', (e) => e.preventDefault());
        pile.addEventListener('drop', (e) => {
          e.preventDefault();
          const cardId = e.dataTransfer.getData('text/plain');
          const cardElement = document.querySelector(`.card[data-id='${cardId}']`);

          if (cardElement) {
            pile.appendChild(cardElement);
            cardElement.classList.remove(CARD_TYPES.DECK);
            cardElement.classList.add(CARD_TYPES.WORKING);
            cardElement.style.position = 'absolute';
            cardElement.style.left = `${e.offsetX}px`;
            cardElement.style.top = `${e.offsetY}px`;

            // Remove the card from the deck's cards array
            App.deck.removeCardById(parseInt(cardId));

            App.deck.moveToNextCard();
            App.renderer.renderDeck();
            console.log(`Card with ID ${cardId} dropped into pile.`);
          }
        });
      });
      console.log('Drag and drop event handlers set up.');
    }
  }

  static setupModalEvents() {
    Elements.closeButton.addEventListener('click', UI.closeModal);
    window.addEventListener('click', (e) => {
      if (e.target === Elements.modal) {
        UI.closeModal();
      }
    });
    Elements.flipButton.addEventListener('click', UI.flipCard);
    console.log('Modal event handlers set up.');
  }

  static setupMoveMenuEvents() {
    const moveMenu = document.getElementById('move-menu');
    moveMenu.addEventListener('click', (e) => {
      const pileId = e.target.dataset.pile;
      if (pileId && UI.currentCardElement) {
        const targetPile = document.getElementById(pileId);
        targetPile.appendChild(UI.currentCardElement);

        // Update card classes
        UI.currentCardElement.classList.remove(CARD_TYPES.DECK);
        UI.currentCardElement.classList.add(CARD_TYPES.WORKING);

        // Remove the card from the deck
        const cardId = parseInt(UI.currentCardElement.dataset.id);
        App.deck.removeCardById(cardId);

        App.deck.moveToNextCard();
        App.renderer.renderDeck();

        moveMenu.style.display = 'none';
        UI.currentCardElement = null;
      }
    });

    document.addEventListener('click', (e) => {
      const moveMenu = document.getElementById('move-menu');
      if (moveMenu.style.display === 'block' && !moveMenu.contains(e.target)) {
        moveMenu.style.display = 'none';
        UI.currentCardElement = null;
      }
    });
    console.log('Move menu event handlers set up.');
  }

  static setupButtons() {
    // Remove existing event listeners to prevent multiple bindings
    Elements.shuffleButton.replaceWith(Elements.shuffleButton.cloneNode(true));
    Elements.resetButton.replaceWith(Elements.resetButton.cloneNode(true));

    // Reassign the buttons after cloning
    Elements.shuffleButton = document.getElementById('shuffle-button');
    Elements.resetButton = document.getElementById('reset-button');

    Elements.shuffleButton.addEventListener('click', () => {
      console.log('Shuffle button clicked.');
      App.deck.shuffle();
      App.renderer.renderDeck();
    });

    Elements.resetButton.addEventListener('click', () => {
      console.log('Reset button clicked.');
      App.reset();
    });
    console.log('Button event handlers set up.');
  }
}

// Main App
class App {
  static deck;
  static renderer;
  static originalDeckData;

  static init() {
    // Initialize data
    const valueDeckData = [
      { cardNumber: 1, name: "Creativity", question: "What is it about creativity that makes you feel vulnerable?" },
      { cardNumber: 2, name: "Inspiration", question: "Where does inspiration come from?" },
      { cardNumber: 3, name: "Thoughtfulness", question: "When does thoughtfulness take a back seat in your life?" },
      { cardNumber: 4, name: "Integrity", question: "Where are you out of integrity and how is it manifesting in your life?" },
      { cardNumber: 5, name: "Happiness", question: "How does happiness change your perception of things?" },
      { cardNumber: 6, name: "Learning", question: "What are you afraid to learn?" },
      { cardNumber: 7, name: "Nature", question: "What does nature have in common with you?" },
      { cardNumber: 8, name: "Serenity", question: "What does serenity allow in your life that wouldn't exist otherwise?" },
      { cardNumber: 9, name: "Intuition", question: "What does intuition do to get your attention?" },
      { cardNumber: 10, name: "Magic", question: "Where have you forgotten to notice magic?" },
      { cardNumber: 11, name: "Closeness", question: "What allows closeness in your life?" },
      { cardNumber: 12, name: "Trust", question: "How is life different when you trust?" },
      { cardNumber: 13, name: "Safety", question: "What does safety allow to happen?" },
      { cardNumber: 14, name: "Organization", question: "How does organization impact your willingness?" },
      { cardNumber: 15, name: "Connection", question: "Where could you deepen your value of connection?" },
      { cardNumber: 16, name: "Beauty", question: "Why does beauty exist?" },
      { cardNumber: 17, name: "Peace", question: "How do you access peace?" },
      { cardNumber: 18, name: "Excellence", question: "How do you notice excellence in yourself?" },
      { cardNumber: 19, name: "Vitality", question: "What takes away from your vitality?" },
      { cardNumber: 20, name: "Contribution", question: "What do you notice when contribution is missing?" },
      { cardNumber: 21, name: "Fairness", question: "How does fairness impact your decision making?" },
      { cardNumber: 22, name: "Dependability", question: "How does dependability make a difference in your choices?" },
      { cardNumber: 23, name: "Accomplishment", question: "What other values support accomplishment in your life?" },
      { cardNumber: 24, name: "Authenticity", question: "How does being authentic impact your actions?" },
      { cardNumber: 25, name: "Intimacy", question: "What manifests in your life when intimacy is lacking?" },
      { cardNumber: 26, name: "Health", question: "What part of your health wants more attention?" },
      { cardNumber: 27, name: "Compassion", question: "What other values support compassion?" },
      { cardNumber: 28, name: "Self-expression", question: "How does self-expression change outcomes?" },
      { cardNumber: 29, name: "Competition", question: "When does competition serve you best?" },
      { cardNumber: 30, name: "Risk-taking", question: "How do you know when it's worth taking a risk?" },
      { cardNumber: 31, name: "Relationship", question: "What does relationship mean to you?" },
      { cardNumber: 32, name: "Personal Growth", question: "How do you know when it's time to grow?" },
      { cardNumber: 33, name: "Security", question: "Where does a sense of security come from?" },
      { cardNumber: 34, name: "Collaboration", question: "How has collaboration served you in your life?" },
      { cardNumber: 35, name: "Responsibility", question: "How does living into your value of responsibility make a difference?" },
      { cardNumber: 36, name: "Patience", question: "When does patience not serve you?" },
      { cardNumber: 37, name: "Justice", question: "What happens when a sense of justice isn't present?" },
      { cardNumber: 38, name: "Planning", question: "How is planning connected to your dreams?" },
      { cardNumber: 39, name: "Legacy", question: "Where in your life are you creating the gift of legacy?" },
      { cardNumber: 40, name: "Privacy", question: "What does privacy allow to exist?" },
      { cardNumber: 41, name: "Adventure", question: "Where in your body do you feel a sense of adventure?" },
      { cardNumber: 42, name: "Courage", question: "How long does it take for courage to show up when you need it?" },
      { cardNumber: 43, name: "Reflection", question: "How does self-reflection impact your choices?" },
      { cardNumber: 44, name: "Spirituality", question: "How does spirituality show up in your life?" },
      { cardNumber: 45, name: "Loyalty", question: "Does a sense of loyalty ever challenge your decision making?" },
      { cardNumber: 46, name: "Resilience", question: "How do you know when you are feeling resilient?" },
      { cardNumber: 47, name: "Balance", question: "Where are you out of balance?" },
      { cardNumber: 48, name: "Uniqueness", question: "How does your uniqueness show up?" },
      { cardNumber: 49, name: "Service", question: "How do you receive when you  are being of service?" },
      { cardNumber: 50, name: "Love", question: "How does love exist?" }
    ];

    this.originalDeckData = valueDeckData; // Store the original data
    this.deck = new Deck([...this.originalDeckData]); // Make a copy of the original data
    this.renderer = new Renderer(this.deck);

    // Setup UI
    UI.createModal();

    // Render the deck before setting up event handlers
    this.renderer.renderDeck();

    // Setup event handlers
    EventHandlers.setupDragAndDrop();
    EventHandlers.setupModalEvents();
    EventHandlers.setupMoveMenuEvents();

    console.log('App initialized.');
  }

  static reset() {
    console.log('Resetting app...');
    // Reset deck
    this.deck = new Deck([...this.originalDeckData]); // Make a fresh copy of the original data
    this.renderer.deck = this.deck;
    this.deck.currentIndex = 0;

    // Clear working areas
    [Elements.essentialPile, Elements.significantPile, Elements.relevantPile].forEach(pile => {
      pile.innerHTML = '';
    });

    // Re-render the deck
    this.renderer.renderDeck();
  }
}

// Initialize the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', App.init.bind(App));
