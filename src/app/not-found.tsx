import Link from "next/link";
import "./(public)/globals.css";
import Button from "@/components/public/Button";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-bg-primary px-4 text-center">
            <div className="space-y-6">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute -top-[20%] -left-[10%] h-[50vh] w-[50vw] rounded-full bg-accent-teal/5 blur-[120px] animate-float" />
                    <div className="absolute top-[40%] -right-[10%] h-[40vh] w-[40vw] rounded-full bg-accent-coral/5 blur-[100px] animate-float" style={{ animationDelay: "2s" }} />
                    <div className="absolute -bottom-[10%] left-[20%] h-[30vh] w-[30vw] rounded-full bg-accent-gold/5 blur-[80px] animate-float" style={{ animationDelay: "4s" }} />
                </div>

                <div className="relative z-10 flex flex-col items-center">
                    <h1 className="select-none font-serif text-[12rem] font-bold leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-accent-teal via-accent-coral to-accent-gold blur-[1px] opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hover:opacity-30 transition-opacity duration-500">
                        404
                    </h1>

                    <div className="relative">
                        <h2 className="font-serif text-6xl font-medium text-text-primary md:text-8xl mb-4">
                            404
                        </h2>
                        <div className="absolute -inset-1 bg-gradient-to-r from-accent-teal via-accent-gold to-accent-coral blur-xl opacity-20"></div>
                    </div>

                    <p className="mt-4 max-w-lg text-lg text-text-secondary md:text-xl">
                        Oops! The page you're looking for seems to have wandered off into the digital void.
                    </p>

                    <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                        <Button size="lg" className="rounded-full px-8" asChild>
                            <Link href="/">
                                Return Home
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
