import Image from "next/image"

export default function Page() {
  return (
        <div className="flex flex-1 items-center justify-center">
          <Image src="/convex.svg" width={200} height={200} alt="convex-logo"/>
        </div>
  )
}
