import { NextRequest } from 'next/server';

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:3001';

async function proxy(req: NextRequest, method: string, path: string[]) {
    const url = `${BACKEND}/attempts/${path.join('/')}`;

    const res = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: method === 'GET' ? undefined : await req.text(),
    });

    return new Response(await res.text(), {
        status: res.status,
        headers: {
            'Content-Type': res.headers.get('Content-Type') ?? 'application/json',
        },
    });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
    const { path } = await ctx.params;
    return proxy(req, 'GET', path);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
    const { path } = await ctx.params;
    return proxy(req, 'POST', path);
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
    const { path } = await ctx.params;
    return proxy(req, 'PATCH', path);
}
