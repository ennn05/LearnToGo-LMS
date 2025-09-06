import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    const authHeader = req?.headers?.authorization;
    console.log("Request Headers:", req.headers); // Debugging line
    console.log("Authorization Header:", authHeader); // Debugging line
    if (!authHeader || !authHeader?.startsWith("Bearer")) {
        return res.status(401).json({ status: "auth_failed", message: "Authentication failed!" });
    }

    const token = authHeader?.split(" ")[1];
    try {
        
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET,);
        console.log("Decoded Token:", decodedToken); // Debugging line
        if (!decodedToken) {
            return res.status(401).json({ message: "Invalid token" });
        }
        req.user = decodedToken;
        console.log("Authenticated User:", req.user); // Debugging line
        next();

    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }

};

export const authorize = (...roles) => {
  return (req, res, next) => {
    console.log("Authorized roles:", roles); // Debugging line
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient rights" });
    }
    next();
  };
};

export default authenticate;

