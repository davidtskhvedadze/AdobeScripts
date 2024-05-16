var movementTypes = [
    "Zoom in",
    "Zoom out",
    "Pan left",
    "Pan right",
    "Pan up",
    "Pan down"
];

function getTrack(index) {
    var project = app.project;
    var projectItem = project.rootItem;
    var activeSequence = project.activeSequence;
    var videoTracks = activeSequence.videoTracks;
    return videoTracks[index];
}

function getComponents(clip) {
    var components = clip.components;
    if (components.length === 3) {
        return {
            positionComponentSplit: components[1].properties[0],
            scaleComponentSplit: components[1].properties[1],
            leftCropComponent: components[2].properties[0],
            rightCropComponent: components[2].properties[2],
        };
    }
    return {
        positionComponent: components[1].properties[0],
        scaleComponent: components[1].properties[1]
    };
}

function setComponentsTimeVarying(components) {
    if(!components.positionComponentSplit) {
    var positionComponent = components.positionComponent;
    var scaleComponent = components.scaleComponent;
    positionComponent.setTimeVarying(true);
    scaleComponent.setTimeVarying(true);
    }
    var positionComponentSplit = components.positionComponentSplit;
    var scaleComponentSplit = components.scaleComponentSplit;
    positionComponentSplit.setTimeVarying(true);
    scaleComponentSplit.setTimeVarying(true);

    if(components.leftCropComponent && components.rightCropComponent) {
        components.leftCropComponent.setTimeVarying(true);
        components.rightCropComponent.setTimeVarying(true);
    }
}

function getScaleFactor(clip) {
    var projectData = clip.projectItem.getProjectMetadata();
    var dimensionsMatch = projectData.match(/<premierePrivateProjectMetaData:Column\.Intrinsic\.VideoInfo>(.*?)<\/premierePrivateProjectMetaData:Column\.Intrinsic\.VideoInfo>/);
    if (dimensionsMatch) {
        var dimensionsString = dimensionsMatch[1].match(/\d+ x \d+/);
        if (dimensionsString) {
            var dimensions = dimensionsString[0].split(' x ');
            var originalWidth = parseInt(dimensions[0]);
            var originalHeight = parseInt(dimensions[1]);
            var targetWidth = 1920;
            var targetHeight = 1080;
            var scaleFactorWidth = targetWidth / originalWidth;
            var scaleFactorHeight = targetHeight / originalHeight;
            return Math.max(scaleFactorWidth, scaleFactorHeight);
        }
    }
    return 1;
}

var splitRunCount = 0;

function splitScreen(clip1, clip2) {
    var components1 = getComponents(clip1);
    var components2 = getComponents(clip2);
    
    setComponentsTimeVarying(components1);
    setComponentsTimeVarying(components2);

    var scaleFactor1 = getScaleFactor(clip1);
    var scaleFactor2 = getScaleFactor(clip2);
    var setScale1 = scaleFactor1 * 100;
    var setScale2 = scaleFactor2 * 100;
    components1.scaleComponentSplit.setValue(setScale1);
    components1.rightCropComponent.setValue(25);
    components2.scaleComponentSplit.setValue(setScale2);
    components2.leftCropComponent.setValue(25);

    var leftPosition = [0.25, 0.5];
    var rightPosition = [0.75, 0.5];

    var positionComponent1 = components1.positionComponentSplit;
    var positionComponent2 = components2.positionComponentSplit;

    positionComponent1.addKey(clip1.inPoint.seconds);
    positionComponent1.setValueAtKey(clip1.inPoint.seconds, leftPosition);

    positionComponent1.addKey(clip1.outPoint.seconds);


    positionComponent2.addKey(clip2.inPoint.seconds);
    positionComponent2.setValueAtKey(clip2.inPoint.seconds, rightPosition);

    positionComponent2.addKey(clip2.outPoint.seconds);

    if(splitRunCount % 2 === 0) {

        positionComponent1.setValueAtKey(clip1.outPoint.seconds, [leftPosition[0], leftPosition[1] - 0.06]);

        positionComponent2.setValueAtKey(clip2.outPoint.seconds, [rightPosition[0], rightPosition[1] + 0.06]);

    } else {

        positionComponent1.setValueAtKey(clip1.outPoint.seconds, [leftPosition[0], leftPosition[1] + 0.06]);

        positionComponent2.setValueAtKey(clip2.outPoint.seconds, [rightPosition[0], rightPosition[1] - 0.06]);
    }
    splitRunCount++;
}
var movementIndex = 0;
var trackOne = getTrack(0);
var trackTwo = getTrack(1);
var trackThree = getTrack(2);

