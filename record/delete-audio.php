<?php
header('Content-Type: application/json');
header("Cache-Control: no-cache, must-revalidate");
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Past date

// Check request method
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
    exit;
}

// Read the input JSON
$input = json_decode(file_get_contents('php://input'), true);

// Check if required parameters are set
if (!isset($input['project']) || !isset($input['name']) || !isset($input['start']) || !isset($input['end']) || !isset($input['file'])) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required parameters.']);
    exit;
}

$project = $input['project'];
$name = $input['name'];
$start = $input['start'];
$end = $input['end'];
$filename = $input['file'];

// Construct the file path
$filePath = __DIR__ . "/../projects/{$project}/{$name}/{$start}-{$end}/{$filename}";

// Log the file path and existence check
error_log("Attempting to delete file: {$filePath}");

if (!file_exists($filePath)) {
    error_log("File does not exist: {$filePath}");
    echo json_encode(['status' => 'error', 'message' => 'File does not exist.']);
    exit;
}

// Attempt to delete the file
if (unlink($filePath)) {
    error_log("File deleted successfully: {$filePath}");
    echo json_encode(['status' => 'success', 'message' => 'File deleted successfully.']);
} else {
    error_log("Failed to delete file: {$filePath}");
    echo json_encode(['status' => 'error', 'message' => 'Failed to delete file.']);
}
?>
