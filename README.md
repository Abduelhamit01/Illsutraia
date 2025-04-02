# Illustraia 🎨

AI-powered mobile application to generate beautiful illustrations based on user prompts using Leonardo AI. Built with React Native and Expo.

## ✨ Features

*   **AI Illustration Generation:** Create unique images from text descriptions using the Leonardo AI API.
*   **Style Selection:** Choose from various artistic styles for your generated images.
*   **User Authentication:** (Basic structure potentially in place - `LoginScreen`)
*   **Export/Save:** (Basic structure potentially in place - `ExportScreen`)

## 🚀 Tech Stack

*   **Frontend:** React Native, Expo
*   **Language:** TypeScript
*   **AI API:** Leonardo AI
*   **State Management:** (Not explicitly identified, potentially basic React state or Context API)
*   **Navigation:** React Navigation (implied by `navigation/AppNavigator.tsx`)

## 🔧 Setup & Installation

Follow these steps to get the project running locally:

1.  **Prerequisites:**
    *   Node.js (LTS version recommended)
    *   npm or yarn
    *   Expo Go app on your mobile device or an emulator/simulator.
    *   Expo CLI: `npm install -g expo-cli`

2.  **Clone the repository:**
    ```bash
    git clone https://github.com/Abduelhamit01/Illsutraia.git
    cd Illsutraia
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

4.  **Set up Environment Variables:**
    *   Create a file named `.env` in the root of the project.
    *   Add your Leonardo AI API key to this file:
        ```env
        LEONARDO_API_KEY=your_leonardo_api_key_here
        ```
    *   *Note: The `.env` file is included in `.gitignore` and should **never** be committed to version control.*

5.  **Run the application:**
    ```bash
    npx expo start
    ```
    *   This will open the Expo Metro Bundler in your browser.
    *   Scan the QR code with the Expo Go app on your device, or choose to run on an emulator/simulator.

## ⚙️ Configuration

*   **Leonardo AI API Key:** The application requires a Leonardo AI API key to function. This is configured via the `LEONARDO_API_KEY` variable in the `.env` file located in the project root.

## 🤝 Contributing (Optional)

Contributions are welcome! Please follow standard Git workflow practices (fork, feature branch, pull request).

## 📄 License (Optional)

Specify your project's license here (e.g., MIT, Apache 2.0). If unlicensed, state that. 