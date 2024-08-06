<?php
header('Content-Type: application/json');

// Ensure all required GET parameters are present
if (!isset($_GET['project']) || !isset($_GET['name']) || !isset($_GET['start']) || !isset($_GET['end'])) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required parameters.']);
    exit;
}

$project = $_GET['project'];
$name = $_GET['name'];
$start = $_GET['start'];
$end = $_GET['end'];

// Construct the directory path
$directoryPath = __DIR__ . "/../projects/{$project}/{$name}/{$start}-{$end}";

// Check if the directory exists
if (!is_dir($directoryPath)) {
    echo json_encode(['status' => 'error', 'message' => 'Directory does not exist.']);
    exit;
}

// Get a list of .wav files in the directory
$files = glob("{$directoryPath}/*.wav");

if ($files === false) {
    echo json_encode(['status' => 'error', 'message' => 'Failed to read directory.']);
    exit;
}

// Extract just the filenames
$fileNames = array_map('basename', $files);

// Return the list of files as a JSON response
echo json_encode(['status' => 'success', 'files' => $fileNames]);
?>
