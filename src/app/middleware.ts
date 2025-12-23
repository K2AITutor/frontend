"use client";

import Link from "next/link";
import { getToken, clearToken } from "../lib/storage";

export default function Navbar() {
    const loggedIn = typeof window !== "undefined" && getToken();

    return (

        )
