document.addEventListener('DOMContentLoaded', () => {
    const deckContainer = document.getElementById('deck-container');
    const workingArea = document.getElementById('working-area');
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

      createCardElement() {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
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

    // Create 54 cards and add to the deck
    const cardNames = Array.from({ length: 54 }, (_, i) => ` ${i + 1}`);
    const cardData = cardNames.map((name, index) => new Card(index + 1, name));

    cardData.forEach(card => {
      deckContainer.appendChild(card.createCardElement());
    });

    // Drag and Drop functionality for working area and deck
    [deckContainer, workingArea].forEach(container => {
      container.addEventListener('dragover', (e) => {
        e.preventDefault();
      });

      container.addEventListener('drop', (e) => {
        e.preventDefault();
        const cardId = e.dataTransfer.getData('text/plain');
        const cardElement = document.querySelector(`.card[data-id='${cardId}']`);
        if (cardElement) {
          container.appendChild(cardElement);
          cardElement.style.position = container.id === 'working-area' ? 'absolute' : 'relative';
        }
      });
    });

    // Highlight drop areas when dragging cards
    function highlightDropAreas(highlight) {
      [deckContainer, workingArea].forEach(container => {
        if (highlight) {
          container.classList.add('drop-highlight');
        } else {
          container.classList.remove('drop-highlight');
        }
      });
    }
});
