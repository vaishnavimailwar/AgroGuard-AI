import cv2
from pathlib import Path

IMAGE_PATH = Path("test_images/ant.jpg")
OUTPUT_PATH = Path("test_videos/pest_test.mp4")

FPS = 30
DURATION_SECONDS = 10

image = cv2.imread(str(IMAGE_PATH))

if image is None:
    raise FileNotFoundError(f"Image not found: {IMAGE_PATH}")

height, width = image.shape[:2]

fourcc = cv2.VideoWriter_fourcc(*"mp4v")

video = cv2.VideoWriter(
    str(OUTPUT_PATH),
    fourcc,
    FPS,
    (width, height)
)

total_frames = FPS * DURATION_SECONDS

for _ in range(total_frames):
    video.write(image)

video.release()

print("==============================================")
print("AGROGUARD AI - TEST VIDEO CREATED")
print("==============================================")
print(f"Image       : {IMAGE_PATH}")
print(f"Video       : {OUTPUT_PATH}")
print(f"FPS         : {FPS}")
print(f"Duration    : {DURATION_SECONDS} seconds")
print(f"Total frames: {total_frames}")
print("==============================================")