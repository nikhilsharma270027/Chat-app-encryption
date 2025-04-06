import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET;

const fetchUser = (req, res, next) => {
  const token = req.header("auth-token");

  if (!token) {
    return res.status(401).send({ error: "Please authenticate using a valid token" });
  }

  try {
    const data = jwt.verify(token, jwtSecret);
    req.user = data.userId;
    next();
  } catch (error) {
    return res.status(401).send({ error: "Please authenticate using a valid token" });
  }
};

export default fetchUser;
