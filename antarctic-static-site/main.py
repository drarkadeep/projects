# main.py

import os
import shutil
import yaml
import markdown
from jinja2 import Environment, FileSystemLoader
from datetime import datetime
from slugify import slugify
from collections import defaultdict
import math
import xml.etree.ElementTree as ET
from PIL import Image

class StaticSiteGenerator:
    def __init__(self):
        self.config = self.load_config()
        self.env = Environment(loader=FileSystemLoader('templates'))
        self.markdown = markdown.Markdown(extensions=['meta', 'fenced_code', 'tables', 'footnotes', 'toc'])
        self.posts = []
        self.categories = defaultdict(list)
        self.tags = defaultdict(list)

    def load_config(self):
        with open('config.yaml', 'r') as f:
            return yaml.safe_load(f)

    def generate_site(self):
        self.clear_output_dir()
        self.copy_static_files()
        self.generate_pages()
        self.generate_posts()
        self.generate_index_pages()
        self.generate_category_pages()
        self.generate_tag_pages()
        # self.generate_rss_feed()
        self.generate_sitemap()

    def clear_output_dir(self):
        if os.path.exists('output'):
            shutil.rmtree('output')
        os.makedirs('output')

    def copy_static_files(self):
        shutil.copytree('static', 'output/static')
        self.optimize_images('output/static/images')

    def generate_pages(self):
        for page in os.listdir('content/pages'):
            self.generate_page(page)

    def generate_posts(self):
        for post in os.listdir('content/posts'):
            self.posts.append(self.generate_post(post))
        self.posts.sort(key=lambda x: x['date'], reverse=True)
        self.generate_post_list(self.posts)

    def generate_page(self, page_file):
        with open(f'content/pages/{page_file}', 'r') as f:
            content = f.read()
        html_content = self.markdown.convert(content)
        metadata = self.markdown.Meta

        template = self.env.get_template('page.html')
        output = template.render(content=html_content, metadata=metadata, config=self.config)

        slug = slugify(metadata.get('title', [os.path.splitext(page_file)[0]])[0])
        output_file = f'output/{slug}.html'
        with open(output_file, 'w') as f:
            f.write(output)

    def generate_post(self, post_file):
        with open(f'content/posts/{post_file}', 'r') as f:
            content = f.read()
        html_content = self.markdown.convert(content)
        metadata = self.markdown.Meta

        template = self.env.get_template('post.html')
        output = template.render(content=html_content, metadata=metadata, config=self.config)

        slug = slugify(metadata.get('title', [os.path.splitext(post_file)[0]])[0])
        output_file = f'output/posts/{slug}.html'
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        with open(output_file, 'w') as f:
            f.write(output)

        post_data = {
            'title': metadata.get('title', [''])[0],
            'date': datetime.strptime(metadata.get('date', [''])[0], '%Y-%m-%d'),
            'slug': slug,
            'categories': metadata.get('categories', []),
            'tags': metadata.get('tags', []),
        }

        for category in post_data['categories']:
            self.categories[category].append(post_data)
        for tag in post_data['tags']:
            self.tags[tag].append(post_data)

        return post_data

    def generate_post_list(self, posts, output_file='output/index.html', page=1, posts_per_page=10):
        total_pages = math.ceil(len(posts) / posts_per_page)
        start = (page - 1) * posts_per_page
        end = start + posts_per_page
        paginated_posts = posts[start:end]

        template = self.env.get_template('post_list.html')
        output = template.render(
            posts=paginated_posts,
            config=self.config,
            page=page,
            total_pages=total_pages,
            prev_url=f'/page/{page-1}' if page > 1 else None,
            next_url=f'/page/{page+1}' if page < total_pages else None
        )

        with open(output_file, 'w') as f:
            f.write(output)

        if page == 1 and total_pages > 1:
            for p in range(2, total_pages + 1):
                os.makedirs(f'output/page/{p}', exist_ok=True)
                self.generate_post_list(posts, f'output/page/{p}/index.html', p, posts_per_page)

    def generate_index_pages(self):
        self.generate_post_list(self.posts)

    def generate_category_pages(self):
        for category, posts in self.categories.items():
            template = self.env.get_template('category.html')
            output = template.render(category=category, posts=posts, config=self.config)
            
            slug = slugify(category)
            os.makedirs(f'output/category/{slug}', exist_ok=True)
            with open(f'output/category/{slug}/index.html', 'w') as f:
                f.write(output)

    def generate_tag_pages(self):
        for tag, posts in self.tags.items():
            template = self.env.get_template('tag.html')
            output = template.render(tag=tag, posts=posts, config=self.config)
            
            slug = slugify(tag)
            os.makedirs(f'output/tag/{slug}', exist_ok=True)
            with open(f'output/tag/{slug}/index.html', 'w') as f:
                f.write(output)

    def generate_rss_feed(self):
        template = self.env.get_template('rss.xml')
        output = template.render(posts=self.posts[:10], config=self.config)
        
        with open('output/feed.xml', 'w') as f:
            f.write(output)

    def generate_sitemap(self):
        root = ET.Element("urlset")
        root.set("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9")

        for page in self.config['pages']:
            url = ET.SubElement(root, "url")
            ET.SubElement(url, "loc").text = f"{self.config['url']}/{page['slug']}.html"

        for post in self.posts:
            url = ET.SubElement(root, "url")
            ET.SubElement(url, "loc").text = f"{self.config['url']}/posts/{post['slug']}.html"
            ET.SubElement(url, "lastmod").text = post['date'].strftime('%Y-%m-%d')

        tree = ET.ElementTree(root)
        tree.write('output/sitemap.xml', encoding='utf-8', xml_declaration=True)

    def optimize_images(self, image_dir):
        for root, dirs, files in os.walk(image_dir):
            for file in files:
                if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                    img_path = os.path.join(root, file)
                    with Image.open(img_path) as img:
                        img.thumbnail((1200, 1200))  # Resize to a maximum of 1200x1200
                        img.save(img_path, optimize=True, quality=85)

if __name__ == '__main__':
    generator = StaticSiteGenerator()
    generator.generate_site()