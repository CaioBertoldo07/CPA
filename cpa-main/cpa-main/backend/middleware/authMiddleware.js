require('dotenv').config(); // Carregar variáveis do .env
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401); // Token ausente
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
            }
            return res.sendStatus(403); // Outro erro, como token inválido
        }
        req.user = user;
        next();
    });
}

function authorize(requiredPermissions) {
    return (req, res, next) => {
        const isAdmin = req.user.isAdmin || false;

        if (isAdmin) {
            return next();
        }

        const userPermissions = req.user.permissions || [];
        const hasPermission = requiredPermissions.every(permission =>
            userPermissions.includes(permission)
        );

        if (!hasPermission) {
            return res.sendStatus(403);
        }

        next();
    };
}

module.exports = {
    authenticateToken,
    authorize
};
