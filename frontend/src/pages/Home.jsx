import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Truck,
  ShieldCheck,
  Calendar,
  ArrowRight,
  ArrowDown,
  Leaf,
  Clock,
  Quote,
  Droplet,
  Home as HomeIcon,
} from "lucide-react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";
import { PotIcon } from "../components/Logo";

const trustPoints = [
  {
    title: "100% Pure & Natural",
    text: "No preservatives, no adulteration — just real, honest milk.",
    icon: Leaf,
    color: "bg-pasture-50 text-pasture-700",
  },
  {
    title: "Hygienically Packed",
    text: "Sealed and chilled at every step to lock in freshness.",
    icon: ShieldCheck,
    color: "bg-milk-50 text-milk-700",
  },
  {
    title: "Delivered Before Sunrise",
    text: "Fresh dairy at your door before your morning begins.",
    icon: Clock,
    color: "bg-butter-300/30 text-ink-700",
  },
  {
    title: "Reliable Every Single Day",
    text: "Subscribe once, enjoy worry-free delivery on repeat.",
    icon: Truck,
    color: "bg-pasture-50 text-pasture-700",
  },
];

const plans = [
  {
    name: "Daily",
    tagline: "Fresh delivery every single morning",
    icon: Truck,
    color: "bg-pasture-50 text-pasture-700",
  },
  {
    name: "Weekly",
    tagline: "Bulk delivery once a week, your way",
    icon: Calendar,
    color: "bg-milk-50 text-milk-700",
  },
  {
    name: "Monthly",
    tagline: "Set it once, sip fresh milk all month",
    icon: ShieldCheck,
    color: "bg-butter-300/30 text-ink-700",
  },
];

const testimonials = [
  {
    id: "t1",
    quote: "The milk tastes the way it did at my grandmother's house. My kids notice the difference every morning.",
    name: "A Vaishnavi Milk Dairy subscriber",
  },
  {
    id: "t2",
    quote: "Never missed a single delivery in months. The paneer and ghee are restaurant quality.",
    name: "A Vaishnavi Milk Dairy subscriber",
  },
];

