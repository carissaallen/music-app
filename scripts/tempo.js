$(function() {
    $("#tempo").on("change", function() {
      for (var i=0; i < playlist.length; ++i) {
        console.log(`song: ${playlist[i].song}`);
        console.log(`tempo: ${playlist[i].tempo}`);
      }
    })
});