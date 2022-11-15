// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";

import { cookieName } from "../../utils/supabase";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  // Clear the supabase cookie
  res.setHeader(
    "Set-Cookie",
    cookie.serialize(cookieName, "", {
      path: "/",
      maxAge: -1,
    })
  );

  res.status(200).json({});
}
