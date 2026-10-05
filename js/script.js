// Las funciones de la API vienen de js/api.js

// Traducción de los tipos de la API (inglés) al nombre y la clase CSS en español
const TIPOS = {
  normal: { nombre: "Normal", clase: "normal" },
  fire: { nombre: "Fuego", clase: "fuego" },
  water: { nombre: "Agua", clase: "agua" },
  electric: { nombre: "Eléctrico", clase: "electrico" },
  grass: { nombre: "Planta", clase: "planta" },
  ice: { nombre: "Hielo", clase: "hielo" },
  fighting: { nombre: "Lucha", clase: "lucha" },
  poison: { nombre: "Veneno", clase: "veneno" },
  ground: { nombre: "Tierra", clase: "tierra" },
  flying: { nombre: "Volador", clase: "volador" },
  psychic: { nombre: "Psíquico", clase: "psiquico" },
  bug: { nombre: "Bicho", clase: "bicho" },
  rock: { nombre: "Roca", clase: "roca" },
  ghost: { nombre: "Fantasma", clase: "fantasma" },
  dragon: { nombre: "Dragón", clase: "dragon" },
  dark: { nombre: "Siniestro", clase: "siniestro" },
  steel: { nombre: "Acero", clase: "acero" },
  fairy: { nombre: "Hada", clase: "hada" },
};

// Cuántos Pokémon se muestran como máximo (para no hacer una lista interminable)
const MAX_RESULTADOS = 12;

// --- Funciones auxiliares ---

// Convierte 1 en "#001"
function formatearNumero(id) {
  return "#" + String(id).padStart(3, "0");
}

// Convierte "bulbasaur" en "Bulbasaur"
function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Devuelve la mejor imagen disponible del Pokémon
function imagenDe(pokemon) {
  return (
    pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default
  );
}

// Saca el número del Pokémon a partir de su url de la API
function idDesdeUrl(url) {
  const partes = url.split("/").filter(Boolean);
  return Number(partes[partes.length - 1]);
}

// Devuelve el valor de una estadística concreta (hp, attack, defense, speed...)
function valorStat(pokemon, nombre) {
  const stat = pokemon.stats.find(function (s) {
    return s.stat.name === nombre;
  });
  return stat ? stat.base_stat : 0;
}

// Crea las insignias de tipo de un Pokémon
function badgesDeTipos(pokemon) {
  return pokemon.types
    .map(function (tipo) {
      const datos = TIPOS[tipo.type.name] || TIPOS.normal;
      return `<span class="type-badge ${datos.clase}">${datos.nombre}</span>`;
    })
    .join("");
}

// --- Pokédex: filtros y tarjetas ---

// Guarda los Pokémon que se están mostrando
const estado = {
  pokemons: [],
};

function crearCardPokemon(pokemon) {
  return `
    <article class="pokemon-card">
      <p class="pokemon-number">${formatearNumero(pokemon.id)}</p>
      <div class="pokemon-image">
        <img class="pokemon-img" src="${imagenDe(pokemon)}" alt="${pokemon.name}" loading="lazy" />
      </div>
      <h2 class="pokemon-name">${capitalizar(pokemon.name)}</h2>
      <p class="pokemon-types">${badgesDeTipos(pokemon)}</p>
      <button class="btn btn-outline btn-small ver-detalles" type="button" data-id="${pokemon.id}">
        Ver detalles
      </button>
    </article>
  `;
}

function pintarPokemons(pokemons) {
  const contenedor = document.getElementById("lista-pokemon");
  if (!contenedor) return;

  if (pokemons.length === 0) {
    contenedor.innerHTML =
      '<p class="pokemon-error">No hay Pokémon que coincidan con los filtros.</p>';
    return;
  }

  contenedor.innerHTML = pokemons.map(crearCardPokemon).join("");
}

// Filtra por nombre sobre los Pokémon ya cargados
function filtrarPorNombre() {
  const buscar = document.getElementById("filtro-buscar");
  if (!buscar) return;

  const texto = buscar.value.trim().toLowerCase();
  const filtrados = estado.pokemons.filter(function (pokemon) {
    return pokemon.name.toLowerCase().includes(texto);
  });

  pintarPokemons(filtrados);
}

