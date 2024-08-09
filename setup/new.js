document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('newProjectForm');
    const createProjectButton = document.getElementById('createProjectButton');

    createProjectButton.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the default form submission

        const formData = new FormData(form);
        const projectName = document.getElementById('projectName').value.trim();

        if (projectName === '') {
            alert('Please enter a project name.');
            return;
        }

        // Add project name to the form data
        formData.append('projectName', projectName);

        fetch('save.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const url = `setup.php?project_name=${encodeURIComponent(projectName)}`;
                window.location.href = url;
            } else {
                alert(data.message || 'An error occurred while creating the project.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while creating the project.');
        });
    });
});