for(var i = 0; i < trackOne.clips.length; i++) {
    var clipTrackOne = trackOne.clips[i];
    var currentTime = clipTrackOne.start.seconds;
    var found = false;

    for(var j = 0; j < trackThree.clips.length; j++) {
        var foundLine = trackThree.clips[j];
        var clip1 = trackOne.clips[i];
        if(currentTime === foundLine.start.seconds && foundLine.name === "LINE.mov") {
            var clip2 = trackTwo.clips[j];
            splitScreen(clip1, clip2);
            found = true;
            break;
        }
    }
    if (found) {
        continue;
    }

    var components = getComponents(clipTrackOne);
    var positionComponent = components.positionComponent;
    var scaleComponent = components.scaleComponent;
    var scaleFactor = getScaleFactor(clipTrackOne);
    scaleComponent.setTimeVarying(true);
    positionComponent.setTimeVarying(true);
    var setScale = scaleFactor * 100; 
    scaleComponent.setValue(setScale);
    var centerPosition = [0.5, 0.5]; 
    positionComponent.setValue(centerPosition);

    var currentMovementType = movementTypes[movementIndex % movementTypes.length];
    var movementFunctions = {
        "Zoom in": function() {
            scaleComponent.addKey(clipTrackOne.inPoint.seconds);
            scaleComponent.addKey(clipTrackOne.outPoint.seconds );
            scaleComponent.setValueAtKey(clipTrackOne.inPoint.seconds, setScale);
            scaleComponent.setValueAtKey(clipTrackOne.outPoint.seconds, setScale + 5);
        },
        "Zoom out": function() {
            scaleComponent.addKey(clipTrackOne.inPoint.seconds);
            scaleComponent.addKey(clipTrackOne.outPoint.seconds);
            scaleComponent.setValueAtKey(clipTrackOne.inPoint.seconds, setScale + 5);
            scaleComponent.setValueAtKey(clipTrackOne.outPoint.seconds , setScale);
        },
        "Pan left": function() {
            scaleComponent.addKey(clipTrackOne.inPoint.seconds);
            scaleComponent.setValueAtKey(clipTrackOne.inPoint.seconds, setScale + 3);
            positionComponent.addKey(clipTrackOne.inPoint.seconds);
            positionComponent.addKey(clipTrackOne.outPoint.seconds );
            positionComponent.setValueAtKey(clipTrackOne.inPoint.seconds, centerPosition);
            positionComponent.setValueAtKey(clipTrackOne.outPoint.seconds , [centerPosition[0] - 0.04, centerPosition[1]]);
        },
        "Pan right": function() {
            scaleComponent.addKey(clipTrackOne.inPoint.seconds);
            scaleComponent.setValueAtKey(clipTrackOne.inPoint.seconds, setScale + 3);
            positionComponent.addKey(clipTrackOne.inPoint.seconds);
            positionComponent.addKey(clipTrackOne.outPoint.seconds );
            positionComponent.setValueAtKey(clipTrackOne.inPoint.seconds, centerPosition);
            positionComponent.setValueAtKey(clipTrackOne.outPoint.seconds , [centerPosition[0] + 0.04, centerPosition[1]]);
        },
        "Pan up": function() {
            scaleComponent.addKey(clipTrackOne.inPoint.seconds);
            scaleComponent.setValueAtKey(clipTrackOne.inPoint.seconds, setScale + 3);
            positionComponent.addKey(clipTrackOne.inPoint.seconds);
            positionComponent.addKey(clipTrackOne.outPoint.seconds);
            positionComponent.setValueAtKey(clipTrackOne.inPoint.seconds, centerPosition);
            positionComponent.setValueAtKey(clipTrackOne.outPoint.seconds, [centerPosition[0], centerPosition[1] - 0.04]);
        },
        "Pan down": function() {
            scaleComponent.addKey(clipTrackOne.inPoint.seconds);
            scaleComponent.setValueAtKey(clipTrackOne.inPoint.seconds, setScale + 3);
            positionComponent.addKey(clipTrackOne.inPoint.seconds);
            positionComponent.addKey(clipTrackOne.outPoint.seconds);
            positionComponent.setValueAtKey(clipTrackOne.inPoint.seconds, centerPosition);
            positionComponent.setValueAtKey(clipTrackOne.outPoint.seconds, [centerPosition[0], centerPosition[1] + 0.02]);
        },
    };

    movementFunctions[currentMovementType]();
    movementIndex++;
}