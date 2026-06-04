import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, PlusCircle, BookOpen, Users, Map as MapIcon, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { useAuthStore } from "@/store/authStore";

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();

  const features = [
    {
      title: "Explore Tours",
      description: "Discover amazing tours created by our community and start your next adventure.",
      icon: Compass,
      link: "/tourist/tours",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      show: true
    },
    {
      title: "Create Tours",
      description: "Share your knowledge and passion by creating and publishing your own unique tours.",
      icon: PlusCircle,
      link: "/tours/create",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      show: true
    },
    {
      title: "Community Blogs",
      description: "Read travel stories, tips, and experiences from fellow travelers around the world.",
      icon: BookOpen,
      link: "/blogs",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      show: true
    },
    {
      title: "Interactive Maps",
      description: "Visualize keypoints and routes with our interactive mapping system.",
      icon: MapIcon,
      link: "/map",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      show: true
    },
    {
      title: "Connect",
      description: "Follow your favorite authors and stay updated on their latest tour releases.",
      icon: Users,
      link: "/followers",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      show: isAuthenticated
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-12 py-12">
      {/* Hero Section */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>SOA Projekat 2026</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
          Discover the World <span className="text-primary">Together.</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
          The ultimate platform for creating, sharing, and exploring unique travel experiences through community-driven tours.
        </p>
        {!isAuthenticated && (
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button asChild size="lg">
              <Link to="/register">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        )}
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.filter(f => f.show).map((feature, i) => (
          <Card key={i} className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <div className={`h-12 w-12 rounded-lg ${feature.bgColor} ${feature.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="ghost" size="sm" className="px-0 text-primary hover:bg-transparent hover:underline group-hover:translate-x-1 transition-transform">
                <Link to={feature.link} className="flex items-center gap-1.5">
                  Explore now <Compass className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Footer Info */}
      <section className="pt-12 border-t text-center">
        <p className="text-sm text-muted-foreground">
          Built with React, Vite, and modern microservices architecture.
        </p>
      </section>
    </div>
  );
}
