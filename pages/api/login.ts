import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import Picket, { AuthenticatedUser } from "@picketapi/picket-node";

import { cookieName, getSupabaseAdminClient } from "../../utils/supabase";

// create picket node client with your picket secret api key
const picket = new Picket(process.env.PICKET_PROJECT_SECRET_KEY!);

const expToExpiresIn = (exp: number) => exp - Math.floor(Date.now() / 1000);

const getOrCreateUser = async (payload: AuthenticatedUser) => {
  const supabase = getSupabaseAdminClient();

  // first we get the user by wallet address from user_wallet table
  let { data: userWallet } = await supabase
    .from("user_wallet")
    .select("user_id")
    .eq("wallet_address", payload.walletAddress)
    .eq("chain", payload.chain)
    .maybeSingle();

  const userID = userWallet?.user_id;
  if (!userID) {
    let { data, error } = await supabase.auth.admin.createUser({
      // @ts-ignore
      email: payload.email,
      app_metadata: {
        provider: "picket",
        providers: ["picket"],
        // store authorization info in app_metadata
        // because it cannot be modified by users
        walletAddress: payload.walletAddress,
        chain: payload.chain,
      },
      user_metadata: {
        ...payload,
      },
    });
    return data?.user;
  }

  let { data, error } = await supabase.auth.admin.getUserById(userID);
  return data?.user;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { accessToken } = req.body;
  // omit expiration time,.it will conflict with jwt.sign
  const { exp, ...payload } = await picket.validate(accessToken);
  const expiresIn = expToExpiresIn(exp);
  const user = await getOrCreateUser(payload);

  const supabaseJWT = jwt.sign(
    {
      ...user,
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
      maxAge: expiresIn,
    })
  );
  res.status(200).json({});
}
