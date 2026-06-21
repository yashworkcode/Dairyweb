import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="border-t border-cream-200 bg-pasture-900 text-cream-100 transition-colors duration-300 dark:border-noir-800 dark:bg-noir-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <Logo light withTagline />
          <p className="mt-4 max-w-xs text-sm text-cream-100/70">
            Vaishnavi Milk Dairy is committed to delivering fresh, pure, and nutritious dairy products directly to your home, ensuring quality and freshness in every drop and every bite.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-cream-100/60 dark:text-gold-300/70">Quick links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-butter-300 dark:hover:text-gold-300">Home</Link></li>
            <li><Link to="/products" className="hover:text-butter-300 dark:hover:text-gold-300">Products</Link></li>
            <li><Link to="/cart" className="hover:text-butter-300 dark:hover:text-gold-300">Cart</Link></li>
            <li><Link to="/orders" className="hover:text-butter-300 dark:hover:text-gold-300">Track Order</Link></li>
          </ul>
        </div>

       <div>
  <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-cream-100/60 dark:text-gold-300/70">
    Contact
  </h4>

  <ul className="space-y-2 text-sm text-cream-100/80">
    <li>
      <a
        href="tel:+91 9506236287"
        className="flex items-center gap-2 hover:text-butter-300"
      >
        <Phone className="h-4 w-4" />
        +91 9506236287
      </a>
    </li>

    <li>
      <a
        href="mailto:rishabhunleast9569@gmail.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 hover:text-butter-300"
      >
        <Mail className="h-4 w-4" />
        rishabhunleast9569@gmail.com
      </a>
    </li>

    <li>
      <a
        href="https://share.google/0zDGmdAmQp97Sdyvf"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 hover:text-butter-300"
      >
        <MapPin className="h-4 w-4" />
        View Location
      </a>
    </li>
  </ul>
</div>
      </div>
      <div className="border-t border-cream-100/10 py-4 text-center text-xs text-cream-100/50 dark:border-noir-800">
        © {new Date().getFullYear()} Vaishnavi Milk Dairy. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
