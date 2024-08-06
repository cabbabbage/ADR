<?php
header('Content-Type: application/json'); // Set the response header to JSON

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $project = $_GET['project'];
    $name = $_GET['name'];
    $start = $_GET['start'];
    $end = $_GET['end'];
    
    // Define upload directory
    $uploadDir = "../projects/$project/$name/$start-$end/";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true); // Set directory permissions to 755
    }

    // Generate filename based on current date and time
    $timestamp = date('YmdHis'); // Format: YYYYMMDDHHMMSS
    $newFileName = $timestamp . '.wav';
    
    // Handle file upload
    if (isset($_FILES['audio']) && $_FILES['audio']['error'] === UPLOAD_ERR_OK) {
        $tmpName = $_FILES['audio']['tmp_name'];
        $uploadFile = $uploadDir . $newFileName;

        if (move_uploaded_file($tmpName, $uploadFile)) {
            chmod($uploadFile, 0644); // Set file permissions to 644
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to move uploaded file.']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No file uploaded or upload error.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}
?>
