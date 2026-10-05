// ============================================================
// script.js — Lógica de la aplicación.
// Decide qué datos pedir y cuándo. Para pintar usa dom.js.
// ============================================================

// Cuántos Pokémon se muestran como máximo (para no hacer una lista interminable)
const MAX_RESULTADOS = 12;

// Guarda los Pokémon que se están mostrando
const estado = {
  pokemons: [],
};

// Saca el número del Pokémon a partir de su url de la API
function idDesdeUrl(url) {
  const partes = url.split("/").filter(Boolean);
  return Number(partes[partes.length - 1]);
}

// --- Cargar la Pokédex ---

async function cargarPokedex() {
  if (!hayPokedex()) return;

  const filtros = leerFiltros();
  estado.pokemons = [];
  mostrarMensaje("Cargando Pokémon...");

  try {
    let ids = [];

    if (filtros.generacion) {
      const datos = await getPokemonByGeneration(filtros.generacion);
      ids = datos.pokemon_species.map(function (p) {
        return idDesdeUrl(p.url);
      });
    } else if (filtros.tipo) {
      const datos = await getPokemonByType(filtros.tipo);
      // Los números mayores a 1025 son formas alternativas: los descartamos
      ids = datos.pokemon
        .map(function (p) {
          return idDesdeUrl(p.pokemon.url);
        })
        .filter(function (id) {
          return id <= 1025;
        });
    } else {
      // Sin filtros: solo la primera página de la lista
      const lista = await getPokemonList(MAX_RESULTADOS, 0);
      estado.pokemons = await Promise.all(
        lista.results.map(function (pokemon) {
          return getPokemon(pokemon.name);
        })
      );
      filtrarPorNombre();
      return;
    }

    // Nos quedamos solo con los primeros para no llenar la página de tarjetas
    const recortados = ids.slice(0, MAX_RESULTADOS);
    estado.pokemons = await Promise.all(
      recortados.map(function (id) {
        return getPokemon(id);
      })
    );
    filtrarPorNombre();
  } catch (error) {
    mostrarMensaje("No se pudo cargar la Pokédex. Recarga la página para intentarlo de nuevo.");
  }
}

// Filtra por nombre sobre los Pokémon ya cargados
function filtrarPorNombre() {
  const texto = leerFiltros().texto;
  const filtrados = estado.pokemons.filter(function (pokemon) {
    return pokemon.name.toLowerCase().includes(texto);
  });
  pintarPokemons(filtrados);
}

// --- Pokémon del día ---

// Devuelve un número distinto para cada día del año (entre 1 y 151)
function idDelDia() {
  const hoy = new Date();
  const inicioDeAnio = new Date(hoy.getFullYear(), 0, 0);
  const diaDelAnio = Math.floor((hoy - inicioDeAnio) / 86400000);
  return (diaDelAnio % 151) + 1;
}

async function cargarPokemonDelDia() {
  try {
    const pokemon = await getPokemon(idDelDia());
    pintarPokemonDelDia(pokemon);
  } catch (error) {
    // Si falla la petición se queda el texto que ya trae el HTML
  }
}

// --- Arranque ---

conectarEventos({
  alBuscar: filtrarPorNombre,

  alCambiarTipo: function () {
    // Se filtra por tipo O por generación a la vez: al elegir uno se limpia el otro
    limpiarGeneracion();
    cargarPokedex();
  },

  alCambiarGeneracion: function () {
    limpiarTipo();
    cargarPokedex();
  },

  alPulsarDetalle: function (id) {
    const pokemon = estado.pokemons.find(function (p) {
      return p.id === id;
    });
    if (pokemon) abrirDetalle(pokemon);
  },
});

activarMusica();
cargarPokedex();
cargarPokemonDelDia();
