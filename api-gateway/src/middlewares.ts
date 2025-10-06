import axios from "axios";
import { Request, Response, NextFunction } from "express";
import { AUTH_URL } from "./url";

const auth = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers["authorization"]) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = req.headers["authorization"]?.split(" ")[1];

    const { data } = await axios.post(
      `${AUTH_URL}/auth/verify-token`,
      { token },
      {
        headers: {
          ip: req.ip,
          "user-agent": req.headers["user-agent"] || "",
        },
      }
    );

    req.headers["x-user-id"] = data.user.id;
    req.headers["x-user-role"] = data.user.role;
    req.headers["x-user-email"] = data.user.email;
    req.headers["x-user-name"] = data.user.name;

    next();
  } catch (error) {
    console.log("Log from auth middleware:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default { auth };
