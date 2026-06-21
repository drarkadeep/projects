# We'll use moviepy for the video and gTTS for the audio
from moviepy.editor import *
from gtts import gTTS
import os

def text_to_video(para):
    """
    Converts a paragraph of text into a video where each word is displayed with its corresponding spoken audio.

    Parameters:
    para (str): The paragraph of text to convert into video.

    The function breaks the paragraph into individual words, converts each word into a text clip with audio, 
    and concatenates these clips into a final video.
    """
    video_list = []
    texts = para.split(" ")

    for text in texts:
        # Generate TTS audio for the word
        tts = gTTS(text=text, lang='en')
        tts.save("audio.mp3")

        # Create a text clip with the word, centered in the clip, and set the duration to match the audio duration
        text_clip = TextClip(text, size=(700, 500), fontsize=70, color='white')
        text_clip = text_clip.set_duration(AudioFileClip("audio.mp3").duration)
        final_clip = text_clip.set_audio(AudioFileClip("audio.mp3"))

        # Save the final clip to a temporary video file
        final_clip.write_videofile("video.mp4", fps=1)

        # Append the temporary video file to the video list for concatenation later
        video_list.append(VideoFileClip("video.mp4"))

        # Remove the temporary audio and video files
        os.remove("audio.mp3")
        os.remove("video.mp4")

    # Concatenate all the video clips into a single video
    compiled_video = concatenate_videoclips(video_list)
    compiled_video.write_videofile("output.mp4")

    # Optional: Generate an Alvin and the Chipmunks style video by speeding up the final video
    # new_video = VideoFileClip("output.mp4")
    # speed_video = new_video.fx(vfx.speedx, 2.0)
    # speed_video.write_videofile("output.mp4", fps=24)

# Example usage
para = ("I made a text to video generator so bad that it makes you wanna fall asleep. "
        "The monotonous drone, coupled with a barrage of technical terms, washes over you, "
        "slowly coaxing your eyelids shut. Alternatively, the dimly lit minimalist background "
        "and the relentless wall of words conspire to lull you into a drowsy complacency. "
        "A slumber like a lumber, if you will. Goodnight, little one!")
text_to_video(para)
