#!/bin/bash

# Define the target directory
TARGET_DIR="../projects"

# Check if the target directory exists
if [ ! -d "$TARGET_DIR" ]; then
    echo "Error: Directory $TARGET_DIR does not exist."
    exit 1
fi

# Set permissions for the target directory itself
chmod 755 "$TARGET_DIR"

# Recursively set permissions for all directories and files
find "$TARGET_DIR" -type d -exec chmod 755 {} \;
find "$TARGET_DIR" -type f -exec chmod 755 {} \;

echo "Permissions updated successfully."
