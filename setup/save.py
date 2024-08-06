import os
import csv
import sys
from moviepy.editor import VideoFileClip

def process_clips(project_dir):
    project_dir = "../projects/" + project_dir
    # Set up paths
    csv_path = os.path.join(project_dir, 'clips.csv')
    if not os.path.isfile(csv_path):
        print(f"Error: {csv_path} does not exist.")
        return

    # Read the CSV file
    with open(csv_path, 'r') as csvfile:
        reader = csv.reader(csvfile)
        lines = list(reader)

    # Get the movie path from the first line
    movie_path = project_dir + "/movie.mov"
    characters = []

    # Process each line in the CSV starting from the second line
    for line in lines[1:]:
        # Check number of fields
        if len(line) != 4:
            continue

        character, start_time, end_time, dialogue = line

        # Step 1: Create character directory if it doesn't exist
        if character not in characters:
            character_dir = os.path.join(project_dir, character)
            os.makedirs(character_dir, exist_ok=True)
            characters.append(character)
        else:
            character_dir = os.path.join(project_dir, character)

        # Step 2: Create clip path
        clip_path = f"{start_time}-{end_time}"
        clip_dir = os.path.join(character_dir, clip_path)
        os.makedirs(clip_dir, exist_ok=True)

        # Step 3: Create line.txt
        with open(os.path.join(clip_dir, 'line.txt'), 'w') as f:
            f.write(dialogue)

        # Step 4: Create the video clip and save the audio as WAV
        with VideoFileClip(movie_path) as video:
            # Create the video clip
            new_clip = video.subclip(float(start_time), float(end_time))
            new_clip_path = os.path.join(clip_dir, f"{start_time}-{end_time}-clip.mp4")
            new_clip.write_videofile(new_clip_path, codec="libx264")

            # Create the audio clip
            audio_clip = new_clip.audio
            audio_clip_path = os.path.join(clip_dir, f"{start_time}-{end_time}-clip.wav")
            audio_clip.write_audiofile(audio_clip_path)

        # Step 5: Add fields to the CSV line
        line.extend([new_clip_path, audio_clip_path, '0', '0', '0'])

    # Write the updated lines back to the CSV
    with open(csv_path, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerows(lines)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script.py <project_directory>")
    else:
        project_dir = sys.argv[1]
        process_clips(project_dir)
