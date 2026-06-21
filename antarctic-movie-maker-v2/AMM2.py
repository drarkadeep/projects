import json
from moviepy.editor import *
from PIL import Image
import numpy as np
from gtts import gTTS
import os
import tempfile

# Calculate optimal dimensions for the video based on the aspect ratios of the images
def get_optimal_dimensions(data):
    max_aspect = 0
    # Find the maximum aspect ratio among all images
    for item in data["slides"]:
        img = Image.open(item['image_src'])
        aspect = img.width / img.height
        max_aspect = max(max_aspect, aspect)
    
    base_height = 1080  # Set the video height to 1080 pixels (Full HD)
    image_height = int(base_height * 0.75)  # Allocate 75% of height for the image
    caption_height = base_height - image_height  # Remaining 25% is for captions
    optimal_width = int(image_height * max_aspect)  # Calculate optimal width based on max aspect ratio
    
    return optimal_width, base_height, image_height, caption_height

# Create a video from a JSON file containing slide data
def create_video_from_json(json_path, output_path):
    # Load slide data from the JSON file
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    # Get video dimensions
    width, height, image_height, caption_height = get_optimal_dimensions(data)
    
    # Create a temporary directory for intermediate files
    temp_dir = tempfile.mkdtemp()
    video_segments = []  # Store individual video segments
    
    # Process each slide in the JSON file
    for idx, item in enumerate(data["slides"]):
        img = Image.open(item['image_src'])  # Load the image
        aspect = img.width / img.height  # Calculate its aspect ratio
        new_width = int(image_height * aspect)  # Scale image width to fit allocated height
        new_height = image_height  # Image height remains fixed
            
        # Resize the image with high-quality resampling
        img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # Create a black background to center the image
        background = Image.new('RGB', (width, image_height), (0, 0, 0))
        offset = ((width - new_width) // 2, 0)  # Calculate the position to center the image
        background.paste(img, offset)  # Place the image on the background
        
        # Save the processed image to the temporary directory
        temp_img_path = os.path.join(temp_dir, f'temp_img_{idx}.jpg')
        background.save(temp_img_path)
        
        # Generate audio for the caption using text-to-speech
        temp_audio_path = os.path.join(temp_dir, f'temp_audio_{idx}.mp3')
        tts = gTTS(text=item['caption'], lang='en')  # Convert caption text to audio
        tts.save(temp_audio_path)
        
        # Load the audio and image clips
        audio_clip = AudioFileClip(temp_audio_path)
        image_clip = ImageClip(temp_img_path).set_duration(audio_clip.duration)
        
        # Create a black background for the caption
        caption_bg = ColorClip(size=(width, caption_height), color=(0, 0, 0))
        
        # Add styled text for the caption
        txt_clip = TextClip(
            item['caption'],
            fontsize=40,  # Font size for captions
            font='Arial-Bold',  # Bold font for better visibility
            color='white',  # White text color
            size=(width - 80, None),  # Horizontal padding around the text
            method='caption',  # Use caption method for automatic wrapping
            align='center'  # Center-align the text
        ).set_position('center', 40).set_duration(audio_clip.duration)
        
        # Combine the caption background and text into a single video clip
        caption_clip = CompositeVideoClip(
            [caption_bg, txt_clip],
            size=(width, caption_height)
        ).set_duration(audio_clip.duration)
        
        # Combine the image and caption clips into one segment
        video_segment = clips_array([[image_clip], 
                                     [caption_clip]]).set_audio(audio_clip)
        
        video_segments.append(video_segment)  # Add the segment to the list
    
    # Concatenate all video segments into a single video
    final_video = concatenate_videoclips(video_segments)
    final_video.write_videofile(
        output_path,
        fps=24,  # Set frame rate to 24 frames per second
        codec='libx264',  # Use H.264 codec for video compression
        audio_codec='aac'  # Use AAC codec for audio compression
    )
    
    # Clean up temporary files
    for file in os.listdir(temp_dir):
        os.remove(os.path.join(temp_dir, file))
    os.rmdir(temp_dir)

# Call the function to create a video
create_video_from_json('input.json', 'output.mp4')
