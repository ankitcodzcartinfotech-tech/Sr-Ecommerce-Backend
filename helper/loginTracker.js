const requestIp = require('request-ip');
const UAParser = require('ua-parser-js');
const axios = require('axios');

/**
 * Captures login information including IP, Browser, OS, Device, and Geo Location
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} Object containing login info
 */
exports.captureLoginInfo = async (req) => {
    try {
        // 1. Get IP address using request-ip which handles proxies
        let ip = requestIp.getClientIp(req);
        
        // Strip out IPv6 prefix for localhost if it exists
        if (ip === '::1' || ip === '::ffff:127.0.0.1') {
            ip = '127.0.0.1';
        }

        // 2. Parse User-Agent
        const userAgentStr = req.headers['user-agent'] || '';
        const parser = new UAParser(userAgentStr);
        const result = parser.getResult();

        const browser = result.browser.name ? `${result.browser.name} ${result.browser.version}` : 'Unknown Browser';
        const os = result.os.name ? `${result.os.name} ${result.os.version}` : 'Unknown OS';
        
        // Determine device type
        let device = 'Desktop';
        if (result.device.type) {
            device = result.device.type.charAt(0).toUpperCase() + result.device.type.slice(1); // mobile, tablet, etc.
        } else if (os.toLowerCase().includes('android') || os.toLowerCase().includes('ios')) {
            device = 'Mobile';
        }

        const loginInfo = {
            ip,
            browser,
            os,
            device,
            userAgent: userAgentStr,
            country: 'Unknown',
            state: 'Unknown',
            city: 'Unknown'
        };

        // 3. Get Geo Location from IP API (free tier, no key needed)
        // Set a short timeout (2000ms) so login is not delayed significantly if the API is down
        if (ip && ip !== '127.0.0.1') {
            try {
                const geoResponse = await axios.get(`http://ip-api.com/json/${ip}`, { timeout: 2000 });
                if (geoResponse.data && geoResponse.data.status === 'success') {
                    loginInfo.country = geoResponse.data.country || 'Unknown';
                    loginInfo.state = geoResponse.data.regionName || 'Unknown';
                    loginInfo.city = geoResponse.data.city || 'Unknown';
                }
            } catch (geoError) {
                console.error('GeoIP fetch failed:', geoError.message);
                // Fail silently to let the login process continue
            }
        }

        return loginInfo;

    } catch (error) {
        console.error('Error capturing login info:', error);
        // Return default object if something fails
        return {
            ip: 'Unknown',
            browser: 'Unknown',
            os: 'Unknown',
            device: 'Unknown',
            userAgent: req.headers['user-agent'] || 'Unknown',
            country: 'Unknown',
            state: 'Unknown',
            city: 'Unknown'
        };
    }
};
