var project = app.project;
var projectItem = project.rootItem;
var activeSequence = project.activeSequence;
var videoTracks = activeSequence.videoTracks;
var markers = activeSequence.markers;

var videoTrackOne = videoTracks[0];
var captionTrackOld = videoTracks[3];
var captionTrackNew = videoTracks[4];

var frameRate = 29.97; 
var frameTime = 1 / frameRate;

for(var i = 0; i < videoTrackOne.clips.length; i++) {
    var captionClip = captionTrack.clips[i];
    var videoClip = videoTrackOne.clips[i];

    if (videoClip && i < markers.numMarkers - 1) {
        var startTime = markers[i].start.seconds;
        if (i != 0) {
            startTime += 2 * frameTime; 
        }
        videoClip.start = startTime;
        var endTime = markers[i + 1].start.seconds + 2 * frameTime;
        videoClip.end = endTime;
    }
}

for(var i = 0; i < captionTrackOld.clips.length; i++) {
    var captionClipOld = captionTrackOld.clips[i];
    var captionClipNew = captionTrackNew.clips[i];

    if (captionClipOld && videoClipNew) {
        captionClipNew.start = captionClipOld.start;
        captionClipNew.end = captionClipNew.end;
    }
}