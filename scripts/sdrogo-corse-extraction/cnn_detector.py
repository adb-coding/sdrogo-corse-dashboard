import cv2
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image
import os
import yt_dlp
import json
import subprocess
import numpy as np

OUTPUT_PATH = r'C:\Coding\sdrogo-corse-python\output\new_videos'
os.makedirs(OUTPUT_PATH, exist_ok=True)

JSON_PATH = r'C:\Coding\sdrogo-corse-python\processed\new_processed'
os.makedirs(JSON_PATH, exist_ok=True)

# --- RE-DEFINE YOUR MODEL CLASS ---
class ImageClassifier(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(3, 16, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(16, 8, kernel_size=3, padding=1)
        self.pool = nn.MaxPool2d(2)
        self.flatten = nn.Flatten()
        self.fc1 = nn.Linear(8 * 56 * 56, 32)
        self.fc2 = nn.Linear(32, 2)

    def forward(self, x):
        out = self.pool(F.relu(self.conv1(x)))
        out = self.pool(F.relu(self.conv2(out)))
        out = self.flatten(out)
        out = self.fc2(F.relu(self.fc1(out)))
        return out
    
# --- SETUP ---
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = ImageClassifier().to(device)
model.load_state_dict(torch.load(r'C:\Coding\sdrogo-corse-python\model\leaderboard_model.pth', map_location=device))
model.eval()

# Must be EXACTLY the same as training
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])


# --- CORE LOGIC FUNCTIONS ---

# UPDATE THE METADATA.JSON FILE TO KEEP TRACK OF THE DETECTED RACES
def update_central_metadata(entry):
    path = os.path.join(JSON_PATH, "metadata.json")
    data = []
    if os.path.exists(path):
        try:
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if not isinstance(data, list): data = []
        except: data = []
    if not any(item.get('link') == entry['link'] for item in data):
        data.append(entry)
        with open(path, 'w', encoding='utf-8') as f: json.dump(data, f, indent=4, ensure_ascii=False)


# UPDATE THE JSON FILE TO KEEP TRACK OF FAILED DETECTIONS
def update_not_detected(entry):
    path = os.path.join(JSON_PATH, "not_detected.json")
    data = []
    if os.path.exists(path):
        try:
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if not isinstance(data, list): data = []
        except: data = []
    if not any(item.get('link') == entry['link'] for item in data):
        data.append(entry)
        with open(path, 'w', encoding='utf-8') as f: json.dump(data, f, indent=4, ensure_ascii=False)


def get_video_info(video_url):
    ydl_opts = {'quiet': True, 'format':'best[ext=mp4]', 'noplaylist': True}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(video_url, download=False)
    stream_url = info.get('url') or info['formats'][-1].get('url')
    return {
        "stream_url": stream_url,
        "duration": info.get('duration', 0),
        "title": info.get('title','video'),
        "channel": info.get('channel_id', 'unknown'),
        "upload_date": info.get('upload_date','unknown'),
        "original_url": video_url
    }


