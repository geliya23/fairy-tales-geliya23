# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is a simple static website for displaying a collection of fairy tales. The main page (index.html) provides a navigation sidebar to select different stories, which are loaded dynamically from individual HTML files in the story/ directory.

## Codebase Structure
- `index.html`: Main page with story navigation and content display
- `story/`: Directory containing individual story HTML files
  - Each story is a standalone HTML file with its own header and main content

## Architecture
- The index.html file uses JavaScript to dynamically load story content via fetch requests
- Stories are listed in a hardcoded array in the JavaScript code
- When a story is selected, its content is loaded and injected into the main content area
- Each story file follows a consistent HTML structure with header and main elements

## Development
This is a static HTML/CSS/JavaScript project with no build process. Files can be edited directly and viewed in a browser.

## Common Development Tasks
1. Adding a new story: Create a new HTML file in the story/ directory and add it to the stories array in index.html
2. Modifying story content: Edit the individual story HTML files
3. Styling changes: Most styles are in the index.html file, with some story-specific styles in individual story files

## Testing
Open index.html in a web browser to test functionality. No automated testing setup exists.