# This is the source code for [Antarctic Movie Maker](https://youtu.be/hcqhivp8yOk)

This is the Antarctic MovieMaker that converts text, image and clips into Videos. Most of the sample images are from [pexels](https://pexels.com). Huge thanks to the independent photographers for providiing quality content free of cost. Here is the comprehensive documentation for the Antarctic Movie Maker:

#### Imports
- `json`: For loading JSON data.
- `moviepy.editor`: For video processing and editing.
- `gtts`: For generating text-to-speech (TTS) audio.
- `os`: For file operations like deleting temporary files.

#### Functions

##### `resize_and_pad`
This function resizes a video clip while maintaining its aspect ratio and pads it with a black background to match the target size.

**Parameters:**
- `clip`: The video clip to resize and pad.
- `target_size`: A tuple specifying the target size (width, height).

**Returns:**
- A `VideoFileClip` that has been resized and padded.

##### `create_video_from_json`
This function creates a video from a JSON file containing text and media entries. Each entry consists of a text string and a corresponding media file (image or video).

**Parameters:**
- `json_file`: Path to the JSON file.
- `output_file`: Path to the output video file.
- `target_size`: A tuple specifying the target size (width, height). Default is (1920, 1080).

**Process:**
1. Loads JSON data.
2. Iterates through each item in the JSON file.
3. Generates TTS audio from the text.
4. Processes the media file (image or video):
   - For images, creates an `ImageClip`.
   - For videos, creates a `VideoFileClip` and adjusts the duration.
5. Resizes and pads the visual media to match the target size.
6. Combines the visual media with the TTS audio.
7. Concatenates all clips.
8. Writes the final video to the specified output file.
9. Cleans up temporary audio files.

### Usage Example
The script can be executed with the provided example paths for the JSON input and the output video:
```python
json_file = "input.json"
output_file = "output.mp4"
create_video_from_json(json_file, output_file)
```

This documentation provides a comprehensive overview of the functionality and usage of the script, aiding in understanding and maintaining the code.
