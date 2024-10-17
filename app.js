document.addEventListener('DOMContentLoaded', () => {
  const deckContainer = document.getElementById('deck-container');
  const essentialPile = document.getElementById('essential-pile');
  const significantPile = document.getElementById('significant-pile');
  const relevantPile = document.getElementById('relevant-pile');
  const modal = document.createElement('div');
  modal.classList.add('modal');
  modal.innerHTML = `<div class="modal-content">
                        <span class="close-button">&times;</span>
                        <div id="modal-card-content"></div>
                        <button id="flip-button">Flip</button>
                    </div>`;
  document.body.appendChild(modal);

  const closeModal = () => {
    modal.style.display = 'none';
    document.body.classList.remove('modal-open');
    modal.style.opacity = '0';
  };

  modal.querySelector('.close-button').addEventListener('click', closeModal);
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  class Card {
    constructor(id, name, question) {
      this.id = id;
      this.name = name;
      this.question = question;
    }
  
    createCardElement(deck = true) {
      const cardElement = document.createElement('div');
      cardElement.classList.add('card');
      cardElement.classList.add(deck ? 'deck-card' : 'working-area-card');
      cardElement.draggable = true;
      cardElement.dataset.id = this.id;
  
      // Create a div for the name and add 'comethere' class
      const nameElement = document.createElement('div');
      nameElement.classList.add('cardTitle');
      nameElement.textContent = this.name;  // Add the name here
  
      // Append the name element to the card element
      cardElement.appendChild(nameElement);
  
      // Add drag event listeners
      cardElement.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', this.id);
        cardElement.classList.add('dragging');
        highlightDropAreas(true);
      });
  
      cardElement.addEventListener('dragend', () => {
        cardElement.classList.remove('dragging');
        highlightDropAreas(false);
      });
  
      // Add click event listener for modal view
      cardElement.addEventListener('click', () => {
        document.getElementById('modal-card-content').textContent = `${this.name}\n\n${this.question}`;
        modal.style.display = 'block';
        modal.style.opacity = '1';
        modal.style.transform = 'scale(1.1)';
        document.body.classList.add('modal-open');
      });
  
      return cardElement;
    }
  }
  
  

  // Value deck data
  const valueDeck = [
    { cardNumber: 1, name: "Creativity", question: "What is it about creativity that makes you feel vulnerable?" },
    { cardNumber: 2, name: "Inspiration", question: "Where does inspiration come from?" },
    { cardNumber: 3, name: "Thoughtfulness", question: "When does thoughtfulness take a back seat in your life?" },
    { cardNumber: 4, name: "Integrity", question: "Where are you out of integrity and how is it manifesting in your life?" },
    { cardNumber: 5, name: "Happiness", question: "How does happiness change your perception of thing" },
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
    { cardNumber: 28, name: "Self-expression", question: "How does self expression change outcomes?" },
    { cardNumber: 29, name: "Competition", question: "When does competition serve you best?" },
    { cardNumber: 30, name: "Risk-taking", question: "How do you know when it's worth taking a risk?" },
    { cardNumber: 31, name: "Relationship", question: "What does relationship mean to you?" },
    { cardNumber: 32, name: "Personal Growth", question: "How do you know when it's time to grow?" },
    { cardNumber: 33, name: "Security", question: "Where does a sense of security come from?" },
    { cardNumber: 34, name: "Collaboration", question: "How has collaboration served you in your life?" },
    { cardNumber: 35, name: "Responsibility", question: "How does living into your value of responsibility make a difference?" },
    { cardNumber: 36, name: "Patience", question: "When does patience not serve you?" },
    { cardNumber: 37, name: "Justice", question: "a sense of justice isn't present?" },
    { cardNumber: 38, name: "Planning", question: "How is planning connected to your dreams?" },
    { cardNumber: 39, name: "Legacy", question: "Where in your life are you creating the gift of legacy?" },
    { cardNumber: 40, name: "Privacy", question: "What does privacy allow to exist?" },
    { cardNumber: 41, name: "Adventure", question: "Where in your body do you feel a sense of adventure?" },
    { cardNumber: 42, name: "Courage", question: "How long does it take for courage to show up when you need it?" },
    { cardNumber: 43, name: "Reflection", question: "How does self reflection impact your choices?" },
    { cardNumber: 44, name: "Spirituality", question: "How does spirituality show up in your life?" },
    { cardNumber: 45, name: "Loyalty", question: "Does a sense of loyalty ever challenge your decision making?" },
    { cardNumber: 46, name: "Resilience", question: "How do you know when you are feeling resilient?" },
    { cardNumber: 47, name: "Balance", question: "Where are you out of balance?" },
    { cardNumber: 48, name: "Uniqueness", question: "How does your uniqueness show up?" },
    { cardNumber: 49, name: "Service", question: "How do you receive when you are being of service?" },
    { cardNumber: 50, name: "Love", question: "How does love exist?" }
  ];

  let currentCardIndex = 0;

  function renderDeck() {
    deckContainer.innerHTML = '<h2 class="DeckTag">Deck</h2><button id="shuffle-button">Shuffle</button>';
    if (valueDeck.length > 0) {
      const currentCard = valueDeck[currentCardIndex];
      const card = new Card(currentCard.cardNumber, currentCard.name, currentCard.question);
      deckContainer.appendChild(card.createCardElement(true));
    }

    // Shuffle button functionality
    const shuffleButton = document.getElementById('shuffle-button');
    shuffleButton.addEventListener('click', () => {
      shuffleArray(valueDeck);
      currentCardIndex = 0;
      console.log('Deck shuffled:', valueDeck.map(card => card.name));
      renderDeck();
    });
  }

  renderDeck();

  // Shuffle function
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Drag and Drop functionality for piles
  [essentialPile, significantPile, relevantPile].forEach(pile => {
    pile.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    pile.addEventListener('drop', (e) => {
      e.preventDefault();
      const cardId = e.dataTransfer.getData('text/plain');
      const cardElement = document.querySelector(`.card[data-id='${cardId}']`);
      
      if (cardElement) {
        pile.appendChild(cardElement);
        cardElement.classList.remove('deck-card');
        cardElement.classList.add('working-area-card');
        cardElement.style.position = 'absolute';
        cardElement.style.left = `${e.offsetX}px`;
        cardElement.style.top = `${e.offsetY}px`;

        currentCardIndex = Math.min(currentCardIndex + 1, valueDeck.length - 1);
        renderDeck();
      }
    });
  });

  // Highlight drop areas when dragging cards
  function highlightDropAreas(highlight) {
    [essentialPile, significantPile, relevantPile].forEach(container => {
      if (highlight) {
        container.classList.add('drop-highlight');
      } else {
        container.classList.remove('drop-highlight');
      }
    });
  }

  // Flip card in modal
  const flipButton = document.getElementById('flip-button');
  flipButton.addEventListener('click', () => {
    const modalContent = document.querySelector('.modal-content');
    if (modalContent.style.transform === 'rotateY(180deg)') {
      modalContent.style.transform = 'rotateY(0deg)';
    } else {
      modalContent.style.transform = 'rotateY(180deg)';
    }
  });
});
