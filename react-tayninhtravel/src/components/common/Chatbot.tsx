import { useEffect } from 'react'

const Chatbot = () => {
    useEffect(() => {
        // Add chatbot configuration
        window.chtlConfig = { chatbotId: "7922234247" }

        // Create and append script
        const script = document.createElement('script')
        script.src = 'https://chatling.ai/js/embed.js'
        script.async = true
        script.type = 'text/javascript'
        script.id = 'chtl-script'
        script.setAttribute('data-id', '7922234247')

        document.body.appendChild(script)

        // Cleanup function
        return () => {
            const chatbotScript = document.getElementById('chtl-script')
            if (chatbotScript) {
                document.body.removeChild(chatbotScript)
            }
        }
    }, [])

    return null
}

export default Chatbot 