$(function() {
    $("#toggle-event").on('touchstart change', function() {
        if ($(this).prop("checked")) {
            $('input:text').attr("placeholder", "Type an artist name");
        } else {
            $('input:text').attr("placeholder", "Type a song name");
            $('form').attr('action', '/song/playlist');
        }
    })
});