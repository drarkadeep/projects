# Antarctic Static Site Generator

This is a simple, yet powerful static site generator built with Python. It allows you to create a beautiful, fast, and SEO-friendly website or blog with ease.

## Features

- Markdown support for content creation
- YAML front matter for post/page metadata
- Customizable templates using Jinja2
- Category and tag support
- Pagination for post listings
- RSS feed generation
- Sitemap generation
- Responsive design
- Image optimization
- Code syntax highlighting
- Automatic table of contents for long posts

## Getting Started

### Prerequisites

- Python 3.7 or higher
- pip (Python package manager)

### Installation

1. Clone this repository or download the ZIP file and extract it.
2. Open a terminal/command prompt and navigate to the project folder.
3. Install the required dependencies:

   ```
   pip install -r requirements.txt
   ```

### Configuration

1. Open `config.yaml` in a text editor.
2. Modify the settings to match your preferences:
   - `site_name`: Your website's name
   - `description`: A brief description of your site
   - `author`: Your name or pseudonym
   - `url`: Your website's URL
   - `posts_per_page`: Number of posts to display per page (default: 10)

### Creating Content

#### Creating a New Post

1. Run the following command:

   ```
   python new_content.py post
   ```

2. Enter the post title when prompted.
3. A new Markdown file will be created in the `content/posts` directory with the format `YYYY-MM-DD-title.md`.
4. Open the file and add your content below the YAML front matter.

#### Creating a New Page

1. Run the following command:

   ```
   python new_content.py page
   ```

2. Enter the page title when prompted.
3. A new Markdown file will be created in the `content/pages` directory.
4. Open the file and add your content below the YAML front matter.

#### YAML Front Matter

The YAML front matter at the top of each content file allows you to specify metadata:

```yaml
---
title: Your Post Title
date: 2023-04-14
categories: [Technology, Programming]
tags: [python, web development]
---
```

### Customizing Templates

Templates are located in the `templates` directory. You can modify these HTML files to change the structure and appearance of your site:

- `base.html`: The main template that all other templates extend
- `post_list.html`: Template for the post listing (homepage)
- `post.html`: Template for individual post pages
- `page.html`: Template for static pages
- `category.html`: Template for category pages
- `tag.html`: Template for tag pages

### Styling Your Site

To customize the look of your site, edit the `static/css/style.css` file. The current theme uses a soft, monochrome design with royal purple as the accent color.

### Generating Your Site

To generate your static site, run:

```
python main.py
```

This will create an `output` directory containing your generated static site.

### Previewing Your Site

To preview your site locally:

1. Navigate to the `output` directory in your terminal/command prompt.
2. Run a local server:

   ```
   python -m http.server 8000
   ```

3. Open a web browser and go to `http://localhost:8000`

### Deploying Your Site

The generated static site in the `output` directory can be deployed to any static site hosting service, such as GitHub Pages, Netlify, or Vercel.

## Additional Features

### RSS Feed

An RSS feed is automatically generated at `output/feed.xml`.

### Sitemap

A sitemap is automatically generated at `output/sitemap.xml`.

### Image Optimization

Images placed in the `static/images` directory are automatically optimized during the build process.

### Code Syntax Highlighting

Use fenced code blocks in your Markdown files to enable syntax highlighting:

    ```python
    def hello_world():
        print("Hello, World!")
    ```

### Automatic Table of Contents

For long posts, a table of contents is automatically generated based on the headings in your content.

## Troubleshooting

If you encounter any issues or have questions, please check the following:

1. Ensure all dependencies are installed correctly.
2. Check that your content files have the correct YAML front matter.
3. Verify that your `config.yaml` file is properly formatted.

If problems persist, please open an issue on the project's GitHub repository.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Future plans

1. Themes and Customization:
   - Develop a theme system allowing users to switch between multiple pre-built designs.
   - Create a simple GUI for customizing colors, fonts, and layouts without editing CSS directly.
   - Implement dark mode toggle functionality using CSS variables and JavaScript.

2. Performance Optimization:
   - Implement lazy loading for images and embedded content using native browser features.
   - Add automatic generation of responsive images in multiple sizes.
   - Integrate a CSS minifier and JavaScript minifier into the build process.
   - Implement critical CSS extraction for above-the-fold content.

3. Content Enhancements:
   - Add support for custom post types (e.g., projects, recipes, reviews).
   - Implement a system for creating and displaying photo galleries or portfolios.
   - Add support for embedding audio and video files hosted on the same server.
   - Create a timeline or resume page generator for personal sites.

4. Interactivity (Client-side only):
   - Implement a pure JavaScript search functionality that works on static sites.
   - Add a "Read Time" estimator for posts.
   - Create an offline-capable Progressive Web App (PWA) version of the site.
   - Implement client-side syntax highlighting for code blocks.

5. SEO and Accessibility:
   - Generate JSON-LD structured data for better search engine understanding.
   - Implement automatic generation of Open Graph and Twitter Card meta tags.
   - Add an accessibility checker to the build process and provide suggestions for improvements.
   - Generate a text-only version of the site for extreme low-bandwidth situations.

6. Internationalization:
   - Add support for multilingual content with language-specific URLs.
   - Implement a translation workflow using YAML files for easy content localization.

7. Developer Experience:
   - Create a plugin system allowing users to extend functionality without modifying core code.
   - Implement a live reload development server for instant preview of changes.
   - Add unit tests and integration tests to ensure reliability.
   - Create a command-line interface (CLI) for all generator functions.

8. Content Creation Aids:
   - Implement a Markdown editor with live preview in the browser.
   - Add support for generating diagrams and charts from textual descriptions (e.g., Mermaid.js syntax).
   - Create a system for managing and reusing content snippets across multiple pages/posts.

9. Analytics and Insights (Privacy-Focused):
   - Implement a privacy-friendly, cookieless analytics system using server logs analysis.
   - Generate monthly/yearly archives and "On This Day" features for content.
   - Create a word cloud generator for visualizing frequently used terms in your content.

10. Expandability:
    - Add support for generating e-books (EPUB, PDF) from your content.
    - Implement a system for creating and managing web-based presentations or slideshows.
    - Create a simple project management system with Kanban boards using local storage.

11. Community and Social Features:
    - Implement a static comments system using pull requests (for GitHub-hosted sites).
    - Add support for Webmentions to enable cross-site conversations.
    - Create a "blogroll" or "link directory" feature to showcase other sites.

12. Security and Compliance:
    - Implement automatic addition of CSP (Content Security Policy) headers.
    - Add tools for generating privacy policy and terms of service pages.
    - Create a GDPR compliance checker for your static content.
