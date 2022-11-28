import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import Picket from "@picketapi/picket-node";

import { cookieName } from "../../utils/supabase";

// create picket node client with your picket secret api key
const picket = new Picket(process.env.PICKET_PROJECT_SECRET_KEY!);

const expToExpiresIn = (exp: number) => exp - Math.floor(Date.now() / 1000);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { accessToken } = req.body;
  // omit expiration time,.it will conflict with jwt.sign
  const { exp, ...payload } = await picket.validate(accessToken);
  const expiresIn = expToExpiresIn(exp);

  const supabaseJWT = jwt.sign(
    {
      ...payload,
    },
    process.env.SUPABASE_JWT_SECRET!,
    {
      expiresIn,
    }
  );

  // Set a new cookie with the name
  res.setHeader(
    "Set-Cookie",
    cookie.serialize(cookieName, supabaseJWT, {
      path: "/",
      secure: process.env.NODE_ENV !== "development",
      // allow the cookie to be accessed client-side
      httpOnly: false,
      sameSite: "strict",
      maxAge: expiresIn, // 1 day
    })
  );
  res.status(200).json({});
}
