document.addEventListener('DOMContentLoaded', function() {
    // Get the project-data element
    const projectContainer = document.getElementById('projectContainer');
    // Extract the projectName from the data attribute
    const projectName = projectContainer.getAttribute('data-goto-file');
    
    if (projectName) {
        console.log('Project Name:', projectName);

        // Set video source
        const videoPlayer = document.getElementById('videoPlayer');
        videoPlayer.src = `../projects/${projectName}/movie.mov`;

        // Add event listeners for buttons
        document.getElementById('save_btn').addEventListener('click', function() {
            saveProject();
            this.blur(); // Unfocus the button after clicking
        });
        document.getElementById('addSpeakerButton').addEventListener('click', function() {
            addSpeaker();
            this.blur(); // Unfocus the button after clicking
        });
        document.getElementById('setStartButton').addEventListener('click', function() {
            setStartTime();
            this.blur(); // Unfocus the button after clicking
        });
        document.getElementById('setEndButton').addEventListener('click', function() {
            setEndTime();
            this.blur(); // Unfocus the button after clicking
        });
        document.getElementById('addClipButton').addEventListener('click', function() {
            addClip();
            this.blur(); // Unfocus the button after clicking
        });
        document.getElementById('playAudioButton').addEventListener('click', function() {
            playAudio();
            this.blur(); // Unfocus the button after clicking
        });
        document.getElementById('submitModalButton').addEventListener('click', function() {
            writeToCsv();
            this.blur(); // Unfocus the button after clicking
        });
        document.getElementById('backButton').addEventListener('click', function() {
            adjustVideoTime(-5);
            this.blur(); // Unfocus the button after clicking
        });
        document.getElementById('forwardButton').addEventListener('click', function() {
            adjustVideoTime(5);
            this.blur(); // Unfocus the button after clicking
        });
    } else {
        console.log('Project Name not found.');
    }

    let isButtonFocused = false;

    // Event listeners for key presses
    document.addEventListener('keydown', function(event) {
        const focusedElement = document.activeElement;
        const isModalOpen = document.getElementById('modal').style.display === 'block';

        // Ignore key events if focused element is an input, textarea, or if modal is open
        if (focusedElement.tagName === 'TEXTAREA' || focusedElement.tagName === 'INPUT' || isModalOpen) {
            return;
        }

        if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
            isButtonFocused = true;
        } else if (event.code === 'Space') {
            if (isButtonFocused) {
                isButtonFocused = false;
                event.preventDefault(); // Prevent default space action
                return; // Skip the space bar action
            }
            if (event.ctrlKey) {
                playVideoSegment();
            } else {
                togglePlayPause();
            }
        }

        if (event.key === 'i') {
            setStartTime();
        } else if (event.key === 'o') {
            setEndTime();
        } else if (event.code === 'ArrowLeft') {
            adjustVideoTime(-1);
        } else if (event.code === 'ArrowRight') {
            adjustVideoTime(1);
        } else if (event.key === 'ArrowUp') {
            if (endTime !== null) {
                videoPlayer.currentTime = endTime;
            }
        } else if (event.key === 'ArrowDown') {
            if (startTime !== null) {
                videoPlayer.currentTime = startTime;
            }
        }
    });
});



function togglePlayPause() {
    const videoPlayer = document.getElementById('videoPlayer');
    if (videoPlayer.paused) {
        videoPlayer.play();
    } else {
        videoPlayer.pause();
    }
}

let startTime = null;
let endTime = null;
let selectedSpeakers = [];
let audioSegmentUrl = 'clip.wav';  // URL served by Flask
let guess = '';

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

function addSpeaker() {
    const speakerName = document.getElementById('speakerName').value;
    if (speakerName) {
        const multipleSelect = document.getElementById('multipleSelect');
        
        // Check if option already exists to avoid duplicates
        let optionExists = false;
        for (let i = 0; i < multipleSelect.options.length; i++) {
            if (multipleSelect.options[i].value === speakerName) {
                optionExists = true;
                break;
            }
        }

        if (!optionExists) {
            // Create and add the new option
            const option = document.createElement('option');
            option.value = speakerName;
            option.text = speakerName;
            multipleSelect.add(option);
        }

        // Clear the input field
        document.getElementById('speakerName').value = '';
    }
}

function removeSpeaker(li, speakerName) {
    li.remove();

    // Remove speaker from multiple select dropdown
    const multipleSelect = document.getElementById('multipleSelect');
    for (let i = 0; i < multipleSelect.options.length; i++) {
        if (multipleSelect.options[i].value === speakerName) {
            multipleSelect.remove(i);
            break;
        }
    }
}

function setStartTime() {
    const video = document.getElementById('videoPlayer');
    startTime = video.currentTime;
    document.getElementById('startTimeLabel').innerText = `Start Time: ${formatTime(startTime)}`;
}

