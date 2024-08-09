<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Project</title>
    <script defer src="new.js"></script> <!-- Add your external JS file here -->
</head>
<body>
    <h1>Create a New Project</h1>
    <form id="newProjectForm" enctype="multipart/form-data">
        <label for="projectName">Project Name:</label>
        <input type="text" id="projectName" name="projectName" required>
        <br><br>
        <label for="videoFile">Select Video:</label>
        <input type="file" id="videoFile" name="videoFile" accept="video/*" required>
        <br><br>
        <button type="button" id="createProjectButton">Create New Project</button>
    </form>
</body>
</html>
