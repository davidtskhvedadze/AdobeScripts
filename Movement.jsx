var project = app.project;
var projectItem = project.rootItem;

var activeSequence = project.activeSequence;

var videoTracks = activeSequence.videoTracks;

var trackOne = videoTracks[0];
var clip = trackOne.clips[0];

var components = clip.components;
var motionComponent = components[1].properties[1];
var positionComponent = components[1].properties[0]; 
$.writeln(positionComponent.areKeyframesSupported());

$.writeln(motionComponent.displayName);

var xmpBlob = clip.projectItem.getProjectMetadata();


// Extract the dimensions from the XMP metadata
var dimensionsMatch = xmpBlob.match(/<premierePrivateProjectMetaData:Column\.Intrinsic\.VideoInfo>(.*?)<\/premierePrivateProjectMetaData:Column\.Intrinsic\.VideoInfo>/);

    if (dimensionsMatch) {
        // Extract the part that contains the dimensions
        var dimensionsString = dimensionsMatch[1].match(/\d+ x \d+/);
        if (dimensionsString) {
            var dimensions = dimensionsString[0].split(' x ');
            var originalWidth = parseInt(dimensions[0]);
            $.writeln(originalWidth);
            var originalHeight = parseInt(dimensions[1]);
            $.writeln(originalHeight);

    var targetWidth = 1920;
    var targetHeight = 1080;

    var scaleFactorWidth = targetWidth / originalWidth;

    var scaleFactorHeight = targetHeight / originalHeight;

    // Use the larger scale factor to ensure that at least one dimension is not larger than the target size
    var scaleFactor = Math.max(scaleFactorWidth, scaleFactorHeight);

    motionComponent.setTimeVarying(true);
    positionComponent.setTimeVarying(true);

    var startScale = scaleFactor * 100; // Multiply by 100 because scale is in percentage
    var endScale = startScale + 5; // Increment the scale by 5

    motionComponent.addKey(clip.inPoint.seconds);
    motionComponent.addKey(clip.inPoint.seconds + clip.end.seconds);

    // Set the scale at each keyframe
    motionComponent.setValueAtKey(clip.inPoint.seconds, startScale);
    motionComponent.setValueAtKey(clip.inPoint.seconds + clip.end.seconds, endScale);

    positionComponent.addKey(clip.inPoint.seconds);
    positionComponent.addKey(clip.inPoint.seconds + clip.end.seconds);
    
    var centerPositionStart = [originalWidth / 2 / originalWidth, originalHeight / 2 / originalHeight]; // Center of the frame at the start
    var centerPositionEnd = [(originalWidth / 2 + 5) / originalWidth, (originalHeight / 2 + 5) / originalHeight]; // Center of the frame at the end
    
    // Set the position at each keyframe to the center of the frame
    positionComponent.setValueAtKey(clip.inPoint.seconds, centerPositionStart);
    positionComponent.setValueAtKey(clip.inPoint.seconds + clip.end.seconds, centerPositionEnd);
}

}
