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
  $("#toggle-event").on("touch", function() {
    if ($(this).prop("checked")) {
      $("input:text").attr("placeholder", "Type an artist name");
    } else {
      $("input:text").attr("placeholder", "Type a song name");
      $("form").attr("action", "/song/playlist");
    }
  });
});
