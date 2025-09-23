
# groq-talk

A simple CLI tool that allows you to chat with Groq LLMs directly from your terminal. Supports model switching, persistent API keys, and interactive conversations.

## Features

-   Chat with Groq models directly in the terminal
    
-   Save your API key securely for reuse
    
-   Switch between Groq models during a session
    
-   List all available models
    
-   Simple commands for managing sessions
    
-   Lightweight and easy to use
    

## Usage

### Installation

```bash
npm install -g groq-talk

```

### Login (Save API Key)

```bash
groq-talk login

```

You will be prompted to enter your Groq API key. The key will be stored locally in  `~/.groq-talk/config.json`.

### Start Chat

```bash
groq-talk chat

```

This will open an interactive session where you can type your messages and receive responses from Groq.

### Commands Inside Chat

-   `help`  Show available commands
    
-   `list-models`  List all available Groq models
    
-   `model <name>`  Change the current Groq model
    
-   `goodbye`  Exit the chat session
    
-   `logout`  Remove saved API key
    

### Example

```bash
groq-talk chat

Groq Chat started with model: llama-3.1-8b-instant. Type 'help' for commands.

You: Hello
Groq: Hi there! How can I help you today?

```

## Contributing

Contributions are welcome! Please feel free to submit a pull request if you have ideas for improvements or new features.

Check out the repository  [here](https://github.com/YOUR_GITHUB_USERNAME/groq-talk).

## License

This project is licensed under the MIT License - see the  [LICENSE](LICENSE)  file for details.

## Note
This is a hobby project, it is not associated or endorsed by Groq.