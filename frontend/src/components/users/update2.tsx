import {getServerSession} from "next-auth/react"
import {options} from "../options"

export default async function Form() {
    const session = await getServerSession(options)
    const user = session?.user
}