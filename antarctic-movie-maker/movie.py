import json
from moviepy.editor import *
from gtts import gTTS
import os

def resize_and_pad(clip, target_size):
    """
    Resizes a video clip while maintaining the aspect ratio and pads it with a black background to fit the target size.

    Parameters:
    clip (VideoFileClip): The video clip to be resized and padded.
    target_size (tuple): The target size (width, height) for the output video.

    Returns:
    VideoFileClip: The resized and padded video clip.
    """
    # Calculate the aspect ratios
    clip_aspect = clip.w / clip.h
    target_aspect = target_size[0] / target_size[1]
    
    # Resize clip while maintaining aspect ratio
    if clip_aspect > target_aspect:  # Wider than target
        new_width = target_size[0]
        new_height = int(target_size[0] / clip_aspect)
    else:  # Taller than target
        new_height = target_size[1]
        new_width = int(target_size[1] * clip_aspect)
    
    resized_clip = clip.resize(newsize=(new_width, new_height))
    
    # Create a black background
    bg = ColorClip(size=target_size, color=(0,0,0))
    
    # Overlay the resized clip onto the center of the background
    padded_clip = CompositeVideoClip([bg, resized_clip.set_position('center')])
    
    return padded_clip.set_duration(clip.duration)

def create_video_from_json(json_file, output_file, target_size=(1920, 1080)):
    """
    Creates a video from a JSON file that contains text and media (image or video) entries.

    Parameters:
    json_file (str): Path to the JSON file containing the video content.
    output_file (str): Path to the output video file.
    target_size (tuple): The target size (width, height) for the output video. Default is (1920, 1080).

    The JSON file should contain a list of items, each with a 'text' and 'media' field.
    - 'text' is the text to be converted to speech.
    - 'media' is the path to the image or video file.
    """
    # Load JSON data
    with open(json_file, 'r') as f:
        data = json.load(f)

    clips = []

    for item in data:
        # Generate TTS audio
        tts = gTTS(item['text'], lang='en')
        tts.save("temp_audio.mp3")
        audio = AudioFileClip("temp_audio.mp3")

        # Process media (image or video)
        if item['media'].endswith(('.jpg', '.jpeg', '.png', '.gif')):
            # For images
            visual = ImageClip(item['media']).set_duration(audio.duration)
        elif item['media'].endswith(('.mp4', '.avi', '.mov')):
            # For videos
            visual = VideoFileClip(item['media'])
            # Loop video if shorter than audio
            if visual.duration < audio.duration:
                visual = visual.loop(duration=audio.duration)
            else:
                visual = visual.subclip(0, audio.duration)
        else:
            print(f"Unsupported media type: {item['media']}")
            continue

        # Resize and pad the visual clip
        visual = resize_and_pad(visual, target_size)

        # Combine visual and audio
        final_clip = visual.set_audio(audio)
        clips.append(final_clip)

    # Concatenate all clips
    final_video = concatenate_videoclips(clips)

    # Write output video file
    final_video.write_videofile(output_file, codec='libx264', audio_codec='aac')

    # Clean up temporary audio file
    os.remove("temp_audio.mp3")

# Usage
json_file = "input.json"
output_file = "output.mp4"
create_video_from_json(json_file, output_file)
