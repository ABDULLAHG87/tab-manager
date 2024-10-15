# Tab Manager Chrome Extension

## Overview

The **Tab Manager** Chrome Extension helps users efficiently manage open browser tabs. It offers powerful features such as domain-based grouping, search functionality for quick tab discovery, and tools to close duplicate tabs. With this extension, you can simplify your browsing experience and keep your workspace organized effortlessly.

## Features

- **Search Tabs**: Instantly search through all open tabs using keywords from the tab title or URL.
- **Domain Grouping**: Automatically group open tabs by domain, making it easier to manage tabs from the same website.
- **Navigate & Close Tabs**: Quickly navigate to any tab or close it directly from the extension interface.
- **Close Duplicate Tabs**: Detect and close duplicate tabs with a single click to reduce clutter.

## Screenshots

<!-- Add actual screenshots here by replacing 'path/to/screenshotX.png' with your screenshot paths -->

| Feature                | Screenshot                                        |
| ---------------------- | ------------------------------------------------ |
| Search Tabs            | ![Search Tabs](path/to/screenshot1.png)           |
| Domain Grouping        | ![Domain Grouping](path/to/screenshot2.png)       |
| Close Duplicate Tabs   | ![Close Duplicate Tabs](path/to/screenshot3.png)  |

## Installation

### Step 1: Clone or Download

1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/tab-manager-extension.git
    ```
2. **Download the ZIP file**:
   Alternatively, you can download the repository as a ZIP file and extract it to a folder on your computer.

### Step 2: Load as Unpacked Extension

1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer Mode** by toggling the switch at the top-right corner.
3. Click on **Load Unpacked** and select the folder where the extension's code is located.

### Step 3: Start Managing Tabs

Once installed, you can start managing your tabs by clicking on the Tab Manager icon in the Chrome toolbar.

## Usage

1. Click the Tab Manager icon in the Chrome toolbar to open the extension popup.
2. Use the search bar to filter tabs by title or URL in real time.
3. View and manage tabs grouped by domain for easier navigation.
4. Easily navigate to or close any tab directly from the interface.
5. Click the "Close Duplicate Tabs" button to automatically detect and close duplicate tabs across your browser windows.

## Development

### Folder Structure

```bash
tab-manager-extension/
├── assets/               # Images and icons for the extension
├── css/                  # Styles for the popup and other elements
│   └── popup.css
├── js/                   # JavaScript files handling logic and functionality
│   └── popup.js
├── popup.html            # Main HTML file for the popup window
└── manifest.json         # Configuration file for the Chrome Extension


### Scripts

- **popup.js**: Contains the main functionality for querying tabs, grouping them by domain, searching, and closing tabs.
- **popup.html**: Defines the user interface for the extension.
- **popup.css**: Styles the extension's popup window.

### Tools Used

- **[Chrome Tabs API](https://developer.chrome.com/docs/extensions/reference/tabs/)**: Used to interact with and manage browser tabs.
- **JavaScript**: For the core functionality and event handling.
- **HTML/CSS**: For the user interface and layout.

## Contributing

If you'd like to contribute to the project, feel free to open a pull request or submit an issue. All contributions are welcome!

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

If you have any questions or suggestions, feel free to reach out:

- Email: hakeemabdullah87@gmail.com
- GitHub: [ABDULLAHG87](https://github.com/ABDULLAHG87)
