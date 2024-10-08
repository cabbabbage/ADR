let mediaRecorder;
let audioChunks = [];
let recording = false;
let microphoneStream;
let projectName;

document.addEventListener('DOMContentLoaded', () => {
    const projectContainer = document.getElementById('projectContainer');
    projectName = projectContainer.getAttribute('data-goto-file');
    console.log(projectName);

    document.querySelector('.button-list').addEventListener('click', async (event) => {
        if (event.target.tagName === 'BUTTON') {
            const name = event.target.getAttribute('data-name');
            console.log(name);
            await load(name);
        }
    });
});

async function load(name) {
    const csvUrl = `../projects/${projectName}/clips.csv`;
    console.log(csvUrl);
    let forward = true;
    try {
        // Fetch the CSV data
        const response = await fetch(csvUrl);
        const text = await response.text();

        // Parse the CSV data
        const lines = text.trim().split('\n');
        
        if (lines.length === 0) {
            console.error('CSV file is empty or could not be read.');
            return;
        }

        // Remove buttons and display content
        document.querySelector('.button-list').style.display = 'none';

        // Set up the video player to disable fullscreen
        const videoPlayer = document.getElementById('videoPlayer');

        // Process each line
        let lineIndex = 0; // Start after the header

        const processNextLine = () => {
            if(forward){
                lineIndex++;
            }
            else{
                lineIndex--;
            };

            if (lineIndex >= lines.length) {
                lineIndex = 0;
            } else if (lineIndex < 0) {
                lineIndex = lines.length - 1;
            }

            // Ensure we have a valid line to process
            if (lines[lineIndex] && lines[lineIndex].length > 0) {
                const [speaker, startTime, endTime, textLabel, vidUrl, complete] = lines[lineIndex].split(',');

                if (speaker !== name && speaker !== 'all') {
                    processNextLine();
                    return;
                }
                if (parseInt(complete) === 0) {
                    processNextLine();
                    return;
                }

                // Update the UI with the current line's details
                document.getElementById('videoContainer').style.display = 'block';
                document.getElementById('dynamicContent').style.display = 'block';
                document.getElementById('control').style.display = 'block';

                // Set up the video player
                videoPlayer.src = vidUrl;

                // Display the label in the middle third of the screen
                const middleDiv = document.getElementById('dynamicContent');


                // Add a control div in the bottom third of the screen
                const controlDiv = document.getElementById('control');
                controlDiv.innerHTML = `
                    <button id="playButton"></button>
                    <button id="recordButton"></button>
                    <button id="prevButton"></button>
                    <button id="nextButton"></button>
                `;
                


                if (speaker === 'all') {
                    middleDiv.innerHTML = `
                        <h2 id="top">INSTRUCTIONS</h2>
                        <p id="oh">Please record the ambient noise of your environment. Press "Record," remain silent, and hold your phone steady for ten seconds to capture the background sound accurately.</p>
                    `;
                    document.getElementById('playButton').style.display = 'none';
                } else {
                    middleDiv.innerHTML = `
                        <h2 id="top">Your Line:</h2>
                        <p id="oh">"${textLabel}"</p>
                    `;
                }
                
                // Add event listeners for buttons
                document.getElementById('playButton').addEventListener('click', () => {
                    recording = false;
                    console.log(recording);
                    videoPlayer.play();
                    playSolo(projectName, name, startTime, endTime, "og/og.wav");
                });

                document.getElementById('recordButton').addEventListener('click', async () => {
                    if (recording) {
                        alert('Recording is already in progress.');
                        return;
                    }

                    // Start the countdown
                    await startCountdown();

                    // Start recording and video playback
                    await startRecording(videoPlayer);

                    videoPlayer.onended = async () => {
                        if (recording) {
                            await stopRecording();
                            saveRecording(name, startTime, endTime);                        
                        }
                    };
                });

                document.getElementById('prevButton').addEventListener('click', () => {
                    forward = false;
                    processNextLine();
                });

                document.getElementById('nextButton').addEventListener('click', () => {
                    forward = true;
                    processNextLine();
                });

                // Display recorded clips for this line
                displayRecordedClips(name, startTime, endTime);
            } else {
                console.log('No more lines to process.');
            }
        };

        // Start processing lines
        processNextLine();
    } catch (error) {
        console.error('Error loading CSV or setting up page:', error);
    }
}


async function startRecording(videoPlayer) {
    videoPlayer.muted = true;
    // Get the microphone stream
    microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    videoPlayer.play();
    // Create a MediaRecorder for the microphone stream
    mediaRecorder = new MediaRecorder(microphoneStream);
    mediaRecorder.start();

    mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
        microphoneStream.getTracks().forEach(track => track.stop());
    };

    recording = true;
}

