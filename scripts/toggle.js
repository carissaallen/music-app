$(function() {
  $("#toggle-event").on("change", function() {
    if ($(this).prop("checked")) {
      $("input:text").attr("placeholder", "Type an artist name");
    } else {
      $("input:text").attr("placeholder", "Type a song name");
      $("form").attr("action", "/song/playlist");
    }
  });
});

$(function() {
  $(".toggle").on("touchstart", function() {
    if ($(this).prop("checked")) {
      $("input:text").attr("placeholder", "Type an artist name");
      $('#toggle-event').bootstrapToggle('enable');
      $("form").attr("action", "/artist/playlist");
    } else {
      $("input:text").attr("placeholder", "Type a song name");
      $('#toggle-event').bootstrapToggle('disable');
      $("form").attr("action", "/song/playlist");
    }
  });
});