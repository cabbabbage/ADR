<?php
// Fetch the GOTO from the query parameters
$gotoFile = isset($_GET['project_name']) ? htmlspecialchars($_GET['project_name']) : '';

?>

<!DOCTYPE html>
<html>
<head>
    <title>Setup Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: row;
            margin: 0;
            padding: 0;
            height: 100vh;
            box-sizing: border-box;
        }
        #player {
            width: 50%;
            padding: 10px;
            box-sizing: border-box;
        }
        #player video {
            width: 100%;
        }
        #controls {
            width: 33.6%;
            padding: 10px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
        }
        #speakers {
            width: 20.3%;
            padding: 10px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
        }
        .control-button {
            margin: 5px 0;
        }
        .error {
            color: red;
            margin-top: 10px;
        }
        #modal {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
            z-index: 1000;
        }
        #modalBackdrop {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 999;
        }
        #modal button {
            margin: 5px 0;
        }
        #backForwardControls {
            display: flex;
            padding: 2%;
            align-items: center;
            margin-top: 10px;
        }
        #backForwardControls button {
            height: 50px;
            padding: 10px;
            width: 100%;
        }
    </style>
</head>
<body>
    <div id="project-data" data-project-name="<?php echo htmlspecialchars($_GET['projectName'] ?? ''); ?>"></div>
    <div id="player">
        <video id="videoPlayer" width="640" height="360" controls>
            <source src="../movie.mov" type="video/mp4">
            Your browser does not support the video tag.
        </video>
        <div id="backForwardControls">
            <button class="control-button" id="backButton">← Back 5s</button>
            <button class="control-button" id="forwardButton">Forward 5s →</button>
        </div>
    </div>
    <div id="controls">
        <h2>Controls</h2>
        <button class="control-button" id="setStartButton">Set Start</button>
        <label id="startTimeLabel">Start Time: --:--</label>
        <button class="control-button" id="setEndButton">Set End</button>
        <label id="endTimeLabel">End Time: --:--</label>
        <select id="multipleSelect" multiple>
            <!-- Options will be added dynamically -->
        </select>
        <button class="control-button" id="addClipButton">Add Clip</button>
        <div id="errorMessage" class="error"></div>
    </div>
    <div id="speakers">
        <h2>Speakers</h2>
        <input type="text" id="speakerName" placeholder="Enter speaker name">
        <button id="addSpeakerButton">Submit</button>
        <ul id="speakerList"></ul>
    </div>

    <div id="modalBackdrop"></div>
    <div id="modal">
        <div id="audioPlayer">
            <button id="playAudioButton">Play Audio</button>
        </div>
        <div id="speakersDialogues"></div>
        <button id="submitModalButton">Submit</button>
    </div>
    <div id="projectContainer" 
         data-goto-file="<?php echo htmlspecialchars($gotoFile); ?>" >
    </div>
    <button id="save_btn">Save</button> <!-- Added text to the button -->
    <script src="setup.js"></script>
</body>
</html>
