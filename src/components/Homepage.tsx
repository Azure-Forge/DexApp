
import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";


export function HomePage(){
  return (
  <div className="flex flex-col grow items-center text-center mx-auto p-2">
      <main className="flex-1 flex flex-col justify-center items-center">
        <img src="#########" alt="" className="flex items-center"width={"240"}/>
        <h1 className="text-4xl font-bold mb-4">Welcome to DexApp</h1>
        <p className="mb-8">Online platform for managing electronic documents and notarial workflows.</p>

        <div className="flex gap-4">
          <Button variant={"default"} className="py-5">
            <Link to="/login">Get Started</Link>
          </Button>
          <Button variant={"outline"} className="py-5" >
            <Link to="/">Learn More</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}