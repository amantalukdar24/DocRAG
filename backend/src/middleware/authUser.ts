import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();
async function authUser(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const token: string | undefined = req.headers["authorization"];
    if (!token) return res.status(400).json({ success: false, mssg: "Unauthorized Access" });
    const decoded = await jwt.verify(token, process.env.JWT_Secret_Key as string) as JwtPayload;
    console.log(token,decoded);
    if (!decoded) return res.status(400).json({ success: false, mssg: "Unauthorized Access" });
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, mssg: "Something Went Wrong" });
  }
}

export { authUser };