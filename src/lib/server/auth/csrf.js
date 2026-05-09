export function validateCSRF(request, cookies) {
    const csrfHeader = request.headers.get("x-csrf-token");
    const csrfCookie = cookies.get("csrf_token");

    if (!csrfHeader || csrfHeader !== csrfCookie) {
        throw new Error("CSRF_INVALID");
    }
}