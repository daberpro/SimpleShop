import midtransClient from 'midtrans-client';
import { MIDTRANS_SERVER_KEY, MIDTRANS_CLIENT_KEY, MIDTRANS_IS_PRODUCTION } from '$env/static/private';

export const snap = new midtransClient.Snap({
    isProduction: MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: MIDTRANS_SERVER_KEY,
    clientKey: MIDTRANS_CLIENT_KEY
});
