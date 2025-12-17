"use client";

import Link from "next/link";
import { getToken, clearToken } from "../lib/storage";

export default function Navbar() {
    const loggedIn = typeof window !== "undefined" && getToken();

    return (
        <nav className= "p-4 bg-slate-900 flex justify-between" >
        <div className="flex gap-4" >
            <Link href="/" > Home </Link>
                < Link href = "/practice" > Practice </Link>
    { loggedIn && <Link href="/admin" > Admin </Link> }
    </div>

        <div>
    {
        !loggedIn ? (
            <Link href= "/auth/login" > Login </Link>
        ) : (
            <button onClick= {() => { clearToken(); location.reload(); }
    }>
        Logout
        </button>
        )
}
</div>
    </nav>
  );
}
