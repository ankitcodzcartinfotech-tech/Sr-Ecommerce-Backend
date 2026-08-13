const axios = require('axios');

/**
 * Reusable SMS Service supporting multiple providers.
 * Driven by .env configurations.
 */
class SmsService {
    constructor() {
        this.provider = (process.env.SMS_PROVIDER || 'MOCK').toUpperCase();
        this.apiKey = process.env.SMS_API_KEY;
        this.senderId = process.env.SMS_SENDER_ID;
    }

    async sendSMS(mobileNumber, message) {
        try {
            switch (this.provider) {
                case 'MSG91':
                    return await this._sendMSG91(mobileNumber, message);
                case 'TWILIO':
                    return await this._sendTwilio(mobileNumber, message);
                case 'FAST2SMS':
                    return await this._sendFast2SMS(mobileNumber, message);
                case 'TEXTLOCAL':
                    return await this._sendTextLocal(mobileNumber, message);
                case 'MOCK':
                default:
                    return this._sendMock(mobileNumber, message);
            }
        } catch (error) {
            console.error(`[SmsService] Failed to send SMS via ${this.provider}:`, error.message);
            // We do not throw the error here so that the API doesn't crash,
            // but we can return false to indicate failure.
            return false;
        }
    }

    async _sendMSG91(mobileNumber, message) {
        // Implement MSG91 logic here
        console.log(`[MSG91] Sending SMS to ${mobileNumber}: ${message}`);
        // Example Axios call (requires actual MSG91 URL and payload structure)
        // await axios.post('https://api.msg91.com/api/v5/flow/', { ... });
        return true;
    }

    async _sendTwilio(mobileNumber, message) {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.SMS_API_KEY;
        const from = process.env.SMS_SENDER_ID; // Your Twilio number e.g. +918849883692

        if (!accountSid || !authToken || !from) {
            console.error('[TWILIO] Missing Twilio credentials in .env');
            return false;
        }

        // Ensure the number has the +91 country code prefix
        let toNumber = mobileNumber.toString().trim();
        if (toNumber.length === 10 && !toNumber.startsWith('+')) {
            toNumber = `+91${toNumber}`;
        }

        const twilioClient = require('twilio')(accountSid, authToken);

        const result = await twilioClient.messages.create({
            body: message,
            from,
            to: toNumber,
        });

        console.log(`\n=========================================`);
        console.log(`📱 SMS Sent`);
        console.log(`Phone: ${toNumber}`);
        console.log(`Type: TWILIO`);
        console.log(`Status: ${result.status}`);
        console.log(`SID: ${result.sid}`);
        console.log(`=========================================\n`);

        return result.sid;
    }

    async _sendFast2SMS(mobileNumber, message) {
        const apiKey = process.env.SMS_API_KEY;

        if (!apiKey) {
            console.error('[FAST2SMS] Missing SMS_API_KEY in .env');
            return false;
        }

        // Ensure only 10 digits (no country code for Fast2SMS)
        let toNumber = mobileNumber.toString().trim().replace(/^\+91/, '');

        const response = await axios.post(
            'https://www.fast2sms.com/dev/bulkV2',
            {
                route: 'q',          // Quick Transactional route
                message: message,
                language: 'english',
                flash: 0,
                numbers: toNumber,
            },
            {
                headers: {
                    authorization: apiKey,
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log(`\n=========================================`);
        console.log(`📱 SMS Sent`);
        console.log(`Phone: +91${toNumber}`);
        console.log(`Type: FAST2SMS`);
        console.log(`Status: ${response.data?.return ? 'SUCCESS' : 'FAILED'}`);
        console.log(`Response: ${JSON.stringify(response.data)}`);
        console.log(`=========================================\n`);

        return response.data?.return === true;
    }

    async _sendTextLocal(mobileNumber, message) {
        console.log(`[TEXTLOCAL] Sending SMS to ${mobileNumber}: ${message}`);
        return true;
    }

    _sendMock(mobileNumber, message) {
        console.log(`\n=========================================`);
        console.log(`📱 SMS Sent`);
        console.log(`Phone: ${mobileNumber}`);
        console.log(`Type: MOCK`);
        console.log(`Status: SUCCESS`);
        console.log(`Message: \n${message}`);
        console.log(`=========================================\n`);
        return true;
    }

    _formatDate() {
        return new Date().toLocaleString('en-US', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true
        });
    }

    _getPhone(user) {
        return user?.mobileNumber || user?.phone || '';
    }

    async sendLoginSMS(user, device = 'Web') {
        const phone = this._getPhone(user);
        if (!phone) return false;

        const message = `Hello ${user.name || 'User'},\nYou have successfully logged in to Sr Software .\nTime: ${this._formatDate()}\nDevice: ${device}`;
        return await this.sendSMS(phone, message);
    }

    async sendLogoutSMS(user) {
        const phone = this._getPhone(user);
        if (!phone) return false;

        const message = `Hello ${user.name || 'User'},\nYou have successfully logged out from Sr Software .\nIf this wasn't you, contact support immediately.`;
        return await this.sendSMS(phone, message);
    }

    async sendOrderStatusSMS(order, user, status) {
        // Fallback to shipping phone if user phone is missing
        const phone = this._getPhone(user) || order?.shippingAddress?.phone;
        if (!phone) return false;

        const customerName = user?.name || order?.shippingAddress?.fullName || 'Customer';
        const orderNo = order.orderNumber || order._id.toString().slice(-8).toUpperCase();

        // Next-step / thank-you message per status
        const nextStepMap = {
            'Placed': 'We will confirm your order shortly. Stay tuned!',
            'Confirmed': 'Your order is now being prepared for processing.',
            'Processing': 'We are carefully packing your items. Shipping update coming soon!',
            'Shipped': 'Your order is on its way! Track it from the Sr Software  app.',
            'Delivered': 'Thank you for shopping with Sr Software ! We hope you love it.',
            'Cancelled': 'If you have any questions, please contact our support team.',
        };

        if (!nextStepMap[status]) return false;

        const message = [
            `Sr Software `,
            ``,
            `Hi ${customerName},`,
            ``,
            `Your order #${orderNo} has been ${status}.`,
            ``,
            `Status: ${status}`,
            ``,
            `${nextStepMap[status]}`,
        ].join('\n');

        return await this.sendSMS(phone, message);
    }
}

module.exports = new SmsService();