const heroIconClass =
  "flex h-12 w-12 items-center justify-center rounded-full border transition-all hover:-translate-y-0.5 border-pasture-300 text-pasture-700 hover:bg-pasture-50 dark:border-gold-400/40 dark:text-gold-300 dark:hover:bg-noir-800";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const { data } = await api.get("/products");
        setProducts(data.products?.slice(0, 4) || []);
      } catch (error) {
        console.error("Failed to load featured products", error);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  return (
    <div>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden bg-cream-50 dark:bg-noir-950">
        {/* decorative top hairline, like a stage frame */}
        <div className="relative mx-auto flex items-center justify-center px-6 pt-6">
          <span className="h-px flex-1 bg-pasture-200 dark:bg-noir-700" />
          <span className="mx-6 h-1.5 w-1.5 rounded-full bg-pasture-300 dark:bg-gold-500/60" />
          <span className="h-px flex-1 bg-pasture-200 dark:bg-noir-700" />
        </div>

        <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 pb-16 pt-12 text-center sm:px-6 sm:pb-20 sm:pt-16">
          {/* Outer thin ring */}
          <div className="pointer-events-none absolute left-1/2 top-[-8%] -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full border border-pasture-200/70 dark:border-gold-400/15 sm:h-[560px] sm:w-[560px]" />
          {/* Filled dome */}
          <div className="pointer-events-none absolute left-1/2 top-[-12%] -z-10 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-gradient-to-b from-pasture-100 via-cream-100 to-cream-50 dark:from-noir-800 dark:via-noir-900 dark:to-noir-950 sm:h-[480px] sm:w-[480px]" />

          <span className="animate-floatUp text-xs font-semibold uppercase tracking-[0.3em] text-pasture-600 dark:text-gold-400">
            Est. Since Generations
          </span>

          <div className="animate-floatUp mt-6 flex h-16 w-16 items-center justify-center rounded-full border border-pasture-300 text-pasture-700 dark:border-gold-400/60 dark:text-gold-300">
            <PotIcon size={26} />
          </div>

          <h1 className="animate-floatUp mt-6 font-display italic text-5xl font-medium leading-none text-ink dark:text-cream-50 sm:text-6xl">
            Vaishnavi
          </h1>
          <span className="animate-floatUp mt-2 text-xs font-semibold uppercase tracking-[0.45em] text-pasture-600 dark:text-gold-400">
            Milk
          </span>
          <h2 className="animate-floatUp mt-1 font-display text-6xl leading-none text-ink dark:text-cream-50 sm:text-7xl">
            Dairy
          </h2>

          <div className="animate-floatUp mt-7 flex w-full max-w-xs items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-pasture-400 dark:to-gold-400/70" />
            <span className="h-1.5 w-1.5 rounded-full bg-pasture-500 dark:bg-gold-400" />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-pasture-400 dark:to-gold-400/70" />
          </div>

          <p className="animate-floatUp mt-4 text-sm font-medium tracking-[0.15em] text-ink-700/70 dark:text-cream-100/70">
            Pure &bull; Fresh &bull; Trusted
          </p>

          <p className="animate-floatUp mt-5 max-w-md text-sm text-ink-700/70 dark:text-cream-100/60">
            Milk, curd, paneer, ghee and butter — sourced daily and delivered chilled before sunrise,
            straight to your doorstep.
          </p>

          <div className="animate-floatUp mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link to="/products" className="btn-primary">
              Shop Products <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/products" className="btn-secondary">
              Start a Subscription
            </Link>
          </div>

          <div className="animate-floatUp mt-10 flex items-center gap-4">
            <Link to="/products" className={heroIconClass} aria-label="Pure dairy products">
              <Droplet className="h-5 w-5" />
            </Link>
            <a
              href="#why-vaishnavi"
              className="flex h-12 w-12 animate-bounceSlow items-center justify-center rounded-full border border-pasture-600 bg-pasture-600 text-white transition-colors hover:bg-pasture-700 dark:border-noir-600 dark:bg-noir-800 dark:text-gold-300 dark:hover:bg-noir-700"
              aria-label="Scroll to explore"
            >
              <ArrowDown className="h-5 w-5" />
            </a>
            <a href="#how-it-works" className={heroIconClass} aria-label="Delivered to your doorstep">
              <HomeIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* ---------- Why choose us / trust strip ---------- */}
      <section id="why-vaishnavi" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl">Why families choose Vaishnavi Milk Dairy</h2>
          <p className="mt-2 text-sm text-ink-700/70 dark:text-cream-100/60">The same trust your family has always looked for in dairy.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trustPoints.map((point) => (
            <div key={point.title} className="card p-5 text-center">
              <div className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full ${point.color}`}>
                <point.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-semibold">{point.title}</h3>
              <p className="mt-1.5 text-sm text-ink-700/70 dark:text-cream-100/60">{point.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Featured products ---------- */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold sm:text-3xl">Today's picks</h2>
            <p className="mt-1 text-sm text-ink-700/70 dark:text-cream-100/60">Our most-loved everyday essentials.</p>
          </div>
          <Link to="/products" className="hidden text-sm font-semibold text-pasture-600 hover:underline sm:inline-flex items-center gap-1 dark:text-gold-300">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <Loader label="Fetching fresh picks" />
        ) : products.length === 0 ? (
          <p className="text-sm text-ink-700/60 dark:text-cream-100/50">Products will appear here once the backend is connected and seeded.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* ---------- Subscription plans ---------- */}
      <section className="bg-pasture-900 py-16 dark:bg-noir-900 dark:border-t dark:border-noir-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-semibold text-white sm:text-3xl dark:text-cream-50">Pick a delivery rhythm</h2>
          <p className="mx-auto mt-2 max-w-md text-center text-sm text-cream-100/70 dark:text-cream-100/60">
            Subscriptions auto-renew so your fridge never runs dry. Pause or change anytime from your orders page.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.name} className="rounded-xl2 bg-cream-100 p-6 text-center shadow-soft dark:bg-noir-800 dark:shadow-none">
                <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${plan.color}`}>
                  <plan.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-ink-700/70 dark:text-cream-100/60">{plan.tagline}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Testimonials ---------- */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-semibold sm:text-3xl">Loved by our daily customers</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {testimonials.map((t) => (
            <div key={t.id} className="card p-6">
              <Quote className="h-6 w-6 text-pasture-300 dark:text-gold-400/70" />
              <p className="mt-3 text-sm text-ink-700/80 dark:text-cream-100/70">{t.quote}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-700/50 dark:text-cream-100/40">{t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-semibold sm:text-3xl">How Vaishnavi Milk Dairy works</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {[
            { step: "Choose products", text: "Pick your daily essentials or a subscription plan." },
            { step: "Drop your address", text: "Save your address — we auto-pin it on Google Maps." },
            { step: "Track delivery", text: "Follow your order from Pending to Delivered." },
          ].map((item, idx) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-milk-100 font-display font-semibold text-milk-700">
                {idx + 1}
              </div>
              <h3 className="font-semibold">{item.step}</h3>
              <p className="mt-1 text-sm text-ink-700/70 dark:text-cream-100/60">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
