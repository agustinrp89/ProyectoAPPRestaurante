const Restaurant = require('../models/Restaurant');

// Obtener todos los restaurantes
const getAllRestaurants = async (req, res) => {
  try {
    const { searchQuery } = req.query;
    let query = {};

    if (searchQuery) {
      // Utilizar el operador $text para realizar una búsqueda de texto completo
      query = { $text: { $search: searchQuery } };
    }

    const restaurants = await Restaurant.find(query);
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los restaurantes' });
  }
};

// Obtener un restaurante por ID
const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante no encontrado' });
    }
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el restaurante' });
  }
};

// Agregar un nuevo restaurante

const addRestaurant = async (req, res) => {
  try {
    const { name, address, cuisine, image, schedule, grades } = req.body;
    const restaurant = new Restaurant({ name, address, cuisine, image, schedule, grades });
    await restaurant.save();
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar el restaurante' });
  }
};

// Actualizar un restaurante por ID

const updateRestaurantById = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const { rating, comment } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante no encontrado' });
    }

    // Actualizar la calificación
    if (rating) {
      restaurant.grades.push({ date: new Date(), score: rating, comment: comment });
    }

    await restaurant.save();
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el restaurante' });
  }
};

// Eliminar  ID
const deleteRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndRemove(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante no encontrado' });
    }
    res.json({ message: 'Restaurante eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el restaurante' });
  }
};

//actualizar  por ID
const editRestaurantById = async (req, res) => {
  try {
    const restaurantId = req.params.id;
    const { name, address, cuisine, image, schedule } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurante no encontrado' });
    }

    // Actualizar los datos 
    restaurant.name = name;
    restaurant.address.city = address.city;
    restaurant.address.street = address.street; 
    restaurant.cuisine = cuisine;
    restaurant.image = image;
    restaurant.schedule = schedule;

    await restaurant.save();
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: 'Error al editar el restaurante' });
  }
};
module.exports = {
  getAllRestaurants,
  getRestaurantById,
  addRestaurant,
  updateRestaurantById,
  deleteRestaurantById,
  editRestaurantById
};