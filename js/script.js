const music = document.querySelector("#background-music");
const musicButton = document.querySelector("#music-button");

musicButton.addEventListener("click", () => {
  if (music.paused) {
    music.play();
    musicButton.textContent = "🔇 Silenciar";
  } else {
    music.pause();
    musicButton.textContent = "🔊 Música";
  }
});
