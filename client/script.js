document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const restaurantsContainer = document.getElementById("restaurants-container");

  // Función para mostrar el modal de agregar calificación y comentario
  const showRatingModal = (restaurantId) => {
    const modal = document.getElementById("modal");
    const ratingForm = document.getElementById("rating-form");
    const closeModalBtn = document.querySelector(".close");
    const saveRatingBtn = document.getElementById("save-rating-btn");

    saveRatingBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      const rating = document.getElementById("rating").value;
      const comment = document.getElementById("comment").value;

      // Enviar la calificación y comentario al servidor
      try {
        const response = await fetch(`/api/restaurants/${restaurantId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rating, comment }), // Enviar ambos rating y comment
        });
        if (response.ok) {
          closeModal();
          getRestaurants().then((restaurants) => {
            showRestaurants(restaurants);
          });
        } else {
          console.error("Error al guardar calificación y comentario");
        }
      } catch (error) {
        console.error("Error al guardar calificación y comentario:", error);
      }
    });

    closeModalBtn.addEventListener("click", closeModal);
    window.addEventListener("click", outsideClick);

    function closeModal() {
      modal.style.display = "none";
      ratingForm.reset();
    }

    function outsideClick(event) {
      if (event.target === modal) {
        closeModal();
      }
    }

    modal.style.display = "block";
  };

  // Función para mostrar el modal con calificaciones y comentarios
  const showRatingCommentsModal = (restaurant) => {
    const ratingModal = document.getElementById("rating-modal");
    const closeRatingModalBtn = ratingModal.querySelector(".close");
    const ratingCommentsContainer = document.getElementById("rating-comments");

    ratingCommentsContainer.innerHTML = "";

    restaurant.grades.forEach((grade) => {
      const date = new Date(grade.date).toLocaleDateString();
      const ratingComment = document.createElement("div");
      ratingComment.innerHTML = `<p>Fecha: ${date}</p><p>Calificación: ${grade.score}`;
      if (grade.comment) {
        ratingComment.innerHTML += ` - Comentario: ${grade.comment}</p>`;
      } else {
        ratingComment.innerHTML += "</p>";
      }
      ratingCommentsContainer.appendChild(ratingComment);
    });

    closeRatingModalBtn.addEventListener("click", () => {
      ratingModal.style.display = "none";
    });
    window.addEventListener("click", (event) => {
      if (event.target === ratingModal) {
        ratingModal.style.display = "none";
      }
    });

    ratingModal.style.display = "block";
  };

  // Función para calcular la calificación promedio
  const calculateAverageRating = (grades) => {
    if (grades.length === 0) return 0;
    const totalRating = grades.reduce((acc, grade) => acc + grade.score, 0);
    return totalRating / grades.length;
  };
 
// Function to show restaurants as cards
const showRestaurants = (restaurants) => {
  const restaurantsContainer = document.getElementById("restaurants-container");
  restaurantsContainer.innerHTML = "";

  restaurants.forEach((restaurant) => {
    const card = document.createElement("div");
    card.classList.add("restaurant-card");

    // Image
    if (restaurant.image) {
      const image = document.createElement("img");
      image.src = restaurant.image;
      image.alt = restaurant.name;
      image.classList.add("restaurant-image");
      card.appendChild(image);
    }

    // Details
    const detailsContainer = document.createElement("div");
    detailsContainer.classList.add("restaurant-details");
    card.appendChild(detailsContainer);

    const name = document.createElement("h2");
    name.textContent = restaurant.name;
    detailsContainer.appendChild(name);

    const details = document.createElement("p");
    const averageRating = calculateAverageRating(restaurant.grades);
    details.innerHTML = `
    <strong>Rating:</strong>  ${averageRating.toFixed(1)}<br>
      <strong>Cocina:</strong> ${restaurant.cuisine}<br>
      <strong>Dirección:</strong> ${displayAddress(restaurant.address[1])}<br>      
      <strong>Horarios:</strong> ${restaurant.schedule}
      
    `;
    detailsContainer.appendChild(details);

    // Buttons
    const buttonsRow = document.createElement("div");
    buttonsRow.classList.add("restaurant-buttons");
    card.appendChild(buttonsRow);

     // Create buttons (rate, view ratings, etc.)
    const rateButton = document.createElement("button");
    rateButton.textContent = "Agregar Calificación";
    rateButton.classList.add("btn", "btn-primary");
    rateButton.addEventListener("click", () => {
      showRatingModal(restaurant._id);
    });
    buttonsRow.appendChild(rateButton);

    const viewRatingsButton = document.createElement("button");
    viewRatingsButton.textContent = "Ver Calificaciones";
    viewRatingsButton.classList.add("btn", "btn-info");
    viewRatingsButton.addEventListener("click", () => {
      showRatingCommentsModal(restaurant);
    });
    buttonsRow.appendChild(viewRatingsButton);
  

    restaurantsContainer.appendChild(card);
  });
};

  // Sample address display function
const displayAddress = (address) => {
  if (address) {
    return `${address.street}, ${address.city}`;
  } else {
    return "Dirección no disponible";
  }
};
  // Función para obtener la lista de restaurantes desde el servidor
  const getRestaurants = async () => {
    try {
      const response = await fetch("/api/restaurants");
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener la lista de restaurantes:", error);
      return [];
    }
  };

  // Función para realizar la búsqueda de restaurantes
  const searchRestaurants = async (searchQuery) => {
    try {
      const response = await fetch(`/api/restaurants?searchQuery=${searchQuery}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al realizar la búsqueda:", error);
      return [];
    }
  };

  // Función para manejar la búsqueda al enviar el formulario
  searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const searchQuery = searchInput.value.trim();
    if (searchQuery === "") {
      // Si el campo de búsqueda está vacío, mostrar todos los restaurantes
      getRestaurants().then((restaurants) => {
        showRestaurants(restaurants);
      });
    } else {
      // Realizar la búsqueda con el valor ingresado
      searchRestaurants(searchQuery).then((restaurants) => {
        showRestaurants(restaurants);
      });
    }
  });


  // Obtener la lista de restaurantes y mostrarlos al cargar la página
  getRestaurants().then((restaurants) => {
    showRestaurants(restaurants);
  });
});
