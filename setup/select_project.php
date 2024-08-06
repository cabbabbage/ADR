<?php
// Fetch the GOTO from the query parameters
$gotoFile = isset($_GET['GOTO']) ? htmlspecialchars($_GET['GOTO']) : '';

// Directory containing projects
$projectsDir = '../projects';
$projectDirs = array_filter(glob($projectsDir . '/*'), 'is_dir');
$projects = array_map('basename', $projectDirs);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Select Project</title>
<!-- Add your CSS file here -->
    <script defer src="select_project.js"></script> <!-- Add your external JS file here -->
</head>
<body>
    <div id="projectContainer" 
         data-goto-file="<?php echo htmlspecialchars($gotoFile); ?>" 
         data-projects='<?php echo json_encode($projects); ?>'>
    </div>
</body>
</html>

