// Dirección base de la PokéAPI
const API_URL = "https://pokeapi.co/api/v2";

// Devuelve una lista paginada de Pokémon (solo nombre y url)
async function getPokemonList(limit = 12, offset = 0) {
  const respuesta = await fetch(`${API_URL}/pokemon?limit=${limit}&offset=${offset}`);

  if (!respuesta.ok) {
    throw new Error("No se pudo cargar la lista de Pokémon");
  }

  return respuesta.json();
}

// Devuelve los datos completos de un Pokémon (por nombre o por número)
async function getPokemon(idONombre) {
  const respuesta = await fetch(`${API_URL}/pokemon/${idONombre}`);

  if (!respuesta.ok) {
    throw new Error("No se pudo cargar el Pokémon");
  }

  return respuesta.json();
}

// Devuelve los Pokémon de un tipo (nombre en inglés, ej. "fire")
async function getPokemonByType(tipo) {
  const respuesta = await fetch(`${API_URL}/type/${tipo}`);

  if (!respuesta.ok) {
    throw new Error("No se pudo cargar el tipo");
  }

  return respuesta.json();
}

// Devuelve los Pokémon de una generación (número del 1 al 9)
async function getPokemonByGeneration(generacion) {
  const respuesta = await fetch(`${API_URL}/generation/${generacion}`);

  if (!respuesta.ok) {
    throw new Error("No se pudo cargar la generación");
  }

  return respuesta.json();
}
