function createNotification() {
    let messages = $state([]);

    return {
        get messages() { return messages; },
        
        show(text, type = "success") {
            const id = Date.now();
            messages.push({ id, text, type });
            
            // Auto remove after 3 seconds
            setTimeout(() => {
                this.remove(id);
            }, 3000);
        },
        
        remove(id) {
            const index = messages.findIndex(m => m.id === id);
            if (index !== -1) {
                messages.splice(index, 1);
            }
        },
        
        success(text) { this.show(text, "success"); },
        error(text) { this.show(text, "error"); },
        info(text) { this.show(text, "info"); }
    };
}

export const notification = createNotification();
