document.addEventListener('DOMContentLoaded', () => {
    const webhookUrlInput = document.getElementById('webhookUrl');
    const messageInput = document.getElementById('message');
    const deleteButton = document.getElementById('deleteButton');
    const statusMessage = document.getElementById('statusMessage');

    const showStatus = (message, type) => {
        statusMessage.textContent = message;
        statusMessage.className = 'status-message ' + type;
        statusMessage.style.display = 'block';
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 5000);
    };

    const validateWebhookUrl = (url) => {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname === 'discord.com' && 
                   urlObj.pathname.startsWith('/api/webhooks/') &&
                   urlObj.pathname.split('/').length === 5;
        } catch {
            return false;
        }
    };

    const sendMessage = async (url, message) => {
        if (!message.trim()) return true;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: message })
            });

            return response.ok;
        } catch (error) {
            return false;
        }
    };

    const deleteWebhook = async (url) => {
        try {
            const message = messageInput.value.trim();
            if (message) {
                showStatus('Sending message...', 'warning');
                const messageSent = await sendMessage(url, message);
                if (!messageSent) {
                    throw new Error('Failed to send message');
                }
            }

            showStatus('Deleting webhook...', 'warning');
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 204) {
                showStatus('Webhook successfully deleted!', 'success');
                webhookUrlInput.value = '';
                messageInput.value = '';
                deleteButton.disabled = true;
            } else {
                throw new Error('Failed to delete webhook');
            }
        } catch (error) {
            showStatus('Error: Could not delete webhook. Please check the URL and try again.', 'error');
        }
    };

    webhookUrlInput.addEventListener('input', () => {
        const url = webhookUrlInput.value.trim();
        deleteButton.disabled = !validateWebhookUrl(url);
    });

    deleteButton.addEventListener('click', () => {
        const url = webhookUrlInput.value.trim();
        if (validateWebhookUrl(url)) {
            deleteButton.disabled = true;
            deleteWebhook(url);
        }
    });

    webhookUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !deleteButton.disabled) {
            deleteButton.click();
        }
    });

    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !deleteButton.disabled) {
            deleteButton.click();
        }
    });
}); 