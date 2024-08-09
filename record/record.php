<?php
$gotoFile = isset($_GET['project_name']) ? htmlspecialchars($_GET['project_name']) : '';

function getUniqueNamesFromCsv($filePath) {
    $names = [];
    if (($handle = fopen($filePath, "r")) !== FALSE) {
        // Skip header row if present
        fgetcsv($handle);

        // Read each row
        while (($data = fgetcsv($handle)) !== FALSE) {
            if (isset($data[0])) {
                $name = trim($data[0]); // Assuming the first element is the name and trim to remove extra spaces
                if (!empty($name) && $name !== 'all' && !in_array($name, $names)) {
                    $names[] = $name;
                }
            }
        }
        fclose($handle);
    } else {
        throw new Exception("Unable to open file: $filePath");
    }
    return $names;
}

// Path to the CSV file
$csvFilePath = "../projects/$gotoFile/clips.csv";
$names = [];

try {
    $names = getUniqueNamesFromCsv($csvFilePath);
    // Print names for debugging or further processing
    echo "<pre>";
    print_r($names);
    echo "</pre>";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>



<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Record Page</title>
    <link rel="stylesheet" type="text/css" href="style.css">
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            height: 100vh;
        }
        .button-list {
            margin: 20px;
        }
        .button-list button {
            display: block;
            margin: 10px 0;
            padding: 10px;
            font-size: 16px;
            cursor: pointer;
        }
        #videoContainer {
            display: none; /* Hidden by default */
        }
        #videoPlayer {
            width: 100%;
            height: 100%;
        }
        #dynamicContent {
            display: none; /* Hidden by default */
        }
        #control {
            display: none; /* Hidden by default */
        }
        #control button {

        }
    </style>
</head>
<body>
    <h1>SELECT YOUR PART</h1>
    <div class="button-list">
        <?php foreach ($names as $name): ?>
            <button data-name="<?php echo htmlspecialchars($name); ?>">
                <?php echo htmlspecialchars($name); ?>
            </button>
        <?php endforeach; ?>
    </div>

    <!-- Video Container -->
    <div id="videoContainer">
        <video id="videoPlayer" muted></video>
    </div>


    <!-- Dynamic Content -->


    <!-- Control Buttons -->
    <div id="control">
        <button id="playButton">Play</button>
        <button id="recordButton" style="background-color: red; color: white;">Record</button>
        <div>
        <button id="prevButton">←</button>
        <button id="nextButton">→</button>
     </div>
    </div>
    <div id="dynamicContent">
        <h1 id = "top">Your Line: </h1>
    </div>
    <div id="review"></div>
    <div id="projectContainer" 
         data-goto-file="<?php echo htmlspecialchars($gotoFile); ?>" >
    </div>

    <script src="record.js"></script>
</body>
</html>
