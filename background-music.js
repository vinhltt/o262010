(function () {
  "use strict";

  // Background music from a YouTube link (config.musicUrl), played by a hidden
  // YouTube player. Browsers usually block sound before the first tap, so:
  // try to play with sound on load; if blocked, play muted and turn the sound
  // on (from the start of the song) at the visitor's first tap anywhere.

  var url = window.CARD_CONFIG.musicUrl;
  var match = /(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/.exec(url || "");
  if (!match) return; // no music configured
  var videoId = match[1];
  var AUTOPLAY_CHECK_MS = 1500;

  var button = document.getElementById("music-toggle");
  var player = null;
  var waitingForTap = false;

  function isAudible() {
    return player.getPlayerState() === YT.PlayerState.PLAYING && !player.isMuted();
  }

  function render() {
    var on = player && isAudible();
    button.classList.toggle("is-off", !on);
    button.setAttribute("aria-pressed", on ? "true" : "false");
  }

  function playWithSound(fromStart) {
    if (fromStart) player.seekTo(0, true);
    player.unMute();
    player.setVolume(100);
    player.playVideo();
  }

  function stopWaitingForTap() {
    waitingForTap = false;
    document.removeEventListener("pointerdown", onFirstTap, true);
    document.removeEventListener("keydown", onFirstTap, true);
  }

  function onFirstTap(e) {
    // A tap on the music button is handled by its own click handler.
    if (e.target.closest && e.target.closest("#music-toggle")) return;
    stopWaitingForTap();
    playWithSound(true);
  }

  function waitForTap() {
    waitingForTap = true;
    player.mute();
    player.playVideo(); // muted autoplay is allowed; keeps the player warm
    document.addEventListener("pointerdown", onFirstTap, true);
    document.addEventListener("keydown", onFirstTap, true);
  }

  function onReady() {
    button.hidden = false;
    playWithSound(false);
    setTimeout(function () {
      if (!isAudible()) waitForTap();
      render();
    }, AUTOPLAY_CHECK_MS);
  }

  function onStateChange(e) {
    // Loop the song.
    if (e.data === YT.PlayerState.ENDED) {
      player.seekTo(0, true);
      player.playVideo();
    }
    render();
  }

  // e.g. the video was removed or its owner disabled embedding: no music, no button.
  function onError(e) {
    stopWaitingForTap();
    button.hidden = true;
    if (window.console) console.warn("Background music unavailable, YouTube error " + e.data);
  }

  button.addEventListener("click", function () {
    if (!player) return;
    var wasWaiting = waitingForTap;
    stopWaitingForTap();
    if (isAudible()) player.pauseVideo();
    else playWithSound(wasWaiting);
    // isMuted() updates asynchronously; re-render once the player catches up.
    setTimeout(render, 300);
  });

  window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player("music-player", {
      videoId: videoId,
      width: 1,
      height: 1,
      playerVars: { autoplay: 1, controls: 0, playsinline: 1, disablekb: 1 },
      events: { onReady: onReady, onStateChange: onStateChange, onError: onError }
    });
  };

  var script = document.createElement("script");
  script.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(script);
})();