async function stopRecording() {
    return new Promise((resolve) => {
        if (mediaRecorder && recording) {
            mediaRecorder.stop();
            mediaRecorder.onstop = () => {
                recording = false; // Reset recording state
                console.log('Recording stopped');
                resolve();
            };
        } else {
            resolve(); // Resolve immediately if no recording is active
        }
    });
}

function playClickSound() {
    return new Promise((resolve) => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime); // 1kHz frequency

        oscillator.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1); // Short click sound (100ms)

        oscillator.onended = resolve;
    });
}

async function startCountdown() {
    for (let i = 0; i < 3; i++) {
        await playClickSound();
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms between clicks
    }
}

function saveRecording(name, startTime, endTime) {
    const blob = new Blob(audioChunks, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('audio', blob, `${name}_${startTime}-${endTime}.wav`);

    fetch(`save-audio.php?project=${encodeURIComponent(projectName)}&name=${encodeURIComponent(name)}&start=${encodeURIComponent(startTime)}&end=${encodeURIComponent(endTime)}`, {
        method: 'POST',
        body: formData
    }).then(response => response.json())
      .then(data => {
        console.log(data);
          if (data.status === 'success') {
              alert('Recording saved successfully.');
              displayRecordedClips(name, startTime, endTime); // Refresh the clips list
          } else {
              alert('Failed to save recording.');
          }
      }).catch(error => {
          console.error('Error saving recording:', error);
      });

    audioChunks = []; // Clear the chunks
}

async function displayRecordedClips(name, startTime, endTime) {
    const reviewDiv = document.getElementById('review');
    reviewDiv.innerHTML = ''; // Clear previous content

    try {
        const response = await fetch(`list-audio.php?project=${encodeURIComponent(projectName)}&name=${encodeURIComponent(name)}&start=${encodeURIComponent(startTime)}&end=${encodeURIComponent(endTime)}`);
        const data = await response.json();
        
        if (data.status === 'success' && Array.isArray(data.files) && data.files.length > 0) {
            data.files.forEach(file => {
                console.log("File:", file);
                const fileDiv = document.createElement('div');
                fileDiv.innerHTML = `
                    <label>${file}</label>
                    <button class="playSoloButton" data-name="${name}" data-start="${startTime}" data-end="${endTime}" data-file="${file}">Play</button>
                    <button class="deleteButton" data-name="${name}" data-start="${startTime}" data-end="${endTime}" data-file="${file}">Delete</button>
                `;
                reviewDiv.appendChild(fileDiv);
            });

            // Add event listeners for delete buttons
            reviewDiv.querySelectorAll('.deleteButton').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const file = event.target.getAttribute('data-file');
                    const confirmed = confirm(`Are you sure you want to delete ${file}?`);
                    if (confirmed) {
                        try {
                            const name = event.target.getAttribute('data-name');
                            const startTime = event.target.getAttribute('data-start');
                            const endTime = event.target.getAttribute('data-end');
                            await deleteFile(name, startTime, endTime, file);
                            event.target.parentElement.remove(); // Remove the deleted file div
                        } catch (error) {
                            console.error('Error deleting file:', error);
                        }
                    }
                });
            });

            // Add event listeners for play solo buttons
            reviewDiv.querySelectorAll('.playSoloButton').forEach(button => {
                button.addEventListener('click', (event) => {
                    const file = event.target.getAttribute('data-file');
                    playSolo(projectName, name, startTime, endTime, file); // Ensure this function is defined elsewhere in your script
                });
            });
        } else {
            console.log('No files found.');
        }
    } catch (error) {
        console.error('Error fetching files:', error);
    }
}


async function deleteFile(name, startTime, endTime, file) {
    try {
        const response = await fetch('delete-audio.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                project: projectName,
                name: name,
                start: startTime,
                end: endTime,
                file: file
            })
        });

        const data = await response.json();
        if (data.status === 'success') {
            alert('File deleted successfully.');
        } else {
            alert(`Failed to delete file: ${data.message}`);
        }
    } catch (error) {
        console.error('Error deleting file:', error);
    }
}




async function playSolo(projectName, name, startTime, endTime, file) {
    const filePath = `../projects/${projectName}/${name}/${startTime}-${endTime}/${file}`;
    
    // Log the file path for debugging
    console.log('Attempting to play audio from:', filePath);

    // Create a new AudioContext
    const audioContext = new (window.AudioContext || window.AudioContext)();

    try {
        // Fetch the audio file
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        // Get the array buffer from the response
        const arrayBuffer = await response.arrayBuffer();
        
        // Decode the audio data
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Create a buffer source
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        
        // Connect the source to the audio context's destination (the speakers)
        source.connect(audioContext.destination);
        
        // Start playing the audio
        source.start();
        console.log('Audio playback has started.');
    } catch (error) {
        console.error('Error starting audio playback:', error);
        alert('Audio playback is restricted by your browser. Please start playback manually.');
    }
}