def process_playlist(playlist_url):
    # Handle multiple URLs: 
    # 1. Strip brackets and quotes (in case a Python list is pasted)
    # 2. Split by comma, space, or newline
    clean_input = playlist_url.replace('[', '').replace(']', '').replace("'", "").replace('"', '').replace(',', ' ')
    urls = [u.strip() for u in clean_input.split() if u.strip()]
    
    for url in urls:
        ydl_opts = {
            'quiet': True, 
            'extract_flat': True
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            try:
                info = ydl.extract_info(url, download=False)
                if 'entries' in info:
                    entries = info['entries']
                else:
                    entries = [info]
            except Exception as e:
                print(f" [!] Error accessing {url}: {e}")
                continue

        print(f"Found {len(entries)} videos in {url}. Starting scan...")
        
        # Pre-scan output folder for existing IDs
        existing_files = os.listdir(OUTPUT_PATH)
        
        for counter, entry in enumerate(entries, 1):
            video_id = entry.get('id')
            video_title = entry.get('title', 'Unknown title')
            
            # Robust URL construction: handle case where 'url' might be missing in extract_flat
            video_url = entry.get('url')
            if not video_url or 'youtube.com' not in video_url:
                video_url = f"https://www.youtube.com/watch?v={video_id}"

            # CHECK IF THE VIDEO HAS ALREADY BEEN SAVED (Using ID)
            if any(video_id in x for x in existing_files):
                print(f"[{counter}/{len(entries)}] Skipping: {video_title} (ID: {video_id} already exists)")
                continue

            print(f"[{counter}/{len(entries)}] Processing: {video_title}")
            scan_video_end(video_url)

def scan_video_end(video_url):
    ydl_opts = {
        'format': 'best[height<=1080]', 
        'quiet': True
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            stream_url = info['url']
            title = info['title']
            video_id = info['id']
            date = info['upload_date']
            duration = info.get('duration', 0)
    except Exception as e:
        print(f" [!] Skipping {video_url} due to error: {e}")
        return

    # SANITIZE FILENAME: Remove characters Windows doesn't like (|, /, \, :, *, ?, ", <, >)
    clean_title = "".join([c for c in title if c.isalnum() or c in (' ', '_', '.')]).strip()
    # filename = f"{video_id}_{clean_title}_leaderboard.png"
    filename = f"{date}_{clean_title}_leaderboard.png"
    save_path = os.path.join(OUTPUT_PATH, filename)

    leaderboard_detected = False
    try:
        width = info.get('width')
        height = info.get('height')
    except Exception as e:
        print(f" [!] Error getting resolution for {title}: {e}")
        return

    scan_seconds = 150
    start_time = max(0, duration - scan_seconds)
    print(f"  Scanning last {scan_seconds}s of: {title} at {width}x{height}")
    
    # Use ffmpeg to seek and pipe frames at 1 fps
    cmd = [
        'ffmpeg',
        '-ss', str(start_time),
        '-i', stream_url,
        '-vf', 'fps=1',
        '-f', 'image2pipe',
        '-pix_fmt', 'bgr24',
        '-vcodec', 'rawvideo',
        '-'
    ]
    
    pipe = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    frame_size = width * height * 3

    while True:
        raw_image = pipe.stdout.read(frame_size)
        if len(raw_image) != frame_size:
            break

        frame = np.frombuffer(raw_image, dtype='uint8').reshape((height, width, 3))
        
        # Convert BGR to RGB for PIL
        img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        img_t = transform(img).unsqueeze(0).to(device)

        with torch.no_grad():
            output = model(img_t)
            probabilities = F.softmax(output, dim=1)
            confidence = probabilities[0][0].item()

            if confidence > 0.95:
              print(f"    [✓] Leaderboard detected! (Conf: {confidence:.4f}) Saving to {filename}")
              cv2.imwrite(save_path, frame)
              
              update_central_metadata({
                   "title": title,
                   "id": video_id,
                   "processed": True,
                   "link": info.get('original_url', video_url),
                   'upload_date': info.get('upload_date'),
                   'channel': info.get('channel_id'),
                   'image_path': save_path
              })
              leaderboard_detected = True
              break
    
    pipe.terminate()

    if not leaderboard_detected:
        print(f"    [!] No leaderboard found in {title}")
        update_not_detected({
             "title": title,
             "id": video_id,
             "link": info.get('original_url', video_url)
        })

if __name__ == '__main__':
    url_input = input("Enter YouTube URLs or playlist URL (separated by comma or space):")
    process_playlist(url_input)

# --- RUN IT ---
# PLAYLIST_URL = "https://www.youtube.com/playlist?list=PL99-iIH7msMdeXHM6LpeYKLJ3_9hs9A4O"
# process_playlist(PLAYLIST_URL)