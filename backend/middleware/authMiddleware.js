import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    const authHeader = req?.headers?.authorization;
    if (!authHeader || !authHeader?.startsWith("Bearer")) {
        return res.status(401).json({ status: "auth_failed", message: "Authentication failed!" });
    }

    const token = authHeader?.split(" ")[1];
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET,);
        if (!decodedToken) {
            return res.status(401).json({ message: "Invalid token" });
        }
        req.user = decodedToken;
        next();

    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }

};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    next();
  };
};

export default authenticate;

