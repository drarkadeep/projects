import os
import sys
from datetime import datetime

def create_new_content(content_type):
    title = input("Enter the title: ")
    slug = input("Enter the slug (leave blank for auto-generated): ")
    
    if not slug:
        slug = title.lower().replace(' ', '-')
    
    date = datetime.now().strftime('%Y-%m-%d')
    filename = f"{date}-{slug}.md"
    
    if content_type == 'post':
        directory = os.path.join('content', 'posts')
    else:
        directory = os.path.join('content', 'pages')
    
    # Create the directory if it doesn't exist
    os.makedirs(directory, exist_ok=True)
    
    path = os.path.join(directory, filename)
    
    with open(path, 'w') as f:
        f.write(f"""---
title: {title}
date: {date}
---

Your content here.
""")
    
    print(f"Created new {content_type}: {path}")

if __name__ == '__main__':
    if len(sys.argv) != 2 or sys.argv[1] not in ['post', 'page']:
        print("Usage: python new_content.py [post|page]")
        sys.exit(1)
    
    create_new_content(sys.argv[1])