<?php
header('Content-Type: application/json');

$response = ['success' => false, 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $projectName = htmlspecialchars($_POST['projectName'] ?? '');
    $projectsDir = '../projects';

    // Sanitize project name
    $projectName = preg_replace('/[^a-zA-Z0-9_-]/', '', $projectName);

    if (!empty($projectName)) {
        $newProjectDir = $projectsDir . '/' . $projectName;

        if (!file_exists($newProjectDir)) {
            mkdir($newProjectDir, 0777, true);

            // Comment: You need to update your server configuration to handle video file uploads.
            $response['success'] = true;
            $response['message'] = 'Directory created successfully. Update your server configuration to handle video file uploads.';
        } else {
            $response['message'] = 'Project already exists.';
        }
    } else {
        $response['message'] = 'Invalid project name.';
    }
} else {
    $response['message'] = 'Invalid request method.';
}

echo json_encode($response);
?>
