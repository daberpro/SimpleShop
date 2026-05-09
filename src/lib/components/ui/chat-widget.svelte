<script>
    import { onMount, onDestroy } from "svelte";
    import { fade, fly, slide } from "svelte/transition";
    import { PUBLIC_WS_HOST } from "$env/static/public";
    import Button from "./button.svelte";

    let { user } = $props();

    let socket;
    let isOpen = $state(false);
    let messages = $state([]);
    let newMessage = $state("");
    let status = $state("disconnected"); // disconnected, connecting, connected
    let conversations = $state({}); // For admin: userId -> { email, messages, unread: 0, offset: 0, hasMore: false }
    let selectedUserId = $state(null); // For admin to pick who to chat with
    let offset = $state(0);
    let hasMore = $state(false);
    let scrollContainer = $state();
    let shouldScroll = true;
    let lastReadId = $state(0);
    let loadingHistory = $state(true);
    let reconnectTimeout;

    let totalUnread = $derived(
        user.role === 'admin' 
            ? Object.values(conversations).reduce((sum, c) => sum + (c.unread || 0), 0)
            : messages.filter(m => m.id > lastReadId && m.sender_id !== user.user_id).length
    );

    $effect(() => {
        if (isOpen && user.role !== 'admin' && messages.length > 0) {
            const latestId = Math.max(...messages.map(m => m.id));
            if (latestId > lastReadId) {
                lastReadId = latestId;
                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ type: 'read' }));
                }
            }
        }
        if (isOpen && user.role === 'admin' && selectedUserId) {
            if (conversations[selectedUserId]) {
                conversations[selectedUserId].unread = 0;
                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ type: 'read', receiverId: selectedUserId }));
                }
            }
        }
    });

    // Auto-scroll logic (Now instant jump for better UX)
    $effect(() => {
        if (messages.length && scrollContainer && shouldScroll) {
            requestAnimationFrame(() => {
                if (scrollContainer) {
                    scrollContainer.scrollTop = scrollContainer.scrollHeight;
                }
            });
        }
    });

    onMount(() => {
        if (user) {
            connect();
        }
    });

    onDestroy(() => {
        if (socket) socket.close();
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
    });

    function requestNotificationPermission() {
        if ("Notification" in window) {
            Notification.requestPermission();
        }
    }

    function showBrowserNotification(title, body) {
        if ("Notification" in window && Notification.permission === "granted" && document.hidden) {
            new Notification(title, {
                body: body,
                icon: "/favicon.png"
            });
        }
    }

    function connect() {
        if (!user || status === "connected") return;
        
        status = "connecting";
        socket = new WebSocket(PUBLIC_WS_HOST);

        socket.onopen = () => {
            status = "connected";
            requestNotificationPermission();
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === "history") {
                loadingHistory = false;
                const incoming = data.data;
                const isLoadMore = data.offset > 0;

                if (user.role === 'admin') {
                    const targetId = data.forUserId;
                    if (targetId) {
                        if (!conversations[targetId]) {
                            conversations[targetId] = { email: "User " + targetId, messages: [], unread: 0, offset: 0, hasMore: false };
                        }
                        
                        if (isLoadMore) {
                            conversations[targetId].messages = [...incoming, ...conversations[targetId].messages];
                            shouldScroll = false;
                        } else {
                            conversations[targetId].messages = incoming;
                            shouldScroll = true;
                        }
                        conversations[targetId].offset = data.offset;
                        conversations[targetId].hasMore = data.hasMore;
                        
                        // Count unread for this specific user
                        conversations[targetId].unread = conversations[targetId].messages.filter(m => m.sender_id !== user.user_id && m.is_read === 0).length;

                        if (selectedUserId === targetId) {
                            messages = conversations[targetId].messages;
                            hasMore = data.hasMore;
                            offset = data.offset;
                        }
                    } else {
                        const groups = { ...conversations };
                        incoming.forEach(msg => {
                            const otherId = msg.sender_id === user.user_id ? msg.receiver_id : msg.sender_id;
                            if (otherId) {
                                if (!groups[otherId]) {
                                    groups[otherId] = { email: msg.sender_id === user.user_id ? "User " + otherId : msg.sender_email, messages: [], unread: 0, offset: 0, hasMore: false };
                                }
                                groups[otherId].messages.push(msg);
                                if (msg.sender_id !== user.user_id) {
                                    groups[otherId].email = msg.sender_email;
                                    if (msg.is_read === 0) groups[otherId].unread++;
                                }
                            }
                        });
                        conversations = groups;
                    }
                } else {
                    if (isLoadMore) {
                        messages = [...incoming, ...messages];
                        shouldScroll = false;
                    } else {
                        messages = incoming;
                        shouldScroll = true;
                        // Set initial lastReadId from history
                        const incomingUnread = incoming.filter(m => m.sender_id !== user.user_id && m.is_read === 0);
                        const incomingRead = incoming.filter(m => m.sender_id !== user.user_id && m.is_read === 1);
                        if (incomingRead.length > 0) {
                            lastReadId = Math.max(...incomingRead.map(m => m.id));
                        }
                    }
                    hasMore = data.hasMore;
                    offset = data.offset;
                }
            } else if (data.type === "chat") {
                const msg = data.data;
                shouldScroll = true;
                if (user.role === 'admin') {
                    const otherId = msg.sender_id === user.user_id ? msg.receiver_id : msg.sender_id;
                    if (otherId) {
                        if (!conversations[otherId]) {
                            conversations[otherId] = { email: msg.sender_id === user.user_id ? "User " + otherId : msg.sender_email, messages: [], unread: 0, offset: 0, hasMore: false };
                        }
                        conversations[otherId].messages.push(msg);
                        
                        if (msg.sender_id !== user.user_id) {
                            if (!isOpen || selectedUserId !== otherId) {
                                conversations[otherId].unread = (conversations[otherId].unread || 0) + 1;
                                showBrowserNotification(`New message from ${msg.sender_email}`, msg.message);
                            } else if (document.hidden) {
                                showBrowserNotification(`New message from ${msg.sender_email}`, msg.message);
                                socket.send(JSON.stringify({ type: 'read', receiverId: otherId }));
                            } else {
                                // If open and not hidden, it's immediately read
                                msg.is_read = 1;
                                socket.send(JSON.stringify({ type: 'read', receiverId: otherId }));
                            }
                        }

                        if (msg.sender_id !== user.user_id) conversations[otherId].email = msg.sender_email;
                        if (selectedUserId === otherId) messages = [...conversations[otherId].messages];
                    }
                } else {
                    messages = [...messages, msg];
                    if (msg.sender_id !== user.user_id) {
                        if (!isOpen || document.hidden) {
                            showBrowserNotification("New message from Admin", msg.message);
                        } else {
                            msg.is_read = 1;
                            lastReadId = msg.id;
                            socket.send(JSON.stringify({ type: 'read' }));
                        }
                    }
                }
            } else if (data.type === "deleted") {
                const targetId = data.targetId;
                const nextGroups = { ...conversations };
                delete nextGroups[targetId];
                conversations = nextGroups;
                if (selectedUserId === targetId) {
                    selectedUserId = null;
                    messages = [];
                }
            }
        };

        socket.onclose = () => {
            status = "disconnected";
            if (user) {
                if (reconnectTimeout) clearTimeout(reconnectTimeout);
                reconnectTimeout = setTimeout(connect, 5000);
            }
        };
    }

    function loadMore() {
        const nextOffset = (user.role === 'admin' ? conversations[selectedUserId].offset : offset) + 20;
        socket.send(JSON.stringify({ 
            type: "history", 
            offset: nextOffset, 
            receiverId: user.role === 'admin' ? selectedUserId : null 
        }));
    }

    function sendMessage() {
        if (!newMessage.trim() || status !== "connected") return;
        shouldScroll = true;
        const payload = { type: "chat", message: newMessage, receiverId: user.role === 'admin' ? selectedUserId : null };
        socket.send(JSON.stringify(payload));
        newMessage = "";
    }

    function deleteConversation(e, targetId) {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this entire conversation?")) {
            socket.send(JSON.stringify({ type: 'delete_conversation', receiverId: targetId }));
        }
    }

    function selectConversation(userId) {
        selectedUserId = userId;
        messages = conversations[userId].messages;
        hasMore = conversations[userId].hasMore;
        offset = conversations[userId].offset;
        shouldScroll = true;
        if (messages.length === 0 || (messages.length > 0 && messages.length % 20 === 0)) {
            socket.send(JSON.stringify({ type: "history", offset: 0, receiverId: userId }));
        }
    }
