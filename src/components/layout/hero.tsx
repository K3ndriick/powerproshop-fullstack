import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Transform Your Fitness Journey
          </h1>
          <p className="text-lg md:text-xl text-background/80 mb-8">
            Premium gym equipment and expert repair services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/products"
              className="bg-background text-foreground px-8 py-4 rounded-md font-semibold hover:bg-background/90 transition text-center"
            >
              Shop Equipment
            </Link>
            <Link
              href="/repairs"
              className="bg-transparent border-2 border-background text-background px-8 py-4 rounded-md font-semibold hover:bg-background hover:text-foreground transition text-center"
            >
              Book Repair Service
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}