function setEndTime() {
    const video = document.getElementById('videoPlayer');
    endTime = video.currentTime;
    document.getElementById('endTimeLabel').innerText = `End Time: ${formatTime(endTime)}`;
}

function adjustVideoTime(seconds) {
    const video = document.getElementById('videoPlayer');
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
}

function playVideoSegment() {
    const video = document.getElementById('videoPlayer');
    
    if (startTime !== null && endTime !== null) {
        video.currentTime = startTime;
        video.play();

        video.addEventListener('timeupdate', function() {
            if (video.currentTime >= endTime) {
                video.pause();
            }
        });
    } else {
        console.error('Start time or end time not set.');
    }
}

async function extractAudioSegment(start, end) {
    const projectContainer = document.getElementById('projectContainer');
    // Extract the projectName from the data attribute
    const projectName =   projectContainer.getAttribute('data-goto-file');
    try {
        const response = await fetch(`http://127.0.0.1:5000/extract-audio/${projectName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ start: start, end: end }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Extracted text:', data.text);
        return data.text;
    } catch (error) {
        console.error('Error:', error);
        // Handle the case where audio extraction fails
        return '';  // Return empty guess if extraction fails
    }
}

function addClip() {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.innerText = '';
    selectedSpeakers = Array.from(document.getElementById('multipleSelect').selectedOptions).map(option => option.value);

    if (startTime === null) {
        errorMessage.innerText = 'Error: Start time not set.';
        return;
    }

    if (endTime === null) {
        errorMessage.innerText = 'Error: End time not set.';
        return;
    }

    if (endTime <= startTime) {
        errorMessage.innerText = 'Error: End time must be greater than start time.';
        return;
    }

    if (selectedSpeakers.length === 0) {
        errorMessage.innerText = 'Error: No speakers selected.';
        return;
    }

    // Extract audio and do voice to text
    extractAudioSegment(startTime, endTime).then(transcription => {
        guess = transcription;
        showModal();
    });
}

function showModal() {
    const modal = document.getElementById('modal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    const speakersDialogues = document.getElementById('speakersDialogues');
    
    speakersDialogues.innerHTML = '';
    
    selectedSpeakers.forEach(speaker => {
        const div = document.createElement('div');
        div.innerHTML = `<label>${speaker}</label><textarea>${guess}</textarea>`;
        speakersDialogues.appendChild(div);
    });

    modal.style.display = 'block';
    modalBackdrop.style.display = 'block';
}

function hideModal() {
    const modal = document.getElementById('modal');
    const modalBackdrop = document.getElementById('modalBackdrop');
    
    modal.style.display = 'none';
    modalBackdrop.style.display = 'none';
}

function playAudio() {
    if (audioSegmentUrl) {
        // Play the extracted audio segment
        const audio = new Audio(audioSegmentUrl);
        audio.play().catch(error => {
            console.error('Error playing audio:', error);
        });
    } else {
        console.error('No audio segment URL available.');
    }
}

function writeToCsv() {
    const projectContainer = document.getElementById('projectContainer');
    // Extract the projectName from the data attribute
    const projectName =   projectContainer.getAttribute('data-goto-file');
    const speakersDialogues = document.getElementById('speakersDialogues').children;
    const dialogueData = [];

    for (let i = 0; i < speakersDialogues.length; i++) {
        const speakerLabel = speakersDialogues[i].querySelector('label').innerText;
        const dialogueText = speakersDialogues[i].querySelector('textarea').value;
        dialogueData.push({ speaker: speakerLabel, dialogue: dialogueText });
    }

    // Send data to the Flask endpoint
    fetch(`http://127.0.0.1:5000/write-to-csv/${projectName}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            start: startTime,
            end: endTime,
            dialogues: dialogueData
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('CSV update response:', data);
        hideModal();
        resetControls();
    })
    .catch(error => {
        console.error('Error writing to CSV:', error);
    });
}

function resetControls() {
    startTime = null;
    endTime = null;
    selectedSpeakers = [];
    document.getElementById('startTimeLabel').innerText = 'Start Time: --:--';
    document.getElementById('endTimeLabel').innerText = 'End Time: --:--';
    document.getElementById('multipleSelect').selectedIndex = -1;
    document.getElementById('errorMessage').innerText = '';
}

function saveProject() {
    const projectContainer = document.getElementById('projectContainer');
    // Extract the projectName from the data attribute
    const projectName =   projectContainer.getAttribute('data-goto-file');
    fetch('http://127.0.0.1:5000/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            project_name: projectName
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Save response:', data);
        alert('Project saved successfully!');
    })
    .catch(error => {
        console.error('Error saving project:', error);
        alert('Error saving project. Check console for details.');
    });
}
