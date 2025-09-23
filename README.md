
# groq-talk

A CLI tool that allows you to chat with Groq LLMs directly from your terminal. Supports model switching, persistent API keys, and interactive conversations.

<br>

## Features

-   Chat with Groq models directly in the terminal
    
-   Save your API key securely for reuse
    
-   Switch between Groq models during a session
    
-   List all available models
    
-   Simple commands for managing sessions
    
-   Lightweight and easy to use

<br>

## Usage

### Requirements
You must have Node.js (v18 or higher) installed.

<br>

### Installation

1. **Install the package**
```bash
npm install -g groq-talk
```
<br>

2. **Log in**

```bash
groq-talk login

```

<br>

3. **You will be prompted to enter your Groq API key. The key will be stored locally in  `~/.groq-talk/config.json`**

<br>

4. **Start Chat**

```bash
groq-talk chat
```
<br>

This will open an interactive session where you can type your messages and receive responses from Groq.
 <hr>

### Running Locally

1.  **Clone the repository**
    

```bash
git clone https://github.com/YOUR_USERNAME/groq-talk.git
cd groq-talk
```

<br>

2.  **Install dependencies**
    

```bash
npm install
```

<br>

3.  **Setup environment variables**
    

Copy  `.env.example`  to  `.env`  and fill in your Groq API key:

```bash
cp .env.example .env
```

<br>

Inside  `.env`, set:
```
GROQ_API_KEY=your_api_key_here
```

<br>

4.  **Build the project**
    
```bash
npm run build
```
<br>

5.  **Run locally**
```bash
node dist/index.js
```
<br>

Or in dev mode with TypeScript:
```bash
npx ts-node src/index.ts
```

<br>

### Commands Inside Chat
-   `help`  Show available commands
    
-   `list-models`  List all available Groq models
    
-   `model <name>`  Change the current Groq model
    
-   `goodbye`  Exit the chat session
    
-   `logout`  Remove saved API key


    <br>

### Example
```bash
groq-talk chat

Groq Chat started with model: llama-3.1-8b-instant. Type 'help' for commands.

You: Hello
Groq: Hi there! How can I help you today?
```

<br>

## Contributing
I appreciate all contributions. Feel free to fork the repo, make your changes, and submit a pull request.

Check out the repository  [here]([https://github.com/YOUR_USERNAME/groq-talk](https://github.com/saadpocalypse/groq-talk)).

<br>

## License
This project is licensed under the MIT License - see the  [LICENSE](LICENSE)  file for details.

<br>

## Note
This is a hobby project, it is not associated or endorsed by Groq.