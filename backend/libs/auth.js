import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";

export const hashPassword = async (userPassword) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(userPassword, salt);
};

export const checkPassword = async (userPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(userPassword, hashedPassword);
  } catch (error) {
    console.error("Error comparing password:", error);
  }
};

export const generateJWT = (payload) => {
  return JWT.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
};