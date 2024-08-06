document.addEventListener('DOMContentLoaded', function() {
    const projectContainer = document.getElementById('projectContainer');

    // Retrieve data attributes
    const gotoFile = projectContainer.getAttribute('data-goto-file');
    const projects = JSON.parse(projectContainer.getAttribute('data-projects'));

    function renderProjectButtons(projects) {
        // Clear existing content
        projectContainer.innerHTML = '';

        // Create a button for each project directory
        projects.forEach(project => {
            const button = document.createElement('button');
            button.innerText = project;
            button.addEventListener('click', () => {
                loadProject(project); // Redirect to the GOTO page with project name
            });
            projectContainer.appendChild(button);
        });
    }

    function loadProject(projectName) {
        // Redirect to the GOTO page with project name as a query parameter
        if (gotoFile) {
            const url = `${gotoFile}?project_name=${encodeURIComponent(projectName)}`;
            window.location.href = url;
        } else {
            console.error('GOTO file is not specified.');
        }
    }

    // Render the project buttons
    renderProjectButtons(projects);
});
