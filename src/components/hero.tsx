import { cn } from "@/lib/utils";

interface Feature {
  title: string;
  description: string;
  image: string;
}

interface HeroSectionProps {
  title: string;
  feature1: Feature;
  feature2: Feature;
  feature3: Feature;
  feature4: Feature;
  className?: string;
}

const HeroSection = ({
  title = "Blocks built with Shadcn & Tailwind",
  feature1 = {
    title: "UI/UX Design",
    description:
      "Creating intuitive user experiences with modern interface design principles and user-centered methodologies.",
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
  },
  feature2 = {
    title: "Responsive Development",
    description:
      "Building websites that look and function perfectly across all devices and screen sizes.",
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-2.svg",
  },
  feature3 = {
    title: "Brand Integration",
    description:
      "Seamlessly incorporating your brand identity into every aspect of your website's design.",
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-3.svg",
  },
  feature4 = {
    title: "Performance Optimization",
    description:
      "Ensuring fast loading times and smooth performance through optimized code and assets.",
    image:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-4.svg",
  },
  className,
}: HeroSectionProps) => {
  return (
    <section className={cn("py-16 md:py-24 lg:py-32", className)}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Header */}
        <div className="mb-16 md:mb-20 flex flex-col items-center gap-6 text-center">
          <h1 className="text-2xl font-semibold">{title}</h1>
        </div>

        {/* Features Grid */}
        <div className="relative flex justify-center">
          <div className="relative flex w-full flex-col border border-border/50 rounded-lg overflow-hidden bg-card/30 backdrop-blur-sm md:w-full lg:w-full max-w-7xl">
            {/* Top Row */}
            <div className="relative flex flex-col lg:flex-row">
              <div className="flex flex-col justify-between border-b border-border/50 p-8 md:p-10 lg:w-3/5 lg:border-r lg:border-b-0 group hover:bg-accent/5 transition-colors">
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold mb-3">
                    {feature1.title}
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {feature1.description}
                  </p>
                </div>
                <img
                  src={feature1.image}
                  alt={feature1.title}
                  className="mt-8 aspect-[1.5] h-full w-full object-cover rounded-md lg:aspect-[2.4] opacity-90"
                />
              </div>
              <div className="flex flex-col justify-between p-8 md:p-10 lg:w-2/5 group hover:bg-accent/5 transition-colors">
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold mb-3">
                    {feature2.title}
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {feature2.description}
                  </p>
                </div>
                <img
                  src={feature2.image}
                  alt={feature2.title}
                  className="mt-8 aspect-[1.45] h-full w-full object-cover rounded-md opacity-90"
                />
              </div>
            </div>

            {/* Bottom Row */}
            <div className="relative flex flex-col border-t border-border/50 lg:flex-row">
              <div className="flex flex-col justify-between border-b border-border/50 p-8 md:p-10 lg:w-2/5 lg:border-r lg:border-b-0 group hover:bg-accent/5 transition-colors">
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold mb-3">
                    {feature3.title}
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {feature3.description}
                  </p>
                </div>
                <img
                  src={feature3.image}
                  alt={feature3.title}
                  className="mt-8 aspect-[1.45] h-full w-full object-cover rounded-md opacity-90"
                />
              </div>
              <div className="flex flex-col justify-between p-8 md:p-10 lg:w-3/5 group hover:bg-accent/5 transition-colors">
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold mb-3">
                    {feature4.title}
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {feature4.description}
                  </p>
                </div>
                <img
                  src={feature4.image}
                  alt={feature4.title}
                  className="mt-8 aspect-[1.5] h-full w-full object-cover rounded-md lg:aspect-[2.4] opacity-90"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { HeroSection };
