const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    try {
        // Check if Authorization header exists
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'No authorization header provided' });
        }

        // Extract token from Bearer scheme
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verify token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ message: 'Token expired' });
                }
                return res.status(403).json({ message: 'Invalid token' });
            }

            // Validate decoded token structure
            if (!decoded.id) {
                return res.status(403).json({ message: 'Invalid token payload' });
            }

            // Attach user info to request
            req.user = {
                id: decoded.id,
                email: decoded.email
            };
            next();
        });
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({ message: 'Internal server error during authentication' });
    }
};

module.exports = {
    authenticateJWT
};