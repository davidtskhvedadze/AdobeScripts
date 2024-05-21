var project = app.project;
var projectItem = project.rootItem;
var activeSequence = project.activeSequence;
var videoTracks = activeSequence.videoTracks;
var markers = activeSequence.markers;

var videoOne = videoTracks[0];

var frameRate = 29.97; 
var frameTime = 1 / frameRate;

for(var i = 0; i < videoOne.clips.length; i++) {
    var videoClip = videoOne.clips[i];

    if (videoClip && i < markers.numMarkers - 1) {
        var startTime = markers[i].start.seconds;
        // if (i != 0) {
        //     startTime += 2 * frameTime; 
        // }
        videoClip.start = startTime;
        var endTime = markers[i + 1].start.seconds;
        videoClip.end = endTime;
    }
}