</script>

{#if user}
    <div class="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
        {#if isOpen}
            <div 
                class="mb-4 w-80 md:w-96 h-[500px] bg-white rounded-3xl shadow-2xl border border-neutral-100 flex flex-col overflow-hidden"
                transition:fly={{ y: 20, duration: 300 }}
            >
                <div class="p-4 bg-black text-white flex justify-between items-center">
                    <div>
                        <h3 class="font-bold text-sm">{user.role === 'admin' ? 'Admin Chat Panel' : 'Chat with Admin'}</h3>
                        <div class="flex items-center gap-1.5">
                            <div class={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                            <span class="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">{status}</span>
                        </div>
                    </div>
                    <button onclick={() => isOpen = false} class="text-neutral-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                </div>

                {#if user.role === 'admin' && !selectedUserId}
                    <div class="flex-1 overflow-y-auto p-2 space-y-1">
                        <div class="px-3 py-2 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Active Conversations</div>
                        {#each Object.entries(conversations) as [userId, data]}
                            <div 
                                role="button"
                                tabindex="0"
                                onclick={() => selectConversation(Number(userId))}
                                onkeydown={(e) => e.key === 'Enter' && selectConversation(Number(userId))}
                                class="w-full p-3 rounded-2xl hover:bg-neutral-50 text-left transition-colors flex items-center gap-3 group relative cursor-pointer outline-none focus:bg-neutral-50"
                            >
                                <div class="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 font-bold group-hover:bg-black group-hover:text-white transition-all">
                                    {data.email[0].toUpperCase()}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="text-sm font-bold text-neutral-900 truncate pr-6">{data.email}</div>
                                    <div class="text-xs text-neutral-500 truncate">{data.messages[data.messages.length - 1]?.message}</div>
                                </div>
                                
                                <div class="flex flex-col items-end gap-2">
                                    {#if data.unread > 0}
                                        <div class="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{data.unread}</div>
                                    {/if}
                                    <button 
                                        onclick={(e) => deleteConversation(e, Number(userId))}
                                        class="p-1.5 text-neutral-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50"
                                        title="Delete Conversation"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                    </button>
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div 
                        bind:this={scrollContainer}
                        class="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50/50"
                    >
                        {#if loadingHistory && messages.length === 0}
                            <div class="h-full flex items-center justify-center">
                                <div class="flex flex-col items-center gap-2">
                                    <div class="w-6 h-6 border-2 border-black/10 border-t-black rounded-full animate-spin"></div>
                                    <span class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Loading History...</span>
                                </div>
                            </div>
                        {:else}
                            <!-- Sticky Navigation Header -->
                            <div class="sticky top-[-1rem] left-[-1rem] right-[-1rem] z-10 px-4 py-2 bg-white/80 backdrop-blur-md border-b border-neutral-100 flex flex-col gap-1 -mx-4 -mt-4 mb-4">
                                {#if user.role === 'admin'}
                                    <button onclick={() => selectedUserId = null} class="text-[10px] font-bold text-black hover:bg-neutral-100 px-2 py-1.5 rounded-lg uppercase tracking-widest flex items-center gap-2 transition-colors w-fit">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                        Back to list
                                    </button>
                                {/if}
                                {#if hasMore}
                                    <button onclick={loadMore} class="w-full py-1.5 text-[9px] font-bold text-neutral-500 hover:text-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                                        Load older messages
                                    </button>
                                {/if}
                            </div>

                            {#each messages as msg}
                                <div class={`flex flex-col ${msg.sender_id === user.user_id ? 'items-end' : 'items-start'}`}>
                                    <div class={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender_id === user.user_id ? 'bg-black text-white rounded-tr-none' : 'bg-white text-neutral-900 shadow-sm border border-neutral-100 rounded-tl-none'}`}>{msg.message}</div>
                                    <span class="text-[9px] text-neutral-400 mt-1 px-1">{msg.sender_id === user.user_id ? 'You' : msg.sender_email} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            {/each}
                        {/if}
                    </div>

                    {#if user.role !== 'admin' || selectedUserId}
                        <div class="p-4 bg-white border-t border-neutral-100 flex gap-2">
                            <input 
                                type="text" 
                                bind:value={newMessage} 
                                onkeydown={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Type a message..."
                                class="flex-1 h-10 px-4 rounded-xl bg-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                            />
                            <button 
                                onclick={sendMessage}
                                class="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                disabled={!newMessage.trim()}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                            </button>
                        </div>
                    {/if}
                {/if}
            </div>
        {/if}

        <button 
            onclick={() => isOpen = !isOpen}
            class="w-14 h-14 rounded-2xl bg-black text-white shadow-xl shadow-black/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all relative group"
        >
            {#if isOpen}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            {:else}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
            {/if}
            {#if totalUnread > 0 && !isOpen}
                <div class="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-lg animate-bounce" transition:fade>{totalUnread > 99 ? '99+' : totalUnread}</div>
            {:else if status === 'connected'}
                <div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            {/if}
        </button>
    </div>
{/if}
