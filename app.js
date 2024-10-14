document.addEventListener('DOMContentLoaded', () => {
    const deckContainer = document.getElementById('deck-container');
    const workingArea = document.getElementById('working-area');
    const essentialPile = document.getElementById('essential-pile');
    const significantPile = document.getElementById('significant-pile');
    const relevantPile = document.getElementById('relevant-pile');
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `<div class="modal-content">
                          <span class="close-button">&times;</span>
                          <div id="modal-card-content"></div>
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
  
    // Card class to create new cards
    class Card {
      constructor(id, name) {
        this.id = id;
        this.name = name;
      }
  
      createCardElement(deck = true) {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.classList.add(deck ? 'deck-card' : 'working-area-card');
        cardElement.draggable = true;
        cardElement.textContent = this.name;
        cardElement.dataset.id = this.id;
  
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
          document.getElementById('modal-card-content').textContent = this.name;
          modal.style.display = 'block';
          modal.style.opacity = '1';
          modal.style.transform = 'scale(1.1)';
          document.body.classList.add('modal-open');
        });
  
        return cardElement;
      }
    }
  
    // Create 52 cards and add to the deck
    const cardNames = Array.from({ length: 52 }, (_, i) => `Card ${i + 1}`);
    const cardData = cardNames.map((name, index) => new Card(index + 1, name));
  
    let currentCardIndex = 0;
  
    function renderDeck() {
      deckContainer.innerHTML = '<h2 class="DeckTag">Deck</h2><button id="shuffle-button">Shuffle</button>';
      if (cardData.length > 0) {
        const currentCard = cardData[currentCardIndex];
        deckContainer.appendChild(currentCard.createCardElement(true));
      }
  
      // Shuffle button functionality
      const shuffleButton = document.getElementById('shuffle-button');
      shuffleButton.addEventListener('click', () => {
        shuffleArray(cardData);
        currentCardIndex = 0;
        console.log('Deck shuffled:', cardData.map(card => card.name));
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
  
    // Drag and Drop functionality for working area and deck
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
          cardElement.style.position = 'relative';
          currentCardIndex = Math.min(currentCardIndex + 1, cardData.length - 1);
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
  });
  