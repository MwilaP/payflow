import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Link } from "react-router-dom"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Modern Payroll Made Simple
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Automate your payroll process with our intuitive platform that saves time and reduces errors.
          </p>
          <div className="mt-10">
            <Button size="lg" asChild>
              <Link to="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3">Automated Calculations</h3>
              <p className="text-muted-foreground">
                Accurate tax and deduction calculations without manual work.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3">Employee Self-Service</h3>
              <p className="text-muted-foreground">
                Empower employees to view payslips and update details.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-3">Compliance Ready</h3>
              <p className="text-muted-foreground">
                Stay up-to-date with the latest tax laws and regulations.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
