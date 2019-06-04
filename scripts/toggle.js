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
      $("input:checkbox").attr("data-on", "Artist");
      $("input:checkbox").attr("data-onstyle", "dark");
    } else {
      $("input:text").attr("placeholder", "Type a song name");
      $("input:checkbox").attr("data-off", "Song");
      $("input:checkbox").attr("data-offstyle", "default");
      $("form").attr("action", "/song/playlist");
    }
  });
});