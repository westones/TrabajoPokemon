// ============================================================
// dom.js — Capa de presentación.
// Todo lo que crea o modifica el HTML vive aquí.
// No pide datos: recibe datos y los pinta.
// ============================================================

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

// --- Formato de datos ---

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

// --- Leer el estado de los filtros ---

// Devuelve lo que el usuario ha escrito o elegido en los filtros
function leerFiltros() {
  const buscar = document.getElementById("filtro-buscar");
  const tipo = document.getElementById("filtro-tipo");
  const generacion = document.getElementById("filtro-generacion");

  return {
    texto: buscar ? buscar.value.trim().toLowerCase() : "",
    tipo: tipo ? tipo.value : "",
    generacion: generacion ? generacion.value : "",
  };
}

function limpiarTipo() {
  const select = document.getElementById("filtro-tipo");
  if (select) select.value = "";
}

function limpiarGeneracion() {
  const select = document.getElementById("filtro-generacion");
  if (select) select.value = "";
}

// ¿Estamos en la página de la Pokédex?
function hayPokedex() {
  return document.getElementById("lista-pokemon") !== null;
}

// --- Pintar la lista de la Pokédex ---

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

// Muestra un texto dentro de la rejilla (cargando, error o vacío)
function mostrarMensaje(texto) {
  const contenedor = document.getElementById("lista-pokemon");
  if (!contenedor) return;
  contenedor.innerHTML = `<p class="pokemon-error">${texto}</p>`;
}

function pintarPokemons(pokemons) {
  const contenedor = document.getElementById("lista-pokemon");
  if (!contenedor) return;

  if (pokemons.length === 0) {
    mostrarMensaje("No hay Pokémon que coincidan con los filtros.");
    return;
  }

  contenedor.innerHTML = pokemons.map(crearCardPokemon).join("");
}

// --- Pokémon del día ---

function pintarPokemonDelDia(pokemon) {
  const contenedor = document.querySelector(".pokemon-day");
  if (!contenedor) return;

  const imagen = contenedor.querySelector(".pokemon-day-image");
  const numero = contenedor.querySelector(".pokemon-day-number");
  const nombre = contenedor.querySelector(".pokemon-day-name");

  imagen.classList.remove("img-placeholder");
  imagen.innerHTML = `<img src="${imagenDe(pokemon)}" alt="${pokemon.name}" />`;
  numero.textContent = formatearNumero(pokemon.id);
  nombre.textContent = capitalizar(pokemon.name);
}

// --- Ventana de detalles ---

function abrirDetalle(pokemon) {
  const dialogo = document.getElementById("detalle-pokemon");
  if (!dialogo) return;

  const imagen = document.getElementById("detalle-img");
  imagen.src = imagenDe(pokemon);
  imagen.alt = pokemon.name;

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

function cerrarDetalle() {
  const dialogo = document.getElementById("detalle-pokemon");
  if (dialogo) dialogo.close();
}

// --- Página de tipos ---

// El botón muestra u oculta los tipos que vienen ocultos en el HTML
function alternarTipos() {
  const boton = document.getElementById("btn-ver-tipos");
  const grid = document.getElementById("lista-tipos");
  if (!boton || !grid) return;

  const completo = grid.classList.toggle("tipos-completos");
  boton.textContent = completo ? "Ver menos tipos" : "Ver los 18 tipos";
}

// --- Música de fondo ---

// Iconos SVG en vez de emojis, para que se vean igual en todos los navegadores
const ICONO_MUSICA_APAGADA =
  '<svg class="music-icon" viewBox="0 0 24 24" aria-hidden="true">' +
  '<polygon points="6 4 20 12 6 20 6 4" /></svg>';

const ICONO_MUSICA_ENCENDIDA =
  '<svg class="music-icon" viewBox="0 0 24 24" aria-hidden="true">' +
  '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />' +
  '<line x1="23" y1="9" x2="17" y2="15" />' +
  '<line x1="17" y1="9" x2="23" y2="15" /></svg>';

// Conecta el botón de música con el audio (solo si la página los tiene)
function activarMusica() {
  const musica = document.querySelector("#background-music");
  const boton = document.querySelector("#music-button");
  if (!musica || !boton) return;

  // play() devuelve una promesa en los navegadores modernos. Si el navegador
  // bloquea el autoplay, la rechaza: lo capturamos para que no dé error.
  function intentarReproducir() {
    const promesa = musica.play();
    if (promesa && promesa.catch) promesa.catch(function () {});
  }

  // Pinta el botón según el estado real del audio
  function pintarBoton() {
    const sonando = !musica.paused;
    const icono = sonando ? ICONO_MUSICA_ENCENDIDA : ICONO_MUSICA_APAGADA;
    const texto = sonando ? "Silenciar" : "Encender música";
    boton.innerHTML = icono + "<span>" + texto + "</span>";
    boton.setAttribute("aria-pressed", sonando ? "true" : "false");
  }

  // Intentamos arrancar la música (unos navegadores lo permiten y otros no)
  intentarReproducir();
  pintarBoton();

  boton.addEventListener("click", function () {
    if (musica.paused) {
      intentarReproducir();
    } else {
      musica.pause();
    }
    pintarBoton();
  });

  // Si el navegador arranca o para el audio por su cuenta, mantenemos el botón al día
  musica.addEventListener("play", pintarBoton);
  musica.addEventListener("pause", pintarBoton);
}

// --- Conectar el HTML con la lógica de script.js ---

// Recibe las acciones de script.js y las engancha a los elementos del HTML
function conectarEventos(acciones) {
  const buscar = document.getElementById("filtro-buscar");
  const tipo = document.getElementById("filtro-tipo");
  const generacion = document.getElementById("filtro-generacion");
  const grid = document.getElementById("lista-pokemon");
  const botonTipos = document.getElementById("btn-ver-tipos");
  const cerrar = document.getElementById("detalle-cerrar");

  if (buscar) buscar.addEventListener("input", acciones.alBuscar);
  if (tipo) tipo.addEventListener("change", acciones.alCambiarTipo);
  if (generacion) generacion.addEventListener("change", acciones.alCambiarGeneracion);
  if (botonTipos) botonTipos.addEventListener("click", alternarTipos);
  if (cerrar) cerrar.addEventListener("click", cerrarDetalle);

  if (grid) {
    grid.addEventListener("click", function (evento) {
      const boton = evento.target.closest(".ver-detalles");
      if (boton && acciones.alPulsarDetalle) acciones.alPulsarDetalle(Number(boton.dataset.id));
    });
  }
}