// Carga la Pokédex según la generación y el tipo elegidos
async function cargarPokedex() {
  const contenedor = document.getElementById("lista-pokemon");
  if (!contenedor) return;

  const generacion = document.getElementById("filtro-generacion").value;
  const tipo = document.getElementById("filtro-tipo").value;

  estado.pokemons = [];
  contenedor.innerHTML = '<p class="pokemon-error">Cargando Pokémon...</p>';

  try {
    let ids = [];

    if (generacion) {
      const datos = await getPokemonByGeneration(generacion);
      ids = datos.pokemon_species.map(function (p) {
        return idDesdeUrl(p.url);
      });
    } else if (tipo) {
      const datos = await getPokemonByType(tipo);
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
    contenedor.innerHTML =
      '<p class="pokemon-error">No se pudo cargar la Pokédex. Recarga la página para intentarlo de nuevo.</p>';
  }
}

// --- Ventana de detalles ---

function abrirDetalle(pokemon) {
  const dialogo = document.getElementById("detalle-pokemon");
  if (!dialogo) return;

  document.getElementById("detalle-img").src = imagenDe(pokemon);
  document.getElementById("detalle-img").alt = pokemon.name;
  document.getElementById("detalle-numero").textContent = formatearNumero(pokemon.id);
  document.getElementById("detalle-nombre").textContent = capitalizar(pokemon.name);
  document.getElementById("detalle-tipos").innerHTML = badgesDeTipos(pokemon);

  const habilidades = pokemon.abilities
    .map(function (a) {
      return capitalizar(a.ability.name.replace(/-/g, " "));
    })
    .join(", ");

  document.getElementById("detalle-datos").innerHTML = `
    <li><strong>Altura:</strong> ${pokemon.height / 10} m</li>
    <li><strong>Peso:</strong> ${pokemon.weight / 10} kg</li>
    <li><strong>Habilidades:</strong> ${habilidades}</li>
    <li><strong>PS:</strong> ${valorStat(pokemon, "hp")}</li>
    <li><strong>Ataque:</strong> ${valorStat(pokemon, "attack")}</li>
    <li><strong>Defensa:</strong> ${valorStat(pokemon, "defense")}</li>
    <li><strong>Velocidad:</strong> ${valorStat(pokemon, "speed")}</li>
  `;

  dialogo.showModal();
}

// --- Eventos ---

// Conecta los tres controles de filtrado
function activarFiltros() {
  const buscar = document.getElementById("filtro-buscar");
  const tipo = document.getElementById("filtro-tipo");
  const generacion = document.getElementById("filtro-generacion");
  if (!buscar || !tipo || !generacion) return;

  buscar.addEventListener("input", filtrarPorNombre);

  // Se filtra por tipo O por generación a la vez: al elegir uno se limpia el otro
  tipo.addEventListener("change", function () {
    generacion.value = "";
    cargarPokedex();
  });

  generacion.addEventListener("change", function () {
    tipo.value = "";
    cargarPokedex();
  });
}

// Conecta los botones "Ver detalles" y el cierre de la ventana
function activarDetalles() {
  const contenedor = document.getElementById("lista-pokemon");
  const dialogo = document.getElementById("detalle-pokemon");
  if (!contenedor || !dialogo) return;

  contenedor.addEventListener("click", function (evento) {
    const boton = evento.target.closest(".ver-detalles");
    if (!boton) return;

    const id = Number(boton.dataset.id);
    const pokemon = estado.pokemons.find(function (p) {
      return p.id === id;
    });
    if (pokemon) abrirDetalle(pokemon);
  });

  document.getElementById("detalle-cerrar").addEventListener("click", function () {
    dialogo.close();
  });
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
  const contenedor = document.querySelector(".pokemon-day");
  if (!contenedor) return;

  try {
    const pokemon = await getPokemon(idDelDia());
    const imagen = contenedor.querySelector(".pokemon-day-image");
    const numero = contenedor.querySelector(".pokemon-day-number");
    const nombre = contenedor.querySelector(".pokemon-day-name");

    imagen.classList.remove("img-placeholder");
    imagen.innerHTML = `<img src="${imagenDe(pokemon)}" alt="${pokemon.name}" />`;
    numero.textContent = formatearNumero(pokemon.id);
    nombre.textContent = capitalizar(pokemon.name);
  } catch (error) {
    // Si falla la petición se queda el texto que ya trae el HTML
  }
}

// --- Página de tipos ---

// El botón muestra u oculta los tipos que vienen ocultos en el HTML
function activarVerTipos() {
  const boton = document.getElementById("btn-ver-tipos");
  const grid = document.getElementById("lista-tipos");
  if (!boton || !grid) return;

  boton.addEventListener("click", function () {
    const completo = grid.classList.toggle("tipos-completos");
    boton.textContent = completo ? "Ver menos tipos" : "Ver los 18 tipos";
  });
}

// --- Arranque ---
activarFiltros();
activarDetalles();
activarVerTipos();
cargarPokedex();
cargarPokemonDelDia();
