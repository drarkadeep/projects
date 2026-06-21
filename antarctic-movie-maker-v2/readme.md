# Antarctic Movie Maker V2

This Python script generates a video by combining images, captions, and audio based on a structured JSON input. It uses libraries such as `moviepy`, `PIL`, and `gTTS` to process images, generate text-to-speech audio, and create the final video.

## Features
- Automatically resizes and centers images to fit the video dimensions.
- Adds captions below images with dynamic text wrapping and styling.
- Generates audio for captions using Google Text-to-Speech (`gTTS`).
- Combines images, audio, and captions into a seamless video.

## Requirements
- Python 3.7+
- Libraries: 
  - `moviepy`
  - `Pillow`
  - `numpy`
  - `gTTS`

You can install the required libraries with:
```bash
pip install moviepy pillow numpy gtts
```
