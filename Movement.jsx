var project = app.project;
var projectItem = project.rootItem;

var activeSequence = project.activeSequence;

var videoTracks = activeSequence.videoTracks;

var trackOne = videoTracks[0];
var movementTypes = [
    "Zoom in",
    "Zoom out",
    "Pan left",
    "Pan right",
    "Pan up",
    "Pan down"
];

var movementIndex = 0;

var clip = trackOne.clips[0];

// var clipItem = clip.projectItem;

// videoTracks[1].insertClip(clipItem, clip.start.ticks, 1);

//if tracktwo has a line asset at a certain time, do split screen is my goal
//create a new function split and include it here whenever the two is true USE CLIP INPOINT CHECK BELOW

for(var i = 0; i < trackOne.clips.length; i++) {
  // Get the clip
  var clip = trackOne.clips[i];
  var components = clip.components;
  var scaleComponent = components[1].properties[1];
  var positionComponent = components[1].properties[0];

  // Get the project metadata
  var projectData = clip.projectItem.getProjectMetadata();

  // Extract the dimensions from the project metadata
  var dimensionsMatch = projectData.match(/<premierePrivateProjectMetaData:Column\.Intrinsic\.VideoInfo>(.*?)<\/premierePrivateProjectMetaData:Column\.Intrinsic\.VideoInfo>/);
  
  var dimensionsString = dimensionsMatch[1].match(/\d+ x \d+/);

    if (dimensionsString) {
        // Extract the part that contains the dimensions
        var dimensions = dimensionsString[0].split(' x ');
        var originalWidth = parseInt(dimensions[0]);
        var originalHeight = parseInt(dimensions[1]);

        // Set the target dimensions
        var targetWidth = 1920;
        var targetHeight = 1080;

        // Calculate the scale factors
        var scaleFactorWidth = targetWidth / originalWidth;
        var scaleFactorHeight = targetHeight / originalHeight;

        // Use the larger scale factor to ensure that at least one dimension is not larger than the target size
        var scaleFactor = Math.max(scaleFactorWidth, scaleFactorHeight);

        // Set the scale at the start and end of the clip
        scaleComponent.setTimeVarying(true);
        positionComponent.setTimeVarying(true);

        // Set the scale at the start of the clip
        var setScale = scaleFactor * 100; 
        scaleComponent.setValue(setScale);

        //Center the position of the clip
        var centerPosition = [originalWidth / 2 / originalWidth, originalHeight / 2 / originalHeight]; 
        positionComponent.setValue(centerPosition);

        // Set the movement type
        var currentMovementType = movementTypes[movementIndex % movementTypes.length];

        switch (currentMovementType) {
            case "Zoom in":
                scaleComponent.addKey(clip.inPoint.seconds);
                scaleComponent.addKey(clip.inPoint.seconds + clip.end.seconds);
                scaleComponent.setValueAtKey(clip.inPoint.seconds, setScale);
                scaleComponent.setValueAtKey(clip.inPoint.seconds + clip.end.seconds, setScale + 5);
                break;
            case "Zoom out":
                scaleComponent.addKey(clip.inPoint.seconds);
                scaleComponent.addKey(clip.inPoint.seconds + clip.end.seconds);
                scaleComponent.setValueAtKey(clip.inPoint.seconds, setScale + 5);
                scaleComponent.setValueAtKey(clip.inPoint.seconds + clip.end.seconds, setScale);
                break;
            case "Pan left":
                scaleComponent.addKey(clip.inPoint.seconds);
                scaleComponent.setValueAtKey(clip.inPoint.seconds, setScale + 3);
                positionComponent.addKey(clip.inPoint.seconds);
                positionComponent.addKey(clip.inPoint.seconds + clip.end.seconds);
                positionComponent.setValueAtKey(clip.inPoint.seconds, centerPosition);
                positionComponent.setValueAtKey(clip.inPoint.seconds + clip.end.seconds, [centerPosition[0] - 0.1, centerPosition[1]]);
                break;
            case "Pan right":
                scaleComponent.addKey(clip.inPoint.seconds);
                scaleComponent.setValueAtKey(clip.inPoint.seconds, setScale + 3);
                positionComponent.addKey(clip.inPoint.seconds);
                positionComponent.addKey(clip.inPoint.seconds + clip.end.seconds);
                positionComponent.setValueAtKey(clip.inPoint.seconds, centerPosition);
                positionComponent.setValueAtKey(clip.inPoint.seconds + clip.end.seconds, [centerPosition[0] + 0.1, centerPosition[1]]);
                break;
            case "Pan up":
                scaleComponent.addKey(clip.inPoint.seconds);
                scaleComponent.setValueAtKey(clip.inPoint.seconds, setScale + 3);
                positionComponent.addKey(clip.inPoint.seconds);
                positionComponent.addKey(clip.inPoint.seconds + clip.end.seconds);
                positionComponent.setValueAtKey(clip.inPoint.seconds, centerPosition);
                positionComponent.setValueAtKey(clip.inPoint.seconds + clip.end.seconds, [centerPosition[0], centerPosition[1] - 0.1]);
                break;
            case "Pan down":
                scaleComponent.addKey(clip.inPoint.seconds);
                scaleComponent.setValueAtKey(clip.inPoint.seconds, setScale + 3);
                positionComponent.addKey(clip.inPoint.seconds);
                positionComponent.addKey(clip.inPoint.seconds + clip.end.seconds);
                positionComponent.setValueAtKey(clip.inPoint.seconds, centerPosition);
                positionComponent.setValueAtKey(clip.inPoint.seconds + clip.end.seconds, [centerPosition[0], centerPosition[1] + 0.1]);
                break;
        }
            movementIndex++;
    } else {
        alert("Error: Could not extract dimensions from the project metadata.");
    }
}
