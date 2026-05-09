function getCSRF() {
    return document.cookie
        .split("; ")
        .find(row => row.startsWith("csrf_token="))
        ?.split("=")[1];
}

async function request(url, data) {
    const csrf = getCSRF();

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrf
        },
        body: JSON.stringify(data)
    });

    const json = await res.json();

    // handle HTTP error
    if (!res.ok) {
        return {
            IsError: true,
            Message: json.error || "Request failed",
            ErrorCode: res.status
        };
    }

    return json;
}

export function login(data) {
    return request("/login", data);
}

export function register(data) {
    return request("/register", data);
}