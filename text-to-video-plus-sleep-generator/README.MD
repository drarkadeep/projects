> the code I finally used is in **final.py** and all previous attempts are dumped in the other file. this took around 30m to build and ~15m more to finish uploads.

# Watch the final video on [YouTube](https://www.youtube.com/watch?v=pc6fBCJ0cjU)

## Like

### Subscribe

#### Comment

##### Share

###### Hit the notification bell

# Here is the comprehensive documentation:

#### Imports
- `moviepy.editor`: For video processing and editing.
- `gtts`: For generating text-to-speech (TTS) audio.
- `os`: For file operations like deleting temporary files.

#### Functions

##### `text_to_video`
This function converts a paragraph of text into a video where each word is displayed with its corresponding spoken audio.

**Parameters:**
- `para`: A string containing the paragraph of text to be converted into a video.

**Process:**
1. Splits the paragraph into individual words.
2. For each word:
   - Generates TTS audio using the `gTTS` library.
   - Saves the TTS audio as a temporary file `audio.mp3`.
   - Creates a `TextClip` with the word centered in the clip.
   - Sets the duration of the text clip to match the duration of the TTS audio.
   - Combines the text clip with the TTS audio to create a `final_clip`.
   - Saves the `final_clip` as a temporary video file `video.mp4`.
   - Adds the temporary video file to a list of video clips (`video_list`).
   - Deletes the temporary audio and video files.
3. Concatenates all the video clips in the list into a single video.
4. Writes the concatenated video to the output file `output.mp4`.

**Optional:**
- An optional section of code is commented out, which can be used to speed up the final video to create an Alvin and the Chipmunks style effect.

### Usage Example
The script can be executed with the provided example paragraph:
```python
para = ("I made a text to video generator so bad that it makes you wanna fall asleep. "
        "The monotonous drone, coupled with a barrage of technical terms, washes over you, "
        "slowly coaxing your eyelids shut. Alternatively, the dimly lit minimalist background "
        "and the relentless wall of words conspire to lull you into a drowsy complacency. "
        "A slumber like a lumber, if you will. Goodnight, little one!")
text_to_video(para)
```

This documentation provides a comprehensive overview of the functionality and usage of the script, aiding in understanding and maintaining the code.
