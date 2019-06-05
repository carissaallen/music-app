$(function() {
  $("#toggle-event").on("touchstart change", function(event) {
    if ($(this).prop("checked")) {
      $("input:text").attr("placeholder", "Type an artist name");
      $("form").attr("action", "/artist/playlist");
    } else {
      $("input:text").attr("placeholder", "Type a song name");
      $("form").attr("action", "/song/playlist");
    }
  });
});

$(function() {
  $(".toggle").on("touchstart", function(event) {
    $('#toggle-event').bootstrapToggle("toggle");
    if ($('#toggle-event').prop("checked")) {
      $("input:text").attr("placeholder", "Type an artist name");
      $("form").attr("action", "/artist/playlist");
    } else {
      $("input:text").attr("placeholder", "Type a song name");
      $("form").attr("action", "/song/playlist");
    }
    event.stopPropagation();
    event.preventDefault(); 
  });
});
