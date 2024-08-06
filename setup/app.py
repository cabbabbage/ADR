from flask import Flask, request, jsonify, send_from_directory
import moviepy.editor as mp
import speech_recognition as sr
import os
import csv
import subprocess
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Set the directory where audio files will be saved
AUDIO_DIR = os.path.dirname(os.path.abspath(__file__))
print(f"AUDIO_DIR set to: {AUDIO_DIR}")

@app.route('/extract-audio/<project_name>', methods=['POST'])
def extract_audio(project_name):
    try:
        # Extract data from request
        data = request.json
        start_time = data.get('start')
        end_time = data.get('end')
        file_path = f'../projects/{project_name}/movie.mov'  # Adjust path as needed

        # Print received data
        print(f"Received start time: {start_time}, end time: {end_time}, project_name: {project_name}")
        print(f"File path: {file_path}")

        # Extract audio from the video file
        video = mp.VideoFileClip(file_path)
        print("Video file loaded successfully.")
        audio = video.audio.subclip(start_time, end_time)
        print("Audio extracted successfully.")

        # Save the audio to a specific file
        audio_file_path = os.path.join(AUDIO_DIR, 'clip.wav')
        print(f"Saving audio to: {audio_file_path}")
        audio.write_audiofile(audio_file_path, codec='pcm_s16le')
        print("Audio saved successfully.")

        # Convert to text using SpeechRecognition
        recognizer = sr.Recognizer()
        with sr.AudioFile(audio_file_path) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data)
        print(f"Recognized text: {text}")

        return jsonify({'text': text, 'audio_url': '/clip.wav'})

    except Exception as e:
        # Print the error to the terminal
        print(f"Error occurred in extract_audio: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/clip.wav')
def serve_audio():
    print("Serving audio file.")
    return send_from_directory(AUDIO_DIR, 'clip.wav')

@app.route('/write-to-csv/<project_name>', methods=['POST'])
def write_to_csv(project_name):
    try:
        # Extract data from request
        data = request.json
        start_time = data.get('start')
        end_time = data.get('end')
        dialogues = data.get('dialogues')  # This should be a list of dictionaries

        # Define the CSV file path
        csv_file_path = f'../projects/{project_name}/clips.csv'
        print(f"CSV file path: {csv_file_path}")

        # Open file in append mode
        with open(csv_file_path, mode='a', newline='') as file:
            fieldnames = ['speaker', 'start_time', 'end_time', 'dialogue']
            writer = csv.DictWriter(file, fieldnames=fieldnames)

            # Check if file is empty; if so, write the header
            if file.tell() == 0:
                writer.writeheader()
                print("CSV header written.")

            # Write each dialogue entry to the CSV
            for dialogue in dialogues:
                writer.writerow({
                    'speaker': dialogue['speaker'],
                    'start_time': start_time,
                    'end_time': end_time,
                    'dialogue': dialogue['dialogue']
                })
                print(f"Added dialogue to CSV: {dialogue}")

        return jsonify({'message': 'CSV updated successfully'})
    except Exception as e:
        print(f"Error occurred in write_to_csv: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/save', methods=['POST'])
def save_project():
    try:
        # Extract project name from request
        project_name = request.json.get('project_name')
        print(f"Received project name: {project_name}")

        if not project_name:
            return jsonify({'error': 'Project name is required'}), 400

        # Run the perms.sh script
        print("Running perms.sh script.")
        perms_result = subprocess.run(['bash', 'perms.sh'], capture_output=True, text=True)
        print(f"perms.sh script output: {perms_result.stdout}")
        if perms_result.returncode != 0:
            print(f"Error executing perms.sh script: {perms_result.stderr}")
            return jsonify({'error': 'Error executing perms.sh script', 'output': perms_result.stderr}), 500

        # Run the save.py script
        print("Running save.py script.")
        save_result = subprocess.run(['python3', 'save.py', project_name], capture_output=True, text=True)
        print(f"save.py script output: {save_result.stdout}")
        if save_result.returncode == 0:
            return jsonify({'message': 'Save script executed successfully', 'output': save_result.stdout})
        else:
            print(f"Error executing save script: {save_result.stderr}")
            return jsonify({'error': 'Error executing save script', 'output': save_result.stderr}), 500

    except Exception as e:
        print(f"Error occurred in save_project: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
