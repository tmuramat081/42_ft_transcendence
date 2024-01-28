import {NextResponse} from 'next/server';
import {getServerSession} from "next-auth/next;
import {options} from "../options"

export default async function GET() {
    const session = await getServerSession({options});

    console.log("in GET: ", session?.user)

    return NextResponse.json({message: "ok"})
}
