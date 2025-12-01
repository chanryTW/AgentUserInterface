export type AGUIEvent =
    | { type: 'message'; role: string; content: string }
    | { type: 'update_ui'; component: string; props: any }
    | { type: 'tool_call'; tool: string; args: any }
    | { type: 'tool_result'; id: string; result: any };

export async function connectAGUI(
    url: string,
    message: string,
    onEvent: (event: AGUIEvent) => void
) {
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        if (!res.body) {
            throw new Error('No response body');
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep the last partial line in the buffer

            for (const line of lines) {
                if (!line.trim()) continue;
                try {
                    const event = JSON.parse(line);
                    onEvent(event);
                } catch (e) {
                    console.error('Failed to parse JSON:', line, e);
                }
            }
        }
    } catch (error) {
        console.error('AG-UI Connection Error:', error);
    }
}
